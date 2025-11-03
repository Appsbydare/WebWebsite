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
// TYPEWRITER ANIMATION
// ============================================

const typewriterElement = document.getElementById('typewriter');
const words = ['INNOVATION', 'CREATIVITY', 'EXCELLENCE'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 150;

function typeWriter() {
    if (!typewriterElement) return;
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150;
    }
    
    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }
    
    setTimeout(typeWriter, typeSpeed);
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

    // Hero Timeline
    const heroTimeline = gsap.timeline({ delay: 0.3 });

    const heroLines = gsap.utils
        .toArray('[data-animation="hero-line"]')
        .sort((a, b) => (parseInt(a.dataset.order || '0', 10) - parseInt(b.dataset.order || '0', 10)));

    heroLines.forEach((line, index) => {
        const chars = splitStore.get(line) || [];
        if (!chars.length) return;

        // Set initial hidden state
        gsap.set(chars, { yPercent: 110, opacity: 0 });

        heroTimeline.to(chars, {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.045,
            ease: 'power4.out'
        }, index === 0 ? 0 : '-=0.6');
    });

    heroTimeline.from('#typewriter', {
        duration: 1,
        y: 35,
        opacity: 0,
        ease: 'power3.out'
    }, heroLines.length ? '-=0.5' : 0);

    heroTimeline.from('.hero-tagline', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power2.out'
    }, '-=0.4');

    heroTimeline.from('.hero-cta button', {
        duration: 0.8,
        y: 35,
        opacity: 0,
        stagger: 0.12,
        ease: 'power3.out'
    }, '-=0.3');

    heroTimeline.call(() => {
        setTimeout(typeWriter, 250);
    });

    // ========================================
    // SCROLL-TRIGGERED SECTION HEADINGS
    // ========================================
    
    gsap.utils.toArray('section h2').forEach((heading) => {
        const splitTargets = Array.from(heading.querySelectorAll('.split-target'));
        if (!splitTargets.length) return;

        const pieces = splitTargets.flatMap((target) => splitStore.get(target) || []);
        if (!pieces.length) return;

        // Set initial state
        gsap.set(pieces, { yPercent: 110, opacity: 0 });

        gsap.to(pieces, {
            scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.045,
            ease: 'power4.out'
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
