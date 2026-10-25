const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  score: document.getElementById('scoreDisplay'),
  startScreen: document.getElementById('startScreen'),
  gameOverScreen: document.getElementById('gameOverScreen'),
  finalScore: document.getElementById('finalScore'),
  startBtn: document.getElementById('startBtn'),
  restartBtn: document.getElementById('restartBtn')
};

let W, H;
let audioCtx = null;
let isPlaying = false;
let score = 0;
let gameSpeed = 6;
let shakeTime = 0;
let bgOffset1 = 0;
let bgOffset2 = 0;

const player = {
  x: 100,
  y: 0,
  vy: 0,
  width: 30,
  height: 40,
  jumpsLeft: 2,
  color: '#00ffff'
};

const gravity = 0.6;
const jumpForce = -12;

let obstacles = [];
let particles = [];
let trail = [];
let spawnTimer = 0;
let spawnInterval = 90;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  player.y = H - 150;
}
window.addEventListener('resize', resize);
resize();

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playJumpSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
  
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playDeathSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

function jump() {
  if (!isPlaying) return;
  if (player.jumpsLeft > 0) {
    player.vy = jumpForce;
    player.jumpsLeft--;
    playJumpSound();
    createParticles(player.x + player.width / 2, player.y + player.height, 8, '#00ffff');
  }
}

function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      color: color,
      size: Math.random() * 3 + 1
    });
  }
}

function spawnObstacle() {
  const type = Math.random();
  let w, h;
  
  if (type < 0.6) {
    w = 20 + Math.random() * 20;
    h = 40 + Math.random() * 60;
  } else {
    w = 40 + Math.random() * 30;
    h = 20 + Math.random() * 20;
  }

  obstacles.push({
    x: W,
    y: H - 100 - h,
    width: w,
    height: h,
    color: '#ff0055',
    passed: false
  });
}

function gameOver() {
  isPlaying = false;
  playDeathSound();
  shakeTime = 20;
  createParticles(player.x + player.width / 2, player.y + player.height / 2, 30, '#00ffff');
  
  setTimeout(() => {
    ui.finalScore.textContent = Math.floor(score);
    ui.gameOverScreen.classList.remove('hidden');
  }, 800);
}

function resetGame() {
  score = 0;
  gameSpeed = 6;
  obstacles = [];
  particles = [];
  trail = [];
  spawnTimer = 0;
  spawnInterval = 90;
  player.y = H - 150;
  player.vy = 0;
  player.jumpsLeft = 2;
  isPlaying = true;
  ui.startScreen.classList.add('hidden');
  ui.gameOverScreen.classList.add('hidden');
  initAudio();
}

function update() {
  if (!isPlaying) return;

  score += 0.1;
  gameSpeed += 0.001;
  spawnInterval = Math.max(40, 90 - score * 0.05);
  ui.score.textContent = Math.floor(score);

  bgOffset1 -= gameSpeed * 0.2;
  bgOffset2 -= gameSpeed * 0.5;

  player.vy += gravity;
  player.y += player.vy;

  if (player.y > H - 150) {
    player.y = H - 150;
    player.vy = 0;
    player.jumpsLeft = 2;
  }

  trail.push({ x: player.x, y: player.y, life: 1 });
  for (let i = trail.length - 1; i >= 0; i--) {
    trail[i].life -= 0.05;
    if (trail[i].life <= 0) trail.splice(i, 1);
  }

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnObstacle();
    spawnTimer = 0;
    if (Math.random() < 0.2) spawnTimer = spawnInterval * 0.5;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= gameSpeed;

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      continue;
    }

    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver();
    }

    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
      score += 5;
      createParticles(player.x, player.y + player.height / 2, 2, '#ffffff');
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;
    if (p.life <= 0) particles.splice(i, 1);
  }

  if (shakeTime > 0) shakeTime -= 0.5;
}

function draw() {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  if (shakeTime > 0) {
    ctx.translate((Math.random() - 0.5) * shakeTime, (Math.random() - 0.5) * shakeTime);
  }

  ctx.fillStyle = 'rgba(255, 0, 85, 0.1)';
  ctx.beginPath();
  for (let x = bgOffset1 % 300; x < W + 300; x += 300) {
    ctx.moveTo(x, H - 100);
    ctx.lineTo(x + 150, H - 300);
    ctx.lineTo(x + 300, H - 100);
  }
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
  ctx.beginPath();
  for (let x = bgOffset2 % 200; x < W + 200; x += 200) {
    ctx.moveTo(x, H - 100);
    ctx.lineTo(x + 100, H - 200);
    ctx.lineTo(x + 200, H - 100);
  }
  ctx.fill();

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, H - 100, W, 100);
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H - 100);
  ctx.lineTo(W, H - 100);
  ctx.stroke();

  trail.forEach(t => {
    ctx.fillStyle = `rgba(0, 255, 255, ${t.life * 0.3})`;
    ctx.fillRect(t.x, t.y, player.width, player.height);
  });

  obstacles.forEach(obs => {
    ctx.fillStyle = obs.color;
    ctx.shadowColor = obs.color;
    ctx.shadowBlur = 15;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.shadowBlur = 0;
  });

  if (!isPlaying) {
    ctx.globalAlpha = 0.5;
  }
  ctx.fillStyle = player.color;
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 20;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  particles.forEach(p => {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
    if (p.color === '#00ffff') {
      ctx.fillStyle = `rgba(0, 255, 255, ${p.life})`;
    }
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function handleInput(e) {
  if (e.type === 'keydown' && e.code !== 'Space') return;
  if (e.type === 'touchstart') e.preventDefault();
  jump();
}

window.addEventListener('keydown', handleInput);
window.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', handleInput, { passive: false });

ui.startBtn.addEventListener('click', resetGame);
ui.restartBtn.addEventListener('click', resetGame);

loop();