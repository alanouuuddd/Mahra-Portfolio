// ============================================================
//  CYBER SCENE — Binary Orb
// ============================================================
const binaryCanvas = document.getElementById('binaryCanvas');
if (binaryCanvas) {
  const SIZE = 520; // internal resolution (2× for sharpness)
  binaryCanvas.width  = SIZE;
  binaryCanvas.height = SIZE;
  const bc = binaryCanvas.getContext('2d');

  const FONT_SIZE = 14;
  const cols = Math.floor(SIZE / FONT_SIZE);
  const drops = Array.from({ length: cols }, () => Math.random() * -(SIZE / FONT_SIZE));

  function drawBinary() {
    bc.save();
    // circular clip
    bc.beginPath();
    bc.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2);
    bc.clip();

    // fade trail
    bc.fillStyle = 'rgba(13, 8, 66, 0.13)';
    bc.fillRect(0, 0, SIZE, SIZE);

    bc.font = `bold ${FONT_SIZE}px Consolas, monospace`;

    drops.forEach((y, i) => {
      const char = Math.random() > 0.5 ? '1' : '0';
      const px = i * FONT_SIZE;
      const py = y * FONT_SIZE;

      const rnd = Math.random();
      if (rnd > 0.97) {
        bc.fillStyle = 'rgba(239,227,202,0.95)'; // bright flash
      } else if (rnd > 0.75) {
        bc.fillStyle = 'rgba(138,203,208,0.85)'; // light teal
      } else {
        bc.fillStyle = 'rgba(86,182,198,0.55)';  // base teal
      }

      bc.fillText(char, px, py);

      if (py > SIZE && Math.random() > 0.975) drops[i] = 0;
      else drops[i] += 0.45;
    });

    bc.restore();
  }

  setInterval(drawBinary, 48);
}

// ============================================================
//  CYBER SCENE — Network Web Canvas
// ============================================================
const webCanvas = document.getElementById('webCanvas');
if (webCanvas) {
  // Size is set after layout
  function initWebCanvas() {
    const W = webCanvas.offsetWidth  || 190;
    const H = webCanvas.offsetHeight || 120;
    webCanvas.width  = W * 2; // retina
    webCanvas.height = H * 2;
    webCanvas.style.width  = W + 'px';
    webCanvas.style.height = H + 'px';
    const wc = webCanvas.getContext('2d');
    wc.scale(2, 2);

    const cx = W / 2, cy = H / 2;
    const nodes = [];

    // Hub
    nodes.push({ x: cx, y: cy, vx: 0, vy: 0, r: 5, hub: true });

    // Spokes in a web pattern (two rings)
    const ring1 = 5, ring2 = 7;
    for (let i = 0; i < ring1; i++) {
      const a = (i / ring1) * Math.PI * 2;
      const rad = Math.min(W, H) * 0.28;
      nodes.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad,
                   vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25, r: 3, hub: false });
    }
    for (let i = 0; i < ring2; i++) {
      const a = (i / ring2) * Math.PI * 2 + 0.3;
      const rad = Math.min(W, H) * 0.44;
      nodes.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad,
                   vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2, r: 2.5, hub: false });
    }

    const MAX_DIST = Math.min(W, H) * 0.62;
    let pulse = 0;

    function drawWeb() {
      wc.clearRect(0, 0, W, H);
      pulse += 0.04;

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.65;
            wc.beginPath();
            wc.strokeStyle = `rgba(138,203,208,${alpha})`;
            wc.lineWidth = 0.8;
            wc.moveTo(nodes[i].x, nodes[i].y);
            wc.lineTo(nodes[j].x, nodes[j].y);
            wc.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n, idx) => {
        const glowR = n.r * (n.hub ? 5 : 3.5) + (n.hub ? Math.sin(pulse) * 2 : 0);
        const grd = wc.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grd.addColorStop(0, n.hub ? 'rgba(239,227,202,0.9)' : 'rgba(86,182,198,0.8)');
        grd.addColorStop(1, 'rgba(13,8,66,0)');
        wc.beginPath();
        wc.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        wc.fillStyle = grd;
        wc.fill();

        wc.beginPath();
        wc.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        wc.fillStyle = n.hub ? '#EFE3CA' : '#8ACBD0';
        wc.fill();

        // Drift (outer nodes only)
        if (!n.hub) {
          n.x += n.vx; n.y += n.vy;
          const pad = 12;
          if (n.x < pad || n.x > W - pad) n.vx *= -1;
          if (n.y < pad || n.y > H - pad) n.vy *= -1;
        }
      });
    }

    setInterval(drawWeb, 30);
  }

  // Wait one frame for layout
  requestAnimationFrame(initWebCanvas);
}

// ============================================================
//  CYBER SCENE — 3-D mouse-tilt on glass card
// ============================================================
const cyberScene = document.getElementById('cyberScene');
const cyberCard  = document.getElementById('cyberCard');

if (cyberScene && cyberCard) {
  let tx = 0, ty = 0, cx2 = 0, cy2 = 0;

  cyberScene.addEventListener('mousemove', e => {
    const r = cyberScene.getBoundingClientRect();
    const nx = (e.clientX - r.left)  / r.width  - 0.5;
    const ny = (e.clientY - r.top)   / r.height - 0.5;
    tx =  ny * 22;  // rotateX
    ty = -nx * 22;  // rotateY
  });

  cyberScene.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  (function tiltLoop() {
    cx2 += (tx - cx2) * 0.09;
    cy2 += (ty - cy2) * 0.09;
    cyberCard.style.transform =
      `perspective(700px) rotateX(${cx2}deg) rotateY(${cy2}deg)`;
    requestAnimationFrame(tiltLoop);
  })();
}

// ============================================================
//  Navbar toggle for mobile
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Animate skill bars when they enter viewport
const bars = document.querySelectorAll('.bar-fill');
if (bars.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(bar => {
    bar.style.animationPlayState = 'paused';
    observer.observe(bar);
  });
}

// Image slot click — opens file picker and previews the selected image
document.querySelectorAll('.img-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        slot.innerHTML = `<img src="${ev.target.result}" alt="Screenshot" style="max-width:100%;border-radius:8px;" />`;
        slot.style.border = 'none';
        slot.style.padding = '0';
        slot.style.background = 'transparent';
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
});

// Fade-in on scroll for cards
const fadeEls = document.querySelectorAll('.glass-card, .topic-card, .reallife-card, .reflection-card-item, .tl-content');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});
