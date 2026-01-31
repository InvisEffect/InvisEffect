/* ===========================
   GAMES DATA
=========================== */
const games = [
    { title: "bacon may die", genre: "fighting", link: "./games/bacon-may-die.html" },
    { title: "happy wheels", genre: "casual", link: "./games/happy-wheels.html" },
    { title: "snow rider", genre: "driving", link: "./games/snow-rider.html" },
    { title: "moto x3m", genre: "driving", link: "./games/moto-x3m.html" },
    { title: "drive mad", genre: "driving", link: "./games/drive-mad.html" },
    { title: "drift boss", genre: "driving", link: "./games/car-boss.html" },
    { title: "final earth 2", genre: "strategy", link: "./games/final-earth-2.html" },
    { title: "idle breakout", genre: "idle", link: "./games/idle-breakout.html" },
    { title: "idle mining sim", genre: "idle", link: "./games/idle-mining-sim.html" },
    { title: "learn to fly idle", genre: "idle", link: "./games/learn-to-fly-idle.html" },
    { title: "babel tower", genre: "idle", link: "./games/babel-tower.html" },
    { title: "bloxorz", genre: "puzzle", link: "./games/bloxorz.html" },
    { title: "tiny fishing", genre: "casual", link: "./games/tiny-fishing.html" },
    { title: "basket random", genre: "sports", link: "./games/basket-random.html" },
    { title: "minecraft", genre: "casual", link: "./games/minecraft-1.12.2.html" },
    { title: "papas pizzeria", genre: "skill", link: "./games/papas-pizzeria.html" },
    { title: "crash landing", genre: "skill", link: "./games/crazy-crash-landing.html" },
    { title: "slow roads (lag)", genre: "driving", link: "./games/slow-roads.html" },
    { title: "subway surfers", genre: "casual", link: "./games/subway-surfers.html" },
    { title: "brawl ships", genre: "action", link: "./games/brawl-ships.html" },
    { title: "infinite craft", genre: "puzzle", link: "./games/9999999-craft.html" },
    { title: "hover race drive", genre: "casual", link: "./games/hover-race-drive.html" },
    { title: "papas freezeria", genre: "skill", link: "./games/papas-freezeria.html" },
    { title: "block blast", genre: "casual", link: "./games/block-blast.html" },
    { title: "ovo 3d", genre: "skill", link: "./games/ovo-3d.html" },
    { title: "ovo", genre: "skill", link: "./games/ovo.html" },
    { title: "plants vs zombies", genre: "strategy", link: "./games/plants-vs-zombies.html" },
    { title: "COOKIE CLICKER", genre: "idle", link: "./games/cookie-clicker-assets/index.html" },
    { title: "retro bowl", genre: "sports", link: "./games/retro-bowl.html" },
    { title: "soundboard", genre: "casual", link: "./games/soundboard.html" },
    { title: "n-gon", genre: "skill", link: "./games/n-gon.html" },
    { title: "idle lumber inc", genre: "idle", link: "./games/idle-lumber-inc.html" },
    { title: "slither io", genre: "casual", link: "./games/slither-io.html" },
];

let currentGenre = 'all';
let currentPage = 1;
const gamesPerPage = 12;

/* ===========================
   GAMES UI
=========================== */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.games-container');
    if (container) displayGames();
});

function displayGames() {
    const container = document.querySelector('.games-container');
    if (!container) return;

    container.innerHTML = '';

    const filtered = games
        .filter(g => currentGenre === 'all' || g.genre === currentGenre)
        .sort((a, b) => a.title.localeCompare(b.title));

    const totalPages = Math.ceil(filtered.length / gamesPerPage);
    const start = (currentPage - 1) * gamesPerPage;

    filtered.slice(start, start + gamesPerPage).forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card glowing';
        card.innerHTML = `
            <h3>${game.title}</h3>
            <button onclick="openGameViewer('${game.link}')">Play</button>
        `;
        container.appendChild(card);
    });

    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const nav = document.getElementById('pagination-nav');
    if (!nav || totalPages <= 1) return;

    nav.innerHTML = '';

    const makeBtn = (txt, fn, disabled = false) => {
        const b = document.createElement('button');
        b.textContent = txt;
        b.disabled = disabled;
        b.onclick = fn;
        nav.appendChild(b);
    };

    makeBtn("«", () => { currentPage--; displayGames(); }, currentPage === 1);

    for (let i = 1; i <= totalPages; i++) {
        makeBtn(i, () => { currentPage = i; displayGames(); }, false);
    }

    makeBtn("»", () => { currentPage++; displayGames(); }, currentPage === totalPages);
}

function filterGames(genre) {
    currentGenre = genre;
    currentPage = 1;
    displayGames();
}

function openGameViewer(link) {
    const viewer = document.getElementById('game-viewer');
    const iframe = document.getElementById('game-iframe');
    if (viewer && iframe) {
        iframe.src = link;
        viewer.style.display = 'block';
    }
}

function closeGameViewer() {
    const viewer = document.getElementById('game-viewer');
    const iframe = document.getElementById('game-iframe');
    if (viewer && iframe) {
        viewer.style.display = 'none';
        iframe.src = '';
    }
}

/* ===========================
   INTERACTIVE BACKGROUND (OPTIMIZED)
=========================== */
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
