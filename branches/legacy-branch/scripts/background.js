document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 140 };

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const MAX_LINK_DIST = 200 * 200; // squared distance
    const MAX_CONNECTIONS = 10000; // per particle

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function resize() {
        canvas.width = window.innerWidth * DPR;
        canvas.height = window.innerHeight * DPR;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function init() {
        resize();
        particles = [];

        const count = Math.floor((canvas.width * canvas.height) / 14000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                dx: (Math.random() - 0.5) * 0.35,
                dy: (Math.random() - 0.5) * 0.35,
                size: Math.random() * 1.4 + 0.6
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
            if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;

            const dx = mouse.x ? mouse.x - p.x : 9999;
            const dy = mouse.y ? mouse.y - p.y : 9999;
            const mouseDist = dx * dx + dy * dy;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = mouseDist < mouse.radius * mouse.radius
                ? 'rgba(209,124,255,0.9)'
                : 'rgba(159,75,255,0.3)';
            ctx.fill();

            let connections = 0;

            for (let j = i + 1; j < particles.length; j++) {
                if (connections >= MAX_CONNECTIONS) break;

                const p2 = particles[j];
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist = dx2 * dx2 + dy2 * dy2;

                if (dist < MAX_LINK_DIST) {
                    ctx.strokeStyle = `rgba(159,75,255,${(1 - dist / MAX_LINK_DIST) * 0.15})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    connections++;
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', init);
    init();
    animate();
});