class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        this.snake = [
            { x: 10, y: 10 }
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gameStarted = false;

        this.colors = {
            snake: '#4a5568',
            snakeHead: '#2d3748',
            food: '#e53e3e',
            foodShadow: '#c53030',
            background: '#f7fafc',
            grid: '#e2e8f0'
        };

        this.initializeGame();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeGame() {
        this.generateFood();
        this.draw();
    }

    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'W':
                case 'w':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 'S':
                case 's':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'A':
                case 'a':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'D':
                case 'd':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    e.preventDefault();
                    break;
            }
        });

        // Button events
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }

    startGame() {
        this.gameRunning = true;
        this.gameStarted = true;
        this.hideOverlay();
        this.gameLoop();
    }

    resetGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.updateDisplay();
        this.generateFood();
        this.draw();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.draw();

            if (this.gameRunning) {
                this.gameLoop();
            }
        }, this.getGameSpeed());
    }

    getGameSpeed() {
        // Speed increases as score increases
        const baseSpeed = 150;
        const speedIncrease = Math.floor(this.score / 5) * 10;
        return Math.max(80, baseSpeed - speedIncrease);
    }

    clearCanvas() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw subtle grid
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    moveSnake() {
        // Don't move if no direction is set yet
        if (this.dx === 0 && this.dy === 0) {
            return;
        }

        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.updateDisplay();
            this.generateFood();
            this.showScoreAnimation();
        } else {
            this.snake.pop();
        }
    }

    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }

    draw() {
        // Draw snake
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;

            if (index === 0) {
                // Draw head with special styling
                this.ctx.fillStyle = this.colors.snakeHead;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);

                // Add eyes
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(x + 4, y + 4, 3, 3);
                this.ctx.fillRect(x + 13, y + 4, 3, 3);
                this.ctx.fillStyle = 'black';
                this.ctx.fillRect(x + 5, y + 5, 1, 1);
                this.ctx.fillRect(x + 14, y + 5, 1, 1);
            } else {
                // Draw body
                this.ctx.fillStyle = this.colors.snake;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            }
        });

        // Draw food with animation effect
        const foodX = this.food.x * this.gridSize;
        const foodY = this.food.y * this.gridSize;
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 2;

        // Food shadow
        this.ctx.fillStyle = this.colors.foodShadow;
        this.ctx.fillRect(foodX + 2, foodY + 2, this.gridSize - 4, this.gridSize - 4);

        // Food
        this.ctx.fillStyle = this.colors.food;
        this.ctx.fillRect(foodX + 1 + pulse, foodY + 1 + pulse, this.gridSize - 2 - pulse * 2, this.gridSize - 2 - pulse * 2);

        // Food highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillRect(foodX + 3, foodY + 3, 4, 4);
    }

    gameOver() {
        this.gameRunning = false;

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateDisplay();
            this.showNewHighScore();
        }

        this.showGameOverOverlay();
    }

    showGameOverOverlay() {
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');

        title.textContent = '🎮 Game Over!';
        message.textContent = `Final Score: ${this.score}`;
        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        overlay.style.display = 'flex';
    }

    hideOverlay() {
        document.getElementById('gameOverlay').style.display = 'none';
    }

    updateDisplay() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
    }

    showScoreAnimation() {
        const scoreElement = document.getElementById('current-score');
        scoreElement.style.transform = 'scale(1.2)';
        scoreElement.style.color = '#e53e3e';

        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
            scoreElement.style.color = '#4a5568';
        }, 200);
    }

    showNewHighScore() {
        const highScoreElement = document.getElementById('high-score');
        highScoreElement.style.transform = 'scale(1.3)';
        highScoreElement.style.color = '#38a169';

        // Add celebration effect
        const celebration = document.createElement('div');
        celebration.textContent = '🎉 New High Score! 🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 1.2em;
            font-weight: 600;
            z-index: 1000;
            animation: celebrationPulse 2s ease-in-out;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        // Add celebration animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes celebrationPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                20%, 80% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(celebration);

        setTimeout(() => {
            document.body.removeChild(celebration);
            document.head.removeChild(style);
            highScoreElement.style.transform = 'scale(1)';
            highScoreElement.style.color = '#4a5568';
        }, 2000);
    }
}

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!game.gameRunning) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && game.dx !== -1) {
                // Swipe right
                game.dx = 1;
                game.dy = 0;
            } else if (deltaX < 0 && game.dx !== 1) {
                // Swipe left
                game.dx = -1;
                game.dy = 0;
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && game.dy !== -1) {
                // Swipe down
                game.dx = 0;
                game.dy = 1;
            } else if (deltaY < 0 && game.dy !== 1) {
                // Swipe up
                game.dx = 0;
                game.dy = -1;
            }
        }
    }
});

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
});

// Prevent scrolling on mobile when playing
document.addEventListener('touchmove', (e) => {
    if (game && game.gameRunning) {
        e.preventDefault();
    }
}, { passive: false });
