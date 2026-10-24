if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {

  // Preloader removal handled by CSS animation (fadeOut) & sessionStorage
  const preloader = document.getElementById("preloader");
  if (preloader) {
    if (!sessionStorage.getItem("preloaderShown")) {
      sessionStorage.setItem("preloaderShown", "true");
    }
    setTimeout(() => {
      preloader.style.display = "none";
    }, 2800);
  }

  // All animatable child elements across portfolio sections
  const CHILD_SELECTOR = ".proj-card, .skill-card, .philosophy-inner, .timeline-item, .journey-entry, .what-i-bring-inner, .principle-card, .lab-panel";

  const revealChildren = (parent, baseDelay = 50) => {
    const children = parent.querySelectorAll(CHILD_SELECTOR);
    children.forEach((child, index) => {
      // Skip project cards on the projects page (they have their own animation)
      if (document.body.classList.contains('projects-page') && child.classList.contains('proj-card')) {
        return;
      }
      setTimeout(() => {
        child.classList.add("child-visible");
      }, baseDelay + index * 90);
    });
  };

  const revealTargets = document.querySelectorAll(".content-section, .philosophy-section, .hero-container, .what-i-bring-section, .lab-section");

  // Reduced motion: skip animations entirely and reveal immediately
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Niketh dust disintegration animation
  class NikethDustDisintegration {
    constructor() {
      this.wrap = document.querySelector('.first-name-wrap');
      this.text = document.getElementById('heroFirstName');
      this.canvas = document.getElementById('firstNameCanvas');
      if (!this.wrap || !this.text || !this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particlesLower = [];
      this.particlesUpper = [];
      this.animating = false;
      this.direction = 0;
      this.progress = 0;
      this.duration = 950;
      this.startTime = 0;
      this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.rafId = null;

      if (this.prefersReduced) return;

      this.wrap.addEventListener('mouseenter', () => this.play('toUpper'));
      this.wrap.addEventListener('mouseleave', () => this.play('toLower'));

      const init = () => {
        const rect = this.wrap.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.initCanvas();
        } else {
          setTimeout(init, 100);
        }
      };

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
      } else {
        window.addEventListener('load', init);
      }

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.initCanvas(), 150);
      });
    }

    initCanvas() {
      const rect = this.wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const style = window.getComputedStyle(this.text);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = style.fontWeight;
      const fontFamily = style.fontFamily;
      const letterSpacing = style.letterSpacing;

      const extra = Math.round(fontSize * 2.5);
      this.cssW = Math.ceil(rect.width + extra);
      this.cssH = Math.ceil(rect.height + extra * 0.6);

      this.canvas.style.width = this.cssW + 'px';
      this.canvas.style.height = this.cssH + 'px';

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.dpr = dpr;
      this.canvas.width = Math.round(this.cssW * dpr);
      this.canvas.height = Math.round(this.cssH * dpr);
      this.ctx.scale(dpr, dpr);

      this.offX = extra / 2;
      this.offY = extra * 0.3;

      this.sample('Niketh', fontSize, fontWeight, fontFamily, letterSpacing, 'lower');
      this.sample('NIKETH', fontSize, fontWeight, fontFamily, letterSpacing, 'upper');
    }

    sample(text, fontSize, fontWeight, fontFamily, letterSpacing, type) {
      const off = document.createElement('canvas');
      off.width = Math.ceil(fontSize * 10);
      off.height = Math.ceil(fontSize * 2);
      const octx = off.getContext('2d');
      octx.fillStyle = '#ffffff';
      octx.font = fontWeight + ' ' + fontSize + 'px ' + fontFamily;
      octx.textBaseline = 'top';
      octx.letterSpacing = letterSpacing || '0px';
      octx.fillText(text, 2, 2);

      const img = octx.getImageData(0, 0, off.width, off.height).data;
      const particles = [];

      const step = 2;
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const idx = (y * off.width + x) * 4;
          if (img[idx + 3] > 100) {
            const tx = x - off.width / 2;
            const ty = y - fontSize * 0.1;
            const px = this.offX + (this.cssW / 2) + tx;
            const py = this.offY + (this.cssH / 2) + ty;
            particles.push({
              x: px, y: py,
              ox: px, oy: py,
              vx: (Math.random() - 0.4) * 1.8,
              vy: - (Math.random() * 1.2 + 0.4),
              size: Math.random() * 1.2 + 0.6,
              alpha: Math.random() * 0.6 + 0.4
            });
          }
        }
      }

      if (type === 'lower') this.particlesLower = particles;
      else this.particlesUpper = particles;
    }

    play(dir) {
      if (this.prefersReduced) return;
      if (this.animating && ((dir === 'toUpper' && this.direction === 1) || (dir === 'toLower' && this.direction === -1))) return;
      this.direction = dir === 'toUpper' ? 1 : -1;
      this.progress = dir === 'toUpper' ? 0 : 1;
      this.animating = true;
      this.startTime = performance.now();
      if (!this.rafId) this.animate();
    }

    animate(now) {
      if (!this.startTime) this.startTime = now;
      const elapsed = now - this.startTime;
      const t = Math.min(elapsed / this.duration, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.progress = this.direction === 1 ? eased : 1 - eased;

      this.ctx.clearRect(0, 0, this.cssW, this.cssH);
      this.ctx.fillStyle = '#ffffff';

      if (this.direction === 1) {
        for (let i = 0; i < this.particlesLower.length; i++) {
          const p = this.particlesLower[i];
          const dx = p.vx * this.progress * 18 + (Math.random() - 0.5) * 2;
          const dy = p.vy * this.progress * 14 + (Math.random() - 0.5) * 2;
          const alpha = Math.max(0, p.alpha * (1 - this.progress));
          this.ctx.globalAlpha = alpha;
          this.ctx.beginPath();
          this.ctx.arc(p.ox + dx, p.oy + dy, p.size * (1 - this.progress * 0.4), 0, Math.PI * 2);
          this.ctx.fill();
        }
        for (let i = 0; i < this.particlesUpper.length; i++) {
          const p = this.particlesUpper[i];
          const dx = -p.vx * (1 - this.progress) * 16 + (Math.random() - 0.5) * 2;
          const dy = -p.vy * (1 - this.progress) * 12 + (Math.random() - 0.5) * 2;
          const alpha = Math.max(0, p.alpha * this.progress);
          this.ctx.globalAlpha = alpha;
          this.ctx.beginPath();
          this.ctx.arc(p.ox + dx, p.oy + dy, p.size * (this.progress * 0.8 + 0.2), 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else {
        for (let i = 0; i < this.particlesUpper.length; i++) {
          const p = this.particlesUpper[i];
          const dx = p.vx * this.progress * 18 + (Math.random() - 0.5) * 2;
          const dy = p.vy * this.progress * 14 + (Math.random() - 0.5) * 2;
          const alpha = Math.max(0, p.alpha * (1 - this.progress));
          this.ctx.globalAlpha = alpha;
          this.ctx.beginPath();
          this.ctx.arc(p.ox + dx, p.oy + dy, p.size * (1 - this.progress * 0.4), 0, Math.PI * 2);
          this.ctx.fill();
        }
        for (let i = 0; i < this.particlesLower.length; i++) {
          const p = this.particlesLower[i];
          const dx = -p.vx * (1 - this.progress) * 16 + (Math.random() - 0.5) * 2;
          const dy = -p.vy * (1 - this.progress) * 12 + (Math.random() - 0.5) * 2;
          const alpha = Math.max(0, p.alpha * this.progress);
          this.ctx.globalAlpha = alpha;
          this.ctx.beginPath();
          this.ctx.arc(p.ox + dx, p.oy + dy, p.size * (this.progress * 0.8 + 0.2), 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      this.ctx.globalAlpha = 1;

      if (t < 1) {
        this.rafId = requestAnimationFrame((n) => this.animate(n));
      } else {
        this.animating = false;
        this.rafId = null;
      }
    }
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    document.querySelectorAll(CHILD_SELECTOR).forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.classList.add("child-visible");
    });
    document.querySelectorAll(".content-section, .philosophy-section, .hero-container, .what-i-bring-section, .lab-section").forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  const observerOptions = {
    threshold: 0.05,
    rootMargin: "0px 0px 50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealChildren(entry.target, 50);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const checkVisibility = () => {
    revealTargets.forEach((el) => {
      // Check if element is in viewport on page load / browser reload
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (alreadyVisible) {
        el.classList.add("is-visible");
        revealChildren(el, 80);
      } else {
        observer.observe(el);
      }
    });
  };

  checkVisibility();
  window.addEventListener("load", checkVisibility, { once: true });
  try {
    new NikethDustDisintegration();
  } catch (e) {
    // fail silently
  }

  /* =========================================================
     CINEMATIC AVENGERS: INFINITY WAR DUST DISINTEGRATION (AI)
  ========================================================= */
  class AiDustDisintegration {
    constructor() {
      this.lastName = document.getElementById("heroLastName");
      this.wrap = document.getElementById("aiWrap");
      this.lower = document.getElementById("aiLower");
      this.upper = document.getElementById("aiUpper");
      this.canvas = document.getElementById("aiCanvas");
      if (!this.lastName || !this.wrap || !this.lower || !this.upper || !this.canvas) return;

      this.ctx = this.canvas.getContext("2d");
      this.progress = 0.0;
      this.targetProgress = 0.0;
      this.animating = false;
      this.lastTime = 0;
      this.duration = 550; // Fluid, continuous 550ms transition (no pause/hold)

      this.lowerParticles = [];
      this.upperParticles = [];

      this.prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      this.setupEvents();

      const initWhenReady = () => {
        const rect = this.wrap.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.initCanvasAndParticles();
        } else {
          setTimeout(initWhenReady, 120);
        }
      };

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(initWhenReady);
      } else {
        window.addEventListener("load", initWhenReady);
      }

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.initCanvasAndParticles();
        }, 120);
      });
    }

    initCanvasAndParticles() {
      if (this.prefersReduced) return;

      const rect = this.wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Ensure lower element is rendered for measurement
      const prevLowerOp = this.lower.style.opacity;
      const prevUpperOp = this.upper.style.opacity;
      this.lower.style.opacity = "1";
      this.upper.style.opacity = "0";

      const style = window.getComputedStyle(this.lower);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = style.fontWeight || "800";
      const fontFamily = style.fontFamily || "'Inter', sans-serif";
      const letterSpacing = style.letterSpacing || "-2px";

      // 1. Measure exact typographic baseline via subpixel probe
      const probe = document.createElement("span");
      probe.style.display = "inline-block";
      probe.style.width = "0";
      probe.style.height = "0";
      probe.style.verticalAlign = "baseline";
      this.wrap.appendChild(probe);
      const probeRect = probe.getBoundingClientRect();
      const wrapRect = this.wrap.getBoundingClientRect();
      const exactBaselineOffset = probeRect.top - wrapRect.top;
      this.wrap.removeChild(probe);

      // 2. Measure lower 'ai' and upper 'AI' bounding boxes
      const lowerRect = this.lower.getBoundingClientRect();
      this.upper.style.opacity = "1";
      const upperRect = this.upper.getBoundingClientRect();
      this.upper.style.opacity = prevUpperOp;
      this.lower.style.opacity = prevLowerOp;

      // Lock aiWrap width to max width so bounding box is identical and stable
      const maxWidth = Math.ceil(Math.max(lowerRect.width, upperRect.width));
      this.wrap.style.width = `${maxWidth}px`;

      const extraLeft = Math.round(fontSize * 0.25);
      const extraRight = Math.round(fontSize * 1.8);
      const extraTop = Math.round(fontSize * 1.0);
      const extraBottom = Math.round(fontSize * 0.35);

      const cssWidth = Math.ceil(maxWidth + extraLeft + extraRight);
      const cssHeight = Math.ceil(wrapRect.height + extraTop + extraBottom);

      this.canvas.style.left = `-${extraLeft}px`;
      this.canvas.style.top = `-${extraTop}px`;
      this.canvas.style.width = `${cssWidth}px`;
      this.canvas.style.height = `${cssHeight}px`;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.dpr = dpr;
      this.canvas.width = Math.round(cssWidth * dpr);
      this.canvas.height = Math.round(cssHeight * dpr);

      this.cssWidth = cssWidth;
      this.cssHeight = cssHeight;
      this.offsetX = extraLeft;
      this.offsetY = extraTop;
      this.fontSize = fontSize;
      this.baselineY = extraTop + exactBaselineOffset;

      this.sampleParticles(fontWeight, fontSize, fontFamily, letterSpacing);
    }

    sampleParticles(fontWeight, fontSize, fontFamily, letterSpacing) {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = this.canvas.width;
      offCanvas.height = this.canvas.height;
      const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
      offCtx.scale(this.dpr, this.dpr);

      const fontSpec = `${fontWeight} ${fontSize}px ${fontFamily}`;
      offCtx.font = fontSpec;
      offCtx.letterSpacing = letterSpacing;
      offCtx.fillStyle = "#FFFFFF";
      offCtx.textBaseline = "alphabetic";

      // 1. Sample lowercase "ai" at exact measured baseline
      offCtx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      offCtx.fillText("ai", this.offsetX, this.baselineY);

      const lowerImgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const lowerData = lowerImgData.data;

      const silverColors = ["#FFFFFF", "#F2F2F2", "#EBEBEB", "#E0E0E0", "#BFC3C8", "#8E8E93", "#6C6C70"];
      const step = Math.max(2, Math.round(this.dpr * 2.2));

      let lowerMinX = Infinity, lowerMaxX = -Infinity;
      const tempLower = [];

      for (let y = 0; y < offCanvas.height; y += step) {
        for (let x = 0; x < offCanvas.width; x += step) {
          const idx = (y * offCanvas.width + x) * 4;
          const alpha = lowerData[idx + 3];
          if (alpha > 45) {
            const cssX = x / this.dpr;
            const cssY = y / this.dpr;
            if (cssX < lowerMinX) lowerMinX = cssX;
            if (cssX > lowerMaxX) lowerMaxX = cssX;
            tempLower.push({ x: cssX, y: cssY, alphaVal: alpha / 255 });
          }
        }
      }

      const widthSpan = Math.max(1, lowerMaxX - lowerMinX);
      const speedScale = fontSize / 85;

      this.lowerParticles = tempLower.map((pt) => {
        const normX = (pt.x - lowerMinX) / widthSpan;
        const delay = normX * 0.32 + Math.random() * 0.12;

        return {
          originX: pt.x,
          originY: pt.y,
          x: pt.x,
          y: pt.y,
          delay: delay,
          vx: (Math.random() * 2.2 + 1.0) * speedScale,
          vy: -(Math.random() * 1.8 + 0.5) * speedScale,
          wobbleSpeed: Math.random() * 0.08 + 0.03,
          wobbleAmp: (Math.random() * 1.6 + 0.5) * speedScale,
          wobblePhase: Math.random() * Math.PI * 2,
          size: (Math.random() * 2.2 + 0.9) * Math.min(1.4, fontSize / 70),
          color: silverColors[Math.floor(Math.random() * silverColors.length)],
          baseAlpha: pt.alphaVal
        };
      });

      // 2. Sample uppercase "AI" at exact same measured baseline
      offCtx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      offCtx.fillText("AI", this.offsetX, this.baselineY);

      const upperImgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const upperData = upperImgData.data;

      const redColors = ["#F50514", "#FF2E3B", "#D60411", "#FF4D58", "#FF6B75"];
      let upperMinX = Infinity, upperMaxX = -Infinity;
      const tempUpper = [];

      for (let y = 0; y < offCanvas.height; y += step) {
        for (let x = 0; x < offCanvas.width; x += step) {
          const idx = (y * offCanvas.width + x) * 4;
          const alpha = upperData[idx + 3];
          if (alpha > 45) {
            const cssX = x / this.dpr;
            const cssY = y / this.dpr;
            if (cssX < upperMinX) upperMinX = cssX;
            if (cssX > upperMaxX) upperMaxX = cssX;
            tempUpper.push({ x: cssX, y: cssY, alphaVal: alpha / 255 });
          }
        }
      }

      const upperWidthSpan = Math.max(1, upperMaxX - upperMinX);

      this.upperParticles = tempUpper.map((pt) => {
        const normX = (pt.x - upperMinX) / upperWidthSpan;
        const delay = 0.28 + normX * 0.26 + Math.random() * 0.12;

        return {
          targetX: pt.x,
          targetY: pt.y,
          sourceX: pt.x + (Math.random() * 36 + 14) * speedScale,
          sourceY: pt.y - (Math.random() * 30 + 10) * speedScale,
          delay: delay,
          wobbleAmp: (Math.random() * 1.4 + 0.4) * speedScale,
          size: (Math.random() * 2.2 + 0.9) * Math.min(1.4, fontSize / 70),
          color: redColors[Math.floor(Math.random() * redColors.length)],
          baseAlpha: pt.alphaVal
        };
      });
    }

    setupEvents() {
      // Hover event listeners attached EXCLUSIVELY to this.wrap (#aiWrap)
      this.wrap.addEventListener("mouseenter", () => {
        this.triggerForward();
      });

      this.wrap.addEventListener("mouseleave", () => {
        this.triggerReverse();
      });

      // Mobile touch interaction exclusively on this.wrap
      let touchActive = false;
      this.wrap.addEventListener(
        "touchstart",
        (e) => {
          touchActive = !touchActive;
          if (touchActive) {
            this.triggerForward();
          } else {
            this.triggerReverse();
          }
          e.stopPropagation();
        },
        { passive: true }
      );

      document.addEventListener("touchstart", (e) => {
        if (!this.wrap.contains(e.target) && touchActive) {
          touchActive = false;
          this.triggerReverse();
        }
      });
    }

    triggerForward() {
      this.targetProgress = 1.0;
      if (this.prefersReduced) {
        this.lower.style.opacity = "0";
        this.upper.style.opacity = "1";
        this.upper.classList.add("is-materialized");
        return;
      }
      if (!this.animating) {
        this.animating = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.renderLoop.bind(this));
      }
    }

    triggerReverse() {
      this.targetProgress = 0.0;
      if (this.prefersReduced) {
        this.lower.style.opacity = "1";
        this.upper.style.opacity = "0";
        this.upper.classList.remove("is-materialized");
        return;
      }
      if (!this.animating) {
        this.animating = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.renderLoop.bind(this));
      }
    }

    renderLoop(now) {
      if (!this.animating) return;

      const dt = Math.min(32, now - (this.lastTime || now));
      this.lastTime = now;

      const step = dt / this.duration;

      if (this.targetProgress > this.progress) {
        this.progress = Math.min(1.0, this.progress + step);
      } else if (this.targetProgress < this.progress) {
        this.progress = Math.max(0.0, this.progress - step);
      }

      this.draw();

      if (Math.abs(this.progress - this.targetProgress) < 0.001) {
        this.progress = this.targetProgress;
        this.animating = false;
        this.draw();
        return;
      }

      requestAnimationFrame(this.renderLoop.bind(this));
    }

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Default state: solid lowercase "ai", upper hidden
      if (this.progress <= 0.001) {
        this.lower.style.opacity = "1";
        this.upper.style.opacity = "0";
        this.upper.classList.remove("is-materialized");
        return;
      }

      // Fully materialized state: solid uppercase "AI" with subtle red glow
      if (this.progress >= 0.999) {
        this.lower.style.opacity = "0";
        this.upper.style.opacity = "1";
        this.upper.classList.add("is-materialized");
        return;
      }

      // In-flight animation: hide solid lower text, let particles create the transition
      this.lower.style.opacity = "0";

      this.ctx.save();
      this.ctx.scale(this.dpr, this.dpr);

      // 1. Draw disintegrating "ai" silver dust particles
      for (let i = 0; i < this.lowerParticles.length; i++) {
        const p = this.lowerParticles[i];

        if (this.progress < p.delay) {
          // Intact or micro-tremor before detaching
          let jx = 0, jy = 0;
          if (this.progress > p.delay - 0.04) {
            jx = (Math.random() - 0.5) * 0.6;
            jy = (Math.random() - 0.5) * 0.6;
          }
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = p.baseAlpha;
          this.ctx.fillRect(p.originX + jx - p.size / 2, p.originY + jy - p.size / 2, p.size, p.size);
        } else {
          // Detached dust floating to the right and slightly upwards
          const t = (this.progress - p.delay) / (1.0 - p.delay);
          const dist = Math.pow(t, 0.82) * 55;

          const currX = p.originX + p.vx * dist + Math.sin(t * 8 + p.wobblePhase) * p.wobbleAmp;
          const currY = p.originY + p.vy * dist + Math.cos(t * 6 + p.wobblePhase) * p.wobbleAmp;

          const alpha = Math.max(0, (1.0 - Math.pow(t, 1.25)) * p.baseAlpha);
          const curSize = Math.max(0.5, p.size * (1 - t * 0.35));

          if (alpha > 0.01) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillRect(currX - curSize / 2, currY - curSize / 2, curSize, curSize);
          }
        }
      }

      // 2. Draw materializing uppercase "AI" red particles
      for (let i = 0; i < this.upperParticles.length; i++) {
        const p = this.upperParticles[i];

        if (this.progress > p.delay) {
          const t = Math.min(1.0, (this.progress - p.delay) / (0.95 - p.delay));
          const ease = 1.0 - Math.pow(1.0 - t, 3);

          const wobble = (1 - ease) * Math.sin(t * Math.PI * 2) * p.wobbleAmp;
          const currX = p.sourceX + (p.targetX - p.sourceX) * ease + wobble;
          const currY = p.sourceY + (p.targetY - p.sourceY) * ease + wobble;

          const alpha = Math.min(1.0, t * 1.5 * p.baseAlpha);
          const curSize = p.size * (0.8 + 0.25 * ease);

          if (alpha > 0.01) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillRect(currX - curSize / 2, currY - curSize / 2, curSize, curSize);
          }
        }
      }

      // 3. Handle upper DOM element fade in
      if (this.progress >= 0.90) {
        const upperOpacity = Math.min(1, (this.progress - 0.90) / 0.10);
        this.upper.style.opacity = String(upperOpacity);
        if (this.progress >= 0.96) {
          this.upper.classList.add("is-materialized");
        } else {
          this.upper.classList.remove("is-materialized");
        }
      } else {
        this.upper.style.opacity = "0";
        this.upper.classList.remove("is-materialized");
      }

      this.ctx.restore();
    }
  }

  // Initialize on page
  // Contact button dropdown logic
  new AiDustDisintegration();

  // Contact dropdown toggle


  /* =========================================================
     LAB CATEGORY MICRO-INTERACTIONS
  ========================================================= */
  const labCategories = document.querySelectorAll('.lab-category');


  // Entrance animation with stagger
  if (labCategories.length > 0) {
    labCategories.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('lab-category-visible');
      }, index * 80);
    });
  }

  // Cursor-following ambient glow (disabled on touch devices)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    labCategories.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }
});

