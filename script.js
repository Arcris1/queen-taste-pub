/* Queen Taste & Pub — menu pages
   Renders the two category shelves plus the Ice & Chill card,
   and drives the full-size page viewer (swipe · arrows · dots).
   Pinch-zoom is left to the browser via touch-action: pinch-zoom.
*/

const PAGES = [
  { group: 'sip', title: 'Coffee Zip',        sub: 'Iced &amp; hot coffee, hot choco',        file: 'images/coffee-zip.jpg' },
  { group: 'sip', title: "Iced Tea's",        sub: 'Herbal, black, fruit &amp; green tea',    file: 'images/iced-tea.jpg' },
  { group: 'sip', title: 'Tea Selection',     sub: 'Offblak loose-leaf blends',           file: 'images/tea-selection.jpg' },
  { group: 'sip', title: 'Delights &amp; Bites', sub: 'Ice Talk ades, drinks, appetizers',   file: 'images/delights-bites.jpg' },

  { group: 'eat', title: 'K-Noodle Series',   sub: 'Buldak, Samyang, Jin Ramen, pho',     file: 'images/k-noodle.jpg' },
  { group: 'eat', title: 'Short Orders',      sub: 'Japchae, chopsuey, chicken, kare-kare', file: 'images/short-orders.jpg' },
  { group: 'eat', title: 'Silog Rice Meals',  sub: 'Longsilog, tosilog, bangsilog',       file: 'images/silog-rice.jpg' },
  { group: 'eat', title: 'Korean Rice Meals', sub: 'Bibimbap, bulgogi, katsu',            file: 'images/korean-rice.jpg' },
  { group: 'eat', title: 'Sizzling Plates',   sub: 'Sisig, pork chop, barkada platters',  file: 'images/sizzling.jpg' },
  { group: 'eat', title: 'Siesta',            sub: 'Tteokbokki, kimbap, mandu, fries',    file: 'images/siesta.jpg' },

  { group: 'chill', title: 'Ice &amp; Chill', sub: 'Beers, soju, mojito and pulutan bundles', file: 'images/ice-chill.jpg' },
];

const gridSip     = document.getElementById('gridSip');
const gridEat     = document.getElementById('gridEat');
const featureSlot = document.getElementById('featureSlot');

const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbTitle  = document.getElementById('lbTitle');
const lbCount  = document.getElementById('lbCounter');
const lbDots   = document.getElementById('lbDots');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');
const lbStage  = document.getElementById('lbStage');

let currentIdx = 0;
let lastFocused = null;

/* strip entities so a title reads correctly inside an alt/aria attribute */
const plain = (s) => s.replace(/&amp;/g, '&');

/* ===== RENDER ===== */

/* `delay` is the reveal step for cards above the fold; null skips the animation
   for cards the visitor scrolls to, which have long finished by the time they land */
function cardHTML(page, idx, delay) {
  const cls   = delay === null ? 'card' : 'card reveal';
  const style = delay === null ? '' : `style="--i:${delay}"`;
  return `
    <button class="${cls}" ${style} data-idx="${idx}"
            aria-label="Open the ${plain(page.title)} menu page">
      <span class="card-page">
        <img src="${page.file}" alt="" loading="lazy" decoding="async"
             width="1127" height="1600" />
      </span>
      <span class="card-label">
        <span class="card-title">${page.title}</span>
        <span class="card-sub">${page.sub}</span>
      </span>
    </button>`;
}

function featureHTML(page, idx) {
  return `
    <button class="feature" data-idx="${idx}"
            aria-label="Open the ${plain(page.title)} menu page">
      <span class="card-page">
        <img src="${page.file}" alt="" loading="lazy" decoding="async"
             width="1127" height="1600" />
      </span>
      <span class="feature-body">
        <span class="feature-title">${page.title}</span>
        <span class="feature-sub">${page.sub}</span>
        <span class="feature-cue">
          Open the page
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </span>
      </span>
    </button>`;
}

function render() {
  const sip = [], eat = [];

  PAGES.forEach((page, idx) => {
    if (page.group === 'sip')        sip.push(cardHTML(page, idx, sip.length + 3));
    else if (page.group === 'eat')   eat.push(cardHTML(page, idx, null));
    else                             featureSlot.innerHTML = featureHTML(page, idx);
  });

  gridSip.innerHTML = sip.join('');
  gridEat.innerHTML = eat.join('');

  document.querySelectorAll('[data-idx]').forEach(el => {
    el.addEventListener('click', () => openViewer(Number(el.dataset.idx)));
  });
}

/* ===== FULL-SIZE VIEWER ===== */

function openViewer(idx) {
  lastFocused = document.activeElement;
  currentIdx = idx;
  renderDots();
  showCurrent();
  lightbox.hidden = false;
  document.body.classList.add('lb-open');
  lbClose.focus();
}

function closeViewer() {
  lightbox.hidden = true;
  document.body.classList.remove('lb-open');
  if (lastFocused) lastFocused.focus();
}

function showCurrent() {
  const page = PAGES[currentIdx];
  lbImg.src = page.file;
  lbImg.alt = `${plain(page.title)} menu page`;
  lbTitle.innerHTML = page.title;
  lbCount.textContent = `${currentIdx + 1} / ${PAGES.length}`;
  lbDots.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentIdx);
  });
}

function next() { currentIdx = (currentIdx + 1) % PAGES.length; showCurrent(); }
function prev() { currentIdx = (currentIdx - 1 + PAGES.length) % PAGES.length; showCurrent(); }

/* Position indicators. Kept out of the accessibility tree — the counter
   announces position and the prev/next buttons do the same job with labels. */
function renderDots() {
  lbDots.innerHTML = PAGES.map((_, i) => `<span class="dot" data-i="${i}"></span>`).join('');
  lbDots.querySelectorAll('.dot').forEach(d => {
    d.addEventListener('click', e => {
      currentIdx = Number(e.currentTarget.dataset.i);
      showCurrent();
    });
  });
}

/* ===== SWIPE ===== */

let startX = 0, startY = 0, startT = 0, tracking = false;

lbStage.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) { tracking = false; return; }  // ignore pinch
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  startT = Date.now();
  tracking = true;
}, { passive: true });

lbStage.addEventListener('touchend', (e) => {
  if (!tracking) return;
  tracking = false;
  const t  = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  // ignore taps, slow drags, mostly-vertical moves, and zoomed panning
  if (Math.abs(dx) < 60) return;
  if (Math.abs(dx) < Math.abs(dy)) return;
  if (Date.now() - startT > 600) return;
  if (window.visualViewport && window.visualViewport.scale > 1.05) return;

  if (dx < 0) next(); else prev();
}, { passive: true });

/* ===== CONTROLS ===== */

lbClose.addEventListener('click', closeViewer);
lbPrev.addEventListener('click', prev);
lbNext.addEventListener('click', next);

document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeViewer();
  if (e.key === 'ArrowLeft')  prev();
  if (e.key === 'ArrowRight') next();
});

render();
