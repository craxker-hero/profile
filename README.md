# Portfolio — Arquitectura de Producción

```
portfolio/
├── index.html          ← HTML semántico + SEO estático
├── netlify.toml        ← Config de deploy (Netlify)
├── vercel.json         ← Config de deploy (Vercel)
├── README.md
│
├── data/
│   └── projects.json   ← 🔑 TU ÚNICO "PANEL DE CONTROL"
│
├── js/
│   ├── projects.js     ← Motor de renderizado (consume el JSON)
│   └── main.js         ← Orquestador (cursor, terminal, easter eggs)
│
└── assets/
    ├── img/
    │   ├── og-image.png      ← 1200×630px para link previews
    │   └── projects/         ← screenshots o GIFs de proyectos
    └── cv.pdf
```

---

## Workflow diario

```bash
# 1. Añadir un proyecto
vim data/projects.json   # editar el JSON

# 2. Commit y push
git add data/projects.json
git commit -m "feat: add proyecto X"
git push origin main

# 3. Vercel/Netlify detecta el push y despliega automáticamente
# — sin FTP, sin SSH, sin panel de administración
```

## Esquema estricto de projects.json

```jsonc
{
  "id":       "slug-unico",       // string, usado como id del elemento HTML
  "number":   "01",               // string, número visual de la tarjeta
  "title":    "Nombre Proyecto",
  "tagline":  "Una línea, el impacto central",
  "why":      "El problema real que resolviste y la decisión técnica clave",
  "emoji":    "⚡",               // fallback si no hay imagen
  "image":    "./assets/img/projects/proyecto.png", // o null
  "tags": [
    { "label": "React", "color": "green" }  // green | cyan | pink | yellow
  ],
  "snippet": {
    "lang": "JavaScript",
    "lines": [
      { "type": "comment", "text": "// tu código" },
      { "type": "kw",      "text": "const " },
      { "type": "fn",      "text": "miFuncion" },
      { "type": "plain",   "text": " = () => {};" }
    ]
  },
  "metrics": [
    { "value": "3x",  "label": "Velocidad" }
  ],
  "url":      "https://github.com/tunombre/proyecto",
  "featured": true   // false para ocultarlo sin borrarlo
}
```

**Tipos de token en snippet:**
`comment` · `kw` (keyword) · `fn` (función) · `str` (string) · `num` (número) · `plain`

---

## SEO: la limitación técnica que debes conocer

| Quién lee el HTML | Ejecuta JS | Ve tus proyectos dinámicos |
|---|---|---|
| Tu usuario en Chrome | ✅ Sí | ✅ Sí |
| Googlebot (moderno) | ✅ Sí | ✅ Sí |
| Bot de WhatsApp | ❌ No | ❌ No |
| Bot de Twitter/X | ❌ No | ❌ No |
| Bot de LinkedIn | ❌ No | ❌ No |
| Slack unfurl | ❌ No | ❌ No |

**Solución actual:** Los `<meta og:*>` en el `<head>` son estáticos.
El link preview de tu portafolio siempre se ve bien.
Los proyectos individuales no tienen su propio preview — eso está bien por ahora.

**Solución futura:** Migrar a **Astro**.
Astro genera un archivo `.html` físico por proyecto en build time.
Cada proyecto tiene sus propios meta tags. SEO perfecto sin servidor.
El CSS/JS retro se mantiene igual — Astro no te impone ningún estilo.

---

## Deploy en 3 minutos

### Opción A — Vercel (recomendado)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Opción B — Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=.
```

### Opción C — GitHub Pages (gratis, sin CLI)
1. Repositorio → Settings → Pages
2. Source: `main` branch, folder `/` (root)
3. Cada `git push` → deploy automático

---

## Próximos pasos (en orden)

- [ ] Reemplaza "Tu Nombre" en `index.html` y `data/projects.json`
- [ ] Crea `assets/img/og-image.png` (1200×630px) para los link previews
- [ ] Añade tu primer proyecto real en `data/projects.json`
- [ ] Conecta el repo a Vercel/Netlify
- [ ] Cuando tengas 3+ proyectos → evalúa migrar a Astro para SEO por proyecto
