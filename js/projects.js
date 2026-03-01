/**
 * projects.js
 * Motor de renderizado. Consume data/projects.json y genera el DOM.
 * Regla: Si cambias el diseño de tarjetas, solo tocas este archivo.
 * Regla: Si agregas un proyecto, solo tocas projects.json.
 */

/* ============================================
   TAG COLOR → CSS CLASS MAP
============================================ */
const TAG_COLORS = {
  green:  'tag-green',
  cyan:   'tag-cyan',
  pink:   'tag-pink',
  yellow: 'tag-yellow',
};

/* ============================================
   SNIPPET RENDERER
   Convierte el array de líneas del JSON en HTML
   con syntax highlighting sin librerías externas.
============================================ */
function renderSnippet(snippet) {
  // Agrupamos tokens consecutivos por línea de texto
  // El JSON tiene líneas completas con un type cada una.
  const html = snippet.lines.map(line => {
    const text = escapeHtml(line.text);
    switch (line.type) {
      case 'comment': return `<span class="cm">${text}</span>`;
      case 'kw':      return `<span class="kw">${text}</span>`;
      case 'fn':      return `<span class="fn">${text}</span>`;
      case 'str':     return `<span class="str">${text}</span>`;
      case 'num':     return `<span class="num">${text}</span>`;
      default:        return `<span>${text}</span>`;
    }
  }).join('<br>');

  return `
    <div class="code-snippet" data-lang="${escapeHtml(snippet.lang)}">
      ${html}
    </div>
  `;
}

/* ============================================
   METRICS RENDERER
============================================ */
function renderMetrics(metrics) {
  return `
    <div class="metrics">
      ${metrics.map(m => `
        <div class="metric">
          <span class="metric-value">${escapeHtml(m.value)}</span>
          <span class="metric-label">${escapeHtml(m.label)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================
   TAGS RENDERER
============================================ */
function renderTags(tags) {
  return tags.map(t =>
    `<span class="project-tag ${TAG_COLORS[t.color] || 'tag-green'}">${escapeHtml(t.label)}</span>`
  ).join('');
}

/* ============================================
   VISUAL RENDERER
   Usa imagen si existe, emoji de fallback si no.
============================================ */
function renderVisual(project) {
  const inner = project.image
    ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} preview" loading="lazy">`
    : `<div class="mock" aria-hidden="true">${project.emoji}</div>`;

  return `
    <div class="project-visual">
      ${inner}
      <div class="project-overlay">
        ${renderTags(project.tags)}
      </div>
    </div>
  `;
}

/* ============================================
   SINGLE CARD RENDERER
============================================ */
function renderCard(project, index) {
  // Pares e impares alternan la posición visual/info
  // (par → visual izq, impar → visual der via CSS direction:rtl)
  return `
    <article
      class="project-card reveal"
      id="project-${escapeHtml(project.id)}"
      aria-label="Proyecto: ${escapeHtml(project.title)}"
    >
      ${renderVisual(project)}

      <div class="project-info">
        <div>
          <span class="project-number" aria-hidden="true">${escapeHtml(project.number)}</span>
          <h3 class="project-name">${escapeHtml(project.title)}</h3>
          <p class="project-why">// ${escapeHtml(project.why)}</p>
          ${renderSnippet(project.snippet)}
        </div>

        <div class="project-footer">
          ${renderMetrics(project.metrics)}
          <a
            href="${escapeHtml(project.url)}"
            class="btn btn-outline"
            target="_blank"
            rel="noopener noreferrer"
            style="margin-top:20px; display:inline-block;"
          >Ver proyecto ↗</a>
        </div>
      </div>
    </article>
  `;
}

/* ============================================
   LOADING STATE
============================================ */
function renderSkeleton() {
  return Array(2).fill(0).map(() => `
    <div class="project-card skeleton" aria-hidden="true">
      <div class="project-visual" style="background:var(--c-surface);"></div>
      <div class="project-info" style="display:flex;align-items:center;justify-content:center;">
        <span style="color:var(--c-dim);font-size:0.8rem;letter-spacing:2px;">
          // CARGANDO_PROYECTOS...
        </span>
      </div>
    </div>
  `).join('');
}

/* ============================================
   ERROR STATE
============================================ */
function renderError(msg) {
  return `
    <div class="terminal-box" style="max-width:600px;margin:0 auto;">
      <div class="terminal-header">
        <span class="term-dot red"></span>
        <span class="term-dot yellow"></span>
        <span class="term-dot green"></span>
        <span class="terminal-title">error.log</span>
      </div>
      <div class="terminal-body">
        <div style="color:var(--c-pink)">ERROR: No se pudieron cargar los proyectos</div>
        <div style="color:var(--c-dim)">${escapeHtml(msg)}</div>
        <div style="color:var(--c-green);margin-top:12px;">
          // Tip: Asegúrate de servir el sitio via HTTP, no file://
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   MAIN RENDER FUNCTION
   Esta es la única función pública del módulo.
============================================ */
async function renderProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  // 1. Mostrar skeleton mientras carga
  container.innerHTML = renderSkeleton();

  try {
    // 2. Fetch del JSON — GitHub es tu "panel de control"
    const res = await fetch('./data/projects.json');

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const projects = await res.json();

    // 3. Filtrar solo los featured (o todos si no hay flag)
    const featured = projects.filter(p => p.featured !== false);

    if (!featured.length) throw new Error('El JSON está vacío o mal formado');

    // 4. Renderizar tarjetas
    container.innerHTML = featured.map(renderCard).join('');

    // 5. Re-observar los nuevos elementos para las animaciones reveal
    container.querySelectorAll('.reveal').forEach(el => {
      if (window.__portfolioObserver) window.__portfolioObserver.observe(el);
    });

    // 6. Re-aplicar hover listeners del cursor
    container.querySelectorAll('.project-card, a').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

  } catch (err) {
    console.error('[Portfolio] renderProjects falló:', err);
    container.innerHTML = renderError(err.message);
  }
}

/* ============================================
   UTIL: escapeHtml (XSS prevention)
   Los datos del JSON se inyectan en el DOM —
   nunca confíes en strings externos sin escapar.
============================================ */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
