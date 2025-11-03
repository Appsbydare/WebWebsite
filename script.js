// ============================================
// GSAP ANIMATIONS
// ============================================

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const splitStore = new WeakMap();

function splitElement(element) {
    if (!element || splitStore.has(element)) {
        return splitStore.get(element) || [];
    }

    const type = element.dataset.split || 'letters';
    const original = element.textContent.trim();
    const fragments = [];

    element.textContent = '';

    if (type === 'words') {
        const words = original.split(/\s+/).filter(Boolean);
        words.forEach((word, index) => {
            const wrap = document.createElement('span');
            wrap.classList.add('split-wrap');

            const inner = document.createElement('span');
            inner.classList.add('split-word');
            inner.textContent = word;
            wrap.appendChild(inner);
            element.appendChild(wrap);
            fragments.push(inner);

            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });
    } else {
        for (const char of original) {
            if (char === ' ') {
                element.appendChild(document.createTextNode(' '));
                continue;
            }
            const wrap = document.createElement('span');
            wrap.classList.add('split-wrap');

            const inner = document.createElement('span');
            inner.classList.add('split-char');
            inner.textContent = char;
            wrap.appendChild(inner);
            element.appendChild(wrap);
            fragments.push(inner);
        }
    }

    splitStore.set(element, fragments);
    element._splitItems = fragments;
    return fragments;
}

function splitAnimatedText() {
    // Only split hero and heading elements
    document.querySelectorAll('[data-split][data-animation]').forEach(splitElement);
}

// ============================================
// WORD ANIMATION (LETTERS FROM LEFT/RIGHT)
// ============================================

const typewriterElement = document.getElementById('typewriter');
const words = ['INNOVATION', 'CREATIVITY', 'EXCELLENCE'];
let wordIndex = 0;
let currentWordElement = null;

function createWordElement(word) {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'word';
    
    const chars = word.split('');
    chars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        wordDiv.appendChild(charSpan);
    });
    
    return wordDiv;
}

function animateWord() {
    if (!typewriterElement) return;
    
    const newWord = words[wordIndex];
    const newWordElement = createWordElement(newWord);
    
    // Fade out and blur/vanish old word if exists
    if (currentWordElement) {
        gsap.to(currentWordElement, {
            opacity: 0,
            filter: 'blur(20px)',
            scale: 0.8,
            duration: 0.8,
            ease: 'power2.in',
            onComplete: () => {
                if (currentWordElement && currentWordElement.parentNode) {
                    currentWordElement.remove();
                }
                // After old word is removed, add and animate new word
                addAndAnimateNewWord(newWordElement);
            }
        });
    } else {
        // First word, just add and animate
        addAndAnimateNewWord(newWordElement);
    }
    
    // Schedule next word (increased display time)
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(animateWord, 7000); // Increased from 5s to 7s for longer display time
}

function addAndAnimateNewWord(newWordElement) {
    // Add new word
    typewriterElement.innerHTML = '';
    typewriterElement.appendChild(newWordElement);
    currentWordElement = newWordElement;
    
    // Set initial state with blur and scale
    gsap.set(newWordElement, {
        filter: 'blur(20px)',
        scale: 0.8,
        opacity: 0
    });
    
    // Animate characters from left and right
    const chars = newWordElement.querySelectorAll('.char');
    const midPoint = Math.floor(chars.length / 2);
    
    // Calculate distance from window border (start further out)
    const windowWidth = window.innerWidth;
    const startDistance = windowWidth * 0.5; // Start from 50% of window width away
    
    chars.forEach((char, index) => {
        // Characters on left half come from left, right half from right
        const fromLeft = index < midPoint;
        
        gsap.fromTo(char, 
            {
                x: fromLeft ? -startDistance : startDistance,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 2.4, // Slower by 100% (doubled from 1.2s)
                delay: index * 0.16, // Slower by 100% (doubled from 0.08s)
                ease: 'power3.out'
            }
        );
    });
    
    // Animate the word container to clear blur and scale up
    gsap.to(newWordElement, {
        filter: 'blur(0px)',
        scale: 1,
        opacity: 1,
        duration: 1.2,
        delay: 0.3,
        ease: 'power2.out'
    });
}

