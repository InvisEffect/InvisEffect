window.addEventListener('keydown', (e) => {
    const savedKey = localStorage.getItem('panic-key');
    const redirectUrl = localStorage.getItem('panic-url') || 'https://classroom.google.com';

    if (e.key === savedKey) {
        window.location.href = redirectUrl;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
    const charArray = chars.split('');
    const fontSize = 15;
    const columns = Math.floor(canvas.width / fontSize);

    let drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100);
    }

    window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const newColumns = Math.floor(canvas.width / fontSize);
        if (newColumns > drops.length) {
            for (let i = drops.length; i < newColumns; i++) {
                drops[i] = Math.floor(Math.random() * -100);
            }
        } else if (newColumns < drops.length) {
            drops.length = newColumns;
        }
    })

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgb(0, 255, 221)';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
        drops[i]++;
        }
    }
    setInterval(draw, 34);
});