<div align="center">
  <img src="public/next-level-logo.png" alt="Next Level" width="120" />

  # NEXT LEVEL — Catálogo Premium

  Catálogo digital de moda urbana premium. Los productos viven en un Google Sheet,
  se sirven mediante Google Apps Script y las compras se coordinan por WhatsApp.
  **No es un ecommerce**: no hay carrito ni pagos en línea.
</div>

## Stack

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Motion
- **Backend**: Google Apps Script (web app) sobre Google Sheets — código versionado en [`appscript/`](appscript/)
- **Checkout**: enlaces directos a WhatsApp con el detalle del producto

## Arquitectura de datos

```
Google Sheet (Productos) → Apps Script /exec (JSON) → src/services/api.ts → UI
```

El frontend es resiliente por diseño:

- Timeout de 15 s + 1 reintento por petición.
- Cache en `localStorage` como respaldo: si la API falla, se muestra el último catálogo bueno.
- Auto-actualización silenciosa cada 5 minutos y al volver a la pestaña.
- La pantalla de error solo aparece si no hay NINGÚN dato que mostrar.
- `ErrorBoundary` global: nunca una página en blanco.

## Desarrollo local

Requisitos: Node.js 20+ y pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint       # tsc --noEmit
pnpm build      # build de producción en dist/
```

## Administrar el catálogo

Editar el Google Sheet (hoja `Productos`). Convenciones de columnas:

| Columna | Formato |
|---|---|
| `activo`, `disponible`, `nuevo`, `destacado` | `SI` / `NO` |
| `tallas`, `etiquetas` | texto separado por comas |
| `imagen1..imagen5` | ID de Google Drive o URL completa |
| `orden` | número — orden ascendente en el catálogo |

Los cambios en el Sheet se reflejan solos en el sitio (auto-refresh). Para cambios
en el código del API, ver la guía de despliegue en [`appscript/README.md`](appscript/README.md).
