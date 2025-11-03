// ============================================
// GSAP ANIMATIONS
// ============================================

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Animate Navigation on load
    gsap.from('nav', {
        duration: 1,
        y: -100,
        opacity: 0,
        ease: 'power3.out'
    });

    // Hero Section Entrance
    const heroTimeline = gsap.timeline({ delay: 0.3 });
    
    heroTimeline.from('#typewriter', {
        duration: 1.2,
        scale: 0.5,
        opacity: 0,
        ease: 'back.out(1.7)'
    });

    // Animate CTA buttons
    gsap.from('section button', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 1
    });

    // Start typewriter animation
    setTimeout(typeWriter, 1500);
});

// ============================================
// TYPEWRITER ANIMATION (Enhanced)
// ============================================

const typewriterElement = document.getElementById('typewriter');
const words = ['INNOVATION', 'CREATIVITY', 'EXCELLENCE'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 150;

function typeWriter() {
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
// SCROLL-TRIGGERED ANIMATIONS
// ============================================

// Animate Stats Cards
gsap.from('#stats section > div > div', {
    scrollTrigger: {
        trigger: '#stats',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    duration: 0.8,
    y: 100,
    opacity: 0,
    stagger: 0.15,
    ease: 'power3.out'
});

// Animate Service Cards
gsap.from('#services .grid > div', {
    scrollTrigger: {
        trigger: '#services',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
    },
    duration: 1,
    y: 80,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out'
});

// Animate Case Study Cards
gsap.from('#cases .grid > div', {
    scrollTrigger: {
        trigger: '#cases',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
    },
    duration: 1,
    scale: 0.8,
    opacity: 0,
    stagger: 0.2,
    ease: 'back.out(1.2)'
});

// Animate Process Steps
gsap.from('#process .grid > div', {
    scrollTrigger: {
        trigger: '#process',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
    },
    duration: 0.8,
    y: 60,
    opacity: 0,
    stagger: 0.1,
    ease: 'power2.out'
});

// Animate Testimonials
gsap.from('#testimonials .grid > div', {
    scrollTrigger: {
        trigger: '#testimonials',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
    },
    duration: 1,
    x: (index) => (index % 2 === 0 ? -100 : 100),
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out'
});

// Animate Section Headings
gsap.utils.toArray('section h2').forEach((heading) => {
    gsap.from(heading, {
        scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    });
});

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================

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

// ============================================
// PARALLAX EFFECT FOR EMOJIS
// ============================================

gsap.utils.toArray('.text-8xl, .text-9xl').forEach((emoji) => {
    gsap.to(emoji, {
        scrollTrigger: {
            trigger: emoji,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        y: -50,
        ease: 'none'
    });
});

// ============================================
// SMOOTH SCROLL
// ============================================

gsap.to('html', {
    scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

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

// Add scroll effect to navigation (optional - adds shadow on scroll)
let lastScroll = 0;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        nav.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

