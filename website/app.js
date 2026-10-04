'use strict';

const content = document.getElementById('content');
const names = ['ChatGPT Dots', 'GrokBot', 'Instinct', 'Muse'];
const info = { 'ChatGPT Dots': { id: 'dots' }, GrokBot: { id: 'grokbot' }, Instinct: { id: 'instinct' }, Muse: { id: 'muse' } };
let groups = {};
const labels = { passed: 'Passed', partial: 'Partial', failed: 'Failed', pending: 'Pending', awaiting_user: 'Needs user', not_evaluated: 'Not tested', not_run: 'Not started', running: 'Running', awaiting_response: 'Awaiting response', blocked: 'Blocked', unsupported: 'Unsupported', awaiting_review: 'Awaiting review' };
let data;
let filter = 'All tasks';
let layout = 'list';

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const glyph = (name) => {
  const paths = {
    chevron: '<path d="m9 5 7 7-7 7"/>',
    back: '<path d="m15 5-7 7 7 7"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    file: '<path d="M13 3H6v18h12V8l-5-5Zm0 0v5h5M9 13h6M9 17h6"/>'
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
};
const badge = status => `<span class="badge ${esc(status)}">${labels[status] || esc(status)}</span>`;
const icon = name => name === 'Instinct'
  ? '<span class="agent-icon instinct" aria-hidden="true">I</span>'
  : `<span class="agent-icon image-icon ${info[name].id}" aria-hidden="true"><img src="assets/${info[name].id}-logo.png" alt="" width="52" height="52"></span>`;
const count = (name, indices = groups['All tasks']) => indices.filter(i => data.tasks[i].results[name].status === 'passed' && data.tasks[i].results[name].review_status === 'reviewed').length;
const reviewedCount = (name, indices = groups['All tasks']) => indices.filter(i => data.tasks[i].results[name].review_status === 'reviewed').length;
const unresolvedLabel = name => `${reviewedCount(name)} of ${data.tasks.length} reviewed`;
const score = (passed, total) => `<span class="score-number">${passed}<span class="score-divider">/</span><span class="score-total">${total}</span></span>`;
const round = () => '<div class="round-meta"><span class="round-label">In progress</span><span>Oct 2, 2026</span></div>';
const updated = () => `<p class="fineprint">Updated ${esc(data.updated_at)}. Individual skill version ${esc(data.suite_version)}.</p>`;

const selectedUseCase = () => data.use_cases.find(useCase => useCase.label === filter);

function useCaseLabels(name) {
  const useCases = data.use_cases.filter(useCase => reviewedCount(name, groups[useCase.label]) > 0);
  return `<div class="agent-labels" aria-label="${esc(name)}: tested categories">${useCases.length
    ? useCases.map(useCase => {
      const indices = groups[useCase.label];
      const passed = count(name, indices);
      return `<a class="use-case-label${passed ? ' has-passes' : ''}${filter === useCase.label ? ' selected' : ''}" href="#for/${esc(useCase.id)}" title="${esc(`${passed} reviewed passes / ${indices.length} tests; ${reviewedCount(name, indices)} reviewed. Compare ${useCase.label.toLowerCase()}.`)}">${esc(useCase.label)} <span class="category-score">${passed}/${indices.length}</span></a>`;
    }).join('')
    : '<span class="no-use-case-labels">No reviewed tests yet</span>'}</div>`;
}

function leaderboard() {
  const indices = groups[filter];
  const sorted = [...names].sort((a, b) => count(b, indices) - count(a, indices));
  return `<div class="agent-list ${layout}">
    <div class="list-head" aria-hidden="true"><span class="assistant-label">Assistant</span><span class="align-right">Passed</span><span class="align-right manual-heading">Manual</span></div>
    ${sorted.map(name => {
      const passed = count(name, indices);
      const rank = sorted.findIndex(other => count(other, indices) === passed) + 1;
      const tied = sorted.filter(other => count(other, indices) === passed).length > 1;
      return `<article class="agent-row">
        <span class="rank" title="${reviewedCount(name, indices) ? `${tied ? 'Tied for ' : 'Rank '}${rank}` : 'No reviewed results yet'}">${reviewedCount(name, indices) ? String(rank).padStart(2, '0') : '—'}</span>
        ${icon(name)}
        <div class="agent-info"><a class="agent-name agent-profile-link" href="#assistant/${info[name].id}" aria-label="Review ${name}: ${passed} of ${indices.length} individual tasks passed">${name}</a><div class="bar" role="group" aria-label="${name} test outcomes">${indices.map(i => `<button class="task-dash ${data.tasks[i].results[name].status}" type="button" data-agent="${info[name].id}" data-task="${i}" aria-label="${esc(`${name} · ${data.tasks[i].name}: ${labels[data.tasks[i].results[name].status]}`)}"></button>`).join('')}</div>${useCaseLabels(name)}</div>
        <div class="metric align-right">${score(passed, indices.length)}<span class="metric-coverage">${reviewedCount(name, indices)} reviewed</span></div>
        <div class="manual-result" aria-label="${name}: manual voice tests not tested"><span class="manual-inline-label">Manual</span><span>Not tested</span></div>
        <span class="open-indicator">${glyph('chevron')}</span>
      </article>`;
    }).join('')}
  </div>`;
}

function renderHome() {
  const useCase = selectedUseCase();
  content.innerHTML = `<div class="intro home-intro"><div><h1>${useCase ? `Best AI Agent for <span class="use-case-slot">[ ${esc(useCase.phrase)} ]</span>` : 'Compare AI agents'}</h1><p class="intro-caption">${names.length} assistants<span aria-hidden="true">·</span>${data.tasks.length} tasks</p>${useCase ? `<p class="use-case-description">${esc(useCase.description)}</p>` : ''}</div>${round()}</div>
    <div class="toolbar"><div class="filters" role="group" aria-label="Filter by use case">${Object.entries(groups).map(([name, indices]) => `<button class="chip" type="button" data-filter="${esc(name)}" aria-pressed="${filter === name}">${esc(name)}<span>${indices.length}</span></button>`).join('')}</div>
      <div class="segmented" role="group" aria-label="Results layout"><button type="button" data-layout="list" aria-label="List view" title="List view" aria-pressed="${layout === 'list'}">${glyph('list')}</button><button type="button" data-layout="grid" aria-label="Grid view" title="Grid view" aria-pressed="${layout === 'grid'}">${glyph('grid')}</button></div>
    </div>
    ${useCase ? `<details class="category-protocols"><summary>${useCase.task_ids.length} test ${useCase.task_ids.length === 1 ? 'case' : 'cases'}</summary>${groups[filter].map(index => {
      const task = data.tasks[index];
      return `<article><h2>${esc(task.name)}</h2><p>${esc(task.criterion)}</p><a href="${esc(instructionsUrl(task))}">Instructions and checks ↗</a><a href="${esc(task.package_url)}">Download skill ZIP</a></article>`;
    }).join('')}</details>` : ''}
    <p class="label-explainer">Category tags show reviewed passes / tests. New cases are not started. Results describe the tested tasks.</p>
    <div id="leaderboard" aria-live="polite">${leaderboard()}</div>
    <div class="results-key"><div class="legend"><span class="passed">Passed</span><span class="partial">Partial / needs user</span><span class="failed">Failed</span><span class="pending">Pending</span><span class="not_run">Not started</span></div><span class="key-caption">Reviewed passes / individual tasks</span></div>`;
  content.querySelectorAll('[data-filter]').forEach(button => {
    button.onclick = () => {
      const useCase = data.use_cases.find(item => item.label === button.dataset.filter);
      location.hash = useCase ? `#for/${useCase.id}` : '#assistants';
    };
  });
  content.querySelectorAll('[data-layout]').forEach(button => {
    button.onclick = () => {
      layout = button.dataset.layout;
      updateLeaderboard();
      content.querySelectorAll('[data-layout]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.layout === layout)));
    };
  });
}

function updateLeaderboard() {
  hideTaskTooltip();
  document.getElementById('leaderboard').innerHTML = leaderboard();
}

// A single floating tooltip stays clear of clipped rows and narrow viewports.
const taskTooltip = document.createElement('div');
taskTooltip.id = 'task-tooltip';
taskTooltip.className = 'task-tooltip';
taskTooltip.setAttribute('role', 'tooltip');
taskTooltip.hidden = true;
document.body.append(taskTooltip);
let tooltipTrigger = null;
let tooltipPinned = false;
let tooltipCloseTimer;

function hideTaskTooltip() {
  clearTimeout(tooltipCloseTimer);
  tooltipTrigger?.removeAttribute('aria-describedby');
  tooltipTrigger?.classList.remove('is-active');
  tooltipTrigger = null;
  tooltipPinned = false;
  taskTooltip.hidden = true;
}

function showTaskTooltip(button) {
  clearTimeout(tooltipCloseTimer);
  if (tooltipTrigger !== button) hideTaskTooltip();
  tooltipTrigger = button;
  const name = names.find(item => info[item].id === button.dataset.agent);
  const task = data.tasks[Number(button.dataset.task)];
  const result = task.results[name];
  taskTooltip.innerHTML = `<div class="task-tooltip-inner"><p class="tooltip-agent">${esc(name)}</p><div class="tooltip-heading"><strong>${esc(task.name)}</strong>${badge(result.status)}</div><p class="tooltip-summary">${esc(result.summary)}</p><div class="tooltip-criterion"><span>Pass criterion</span><p>${esc(task.criterion)}</p></div></div>`;
  taskTooltip.hidden = false;
  button.setAttribute('aria-describedby', taskTooltip.id);
  button.classList.add('is-active');
  positionTaskTooltip();
}

function positionTaskTooltip() {
  if (!tooltipTrigger || taskTooltip.hidden) return;
  const rect = tooltipTrigger.getBoundingClientRect();
  const width = taskTooltip.offsetWidth;
  const height = taskTooltip.offsetHeight;
  const edge = 12;
  const gap = 9;
  const center = rect.left + rect.width / 2;
  const left = Math.max(edge, Math.min(center - width / 2, document.documentElement.clientWidth - width - edge));
  const above = rect.top >= height + gap + edge;
  const top = above ? rect.top - height - gap : Math.min(rect.bottom + gap, window.innerHeight - height - edge);
  taskTooltip.dataset.placement = above ? 'top' : 'bottom';
  taskTooltip.style.left = `${left}px`;
  taskTooltip.style.top = `${Math.max(edge, top)}px`;
  taskTooltip.style.setProperty('--arrow-left', `${Math.max(18, Math.min(center - left, width - 18))}px`);
}

function scheduleTooltipClose() {
  clearTimeout(tooltipCloseTimer);
  // Recheck after the grace period: pointer/focus events can arrive out of order.
  tooltipCloseTimer = setTimeout(() => {
    if (tooltipPinned || tooltipTrigger?.matches(':hover, :focus-visible') || taskTooltip.matches(':hover')) return;
    hideTaskTooltip();
  }, 300);
}

content.addEventListener('pointerover', event => {
  const button = event.target.closest('.task-dash');
  if (event.pointerType !== 'touch' && button && !button.contains(event.relatedTarget)) showTaskTooltip(button);
});
content.addEventListener('pointerout', event => {
  if (!tooltipTrigger || event.target.closest('.task-dash') !== tooltipTrigger) return;
  if (tooltipTrigger.contains(event.relatedTarget) || taskTooltip.contains(event.relatedTarget)) return;
  scheduleTooltipClose();
});
content.addEventListener('focusin', event => {
  if (event.target.matches('.task-dash:focus-visible')) showTaskTooltip(event.target);
});
content.addEventListener('focusout', event => {
  if (event.target !== tooltipTrigger) return;
  tooltipPinned = false;
  scheduleTooltipClose();
});
content.addEventListener('click', event => {
  const button = event.target.closest('.task-dash');
  if (!button) return;
  if (tooltipTrigger === button && tooltipPinned) hideTaskTooltip();
  else { showTaskTooltip(button); tooltipPinned = true; }
});
taskTooltip.addEventListener('pointerenter', () => clearTimeout(tooltipCloseTimer));
taskTooltip.addEventListener('pointerleave', event => {
  if (tooltipTrigger?.contains(event.relatedTarget)) return;
  scheduleTooltipClose();
});
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.task-dash') && !taskTooltip.contains(event.target)) hideTaskTooltip();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') hideTaskTooltip();
});
window.addEventListener('scroll', positionTaskTooltip, { passive: true });
window.addEventListener('resize', positionTaskTooltip);

