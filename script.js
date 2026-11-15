'use strict';

/* ======================================================
   Wasif Wahlah | Portfolio JavaScript
   Every feature is its own small function.
   ====================================================== */

const $  = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Small toast message ---------- */
let toastTimer;
function showToast(text) {
    const toast = $('#toast');
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------- 2. Typing effect in the hero ---------- */
function initTyping() {
    const el = $('#typed');
    const roles = [
        'Front-end web developer',
        'Corvit Systems FSD student',
        'HTML, CSS & JavaScript',
        'Ready for a free internship'
    ];

    if (prefersReducedMotion) {
        el.textContent = roles[0];
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const current = roles[roleIndex];
        el.textContent = current.slice(0, charIndex);

        let delay = deleting ? 35 : 75;

        if (!deleting && charIndex === current.length) {
            deleting = true;
            delay = 1600;                       // pause at the end of the word
        } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 350;
        }

        charIndex += deleting ? -1 : 1;
        setTimeout(tick, delay);
    }
    tick();
}

/* ---------- 3. Light / dark theme (remembered) ---------- */
function initTheme() {
    const root = document.documentElement;
    const button = $('#themeToggle');
    const icon = $('i', button);

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        const meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#15132e' : '#ffffff');
    }

    apply(root.getAttribute('data-theme') || 'dark');

    button.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: ignore */ }
    });
}

/* ---------- 4. Scroll progress bar + back-to-top button ---------- */
function initScrollEffects() {
    const bar = $('#scrollProgress');
    const toTop = $('#toTop');
    let ticking = false;

    function update() {
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const percent = height > 0 ? (scrollTop / height) * 100 : 0;
        bar.style.width = percent + '%';
        toTop.classList.toggle('visible', scrollTop > 500);
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {                         // run once per frame, keeps scrolling smooth
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
}

/* ---------- 5. "Run wasif.hire()" button in the code window ---------- */
function wasifHire() {
    return 'Great choice!';
}

function initRunButton() {
    const button = $('#runHire');
    const output = $('#codeOut');

    button.addEventListener('click', () => {
        output.textContent = '> ' + JSON.stringify(wasifHire());
        showToast('Great choice! Taking you to the contact section...');
        setTimeout(() => {
            $('#contact').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }, 900);
    });
}

/* ---------- 6. Reveal skill cards when they scroll into view ---------- */
function initReveal() {
    const items = $$('.reveal');

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
        items.forEach(item => item.classList.add('in'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // small stagger: each card waits a little more than the previous one
                const index = items.indexOf(entry.target) % 4;
                entry.target.style.transitionDelay = (index * 90) + 'ms';
                entry.target.classList.add('in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    items.forEach(item => observer.observe(item));
}

/* ---------- 7. Project filter ---------- */
function initProjectFilter() {
    const buttons = $$('.filter-btn');
    const items = $$('.project-item');
    const emptyMessage = $('#noProjects');

    function filterProjects(category) {
        let visible = 0;

        items.forEach(item => {
            const match = category === 'all' || item.dataset.category === category;
            item.classList.toggle('hide', !match);
            item.classList.toggle('show', match);
            if (match) visible++;
        });

        emptyMessage.classList.toggle('d-none', visible > 0);
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            filterProjects(button.dataset.filter);
        });
    });
}

/* ---------- 8. Contact form: validation + opens the email app ---------- */
function initContactForm() {
    const form = $('#contactForm');
    const nameInput = $('#name');
    const emailInput = $('#email');
    const messageInput = $('#message');
    const counter = $('#charCount');
    const status = $('#formStatus');

    const rules = {
        name:    value => value.trim().length >= 2,
        email:   value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()),
        message: value => value.trim().length >= 10
    };

    function check(input) {
        const valid = rules[input.id](input.value);
        input.classList.toggle('is-invalid', !valid);
        input.classList.toggle('is-valid', valid);
        return valid;
    }

    // live feedback after the visitor leaves a field
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('blur', () => check(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) check(input);
        });
    });

    // character counter
    messageInput.addEventListener('input', () => {
        counter.textContent = `${messageInput.value.length} / ${messageInput.maxLength}`;
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        status.textContent = '';

        const allValid = [nameInput, emailInput, messageInput].map(check).every(Boolean);
        if (!allValid) {
            status.textContent = 'Please fix the highlighted fields.';
            const firstBad = $('.is-invalid', form);
            if (firstBad) firstBad.focus();
            return;
        }

        const subject = `Portfolio message from ${nameInput.value.trim()}`;
        const body = `${messageInput.value.trim()}\n\nFrom: ${nameInput.value.trim()} (${emailInput.value.trim()})`;
        const link = `mailto:wahlahfsd340@email.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = link;
        showToast('Opening your email app...');
        status.textContent = 'Thank you! Your email app is opening.';

        form.reset();
        counter.textContent = `0 / ${messageInput.maxLength}`;
        $$('.is-valid, .is-invalid', form).forEach(el => el.classList.remove('is-valid', 'is-invalid'));
    });
}

/* ---------- 9. Copy email to clipboard ---------- */
function initCopyEmail() {
    const button = $('#copyEmail');
    const email = $('#emailText').textContent.trim();

    button.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(email);
            showToast('Email copied!');
        } catch (error) {
            showToast('Copy not supported. Please copy it manually.');
        }
    });
}

/* ---------- 10. Footer year ---------- */
function setYear() {
    $('#year').textContent = new Date().getFullYear();
}

/* ---------- Start everything ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTyping();
    initScrollEffects();
    initRunButton();
    initReveal();
    initProjectFilter();
    initContactForm();
    initCopyEmail();
    setYear();
});
