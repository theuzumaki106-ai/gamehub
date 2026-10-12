/**
 * RETRO SYNTHWAVE PERSPECTIVE GRID & STARFIELD ENGINE
 * High-performance 60fps canvas effect with ultra-low CPU footprint.
 * Built for Roll & Row Retro Arcade - Viswajeet Studio
 */
class RetroBackground {
  constructor(canvasId = 'retro-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.gridOffset = 0;
    this.isRunning = true;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.isRunning = !document.hidden;
      if (this.isRunning) this.render();
    });

    this.createStars(140);
    this.render();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.horizonY = this.height * 0.62;
  }

  createStars(count) {
    this.stars = [];
    const colors = ['#ffffff', '#00f0ff', '#ff007f', '#ffe600', '#9d4edd'];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.horizonY,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  drawStars() {
    for (let star of this.stars) {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 0.95 || star.alpha < 0.2) star.twinkleSpeed *= -1;

      this.ctx.save();
      this.ctx.globalAlpha = star.alpha;
      this.ctx.fillStyle = star.color;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
      this.ctx.restore();
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const horizon = this.horizonY;
    const gridHeight = h - horizon;

    // Horizon glow
    const grad = ctx.createLinearGradient(0, horizon - 80, 0, horizon + 20);
    grad.addColorStop(0, 'rgba(255, 0, 127, 0)');
    grad.addColorStop(0.8, 'rgba(255, 0, 127, 0.25)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, horizon - 80, w, 100);

    // Horizon Laser Line
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Perspective lines (vanishing point at screen center)
    const centerX = w / 2;
    const lineCount = Math.floor(w / 40);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 1;

    for (let i = -lineCount; i <= lineCount; i++) {
      const spreadX = centerX + (i * 35);
      const bottomX = centerX + (i * 120);

      ctx.beginPath();
      ctx.moveTo(spreadX, horizon);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }

    // Horizontal moving scanlines with exponential perspective spacing
    this.gridOffset = (this.gridOffset + 0.6) % 36;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';

    for (let y = 0; y < gridHeight; y += 18) {
      const progress = (y + this.gridOffset) / gridHeight;
      if (progress > 1) continue;
      // Exponential curve for depth illusion
      const currentY = horizon + Math.pow(progress, 2.2) * gridHeight;
      const alpha = Math.min(1, progress * 1.5);

      ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 + alpha * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(w, currentY);
      ctx.stroke();
    }
  }

  render() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawStars();
    this.drawGrid();

    requestAnimationFrame(() => this.render());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new RetroBackground('retro-canvas');
});
