const DATA = window.WENTWORTH_DATA;
const SCREENS = ['home', 'rooms', 'goal', 'level', 'plan', 'sources'];
const STEP_NUMBER = { rooms: 1, goal: 2, level: 3 };
const STATE_KEY = 'wentworth-planner-session-v1';
const SAVE_KEY = 'wentworth-saved-plan-v1';
const app = document.getElementById('app');

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
let state = { room: null, goal: null, level: null, ticks: {}, ...readJSON(STATE_KEY, {}) };
let screen = SCREENS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';

function persist() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
function room() { return DATA.rooms.find(item => item.id === state.room); }
function goal() { return DATA.goals.find(item => item.id === state.goal); }
function level() { return DATA.levels.find(item => item.id === state.level); }
function planActions(item, goalId, levelId) {
  const ordered = scope => item.actions.filter(action => action.scope === scope)
    .sort((a, b) => a.priority[goalId] - b.priority[goalId] || item.actions.indexOf(a) - item.actions.indexOf(b));
  const small = ordered('small');
  const diy = ordered('diy');
  const bigger = ordered('bigger');
  const selected = levelId === 'small' ? small.slice(0, 3)
    : levelId === 'diy' ? [...small.slice(0, 2), ...diy]
    : [...small.slice(0, 2), diy[0], ...bigger];
  return selected.sort((a, b) => a.priority[goalId] - b.priority[goalId]
    || ({ small: 0, diy: 1, bigger: 2 })[a.scope] - ({ small: 0, diy: 1, bigger: 2 })[b.scope]);
}
function tickKey(action) { return `${state.room}-${state.goal}-${state.level}-${action.id}`; }
function image(src, alt, className = '') { return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy">`; }
function escapeHTML(value = '') { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }

function navigate(next) {
  screen = next;
  if (location.hash !== `#${next}`) location.hash = next;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function chrome(content) {
  return `<div class="site-shell">
    <header class="site-header">
      <button class="brand" data-nav="home" aria-label="Our Wentworth Diaries home"><span class="brand-mark">W</span><span class="brand-text">our wentworth<br><em>diaries</em></span></button>
      <span class="header-edition">THE ROOM EDIT <span>·</span> 01</span>
    </header>
    <main id="main-content">${content}</main>
    <footer class="site-footer"><span>OUR WENTWORTH DIARIES</span><span>Real rooms. Thoughtful changes.</span></footer>
  </div>`;
}

function stepHeader(title, intro) {
  return `<div class="step-top"><button class="text-back" data-back aria-label="Go back"><span aria-hidden="true">←</span> Back</button><span class="step-count">0${STEP_NUMBER[screen]} / 03</span></div>
    <div class="step-intro"><p class="eyebrow">THE ROOM MAKEOVER PLANNER</p><h1>${title}</h1><p>${intro}</p></div>`;
}

function homeView() {
  const saved = readJSON(SAVE_KEY, null);
  return chrome(`<section class="home-layout">
    <div class="home-copy">
      <p class="eyebrow">A HOME WITH A STORY</p>
      <h1>Make room for<br><em>the little changes.</em></h1>
      <p class="home-lede">A practical room refresh inspired by the colours, materials and real projects in Helen’s home.</p>
      <button class="button button-dark" data-nav="rooms">Plan your room <span aria-hidden="true">↗</span></button>
      ${saved?.room && saved?.goal && saved?.level ? `<button class="home-resume" data-resume>Return to your saved plan <span aria-hidden="true">↗</span></button>` : ''}
      <div class="home-footnote"><span class="rule-line"></span><span>COLOUR · SOURCES · DIY · REAL PROJECT NOTES</span></div>
    </div>
    <div class="home-photo-wrap">${image('assets/bedroom/bedroom-bedding-green-panelling.jpg', 'Helen’s bedroom with green panelling, layered bedding and warm lamps', 'home-photo')}<span class="photo-credit">IN HELEN’S HOME — THE BEDROOM</span></div>
  </section>`);
}

function roomsView() {
  return chrome(`<section class="step-page rooms-page">
    ${stepHeader('Which room is on your mind?', 'Choose a space to explore through Helen’s real projects.')}
    <div class="room-grid">${DATA.rooms.map(item => `<button class="room-tile" data-room="${item.id}" aria-label="Choose ${item.title}">
      ${image(item.cardImage, item.summary)}<span class="room-tile-content"><span class="room-tile-eyebrow">${item.eyebrow}</span><strong>${item.title}</strong><span class="room-tile-arrow" aria-hidden="true">↗</span></span>
    </button>`).join('')}</div>
    <p class="page-end-note">Each room is drawn from projects shown in Helen’s home.</p>
  </section>`);
}

function goalView() {
  const item = room();
  return chrome(`<section class="step-page question-layout">
    <div>${stepHeader('What would you love to improve?', `Thinking about your ${item.title.toLowerCase()}, choose the change that matters most right now.`)}
      <div class="mobile-room-strip">${image(item.detailImage, `A detail from Helen’s ${item.title.toLowerCase()}`)}<span>FROM HELEN’S ${item.title.toUpperCase()}</span></div>
      <div class="choice-list">${DATA.goals.map((choice, index) => `<button class="choice-row ${state.goal === choice.id ? 'is-selected' : ''}" data-goal="${choice.id}" aria-pressed="${state.goal === choice.id}"><span class="choice-number">0${index + 1}</span><span class="choice-copy"><strong>${choice.title}</strong><small>${choice.detail}</small></span><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
    </div>
    <aside class="question-aside">${image(item.detailImage, `A detail from Helen’s ${item.title.toLowerCase()}`, 'aside-image')}<p>FROM HELEN’S ${item.title.toUpperCase()}</p></aside>
  </section>`);
}

function levelView() {
  const item = room();
  return chrome(`<section class="step-page question-layout">
    <div>${stepHeader('How far would you like to go?', 'Pick a project level. You can change it whenever you like.')}
      <div class="mobile-room-strip">${image(item.heroImage, `Helen’s ${item.title.toLowerCase()}`)}<span>FROM HELEN’S ${item.title.toUpperCase()}</span></div>
      <div class="level-list">${DATA.levels.map((choice, index) => `<button class="level-row ${state.level === choice.id ? 'is-selected' : ''}" data-level="${choice.id}" aria-pressed="${state.level === choice.id}"><span class="level-number">0${index + 1}</span><span><strong>${choice.title}</strong><small>${choice.detail}</small></span><span class="level-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
      <p class="level-note">Documented project costs appear in your plan as Helen’s past examples, not prices for your room.</p>
    </div><aside class="question-aside">${image(item.heroImage, `Helen’s ${item.title.toLowerCase()}`, 'aside-image')}<p>ONE ROOM, MANY WAYS TO BEGIN</p></aside>
  </section>`);
}

function sectionHead(number, title, sub = '') { return `<div class="section-head"><span class="section-number">${number}</span><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div></div>`; }

function sourceCard(record, compact = false) {
  const exact = record.sourceType === 'exact';
  const status = exact ? 'Documented in Helen’s content' : 'Style inspiration';
  return `<article class="source-card ${compact ? 'source-card-compact' : ''}">
    ${image(record.image, `${record.name} in Helen’s home`, 'source-image')}
    <div class="source-body"><span class="source-kicker">${exact ? 'EXACT SOURCE' : 'GET THE LOOK'} <span aria-hidden="true">·</span> ${escapeHTML(record.category.toUpperCase())}</span>
      <h3>${escapeHTML(record.brand ? `${record.brand} ${record.name}` : record.name)}</h3>
      <p>${escapeHTML(record.helenContext)}</p>
      <span class="source-status">${status}</span>
      ${!compact ? `<p class="source-note">${escapeHTML(record.notes)}</p>` : ''}
      ${record.sourcePostUrl ? `<a class="inline-link" href="${record.sourcePostUrl}" target="_blank" rel="noopener noreferrer">View original post <span aria-hidden="true">↗</span></a>` : ''}
      ${record.retailerProductUrl ? `<a class="inline-link" href="${record.retailerProductUrl}" target="_blank" rel="noopener noreferrer">View product <span aria-hidden="true">↗</span></a>` : ''}
    </div>
  </article>`;
}

function planView() {
  const item = room();
  const chosenGoal = goal();
  const chosenLevel = level();
  const actions = planActions(item, state.goal, state.level);
  const sources = item.sourceIds.map(id => DATA.sources.find(source => source.id === id));
  const saved = readJSON(SAVE_KEY, null);
  const isSaved = saved && saved.room === state.room && saved.goal === state.goal && saved.level === state.level;
  return chrome(`<div class="plan-page">
    <div class="plan-toolbar"><button class="text-back" data-nav="level">← Edit choices</button><span>YOUR ROOM EDIT</span></div>
    <section class="plan-hero"><div class="plan-hero-copy"><p class="eyebrow">OUR WENTWORTH DIARIES · ROOM PLAN</p><h1>Your <em>${item.title}</em><br>plan.</h1><p>${item.intro}</p><div class="selection-summary"><span>${chosenGoal.title}</span><span>${chosenLevel.title}</span></div></div>${image(item.heroImage, `Helen’s ${item.title.toLowerCase()} project`, 'plan-hero-image')}</section>
    <div class="plan-content">
      <section class="plan-section start-section">${sectionHead('01', 'Start Here')}<div class="start-content"><p class="large-action">${item.starts[state.goal]}</p><p class="scope-eyebrow">${chosenLevel.title.toUpperCase()} SCOPE</p><p class="level-guidance">${item.scopeNotes[state.level]}</p></div></section>
      <section class="plan-section">${sectionHead('02', 'Colour Palette', 'A real room as the reference; exact names are labelled.')}
        <div class="palette-photo">${image(item.detailImage, `Colour and materials in Helen’s ${item.title.toLowerCase()}`)}<span>COLOUR IN CONTEXT</span></div>
        <div class="palette-list">${item.palette.map(colour => `<div class="palette-item"><span class="swatch" style="background:${colour.colour}"></span><div><h3>${colour.name}</h3><p>${colour.detail}</p></div><span class="palette-type">${colour.exact ? 'NAMED IN POST' : 'VISUAL REFERENCE'}</span></div>`).join('')}</div>
      </section>
      <section class="plan-section">${sectionHead('03', 'Practical Changes')}<ol class="changes-list">${actions.map(action => `<li><span class="action-scope">${({ small: 'SMALL CHANGE', diy: 'DIY PROJECT', bigger: 'BIGGER UPGRADE' })[action.scope]}</span>${action.text}</li>`).join('')}</ol></section>
      <section class="plan-section">${sectionHead('04', 'DIY / Materials')}<p class="body-copy">${item.materialsByLevel[state.level]}</p></section>
      <section class="plan-section">${sectionHead('05', 'Sources & Details', 'Documented sources are marked separately from broader style ideas.')}
        <div class="source-stack">${sources.slice(0, 2).map(source => sourceCard(source, true)).join('')}</div>
        <button class="inline-button" data-nav="sources">See all sources & details <span aria-hidden="true">↗</span></button>
      </section>
      <section class="plan-section project-note-section">${sectionHead('06', 'Real Project Notes')}<p class="body-copy">${item.note}</p><a class="inline-link" href="${item.noteUrl}" target="_blank" rel="noopener noreferrer">View Helen’s original post <span aria-hidden="true">↗</span></a></section>
      <section class="plan-section checklist-section">${sectionHead('07', 'Shopping / Sourcing Checklist', 'A few things to check as you make the plan your own.')}
        <div class="checklist">${actions.map(action => `<label class="check-row"><input type="checkbox" data-check="${action.id}" ${state.ticks[tickKey(action)] ? 'checked' : ''}><span class="fake-check" aria-hidden="true"></span><span>${action.check}</span></label>`).join('')}</div>
      </section>
      <div class="plan-actions"><button class="button button-dark" data-save>${isSaved ? 'Plan saved on this device' : 'Save this plan'} <span aria-hidden="true">${isSaved ? '✓' : '↗'}</span></button><button class="button button-outline" data-nav="rooms">Explore another room</button></div>
      <p class="closing-note">Inspired by Helen’s documented projects. Try samples, check measurements and choose what works in your own home.</p>
    </div>
  </div>`);
}

function sourcesView() {
  const item = room();
  const records = item.sourceIds.map(id => DATA.sources.find(source => source.id === id));
  const exact = records.filter(record => record.sourceType === 'exact');
  const look = records.filter(record => record.sourceType === 'look');
  return chrome(`<section class="sources-page"><div class="sources-top"><button class="text-back" data-nav="plan">← Back to your plan</button><span>THE ROOM EDIT / SOURCES</span></div>
    <div class="sources-title"><p class="eyebrow">FROM HELEN’S PROJECTS</p><h1>Sources <em>& details.</em></h1><p>What the posts identify, and the broader ideas to take from the room. Product links and availability are shown only when documented.</p></div>
    <div class="sources-hero">${image(item.heroImage, `Helen’s ${item.title.toLowerCase()}`)}<div><span>IN HELEN’S HOME</span><strong>${item.title}</strong></div></div>
    ${exact.length ? `<section class="sources-group">${sectionHead('A', 'Exact Sources', 'Names or items documented in Helen’s content. These are not endorsements.')}${exact.map(record => sourceCard(record)).join('')}</section>` : ''}
    ${look.length ? `<section class="sources-group">${sectionHead('B', 'Get the Look', 'General materials or styling directions; no exact product is claimed.')}${look.map(record => sourceCard(record)).join('')}</section>` : ''}
    <section class="evidence-note"><h2>About these details</h2><p>${item.evidenceNote}</p><a class="inline-link" href="${item.noteUrl}" target="_blank" rel="noopener noreferrer">View project post <span aria-hidden="true">↗</span></a></section>
    <div class="sources-bottom"><button class="button button-dark" data-nav="plan">Back to room plan <span aria-hidden="true">↗</span></button></div>
  </section>`);
}

function render() {
  if (['goal', 'level', 'plan', 'sources'].includes(screen) && !room()) screen = 'rooms';
  if (['level', 'plan', 'sources'].includes(screen) && !goal()) screen = 'goal';
  if (['plan', 'sources'].includes(screen) && !level()) screen = 'level';
  const views = { home: homeView, rooms: roomsView, goal: goalView, level: levelView, plan: planView, sources: sourcesView };
  app.innerHTML = views[screen]();
  document.title = `${screen === 'home' ? 'Room Makeover Planner' : ({ rooms: 'Choose a Room', goal: 'Choose Your Goal', level: 'Project Level', plan: 'Your Room Plan', sources: 'Sources & Details' })[screen]} · Our Wentworth Diaries`;
}

app.addEventListener('click', event => {
  if (event.target.closest('[data-resume]')) {
    const saved = readJSON(SAVE_KEY, null);
    if (saved) { state = { ...state, ...saved }; persist(); navigate('plan'); }
    return;
  }
  const nav = event.target.closest('[data-nav]');
  if (nav) { navigate(nav.dataset.nav); return; }
  const back = event.target.closest('[data-back]');
  if (back) { navigate(({ rooms: 'home', goal: 'rooms', level: 'goal' })[screen] || 'home'); return; }
  const chosenRoom = event.target.closest('[data-room]');
  if (chosenRoom) { state.room = chosenRoom.dataset.room; state.goal = null; state.level = null; state.ticks = {}; persist(); navigate('goal'); return; }
  const chosenGoal = event.target.closest('[data-goal]');
  if (chosenGoal) { state.goal = chosenGoal.dataset.goal; state.level = null; persist(); navigate('level'); return; }
  const chosenLevel = event.target.closest('[data-level]');
  if (chosenLevel) { state.level = chosenLevel.dataset.level; persist(); navigate('plan'); return; }
  if (event.target.closest('[data-save]')) {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ room: state.room, goal: state.goal, level: state.level, ticks: state.ticks }));
    render();
  }
});
app.addEventListener('change', event => {
  if (event.target.matches('[data-check]')) {
    state.ticks[`${state.room}-${state.goal}-${state.level}-${event.target.dataset.check}`] = event.target.checked;
    persist();
    const saved = readJSON(SAVE_KEY, null);
    if (saved && saved.room === state.room && saved.goal === state.goal && saved.level === state.level) {
      saved.ticks = state.ticks;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
    }
  }
});
window.addEventListener('hashchange', () => {
  const next = location.hash.slice(1);
  if (SCREENS.includes(next) && next !== screen) { screen = next; render(); window.scrollTo(0, 0); }
});
render();
