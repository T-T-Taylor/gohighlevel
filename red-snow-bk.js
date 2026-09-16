<style>
  #section-KOK1C0M9VY { position: relative !important; overflow: hidden !important; }
  #section-KOK1C0M9VY > .confetti-canvas {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 0;
  }
  #section-KOK1C0M9VY > .inner { position: relative; z-index: 2; }
</style>

<script>
(function () {
  'use strict';
  if (window.__confettiV4) return;
  window.__confettiV4 = true;

  var section = document.querySelector('#section-KOK1C0M9VY');
  if (!section) {
    console.error('[confetti-v4] Target section not found.');
    return;
  }

  var isMobile = window.innerWidth <= 767 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- ELEGANT, SUBTLE CONFIGURATION ---
  var CONFIG = {
    particleCount: isMobile ? 15 : 35,      // Drastically reduced
    minSize: 2,                             
    maxSize: 6,                             // Smaller range for subtlety
    minSpeed: 0.15,                         // Much slower fall
    maxSpeed: 0.6,                          
    wind: 0.15,                              // Less horizontal drift
    rotationSpeed: 0.015,                   // Slower, calmer rotation
    sparkleRatio: 0.50,                     // More sparkles, fewer confetti rectangles
    glow: !isMobile,
    colors: [
      'rgba(220, 20, 60, 0.65)',            // Lowered opacity (0.65 vs 0.95)
      'rgba(255, 30, 30, 0.60)',
      'rgba(255, 60, 60, 0.55)',
      'rgba(200, 0, 0, 0.65)',
      'rgba(255, 140, 0, 0.50)',           // Amber accent softer
      'rgba(255, 220, 100, 0.45)'           // Gold accent softer
    ]
  };

  var canvas = section.querySelector(':scope > .confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    section.insertBefore(canvas, section.firstChild);
  }
  
  var ctx = canvas.getContext('2d');
  var width = 0, height = 0, particles = [];
  var rafId = null, running = false;

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function Particle() { this.reset(true); }
  Particle.prototype.reset = function (initial) {
    this.x = rand(0, width || window.innerWidth);
    this.y = initial ? rand(0, height || 300) : rand(-60, -10);
    this.size = rand(CONFIG.minSize, CONFIG.maxSize);
    this.speedY = rand(CONFIG.minSpeed, CONFIG.maxSpeed);
    this.speedX = rand(-CONFIG.wind, CONFIG.wind);
    this.rotation = rand(0, Math.PI * 2);
    this.rotationSpeed = rand(-CONFIG.rotationSpeed, CONFIG.rotationSpeed);
    // Lower opacity for ambient feel
    this.opacity = rand(0.3, 0.7);
    this.isSparkle = Math.random() < CONFIG.sparkleRatio;
    this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    this.sparklePhase = rand(0, Math.PI * 2);
    // Slower twinkle
    this.sparkleSpeed = rand(0.02, 0.06);
    // Less sway, more vertical drift like snow
    this.swayAmp = rand(0.1, 0.4);
    this.swayPhase = rand(0, Math.PI * 2);
    this.swaySpeed = rand(0.005, 0.015);
  };
  Particle.prototype.update = function () {
    this.y += this.speedY;
    this.swayPhase += this.swaySpeed;
    this.x += this.speedX + Math.sin(this.swayPhase) * this.swayAmp;
    this.rotation += this.rotationSpeed;
    this.sparklePhase += this.sparkleSpeed;
    if (this.y > height + 20) this.reset(false);
    if (this.x > width + 20) this.x = -20;
    if (this.x < -20) this.x = width + 20;
  };
  Particle.prototype.draw = function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;
    if (this.isSparkle) {
      var pulse = 1 + Math.sin(this.sparklePhase) * 0.4;
      var s = Math.max(0.5, this.size * pulse);
      if (CONFIG.glow) { ctx.shadowBlur = 8; ctx.shadowColor = this.color; }
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -s * 2);
      ctx.lineTo(s * 0.4, -s * 0.4);
      ctx.lineTo(s * 2, 0);
      ctx.lineTo(s * 0.4, s * 0.4);
      ctx.lineTo(0, s * 2);
      ctx.lineTo(-s * 0.4, s * 0.4);
      ctx.lineTo(-s * 2, 0);
      ctx.lineTo(-s * 0.4, -s * 0.4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.55);
    }
    ctx.restore();
  };

  function resize() {
    var rect = section.getBoundingClientRect();
    width = rect.width; height = rect.height;
    if (width === 0 || height === 0) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < CONFIG.particleCount; i++) particles.push(new Particle());
  }

  function animate() {
    if (running && width > 0 && height > 0) {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
    }
    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (running || prefersReduced) return;
    running = true;
    if (!rafId) animate();
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function init() {
    resize();
    initParticles();
    start();
    console.log('[confetti-v4-elegant] initialized on', section.id, 'size', width + 'x' + height, 'particles', particles.length);
  }

  var observer = new MutationObserver(function() {
    if (!section.querySelector(':scope > .confetti-canvas')) {
      section.insertBefore(canvas, section.firstChild);
      resize();
      initParticles();
    }
  });
  observer.observe(section, { childList: true });

  if (window.ResizeObserver) {
    new ResizeObserver(function() { resize(); }).observe(section);
  }
  window.addEventListener('resize', function() { resize(); initParticles(); });
  window.addEventListener('orientationchange', function() { setTimeout(resize, 500); });
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) stop(); else start();
  });

  init();
  setTimeout(resize, 500);
  setTimeout(resize, 2000);

  window.__confetti = {
    version: '4.1-elegant',
    reinit: function() { init(); }
  };
})();
</script>