// ============================================
// MAIN INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Split text for animations
    splitAnimatedText();

    // ========================================
    // HERO SECTION ANIMATIONS
    // ========================================
    
    // Animate Navigation
    gsap.from('nav', {
        duration: 1,
        y: -100,
        opacity: 0,
        ease: 'power3.out'
    });

    // Hero Timeline - reduced initial delay
    const heroTimeline = gsap.timeline({ delay: 0.1 });

    // Make typewriter container visible immediately (no fade-in delay)
    gsap.set('#typewriter', { opacity: 1, y: 0 });

    // Create first word element immediately and add to timeline
    const firstWord = words[0];
    const firstWordElement = createWordElement(firstWord);
    typewriterElement.appendChild(firstWordElement);
    currentWordElement = firstWordElement;
    
    const firstWordChars = firstWordElement.querySelectorAll('.char');
    const midPoint = Math.floor(firstWordChars.length / 2);
    const windowWidth = window.innerWidth;
    const startDistance = windowWidth * 0.5;
    
    // Set initial state for first word characters and container
    gsap.set(firstWordElement, {
        filter: 'blur(20px)',
        scale: 0.8,
        opacity: 0
    });
    
    firstWordChars.forEach((char, index) => {
        const fromLeft = index < midPoint;
        gsap.set(char, {
            x: fromLeft ? -startDistance : startDistance,
            opacity: 0
        });
    });

    // Animate hero headings
    const heroHeadings = document.querySelectorAll('section:first-of-type .split-target[data-animation="heading-left"], section:first-of-type .split-target[data-animation="heading-right"]');
    
    heroHeadings.forEach((element, index) => {
        const chars = splitStore.get(element) || [];
        if (!chars.length) return;

        const animType = element.dataset.animation;
        const fromX = animType === 'heading-left' ? -100 : 100;

        // Set initial state
        gsap.set(chars, { x: fromX, opacity: 0 });

        heroTimeline.to(chars, {
            x: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.05,
            ease: 'power4.out'
        }, index === 0 ? 0 : '-=0.8');
    });

    // Animate first word characters simultaneously with headers (at position 0)
    firstWordChars.forEach((char, index) => {
        const fromLeft = index < midPoint;
        heroTimeline.to(char, {
            x: 0,
            opacity: 1,
            duration: 2.4,
            delay: index * 0.16,
            ease: 'power3.out'
        }, 0); // Start at the same time as headers
    });
    
    // Animate first word container to clear blur and scale up
    heroTimeline.to(firstWordElement, {
        filter: 'blur(0px)',
        scale: 1,
        opacity: 1,
        duration: 1.2,
        delay: 0.3,
        ease: 'power2.out'
    }, 0.3); // Start after characters begin animating

    // Schedule next word after first completes (increased display time)
    wordIndex = 1;
    setTimeout(() => {
        animateWord(); // Continue with next word
    }, 7000); // Increased from 4s to 7s for longer display time

    // Tagline appears much earlier - right after first few letters
    heroTimeline.from('.hero-tagline', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power2.out'
    }, '+=0.1'); // Appear 3 seconds earlier (changed from 2.5s to 0.5s)

    // ========================================
    // SCROLL-TRIGGERED SECTION HEADINGS
    // ========================================
    
    // Heading animations from left
    gsap.utils.toArray('[data-animation="heading-left"]').forEach((element) => {
        const chars = splitStore.get(element) || [];
        if (!chars.length) return;

        // Set initial state: from left
        gsap.set(chars, { x: -100, opacity: 0 });

        gsap.to(chars, {
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            x: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.05,
            ease: 'power4.out',
            onComplete: function() {
                // Add subtle random movement after entering
                chars.forEach((char, index) => {
                    gsap.to(char, {
                        x: () => gsap.utils.random(-3, 3),
                        y: () => gsap.utils.random(-2, 2),
                        duration: gsap.utils.random(2, 4),
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: index * 0.05
                    });
                });
            }
        });
    });

    // Heading animations from right
    gsap.utils.toArray('[data-animation="heading-right"]').forEach((element) => {
        const chars = splitStore.get(element) || [];
        if (!chars.length) return;

        // Set initial state: from right
        gsap.set(chars, { x: 100, opacity: 0 });

        gsap.to(chars, {
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            x: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.05,
            ease: 'power4.out',
            onComplete: function() {
                // Add subtle random movement after entering
                chars.forEach((char, index) => {
                    gsap.to(char, {
                        x: () => gsap.utils.random(-3, 3),
                        y: () => gsap.utils.random(-2, 2),
                        duration: gsap.utils.random(2, 4),
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: index * 0.05
                    });
                });
            }
        });
    });

    // ========================================
    // SCROLL-TRIGGERED CARDS & CONTENT
    // ========================================
    
    // Stats Cards
    const statsCards = gsap.utils.toArray('#stats .grid > div');
    if (statsCards.length) {
        gsap.set(statsCards, { y: 100, opacity: 0 });
        gsap.to(statsCards, {
            scrollTrigger: {
                trigger: '#stats',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }

    // Service Cards
    const serviceCards = gsap.utils.toArray('#services .grid > div');
    if (serviceCards.length) {
        gsap.set(serviceCards, { y: 80, opacity: 0 });
        gsap.to(serviceCards, {
            scrollTrigger: {
                trigger: '#services',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            y: 0,
            opacity: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });
    }

    // Case Study Cards
    const caseCards = gsap.utils.toArray('#cases .grid > div');
    if (caseCards.length) {
        gsap.set(caseCards, { scale: 0.8, opacity: 0 });
        gsap.to(caseCards, {
            scrollTrigger: {
                trigger: '#cases',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            scale: 1,
            opacity: 1,
            stagger: 0.2,
            ease: 'back.out(1.2)'
        });
    }

    // Process Steps
    const processCards = gsap.utils.toArray('#process .grid > div');
    if (processCards.length) {
        gsap.set(processCards, { y: 60, opacity: 0 });
        gsap.to(processCards, {
            scrollTrigger: {
                trigger: '#process',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 0,
            opacity: 1,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }

    // Testimonials
    const testimonialCards = gsap.utils.toArray('#testimonials .grid > div');
    if (testimonialCards.length) {
        testimonialCards.forEach((card, index) => {
            gsap.set(card, { x: index % 2 === 0 ? -100 : 100, opacity: 0 });
        });
        gsap.to(testimonialCards, {
            scrollTrigger: {
                trigger: '#testimonials',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            x: 0,
            opacity: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });
    }

    // ========================================
    // MAGNETIC BUTTON EFFECT
    // ========================================
    
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseleave', (e) => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });

    // ========================================
    // PARALLAX EFFECT FOR ICONS
    // ========================================
    
    gsap.utils.toArray('.fas, .far, .fab').forEach((icon) => {
        gsap.to(icon, {
            scrollTrigger: {
                trigger: icon,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -30,
            ease: 'none'
        });
    });
});

// ============================================
// MOBILE MENU & NAVIGATION
// ============================================

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        
        // Toggle hamburger icon
        if (mobileMenu.classList.contains('hidden')) {
            mobileMenuBtn.textContent = '☰';
        } else {
            mobileMenuBtn.textContent = '✕';
        }
    });

    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.textContent = '☰';
        });
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed nav height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll effect to navigation
const nav = document.querySelector('nav');
if (nav) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            nav.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });
}

// ============================================
// SLIDE-IN MENU
// ============================================

const menuIconBtn = document.getElementById('menu-icon-btn');
const navMenuIconBtn = document.getElementById('nav-menu-icon-btn');
const slideMenu = document.getElementById('slide-menu');
const closeMenuBtn = document.getElementById('close-menu-btn');

// Create overlay element
const menuOverlay = document.createElement('div');
menuOverlay.className = 'menu-overlay';
document.body.appendChild(menuOverlay);

// Open menu function
function openMenu() {
    slideMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Menu icon button removed from hero section - only nav menu icon exists now

// Open menu from navigation bar
if (navMenuIconBtn) {
    navMenuIconBtn.addEventListener('click', openMenu);
}

// Close menu
function closeMenu() {
    slideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', closeMenu);
}

if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
}

// Close menu on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && slideMenu.classList.contains('active')) {
        closeMenu();
    }
});
