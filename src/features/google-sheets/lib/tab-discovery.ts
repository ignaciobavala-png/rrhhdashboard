import type { SheetTab } from '../api/types';

export async function discoverTabs(sheetId: string): Promise<SheetTab[]> {
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();

    // Pattern 1: id="sheet-button-{GID}" elements in the tab bar
    const tabs: SheetTab[] = [];
    const buttonPattern = /id="sheet-button-(\d+)"[^>]*>([\s\S]*?)<\/li/g;
    let m: RegExpExecArray | null;

    while ((m = buttonPattern.exec(html)) !== null) {
      const gid = parseInt(m[1]);
      // Strip inner HTML tags to get tab name
      const name = m[2].replace(/<[^>]+>/g, '').trim();
      if (!isNaN(gid) && name) tabs.push({ gid, name });
    }

    if (tabs.length > 0) return tabs;

    // Pattern 2: embedded JSON "sheetId":N,"title":"Name"
    const jsonPattern = /"sheetId"\s*:\s*(\d+)\s*,\s*"title"\s*:\s*"([^"]+)"/g;
    while ((m = jsonPattern.exec(html)) !== null) {
      tabs.push({ gid: parseInt(m[1]), name: m[2] });
    }

    if (tabs.length > 0) return tabs;
  } catch {
    // fall through
  }

  return [{ gid: 0, name: 'Hoja 1' }];
}

export function buildCsvUrl(sheetId: string, gid: number): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}
