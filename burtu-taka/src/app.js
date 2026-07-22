import { TraceModeController } from './modes/trace-mode.js';
import { SETS } from './data/registry.js';
import { progressStore } from './state/progress-store.js';

const dom = {
  canvas: document.getElementById('cv'),
  hintBubble: document.getElementById('hintBubble'),
  celebrate: document.getElementById('celebrate'),
  celebrateMsg: document.getElementById('celebrateMsg'),
  dots: document.getElementById('dots'),
  chips: document.getElementById('chips'),
  setTabs: document.getElementById('setTabs'),
  scoreVal: document.getElementById('scoreVal'),
};

dom.scoreVal.textContent = progressStore.getScore();

const controller = new TraceModeController(dom, {
  onScoreChange: (score) => { dom.scoreVal.textContent = score; },
  onTreatsChange: ({ collected, total }) => renderDots(collected, total),
  onSetChange: ({ setKey, index }) => {
    renderTabs(setKey);
    renderChips(setKey, index);
  },
});

function renderTabs(activeSetKey) {
  dom.setTabs.innerHTML = '';
  Object.values(SETS).forEach(set => {
    const b = document.createElement('button');
    b.className = 'setTab' + (set.key === activeSetKey ? ' active' : '');
    b.textContent = set.title;
    b.type = 'button';
    b.onclick = () => {
      if (set.key === controller.setKey) return;
      controller.configure(set.key);
    };
    dom.setTabs.appendChild(b);
  });
}

function renderChips(setKey, activeIndex) {
  dom.chips.innerHTML = '';
  controller.items.forEach((item, i) => {
    const b = document.createElement('button');
    b.className = 'chip' + (i === activeIndex ? ' active' : '') + (controller.isCompleted(item.id) ? ' done' : '');
    b.textContent = item.label;
    b.type = 'button';
    b.onclick = () => controller.loadIndex(i);
    dom.chips.appendChild(b);
  });
}

function renderDots(collected, total) {
  dom.dots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < collected ? ' filled' : '');
    dom.dots.appendChild(d);
  }
}

// -------- init --------
const last = progressStore.getLastContext();
const startSetKey = last.setKey && SETS[last.setKey] ? last.setKey : 'letters';
controller.configure(startSetKey);

// -------- PWA service worker --------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
