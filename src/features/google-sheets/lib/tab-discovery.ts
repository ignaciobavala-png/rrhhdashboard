import type { SheetTab } from '../api/types';

// Strategy 1: Google Sheets v3 Feeds API — works for any publicly shared sheet
async function discoverTabsViaFeed(sheetId: string): Promise<SheetTab[] | null> {
  try {
    const res = await fetch(
      `https://spreadsheets.google.com/feeds/worksheets/${sheetId}/public/full?alt=json`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return null;

    const json = await res.json();
    const entries: unknown[] = json?.feed?.entry;
    if (!Array.isArray(entries) || entries.length === 0) return null;

    const tabs: SheetTab[] = [];

    for (const entry of entries as Record<string, unknown>[]) {
      const name = (entry?.title as Record<string, string>)?.$t;
      if (!name) continue;

      // Extract gid from the HTML link: .../edit#gid=123456
      const links = (entry.link ?? []) as Array<{ rel: string; type: string; href: string }>;
      const htmlLink = links.find((l) => l.type === 'text/html');
      const gidMatch = htmlLink?.href?.match(/[#&]gid=(\d+)/);
      const gid = gidMatch ? parseInt(gidMatch[1]) : tabs.length;

      tabs.push({ gid, name });
    }

    return tabs.length > 0 ? tabs : null;
  } catch {
    return null;
  }
}

// Strategy 2: HTML scraping of the published view — fallback
async function discoverTabsViaHtml(sheetId: string): Promise<SheetTab[] | null> {
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`);
    const html = await res.text();

    const tabs: SheetTab[] = [];
    let m: RegExpExecArray | null;

    const buttonPattern = /id="sheet-button-(\d+)"[^>]*>([\s\S]*?)<\/li/g;
    while ((m = buttonPattern.exec(html)) !== null) {
      const gid = parseInt(m[1]);
      const name = m[2].replace(/<[^>]+>/g, '').trim();
      if (!isNaN(gid) && name) tabs.push({ gid, name });
    }
    if (tabs.length > 0) return tabs;

    const jsonPattern = /"sheetId"\s*:\s*(\d+)\s*,\s*"title"\s*:\s*"([^"]+)"/g;
    while ((m = jsonPattern.exec(html)) !== null) {
      tabs.push({ gid: parseInt(m[1]), name: m[2] });
    }
    if (tabs.length > 0) return tabs;

    return null;
  } catch {
    return null;
  }
}

export async function discoverTabs(sheetId: string): Promise<SheetTab[]> {
  const feedTabs = await discoverTabsViaFeed(sheetId);
  if (feedTabs) return feedTabs;

  const htmlTabs = await discoverTabsViaHtml(sheetId);
  if (htmlTabs) return htmlTabs;

  return [{ gid: 0, name: 'Hoja 1' }];
}

export function buildCsvUrl(sheetId: string, gid: number): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}
