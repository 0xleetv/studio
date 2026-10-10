/**
 * Project Strata · Speculative Digital Architecture & Archival Showcase
 * Created by an Independent Frontend & Visual Designer in Gombe, Nigeria
 * Core Application Controller (Slanted Left-Pivoting Cascade, Ambient Kinetics)
 */

import { STRATA_BRAND_TOKENS, STRATA_LOGO_MARK, FILM_SLATE_GLYPH, NAV_ICONS } from './assets/vectors/brand-assets.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ---------------------------------------------------------------------------
  // 1. INJECT BRAND IDENTITY & VECTOR GLYPHS
  // ---------------------------------------------------------------------------
  const entranceSlateContainer = document.getElementById('entranceSlateContainer');
  const headerLogoMark = document.getElementById('headerLogoMark');
  const mobileHeaderLogoMark = document.getElementById('mobileHeaderLogoMark');
  const menuLogoMark = document.getElementById('menuLogoMark');
  const footerLogoMark = document.getElementById('footerLogoMark');
  const menuIconContainer = document.getElementById('menuIconContainer');
  const mobileMenuIconContainer = document.getElementById('mobileMenuIconContainer');
  const menuCloseIcon = document.getElementById('menuCloseIcon');
  const contactCloseIcon = document.getElementById('contactCloseIcon');
  const dossierCloseIcon = document.getElementById('dossierCloseIcon');
  const ethosCloseIcon = document.getElementById('ethosCloseIcon');
  const menuQuillContainer = document.getElementById('menuQuillContainer');

  if (entranceSlateContainer) entranceSlateContainer.innerHTML = FILM_SLATE_GLYPH;
  if (headerLogoMark) headerLogoMark.innerHTML = STRATA_LOGO_MARK;
  if (mobileHeaderLogoMark) mobileHeaderLogoMark.innerHTML = STRATA_LOGO_MARK;
  if (menuLogoMark) menuLogoMark.innerHTML = STRATA_LOGO_MARK;
  if (footerLogoMark) footerLogoMark.innerHTML = STRATA_LOGO_MARK;
  if (menuIconContainer) menuIconContainer.innerHTML = NAV_ICONS.menu;
  if (mobileMenuIconContainer) mobileMenuIconContainer.innerHTML = NAV_ICONS.menu;
  if (menuCloseIcon) menuCloseIcon.innerHTML = NAV_ICONS.dismiss;
  if (contactCloseIcon) contactCloseIcon.innerHTML = NAV_ICONS.dismiss;
  if (dossierCloseIcon) dossierCloseIcon.innerHTML = NAV_ICONS.dismiss;
  if (ethosCloseIcon) ethosCloseIcon.innerHTML = NAV_ICONS.dismiss;
  if (menuQuillContainer) menuQuillContainer.innerHTML = NAV_ICONS.quill;

  // Load Media Manifest with Fallback
  let mediaManifest = null;
  try {
    const res = await fetch('./assets/media-manifest.json');
    mediaManifest = await res.json();
  } catch (err) {
    console.warn('Using local fallback dossier registry.', err);
  }

  // ---------------------------------------------------------------------------
  // 2. SMOOTH SCROLLING ENGINE (LENIS + GSAP SCROLLTRIGGER SYNC)
  // ---------------------------------------------------------------------------
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth anchor navigation for all in-page links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // Automatically dismiss all open drawers on link selection
        closeFlyoutMenu();
        closeEthosDrawer();
        closeContactDrawer();
        closeDossierDrawer();
        lenis.scrollTo(targetEl, { offset: -70, duration: 1.3 });
      }
    });
  });

  const jumpToTopBtn = document.getElementById('jumpToTopBtn');
  if (jumpToTopBtn) {
    jumpToTopBtn.addEventListener('click', () => {
      lenis.scrollTo(0, { duration: 1.5 });
    });
  }

  // ---------------------------------------------------------------------------
  // 3. MINIMALIST 1.2S ENTRANCE DISSOLVE
  // ---------------------------------------------------------------------------
  const minimalEntrance = document.getElementById('minimalEntrance');

  gsap.to(minimalEntrance, {
    yPercent: -100,
    duration: 1.2,
    delay: 0.45,
    ease: 'expo.inOut',
    onComplete: () => {
      if (minimalEntrance) minimalEntrance.style.display = 'none';
      initHeroEntrance();
    }
  });

  function initHeroEntrance() {
    const entranceTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    entranceTl
      .from('#mainHeader', { yPercent: -100, opacity: 0, duration: 0.8 })
      .from('.hero-meta', { opacity: 0, y: 15, duration: 0.6 }, '-=0.4')
      .from('.hero-line', { yPercent: 110, duration: 1.1, stagger: 0.15, ease: 'power4.out' }, '-=0.4')
      .from('#hero p', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
      .from('#hero .md\\:col-span-4 > *', { opacity: 0, y: 20, stagger: 0.1, duration: 0.7 }, '-=0.6')
      .from('#hero .mt-16', { opacity: 0, y: 20, duration: 0.7 }, '-=0.4');
  }

  // ---------------------------------------------------------------------------
  // 4. TOP LEFT DUAL TRIGGER: COMPACT STUDIO ETHOS DRAWER (~42% Width)
  // ---------------------------------------------------------------------------
  const ethosDrawer = document.getElementById('ethosDrawer');
  const ethosPanel = document.getElementById('ethosPanel');
  const ethosBackdrop = document.getElementById('ethosBackdrop');
  const ethosTriggerBtn = document.getElementById('ethosTriggerBtn');
  const ethosCloseBtn = document.getElementById('ethosCloseBtn');
  const footerEthosLink = document.getElementById('footerEthosLink');
  const ethosInitiateBtn = document.getElementById('ethosInitiateBtn');

  let isEthosOpen = false;

  function openEthosDrawer() {
    if (isEthosOpen) return;
    closeFlyoutMenu();
    closeContactDrawer();
    closeDossierDrawer();

    isEthosOpen = true;
    lenis.stop();

    ethosDrawer.classList.remove('pointer-events-none');
    ethosDrawer.classList.add('pointer-events-auto');
    ethosDrawer.classList.remove('opacity-0');
    ethosDrawer.classList.add('opacity-100');

    ethosPanel.classList.remove('-translate-x-full');
    ethosPanel.classList.add('translate-x-0');
  }

  function closeEthosDrawer() {
    if (!isEthosOpen) return;
    isEthosOpen = false;
    lenis.start();

    ethosPanel.classList.remove('translate-x-0');
    ethosPanel.classList.add('-translate-x-full');

    ethosDrawer.classList.remove('opacity-100');
    ethosDrawer.classList.add('opacity-0');

    setTimeout(() => {
      ethosDrawer.classList.remove('pointer-events-auto');
      ethosDrawer.classList.add('pointer-events-none');
    }, 350);
  }

  const mobileEthosTriggerBtn = document.getElementById('mobileEthosTriggerBtn');
  if (ethosTriggerBtn) ethosTriggerBtn.addEventListener('click', openEthosDrawer);
  if (mobileEthosTriggerBtn) mobileEthosTriggerBtn.addEventListener('click', openEthosDrawer);
  if (footerEthosLink) footerEthosLink.addEventListener('click', openEthosDrawer);
  if (ethosCloseBtn) ethosCloseBtn.addEventListener('click', closeEthosDrawer);
  if (ethosBackdrop) ethosBackdrop.addEventListener('click', closeEthosDrawer);

  if (ethosInitiateBtn) {
    ethosInitiateBtn.addEventListener('click', () => {
      closeEthosDrawer();
      setTimeout(() => openContactDrawer("Digital Architecture Collaboration"), 300);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. RIGHT FLYOUT MENU (Slanted Left Cascade & Dynamic 4-Pillar Rollup)
  // ---------------------------------------------------------------------------
  const menuTrigger = document.getElementById('menuTrigger');
  const flyoutMenu = document.getElementById('flyoutMenu');
  const menuPanel = document.getElementById('menuPanel');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const slantedCascadeItems = document.querySelectorAll('.slanted-cascade-item');
  const rollupPillarsView = document.getElementById('rollupPillarsView');
  const singlePreviewView = document.getElementById('singlePreviewView');
  const flyoutPreviewImg = document.getElementById('flyoutPreviewImg');
  const flyoutPreviewTitle = document.getElementById('flyoutPreviewTitle');
  const flyoutPreviewDesc = document.getElementById('flyoutPreviewDesc');
  const flyoutDialogueTrigger = document.getElementById('flyoutDialogueTrigger');

  let isMenuOpen = false;

  const previewDict = {
    productionSet: {
      title: 'Screenplay Catalogue',
      desc: 'Active narrative treatments, psychological profiles, and editorial reader spreads.',
      url: mediaManifest?.assets?.productionSet?.url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=85'
    },
    visual: {
      title: 'Visual Direction & Frame Studies',
      desc: '35mm anamorphic scope framing, Kodak Vision3 color timing, and natural light choreography.',
      url: mediaManifest?.assets?.visual?.url || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=85'
    },
    distribution: {
      title: 'Creative Dialogue Desk',
      desc: 'Reach out for frontend development collaboration, digital archives, or creative consultation.',
      url: mediaManifest?.assets?.distribution?.url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85'
    }
  };

  function openFlyoutMenu() {
    if (isMenuOpen) return;
    closeEthosDrawer();
    closeContactDrawer();
    closeDossierDrawer();

    isMenuOpen = true;
    lenis.stop();

    flyoutMenu.classList.remove('pointer-events-none');
    flyoutMenu.classList.add('pointer-events-auto');
    flyoutMenu.classList.remove('opacity-0');
    flyoutMenu.classList.add('opacity-100');

    menuPanel.classList.remove('translate-x-full');
    menuPanel.classList.add('translate-x-0');

    // Default to the 4-pillar rollup view on open
    if (rollupPillarsView) rollupPillarsView.classList.remove('hidden');
    if (singlePreviewView) singlePreviewView.classList.add('hidden');

    gsap.fromTo(
      '.slanted-cascade-item',
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
    );
  }

  function closeFlyoutMenu() {
    if (!isMenuOpen) return;
    isMenuOpen = false;
    lenis.start();

    menuPanel.classList.remove('translate-x-0');
    menuPanel.classList.add('translate-x-full');

    flyoutMenu.classList.remove('opacity-100');
    flyoutMenu.classList.add('opacity-0');

    setTimeout(() => {
      flyoutMenu.classList.remove('pointer-events-auto');
      flyoutMenu.classList.add('pointer-events-none');
    }, 350);
  }

  const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
  if (menuTrigger) menuTrigger.addEventListener('click', openFlyoutMenu);
  if (mobileMenuTrigger) mobileMenuTrigger.addEventListener('click', openFlyoutMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeFlyoutMenu);
  if (menuBackdrop) menuBackdrop.addEventListener('click', closeFlyoutMenu);

  // Dynamic preview handling: 4-pillar rollup vs single photo
  slantedCascadeItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const key = item.getAttribute('data-preview-key');

      if (key === 'storyboard') {
        // Show 4-Pillar Animated Rollup
        if (singlePreviewView) singlePreviewView.classList.add('hidden');
        if (rollupPillarsView) {
          rollupPillarsView.classList.remove('hidden');
          gsap.fromTo(
            '.pillar-rollup-card',
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
          );
        }
      } else {
        // Show Single Preview Photo
        if (rollupPillarsView) rollupPillarsView.classList.add('hidden');
        if (singlePreviewView) singlePreviewView.classList.remove('hidden');

        const data = previewDict[key];
        if (data && flyoutPreviewImg) {
          gsap.to(flyoutPreviewImg, {
            opacity: 0.3,
            duration: 0.12,
            onComplete: () => {
              flyoutPreviewImg.src = data.url;
              if (flyoutPreviewTitle) flyoutPreviewTitle.textContent = data.title;
              if (flyoutPreviewDesc) flyoutPreviewDesc.textContent = data.desc;
              gsap.to(flyoutPreviewImg, { opacity: 1, duration: 0.22 });
            }
          });
        }
      }
    });
  });

  if (flyoutDialogueTrigger) {
    flyoutDialogueTrigger.addEventListener('click', () => {
      closeFlyoutMenu();
      setTimeout(() => openContactDrawer("Digital Architecture Collaboration"), 300);
    });
  }

  // ---------------------------------------------------------------------------
  // 6. CLICKABLE PRODUCTION DOSSIER CARDS & DETAIL DRAWER
  // ---------------------------------------------------------------------------
  const dossierDrawer = document.getElementById('dossierDrawer');
  const dossierPanel = document.getElementById('dossierPanel');
  const dossierBackdrop = document.getElementById('dossierBackdrop');
  const dossierCloseBtn = document.getElementById('dossierCloseBtn');
  const dossierBadge = document.getElementById('dossierBadge');
  const dossierTitle = document.getElementById('dossierTitle');
  const dossierImage = document.getElementById('dossierImage');
  const dossierLogline = document.getElementById('dossierLogline');
  const dossierTreatment = document.getElementById('dossierTreatment');
  const dossierDeliverables = document.getElementById('dossierDeliverables');
  const dossierInquireBtn = document.getElementById('dossierInquireBtn');
  const storyDossierCards = document.querySelectorAll('.story-dossier-card');

  let isDossierOpen = false;
  let activeDossierTitle = '';

  const fallbackDossiers = {
    narrative: {
      phase: "SCREENPLAY DEVELOPMENT",
      title: "Narrative Arc and Script Development",
      url: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1600&q=85",
      logline: "“A retired acoustic cartographer isolates an uncatalogued harmonic frequency in historical field recordings, uncovering an abandoned mountain settlement erased from official cartography.”",
      treatment: "Deep structural interrogation across three distinct drafts. Focus on subtextual dialogue, temporal non linearity, and high emotional resonance. Script development prioritizes character psychology over mechanical exposition.",
      deliverables: [
        "112 Page Polish Shooting Draft",
        "Character Psychology and Motive Matrix",
        "Scene by Scene Emotional Beats Index",
        "Table Read Recording Logs (35mm Nagra Tape)"
      ]
    },
    visual: {
      phase: "CINEMATOGRAPHY & OPTICS",
      title: "Visual Direction and Scene Moodboards",
      url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=85",
      logline: "“Crafting the film's visual grammar using vintage Cooke Panchro primes and 2.39:1 widescreen scope.”",
      treatment: "High contrast natural light choreography. Warm bone highlights, crushed obsidian shadows, and muted amber practicals. Photochemical emulsion tests conducted on Kodak Vision3 250D.",
      deliverables: [
        "2.39:1 Anamorphic Framing Guide",
        "35mm Kodak Vision3 250D Color LUTs",
        "Architectural Location Moodboard System",
        "Blocking and Steadicam Rehearsal Plates"
      ]
    },
    soundscape: {
      phase: "ACOUSTIC MONTAGE & EDITING",
      title: "Post Production Soundscapes & Kinetic Editing",
      url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=85",
      logline: "“Diegetic soundscapes recorded on quarter inch magnetic tape, coupled with contemplative montage rhythm.”",
      treatment: "Sound precedes picture. Subterranean rumblings, delicate wind gusts over limestone, and minimalist violoncello motifs recorded in acoustic reverberation chambers.",
      deliverables: [
        "7.1.4 Dolby Atmos Spatial Sound Master",
        "Analogue Modular Synthesizer Drone Stems",
        "Field Foley Stems (Parchment, Ice, Footsteps)",
        "Picture Lock Assembly (108 Minutes)"
      ]
    },
    distribution: {
      phase: "THEATRICAL EXHIBITION & PRESS",
      title: "Festival Distribution and Archive Press",
      url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85",
      logline: "“Curated festival rollout planning accompanied by high quality physical monograph editions and 4K DCP master archives.”",
      treatment: "Direct engagement with cinematheques, independent film houses, and archival preservation institutions worldwide. High quality physical media packaging.",
      deliverables: [
        "DCI Compliant 4K Theatrical DCP with 5.1 and 7.1 Audio",
        "Hardbound 64 Page Letterpress Press Dossier",
        "Limited 35mm Theatrical Exhibition Prints",
        "Archival Preservation Master Delivery"
      ]
    }
  };

  function openDossierDrawer(key) {
    if (isDossierOpen) return;
    closeFlyoutMenu();
    closeEthosDrawer();
    closeContactDrawer();

    const data = mediaManifest?.assets?.[key]?.dossier ? {
      phase: mediaManifest.assets[key].dossier.phase,
      title: mediaManifest.assets[key].title,
      url: mediaManifest.assets[key].url,
      logline: `“${mediaManifest.assets[key].dossier.logline}”`,
      treatment: mediaManifest.assets[key].dossier.treatment,
      deliverables: mediaManifest.assets[key].dossier.deliverables
    } : fallbackDossiers[key];

    if (!data) return;

    activeDossierTitle = data.title;
    if (dossierBadge) dossierBadge.textContent = data.phase;
    if (dossierTitle) dossierTitle.textContent = data.title;
    if (dossierImage) dossierImage.src = data.url;
    if (dossierLogline) dossierLogline.textContent = data.logline;
    if (dossierTreatment) dossierTreatment.textContent = data.treatment;

    if (dossierDeliverables) {
      dossierDeliverables.innerHTML = '';
      data.deliverables.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        dossierDeliverables.appendChild(li);
      });
    }

    // Render Matching Continuous Ambient Kinetic Overlay Inside the Opened Log Drawer
    const ambientOverlay = document.getElementById('dossierAmbientOverlay');
    if (ambientOverlay) {
      if (key === 'narrative') {
        ambientOverlay.innerHTML = `
          <div class="ambient-overlay-screenplay absolute inset-0 pointer-events-none flex items-center justify-center">
            <div class="ambient-drafting-nib relative flex items-center space-x-2 bg-paper/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-editorial shadow-md">
              <svg class="w-4 h-4 text-amberAccent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              </svg>
              <span class="font-sans text-[10px] text-charcoal font-bold tracking-wider uppercase">DRAFTING SCRIPT</span>
              <svg class="w-16 h-3 text-amberAccent" viewBox="0 0 60 10" fill="none">
                <path class="ambient-drafting-line" d="M2 5 Q 15 0, 30 5 T 58 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        `;
      } else if (key === 'visual') {
        ambientOverlay.innerHTML = `
          <div class="ambient-overlay-cinematography absolute inset-0 pointer-events-none overflow-hidden">
            <div class="ambient-volumetric-beam"></div>
            <div class="ambient-smoke-haze"></div>
            <div class="absolute bottom-3 left-3 flex items-center space-x-2 bg-charcoal/85 text-paper px-2.5 py-1 rounded text-[10px] font-sans font-medium backdrop-blur-sm border border-white/10">
              <span class="w-2 h-2 rounded-full bg-amberAccent animate-ping"></span>
              <span>VOLUMETRIC 35MM BEAM & HAZE</span>
            </div>
          </div>
        `;
      } else if (key === 'soundscape') {
        ambientOverlay.innerHTML = `
          <div class="ambient-overlay-acoustics absolute inset-0 pointer-events-none overflow-hidden">
            <div class="ambient-sky-pan"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="bg-charcoal/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-end space-x-1.5 h-12 shadow-lg">
                <span class="eq-bar-1 w-1.5 bg-amberLight rounded-full"></span>
                <span class="eq-bar-2 w-1.5 bg-amberAccent rounded-full"></span>
                <span class="eq-bar-3 w-1.5 bg-amberLight rounded-full"></span>
                <span class="eq-bar-4 w-1.5 bg-amberAccent rounded-full"></span>
                <span class="eq-bar-5 w-1.5 bg-amberLight rounded-full"></span>
                <span class="eq-bar-6 w-1.5 bg-amberAccent rounded-full"></span>
                <span class="eq-bar-7 w-1.5 bg-amberLight rounded-full"></span>
                <span class="eq-bar-8 w-1.5 bg-amberAccent rounded-full"></span>
                <span class="font-sans text-[10px] text-paper font-bold ml-2 uppercase">DIEGETIC SPECTRUM</span>
              </div>
            </div>
            <div class="absolute bottom-3 left-3 flex items-center space-x-2 bg-charcoal/85 text-paper px-2.5 py-1 rounded text-[10px] font-sans font-medium backdrop-blur-sm border border-white/10">
              <span class="w-2 h-2 rounded-full bg-amberAccent animate-pulse"></span>
              <span>SLOW PAN & 7.1.4 SPECTRUM</span>
            </div>
          </div>
        `;
      } else if (key === 'distribution') {
        ambientOverlay.innerHTML = `
          <div class="ambient-overlay-theatrical absolute inset-0 pointer-events-none overflow-hidden">
            <div class="ambient-screen-flicker"></div>
            <div class="ambient-projector-sweep"></div>
            <div class="absolute bottom-3 left-3 flex items-center space-x-2 bg-charcoal/85 text-paper px-2.5 py-1 rounded text-[10px] font-sans font-medium backdrop-blur-sm border border-white/10">
              <span class="w-2 h-2 rounded-full bg-amberAccent animate-pulse"></span>
              <span>CINEMATIC SCREEN FLICKER</span>
            </div>
          </div>
        `;
      }
    }

    isDossierOpen = true;
    lenis.stop();

    dossierDrawer.classList.remove('pointer-events-none');
    dossierDrawer.classList.add('pointer-events-auto');
    dossierDrawer.classList.remove('opacity-0');
    dossierDrawer.classList.add('opacity-100');

    dossierPanel.classList.remove('translate-x-full');
    dossierPanel.classList.add('translate-x-0');
  }

  function closeDossierDrawer() {
    if (!isDossierOpen) return;
    isDossierOpen = false;
    lenis.start();

    dossierPanel.classList.remove('translate-x-0');
    dossierPanel.classList.add('translate-x-full');

    dossierDrawer.classList.remove('opacity-100');
    dossierDrawer.classList.add('opacity-0');

    setTimeout(() => {
      dossierDrawer.classList.remove('pointer-events-auto');
      dossierDrawer.classList.add('pointer-events-none');
    }, 350);
  }

  storyDossierCards.forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-dossier-key');
      openDossierDrawer(key);
    });
  });

  if (dossierCloseBtn) dossierCloseBtn.addEventListener('click', closeDossierDrawer);
  if (dossierBackdrop) dossierBackdrop.addEventListener('click', closeDossierDrawer);

  if (dossierInquireBtn) {
    dossierInquireBtn.addEventListener('click', () => {
      closeDossierDrawer();
      setTimeout(() => {
        openContactDrawer(activeDossierTitle);
      }, 300);
    });
  }

  // ---------------------------------------------------------------------------
  // 7. CONTACT DIALOGUE DRAWER & WHATSAPP INTEGRATION
  // ---------------------------------------------------------------------------
  const contactDrawer = document.getElementById('contactDrawer');
  const contactPanel = document.getElementById('contactPanel');
  const contactBackdrop = document.getElementById('contactBackdrop');
  const contactCloseBtn = document.getElementById('contactCloseBtn');
  const headerDialogueBtn = document.getElementById('headerDialogueBtn');
  const heroDialogueBtn = document.getElementById('heroDialogueBtn');
  const footerDialogueBtn = document.getElementById('footerDialogueBtn');
  const dialogueForm = document.getElementById('dialogueForm');
  const dialogueFeedback = document.getElementById('dialogueFeedback');
  const whatsappBtn = document.getElementById('whatsappBtn');
  const dialogueNotes = document.getElementById('dialogueNotes');

  let isContactOpen = false;

  function openContactDrawer(prefillTopic = '') {
    if (isContactOpen) return;
    closeFlyoutMenu();
    closeEthosDrawer();
    closeDossierDrawer();

    isContactOpen = true;
    lenis.stop();

    if (prefillTopic && dialogueNotes) {
      dialogueNotes.value = `Regarding: ${prefillTopic}\n`;
    }

    contactDrawer.classList.remove('pointer-events-none');
    contactDrawer.classList.add('pointer-events-auto');
    contactDrawer.classList.remove('opacity-0');
    contactDrawer.classList.add('opacity-100');

    contactPanel.classList.remove('translate-x-full');
    contactPanel.classList.add('translate-x-0');

    const nameInput = document.getElementById('dialogueName');
    if (nameInput) setTimeout(() => nameInput.focus(), 350);
  }

  function closeContactDrawer() {
    if (!isContactOpen) return;
    isContactOpen = false;
    lenis.start();

    contactPanel.classList.remove('translate-x-0');
    contactPanel.classList.add('translate-x-full');

    contactDrawer.classList.remove('opacity-100');
    contactDrawer.classList.add('opacity-0');

    setTimeout(() => {
      contactDrawer.classList.remove('pointer-events-auto');
      contactDrawer.classList.add('pointer-events-none');
    }, 350);
  }

  if (headerDialogueBtn) headerDialogueBtn.addEventListener('click', () => openContactDrawer());
  if (heroDialogueBtn) heroDialogueBtn.addEventListener('click', () => openContactDrawer());
  if (footerDialogueBtn) footerDialogueBtn.addEventListener('click', () => openContactDrawer());
  if (contactCloseBtn) contactCloseBtn.addEventListener('click', closeContactDrawer);
  if (contactBackdrop) contactBackdrop.addEventListener('click', closeContactDrawer);

  // Global ESC key listener for all drawers and menus
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isContactOpen) closeContactDrawer();
      if (isDossierOpen) closeDossierDrawer();
      if (isEthosOpen) closeEthosDrawer();
      if (isMenuOpen) closeFlyoutMenu();
    }
  });

  // Contact Form Handling (Drawer)
  if (dialogueForm) {
    dialogueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('dialogueSubmitBtn');
      const name = document.getElementById('dialogueName').value;
      const role = document.getElementById('dialogueRole').value;
      const type = document.getElementById('dialogueType').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="inline-block w-3 h-3 rounded-full border-2 border-paper border-t-transparent animate-spin mr-2"></span>
        <span>TRANSMITTING...</span>
      `;

      if (whatsappBtn) {
        const msg = encodeURIComponent(`Hello Strata Archive Designer, I am ${name} (${role}) reaching out regarding ${type}.`);
        whatsappBtn.href = `https://wa.me/?text=${msg}`;
      }

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>TRANSMIT INQUIRY</span>
          <span>→</span>
        `;

        if (dialogueFeedback) {
          dialogueFeedback.className = 'p-3 rounded-lg font-sans text-xs leading-relaxed bg-amberAccent/10 border border-amberAccent/30 text-amberAccent block font-medium';
          dialogueFeedback.innerHTML = `
            <strong>INQUIRY DISPATCHED · RECEIPT NO. SF ${Math.floor(1000 + Math.random() * 9000)}</strong><br>
            Message logged for ${name}. We will review and connect shortly.
          `;
        }

        dialogueForm.reset();
        setTimeout(() => {
          if (dialogueFeedback) dialogueFeedback.classList.add('hidden');
          closeContactDrawer();
        }, 3200);
      }, 1100);
    });
  }

  // In-Page Collaboration Form Handling (#contact-desk)
  const inpageDialogueForm = document.getElementById('inpageDialogueForm');
  const inpageDialogueFeedback = document.getElementById('inpageDialogueFeedback');
  if (inpageDialogueForm) {
    inpageDialogueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('inpageDialogueSubmitBtn');
      const name = document.getElementById('inpageDialogueName').value;
      const role = document.getElementById('inpageDialogueRole').value;
      const type = document.getElementById('inpageDialogueType').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="inline-block w-3 h-3 rounded-full border-2 border-paper border-t-transparent animate-spin mr-2"></span>
        <span>TRANSMITTING...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>TRANSMIT PROJECT INQUIRY</span>
          <span>→</span>
        `;

        if (inpageDialogueFeedback) {
          inpageDialogueFeedback.className = 'p-3 rounded-lg font-sans text-xs leading-relaxed bg-amberAccent/10 border border-amberAccent/30 text-amberAccent block font-medium';
          inpageDialogueFeedback.innerHTML = `
            <strong>INQUIRY DISPATCHED · RECEIPT NO. SF ${Math.floor(1000 + Math.random() * 9000)}</strong><br>
            Project inquiry dispatched for ${name} (${role}). We will review and connect with you shortly.
          `;
        }

        inpageDialogueForm.reset();
        setTimeout(() => {
          if (inpageDialogueFeedback) inpageDialogueFeedback.classList.add('hidden');
        }, 4000);
      }, 1000);
    });
  }

  console.log('[STRATA ARCHIVE]: Restructured Sections, Frame Studies & Ambient Kinetics Synchronized.');
});
