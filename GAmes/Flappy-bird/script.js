(() => {
  const WIDTH = 480;
  const HEIGHT = 640;
  const GROUND_Y = 600;
  const statusElement = document.querySelector("#game-status");
  const scoreElement = document.querySelector("#score");
  const pauseButton = document.querySelector("#pause-button");
  const restartButton = document.querySelector("#restart-button");
  let game;
  let scene;

  class FlappyScene extends Phaser.Scene {
    constructor() {
      super("flappy");
      this.handleAction = this.handleAction.bind(this);
    }

    create() {
      scene = this;
      this.mode = "ready";
      this.score = 0;
      this.speed = 190;
      this.pipeTimer = 0;
      this.pipes = [];
      this.cameras.main.setBackgroundColor("#d7f1f5");
      this.add.rectangle(WIDTH / 2, GROUND_Y + 20, WIDTH, 40, 0x759d57);
      this.add.rectangle(WIDTH / 2, GROUND_Y, WIDTH, 4, 0x405d34);
      this.add.ellipse(86, 155, 108, 24, 0xffffff, 0.65);
      this.add.ellipse(360, 220, 124, 26, 0xffffff, 0.55);

      this.bird = this.add.ellipse(140, 290, 32, 25, 0xf4d35e);
      this.add.ellipse(149, 286, 5, 5, 0x17251c);
      this.physics.add.existing(this.bird);
      this.bird.body.setAllowGravity(false);
      this.bird.body.setSize(25, 19).setOffset(3, 3);

      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.off("pointerdown", this.handleAction);
      this.input.on("pointerdown", this.handleAction);
      statusElement.textContent = "Click, tap, or press Space to start.";
      scoreElement.value = "0";
      pauseButton.disabled = true;
      pauseButton.textContent = "Pause";
    }

    handleAction() {
      if (this.mode === "ready") {
        this.mode = "playing";
        this.bird.body.setAllowGravity(true);
        this.spawnPipe(WIDTH + 90);
        this.pipeTimer = 1000;
        pauseButton.disabled = false;
        statusElement.textContent = "Fly through the gaps. Space, click, or tap to flap.";
      }
      if (this.mode === "playing") this.bird.body.setVelocityY(-440);
    }

    spawnPipe(x) {
      const gap = Math.max(132, 178 - this.score * 1.8);
      const center = Phaser.Math.Between(190, GROUND_Y - 100);
      const pipeWidth = 64;
      const upperHeight = center - gap / 2;
      const lowerY = center + gap / 2;
      const upper = this.add.rectangle(x, upperHeight / 2, pipeWidth, upperHeight, 0x2c8b57).setOrigin(0.5);
      const lowerHeight = GROUND_Y - lowerY;
      const lower = this.add.rectangle(x, lowerY + lowerHeight / 2, pipeWidth, lowerHeight, 0x2c8b57).setOrigin(0.5);
      this.add.rectangle(x, upperHeight - 7, pipeWidth + 12, 14, 0x237348);
      this.add.rectangle(x, lowerY + 7, pipeWidth + 12, 14, 0x237348);
      this.pipes.push({ x, upper, lower, passed: false, center, gap, pipeWidth });
    }

    update(_time, delta) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.handleAction();
      if (this.mode !== "playing") return;

      const elapsed = delta / 1000;
      this.pipeTimer += delta;
      if (this.pipeTimer >= 1650) {
        this.spawnPipe(WIDTH + 50);
        this.pipeTimer = 0;
      }

      const birdBody = this.bird.body;
      this.bird.rotation = Phaser.Math.Clamp(birdBody.velocity.y / 1100, -0.35, 0.7);
      if (birdBody.y + birdBody.height >= GROUND_Y || birdBody.y < 0) {
        this.endGame();
        return;
      }

      for (const pipe of this.pipes) {
        pipe.x -= this.speed * elapsed;
        pipe.upper.x = pipe.x;
        pipe.lower.x = pipe.x;
        if (!pipe.passed && pipe.x + pipe.pipeWidth / 2 < this.bird.x) {
          pipe.passed = true;
          this.score += 1;
          scoreElement.value = String(this.score);
          this.speed = Math.min(310, 190 + this.score * 5);
        }

        const birdLeft = birdBody.x;
        const birdRight = birdBody.right;
        const birdTop = birdBody.y;
        const birdBottom = birdBody.bottom;
        const pipeLeft = pipe.x - pipe.pipeWidth / 2;
        const pipeRight = pipe.x + pipe.pipeWidth / 2;
        if (birdRight > pipeLeft && birdLeft < pipeRight && (birdTop < pipe.center - pipe.gap / 2 || birdBottom > pipe.center + pipe.gap / 2)) {
          this.endGame();
          return;
        }
      }

      this.pipes = this.pipes.filter(pipe => {
        if (pipe.x < -pipe.pipeWidth) {
          pipe.upper.destroy();
          pipe.lower.destroy();
          return false;
        }
        return true;
      });
    }

    endGame() {
      this.mode = "over";
      this.bird.body.setAllowGravity(false);
      this.bird.body.setVelocity(0, 0);
      statusElement.textContent = `Game over. Final score: ${this.score}. Restart to play again.`;
      pauseButton.disabled = true;
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: "game-container",
    backgroundColor: "#d7f1f5",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade", arcade: { gravity: { y: 1450 }, debug: false } },
    scene: [FlappyScene]
  };

  game = new Phaser.Game(config);

  const pauseGame = () => {
    if (!scene) return;
    if (scene.mode === "playing") {
      scene.mode = "paused";
      scene.scene.pause();
      pauseButton.textContent = "Resume";
      statusElement.textContent = "Paused.";
    } else if (scene.mode === "paused") {
      scene.mode = "playing";
      scene.scene.resume();
      pauseButton.textContent = "Pause";
      statusElement.textContent = "Fly through the gaps. Space, click, or tap to flap.";
    }
  };

  const restartGame = () => {
    if (scene?.mode === "paused") scene.scene.resume();
    game.scene.start("flappy");
  };

  pauseButton.addEventListener("click", pauseGame);
  restartButton.addEventListener("click", restartGame);

  window.addEventListener("pagehide", () => {
    pauseButton.removeEventListener("click", pauseGame);
    restartButton.removeEventListener("click", restartGame);
    game?.destroy(true);
    game = null;
    scene = null;
  }, { once: true });
})();