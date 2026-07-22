// "Trace" režīma kontrolieris - šī prototipa mehānika (vilkšana pa ceļu).
// Savieno: data/registry.js (kuri burti/cipari), engine/drawing-engine.js
// (canvas + pointer), state/progress-store.js (saglabāšana).
// UI (chips, dots, hint bubble, celebrate overlay) tiek padots no āra
// (app.js), lai šis fails paliktu DOM-struktūras neatkarīgs, cik iespējams.

import { DrawingEngine } from '../engine/drawing-engine.js';
import { getItems } from '../data/registry.js';
import { progressStore } from '../state/progress-store.js';
import { registerMode } from './mode-registry.js';

const MODE_KEY = 'trace';
const BUG_EMOJI = '🐞';
const WATERMARK_FONT = "'Baloo 2', sans-serif";

export class TraceModeController {
  /**
   * @param {object} dom { canvas, hintBubble, celebrate, celebrateMsg, dots, chips }
   * @param {object} handlers { onScoreChange(score), onSetChange({setKey,items,index}) }
   */
  constructor(dom, handlers = {}) {
    this.dom = dom;
    this.handlers = handlers;
    this.setKey = 'letters';
    this.index = 0;
    this.items = [];

    this.engine = new DrawingEngine(dom.canvas, {
      bugEmoji: BUG_EMOJI,
      watermarkFont: WATERMARK_FONT,
      onHint: () => this._showHint(),
      onTreatCollected: (info) => this.handlers.onTreatsChange && this.handlers.onTreatsChange(info),
      onStrokeUnlocked: (strokeIdx, total) => this.handlers.onStrokeUnlocked && this.handlers.onStrokeUnlocked(strokeIdx, total),
      onLetterComplete: ({ treats }) => this._onComplete(treats),
    });
  }

  configure(setKey) {
    this.setKey = setKey;
    this.items = getItems(setKey);

    const ctx = progressStore.getSetProgress(MODE_KEY, setKey);
    let startIdx = 0;
    if (ctx.lastId) {
      const found = this.items.findIndex(it => it.id === ctx.lastId);
      if (found >= 0) startIdx = found;
    }
    this.loadIndex(startIdx);
  }

  loadIndex(i) {
    this.index = ((i % this.items.length) + this.items.length) % this.items.length;
    const item = this.items[this.index];
    this.engine.loadItem(item);
    this.dom.celebrate.classList.remove('show');
    progressStore.setLastId(MODE_KEY, this.setKey, item.id);
    this.handlers.onSetChange && this.handlers.onSetChange({
      setKey: this.setKey, items: this.items, index: this.index,
    });
  }

  isCompleted(id) {
    return progressStore.isCompleted(MODE_KEY, this.setKey, id);
  }

  _showHint() {
    const hb = this.dom.hintBubble;
    hb.classList.add('show');
    clearTimeout(this._hintTimer);
    this._hintTimer = setTimeout(() => hb.classList.remove('show'), 1400);
  }

  _onComplete(treats) {
    const item = this.items[this.index];
    const gained = treats + 1;
    progressStore.markCompleted(MODE_KEY, this.setKey, item.id);
    const score = progressStore.addScore(gained);
    this.handlers.onScoreChange && this.handlers.onScoreChange(score, gained);

    this.dom.celebrateMsg.textContent = `Lieliski! "${item.label}" pabeigts!`;
    this.dom.celebrate.classList.add('show');
    clearTimeout(this._nextTimer);
    this._nextTimer = setTimeout(() => this.loadIndex(this.index + 1), 1500);
  }

  destroy() {
    clearTimeout(this._hintTimer);
    clearTimeout(this._nextTimer);
    this.engine.destroy();
  }
}

registerMode({ key: MODE_KEY, title: 'Vilkšana pa ceļu' });
