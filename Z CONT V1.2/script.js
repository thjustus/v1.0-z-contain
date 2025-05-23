// ==== utils.js ====
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function createParticles(x, y, color = 'orange') { // Adiciona parâmetro de cor
    for (let i = 0; i < 10; i++) {
        particles.push({
            x,
            y,
            radius: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            alpha: 1,
            color: color // Usa a cor passada ou a padrão
        });
    }
}

function updateHighScore(score) {
    const best = parseInt(localStorage.getItem("highScore")) || 0;
    if (score > best) localStorage.setItem("highScore", score);
    return Math.max(score, best);
}

// ==== Player.js ====
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 3;
        this.maxHp = 100; // Vida máxima inicial
        this.hp = this.maxHp;
        this.score = 0;
        this.gold = 0;
        this.turno = 1;
        this.alive = true;
        this.bulletDamage = 25; // Dano da bala inicial
        this.weapon = "Pistola"; // Arma inicial
        this.fireRate = 500; // Tempo entre tiros em ms
        this.lastShotTime = 0;
    }
    move(keys) {
        if (keys['w'] || keys['ArrowUp']) this.y -= this.speed;
        if (keys['s'] || keys['ArrowDown']) this.y += this.speed;
        if (keys['a'] || keys['ArrowLeft']) this.x -= this.speed;
        if (keys['d'] || keys['ArrowRight']) this.x += this.speed;

        // Limita o jogador dentro do canvas
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }
    shoot() {
        const now = Date.now();
        if (now - this.lastShotTime > this.fireRate) {
            bullets.push(new Bullet(this.x + this.width / 2 - 5, this.y + this.height / 2 - 5));
            this.lastShotTime = now;
            shotSound.play();
        }
    }
}

// ==== Bullet.js ====
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.speed = 8; // Velocidade da bala um pouco maior
        this.alpha = 1;
    }
    update() {
        this.y -= this.speed;
        this.alpha = Math.max(0, this.alpha - 0.02);
    }
}

// ==== Zombie.js ====
class Zombie {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.maxHp = 50 + level * 10; // HP máximo baseado no nível
        this.hp = this.maxHp;
        this.speed = 1 + Math.random() * (1 + level * 0.1);
        this.alive = true;
        this.hpDisplay = this.hp;
        this.damage = 20; // Dano que o zumbi causa
    }
    moveToward(player) {
        if (!this.alive) return;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) { // Evita divisão por zero
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }
    update() {
        this.hpDisplay += (this.hp - this.hpDisplay) * 0.1;
    }
}

// ==== abilities.js ====
const shopItems = [
    {
        name: "DANO DUPLO",
        type: "upgrade",
        cost: 50,
        action: (player) => { player.bulletDamage *= 2; },
        description: "Dobra o dano das suas balas."
    },
    {
        name: "VELOCIDADE EXTRA",
        type: "upgrade",
        cost: 30,
        action: (player) => { player.speed += 2; },
        description: "Aumenta sua velocidade de movimento."
    },
    {
        name: "VIDA EXTRA",
        type: "upgrade",
        cost: 40,
        action: (player) => { player.maxHp += 50; player.hp += 50; }, // Aumenta vida máxima e cura
        description: "Aumenta sua vida máxima e restaura HP."
    },
    {
        name: "AUMENTAR CADÊNCIA",
        type: "upgrade",
        cost: 60,
        action: (player) => { player.fireRate = Math.max(100, player.fireRate - 100); }, // Reduz tempo entre tiros
        description: "Aumenta a velocidade de tiro."
    },
    {
        name: "ESPINGARDA",
        type: "weapon",
        cost: 150,
        action: (player) => {
            player.weapon = "Espingarda";
            player.bulletDamage = 30; // Dano por projétil
            player.fireRate = 800; // Cadência mais lenta
            player.shoot = () => { // Sobrescreve a função shoot para espingarda
                const now = Date.now();
                if (now - player.lastShotTime > player.fireRate) {
                    // Três projéteis em um pequeno arco
                    bullets.push(new Bullet(player.x + player.width / 2 - 5, player.y + player.height / 2 - 5));
                    bullets.push(new Bullet(player.x + player.width / 2 - 5 - 10, player.y + player.height / 2 - 5));
                    bullets.push(new Bullet(player.x + player.width / 2 - 5 + 10, player.y + player.height / 2 - 5));
                    player.lastShotTime = now;
                    shotgunSound.play();
                }
            };
        },
        description: "Atira múltiplos projéteis em um cone."
    },
    {
        name: "RIFLE DE ASSALTO",
        type: "weapon",
        cost: 200,
        action: (player) => {
            player.weapon = "Rifle de Assalto";
            player.bulletDamage = 35;
            player.fireRate = 200; // Cadência alta
            player.shoot = () => { // Sobrescreve a função shoot para rifle
                const now = Date.now();
                if (now - player.lastShotTime > player.fireRate) {
                    bullets.push(new Bullet(player.x + player.width / 2 - 5, player.y + player.height / 2 - 5));
                    player.lastShotTime = now;
                    rifleSound.play();
                }
            };
        },
        description: "Alta cadência de tiro, dano moderado."
    }
];

