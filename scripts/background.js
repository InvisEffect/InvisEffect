// --- Panic Key Logic ---
window.addEventListener('keydown', (e) => {
    const savedKey = localStorage.getItem('panicKey');
    const redirectUrl = localStorage.getItem('panicUri') || 'https://classroom.google.com';
    if (e.key === savedKey) {
        window.location.href = redirectUrl;
    }
});

// --- Global Effects Variables ---
let particles = [];
let orbs = [];
let drops = [];
let frameCount = 0;
const fontSize = 15;

// --- Constellation Effects ---
const particleCount = 60;
const maxDistance = 150;

function initParticles(canvas) {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            radius: Math.random() * 1.5 + 1
        });
    }
}

// --- Bokeh Background ---
function initOrbs(canvas) {
    orbs = [];
    for (let i = 0; i < 20; i++) {
        orbs.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.random() * 0.5 + 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 100 + 50,
            opacity: Math.random() * 0.15 + 0.05
        });
    }
}

function resetMatrixDrops(canvas) {
    const columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100);
    }
}

window.applyBackgroundDesign = function(mode) {
    localStorage.setItem('bg', mode);
    window.currentBgMode = mode;
    
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (mode === 'bokeh') initOrbs(canvas);
        if (mode === 'constellation') initParticles(canvas);
        if (mode === 'matrix') resetMatrixDrops(canvas);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    if (!canvas) return;

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
    const charArray = chars.split('');

    function draw() {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            if (window.currentBgMode === 'matrix') {
                resetMatrixDrops(canvas);
            }
        }

        frameCount++;

        if (window.currentBgMode === 'matrix') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgb(0, 255, 221)';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = charArray[Math.floor(Math.random() * charArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        } 
        else if (window.currentBgMode === 'constellation') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 255, 221, 0.8)';
            
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width; else if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height; else if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < maxDistance) {
                        ctx.strokeStyle = `rgba(0, 255, 221, ${(1 - dist / maxDistance) * 0.2})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        }
        else if (window.currentBgMode === 'bokeh') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let o of orbs) {
                o.x += o.vx;
                o.y += o.vy;

                if (o.x - o.radius > canvas.width) o.x = -o.radius;
                if (o.x + o.radius < 0) o.x = canvas.width + o.radius;
                if (o.y - o.radius > canvas.height) o.y = -o.radius;
                if (o.y + o.radius < 0) o.y = canvas.height + o.radius;

                ctx.beginPath();
                ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 221, ${o.opacity})`;
                ctx.fill();
            }
        }
        else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    window.currentBgMode = localStorage.getItem('bg') || 'matrix';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (window.currentBgMode === 'matrix') resetMatrixDrops(canvas);
    if (window.currentBgMode === 'constellation') initParticles(canvas);
    if (window.currentBgMode === 'bokeh') initOrbs(canvas);
    
    setInterval(draw, 34);
});