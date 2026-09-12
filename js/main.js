/**
 * LISA K. — CMD AVANS HOGESCHOOL
 * INTERACTIVE SCRIPTS & CONSTELLATION NODES
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Cursor Ambient Follower ---
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && window.innerWidth > 768) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateGlow = () => {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  }

  // --- 2. Site Header Scrolled Class ---
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- 3. Mobile Navigation Drawer ---
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0)';
    });

    mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        menuBtn.style.transform = 'rotate(0)';
      });
    });
  }

  // --- 4. Interactive Starburst Project Nodes (Hover Preview & Click-through) ---
  const starNodes = document.querySelectorAll('.star-node');
  starNodes.forEach(node => {
    // Explicit mouseenter & mouseleave guarantees preview popup shows immediately
    node.addEventListener('mouseenter', () => {
      node.classList.add('active-preview');
    });

    node.addEventListener('mouseleave', () => {
      node.classList.remove('active-preview');
    });

    // Touch support for mobile devices
    node.addEventListener('touchstart', (e) => {
      // Toggle active preview on first tap
      if (!node.classList.contains('active-preview')) {
        e.preventDefault();
        starNodes.forEach(n => n.classList.remove('active-preview'));
        node.classList.add('active-preview');
      }
    }, { passive: false });

    // Click handler for navigation
    node.addEventListener('click', (e) => {
      // If clicking a direct link inside preview card, let it trigger naturally
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        return;
      }
      const targetUrl = node.getAttribute('data-target-url') || node.getAttribute('href');
      if (targetUrl) {
        window.location.href = targetUrl;
      }
    });
  });

  // --- 5. Lightbox Modal for High-Res Project Mockups ---
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  const openLightbox = (src, caption) => {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const img = trigger.querySelector('img') || trigger;
      const src = trigger.getAttribute('data-full-img') || img.getAttribute('src');
      const caption = trigger.getAttribute('data-caption') || img.getAttribute('alt');
      openLightbox(src, caption);
    });
  });

  // --- 6. Toast Notification Helper ---
  const toastMsg = document.getElementById('toast-msg');
  const showToast = (message) => {
    if (!toastMsg) return;
    toastMsg.textContent = message;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 3800);
  };

  // --- 7. Contact Form Handler ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('name');
      const nameVal = nameInput ? nameInput.value.trim() : 'Friend';
      showToast(`✨ Thank you, ${nameVal}! Your message has been dispatched.`);
      contactForm.reset();
    });
  }

  // --- 8. Copy to Clipboard ---
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`📋 Copied: "${textToCopy}"`);
        });
      }
    });
  });

  // --- 9. Colliding Milky Ways Stardust Particle Simulation on "Lisa" ---
  const lisaWrap = document.getElementById('lisa-galaxy-wrap');
  const lisaCanvas = document.getElementById('lisa-canvas');

  if (lisaWrap && lisaCanvas) {
    const ctx = lisaCanvas.getContext('2d');
    let animId = null;
    let isHovered = false;
    let mousePos = { x: 0, y: 0, active: false };
    let dpr = window.devicePixelRatio || 1;
    let width = 520;
    let height = 340;

    const resizeCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = lisaCanvas.getBoundingClientRect();
      width = rect.width || 520;
      height = rect.height || 340;
      lisaCanvas.width = width * dpr;
      lisaCanvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Palettes inspired by auroral cyan & deep cosmos violet
    const colorsG1 = ['#ffffff', '#a1acf0', '#50e3c2', '#dce4ff', '#ffffff'];
    const colorsG2 = ['#ffffff', '#c084fc', '#ffd166', '#e0aaff', '#ffffff'];

    class CosmicStar {
      constructor(galaxyId) {
        this.galaxyId = galaxyId;
        this.reset();
      }

      reset() {
        this.arm = Math.floor(Math.random() * 2);
        this.distFromCenter = Math.pow(Math.random(), 1.6) * 115 + 6;
        this.baseAngle = (this.arm * Math.PI) + (this.distFromCenter * 0.052) + (Math.random() - 0.5) * 0.45;
        this.orbitalSpeed = (this.galaxyId === 1 ? 1 : -1) * (0.014 + (14 / (this.distFromCenter + 15)) * 0.035);
        this.currentAngle = this.baseAngle;

        this.size = Math.random() < 0.15 ? Math.random() * 2.2 + 1.8 : Math.random() * 1.5 + 0.6;
        this.color = this.galaxyId === 1
          ? colorsG1[Math.floor(Math.random() * colorsG1.length)]
          : colorsG2[Math.floor(Math.random() * colorsG2.length)];
        this.baseAlpha = Math.random() * 0.55 + 0.45;
        this.twinkleSpeed = Math.random() * 0.08 + 0.03;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.isCrossFlare = Math.random() < 0.12;

        this.x = 0;
        this.y = 0;
      }

      update(g1Center, g2Center, g1Angle, g2Angle, collisionFactor, time) {
        const center = this.galaxyId === 1 ? g1Center : g2Center;
        const gAngle = this.galaxyId === 1 ? g1Angle : g2Angle;

        this.currentAngle += this.orbitalSpeed;

        const totalAngle = this.currentAngle + gAngle;
        let targetX = center.x + Math.cos(totalAngle) * this.distFromCenter;
        let targetY = center.y + Math.sin(totalAngle) * (this.distFromCenter * 0.62);

        // Gravitational tidal flinging during collision
        if (collisionFactor > 0.05) {
          const otherCenter = this.galaxyId === 1 ? g2Center : g1Center;
          const dx = otherCenter.x - targetX;
          const dy = otherCenter.y - targetY;
          const distToOther = Math.sqrt(dx * dx + dy * dy) + 1;
          const tidalForce = (collisionFactor * 2800) / (distToOther * distToOther + 800);
          targetX += (dx / distToOther) * tidalForce;
          targetY += (dy / distToOther) * tidalForce;
        }

        // Interactive mouse ripple swirl
        if (mousePos.active) {
          const mdx = mousePos.x - targetX;
          const mdy = mousePos.y - targetY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 120) {
            const swirlForce = (1 - mdist / 120) * 8;
            targetX += -mdy / mdist * swirlForce;
            targetY += mdx / mdist * swirlForce;
          }
        }

        this.x += (targetX - this.x) * 0.28;
        this.y += (targetY - this.y) * 0.28;
        this.twinklePhase += this.twinkleSpeed;
      }

      draw(ctx) {
        const alpha = Math.max(0.1, Math.min(1, this.baseAlpha + Math.sin(this.twinklePhase) * 0.35));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 3.5;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.isCrossFlare && alpha > 0.6) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(this.x - this.size * 2.8, this.y);
          ctx.lineTo(this.x + this.size * 2.8, this.y);
          ctx.moveTo(this.x, this.y - this.size * 2.8);
          ctx.lineTo(this.x, this.y + this.size * 2.8);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const totalStarsPerGalaxy = 120;
    const stars = [];
    for (let i = 0; i < totalStarsPerGalaxy; i++) {
      stars.push(new CosmicStar(1));
      stars.push(new CosmicStar(2));
    }

    let time = 0;
    let fadeOpacity = 0;

    const render = () => {
      time += 0.022;

      if (isHovered) {
        fadeOpacity = Math.min(1, fadeOpacity + 0.07);
      } else {
        fadeOpacity = Math.max(0, fadeOpacity - 0.04);
      }

      ctx.clearRect(0, 0, width, height);

      if (fadeOpacity > 0.01) {
        ctx.globalCompositeOperation = 'lighter';

        const cx = width / 2;
        const cy = height / 2;

        const orbitRadius = 78 + Math.sin(time * 0.85) * 22;
        const orbitAngle = time * 0.75;

        const g1Center = {
          x: cx + Math.cos(orbitAngle) * orbitRadius,
          y: cy + Math.sin(orbitAngle) * (orbitRadius * 0.45)
        };
        const g2Center = {
          x: cx + Math.cos(orbitAngle + Math.PI) * orbitRadius,
          y: cy + Math.sin(orbitAngle + Math.PI) * (orbitRadius * 0.45)
        };

        const g1Angle = time * 0.8;
        const g2Angle = -time * 0.9;
        const collisionFactor = Math.max(0, (1 - (orbitRadius - 56) / 44));

        [g1Center, g2Center].forEach((c, idx) => {
          const coreGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 45);
          const coreColor = idx === 0 ? 'rgba(80, 227, 194, ' : 'rgba(192, 132, 252, ';
          coreGrad.addColorStop(0, `${coreColor}${0.35 * fadeOpacity})`);
          coreGrad.addColorStop(0.5, `${coreColor}${0.12 * fadeOpacity})`);
          coreGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 45, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = fadeOpacity;
        stars.forEach(star => {
          star.update(g1Center, g2Center, g1Angle, g2Angle, collisionFactor, time);
          star.draw(ctx);
        });

        ctx.globalCompositeOperation = 'source-over';
      }

      if (isHovered || fadeOpacity > 0.01) {
        animId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animId);
        animId = null;
        ctx.clearRect(0, 0, width, height);
      }
    };

    lisaWrap.addEventListener('mouseenter', (e) => {
      isHovered = true;
      lisaWrap.classList.add('active-milkyway');
      resizeCanvas();
      const rect = lisaCanvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      mousePos.active = true;
      if (!animId) {
        animId = requestAnimationFrame(render);
      }
    });

    lisaWrap.addEventListener('mousemove', (e) => {
      const rect = lisaCanvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      mousePos.active = true;
    });

    lisaWrap.addEventListener('mouseleave', () => {
      isHovered = false;
      mousePos.active = false;
      lisaWrap.classList.remove('active-milkyway');
    });
  }
});
