'use strict';

const content = document.getElementById('content');
const names = ['ChatGPT Dots', 'GrokBot', 'Instinct', 'Muse'];
const info = {
  'ChatGPT Dots': { id: 'dots', delay: '119s late', delayNote: 'Passed, just inside the 120-second limit.' },
  'GrokBot': { id: 'grokbot', delay: '238s late', delayNote: 'Failed the 120-second delivery limit.' },
  'Instinct': { id: 'instinct', delay: 'Within limit', delayNote: 'Combined send log and minute-level receipt; exact delivery seconds unavailable.' },
  'Muse': { id: 'muse', delay: 'Within limit', delayNote: 'Receipt was 30 to under 90 seconds after due, based on the app’s minute-level timestamp. The reported 52 seconds is a worker timestamp, not measured receipt latency.' }
};
const groups = { 'All tasks': [0, 1, 2, 3, 4, 5], Shopping: [1], Research: [0], Scheduling: [2, 3, 4], Files: [5] };
const labels = { passed: 'Passed', partial: 'Partial', failed: 'Failed', pending: 'Pending', awaiting_user: 'Needs user', not_evaluated: 'Not tested' };
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
const count = (name, indices = groups['All tasks']) => indices.filter(i => data.tasks[i].results[name].status === 'passed').length;
const unresolvedLabel = name => ['pending', 'not_evaluated'].map(status => {
  const total = data.tasks.filter(task => task.results[name].status === status).length;
  return total ? `${total} ${labels[status].toLowerCase()}` : '';
}).filter(Boolean).join(' · ');
const score = (passed, total) => `<span class="score-number">${passed}<span class="score-divider">/</span><span class="score-total">${total}</span></span>`;
const pilot = name => `<div class="pilot-meta"><span class="pilot">Provisional</span><span>${name ? (data.run_dates[name] === '2026-10-02' ? 'Oct 2, 2026' : 'Oct 1, 2026') : 'Oct 1–2, 2026'}</span></div>`;
const note = () => `<div class="snapshot-note">${glyph('clock')}<p>Cancellation: 3 pending · Muse not tested.</p><a href="#methodology">Methodology</a></div>`;
const reviewed = () => `<p class="fineprint">Reviewed ${esc(data.reviewed_at)}. Cross-conversation memory was not tested.</p>`;

function statusChips(name, indices) {
  const counts = {};
  indices.forEach(i => {
    const status = data.tasks[i].results[name].status;
    if (status !== 'passed') counts[status] = (counts[status] || 0) + 1;
  });
  return Object.entries(counts).map(([status, value]) => `<span class="outcome-tag ${status}">${value} ${labels[status].toLowerCase()}</span>`).join('') || '<span class="outcome-tag complete">All passed</span>';
}

function leaderboard() {
  const indices = groups[filter];
  const sorted = [...names].sort((a, b) => count(b, indices) - count(a, indices));
  return `<div class="agent-list ${layout}">
    <div class="list-head" aria-hidden="true"><span class="assistant-label">Assistant</span><span class="align-right">Passed</span><span class="align-right manual-heading">Manual</span><span class="align-right">Other outcomes</span></div>
    ${sorted.map(name => {
      const passed = count(name, indices);
      const rank = sorted.findIndex(other => count(other, indices) === passed) + 1;
      const tied = sorted.filter(other => count(other, indices) === passed).length > 1;
      return `<article class="agent-row">
        <span class="rank" title="${tied ? 'Tied for ' : 'Rank '}${rank}">${String(rank).padStart(2, '0')}</span>
        ${icon(name)}
        <div class="agent-info"><a class="agent-name agent-profile-link" href="#assistant/${info[name].id}" aria-label="Review ${name}: ${passed} of ${indices.length} supported outcomes">${name}</a><div class="bar" role="group" aria-label="${name} test outcomes">${indices.map(i => `<button class="task-dash ${data.tasks[i].results[name].status}" type="button" data-agent="${info[name].id}" data-task="${i}" aria-label="${esc(`${name} · ${data.tasks[i].name}: ${labels[data.tasks[i].results[name].status]}`)}"></button>`).join('')}</div></div>
        <div class="metric align-right">${score(passed, indices.length)}</div>
        <div class="manual-result" aria-label="${name}: manual voice tests not tested"><span class="manual-inline-label">Manual</span><span>Not tested</span></div>
        <div class="outcome">${statusChips(name, indices)}</div>
        <span class="open-indicator">${glyph('chevron')}</span>
      </article>`;
    }).join('')}
  </div>`;
}

