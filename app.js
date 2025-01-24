const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restart-button');
const pauseButton = document.getElementById('pause-button');
const scoreDisplay = document.getElementById('score');

let paused = false; // Variable to track the game's paused state
let spectate = false; // Variable to track if the player is in spectate mode
let gameOver = false; // Variable to track if the game is over

let apple = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 10
};

let score = 0; // Variable to track the player's score
let topScore = 0; // Variable to track the top score

//player variable
const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 20,
    height: 20,
    speed: 2,
    dx: 0,
    dy: 0,
    visible: true // Track player visibility
};

// Generate cars
const cars = [];
for (let i = 0; i < 15; i++) {
    const position = getRandomPosition();
    cars.push({
        x: position.x,
        y: position.y,
        width: 20,
        height: 20,
        speed: getRandomSpeed(),
        direction: Math.random() > 0.5 ? 'right' : 'left'
    });
}

const minCarDistance = 350; // Minimum distance between cars

function getRandomSpeed() {
    return Math.random() * 1 + 5; // Kecepatan antara 6 dan 7
}

// Function to generate random position for cars
function getRandomPosition() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height 
    };
}

//player color
function drawPlayer() {
    if (player.visible) {
        ctx.fillStyle = 'purple';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

//car color
function drawCars() {
    ctx.fillStyle = 'yellow';
    cars.forEach(car => {
        ctx.fillRect(car.x, car.y, car.width, car.height);
    });
}

function drawApple() {
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(apple.x, apple.y, apple.size, 0, Math.PI * 2);
    ctx.fill();
}

function checkAppleCollision() {
    const distX = player.x - apple.x;
    const distY = player.y - apple.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < player.width / 2 + apple.size) {
        score++;
        apple.x = Math.random() * canvas.width;
        apple.y = Math.random() * canvas.height;
        scoreDisplay.textContent = 'Score: ' + score;
    }
}

function drawBackground() {
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to update the game state
function update() {
    if (!paused && !gameOver) {
        // Draw the background
        drawBackground();

        // update posisi player
        player.x += player.dx;
        player.y += player.dy;

        // pembatas player
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

        // ilangin canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // gambar player, apel sama mobil
        drawCars();
        drawPlayer();
        drawApple();
        checkAppleCollision();

        // skor
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score + ' | Top Score: ' + topScore, 10, 20);

        // Update car positions
        newPos();

        // Check for collisions
        detectCollisions();
    }
    if (!gameOver) {
        requestAnimationFrame(update);
    }
}

// Event listeners for buttons
restartButton.addEventListener('click', () => {
    // Reset player position
    player.x = canvas.width / 2 - 10;
    player.y = canvas.height - 50;
    // Reset score
    score = 0;
    scoreDisplay.textContent = 'Score: ' + score + ' | Top Score: ' + topScore;
    // Reset apple position
    apple.x = Math.random() * canvas.width;
    apple.y = Math.random() * canvas.height;
});

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    if (!spectate) {
        player.x += player.dx;
        player.y += player.dy;
    }

    cars.forEach((car, index) => {
        if (car.direction === 'right') {
            car.x += car.speed;
            if (car.x > canvas.width) {
                car.x = -car.width; // Reset car position to the left
                car.speed = getRandomSpeed(); // Assign a new random speed
            }
        } else {
            car.x -= car.speed;
            if (car.x + car.width < 0) {
                car.x = canvas.width; // Reset car position to the right
                car.speed = getRandomSpeed(); // Assign a new random speed
            }
        }

        // Ensure the car maintains a minimum distance from the previous car
        if (index > 0) {
            const prevCar = cars[index - 1];
            if (car.direction === prevCar.direction && Math.abs(car.x - prevCar.x) < minCarDistance) {
                car.x = prevCar.x - minCarDistance;
            }
        }
    });

    detectCollisions();
    detectWalls();
}

function detectCollisions() {
    cars.forEach(car => {
        if (
            player.x < car.x + car.width &&
            player.x + player.width > car.x &&
            player.y < car.y + car.height &&
            player.y + player.height > car.y
        ) {
            // Collision detected, update top score if current score is higher
            if (score > topScore) {
                topScore = score;
                scoreDisplay.textContent = 'Score: ' + score + ' | Top Score: ' + topScore;
            }

            // Set game over flag
            gameOver = true;
        }
    });
}

function detectWalls() {
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function moveUp() {
    if (!spectate) player.dy = -player.speed;
}

function moveDown() {
    if (!spectate) player.dy = player.speed;
}

function moveRight() {
    if (!spectate) player.dx = player.speed;
}

function moveLeft() {
    if (!spectate) player.dx = -player.speed;
}

function keyDown(e) {
    if (e.key === 'd' || e.key === 'D') {
        moveRight();
    } else if (e.key === 'a' || e.key === 'A') {
        moveLeft();
    } else if (e.key === 'w' || e.key === 'W') {
        moveUp();
    } else if (e.key === 's' || e.key === 'S') {
        moveDown();
    }
}

function keyUp(e) {
    if (
        e.key === 'd' ||
        e.key === 'D' ||
        e.key === 'a' ||
        e.key === 'A' ||
        e.key === 'w' ||
        e.key === 'W' ||
        e.key === 's' ||
        e.key === 'S'
    ) {
        player.dx = 0;
        player.dy = 0;
    }
}

function restartGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 30;
    player.dx = 0;
    player.dy = 0;
    player.visible = true;
    spectate = false;
    cars.forEach((car, index) => {
        car.x = car.direction === 'right' ? -index * 300 : canvas.width + index * 300; // Reset car positions with spacing
        car.speed = getRandomSpeed(); // Assign a new random speed when restarting
    });
    paused = false; // Unpause the game
    score = 0; // Reset score
    apple.x = Math.random() * canvas.width; // Reset apple position
    apple.y = Math.random() * canvas.height; // Reset apple position
    gameOver = false; // Reset game over flag
    scoreDisplay.textContent = 'Score: ' + score + ' | Top Score: ' + topScore;
    update(); // Restart the game loop
}

function togglePause() {
    paused = !paused;
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
}

restartButton.addEventListener('click', restartGame);
pauseButton.addEventListener('click', togglePause);

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

update();
