/* Queen Taste & Pub — Menu interactions
   - Renders the category grid
   - Lightbox viewer with swipe (left/right) + keyboard + dots
   - Pinch-zoom is handled natively by the browser via touch-action: pinch-zoom
*/

const CATEGORIES = [
  { num: '01', title: 'Coffee Zip',         sub: 'Iced & hot coffee',                file: 'images/01-coffee.jpg' },
  { num: '02', title: "Iced Tea's",         sub: 'Herbal · black · fruit · green',   file: 'images/02-iced-tea.jpg' },
  { num: '03', title: 'Delights & Bites',   sub: 'Ice Talk · sodas · appetizers',    file: 'images/09-delights-bites.jpg' },
  { num: '04', title: 'K-Noodle Series',    sub: 'Buldak · Samyang · Ramyun',        file: 'images/03-k-noodle.jpg' },
  { num: '05', title: 'Shorts Orders',      sub: 'Japchae · chicken · rice',         file: 'images/04-shorts-orders.jpg' },
  { num: '06', title: 'Silog & Rice',       sub: 'Tosilog · bibimbap · katsu',       file: 'images/05-silog-rice.jpg' },
  { num: '07', title: 'Sizzling Plates',    sub: 'Sisig · pork chop · barkada',      file: 'images/08-sizzling.jpg' },
  { num: '08', title: 'Siesta',             sub: 'Tteokbokki · kimbap · fries',      file: 'images/07-siesta.jpg' },
  { num: '09', title: 'Ice & Chill',        sub: 'Beers · soju · pulutan',           file: 'images/06-ice-chill.jpg' },
];

const grid     = document.getElementById('grid');
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

/* ===== RENDER CARDS ===== */
function renderGrid() {
  const html = CATEGORIES.map((c, i) => `
    <button class="card" data-idx="${i}" aria-label="View ${c.title} menu">
      <div class="card-img" style="background-image:url('${c.file}')"></div>
      <div class="card-veil"></div>
      <div class="card-corner" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>
      <div class="card-body">
        <span class="card-num">№ ${c.num}</span>
        <span class="card-title">${c.title}</span>
        <span class="card-sub">${c.sub}</span>
      </div>
    </button>
  `).join('');
  grid.innerHTML = html;

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openLightbox(parseInt(card.dataset.idx, 10)));
  });
}

/* ===== LIGHTBOX ===== */
function openLightbox(idx) {
  currentIdx = idx;
  renderDots();
  showCurrent();
  lightbox.hidden = false;
  document.body.classList.add('lb-open');
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove('lb-open');
}

function showCurrent() {
  const c = CATEGORIES[currentIdx];
  lbImg.src   = c.file;
  lbImg.alt   = `${c.title} menu`;
  lbTitle.textContent = c.title;
  lbCount.textContent = `${currentIdx + 1} / ${CATEGORIES.length}`;
  lbDots.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentIdx);
  });
}

function next() { currentIdx = (currentIdx + 1) % CATEGORIES.length; showCurrent(); }
function prev() { currentIdx = (currentIdx - 1 + CATEGORIES.length) % CATEGORIES.length; showCurrent(); }

function renderDots() {
  lbDots.innerHTML = CATEGORIES.map((_, i) => `<span class="dot" data-i="${i}"></span>`).join('');
  lbDots.querySelectorAll('.dot').forEach(d => {
    d.addEventListener('click', e => {
      currentIdx = parseInt(e.currentTarget.dataset.i, 10);
      showCurrent();
    });
  });
}

/* ===== SWIPE ===== */
let touchStartX = 0, touchStartY = 0, touchStartT = 0;
let pointerActive = false;

lbStage.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return; // ignore pinch
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartT = Date.now();
  pointerActive = true;
}, { passive: true });

lbStage.addEventListener('touchend', (e) => {
  if (!pointerActive) return;
  pointerActive = false;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  const dt = Date.now() - touchStartT;

  // ignore if it's a tap, slow drag, or mostly vertical
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) || dt > 600) return;

  if (dx < 0) next(); else prev();
}, { passive: true });

/* ===== CONTROLS ===== */
lbClose.addEventListener('click', closeLightbox);
lbPrev .addEventListener('click', prev);
lbNext .addEventListener('click', next);

document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prev();
  if (e.key === 'ArrowRight')  next();
});

/* ===== INIT ===== */
renderGrid();
