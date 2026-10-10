/**
 * Tauheed Nafees - Data Analyst Portfolio
 * Interactive Script: Canvas Particles, Web Audio Synthesizer,
 * Intro Gate, Projects Carousel, Filterable Skills, & Modals
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // 1. CUSTOM TRAILING CURSOR
  // =========================================================
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover effect on interactive elements
  const interactiveTargets = document.querySelectorAll('a, button, input, textarea, .skill-card, .what-card, .cert-card, .edu-card, .orbit-item');
  interactiveTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // =========================================================
  // 2. CANVAS PARTICLE STARFIELD WITH PARALLAX (Matching reference)
  // =========================================================
    const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let targetShiftX = 0, targetShiftY = 0;
    let currentShiftX = 0, currentShiftY = 0;

    window.addEventListener('mousemove', (e) => {
      targetShiftX = (e.clientX - width / 2) * 0.04;
      targetShiftY = (e.clientY - height / 2) * 0.04;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const colors = [
      'rgba(255, 255, 255, ',
      'rgba(34, 211, 238, ',
      'rgba(168, 85, 247, ',
      'rgba(236, 72, 153, ',
      'rgba(94, 234, 212, '
    ];

    const particleCount = Math.min(140, Math.floor(width * height / 9000));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.5,
        radius: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let frame = 0;
    function animateParticles() {
      frame++;
      currentShiftX += (targetShiftX - currentShiftX) * 0.05;
      currentShiftY += (targetShiftY - currentShiftY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= 0.18 * p.z;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const renderX = p.x + currentShiftX * p.z;
        const renderY = p.y + currentShiftY * p.z;
        const alpha = Math.max(0.1, p.baseAlpha + Math.sin(frame * p.twinkleSpeed + p.twinkleOffset) * 0.35);

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        if (p.radius > 1.2) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `${p.color}0.8)`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ---- 3D network sphere layered over the particles ----
(function () {
  const base = document.getElementById('particle-canvas');
  if (!base) return;

  const RM = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ACC =
    (getComputedStyle(document.documentElement)
      .getPropertyValue('--accentColor') || '').trim() || '#5eead4';

  // =========================================================
  // GLOBE SETTINGS
  // =========================================================

  const N = 440;              // number of points
  const LINK = 0.05;          // connection distance
  const SIZE = 0.46;          // globe size
  const OFFSET_X = 0.66;      // desktop horizontal position
  const OPACITY = 0.55;       // globe visibility
  const HOVER_RADIUS = 140;   // cursor interaction radius

  // Slow movement / parallax
  const AUTO_ROTATION_SPEED = 0.00055;
  const PARALLAX_YAW = 0.18;
  const PARALLAX_TILT = 0.12;

  // Smoothing / inertia
  const ROTATION_SMOOTHING = 0.025;
  const TILT_SMOOTHING = 0.035;

  const cv = document.createElement('canvas');
  cv.id = 'orb-bg';

  Object.assign(cv.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '0',
    opacity: String(OPACITY)
  });

  base.insertAdjacentElement('afterend', cv);

  const g = cv.getContext('2d');

  // =========================================================
  // CANVAS SIZE
  // =========================================================

  let w = 0;
  let h = 0;

  function fit() {
    w = window.innerWidth;
    h = window.innerHeight;

    const r = Math.min(window.devicePixelRatio || 1, 2);

    cv.width = w * r;
    cv.height = h * r;

    g.setTransform(r, 0, 0, r, 0, 0);
  }

  fit();

  window.addEventListener('resize', () => {
    fit();

    if (RM) {
      draw();
    }
  });

  // =========================================================
  // SPHERE POINTS
  // =========================================================

  const P = [];
  const E = [];

  for (let i = 0; i < N; i++) {
    const y = 1 - 2 * (i + 0.5) / N;
    const r = Math.sqrt(1 - y * y);
    const t = Math.PI * (3 - Math.sqrt(5)) * i;

    P.push([
      Math.cos(t) * r,
      y,
      Math.sin(t) * r
    ]);
  }

  // Connections
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {

      const d =
        (P[i][0] - P[j][0]) ** 2 +
        (P[i][1] - P[j][1]) ** 2 +
        (P[i][2] - P[j][2]) ** 2;

      if (d < LINK) {
        E.push([i, j]);
      }
    }
  }

  const PX = new Float32Array(N);
  const PY = new Float32Array(N);
  const PZ = new Float32Array(N);

  // =========================================================
  // ROTATION
  // =========================================================

  function rot(p, a, b) {

    const x1 =
      p[0] * Math.cos(b) +
      p[2] * Math.sin(b);

    const z1 =
      -p[0] * Math.sin(b) +
      p[2] * Math.cos(b);

    return [
      x1,
      p[1] * Math.cos(a) -
        z1 * Math.sin(a),

      p[1] * Math.sin(a) +
        z1 * Math.cos(a)
    ];
  }

  // =========================================================
  // CURSOR / PARALLAX STATE
  // =========================================================

  let ax = 0.3;
  let ay = 0;

  let targetYaw = 0;
  let targetTilt = 0;

  let currentYaw = 0;
  let currentTilt = 0;

  const pm = {
    x: -999,
    y: -999
  };

  const pul = [];

  window.addEventListener('pointermove', (e) => {

    pm.x = e.clientX;
    pm.y = e.clientY;

    // Normalized cursor position
    const mx =
      (e.clientX / window.innerWidth - 0.5) * 2;

    const my =
      (e.clientY / window.innerHeight - 0.5) * 2;

    // Gentle target movement
    targetYaw = mx * PARALLAX_YAW;
    targetTilt = my * PARALLAX_TILT;

  });

  document.addEventListener('mouseleave', () => {

    pm.x = -999;
    pm.y = -999;

    // Slowly return to neutral
    targetYaw = 0;
    targetTilt = 0;

  });

  // =========================================================
  // MAIN DRAW
  // =========================================================

  function draw() {

    g.clearRect(0, 0, w, h);

    const R = Math.min(w, h) * SIZE;

    const cx =
      w * (w < 700 ? 0.5 : OFFSET_X);

    const cy = h * 0.52;

    if (!RM) {

      // -----------------------------------------
      // Very slow natural rotation
      // -----------------------------------------

      ay += AUTO_ROTATION_SPEED;

      // -----------------------------------------
      // Smooth cursor parallax
      // -----------------------------------------

      currentYaw +=
        (targetYaw - currentYaw) *
        ROTATION_SMOOTHING;

      currentTilt +=
        (targetTilt - currentTilt) *
        TILT_SMOOTHING;

      // -----------------------------------------
      // Gentle vertical tilt
      // -----------------------------------------

      const targetAx =
        0.30 + currentTilt;

      ax +=
        (targetAx - ax) *
        TILT_SMOOTHING;
    }

    // =======================================================
    // PROJECT POINTS
    // =======================================================

    for (let i = 0; i < N; i++) {

      const q =
        rot(
          P[i],
          ax,
          ay + currentYaw
        );

      const s =
        1.6 /
        (1.6 - q[2] * 0.5);

      PX[i] =
        cx +
        q[0] * R * s;

      PY[i] =
        cy +
        q[1] * R * s;

      PZ[i] = q[2];
    }

    // =======================================================
    // CONNECTION LINES
    // =======================================================

    g.lineWidth = 1;
    g.strokeStyle = ACC;

    for (const [k, al] of [
      [0, 0.05],
      [1, 0.2]
    ]) {

      g.globalAlpha = al;
      g.beginPath();

      for (const [i, j] of E) {

        if (
          (((PZ[i] + PZ[j]) > 0) ? 1 : 0) === k
        ) {

          g.moveTo(
            PX[i],
            PY[i]
          );

          g.lineTo(
            PX[j],
            PY[j]
          );
        }
      }

      g.stroke();
    }

    // =======================================================
    // CURSOR INTERACTION
    // =======================================================

    g.fillStyle = ACC;

    for (let i = 0; i < N; i++) {

      const dx =
        PX[i] - pm.x;

      const dy =
        PY[i] - pm.y;

      const near =
        Math.max(
          0,
          1 -
          Math.hypot(dx, dy) /
          HOVER_RADIUS
        );

      const d =
        (PZ[i] + 1) / 2;

      g.globalAlpha =
        0.25 +
        d * 0.6 +
        near * 0.15;

      // Slightly reduced cursor reaction
      const r =
        1 +
        d * 1.3 +
        near * 2.3;

      if (near > 0.05) {

        g.shadowColor = ACC;
        g.shadowBlur = 12;

      }

      g.beginPath();

      g.arc(
        PX[i],
        PY[i],
        r,
        0,
        6.283
      );

      g.fill();

      g.shadowBlur = 0;
    }

    // =======================================================
    // RANDOM PULSE RINGS
    // =======================================================

    if (!RM && Math.random() < 0.025) {

      pul.push({
        i: (Math.random() * N) | 0,
        t: 0
      });

    }

    g.lineWidth = 1.5;

    for (
      let k = pul.length - 1;
      k >= 0;
      k--
    ) {

      const p = pul[k];

      p.t += 0.015;

      if (p.t > 1) {

        pul.splice(k, 1);
        continue;

      }

      g.globalAlpha =
        (1 - p.t) * 0.75;

      g.strokeStyle = ACC;

      g.beginPath();

      g.arc(
        PX[p.i],
        PY[p.i],
        4 + p.t * 36,
        0,
        6.283
      );

      g.stroke();
    }

    g.globalAlpha = 1;
  }

  // =========================================================
  // ANIMATION LOOP
  // =========================================================

  function loop() {

    draw();

    requestAnimationFrame(loop);
  }

  if (RM) {
    draw();
  } else {
    requestAnimationFrame(loop);
  }

})();
  
  // =========================================================
  // 3. INTRO GATEWAY & LOADING SEQUENCE
  // =========================================================
  
  const startGateBtn = document.getElementById('start-gate-btn');
  const initialGate = document.getElementById('initial-gate');
  const loadingScreen = document.getElementById('loading-screen');
  const loadingWrap = document.getElementById('loading-wrap');
  const loadingPercent = document.getElementById('loading-percent');
  const loadingContainer = document.querySelector('.loading-container');
  const loadingWelcome = document.querySelector('.loading-welcome');

  // Mouse hover glow on loading button
  if (loadingWrap) {
    loadingWrap.addEventListener('mousemove', (e) => {
      const rect = loadingWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      loadingWrap.style.setProperty('--mouse-x', `${x}px`);
      loadingWrap.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  function runLoadingSequence() {
  let currentPercent = 0;

  const interval = setInterval(() => {
    currentPercent += Math.floor(Math.random() * 5) + 3;

    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(interval);

      if (loadingPercent) {
        loadingPercent.textContent = 100;
      }

      // Immediately transition after reaching 100%
      setTimeout(() => {
        if (loadingContainer) {
          loadingContainer.classList.add('fade-out');
        }

        if (loadingWelcome) {
          loadingWelcome.classList.add('visible');
        }

        // Start the expansion quickly
        setTimeout(() => {
          if (loadingWrap) {
            loadingWrap.classList.add('loading-clicked');
          }

          // Hide the loading screen shortly after expansion starts
          setTimeout(() => {
            if (loadingScreen) {
              loadingScreen.classList.add('hidden');
            }
          }, 500);

        }, 250);

      }, 100);

    } else {
      if (loadingPercent) {
        loadingPercent.textContent = currentPercent;
      }
    }

  }, 45);
}
runLoadingSequence();

  // =========================================================
  // 5. NAVBAR SCROLL & MOBILE MENU
  // =========================================================
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  });

  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // =========================================================
  // 6. KINETIC TEXT ROTATOR (Hero Section)
  // =========================================================
  const dynamicWords = [
    { from: "RAW BUSINESS DATA", to: "ACTIONABLE INSIGHTS" },
    { from: "COMPLEX TRANSACTION LOGS", to: "RFM SEGMENTATION MODELS" },
    { from: "WAREHOUSE INVENTORY METRICS", to: "OPTIMIZED REPLENISHMENT" },
    { from: "ENTERPRISE KPI DATASETS", to: "EXECUTIVE POWER BI DASHBOARDS" }
  ];

  const dynamicFromEl = document.getElementById('kinetic-from');
  const dynamicToEl = document.getElementById('kinetic-to');
  let currentWordIdx = 0;

  if (dynamicFromEl && dynamicToEl) {
    setInterval(() => {
      currentWordIdx = (currentWordIdx + 1) % dynamicWords.length;
      dynamicFromEl.style.opacity = '0';
      dynamicToEl.style.opacity = '0';
      dynamicFromEl.style.transform = 'translateY(10px)';
      dynamicToEl.style.transform = 'translateY(10px)';

      setTimeout(() => {
        dynamicFromEl.textContent = dynamicWords[currentWordIdx].from;
        dynamicToEl.textContent = dynamicWords[currentWordIdx].to;
        dynamicFromEl.style.opacity = '1';
        dynamicToEl.style.opacity = '1';
        dynamicFromEl.style.transform = 'translateY(0)';
        dynamicToEl.style.transform = 'translateY(0)';
      }, 300);
    }, 3200);
  }

  // =========================================================
  // 7. FEATURED PROJECTS CAROUSEL (Matching reference)
  // =========================================================
  const carouselTrack = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-slide');

const prevBtn = document.querySelector('.carousel-arrow-left');
const nextBtn = document.querySelector('.carousel-arrow-right');

const projectNavItems =
  document.querySelectorAll('.project-nav-item');

const projectNavCurrent =
  document.querySelector('.project-nav-current');

let currentSlide = 0;

const totalSlides = slides.length;

function updateCarousel(index) {

  if (index < 0) {
    currentSlide = totalSlides - 1;

  } else if (index >= totalSlides) {
    currentSlide = 0;

  } else {
    currentSlide = index;
  }

  // Move project carousel
  if (carouselTrack) {
    carouselTrack.style.transform =
      `translateX(-${currentSlide * 100}%)`;
  }

  // Update project selector
  projectNavItems.forEach((item, idx) => {

    item.classList.toggle(
      'active',
      idx === currentSlide
    );

  });

  // Update small status text
  if (projectNavCurrent) {

    const projectNames = [
      'RFM ANALYSIS',
      'SUPPLY CHAIN'
    ];

    projectNavCurrent.textContent =
      `PROJECT ${String(currentSlide + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')} • ${projectNames[currentSlide]}`;
  }
}

// Previous
if (prevBtn) {
  prevBtn.addEventListener(
    'click',
    () => updateCarousel(currentSlide - 1)
  );
}

// Next
if (nextBtn) {
  nextBtn.addEventListener(
    'click',
    () => updateCarousel(currentSlide + 1)
  );
}

// Direct project selection
projectNavItems.forEach((item) => {

  item.addEventListener('click', () => {

    const index =
      Number(item.getAttribute('data-project-index'));

    updateCarousel(index);

  });

});

// Initialize navigation state
updateCarousel(0);

  // Touch Swipe on Carousel
  let touchStartX = 0;
  let touchEndX = 0;
  if (carouselTrack) {
    carouselTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        updateCarousel(currentSlide + 1);
      } else if (touchEndX - touchStartX > 50) {
        updateCarousel(currentSlide - 1);
      }
    }, { passive: true });
  }

  // Keyboard navigation for Carousel
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') updateCarousel(currentSlide - 1);
    if (e.key === 'ArrowRight') updateCarousel(currentSlide + 1);
  });

  // =========================================================
  // 8. SKILLS MATRIX FILTER
  // =========================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skills-grid:not(.soft-skills-grid) .skill-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // =========================================================
  // 9. RFM PROJECT SCREENSHOT GALLERY
  // =========================================================
  const rfmGallery = document.querySelector('.rfm-gallery');

  if (rfmGallery) {
    const rfmImages = [
      'assets/images/rfm1.png',
      'assets/images/rfm2.png',
      'assets/images/rfm3.png',
      'assets/images/rfm4.png'
    ];

    const rfmMainImage = rfmGallery.querySelector('.rfm-gallery-image');
    const rfmThumbs = rfmGallery.querySelectorAll('.rfm-thumb');
    const rfmCounter = rfmGallery.querySelector('.rfm-gallery-counter');
    const rfmPrev = rfmGallery.querySelector('.rfm-gallery-prev');
    const rfmNext = rfmGallery.querySelector('.rfm-gallery-next');

    let rfmCurrent = 0;
    let rfmTimer;

    function showRfmImage(index) {
      rfmCurrent = (index + rfmImages.length) % rfmImages.length;

      if (rfmMainImage) {
        rfmMainImage.style.opacity = '0';
        setTimeout(() => {
          rfmMainImage.src = rfmImages[rfmCurrent];
          rfmMainImage.style.opacity = '1';
        }, 120);
      }

      rfmThumbs.forEach((thumb, idx) => {
        const active = idx === rfmCurrent;
        thumb.classList.toggle('active', active);
        thumb.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      if (rfmCounter) {
        rfmCounter.textContent = `${String(rfmCurrent + 1).padStart(2, '0')} / 04`;
      }
    }

    function restartRfmAutoplay() {
      clearInterval(rfmTimer);
      rfmTimer = setInterval(() => showRfmImage(rfmCurrent + 1), 4500);
    }

    rfmPrev?.addEventListener('click', () => {
      showRfmImage(rfmCurrent - 1);
      restartRfmAutoplay();
    });

    rfmNext?.addEventListener('click', () => {
      showRfmImage(rfmCurrent + 1);
      restartRfmAutoplay();
    });

    rfmThumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        showRfmImage(Number(thumb.dataset.index));
        restartRfmAutoplay();
      });
    });

    rfmMainImage?.addEventListener('click', () => {
      window.open(rfmImages[rfmCurrent], '_blank', 'noopener,noreferrer');
    });

    rfmGallery.addEventListener('mouseenter', () => clearInterval(rfmTimer));
    rfmGallery.addEventListener('mouseleave', restartRfmAutoplay);

    showRfmImage(0);
    restartRfmAutoplay();
  }

  // =========================================================
  // 10. INTERACTIVE PROJECT CASE STUDY MODALS
  // =========================================================
  const modalOverlay = document.getElementById('project-modal');
  const modalContentBox = document.getElementById('modal-details-content');
  const modalCloseBtn = document.querySelector('.modal-close-btn');

  const projectDetailsData = {
    rfm: {
      title: "Customer Segmentation — RFM Analysis",
      category: "Customer Analytics & Retention Strategy",
      tools: "Python, Pandas, NumPy, Streamlit, Plotly, RFM Scoring",
      problem: "Businesses often treat all customers the same way. This project segments customers by purchasing behaviour so that retention effort and budget go where they matter most.",
      solution: "Built an end-to-end Recency, Frequency, and Monetary (RFM) segmentation dashboard. Calculated behavioural metrics per customer, assigned quintile scores (1 to 5), and grouped 900 customers (built-in demo dataset) into 7 actionable segments: Champions, Loyal, Big Spenders, Regular, New / Promising, At Risk and Lost. Users can also upload their own transaction CSV.",
      impact: "Surfaced clear behavioural cohorts: Champions are about 26% of customers but generate about 65% of revenue, and 468 of 900 customers are flagged as high-risk, giving a data-backed basis for targeted retention campaigns.",
      bullets: [
        "Scored every customer on Recency, Frequency and Monetary value, with risk bands, AOV and a CLV proxy.",
        "Built an interactive Streamlit dashboard: Executive view, RFM Explorer, Customer 360 and revenue-concentration (Pareto) analysis.",
        "Added a Retention Planner that splits a campaign budget across segments by customer value, revenue share and high-risk concentration."
      ]
    },
    supplychain: {
      title: "Supply Chain Inventory Optimization",
      category: "Operations & Demand Forecasting",
      tools: "Python, Pandas, MS Excel, Seaborn, Inventory Modeling",
      problem: "Operational inefficiencies caused erratic warehouse inventory swings, leading to frequent stockouts on fast-moving SKUs alongside costly storage overstock on slow-moving inventory.",
      solution: "Analyzed 12 months of historical purchase orders, lead-time variances, and sales volume trends. Constructed dynamic safety stock models and optimal Reorder Point (ROP) thresholds based on fluctuating demand cycles.",
      impact: "Uncovered hidden stock-level trends, producing a quantitative replenishment plan that slashed projected stockout probability to under 2.5% and trimmed surplus warehouse holding costs.",
      bullets: [
        "Identified seasonal demand spikes and lead-time anomalies across regional fulfillment hubs.",
        "Calculated Economic Order Quantity (EOQ) and Reorder Points (ROP) per category.",
        "Designed executive reporting summaries highlighting inventory turnover ratios."
      ]
    },
    powerbi: {
      title: "Global Sales Performance & Executive BI Dashboard",
      category: "Business Intelligence & Executive KPI Reporting",
      tools: "Power BI, DAX, SQL, Excel, Data Modeling",
      problem: "Company leadership relied on disjointed spreadsheets across international sales branches, making timely quarterly revenue tracking and profit margin analysis slow and error-prone.",
      solution: "Developed an interactive Power BI dashboard powered by structured DAX measures, automated data transformation queries, and intuitive drill-down visual layers (revenue by region, sales reps, and product categories).",
      impact: "Provided unified, real-time visibility into $2M annual revenue, highlighting a 24% year-over-year growth trajectory and identifying high-margin product channels.",
      bullets: [
        "Authored complex DAX calculations for Year-to-Date (YTD) and Quarter-over-Quarter growth.",
        "Created dynamic interactive filtering by territory, sales rep, and product hierarchy.",
        "Optimized data models for instant query response and executive reporting clarity."
      ]
    }
  };

  document.querySelectorAll('.open-case-study').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-project');
      const data = projectDetailsData[projKey];
      if (!data) return;

      if (modalContentBox) {
        modalContentBox.innerHTML = `
          <div style="margin-bottom: 20px;">
            <span class="section-tag" style="margin-bottom: 8px;">${data.category}</span>
            <h2 style="font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 8px;">${data.title}</h2>
            <p style="font-family: var(--font-mono); font-size: 13px; color: var(--accentColor);">${data.tools}</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px; font-size: 15px; line-height: 1.7; color: #cbd5e1;">
            <div>
              <h4 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; margin-bottom: 6px; font-family: var(--font-mono);">The Challenge</h4>
              <p style="font-weight: 300;">${data.problem}</p>
            </div>

            <div>
              <h4 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--accentColor); margin-bottom: 6px; font-family: var(--font-mono);">Analytical Solution</h4>
              <p style="font-weight: 300;">${data.solution}</p>
            </div>

            <div>
              <h4 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; margin-bottom: 6px; font-family: var(--font-mono);">Key Achievements</h4>
              <ul style="padding-left: 20px; color: #94a3b8; font-size: 14px;">
                ${data.bullets.map(b => `<li style="margin-bottom: 6px;">${b}</li>`).join('')}
              </ul>
            </div>

            <div style="background: rgba(94, 234, 212, 0.08); border: 1px solid rgba(94, 234, 212, 0.3); border-radius: 12px; padding: 18px;">
              <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--accentColor); margin-bottom: 4px; font-family: var(--font-mono);">Business Impact</h4>
              <p style="color: #e2e8f0; font-weight: 500; font-size: 14px; margin: 0;">${data.impact}</p>
            </div>
          </div>
        `;
      }

      modalOverlay?.classList.add('active');
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => modalOverlay?.classList.remove('active'));
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  // =========================================================
  // 10. RESUME MODAL & PRINT/DOWNLOAD
  // =========================================================
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtns = document.querySelectorAll('.open-resume-modal');
  const closeResumeBtn = document.querySelector('.close-resume-modal');

  openResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      resumeModal?.classList.add('active');
    });
  });

  closeResumeBtn?.addEventListener('click', () => resumeModal?.classList.remove('active'));
  resumeModal?.addEventListener('click', (e) => {
    if (e.target === resumeModal) resumeModal.classList.remove('active');
  });

  // =========================================================
  // 11. ONE-CLICK CLIPBOARD COPY WITH TOAST NOTIFICATION
  // =========================================================
  const toast = document.getElementById('toast-notice');
  const toastMessage = document.getElementById('toast-message');

  function showToast(msg) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  document.querySelectorAll('.copy-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = btn.getAttribute('data-copy');
      if (val) {
        navigator.clipboard.writeText(val).then(() => {
          showToast(`Copied to clipboard: ${val}`);
        }).catch(() => {
          showToast(`Value: ${val}`);
        });
      }
    });
  });

  // Contact form submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name')?.value;
      showToast(`Thank you, ${name || 'friend'}! Your message has been sent.`);
      contactForm.reset();
    });
  }

  // Smooth Back to Top
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
