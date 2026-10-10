/**
 * FameWeaver 2026 Editorial Platform - Main Controller
 * Smart Scroll-Position Restoration, Multi-View SPA Router,
 * Interactive Video Demo Player Modal, StorySense 87-score simulator,
 * Kinetic Mobile Pop-Up Drawer, and Dynamic Ribbon Counters.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. SMART SCROLL POSITION RESTORATION & MULTI-VIEW SPA ROUTER
  // =========================================================================
  const views = {
    'home': document.getElementById('view-home'),
    'not-ai': document.getElementById('view-not-ai'),
    'compare': document.getElementById('view-compare'),
    'contact': document.getElementById('view-contact')
  };

  let currentView = 'home';
  let isTransitioning = false;
  let lastScrollPosition = 0; // Smart scroll restoration tracker

  function switchView(targetViewId, scrollTargetId = null) {
    if (!views[targetViewId] || isTransitioning) {
      if (scrollTargetId) {
        scrollToElement(scrollTargetId);
      }
      return;
    }

    if (targetViewId === currentView && !scrollTargetId) {
      return;
    }

    // Capture exact scroll position when leaving Home view
    if (currentView === 'home' && targetViewId !== 'home') {
      lastScrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
    }

    isTransitioning = true;
    const currentEl = views[currentView];
    const nextEl = views[targetViewId];

    // GSAP cross-fade transition
    if (typeof gsap !== 'undefined') {
      gsap.to(currentEl, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          currentEl.classList.remove('active');
          currentEl.style.display = 'none';

          nextEl.style.display = 'block';
          nextEl.classList.add('active');
          const previousView = currentView;
          currentView = targetViewId;

          // Update URL hash without forcing hard jumps
          if (targetViewId === 'home') {
            history.pushState(null, '', window.location.pathname + (scrollTargetId ? '#' + scrollTargetId : ''));
          } else {
            history.pushState(null, '', '#' + targetViewId);
          }

          // Smart scroll handling:
          if (targetViewId === 'home') {
            if (scrollTargetId) {
              window.scrollTo({ top: 0, behavior: 'instant' });
              setTimeout(() => scrollToElement(scrollTargetId), 40);
            } else {
              // Restore exact previous scroll position instantly!
              window.scrollTo({ top: lastScrollPosition, behavior: 'instant' });
            }
          } else {
            // Sub-views start at top
            window.scrollTo({ top: 0, behavior: 'instant' });
          }

          gsap.fromTo(nextEl, 
            { opacity: 0, y: 12 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.3, 
              ease: 'power2.out',
              onComplete: () => {
                isTransitioning = false;
                if (targetViewId === 'home') {
                  initStorySenseAnimation();
                  initRibbonAnimation();
                }
              }
            }
          );
        }
      });
    } else {
      currentEl.classList.remove('active');
      currentEl.style.display = 'none';
      nextEl.style.display = 'block';
      nextEl.classList.add('active');
      currentView = targetViewId;

      if (targetViewId === 'home') {
        if (scrollTargetId) {
          scrollToElement(scrollTargetId);
        } else {
          window.scrollTo({ top: lastScrollPosition, behavior: 'instant' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      isTransitioning = false;
    }
  }

  function scrollToElement(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Handle Hash routing for Direct Links & Browser Back/Forward
  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'not-ai') {
      switchView('not-ai');
    } else if (hash === 'compare') {
      switchView('compare');
    } else if (hash === 'contact') {
      switchView('contact');
    } else if (hash.startsWith('path-') || ['simulator', 'how-it-works', 'our-story', 'pricing', 'contests', 'manifesto', 'help-center', 'reviews'].includes(hash)) {
      if (currentView !== 'home') {
        switchView('home', hash);
      } else {
        scrollToElement(hash);
      }
    } else {
      if (currentView !== 'home') {
        switchView('home');
      }
    }
  }

  window.addEventListener('popstate', handleHashChange);

  // Trigger buttons with data-view
  document.querySelectorAll('.view-nav-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = trigger.getAttribute('data-view') || 'home';
      const scrollTarget = trigger.getAttribute('data-scroll');
      closeMobileMenu();
      switchView(targetView, scrollTarget);
    });
  });

  // Regular in-page anchor links from navbar/footer
  document.querySelectorAll('.nav-section-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        if (currentView !== 'home') {
          e.preventDefault();
          switchView('home', targetId);
        }
      }
    });
  });

  // =========================================================================
  // 2. INTERACTIVE VIDEO DEMO PREVIEW MODAL
  // =========================================================================
  const videoModal = document.getElementById('video-demo-modal');
  const videoModalTitle = document.getElementById('video-modal-title');
  const demoVideoPlayer = document.getElementById('demo-video-player');
  const demoVideoSource = document.getElementById('demo-video-source');
  const closeVideoModalBtn = document.getElementById('close-video-modal');

  function openVideoModal(url, title) {
    if (!videoModal || !demoVideoPlayer) return;
    if (videoModalTitle) videoModalTitle.textContent = title || 'Interactive Demo Preview';
    demoVideoSource.src = url;
    demoVideoPlayer.load();
    videoModal.classList.remove('hidden');
    demoVideoPlayer.play().catch(() => {});
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(videoModal.querySelector('.modal-card'), 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' }
      );
    }
  }

  function closeVideoModal() {
    if (!videoModal || !demoVideoPlayer) return;
    demoVideoPlayer.pause();
    videoModal.classList.add('hidden');
    demoVideoSource.src = '';
  }

  document.querySelectorAll('.video-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const url = trigger.getAttribute('data-video-url');
      const title = trigger.getAttribute('data-video-title');
      if (url) openVideoModal(url, title);
    });
  });

  if (closeVideoModalBtn) closeVideoModalBtn.addEventListener('click', closeVideoModal);
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // =========================================================================
  // 3. KINETIC MOBILE POP-UP DRAWER
  // =========================================================================
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle-btn');
  const mobileMenu = document.getElementById('mobile-popup-menu');
  const mobileBackdrop = document.getElementById('mobile-popup-backdrop');
  const mobileCloseBtn = document.getElementById('mobile-popup-close');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  let isMenuOpen = false;

  function openMobileMenu() {
    if (isMenuOpen || !mobileMenu) return;
    isMenuOpen = true;
    mobileBackdrop.classList.remove('hidden');
    mobileMenu.classList.remove('hidden');
    hamburgerIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(mobileMenu,
        { y: -20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }

  function closeMobileMenu() {
    if (!isMenuOpen || !mobileMenu) return;
    isMenuOpen = false;
    hamburgerIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');

    if (typeof gsap !== 'undefined') {
      gsap.to(mobileMenu, {
        y: -15,
        opacity: 0,
        scale: 0.96,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          mobileMenu.classList.add('hidden');
          mobileBackdrop.classList.add('hidden');
        }
      });
    } else {
      mobileMenu.classList.add('hidden');
      mobileBackdrop.classList.add('hidden');
    }
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      if (isMenuOpen) closeMobileMenu();
      else openMobileMenu();
    });
  }

  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // =========================================================================
  // 4. STORYSENSE DIAGNOSTIC DATA & DYNAMIC COACHING
  // =========================================================================
  const metricsData = {
    character: {
      name: 'Character Arc & Interiority',
      score: 91,
      rank: 'Top 4% of Scored Manuscripts',
      diagnosis: 'Protagonist Elias demonstrates compelling moral friction and distinct voice rhythm in Act II.',
      finding: 'Secondary relationship with Miriam in Chapter 4 shows slight empathy drop due to compressed backstory.',
      coachingAction: 'Ground Chapter 4 dialogue in a tangible physical micro-conflict (e.g. withholding the ledger key) to heighten immediate emotional stakes without adding exposition.'
    },
    structure: {
      name: 'Narrative Structure & Beats',
      score: 89,
      rank: 'High Dramatic Velocity',
      diagnosis: 'The midpoint crisis lands precisely at 48% with a major reversal that alters Elias’s internal objective.',
      finding: 'Act II-B transition between scenes 14 and 16 has a minor pacing deceleration.',
      coachingAction: 'Compress the 3-page transit sequence between the harbor and the high court. Cut straight to the confrontation.'
    },
    dialogue: {
      name: 'Dialogue, Voice & Subtext',
      score: 85,
      rank: 'Industry Top-Quartile',
      diagnosis: '74% subtext density. Characters rarely state direct intention, creating strong unspoken theatrical tension.',
      finding: 'Minor exposition dump in scene 8 during the banquet table discussion.',
      coachingAction: 'Split Lord Vance’s historical recount into conflicting assertions challenged by surrounding guests.'
    },
    world: {
      name: 'Worldbuilding & Sensory Texture',
      score: 84,
      rank: 'Immersive Sensory Texture',
      diagnosis: 'Strong multisensory immersion across architectural and olfactory descriptions in the merchant quarter.',
      finding: 'Magic system limitation rules established in prologue risk contradiction during the storm sequence.',
      coachingAction: 'Re-anchor the physical toll of channeling early in Chapter 6 to reinforce climactic consequence.'
    },
    uniqueness: {
      name: 'Originality & High-Concept Angle',
      score: 82,
      rank: 'High-Concept Subversion',
      diagnosis: 'Fresh subversion of the unreliable archivist trope. Comp profile: "The Secret History" meets "Severance".',
      finding: 'Opening hook shares familiar tonal notes with canonical dark academia tropes.',
      coachingAction: 'Lead the opening sentence with the specific forensic artifact rather than the rainy courtyard setting.'
    },
    tension: {
      name: 'Tension & Micro-Stakes Rhythm',
      score: 78,
      rank: 'Needs Calibration',
      diagnosis: 'Climactic sequences deliver high pulse, but chapters 7–9 experience a plateau in immediate jeopardy.',
      finding: 'The stakes remain abstract and philosophical for 18 pages before direct physical threat resumes.',
      coachingAction: 'Introduce a ticking clock mechanism—such as a 48-hour warrant issued by the magistrate—to compress timeline friction.'
    }
  };

  // Animate StorySense Score Counter
  const scoreCounterEl = document.getElementById('storysense-score-num');
  let scoreAnimated = false;

  function initStorySenseAnimation() {
    if (scoreAnimated || !scoreCounterEl) return;
    scoreAnimated = true;
    const target = 87;
    const duration = 1500;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      scoreCounterEl.textContent = Math.floor(ease * target);
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        scoreCounterEl.textContent = target;
      }
    }
    requestAnimationFrame(updateCounter);
  }

  // StorySense Metric Row Click Interaction
  const metricRows = document.querySelectorAll('.metric-row');
  const coachTitle = document.getElementById('coach-metric-title');
  const coachScore = document.getElementById('coach-metric-score');
  const coachRank = document.getElementById('coach-metric-rank');
  const coachDiag = document.getElementById('coach-diagnosis');
  const coachFind = document.getElementById('coach-finding');
  const coachTip = document.getElementById('coach-tip');

  metricRows.forEach(row => {
    row.addEventListener('click', () => {
      const metricKey = row.getAttribute('data-metric');
      const data = metricsData[metricKey];
      if (!data) return;

      metricRows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');

      if (coachTitle) coachTitle.textContent = data.name;
      if (coachScore) coachScore.textContent = `${data.score}/100`;
      if (coachRank) coachRank.textContent = data.rank;
      if (coachDiag) coachDiag.textContent = data.diagnosis;
      if (coachFind) coachFind.textContent = data.finding;
      if (coachTip) coachTip.textContent = data.coachingAction;

      const coachPanel = document.getElementById('coaching-panel');
      if (coachPanel && typeof gsap !== 'undefined') {
        gsap.fromTo(coachPanel, { opacity: 0.7, scale: 0.99 }, { opacity: 1, scale: 1, duration: 0.25 });
      }
    });
  });

  // =========================================================================
  // 5. ANIMATED RIBBON COUNTERS
  // =========================================================================
  let ribbonAnimated = false;
  function initRibbonAnimation() {
    if (ribbonAnimated) return;
    const ribbon = document.getElementById('metric-ribbon');
    if (!ribbon) return;
    ribbonAnimated = true;

    animateValue('ribbon-awards', 0, 89976, 1600, true);
    animateValue('ribbon-blocks', 0, 22, 1000);
    animateValue('ribbon-techniques', 0, 16, 1000);
    animateValue('ribbon-competitions', 0, 1135, 1400, true);
  }

  function animateValue(id, start, end, duration, formatComma = false) {
    const obj = document.getElementById(id);
    if (!obj) return;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * (end - start) + start);
      obj.textContent = formatComma ? current.toLocaleString() : current;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        obj.textContent = formatComma ? end.toLocaleString() : end;
      }
    }
    requestAnimationFrame(step);
  }

  // =========================================================================
  // 6. THREE PATHS TAB SWITCHER (MOBILE)
  // =========================================================================
  const pathTabs = document.querySelectorAll('.tab-btn');
  const pathCards = document.querySelectorAll('.path-card');

  pathTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      pathTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-target');
      if (window.innerWidth < 768) {
        pathCards.forEach(card => {
          if (card.id === targetId) {
            card.classList.remove('hidden');
            card.classList.add('flex');
          } else {
            card.classList.add('hidden');
            card.classList.remove('flex');
          }
        });
      }
    });
  });

  function handleResize() {
    if (window.innerWidth >= 768) {
      pathCards.forEach(card => {
        card.classList.remove('hidden');
        card.classList.add('flex');
      });
    } else {
      const activeTab = document.querySelector('.tab-btn.active');
      const targetId = activeTab ? activeTab.getAttribute('data-target') : 'path-writers';
      pathCards.forEach(card => {
        if (card.id === targetId) {
          card.classList.remove('hidden');
          card.classList.add('flex');
        } else {
          card.classList.add('hidden');
          card.classList.remove('flex');
        }
      });
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // =========================================================================
  // 7. ACCORDION FAQ CONTROLLER
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-accordion-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('open');
        });
        if (isOpen) item.classList.remove('open');
        else item.classList.add('open');
      });
    }
  });

  // =========================================================================
  // 8. GET IN TOUCH (CONTACT) FORM CONTROLLER
  // =========================================================================
  const reasonPills = document.querySelectorAll('.reason-pill');
  const selectedReasonInput = document.getElementById('selected-reason');
  const contactForm = document.getElementById('contact-form');
  const contactSuccessAlert = document.getElementById('contact-success-alert');

  reasonPills.forEach(pill => {
    pill.addEventListener('click', () => {
      reasonPills.forEach(p => {
        p.classList.remove('active', 'bg-purple', 'text-white', 'border-purple');
        p.classList.add('bg-white', 'text-slate-charcoal', 'border-parchment-border');
      });
      pill.classList.remove('bg-white', 'text-slate-charcoal', 'border-parchment-border');
      pill.classList.add('active', 'bg-purple', 'text-white', 'border-purple');
      if (selectedReasonInput) {
        selectedReasonInput.value = pill.getAttribute('data-reason');
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (contactSuccessAlert) {
        contactSuccessAlert.classList.remove('hidden');
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(contactSuccessAlert, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 });
        }
      }
      contactForm.reset();
    });
  }

  // =========================================================================
  // 9. INITIAL ROUTE & TIMERS
  // =========================================================================
  handleHashChange();
  setTimeout(() => {
    initStorySenseAnimation();
    initRibbonAnimation();
  }, 400);
});
