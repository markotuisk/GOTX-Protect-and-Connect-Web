document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------
    // THEME LOGIC
    // -----------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        });
    }

    // -----------------------------------------------------------
    // MODAL LOGIC
    // -----------------------------------------------------------
    const openContactBtn = document.getElementById('openContact');
    const closeContactBtn = document.getElementById('closeContact');
    const contactOverlay = document.getElementById('contactOverlay');

    if (openContactBtn && contactOverlay) {
        openContactBtn.addEventListener('click', () => {
            contactOverlay.classList.add('active');
        });
    }

    if (closeContactBtn && contactOverlay) {
        closeContactBtn.addEventListener('click', () => {
            contactOverlay.classList.remove('active');
        });
    }

    if (contactOverlay) {
        contactOverlay.addEventListener('click', (e) => {
            if (e.target === contactOverlay) {
                contactOverlay.classList.remove('active');
            }
        });
    }

    // -----------------------------------------------------------
    // PARTICLE BACKGROUND & ANIMATION
    // -----------------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return; // Guard clause

    const ctx = canvas.getContext('2d');
    const circuitOverlay = document.querySelector('.circuit-overlay');
    const radialFocal = document.querySelector('.radial-focal');

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let targetX = 0, targetY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;

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
            this.size = 1.2;
        }
        draw() {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 300;
            let opacity = 0.05;
            if (distance < maxDistance) opacity = 0.05 + (1 - distance / maxDistance) * 0.8;
            ctx.fillStyle = `rgba(0, 114, 206, ${opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        update() {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;
            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                this.x -= (dx / distance) * force * 5;
                this.y -= (dy / distance) * force * 5;
            } else {
                this.x -= (this.x - this.baseX) * 0.05;
                this.y -= (this.y - this.baseY) * 0.05;
            }
        }
    }

    const initParticles = () => {
        particles = [];
        for (let i = 0; i < 60; i++) particles.push(new Particle());
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        targetX = (e.clientX - window.innerWidth / 2);
        targetY = (e.clientY - window.innerHeight / 2);

        // Update card hover focal effect
        document.querySelectorAll('.choice-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--y', `${e.clientY - rect.top}px`);
        });
    });

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        smoothMouseX += (targetX - smoothMouseX) * 0.03;
        smoothMouseY += (targetY - smoothMouseY) * 0.03;
        if (circuitOverlay) circuitOverlay.style.transform = `translate(${smoothMouseX * -0.02}px, ${smoothMouseY * -0.02}px)`;
        if (radialFocal) radialFocal.style.transform = `translate(${smoothMouseX * 0.04}px, ${smoothMouseY * 0.04}px)`;
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
});