// ==== main.js ====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};
let bullets = [];
const zombies = [];
const particles = [];
const player = new Player(canvas.width / 2 - 25, canvas.height / 2 - 25);
let currentLevel = 1;
let isPaused = false;
let gameStarted = false;

// Sons
const deathSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_b97c1d122f.mp3?filename=impact-punch-7186.mp3');
const shotSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/24/audio_3d159079f8.mp3?filename=laser-gun-shot-12752.mp3'); // Som de tiro padrão
const shotgunSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_f818b2c687.mp3?filename=shotgun-pump-and-shoot-42095.mp3'); // Som de espingarda
const rifleSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_2491a92e35.mp3?filename=automatic-gun-shot-37731.mp3'); // Som de rifle
const hitSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/07/audio_03d97d022b.mp3?filename=hit-impact-fx-10708.mp3'); // Som de impacto
const zombieGruntSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_0f8b0d2d3e.mp3?filename=zombie-moan-6761.mp3'); // Som de zumbi
const bgMusic = new Audio('https://cdn.pixabay.com/download/audio/2022/07/19/audio_3c4beae0ec.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

function openAbilityShop() {
    const shop = document.getElementById("abilityShop");
    const list = document.getElementById("shopList");
    list.innerHTML = "";
    shopItems.forEach(item => {
        const btn = document.createElement("button");
        btn.innerHTML = `
            ${item.name} <br>
            <span style="font-size:0.7em; color: #aaa;">Custo: ${item.cost} Ouro</span> <br>
            <span style="font-size:0.6em; color: #ccc;">${item.description}</span>
        `;
        btn.onclick = () => {
            if (player.gold >= item.cost) {
                player.gold -= item.cost;
                item.action(player);
                // Para armas, remove as outras armas da loja ou desabilita
                if (item.type === "weapon") {
                    shopItems.filter(i => i.type === "weapon" && i.name !== item.name).forEach(i => {
                        i.purchased = true; // Marca como comprada
                    });
                }
                closeAbilityShop();
            } else {
                alert("Ouro insuficiente!");
            }
        };
        // Desabilita botão se o item já foi comprado (para armas)
        if (item.purchased) {
            btn.disabled = true;
            btn.style.opacity = 0.5;
            btn.textContent = `${item.name} (ADQUIRIDO)`;
        }
        list.appendChild(btn);
    });
    shop.style.display = "block";
    isPaused = true;
}

function closeAbilityShop() {
    document.getElementById("abilityShop").style.display = "none";
    isPaused = false;
    requestAnimationFrame(gameLoop);
}

function startGame() {
    document.getElementById("startMenu").style.display = "none";
    gameStarted = true;
    bgMusic.play();
    requestAnimationFrame(gameLoop);
}

function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) requestAnimationFrame(gameLoop);
}

function spawnZombie() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = -50; y = Math.random() * canvas.height; } // Esquerda
    else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; } // Direita
    else if (side === 2) { x = Math.random() * canvas.width; y = -50; } // Cima
    else { x = Math.random() * canvas.width; y = canvas.height + 50; } // Baixo
    zombies.push(new Zombie(x, y, currentLevel));
    if (Math.random() < 0.3) zombieGruntSound.play(); // Som de zumbi aleatório
}

function updateBullets() {
    bullets.forEach(b => b.update());
    bullets.forEach((b, bi) => {
        for (let zi = 0; zi < zombies.length; zi++) {
            const z = zombies[zi];
            if (z.alive && isColliding(b, z)) {
                z.hp -= player.bulletDamage;
                bullets.splice(bi, 1); // Remove a bala
                hitSound.play(); // Som de impacto
                createParticles(b.x, b.y, 'red'); // Partículas de sangue

                if (z.hp <= 0) {
                    z.alive = false;
                    player.score += 10 + currentLevel * 2; // Pontuação escalonada
                    player.gold += 5 + Math.floor(currentLevel / 2); // Ouro escalonado
                    createParticles(z.x + z.width / 2, z.y + z.height / 2, 'white'); // Partículas ao morrer
                    deathSound.play();
                    // Remove zumbi morto da lista
                    zombies.splice(zi, 1);
                    zi--; // Ajusta o índice após remover
                }
                return; // Bala colidiu, não precisa verificar outros zumbis
            }
        }
    });
    bullets = bullets.filter(b => b.y > -b.height); // Remove balas que saíram da tela
}

