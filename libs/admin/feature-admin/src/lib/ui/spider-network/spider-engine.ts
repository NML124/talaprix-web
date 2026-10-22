/**
 * SpiderEngine — animation "araignée de données" en Canvas 2D.
 * Aucune dépendance (ni Angular, ni lib). Utilisable partout.
 *
 * Principe :
 *  - un CORPS (carré arrondi avec 6 points) qui se déplace doucement (errance ou suit la souris)
 *  - des PATTES = arcs de Bézier quadratiques en POINTILLÉS, qui s'étirent vers un point (nœud rose),
 *    restent "plantées" dans le monde pendant que le corps bouge, puis se rétractent et se replantent ailleurs
 *  - quelques pattes "LECTRICES" = arcs pleins blancs, plus longs, avec une étiquette au bout
 *  - des impulsions lumineuses remontent des nœuds vers le corps (données qui arrivent)
 */

export interface SpiderOptions {
  /** Couleur des pattes pointillées et des nœuds */
  legColor?: string;
  /** Couleur du contour/points du corps */
  bodyColor?: string;
  /** Couleur de remplissage du corps */
  bodyFill?: string;
  /** Couleur des étiquettes, du texte et du halo */
  labelFill?: string;
  labelText?: string;
  bodyGlow?: string;
  bodyDot?: string;
  /** Couleur des pattes lectrices (arcs pleins) */
  readerColor?: string;
  /** Nombre de pattes pointillées */
  legCount?: number;
  /** Nombre de pattes lectrices (arcs pleins + étiquette) */
  readerCount?: number;
  /** Portée des pattes en px (null = auto selon la taille du canvas) */
  reach?: number | null;
  /** Textes affichés au bout des pattes lectrices */
  labels?: string[];
  /** Champ de particules en fond */
  particles?: boolean;
  /** Le corps erre tout seul */
  wander?: boolean;
  /** Le corps suit le pointeur quand il survole le canvas */
  followPointer?: boolean;
  /** Échelle globale (taille du corps, épaisseurs) */
  scale?: number;
}

type LegState = 'extend' | 'hold' | 'retract';

interface Leg {
  tx: number;
  ty: number; // point d'ancrage dans le monde
  t: number; // progression 0..1
  state: LegState;
  hold: number; // temps restant planté (s)
  speed: number; // vitesse d'extension (1/s)
  bend: number; // courbure de l'arc
  reader: boolean; // patte lectrice ?
  label: string;
  pulse: number; // position de l'impulsion 0..1 (-1 = aucune)
  delay: number; // délai avant de repartir
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  r: number;
}

