// ========== Canvas Particle System ==========
(function() {
  var canvas = document.getElementById('particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h;
  var particles = [];
  var count = 60;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Particle() {
    this.reset();
    this.y = Math.random() * h;
  }
  Particle.prototype.reset = function() {
    this.x = Math.random() * w;
    this.y = -10;
    this.size = Math.random() * 1.5 + 0.5;
    this.speed = Math.random() * 0.4 + 0.15;
    this.opacity = Math.random() * 0.35 + 0.1;
  };
  Particle.prototype.update = function() {
    this.y += this.speed;
    if (this.y > h + 10) this.reset();
  };
  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5,150,105,' + this.opacity + ')';
    ctx.fill();
  };

  for (var i = 0; i < count; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < count; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Connection lines
    for (var i = 0; i < count; i++) {
      for (var j = i + 1; j < count; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(5,150,105,' + (0.06 * (1 - dist / 130)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ========== Scroll Effects ==========
window.addEventListener('scroll', function() {
  var scrollTop = window.scrollY;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  var progress = (scrollTop / docHeight) * 100;

  // Progress bar
  var bar = document.getElementById('progressBar');
  if (bar) bar.style.width = progress + '%';

  // Nav background
  var nav = document.getElementById('topNav');
  if (nav) nav.classList.toggle('scrolled', scrollTop > 20);
});

// ========== Year Indicator (homepage only) ==========
var yearEl = document.getElementById('yearIndicator');
var yearMarkers = document.querySelectorAll('.year-marker');

if (yearEl && yearMarkers.length) {
  window.addEventListener('scroll', function() {
    var currentYear = '';
    yearMarkers.forEach(function(marker) {
      var rect = marker.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2) {
        currentYear = marker.textContent;
      }
    });
    yearEl.textContent = currentYear || yearMarkers[0].textContent;

    // Activate nearest marker
    yearMarkers.forEach(function(m) { m.classList.remove('active'); });
    var closest = null;
    var minDist = Infinity;
    yearMarkers.forEach(function(m) {
      var dist = Math.abs(m.getBoundingClientRect().top - window.innerHeight / 2);
      if (dist < minDist) { minDist = dist; closest = m; }
    });
    if (closest) closest.classList.add('active');
  });
}

// ========== Animate timeline items on load ==========
document.querySelectorAll('.tl-item').forEach(function(item, i) {
  item.style.opacity = '0';
  item.style.transform = 'translateY(20px)';
  item.style.transition = 'opacity 0.6s ease, transform 0.6s ease, background 0.3s, box-shadow 0.3s';
  setTimeout(function() {
    item.style.opacity = '1';
    item.style.transform = 'translateY(0)';
  }, 100 + i * 80);
});

// ========== Settings: gear, font size, theme ==========
(function () {
  var root = document.documentElement;
  var gear = document.getElementById('settingsGear');
  var panel = document.getElementById('settingsPanel');
  var fontDec = document.getElementById('fontDec');
  var fontInc = document.getElementById('fontInc');
  var fontVal = document.getElementById('fontVal');
  var themeToggle = document.getElementById('themeToggle');
  if (!gear || !panel || !fontDec || !fontInc || !themeToggle) return;

  // 面板开关
  gear.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && e.target !== gear) {
      panel.classList.remove('open');
    }
  });

  // 字号（用 zoom 实现整体缩放）
  var FONT_STEPS = [0.9, 1.0, 1.1, 1.2, 1.3];
  function getFontIdx() {
    var v = parseFloat(localStorage.getItem('blog-font') || '1.0');
    var idx = FONT_STEPS.indexOf(v);
    return idx === -1 ? 1 : idx;
  }
  function applyFont(idx) {
    idx = Math.max(0, Math.min(FONT_STEPS.length - 1, idx));
    var v = FONT_STEPS[idx];
    root.style.zoom = String(v);
    fontVal.textContent = Math.round(v * 100) + '%';
    try { localStorage.setItem('blog-font', String(v)); } catch (e) {}
    return idx;
  }
  var fontIdx = applyFont(getFontIdx());
  fontDec.addEventListener('click', function () { fontIdx = applyFont(fontIdx - 1); });
  fontInc.addEventListener('click', function () { fontIdx = applyFont(fontIdx + 1); });

  // 主题切换
  function applyTheme(dark) {
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '浅色';
    } else {
      root.removeAttribute('data-theme');
      themeToggle.textContent = '暗色';
    }
    try { localStorage.setItem('blog-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }
  applyTheme(localStorage.getItem('blog-theme') === 'dark');
  themeToggle.addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') !== 'dark');
  });
})();
