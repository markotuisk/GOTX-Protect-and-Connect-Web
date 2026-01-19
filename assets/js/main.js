
document.addEventListener('DOMContentLoaded', () => {
    // Check for global translations
    const translations = window.GOTX_TRANSLATIONS;
    if (!translations) {
        console.error('GOTX Translations not found!');
        return;
    }

    // LANGUAGE LOGIC
    const langBtns = document.querySelectorAll('.lang-btn');
    let currentLang = localStorage.getItem('gotx-lang') || 'en';

    // Set initial active state
    langBtns.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });

    const updateContent = (lang) => {
        const trans = translations[lang];
        if (!trans) return;

        // Update titles, headings, descriptions, etc. using data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (trans[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = trans[key];
                } else if (el.tagName === 'A' && el.classList.contains('btn')) {
                    const span = el.querySelector('span:not([style*="font-family"])');
                    if (span) span.textContent = trans[key];
                    else el.textContent = trans[key];
                } else if (key === 'hero_title') {
                    el.innerHTML = trans[key];
                } else {
                    el.textContent = trans[key];
                }
            }
        });

        // Specific updates for complex elements if any
        document.documentElement.lang = lang.split('-')[0];
    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            localStorage.setItem('gotx-lang', currentLang);

            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Add a brief fade effect during transition
            document.body.style.opacity = '0';
            setTimeout(() => {
                updateContent(currentLang);
                document.body.style.opacity = '1';
            }, 300);
        });
    });

    // Initial content load
    updateContent(currentLang);

    // SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // REVEAL ON SCROLL
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-reveal]').forEach(el => {
        observer.observe(el);
    });

    // LOGO GLITCH
    setInterval(() => {
        const logo = document.querySelector('.logo-wordmark.glitch');
        if (logo && Math.random() > 0.8) {
            logo.style.animation = 'none';
            setTimeout(() => {
                logo.style.animation = 'glitch 0.1s ease-in-out';
                setTimeout(() => {
                    logo.style.animation = '';
                }, 100);
            }, 10);
        }
    }, 3000);

    // THEME TOGGLE
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('gotx-theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const theme = body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('gotx-theme', theme);
    });

    // INTERACTIVE PARTICLE DOTS (Antigravity Style)
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const circuitOverlay = document.querySelector('.circuit-overlay');
    const radialFocal = document.querySelector('.radial-focal');

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let targetX = 0;
    let targetY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    };

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.size = 1.5;
            this.density = (Math.random() * 30) + 1;
        }

        draw() {
            // Calculate distance to mouse for appearance
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 300;

            // Only visible/bright near mouse
            let opacity = 0.05; // Base very dim visibility
            if (distance < maxDistance) {
                opacity = 0.05 + (1 - distance / maxDistance) * 0.8;
            }

            // Adaptive color based on theme
            const isLight = body.classList.contains('light-mode');
            const color = isLight ? `rgba(0, 86, 179, ${opacity})` : `rgba(0, 114, 206, ${opacity})`;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = 200;
            const force = (maxDistance - distance) / maxDistance;

            if (distance < maxDistance) {
                // Particles react to cursor
                this.x -= forceDirectionX * force * 5;
                this.y -= forceDirectionY * force * 5;
            } else {
                // Return to base position
                if (this.x !== this.baseX) {
                    this.x -= (this.x - this.baseX) * 0.05;
                }
                if (this.y !== this.baseY) {
                    this.y -= (this.y - this.baseY) * 0.05;
                }
            }
        }
    }

    const initParticles = () => {
        particles = [];
        const numberOfParticles = 80; // Reduced count as requested
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Also update parallax overlays
        targetX = (e.clientX - window.innerWidth / 2);
        targetY = (e.clientY - window.innerHeight / 2);
    });

    const animate = () => {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Smooth parallax for overlays
        smoothMouseX += (targetX - smoothMouseX) * 0.03;
        smoothMouseY += (targetY - smoothMouseY) * 0.03;

        if (circuitOverlay) {
            circuitOverlay.style.transform = `translate(${smoothMouseX * -0.02}px, ${smoothMouseY * -0.02}px)`;
        }
        if (radialFocal) {
            radialFocal.style.transform = `translate(${smoothMouseX * 0.04}px, ${smoothMouseY * 0.04}px)`;
        }

        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
});