const DEFAULTS: Required<SpiderOptions> = {
  legColor: '#ff4f8b',
  bodyColor: '#c9a8ff',
  bodyFill: 'rgba(58, 30, 86, 0.95)',
  labelFill: 'rgba(20, 8, 20, 0.85)',
  labelText: '#ffd6e4',
  bodyGlow: 'rgba(201,168,255,0.35)',
  bodyDot: '#efe4ff',
  readerColor: '#ffffff',
  legCount: 11,
  readerCount: 3,
  reach: null,
  labels: [
    'BTC 67,412',
    'ETH 3,280',
    'SOL -2.3%',
    'NVDA 128.9',
    'GLD +0.3%',
    'SPY 578.2',
    'OI +12%',
    'funding 0.08%',
  ],
  particles: true,
  wander: true,
  followPointer: true,
  scale: 1,
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export class SpiderEngine {
  private ctx: CanvasRenderingContext2D;
  private o: Required<SpiderOptions>;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private time = 0;
  private running = false;
  private reduced = false;

  private bx = 0;
  private by = 0; // position du corps
  private gx = 0;
  private gy = 0; // position visée
  private pointer: { x: number; y: number } | null = null;
  private legs: Leg[] = [];
  private parts: Particle[] = [];
  private labelIdx = 0;
  private ro?: ResizeObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    options: SpiderOptions = {},
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D non disponible');
    this.ctx = ctx;
    this.o = { ...DEFAULTS, ...options };
    this.reduced =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.resize();
    this.bx = this.gx = this.w / 2;
    this.by = this.gy = this.h / 2;
    this.initLegs();
    this.initParticles();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerleave', this.onLeave);
  }

  // ---------- API publique ----------
  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    if (this.reduced) {
      // Mouvement réduit : on affiche une pose figée, pattes sorties
      this.legs.forEach((l) => {
        l.t = 1;
        l.state = 'hold';
      });
      this.draw();
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Mettre à jour les options à chaud (couleurs, labels…) */
  setOptions(options: SpiderOptions): void {
    const countChanged =
      (options.legCount !== undefined &&
        options.legCount !== this.o.legCount) ||
      (options.readerCount !== undefined &&
        options.readerCount !== this.o.readerCount);
    this.o = { ...this.o, ...options };
    if (countChanged) this.initLegs();
    if (options.particles !== undefined) this.initParticles();
    if (this.reduced) this.draw();
  }

  /** Déplacer le corps vers un point précis (ex : section active de la page) */
  moveTo(x: number, y: number): void {
    this.gx = x;
    this.gy = y;
  }

  destroy(): void {
    this.stop();
    this.ro?.disconnect();
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerleave', this.onLeave);
  }

  // ---------- interne ----------
  private get reach(): number {
    return this.o.reach ?? Math.max(70, Math.min(this.w, this.h) * 0.28);
  }

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  private onLeave = () => {
    this.pointer = null;
  };

  private resize(): void {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.parts.length) this.initParticles();
    if (!this.running || this.reduced) this.draw();
  }

  private initLegs(): void {
    this.legs = [];
    const n = this.o.legCount + this.o.readerCount;
    for (let i = 0; i < n; i++) {
      const reader = i >= this.o.legCount;
      const leg: Leg = {
        tx: 0,
        ty: 0,
        t: 0,
        state: 'extend',
        hold: 0,
        speed: 0,
        bend: 0,
        reader,
        label: '',
        pulse: -1,
        delay: rand(0, 1.2),
      };
      this.plant(leg, i, n);
      this.legs.push(leg);
    }
  }

  /** Choisit un nouveau point d'ancrage autour du corps */
  private plant(leg: Leg, i?: number, n?: number): void {
    const R = this.reach;
    const ang =
      i !== undefined && n
        ? (i / n) * Math.PI * 2 + rand(-0.3, 0.3)
        : rand(0, Math.PI * 2);
    const d = leg.reader ? R * rand(1.0, 1.35) : R * rand(0.35, 1);
    // on décale légèrement vers la direction du mouvement pour "anticiper" le pas
    const ax = (this.gx - this.bx) * 0.4;
    const ay = (this.gy - this.by) * 0.4;
    leg.tx = this.bx + Math.cos(ang) * d + ax;
    leg.ty = this.by + Math.sin(ang) * d * 0.85 + ay;
    leg.speed = leg.reader ? rand(0.9, 1.4) : rand(1.6, 2.6);
    leg.bend = leg.reader ? rand(0.35, 0.55) : rand(0.25, 0.5);
    leg.t = 0;
    leg.state = 'extend';
    leg.pulse = -1;
    if (leg.reader) {
      const L = this.o.labels;
      leg.label = L.length ? L[this.labelIdx++ % L.length] : '';
    }
  }

  private initParticles(): void {
    this.parts = [];
    if (!this.o.particles) return;
    const count = Math.round((this.w * this.h) / 2200);
    for (let i = 0; i < count; i++) {
      this.parts.push({
        x: rand(0, this.w),
        y: rand(0, this.h),
        vx: rand(-4, 4),
        vy: rand(-4, 4),
        a: rand(0.15, 0.6),
        r: rand(0.5, 1.4),
      });
    }
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    this.time += dt;
    const t = this.time;

    // --- cible du corps : pointeur, sinon errance douce (somme de sinus) ---
    if (this.o.followPointer && this.pointer) {
      this.gx = this.pointer.x;
      this.gy = this.pointer.y;
    } else if (this.o.wander) {
      const cx = this.w / 2,
        cy = this.h / 2;
      const ampX = this.w * 0.18,
        ampY = this.h * 0.16;
      this.gx =
        cx + Math.sin(t * 0.21) * ampX + Math.sin(t * 0.53 + 1.3) * ampX * 0.35;
      this.gy =
        cy + Math.cos(t * 0.17 + 0.6) * ampY + Math.sin(t * 0.41) * ampY * 0.35;
    }
    // déplacement amorti
    const k = 1 - Math.pow(0.0015, dt);
    this.bx += (this.gx - this.bx) * k * 0.6;
    this.by += (this.gy - this.by) * k * 0.6;

    // --- pattes ---
    const R = this.reach;
    this.legs.forEach((leg) => {
      if (leg.delay > 0) {
        leg.delay -= dt;
        return;
      }
      const dist = Math.hypot(leg.tx - this.bx, leg.ty - this.by);
      const max = leg.reader ? R * 2.1 : R * 1.35;

      switch (leg.state) {
        case 'extend':
          leg.t += dt * leg.speed;
          if (leg.t >= 1) {
            leg.t = 1;
            leg.state = 'hold';
            leg.hold = leg.reader ? rand(2.5, 5) : rand(1.2, 3.5);
            leg.pulse = 0;
          }
          break;
        case 'hold':
          leg.hold -= dt;
          // impulsion qui remonte vers le corps
          if (leg.pulse >= 0) {
            leg.pulse += dt * 1.1;
            if (leg.pulse > 1) leg.pulse = Math.random() < 0.5 ? 0 : -1;
          }
          // patte trop étirée (le corps s'est éloigné) ou temps écoulé → on lâche
          if (leg.hold <= 0 || dist > max) leg.state = 'retract';
          break;
        case 'retract':
          leg.t -= dt * leg.speed * 1.6;
          if (leg.t <= 0) {
            this.plant(leg);
            leg.delay = rand(0.05, 0.4);
          }
          break;
      }
    });

    // --- particules ---
    for (const p of this.parts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < 0) p.x += this.w;
      else if (p.x > this.w) p.x -= this.w;
      if (p.y < 0) p.y += this.h;
      else if (p.y > this.h) p.y -= this.h;
    }
  }

  // Point sur une Bézier quadratique
  private qp(
    sx: number,
    sy: number,
    cx: number,
    cy: number,
    ex: number,
    ey: number,
    u: number,
  ) {
    const m = 1 - u;
    return {
      x: m * m * sx + 2 * m * u * cx + u * u * ex,
      y: m * m * sy + 2 * m * u * cy + u * u * ey,
    };
  }

  // Point de contrôle : arc qui bombe toujours vers le HAUT (comme une patte d'araignée)
  private ctrl(sx: number, sy: number, ex: number, ey: number, bend: number) {
    const dx = ex - sx,
      dy = ey - sy;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len,
      ny = dx / len;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const lift = len * bend;
    return {
      x: (sx + ex) / 2 + nx * lift,
      y: (sy + ey) / 2 + ny * lift - len * 0.12,
    };
  }

  private draw(): void {
    const c = this.ctx;
    const s = this.o.scale;
    c.clearRect(0, 0, this.w, this.h);

    // --- fond de particules (plus dense autour du corps) ---
    if (this.parts.length) {
      c.fillStyle = this.o.legColor;
      for (const p of this.parts) {
        const d = Math.hypot(p.x - this.bx, p.y - this.by);
        const boost = Math.max(0, 1 - d / (this.reach * 2.2));
        c.globalAlpha = p.a * (0.35 + boost * 0.9);
        c.fillRect(p.x, p.y, p.r, p.r);
      }
      c.globalAlpha = 1;
    }

    const bx = this.bx,
      by = this.by;

    // --- pattes ---
    for (const leg of this.legs) {
      if (leg.t <= 0) continue;
      const e =
        leg.state === 'retract' ? easeInOut(leg.t) : easeOutCubic(leg.t);
      const cp = this.ctrl(bx, by, leg.tx, leg.ty, leg.bend);

      // échantillonnage de la courbe jusqu'à e
      const steps = 48;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= steps; i++)
        pts.push(this.qp(bx, by, cp.x, cp.y, leg.tx, leg.ty, (i / steps) * e));
      const tip = pts[pts.length - 1];

      if (leg.reader) {
        // arc plein, blanc, légèrement lumineux
        c.save();
        c.strokeStyle = this.o.readerColor;
        c.globalAlpha = 0.85;
        c.lineWidth = 1.3 * s;
        c.shadowColor = this.o.readerColor;
        c.shadowBlur = 6;
        c.beginPath();
        pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
        c.stroke();
        c.restore();
      } else {
        // pointillés : un point tous les ~5px
        c.fillStyle = this.o.readerColor;
        let acc = 0;
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1],
            b = pts[i];
          const seg = Math.hypot(b.x - a.x, b.y - a.y);
          acc += seg;
          while (acc >= 5 * s) {
            acc -= 5 * s;
            const r = seg ? 1 - acc / seg : 0;
            const x = a.x + (b.x - a.x) * r,
              y = a.y + (b.y - a.y) * r;
            c.globalAlpha = 0.75;
            c.beginPath();
            c.arc(x, y, 0.9 * s, 0, Math.PI * 2);
            c.fill();
          }
        }
        c.globalAlpha = 1;
      }

      // impulsion de données qui remonte vers le corps
      if (leg.state === 'hold' && leg.pulse >= 0) {
        const p = this.qp(bx, by, cp.x, cp.y, leg.tx, leg.ty, 1 - leg.pulse);
        c.save();
        c.fillStyle = leg.reader ? this.o.readerColor : this.o.legColor;
        c.shadowColor = c.fillStyle as string;
        c.shadowBlur = 10;
        c.beginPath();
        c.arc(p.x, p.y, 2 * s, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // nœud au bout de la patte
      if (e > 0.92) {
        const a = Math.min(1, (e - 0.92) / 0.08);
        c.save();
        c.globalAlpha = a;
        if (leg.reader) {
          this.drawLabel(tip.x, tip.y, leg.label);
        } else {
          const pulse = 1 + Math.sin(this.time * 4 + leg.tx) * 0.12;
          c.strokeStyle = this.o.legColor;
          c.fillStyle = this.o.legColor;
          c.shadowColor = this.o.legColor;
          c.shadowBlur = 8;
          c.lineWidth = 1.2 * s;
          c.beginPath();
          c.arc(tip.x, tip.y, 5 * s * pulse, 0, Math.PI * 2);
          c.stroke();
          c.beginPath();
          c.arc(tip.x, tip.y, 2.2 * s, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
      }
    }

    // --- corps ---
    this.drawBody(bx, by);
  }

  private drawLabel(x: number, y: number, text: string): void {
    if (!text) return;
    const c = this.ctx,
      s = this.o.scale;
    c.font = `${10 * s}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    const tw = c.measureText(text).width;
    const pad = 4 * s,
      h = 14 * s;
    const lx = x + 6 * s,
      ly = y - h / 2;
    c.fillStyle = this.o.labelFill;
    c.fillRect(lx, ly, tw + pad * 2, h);
    c.strokeStyle = this.o.legColor;
    c.lineWidth = 1;
    c.strokeRect(lx + 0.5, ly + 0.5, tw + pad * 2 - 1, h - 1);
    c.fillStyle = this.o.labelText;
    c.textBaseline = 'middle';
    c.fillText(text, lx + pad, y + 0.5);
    c.fillStyle = this.o.readerColor;
    c.beginPath();
    c.arc(x, y, 2 * s, 0, Math.PI * 2);
    c.fill();
  }

  private drawBody(x: number, y: number): void {
    const c = this.ctx,
      s = this.o.scale;
    const breathe = 1 + Math.sin(this.time * 2.2) * 0.03;
    const w = 18 * s * breathe,
      h = 22 * s * breathe,
      r = 4 * s;
    c.save();
    c.translate(x, y);
    // halo
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 40 * s);
    g.addColorStop(0, this.o.bodyGlow);
    g.addColorStop(1, 'transparent');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, 40 * s, 0, Math.PI * 2);
    c.fill();
    // boîte
    c.shadowColor = this.o.bodyColor;
    c.shadowBlur = 12;
    c.fillStyle = this.o.bodyFill;
    c.strokeStyle = this.o.bodyColor;
    c.lineWidth = 1.6 * s;
    c.beginPath();
    c.moveTo(-w / 2 + r, -h / 2);
    c.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
    c.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
    c.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
    c.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
    c.closePath();
    c.fill();
    c.stroke();
    // 6 points (2 colonnes × 3 lignes)
    c.shadowBlur = 4;
    c.fillStyle = this.o.bodyDot;
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 3; row++) {
        const px = (col - 0.5) * 6.5 * s;
        const py = (row - 1) * 6 * s;
        c.beginPath();
        c.arc(px, py, 1.7 * s, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
  }
}
