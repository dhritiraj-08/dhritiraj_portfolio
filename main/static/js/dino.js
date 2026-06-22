// ===== DINO AUTO-RUN STRIP ANIMATION =====
const canvas = document.getElementById('dinoCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = 110;
}
resize();
window.addEventListener('resize', () => { resize(); });

const ACCENT  = '#e86c2f';
const ACCENT2 = '#f0a500';
const SPEED   = 4.5;

let frame = 0;

// ground Y
const GY = () => canvas.height - 22;

// ---- DINO ----
const dino = {
  x: 80,
  get y() { return GY(); },
  w: 34, h: 44,
  vy: 0, airborne: false,
  _y: null,
  init() { this._y = GY(); },
  update() {
    if (this._y === null) this._y = GY();
    if (this.airborne) {
      this.vy += 0.65;
      this._y += this.vy;
      if (this._y >= GY()) {
        this._y = GY();
        this.airborne = false;
        this.vy = 0;
      }
    }
  },
  jump() {
    if (!this.airborne) {
      this.vy = -13;
      this.airborne = true;
    }
  },
  draw() {
    const y = this._y !== null ? this._y : GY();
    const lf = Math.floor(frame / 5) % 2;
    ctx.save();

    // tail
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.moveTo(this.x, y - this.h + 20);
    ctx.lineTo(this.x - 12, y - this.h + 30);
    ctx.lineTo(this.x, y - this.h + 36);
    ctx.fill();

    // body
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.roundRect(this.x, y - this.h, this.w, this.h, 6);
    ctx.fill();

    // head
    ctx.beginPath();
    ctx.roundRect(this.x + this.w - 8, y - this.h - 7, 16, 20, 5);
    ctx.fill();

    // eye
    ctx.fillStyle = '#111110';
    ctx.beginPath();
    ctx.arc(this.x + this.w + 2, y - this.h - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x + this.w + 1, y - this.h - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // legs
    ctx.fillStyle = ACCENT2;
    if (this.airborne) {
      ctx.fillRect(this.x + 5,  y, 9, 12);
      ctx.fillRect(this.x + 19, y, 9, 12);
    } else if (lf === 0) {
      ctx.fillRect(this.x + 5,  y, 9, 16);
      ctx.fillRect(this.x + 19, y, 9, 7);
    } else {
      ctx.fillRect(this.x + 5,  y, 9, 7);
      ctx.fillRect(this.x + 19, y, 9, 16);
    }

    ctx.restore();
  },
  box() {
    const y = this._y !== null ? this._y : GY();
    return { x: this.x + 4, y: y - this.h + 4, w: this.w - 8, h: this.h - 4 };
  }
};
dino.init();

// ---- OBSTACLES ----
const obstacles = [];
let oTimer = 0;
let oInterval = 120;

function spawnObs() {
  const type = Math.random() < 0.65 ? 'cactus' : 'bird';
  if (type === 'cactus') {
    const h = 26 + Math.random() * 24;
    obstacles.push({ type, x: canvas.width + 20, w: 16 + Math.random() * 8, h, get y() { return GY() - this.h + 8; } });
  } else {
    const by = GY() - 52 - Math.random() * 20;
    obstacles.push({ type, x: canvas.width + 20, y: by, w: 32, h: 16, wf: 0 });
  }
}

function drawCactus(o) {
  ctx.fillStyle = ACCENT2;
  ctx.beginPath(); ctx.roundRect(o.x + o.w/2 - 4, o.y, 8, o.h, 3); ctx.fill();
  ctx.beginPath(); ctx.roundRect(o.x, o.y + o.h*0.3, 7, o.h*0.3, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(o.x, o.y + o.h*0.15, 7, 7, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(o.x + o.w - 7, o.y + o.h*0.38, 7, o.h*0.26, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(o.x + o.w - 7, o.y + o.h*0.24, 7, 7, 2); ctx.fill();
}

function drawBird(o) {
  ctx.fillStyle = ACCENT;
  ctx.beginPath(); ctx.ellipse(o.x+16, o.y+8, 12, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = ACCENT2;
  ctx.beginPath(); ctx.moveTo(o.x+28, o.y+8); ctx.lineTo(o.x+38, o.y+6); ctx.lineTo(o.x+28, o.y+12); ctx.fill();
  const wy = o.wf === 0 ? o.y - 6 : o.y + 4;
  ctx.beginPath(); ctx.ellipse(o.x+12, wy+6, 10, 4, o.wf===0 ? -0.4 : 0.4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111110';
  ctx.beginPath(); ctx.arc(o.x+23, o.y+6, 2, 0, Math.PI*2); ctx.fill();
}

// ---- AUTO JUMP AI ----
function autoJump() {
  for (const o of obstacles) {
    const db = dino.box();
    const lookAhead = 90;
    if (o.x - (dino.x + dino.w) < lookAhead &&
        o.x - (dino.x + dino.w) > 0 &&
        o.type === 'cactus') {
      dino.jump();
    }
    // jump for low birds
    if (o.type === 'bird' && o.y > GY() - 40 &&
        o.x - (dino.x + dino.w) < lookAhead &&
        o.x - (dino.x + dino.w) > 0) {
      dino.jump();
    }
  }
}

// ---- GROUND PEBBLES ----
const pebbles = Array.from({ length: 30 }, () => ({
  x: Math.random() * 1400, size: Math.random() * 1.8 + 0.5
}));

// ---- MAIN LOOP ----
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground line
  ctx.strokeStyle = 'rgba(232,108,47,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, GY() + 10);
  ctx.lineTo(canvas.width, GY() + 10);
  ctx.stroke();

  // pebbles
  ctx.fillStyle = '#3a3835';
  pebbles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x % canvas.width, GY() + 14, p.size, 0, Math.PI * 2);
    ctx.fill();
    p.x -= SPEED * 0.4;
    if (p.x < 0) p.x = canvas.width;
  });

  // obstacles
  oTimer++;
  if (oTimer > oInterval) {
    spawnObs();
    oTimer = 0;
    oInterval = 90 + Math.random() * 70;
  }
  obstacles.forEach(o => {
    o.x -= SPEED;
    if (o.type === 'bird') o.wf = Math.floor(frame / 7) % 2;
    if (o.type === 'cactus') drawCactus(o);
    else drawBird(o);
  });
  while (obstacles.length && obstacles[0].x + obstacles[0].w < 0) obstacles.shift();

  autoJump();
  dino.update();
  dino.draw();

  frame++;
  requestAnimationFrame(loop);
}

loop();
