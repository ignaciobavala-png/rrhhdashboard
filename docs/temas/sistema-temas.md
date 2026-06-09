# Sistema de Temas

> **Referencia completa:** Ver `docs/themes.md`
> **Archivos clave:** `src/lib/theme-context.tsx`, `src/styles/themes/`, `src/components/themes/`

---

## Resumen

Sistema de temas basado en CSS custom properties con `[data-theme]` selectors. Provider custom en `theme-context.tsx` (reemplaza `next-themes`).

---

## Conceptos Clave

- **Theme Provider:** `ThemeProvider` desde `src/lib/theme-context.tsx` (API compatible con `next-themes`)
- **Hook:** `useTheme()` → `{ theme, resolvedTheme, setTheme }`
- **CSS Selectors:** `[data-theme='nombre-tema']` + `[data-theme='nombre-tema'].dark`
- **Formato colores:** OKLCH `oklch(lightness chroma hue)`
- **Tailwind v4:** `@theme inline` para mapear CSS vars a utility classes

---

## Añadir un Nuevo Tema

1. Crear `src/styles/themes/<nombre>.css`
2. Definir tokens en `[data-theme='<nombre>']` (light) y `.dark` (dark)
3. Agregar `@import` en `src/styles/theme.css`
4. Registrar en `THEMES` array (`src/components/themes/theme.config.ts`)

---

## Tema Default

- Nombre: `petralabs`
- Primario: Indigo `#4f46e5`
- Acento: Esmeralda `#10b981`
- Tipografía: Inter (sans), JetBrains Mono (mono)

---

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/lib/theme-context.tsx` | ThemeProvider custom |
| `src/styles/themes/*.css` | Archivos de tema individuales |
| `src/styles/theme.css` | Aggregator (imports) |
| `src/components/themes/theme.config.ts` | `THEMES` array + `DEFAULT_THEME` |
| `src/components/themes/theme-selector.tsx` | UI selector |
| `src/components/themes/theme-mode-toggle.tsx` | Light/Dark toggle |
| `src/components/themes/theme-color-updater.tsx` | Actualiza CSS vars |
| `src/components/themes/active-theme.tsx` | Aplica tema activo |
| `src/components/themes/font.config.ts` | Fuentes Google Fonts |

---

## Para Más Detalle

Ver [docs/themes.md](../themes.md) con:
- Estructura completa del archivo de tema
- OKLCH color reference
- Scaled variants
- Google Fonts en temas
- Troubleshooting