function renderHome() {
  content.innerHTML = `<div class="intro"><div><p class="eyebrow">Everyday pilot</p><h1>Assistant results<span class="title-period">.</span></h1><p class="intro-caption">${names.length} assistants<span>·</span>6 tasks<span>·</span>Their own tools</p></div>${pilot()}</div>
    <div class="toolbar"><div class="filters" role="group" aria-label="Filter by task">${Object.entries(groups).map(([name, indices]) => `<button class="chip" type="button" data-filter="${name}" aria-pressed="${filter === name}">${name}<span>${indices.length}</span></button>`).join('')}</div>
      <div class="segmented" role="group" aria-label="Results layout"><button type="button" data-layout="list" aria-label="List view" title="List view" aria-pressed="${layout === 'list'}">${glyph('list')}</button><button type="button" data-layout="grid" aria-label="Grid view" title="Grid view" aria-pressed="${layout === 'grid'}">${glyph('grid')}</button></div>
    </div>
    <div id="leaderboard" aria-live="polite">${leaderboard()}</div>
    <div class="results-key"><div class="legend"><span class="passed">Passed</span><span class="partial">Partial / needs user</span><span class="failed">Failed</span><span class="pending">Pending</span><span class="not_evaluated">Not tested</span></div><span class="key-caption">Full passes / assigned tasks</span></div>
    <p class="manual-note">Manual: <a href="https://github.com/marinatrajk/assistant-benchmark/tree/main/manual-testing/voice-mode">Voice-mode tests</a> · Results coming after testing.</p>
    ${note()}`;
  content.querySelectorAll('[data-filter]').forEach(button => {
    button.onclick = () => {
      filter = button.dataset.filter;
      updateLeaderboard();
      content.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === filter)));
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
    ${result.sources.length ? `<div class="sources">${result.sources.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${glyph('file')}<span>${esc(label)}</span></a>`).join('')}</div>` : '<p class="source-note">Based on reviewer observations. Private conversation records are not published.</p>'}
  </div></details>`;
}

function renderProfile(name) {
  const tasks = data.tasks.map(task => {
    const result = task.results[name];
    return `<article class="task-result"><div class="task-result-head"><h3>${esc(task.name)}</h3>${badge(result.status)}</div><p class="task-summary">${esc(result.summary)}</p>${evidence(task, result)}</article>`;
  }).join('');
  content.innerHTML = `<a class="back" href="#assistants">${glyph('back')}<span>All assistants</span></a>
    <div class="profile-hero">${icon(name)}<div class="profile-heading"><h1>${name}</h1><div class="profile-stat">${score(count(name), data.tasks.length)}<span>supported outcomes</span><span class="profile-pending">${unresolvedLabel(name)}</span></div></div><a class="button" href="#compare">Compare</a></div>
    <div class="profile-layout"><section><div class="section-title"><h2>Task results</h2><span>${data.tasks.length} scenarios</span></div><div class="task-list">${tasks}</div></section>
      <aside class="sidebar"><div class="run-card"><h2>At a glance</h2><dl><div class="stat-line"><dt>Reminder</dt><dd>${info[name].delay}</dd></div><div class="stat-line"><dt>Expense total</dt><dd>$189.80</dd></div><div class="stat-line"><dt>Orders placed</dt><dd>0</dd></div></dl><details class="timing-note"><summary>About the timing${glyph('chevron')}</summary><p>${info[name].delayNote} Timing describes the conversation notification, not a device push or a read receipt.</p></details></div><div class="review-note">${pilot(name)}<p>One run with the assistant’s own tools.</p><a href="#methodology">How we tested</a></div></aside>
    </div>${reviewed()}`;
}

