
const TAG_MAP = { green:'cl', cyan:'cs', pink:'cp', yellow:'cl' };

function esc(s){ if(typeof s!=='string')return String(s??''); return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function renderCard(p){
  const chips = p.tags.map(t=>`<span class="chip ${TAG_MAP[t.color]||'cp'}">${esc(t.label)}</span>`).join('');
  const stats = p.metrics.map(m=>`<div><span class="stat-val">${esc(m.value)}</span><span class="stat-lab">${esc(m.label)}</span></div>`).join('');
  const snippet = p.snippet.lines.map(l=>{
    const t=esc(l.text);
    switch(l.type){
      case 'comment': return `<span class="cm">${t}</span>`;
      case 'kw':  return `<span class="kw">${t}</span>`;
      case 'fn':  return `<span class="fn">${t}</span>`;
      case 'str': return `<span class="st">${t}</span>`;
      case 'num': return `<span class="nm">${t}</span>`;
      default:    return `<span>${t}</span>`;
    }
  }).join('<br>');
  const preview = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
    : `<img
        src="https://api.microlink.io/?url=${encodeURIComponent(p.url)}&screenshot=true&meta=false&embed=screenshot.url"
        alt="Preview de ${esc(p.title)}"
        loading="lazy"
        style="width:100%;height:100%;object-fit:cover;"
        onerror="this.parentElement.innerHTML='<div class=\'mock\'>${p.emoji}</div>'"
      >`;
  const visual = preview;
  return `
    <article class="proj-item reveal" id="proj-${esc(p.id)}" aria-label="${esc(p.title)}">
      <div class="proj-img">
        ${visual}
        <div class="proj-img-overlay">
          <span class="proj-num" aria-hidden="true">${esc(p.number)}</span>
          <div class="proj-chips">${chips}</div>
        </div>
      </div>
      <div class="proj-body">
        <div>
          <h3 class="proj-title">${esc(p.title)}</h3>
          <p class="proj-desc">// ${esc(p.why)}</p>
          <div class="code-block" data-lang="${esc(p.snippet.lang)}">${snippet}</div>
        </div>
        <div>
          <div class="proj-stats">${stats}</div>
          <a href="${esc(p.url)}" class="btn btn-ghost" target="_blank" rel="noopener noreferrer" style="font-size:.35rem;">Ver proyecto</a>
        </div>
      </div>
    </article>`;
}

async function renderProjects(){
  const grid = document.getElementById('projects-grid');
  if(!grid) return;
  grid.innerHTML = '<div style="padding:40px;text-align:center;font-family:monospace;color:#5a5280;">Cargando...</div>';
  try{
    const res = await fetch('./data/projects.json');
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const list = data.filter(p=>p.featured!==false);
    grid.innerHTML = list.map(renderCard).join('');
    grid.querySelectorAll('.reveal').forEach(el=>{ if(window.__portfolioObserver) window.__portfolioObserver.observe(el); });
  }catch(err){
    grid.innerHTML = '<div style="padding:40px;color:#ff4d8d;font-family:monospace;">Error: ' + err.message + '</div>';
  }
}

document.addEventListener('DOMContentLoaded', renderProjects);
