// Trace engine: canvas zīmēšana + pointer mijiedarbība burta/cipara ceļam.
// Nezina neko par burtu SARAKSTU vai progresa saglabāšanu - strādā ar
// vienu `item` (no data/registry.js), izsauc callbacks uz āru.
// Atbalsta vairāk-svītru burtus: katra svītra jāpabeidz, pirms nākamā
// kļūst aktīva; agrākas svītras paliek uzzīmētas kā pabeigtas.

const HIT_RADIUS = 0.10;      // normalizētās vienībās (0-1)
const START_RADIUS = 0.11;
const TREAT_FRACS = [0.28, 0.55, 0.8];

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function angleAt(points, i) {
  const a = points[Math.max(0, i - 1)];
  const b = points[Math.min(points.length - 1, i + 1)];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function treatIndices(len) {
  if (len < 8) return [Math.round(len * 0.5)];
  return TREAT_FRACS.map(f => Math.round(len * f));
}

export class DrawingEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} opts { bugEmoji, watermarkFont, onLetterComplete, onTreatCollected, onHint, onStrokeUnlocked }
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = opts;
    this.W = canvas.width;
    this.H = canvas.height;
    this.dragging = false;
    this._raf = null;
    this._t0 = performance.now();

    canvas.addEventListener('pointerdown', this._onDown.bind(this));
    canvas.addEventListener('pointermove', this._onMove.bind(this));
    canvas.addEventListener('pointerup', this._onUp.bind(this));
    canvas.addEventListener('pointercancel', this._onUp.bind(this));

    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  loadItem(item) {
    this.item = item;
    this.strokeIdx = 0;
    this.bankedTreats = 0;
    this.attemptTreats = 0;
    this.finished = false;
    this.dragging = false;
    this.strokes = item.strokes.map(s => {
      const pts = s.points;
      const idxs = treatIndices(pts.length - 1);
      return {
        points: pts,
        treats: idxs.map(idx => ({ idx, collected: false })),
        progress: 0,
        done: false,
      };
    });
    this.totalTreats = this.strokes.reduce((sum, s) => sum + s.treats.length, 0);
    this._draw();
    this._emitTreats();
  }

  get activeStroke() { return this.strokes[this.strokeIdx]; }

  getTreatsInfo() {
    return { collected: this.bankedTreats + this.attemptTreats, total: this.totalTreats };
  }

  _emitTreats() {
    this.opts.onTreatCollected && this.opts.onTreatCollected(this.getTreatsInfo());
  }

  _toCanvas(p) { return { x: p.x * this.W, y: p.y * this.H }; }

  _getPos(e) {
    const r = this.canvas.getBoundingClientRect();
    const scaleX = this.W / r.width, scaleY = this.H / r.height;
    return { x: (e.clientX - r.left) * scaleX / this.W, y: (e.clientY - r.top) * scaleY / this.H };
  }

  _onDown(e) {
    if (this.finished || !this.item) return;
    this.canvas.setPointerCapture(e.pointerId);
    const pos = this._getPos(e);
    const s = this.activeStroke;
    if (s.progress === 0 && dist(pos, s.points[0]) > START_RADIUS) {
      this.opts.onHint && this.opts.onHint();
    }
    this.dragging = true;
  }

  _onMove(e) {
    if (!this.dragging || this.finished || !this.item) return;
    const pos = this._getPos(e);
    const s = this.activeStroke;
    let advanced = false, guard = 0;
    while (s.progress < s.points.length - 1 && dist(pos, s.points[s.progress + 1]) < HIT_RADIUS && guard < 10) {
      s.progress++;
      guard++;
      advanced = true;
      s.treats.forEach(t => {
        if (!t.collected && t.idx <= s.progress) {
          t.collected = true;
          this.attemptTreats++;
          this._emitTreats();
        }
      });
    }
    if (advanced) this._draw();
    if (s.progress >= s.points.length - 1) this._finishStroke();
  }

  _onUp() {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.finished) return;
    const s = this.activeStroke;
    if (s.progress < s.points.length - 1) {
      s.progress = 0;
      s.treats.forEach(t => (t.collected = false));
      this.attemptTreats = 0;
      this._draw();
      this._emitTreats();
    }
  }

  _finishStroke() {
    this.dragging = false;
    const s = this.activeStroke;
    s.done = true;
    this.bankedTreats += this.attemptTreats;
    this.attemptTreats = 0;
    this._emitTreats();
    if (this.strokeIdx < this.strokes.length - 1) {
      this.strokeIdx++;
      this.opts.onStrokeUnlocked && this.opts.onStrokeUnlocked(this.strokeIdx, this.strokes.length);
      this._draw();
    } else {
      this.finished = true;
      const totalTreats = this.bankedTreats;
      this._draw();
      this.opts.onLetterComplete && this.opts.onLetterComplete({ treats: totalTreats });
    }
  }

  _loop() {
    if (!this.dragging) this._draw();
    this._raf = requestAnimationFrame(this._loop);
  }

  _draw() {
    const { ctx, W, H, item } = this;
    if (!item) return;
    const t = (performance.now() - this._t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // ūdenszīme
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.font = `800 ${Math.round(H * 0.62)}px ${this.opts.watermarkFont || "'Baloo 2', sans-serif"}`;
    ctx.fillStyle = '#4C7C2A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, W / 2, H / 2 + H * 0.02);
    ctx.restore();

    this.strokes.forEach((s, i) => {
      const pts = s.points.map(p => this._toCanvas(p));

      // punktētā vadlīnija (tikai neaktīvai/aktīvai, nevis jau pabeigtai svītrai - tā paliek zaļa)
      if (!s.done) {
        ctx.save();
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = H * 0.024;
        ctx.strokeStyle = i === this.strokeIdx ? 'rgba(76,124,42,0.28)' : 'rgba(76,124,42,0.12)';
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach((p, j) => (j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.restore();
      }

      // virziena bultas tikai aktīvajai svītrai
      if (i === this.strokeIdx && !s.done) {
        [0.3, 0.7].forEach(f => {
          const idx = Math.round((pts.length - 1) * f);
          this._drawArrow(pts[idx], angleAt(pts, idx));
        });
      }

      // pabeigtais / progresa trail
      const progress = s.done ? pts.length - 1 : s.progress;
      if (progress > 0 || s.done) {
        ctx.save();
        ctx.lineWidth = H * 0.028;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = s.done ? '#5FBF6B' : '#E63946';
        ctx.beginPath();
        pts.slice(0, progress + 1).forEach((p, j) => (j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.restore();
      }

      // start marker (tikai aktīvajai nepabeigtajai svītrai, pulsē)
      if (i === this.strokeIdx && !s.done) {
        this._drawStartMarker(pts[0], s.progress === 0, t);
      }
      // finish marker beidzamajai svītrai
      if (i === this.strokes.length - 1) {
        ctx.save();
        ctx.font = `${Math.round(H * 0.052)}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🌼', pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.restore();
      }

      // treats
      if (!s.done) {
        s.treats.forEach(tr => {
          if (tr.collected) return;
          const p = pts[tr.idx];
          ctx.save();
          ctx.font = `${Math.round(H * 0.062)}px serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('🍓', p.x, p.y);
          ctx.restore();
        });
      }
    });

    // kukainis aktīvās svītras pozīcijā (vai pēdējā pozīcijā, ja pabeigts)
    const activeIdx = this.finished ? this.strokes.length - 1 : this.strokeIdx;
    const s = this.strokes[activeIdx];
    const pts = s.points.map(p => this._toCanvas(p));
    const progress = this.finished ? pts.length - 1 : s.progress;
    const bp = pts[progress];
    const ang = angleAt(pts, progress);
    const bob = this.dragging ? 0 : Math.sin(t * 2.4) * H * 0.006;
    ctx.save();
    ctx.translate(bp.x, bp.y + bob);
    ctx.rotate(ang + Math.PI / 2);
    ctx.font = `${Math.round(H * 0.08)}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.opts.bugEmoji || '🐞', 0, 0);
    ctx.restore();
  }

  _drawArrow(p, ang) {
    const { ctx, H } = this;
    const size = H * 0.031;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    ctx.fillStyle = 'rgba(76,124,42,0.55)';
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.6, size * 0.7);
    ctx.lineTo(-size * 0.6, -size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawStartMarker(p, pulse, t) {
    const { ctx, H } = this;
    const base = H * 0.048;
    const r = pulse ? base + Math.sin(t * 3.4) * H * 0.012 : base * 0.7;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = pulse ? 'rgba(230,57,70,0.28)' : 'rgba(230,57,70,0.12)';
    ctx.fill();
    ctx.restore();
  }
}
