/**
 * main.js
 * Orquestador. No contiene lógica, solo inicializa módulos.
 * Si un módulo falla, los demás siguen funcionando.
 */

/* ============================================
   CURSOR PERSONALIZADO
============================================ */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.addEventListener('mousemove', e => {
    dot.style.transform  = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    ring.style.transform = `translate(${e.clientX - 14}px, ${e.clientY - 14}px)`;
  });

  // El hover lo gestionan los módulos que crean elementos dinámicos
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, input, .project-card')) {
      document.body.classList.add('hovering');
    } else {
      document.body.classList.remove('hovering');
    }
  });
}

/* ============================================
   SCROLL PROGRESS BAR
============================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;

  const update = () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
}

/* ============================================
   REVEAL ON SCROLL
   Exportamos el observer para que projects.js
   pueda registrar los elementos renderizados.
============================================ */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');

      // Animar skill bars si las contiene
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = (bar.dataset.w || '0') + '%';
      });
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Guardamos la referencia global para que projects.js la use
  window.__portfolioObserver = observer;

  return observer;
}

/* ============================================
   HERO TERMINAL TYPEWRITER
============================================ */
function initHeroTypewriter() {
  const container = document.getElementById('hero-terminal');
  if (!container) return;

  const lines = [
    { cls: 'prompt',    txt: '> whoami' },
    { cls: 'output',    txt: 'Tu Nombre — Frontend Developer' },
    { cls: 'prompt',    txt: '> cat skills.txt' },
    { cls: 'highlight', txt: 'JavaScript · React · CSS3 · Node.js' },
    { cls: 'prompt',    txt: '> cat philosophy.txt' },
    { cls: 'output',    txt: '"El código es comunicación"' },
    { cls: 'comment',   txt: '// código limpio · UX real · impacto medible' },
    { cls: 'prompt',    txt: '> status' },
    { cls: 'output',    txt: '✓ Disponible para proyectos' },
  ];

  let lineIdx = 0, charIdx = 0;

  function type() {
    if (lineIdx >= lines.length) {
      container.innerHTML += `<span class="blink">█</span>`;
      return;
    }
    const line = lines[lineIdx];
    if (charIdx === 0) {
      const el = document.createElement('div');
      el.className = line.cls || '';
      el.id = 'typing-line';
      container.appendChild(el);
    }
    const el = document.getElementById('typing-line');
    if (charIdx < line.txt.length) {
      el.textContent += line.txt[charIdx++];
      setTimeout(type, 25 + Math.random() * 30);
    } else {
      el.removeAttribute('id');
      lineIdx++; charIdx = 0;
      setTimeout(type, 160);
    }
  }

  setTimeout(type, 800);
}