function checkZombiePlayerCollision() {
    for (let i = 0; i < zombies.length; i++) {
        const z = zombies[i];
        if (z.alive && isColliding(player, z)) {
            player.hp -= z.damage; // Zumbi causa dano
            createParticles(player.x + player.width / 2, player.y + player.height / 2, 'blue'); // Partículas de dano no jogador
            if (player.hp <= 0) {
                gameOver();
            } else {
                // Remove o zumbi que colidiu
                z.alive = false;
                zombies.splice(i, 1);
                i--; // Ajusta o índice
            }
        }
    }
}

function updateParticles() {
    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.03; // Partículas desaparecem mais rápido
    });
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o jogador
    ctx.save();
    ctx.shadowColor = '#00ff00'; // Sombra verde
    ctx.shadowBlur = 15;
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.restore();

    // Desenha zumbis
    zombies.forEach(z => {
        if (!z.alive) return;
        z.update();
        ctx.fillStyle = "darkgreen"; // Zumbi um pouco mais escuro
        ctx.fillRect(z.x, z.y, z.width, z.height);

        // Barra de HP do zumbi
        ctx.fillStyle = "gray";
        ctx.fillRect(z.x, z.y - 15, z.width, 7);
        ctx.fillStyle = "lime";
        ctx.fillRect(z.x, z.y - 15, z.width * (z.hpDisplay / z.maxHp), 7); // Barra de HP dinâmica
    });

    // Desenha balas
    bullets.forEach(b => {
        ctx.globalAlpha = b.alpha;
        ctx.fillStyle = "yellow";
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.globalAlpha = 1;
    });

    // Desenha partículas
    particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color; // Usa a cor da partícula
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Atualiza HUD
    document.getElementById("score").innerText = player.score;
    document.getElementById("gold").innerText = player.gold;
    document.getElementById("turnoAtual").innerText = player.turno;
    document.getElementById("playerHp").innerText = `${player.hp}/${player.maxHp}`;
    document.getElementById("highScore").innerText = updateHighScore(player.score);
    document.getElementById("currentWeapon").innerText = player.weapon;

    // Atualiza barra de HP do jogador
    const playerHpBar = document.getElementById("playerHpBar");
    if (playerHpBar) {
        playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    }

    const progressBar = document.getElementById("levelProgress");
    if (progressBar) progressBar.value = (player.turno % 5) * 20; // Progresso do turno
}

function gameOver() {
    player.alive = false;
    document.getElementById("gameOver").style.display = "block";
    document.getElementById("finalScore").innerText = player.score;
    document.getElementById("finalHighScore").innerText = updateHighScore(player.score);
    bgMusic.pause();
}

function restartGame() {
    // Resetar o estado do jogo
    Object.assign(player, new Player(canvas.width / 2 - 25, canvas.height / 2 - 25));
    zombies.length = 0;
    bullets.length = 0;
    particles.length = 0;
    currentLevel = 1;

    // Resetar o estado das armas na loja
    shopItems.filter(item => item.type === "weapon").forEach(item => {
        item.purchased = false;
    });

    bgMusic.play();
    document.getElementById("gameOver").style.display = "none";
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameStarted || !player.alive || isPaused) return;
    player.move(keys);
    zombies.forEach(z => z.moveToward(player));
    updateBullets();
    updateParticles();
    checkZombiePlayerCollision();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " ") player.shoot(); // Chama o método shoot do player
    if (e.key === "p") togglePause();
    if (e.key === "h") openAbilityShop();
});

document.addEventListener("keyup", (e) => keys[e.key] = false);

document.getElementById("startMenu").style.display = "block";
window.startGame = startGame;
window.restartGame = restartGame;
window.closeAbilityShop = closeAbilityShop;

// Intervalo para spawn de zumbis e progressão de turno/nível
setInterval(() => {
    if (gameStarted && player.alive && !isPaused) {
        player.turno++;
        if (player.turno % 5 === 0) { // A cada 5 turnos, aumenta o nível
            currentLevel++;
            // Aumenta a taxa de spawn de zumbis a cada novo nível
            spawnInterval = Math.max(500, spawnInterval - 500); // Reduz o intervalo, mínimo de 500ms
        }
        // Spawna múltiplos zumbis por turno, dependendo do nível
        const zombiesToSpawn = 1 + Math.floor(currentLevel / 2);
        for (let i = 0; i < zombiesToSpawn; i++) {
            spawnZombie();
        }
    }
}, 5000); // Intervalo de 5 segundos para o turno