function renderCompare() {
  content.innerHTML = `<div class="intro"><div><p class="eyebrow">Side by side</p><h1>Compare results<span class="title-period">.</span></h1><p class="intro-caption">Six scenarios. The same brief.</p></div>${pilot()}</div>
    <div class="table-wrap"><table class="comparison"><caption class="sr-only">Everyday pilot task comparison</caption><thead><tr><th scope="col">Scenario</th>${names.map(name => `<th scope="col"><a class="compare-agent" href="#assistant/${info[name].id}">${icon(name)}<span>${name}</span></a><div class="compare-score">${score(count(name), 6)}<span>passed</span></div></th>`).join('')}</tr></thead><tbody>${data.tasks.map((task, index) => `<tr><th scope="row">${esc(task.name)}<span class="task-index">${String(index + 1).padStart(2, '0')}</span></th>${names.map(name => `<td>${badge(task.results[name].status)}<details class="comparison-detail"><summary>Details${glyph('chevron')}</summary><p>${esc(task.results[name].summary)}</p><p class="criterion"><strong>Pass criterion</strong>${esc(task.criterion)}</p><a href="#assistant/${info[name].id}">Review evidence</a></details></td>`).join('')}</tr>`).join('')}</tbody></table></div>
    ${note()}<p class="fineprint">Different merchants and tool environments may affect results.</p>`;
}

function renderMethod() {
  content.innerHTML = `<div class="intro"><div><p class="eyebrow">Behind the results</p><h1>Methodology<span class="title-period">.</span></h1><p class="intro-caption">Real tasks, reviewed against the evidence.</p></div>${pilot()}</div>
    <div class="callout">${glyph('clock')}<p>Cancellation was confirmed by the three October 1 assistants; final absence checks remain unverified. Muse did not receive the change/cancel prompts, so that test was not exercised.</p></div>
    <div class="method-grid"><section><h2>How this was reviewed</h2><ol class="method-list">${data.methodology.map(text => `<li>${esc(text)}</li>`).join('')}</ol><details class="method-findings"><summary><h2>What the results mean</h2>${glyph('chevron')}</summary><ul class="method-list">${data.notes.map(text => `<li>${esc(text)}</li>`).join('')}</ul></details></section>
      <aside><div class="run-card method-card"><h3>A full pass</h3><p>The task criteria are met and supported by reviewed evidence. Partial, pending, needs-user and not-tested outcomes are counted separately.</p><hr><h3>Limits of this pilot</h3><p>One attempt per assistant. No general model ranking, comparable cost data, or cross-conversation memory test.</p><p>No purchase was placed.</p></div></aside>
    </div><section class="legacy-section"><div class="section-title"><h2>Earlier capability suite</h2><span>Separate evaluation</span></div><p>These tasks also required native skill evidence. Pass counts are not directly comparable to the Everyday pilot.</p><div class="table-wrap"><table class="legacy"><thead><tr><th scope="col">Original scenario</th>${names.map(name => `<th scope="col">${name}</th>`).join('')}</tr></thead><tbody>${data.original_suite.map(task => `<tr><th scope="row">${esc(task.task)}</th>${names.map(name => `<td>${esc(task[name])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section><p class="fineprint">${esc(data.scope_note)}</p>${reviewed()}`;
}

function route() {
  if (!data) return;
  hideTaskTooltip();
  const hash = location.hash.slice(1) || 'assistants';
  // The skip link moves focus without replacing the current view.
  if (hash === 'content') { content.focus(); return; }
  const name = names.find(item => hash === `assistant/${info[item].id}`);
  const view = name ? 'assistants' : ['compare', 'methodology'].includes(hash) ? hash : 'assistants';
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
  document.title = name ? `${name} — Assistant Benchmark` : view === 'compare' ? 'Compare assistants — Assistant Benchmark' : view === 'methodology' ? 'Methodology — Assistant Benchmark' : 'Assistant Benchmark — real-world results';
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
fetch('review.json?v=20261002-muse').then(response => {
  if (!response.ok) throw new Error('Results unavailable');
  return response.json();
}).then(result => {
  data = result;
  // A bookmarked skip-link hash still needs an initial page.
  if (location.hash === '#content') renderHome();
  route();
}).catch(() => {
  content.innerHTML = '<div class="empty-state"><h1>Results couldn’t load.</h1><p>Please refresh, or open the reviewed data directly.</p><a class="button" href="review.json">Open reviewed data</a></div>';
});