/* ============================================
   TERMINAL INTERACTIVA
============================================ */
function initTerminal() {
  const outputEl = document.getElementById('terminal-output');
  const inputEl  = document.getElementById('terminal-input');
  const termWrap = document.getElementById('live-terminal');
  if (!outputEl || !inputEl) return;

  const COMMANDS = {
    help: () => [
      { cls: 'info', txt: '// COMANDOS DISPONIBLES ─────────────────' },
      { cls: '',     txt: '  about    — Sobre mí'                      },
      { cls: '',     txt: '  skills   — Stack tecnológico'             },
      { cls: '',     txt: '  projects — Ir a la sección proyectos'     },
      { cls: '',     txt: '  contact  — Información de contacto'       },
      { cls: '',     txt: '  matrix   — ??? (descúbrelo)'              },
      { cls: '',     txt: '  clear    — Limpiar consola'               },
      { cls: '',     txt: '  date     — Fecha del sistema'             },
    ],

    about: () => [
      { cls: 'info', txt: '// TU NOMBRE ────────────────────────────' },
      { cls: '',     txt: 'Frontend Developer. N años construyendo'   },
      { cls: '',     txt: 'interfaces rápidas, accesibles y bonitas.'  },
      { cls: 'dim',  txt: '// Status: abierto a oportunidades'        },
    ],

    skills: () => [
      { cls: 'info', txt: '// STACK ────────────────────────────────' },
      { cls: 'warn', txt: '  ◆ HTML5 / CSS3 / JavaScript ES2024'     },
      { cls: 'warn', txt: '  ◆ React · Next.js · TypeScript'         },
      { cls: 'warn', txt: '  ◆ Node.js · REST · GraphQL'             },
      { cls: 'dim',  txt: '  ○ Docker · Vercel · AWS'                },
    ],

    projects: () => {
      setTimeout(() => { window.location.hash = '#projects'; }, 300);
      return [{ cls: 'info', txt: '// Navegando a proyectos...' }];
    },

    contact: () => [
      { cls: 'info', txt: '// CONTACTO ─────────────────────────────' },
      { cls: '',     txt: '  email    → tu@email.com'                 },
      { cls: '',     txt: '  github   → github.com/tunombre'         },
      { cls: '',     txt: '  linkedin → linkedin.com/in/tunombre'     },
    ],

    date: () => [{
      cls: 'info',
      txt: `// ${new Date().toLocaleString('es', { dateStyle: 'full', timeStyle: 'medium' })}`,
    }],

    clear: () => {
      outputEl.innerHTML = '';
      return [];
    },

    matrix: () => {
      startMatrix();
      return [{ cls: 'warn', txt: '// Protocolo MATRIX activado. Pulsa cualquier tecla para salir.' }];
    },
  };

  function print(lines) {
    lines.forEach(({ cls, txt }) => {
      const div = document.createElement('div');
      div.className = 'term-line ' + (cls || '');
      div.textContent = txt;
      outputEl.appendChild(div);
    });
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // Mensaje de boot
  print([
    { cls: 'info', txt: 'PORTFOLIO.SH v2.0 — Sistema online' },
    { cls: 'dim',  txt: 'Escribe "help" para ver los comandos disponibles.' },
    { cls: '',     txt: '' },
  ]);

  const cmdHistory = [];
  let histIdx = -1;

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const raw = inputEl.value.trim();
      const cmd = raw.toLowerCase();
      if (!cmd) return;
      cmdHistory.unshift(cmd);
      histIdx = -1;
      print([{ cls: 'dim', txt: `visitor@portfolio:~$ ${cmd}` }]);
      const fn = COMMANDS[cmd];
      fn
        ? print(fn())
        : print([{ cls: 'error', txt: `bash: ${cmd}: command not found. Prueba "help"` }]);
      inputEl.value = '';
    }

    if (e.key === 'ArrowUp') {
      histIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
      inputEl.value = cmdHistory[histIdx] ?? '';
      e.preventDefault();
    }

    if (e.key === 'ArrowDown') {
      histIdx = Math.max(histIdx - 1, -1);
      inputEl.value = histIdx < 0 ? '' : cmdHistory[histIdx];
      e.preventDefault();
    }
  });

  if (termWrap) termWrap.addEventListener('click', () => inputEl.focus());
}

/* ============================================
   EASTER EGG: MATRIX RAIN
============================================ */
function startMatrix() {
  if (window.__matrixActive) return;
  window.__matrixActive = true;

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', inset: 0, zIndex: '9990', background: '#000',
  });
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx   = canvas.getContext('2d');
  const cols  = Math.floor(canvas.width / 16);
  const drops = Array(cols).fill(1);
  const chars = 'アイウエオカキクケコ0123456789ABCDEF<>/{}[]';
  let raf;

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff9f';
    ctx.font = '15px "Share Tech Mono", monospace';
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
      if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
    raf = requestAnimationFrame(draw);
  }
  draw();

  const stop = () => {
    if (!window.__matrixActive) return;
    window.__matrixActive = false;
    cancelAnimationFrame(raf);
    canvas.remove();
    document.removeEventListener('keydown', stop);
    canvas.removeEventListener('click', stop);
  };
  document.addEventListener('keydown', stop);
  canvas.addEventListener('click', stop);
}

/* ============================================
   EASTER EGG: KONAMI CODE
============================================ */
function initKonami() {
  const SEQ = [38,38,40,40,37,39,37,39,66,65];
  let idx = 0;
  document.addEventListener('keydown', e => {
    idx = e.keyCode === SEQ[idx] ? idx + 1 : 0;
    if (idx === SEQ.length) { idx = 0; startMatrix(); }
  });
}

/* ============================================
   BOOT — Inicialización en orden
============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  initCursor();
  initScrollProgress();
  initReveal();         // debe ir antes de renderProjects
  initHeroTypewriter();
  initTerminal();
  initKonami();

  // renderProjects está en js/projects.js (cargado antes en el HTML)
  await renderProjects();
});
