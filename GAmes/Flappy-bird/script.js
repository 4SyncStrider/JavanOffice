(() => {
  const WIDTH = 480;
  const HEIGHT = 640;
  const GROUND_Y = 600;
  const DAY_DURATION_MS = 5 * 60 * 1000;
  const NIGHT_DURATION_MS = 2 * 60 * 1000;
  const DAY_NIGHT_TRANSITION_MS = 4000;
  const MAX_PIPE_CENTER_SHIFT = 64;
  const PIPE_EDGE_CLEARANCE = 28;
  const statusElement = document.querySelector("#game-status");
  const scoreElement = document.querySelector("#score");
  const pauseButton = document.querySelector("#pause-button");
  let game;
  let scene;

  class FlappyScene extends Phaser.Scene {
    constructor() {
      super("flappy");
      this.handleAction = this.handleAction.bind(this);
    }

    preload() {
      this.load.image("back", "assets/back.png");
      this.load.image("day", "assets/background-day.png");
      this.load.image("night", "assets/background-night.png");
      this.load.image("pipe", "assets/pipe-green.png");
      this.load.image("bird", "assets/yellowbird-upflap.png");
      this.load.image("game-over", "../Google_dino/public/assests/game-over.png");
    }

    create() {
      scene = this;
      this.mode = "ready";
      this.score = 0;
      this.speed = 190;
      this.pipeTimer = 0;
      this.phaseElapsedMs = 0;
      this.transitionElapsedMs = 0;
      this.dayNightPhase = "day";
      this.lastPipeCenter = null;
      this.pipes = [];
      this.cameras.main.setBackgroundColor("#4ec0ca");
      this.dayBackground = this.add
        .image(WIDTH / 2, HEIGHT / 2, "day")
        .setDisplaySize(WIDTH, HEIGHT)
        .setDepth(-20);
      this.nightBackground = this.add
        .image(WIDTH / 2, HEIGHT / 2, "night")
        .setDisplaySize(WIDTH, HEIGHT)
        .setAlpha(0)
        .setDepth(-19);
      this.add.rectangle(WIDTH / 2, GROUND_Y + 20, WIDTH, 40, 0x45bd45).setDepth(6);
      this.add.rectangle(WIDTH / 2, GROUND_Y, WIDTH, 4, 0x278b32).setDepth(6);

      this.bird = this.add.image(140, 290, "bird").setDisplaySize(51, 36).setDepth(5);
      this.physics.add.existing(this.bird);
      this.bird.body.setAllowGravity(false);
      this.bird.body.setSize(25, 19).setOffset(3, 3);

      this.gameOverShade = this.add
        .rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x071b17, 0.55)
        .setDepth(8)
        .setVisible(false);
      this.gameOverPanel = this.add
        .rectangle(WIDTH / 2, HEIGHT / 2 - 42, 420, 78, 0xf4f7f4, 0.94)
        .setDepth(9)
        .setVisible(false);
      this.gameOverImage = this.add
        .image(WIDTH / 2, HEIGHT / 2 - 42, "game-over")
        .setDisplaySize(380, 42)
        .setDepth(10)
        .setVisible(false);
      this.backSprite = this.add
        .image(WIDTH / 2, HEIGHT / 2 + 35, "back")
        .setDisplaySize(52, 55)
        .setDepth(11)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);
      this.backSprite.on("pointerdown", () => this.scene.restart());

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
      const minimumCenter = gap / 2 + PIPE_EDGE_CLEARANCE;
      const maximumCenter = GROUND_Y - gap / 2 - PIPE_EDGE_CLEARANCE;
      const minimumNextCenter =
        this.lastPipeCenter === null
          ? minimumCenter
          : Math.max(minimumCenter, this.lastPipeCenter - MAX_PIPE_CENTER_SHIFT);
      const maximumNextCenter =
        this.lastPipeCenter === null
          ? maximumCenter
          : Math.min(maximumCenter, this.lastPipeCenter + MAX_PIPE_CENTER_SHIFT);
      const center = Phaser.Math.Between(
        Math.ceil(minimumNextCenter),
        Math.floor(maximumNextCenter)
      );
      this.lastPipeCenter = center;
      const pipeWidth = 68;
      const upperHeight = center - gap / 2;
      const lowerY = center + gap / 2;
      const upper = this.add
        .image(x, upperHeight, "pipe")
        .setOrigin(0.5, 1)
        .setFlipY(true)
        .setDisplaySize(pipeWidth, upperHeight)
        .setDepth(3);
      const lowerHeight = GROUND_Y - lowerY;
      const lower = this.add
        .image(x, lowerY, "pipe")
        .setOrigin(0.5, 0)
        .setDisplaySize(pipeWidth, lowerHeight)
        .setDepth(3);
      this.pipes.push({ x, upper, lower, passed: false, center, gap, pipeWidth });
    }

    updateDayNightCycle(delta) {
      if (this.dayNightPhase === "day" || this.dayNightPhase === "night") {
        this.phaseElapsedMs += delta;
        const phaseDuration = this.dayNightPhase === "day" ? DAY_DURATION_MS : NIGHT_DURATION_MS;
        if (this.phaseElapsedMs < phaseDuration) return;

        this.dayNightPhase = this.dayNightPhase === "day" ? "toNight" : "toDay";
        this.transitionElapsedMs = 0;
        return;
      }

      this.transitionElapsedMs += delta;
      const progress = Phaser.Math.Clamp(this.transitionElapsedMs / DAY_NIGHT_TRANSITION_MS, 0, 1);
      const easedProgress = Phaser.Math.Easing.Sine.InOut(progress);
      const transitioningToNight = this.dayNightPhase === "toNight";
      this.dayBackground.setAlpha(transitioningToNight ? 1 - easedProgress : easedProgress);
      this.nightBackground.setAlpha(transitioningToNight ? easedProgress : 1 - easedProgress);

      if (progress === 1) {
        this.dayNightPhase = transitioningToNight ? "night" : "day";
        this.phaseElapsedMs = 0;
        this.transitionElapsedMs = 0;
      }
    }

    update(_time, delta) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.handleAction();
      if (this.mode !== "playing") return;

      this.updateDayNightCycle(delta);

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
        if (
          birdRight > pipeLeft &&
          birdLeft < pipeRight &&
          (birdTop < pipe.center - pipe.gap / 2 || birdBottom > pipe.center + pipe.gap / 2)
        ) {
          this.endGame();
          return;
        }
      }

      this.pipes = this.pipes.filter((pipe) => {
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
      this.gameOverShade.setVisible(true);
      this.gameOverPanel.setVisible(true);
      this.gameOverImage.setVisible(true);
      this.backSprite.setVisible(true);
      statusElement.textContent = `Game over. Final score: ${this.score}.`;
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
    scene: [FlappyScene],
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

  pauseButton.addEventListener("click", pauseGame);

  window.addEventListener(
    "pagehide",
    () => {
      pauseButton.removeEventListener("click", pauseGame);
      game?.destroy(true);
      game = null;
      scene = null;
    },
    { once: true }
  );
})();