function evidence(task, result) {
  return `<details class="evidence-disclosure"><summary>Evidence${glyph('chevron')}</summary><div class="evidence-body"><p class="criterion"><strong>Pass criterion</strong>${esc(task.criterion)}</p><ul>${result.details.map(detail => `<li>${esc(detail)}</li>`).join('')}</ul>
    ${result.sources.length ? `<div class="sources">${result.sources.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${glyph('file')}<span>${esc(label)}</span></a>`).join('')}</div>` : '<p class="source-note">No evidence published yet.</p>'}
  </div></details>`;
}

const instructionsUrl = task => task.protocol_url || `https://github.com/marinatrajk/assistant-benchmark/tree/${data.repository_commit}/skills/${task.skill}`;

function protocol(task, result) {
  return `<details class="skill-protocol"><summary>Task protocol</summary><div><a href="${esc(instructionsUrl(task))}">Instructions and checks ↗</a><a href="${esc(task.package_url)}">Download skill ZIP</a><p>Version ${esc(data.suite_version)} · ${result.review_status === 'reviewed' ? 'Reviewed by operator' : 'No completed operator review'}</p>${result.run_id ? `<p>Run: <code>${esc(result.run_id)}</code></p>` : ''}<p>Package SHA-256: <code>${esc(task.package_sha256)}</code></p></div></details>`;
}

function renderProfile(name) {
  const tasks = data.tasks.map((task, index) => {
    const result = task.results[name];
    return `<article class="task-result" id="task-${esc(task.task_id)}"><div class="task-result-head"><h3><span class="skill-order">${String(index + 1).padStart(2, '0')}</span>${esc(task.name)}</h3>${badge(result.status)}</div>${result.status !== 'not_run' ? `<p class="task-summary">${esc(result.summary)}</p>` : ''}${result.details.length || result.sources.length ? evidence(task, result) : ''}${protocol(task, result)}</article>`;
  }).join('');
  const notStarted = data.tasks.filter(task => task.results[name].status === 'not_run').length;
  const awaitingReview = data.tasks.filter(task => task.results[name].status === 'awaiting_review').length;
  content.innerHTML = `<a class="back" href="#assistants">${glyph('back')}<span>All assistants</span></a>
    <div class="profile-hero">${icon(name)}<div class="profile-heading"><h1>${name}</h1><div class="profile-stat">${score(count(name), data.tasks.length)}<span>individual tasks passed</span><span class="profile-pending">${unresolvedLabel(name)}</span></div><p class="profile-label-heading">Tested categories · reviewed passes / tests</p>${useCaseLabels(name)}</div><a class="button" href="#compare">Compare</a></div>
    <div class="profile-layout"><section><div class="section-title"><h2>Individual task results</h2><span>${data.tasks.length} tests</span></div><div class="task-list">${tasks}</div></section>
      <aside class="sidebar"><div class="run-card"><h2>Test progress</h2><dl><div class="stat-line"><dt>Reviewed</dt><dd>${reviewedCount(name)} / ${data.tasks.length}</dd></div><div class="stat-line"><dt>Awaiting review</dt><dd>${awaitingReview}</dd></div><div class="stat-line"><dt>Not started</dt><dd>${notStarted}</dd></div><div class="stat-line"><dt>Manual tests</dt><dd>Not tested</dd></div></dl></div><div class="review-note">${round()}<p>Each task uses its own skill and evidence checklist.</p><a href="#methodology">How we test</a></div></aside>
    </div>${updated()}`;
}

function renderCompare() {
  content.innerHTML = `<div class="intro"><div><p class="eyebrow">Side by side</p><h1>Compare results<span class="title-period">.</span></h1><p class="intro-caption">${data.tasks.length} individual tests. Each assistant’s own tools.</p></div>${round()}</div>
    <div class="table-wrap"><table class="comparison"><caption class="sr-only">Individual task comparison</caption><thead><tr><th scope="col">Task</th>${names.map(name => `<th scope="col"><a class="compare-agent" href="#assistant/${info[name].id}">${icon(name)}<span>${name}</span></a><div class="compare-score">${score(count(name), data.tasks.length)}<span>passed</span></div><p class="comparison-coverage">${reviewedCount(name)} reviewed</p>${useCaseLabels(name)}</th>`).join('')}</tr></thead><tbody>${data.tasks.map((task, index) => `<tr><th scope="row">${esc(task.name)}<span class="task-index">${String(index + 1).padStart(2, '0')}</span></th>${names.map(name => `<td>${badge(task.results[name].status)}<details class="comparison-detail"><summary>Details${glyph('chevron')}</summary><p>${esc(task.results[name].summary)}</p><p class="criterion"><strong>Pass criterion</strong>${esc(task.criterion)}</p><a href="#assistant/${info[name].id}">Review evidence</a></details></td>`).join('')}</tr>`).join('')}</tbody></table></div>
    ${updated()}`;
}

function renderMethod() {
  content.innerHTML = `<div class="intro"><div><p class="eyebrow">Behind the results</p><h1>Methodology<span class="title-period">.</span></h1><p class="intro-caption">${data.tasks.length} individual tests, reviewed against the evidence.</p></div>${round()}</div>
    <div class="method-grid"><section><h2>Categories and coverage</h2><p class="method-label-note">Categories follow the tasks people search for, such as travel planning, email management and coding. A tag appears after at least one test in that category has been reviewed. Its count shows reviewed full passes / mapped tests, with review coverage shown in the results. A tag is not a claim that every test passed. Repeat runs and broader coverage are needed for a best-in-category recommendation.</p><h2>How we test</h2><ol class="method-list">${data.methodology.map(text => `<li>${esc(text)}</li>`).join('')}</ol><h2>Published protocols</h2><p class="method-protocol-link"><a href="https://github.com/marinatrajk/assistant-benchmark/blob/${esc(data.catalog_repository_ref || data.repository_commit)}/docs/SKILLS.md">Read the task catalog and download each skill ↗</a></p></section>
      <aside><div class="run-card method-card"><h3>A full pass</h3><p>Every required check must be supported by reviewed evidence. A self-reported result stays awaiting review until that evidence is checked.</p><hr><h3>Other outcomes</h3><p>Partial, failed, blocked, unsupported, needs-user, and pending results retain their specific reason. Not started means no attempt has been made.</p><hr><h3>Separate manual checks</h3><p><a href="${esc(data.manual_testing.url)}">Voice-mode tests ↗</a> are performed by a person and shown in the Manual column.</p></div></aside>
    </div>${updated()}`;
}

function route() {
  if (!data) return;
  hideTaskTooltip();
  let hash = location.hash.slice(1) || 'assistants';
  // Keep old individual-run bookmarks pointed at the canonical views.
  if (hash === 'skill-runs') hash = 'assistants';
  else if (hash.startsWith('skill-runs/')) hash = hash.replace('skill-runs/', 'assistant/');
  if (location.hash.startsWith('#skill-runs')) history.replaceState(null, '', `#${hash}`);
  const categoryAliases = { shopping: 'personal', reminders: 'personal', memory: 'personal', 'memory-updates': 'personal', 'browser-forms': 'personal', computer: 'personal', 'scheduled-research': 'personal', files: 'business', 'browser-research': 'research', video: 'research' };
  if (hash.startsWith('for/') && categoryAliases[hash.slice(4)]) {
    hash = `for/${categoryAliases[hash.slice(4)]}`;
    history.replaceState(null, '', `#${hash}`);
  }
  // The skip link moves focus without replacing the current view.
  if (hash === 'content') { content.focus(); return; }
  const name = names.find(item => hash === `assistant/${info[item].id}`);
  const useCase = data.use_cases.find(item => hash === `for/${item.id}`);
  const view = name ? 'assistants' : ['compare', 'methodology'].includes(hash) ? hash : 'assistants';
  if (view === 'assistants' && !name) filter = useCase?.label || 'All tasks';
  document.querySelectorAll('[data-nav]').forEach(link => {
    const active = link.dataset.nav === view;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  content.dataset.view = name ? 'profile' : view;
  if (name) renderProfile(name);
  else if (view === 'compare') renderCompare();
  else if (view === 'methodology') renderMethod();
  else renderHome();
  document.title = name ? `${name} — ${data.project_name}` : view === 'compare' ? `Compare assistants — ${data.project_name}` : view === 'methodology' ? `Methodology — ${data.project_name}` : useCase ? `Best AI Agent for ${useCase.phrase} — reviewed results` : `${data.project_name} — reviewed results`;
}

window.addEventListener('hashchange', () => {
  const skip = location.hash === '#content';
  route();
  if (!skip) { window.scrollTo(0, 0); content.focus({ preventScroll: true }); }
  document.querySelector('.export-menu').open = false;
});
const exportMenu = document.querySelector('.export-menu');
document.addEventListener('click', event => {
  if (!exportMenu.contains(event.target)) exportMenu.open = false;
  if (event.target.closest('[data-action="print"]')) { exportMenu.open = false; window.print(); }
  if (event.target.closest('.export-popover a')) exportMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && exportMenu.open) { exportMenu.open = false; exportMenu.querySelector('summary').focus(); }
});
let printDetails = [];
window.addEventListener('beforeprint', () => {
  hideTaskTooltip();
  printDetails = [...content.querySelectorAll('details')].map(element => ({ element, open: element.open }));
  printDetails.forEach(({ element }) => { element.open = true; });
});
window.addEventListener('afterprint', () => {
  printDetails.forEach(({ element, open }) => { element.open = open; });
  printDetails = [];
});
fetch('review.json', { cache: 'no-cache' }).then(response => {
  if (!response.ok) throw new Error('Results unavailable');
  return response.json();
}).then(result => {
  data = result;
  groups = { 'All tasks': data.tasks.map((_, i) => i) };
  data.use_cases.forEach(useCase => {
    groups[useCase.label] = useCase.task_ids.map(id => data.tasks.findIndex(task => task.task_id === id));
  });
  if (location.hash === '#content') renderHome();
  route();
}).catch(() => {
  content.innerHTML = '<div class="empty-state"><h1>Results couldn’t load.</h1><p>Please refresh, or open the individual task data directly.</p><a class="button" href="review.json">Open task data</a></div>';
});
