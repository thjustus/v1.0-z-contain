// ELEMENTOS E ESTADO DO JOGO
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
let zombies = [];
let bullets = [];

let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    speed: 3,
    hp: 100,
    score: 0,
    gold: 0,
    turno: 1,
    alive: true
};

// CONTROLES DO TECLADO
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// TIRO COM ESPAÇO
document.addEventListener("keydown", (e) => {
    if (e.key === " ") shoot();
});

// FUNÇÃO DE TIRO
function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 5,
        y: player.y + player.height / 2 - 5,
        width: 10,
        height: 10,
        speed: 6
    });
}

// MOVIMENTO DO JOGADOR
function movePlayer() {
    if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
    if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
    if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;
}

// CRIAR ZUMBIS
function spawnZombie() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
        case 0: x = 0; y = Math.random() * canvas.height; break;
        case 1: x = canvas.width; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = 0; break;
        case 3: x = Math.random() * canvas.width; y = canvas.height; break;
    }

    zombies.push({
        x,
        y,
        width: 50,
        height: 50,
        hp: 50,
        speed: 1 + Math.random(),
        alive: true
    });
}

// MOVIMENTO DOS ZUMBIS
function moveZombies() {
    zombies.forEach(z => {
        if (!z.alive) return;

        const dx = player.x - z.x;
        const dy = player.y - z.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;

        z.x += nx * z.speed;
        z.y += ny * z.speed;
    });
}

// ATUALIZAR BALAS
function updateBullets() {
    bullets.forEach(bullet => {
        bullet.y -= bullet.speed;
    });

    // Colisão bala e zumbi
    bullets.forEach((bullet, bi) => {
        zombies.forEach((zombie, zi) => {
            if (zombie.alive && isColliding(bullet, zombie)) {
                zombie.hp -= 25;
                bullets.splice(bi, 1);
                if (zombie.hp <= 0) {
                    zombie.alive = false;
                    player.score += 10;
                    player.gold += 5;
                }
            }
        });
    });

    // Remover balas fora da tela
    bullets = bullets.filter(b => b.y > 0);
}

// COLISÃO ZUMBI COM JOGADOR
function checkZombiePlayerCollision() {
    zombies.forEach(zombie => {
        if (zombie.alive && isColliding(player, zombie)) {
            zombie.alive = false;
            player.hp -= 20;
            if (player.hp <= 0) gameOver();
        }
    });
}

// VERIFICAR COLISÃO ENTRE DOIS OBJETOS
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// DESENHAR TUDO
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Zumbis
    zombies.forEach(z => {
        if (!z.alive) return;
        ctx.fillStyle = "green";
        ctx.fillRect(z.x, z.y, z.width, z.height);

        // Barra de vida
        ctx.fillStyle = "red";
        ctx.fillRect(z.x, z.y - 10, z.width, 5);
        ctx.fillStyle = "lime";
        ctx.fillRect(z.x, z.y - 10, z.width * (z.hp / 50), 5);
    });

    // Balas
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // HUD
    document.getElementById("score").innerText = player.score;
    document.getElementById("gold").innerText = player.gold;
    document.getElementById("turnoAtual").innerText = player.turno;
    document.getElementById("playerHp").innerText = player.hp;
}

// GAME LOOP
function gameLoop() {
    if (!player.alive) return;

    movePlayer();
    moveZombies();
    updateBullets();
    checkZombiePlayerCollision();
    draw();
}

// GAME OVER
function gameOver() {
    player.alive = false;
    document.getElementById("gameOver").style.display = "block";
    document.getElementById("finalScore").innerText = player.score;
}

// REINICIAR JOGO
function restartGame() {
    player.hp = 100;
    player.score = 0;
    player.gold = 0;
    player.turno = 1;
    player.alive = true;
    zombies = [];
    bullets = [];
    document.getElementById("gameOver").style.display = "none";
}

// LOOP PRINCIPAL
setInterval(gameLoop, 1000 / 60); // 60 FPS

// CRIAR ZUMBIS A CADA 5 SEGUNDOS
setInterval(() => {
    if (player.alive) {
        player.turno++;
        spawnZombie();
    }
}, 5000);
