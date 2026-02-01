document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };
    
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const MAX_LINK_DIST = 150 * 150; // squared
    const MAX_CONNECTIONS = 3;
    
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    function resize() {
        canvas.width = window.innerWidth * DPR;
        canvas.height = window.innerHeight * DPR;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(DPR, DPR);
    }
    
    function init() {
        resize();
        particles = [];
        const area = window.innerWidth * window.innerHeight;
        const count = Math.floor(area / 18000);
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                dx: (Math.random() - 0.5) * 0.4,
                dy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.2 + 0.8
            });
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        particles.forEach((p, i) => {
            // Update position
            p.x += p.dx;
            p.y += p.dy;
            
            // Bounce off edges
            if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
            if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;
            
            // Mouse interaction
            const isNearMouse = mouse.x && mouse.y && 
                Math.hypot(mouse.x - p.x, mouse.y - p.y) < mouse.radius;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = isNearMouse 
                ? 'rgba(41, 127, 240, 0.85)' 
                : 'rgba(41, 127, 240, 0.35)';
            ctx.fill();
            
            // Draw connections
            let connections = 0;
            for (let j = i + 1; j < particles.length && connections < MAX_CONNECTIONS; j++) {
                const p2 = particles[j];
                const distSq = (p.x - p2.x) ** 2 + (p.y - p2.y) ** 2;
                
                if (distSq < MAX_LINK_DIST) {
                    const opacity = (1 - distSq / MAX_LINK_DIST) * 0.2;
                    ctx.strokeStyle = `rgba(41, 127, 240, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    connections++;
                }
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    init();
    animate();
});