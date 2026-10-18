const WIDTH = 1024;
const HEIGHT = 768;
const HIGH_SCORE_KEY = "javanoffice.googleDino.highScore";

function readHighScore() {
  try {
    const storedScore = Number(localStorage.getItem(HIGH_SCORE_KEY));
    return Number.isSafeInteger(storedScore) && storedScore >= 0 ? storedScore : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}

let player;
let clouds;
let ground;

class Game extends Phaser.Scene {
  constructor() {
    super("Game");
    this.player = null;
  }

  preload() {
    this.load.spritesheet("dino", "public/assests/dino-run.png", {
      frameWidth: 88,
      frameHeight: 94,
    });
    this.load.image("ground", "public/assests/ground.png");
    this.load.image("cloud", "public/assests/cloud.png");
    this.load.image("game-over", "public/assests/game-over.png");
    this.load.image("restart", "public/assests/restart.png");
    this.load.image("dino-hurt", "public/assests/dino-hurt.png");
    this.load.spritesheet("enemy-bird", "public/assests/enemy-bird.png", {
      frameWidth: 92,
      frameHeight: 77,
    });
    this.load.spritesheet("dino-down", "public/assests/dino-down.png", {
      frameWidth: 118,
      frameHeight: 58,
    });
    this.load.spritesheet("dino-white", "public/assests/dino-white.png", {
      frameWidth: 88,
      frameHeight: 94,
    });
    this.load.image("dino-hurt-white", "public/assests/dino-hurt-white.png");
    this.load.spritesheet("dino-down-white", "public/assests/dino-down-white.png", {
      frameWidth: 118,
      frameHeight: 58,
    });
    this.load.audio("jumping", "public/assests/jump.m4a");
    this.load.audio("hitting", "public/assests/hit.m4a");
    this.load.spritesheet("enemy-bird-white", "public/assests/enemy-bird-white.png", {
      frameWidth: 92,
      frameHeight: 77,
    });
    this.load.audio("reaching", "public/assests/reach.m4a");
    this.load.image("restart-white", "public/assests/restart-white.png");
    this.load.image("game-over-white", "public/assests/game-over-white.png");
    this.load.spritesheet("numbers", "public/assests/numbers.png", {
      frameWidth: 20,
      frameHeight: 21,
    });
    this.load.spritesheet("numbers-white", "public/assests/numbers-white.png", {
      frameWidth: 20,
      frameHeight: 21,
    });

    for (let i = 0; i < 6; i++) {
      const cactusNum = i + 1;
      this.load.image(`obstacle-${cactusNum}`, `public/assests/cactuses_${cactusNum}.png`);
      this.load.image(
        `obstacle-white-${cactusNum}`,
        `public/assests/cactuses_white_${cactusNum}.png`
      );
    }
  }

  create() {
    this.isGameRunning = true;
    //Dino-duck define
    this.isDown = false;
    this.player = this.physics.add
      .sprite(200, 200, "dino")
      .setDepth(1)
      .setOrigin(0, 1)
      .setGravityY(3150)
      .setCollideWorldBounds(true)
      .setBodySize(44, 92); //add the dino Sprite

    this.ground = this.add.tileSprite(0, 300, WIDTH, 30, "ground").setOrigin(0, 1); //add the ground image
    this.cameras.main.setBackgroundColor("#ffffff");

    this.clouds = this.add.group();
    this.clouds.addMultiple([
      this.add.image(200, 100, "cloud"),
      this.add.image(300, 130, "cloud"),
      this.add.image(450, 80, "cloud"),
    ]); //add cloud image
    this.gameSpeed = 10; //if you are chaning gamespeed, change all that is relvant to make the game fair

    //add an invisible staticSprite to handle collsions
    this.groundCollider = this.physics.add
      .staticSprite(0, 300, "ground")
      .setOrigin(0, 1)
      .setVisible(false);
    this.groundCollider.body.setSize(1000, 30); //Adjust Collison size if necessary

    //enable collsion between the player and the invisible collider
    this.physics.add.collider(this.player, this.groundCollider);

    this.obstacles = this.physics.add.group({
      allowGravity: false, //No gravity for cactuses
    });
    this.canJump = true;
    this.timer = 0;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.handleTouchJump = this.handleTouchJump.bind(this);
    this.input.on("pointerdown", this.handleTouchJump);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.handleTouchJump);
    });
    this.physics.add.collider(this.obstacles, this.player, this.gameOver, null, this);
    this.gameOverText = this.add.image(0, 0, "game-over").setDepth(1);
    this.gameOverWhiteText = this.add.image(0, 0, "game-over-white").setDepth(1);
    this.restartText = this.add.image(0, 80, "restart").setInteractive().setDepth(1);
    this.restartWhiteText = this.add.image(0, 80, "restart-white").setInteractive().setDepth(1);
    this.gameOverContainer = this.add
      .container(1024 / 2, 300 / 2 - 50)
      .add([this.gameOverText, this.restartText])
      .setAlpha(0);
    this.gameOverWhiteContainer = this.add
      .container(1024 / 2, 300 / 2 - 50)
      .add([this.gameOverWhiteText, this.restartWhiteText])
      .setAlpha(0);
    //this.scoreText = this.add.text(900, 60, "000000",{fontSize: "30px", fontFamily: "Arial", color: "#535353", relsolution: 5}).setOrigin(1, 0);
    this.score = 0;
    this.highScore = readHighScore();
    this.isNight = false;
    this.nextDayNight = 1000;
    this.frameCounter = 0;
    this.scoreAccumulator = 0;
    this.lastMilestone = 0;
    //this.highScoreText = this.add.text(900, 90, "HI 000000", {fontSize: "30px", fontFamily: "Arial", color: "#535353", resolution: 5}).setOrigin(1,0).setAlpha(1);

    this.scoreDigits = [];
    this.highScoreDigits = [];
    this.scoreWhiteDigits = [];
    this.highScoreWhiteDigits = [];

    //score
    for (let i = 0; i < 7; i++) {
      const digit = this.add.sprite(820 + i * 22, 60, "numbers", 0).setOrigin(0, 0);
      const whiteDigit = this.add.sprite(820 + i * 22, 60, "numbers-white", 0).setOrigin(0, 0);

      whiteDigit.setVisible(false);

      this.scoreDigits.push(digit);
      this.scoreWhiteDigits.push(whiteDigit);
    }

    // ADD "HI"
    this.highScoreLabel = this.add
      .text(780, 95, "HI", { fontSize: "20px", fontFamily: "Merriweather", color: "#535353" })
      .setOrigin(0, 0);
    //High score
    for (let i = 0; i < 7; i++) {
      const digit = this.add.sprite(820 + i * 22, 95, "numbers", 0).setOrigin(0, 0);
      const whiteDigit = this.add.sprite(820 + i * 22, 95, "numbers-white", 0).setOrigin(0, 0);

      whiteDigit.setVisible(false);

      this.highScoreDigits.push(digit);
      this.highScoreWhiteDigits.push(whiteDigit);
    }

    this.updateScoreDisplay(this.highScoreDigits, this.highScore);
    this.updateScoreDisplay(this.highScoreWhiteDigits, this.highScore);

    this.spawnDistance = 0;
    this.lastSpawnWasClose = false;
    this.nextSpawnDistance = Phaser.Math.Between(500, 900);
    this.anims.create({
      key: "dino-run",
      frames: this.anims.generateFrameNumbers("dino", {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.player.play("dino-run", true);

    this.anims.create({
      key: "dino-white-run",
      frames: this.anims.generateFrameNumbers("dino-white", {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dino-duck",
      frames: this.anims.generateFrameNumbers("dino-down", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dino-white-duck",
      frames: this.anims.generateFrameNumbers("dino-down-white", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    //if jumping, do not display dino-run animation and display texture

    this.nextSpeedIncrease = 100;

    this.ground.setPipeline("TextureTintPipeline");
    this.ground.setScrollFactor(0);

    this.anims.create({
      key: "bird-fly",
      frames: this.anims.generateFrameNumbers("enemy-bird", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "bird-fly-white",
      frames: this.anims.generateFrameNumbers("enemy-bird-white", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    //this.birds = this.physics.add.group({allowGravity: false});

    const restartGame = () => {
      this.physics.resume();
      this.player.setTexture("dino");
      this.player.setVelocityY(0);
      this.obstacles.clear(true, true);
      this.gameOverContainer.setAlpha(0);
      this.gameOverWhiteContainer.setAlpha(0);
      this.score = 0;
      this.frameCounter = 0;
      this.scoreAccumulator = 0;
      this.lastMilestone = 0;
      this.gameSpeed = 10;
      this.nextSpeedIncrease = 100;
      this.isNight = false;
      this.nextDayNight = 1000;
      this.tweens.add({
        targets: this.bgColor,
        r: 255,
        g: 255,
        b: 255,
        duration: 1500,
      });
      this.playSound("jumping");
      this.isDown = false;

      this.ground.clearTint();
      this.player.clearTint();
      this.highScoreLabel.setColor("#535353");

      this.clouds.getChildren().forEach((cloud) => {
        this.tweens.add({
          targets: this.clouds.getChildren(),
          alpha: 1,
          duration: 1500,
        });
      });
      this.spawnDistance = 0;
      this.nextSpawnDistance = Phaser.Math.Between(500, 900);
      const formattedScore = String(Math.floor(this.score)).padStart(5, "0");
      //this.scoreText.setText(formattedScore);
      this.isGameRunning = true;
      this.anims.resumeAll();
      this.player.play("dino-run", true);
      this.isDown = false;

      this.player.body.setSize(44, 92);
      this.player.body.offset.x = 0;
      this.player.body.offset.y = 0;
      this.obstacles.clear(true, true);

      this.scoreDigits.forEach((d) => d.setVisible(true));
      this.highScoreDigits.forEach((d) => d.setVisible(true));

      this.scoreWhiteDigits.forEach((d) => d.setVisible(false));
      this.highScoreWhiteDigits.forEach((d) => d.setVisible(false));
    };

    this.restartText.on("pointerdown", restartGame);

    this.restartWhiteText.on("pointerdown", restartGame);

    this.spawnDistance = 0;
    this.lastSpawnWasClose = false;
    this.nextSpawnDistance = Phaser.Math.Between(500, 900);

    this.bgColor = { r: 255, g: 255, b: 255 };

    this.targetBgColor = { r: 255, g: 255, b: 255 };
  }

  update(time, delta) {
    if (!this.isGameRunning) {
      return;
    }
    this.ground.tilePositionX += this.gameSpeed * (delta / 16.666);
    this.ground.tilePositionX = Math.floor(this.ground.tilePositionX);

    this.spawnDistance += this.gameSpeed;

    // Score increases based on movement speed
    this.scoreAccumulator += (this.gameSpeed * delta) / 831;

    // Convert to displayed score
    this.score = Math.floor(this.scoreAccumulator);

    // Format score like Chrome Dino
    const formattedScore = String(this.score).padStart(5, "0");

    this.updateScoreDisplay(this.scoreDigits, this.score);
    this.updateScoreDisplay(this.scoreWhiteDigits, this.score);

    const bgHex = Phaser.Display.Color.GetColor(this.bgColor.r, this.bgColor.g, this.bgColor.b);

    this.cameras.main.setBackgroundColor(bgHex);

    if (this.score >= this.nextDayNight) {
      this.isNight = !this.isNight;

      if (this.isNight) {
        // NIGHT
        this.tweens.add({
          targets: this.bgColor,
          r: 28,
          g: 28,
          b: 28,
          duration: 1500,
        });
        this.player.setTexture("dino-white");

        this.player.play(this.getRunAnimKey(), true);

        this.tweens.addCounter({
          from: 0xffffff,
          to: 0x888888,
          duration: 1500,
          onUpdate: (tween) => {
            this.ground.setTint(tween.getValue());
          },
        });

        this.highScoreLabel.setColor("#ffffff");

        //this.scoreDigits = this.scoreWhiteDigits;
        //this.highScoreDigits = this.highScoreWhiteDigits;

        this.clouds.getChildren().forEach((cloud) => {
          this.tweens.add({
            targets: this.clouds.getChildren(),
            alpha: 0.5,
            duration: 1500, //time taken to change colour from white to black
          });
        });

        //Changes colour of cactus when time of day changes
        this.obstacles.getChildren().forEach((obstacle) => {
          if (obstacle.isBird) {
            obstacle.setTexture("enemy-bird-white");
            obstacle.play("bird-fly-white", true);
          } else {
            obstacle.setTexture(`obstacle-white-${obstacle.obstacleNum}`);
          }
        });
        //Hide Black digits
        this.scoreDigits.forEach((d) => d.setVisible(false));
        this.highScoreDigits.forEach((d) => d.setVisible(false));

        // Show white digits
        this.scoreWhiteDigits.forEach((d) => d.setVisible(true));
        this.highScoreWhiteDigits.forEach((d) => d.setVisible(true));
      } else {
        //Show black digits
        this.scoreDigits.forEach((d) => d.setVisible(true));
        this.highScoreDigits.forEach((d) => d.setVisible(true));

        // Hide white digits
        this.scoreWhiteDigits.forEach((d) => d.setVisible(false));
        this.highScoreWhiteDigits.forEach((d) => d.setVisible(false));

        // DAY
        this.tweens.add({
          targets: this.bgColor,
          r: 255,
          g: 255,
          b: 255,
          duration: 1500,
        });
        this.player.setTexture("dino");

        this.player.play(this.getRunAnimKey(), true);

        this.ground.clearTint();

        this.highScoreLabel.setColor("#535353");

        this.clouds.getChildren().forEach((cloud) => {
          this.tweens.add({
            targets: this.clouds.getChildren(),
            alpha: 1, //Changes cloud transparence
            duration: 1500, //time taken to change between black to white
          });
        });
        //change colour of cactus when time of day changes
        this.obstacles.getChildren().forEach((obstacle) => {
          if (obstacle.isBird) {
            obstacle.setTexture("enemy-bird");
            obstacle.play("bird-fly", true);
          } else {
            obstacle.setTexture(`obstacle-${obstacle.obstacleNum}`);
          }
        });
      }

      this.nextDayNight += 700;
    }

    // ===== SCORE MILESTONE =====

    const currentMilestone = Math.floor(this.score / 100);
    if (currentMilestone > this.lastMilestone) {
      this.lastMilestone = currentMilestone;
      // Flash score
      this.scoreDigits.forEach((d) => d.setAlpha(0.2));
      this.time.delayedCall(200, () => {
        this.scoreDigits.forEach((d) => d.setAlpha(1));
      });
      // Play sound
      this.playSound("reaching");
    }

    if (this.spawnDistance > this.nextSpawnDistance) {
      // 20% chance to spawn bird
      const spawnBird = Phaser.Math.Between(1, 100) <= 20;

      if (spawnBird) {
        this.spawnBird();

        // birds force safe spacing after
        this.lastSpawnWasClose = false;
      } else {
        this.spawnObstacle();
      }

      this.spawnDistance = 0;

      let closeSpawn = false;

      // Only allow close spawn if previous spawn was NOT close
      if (!this.lastSpawnWasClose) {
        closeSpawn = Phaser.Math.Between(1, 100) <= 20; //chances of closeSpawn, 15 easier, 20 medium, 25> hard
      }

      if (closeSpawn) {
        // Rare close obstacle
        const minDistance = 300 + this.gameSpeed * 8;
        const maxDistance = 400 + this.gameSpeed * 10;

        this.nextSpawnDistance = Phaser.Math.Between(minDistance, maxDistance);

        this.lastSpawnWasClose = true;
      } else {
        // Safe normal spacing
        const minDistance = 550 + this.gameSpeed * 15;
        const maxDistance = 950 + this.gameSpeed * 20;
        //the larger the number, the more reaction time there is

        this.nextSpawnDistance = Phaser.Math.Between(minDistance, maxDistance);

        this.lastSpawnWasClose = false;
      }
    }
    //obstacle spawning and despawning

    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed * (delta / 16.666));

    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.getBounds().right < 0) {
        this.obstacles.remove(obstacle);
        obstacle.destroy();
      }
    });

    // ===== PLAYER ANIMATION SYSTEM =====

    const isGrounded = this.player.body.onFloor();

    // Jumping
    if (!isGrounded) {
      this.player.setFrame(0);

      // Ducking
    } else if (this.isDown) {
      if (this.player.anims.currentAnim?.key !== this.getDuckAnimKey()) {
        this.player.play(this.getDuckAnimKey(), true);
        this.isDown = true;
      }

      // Running
    } else {
      if (this.player.anims.currentAnim?.key !== this.getRunAnimKey()) {
        this.player.play(this.getRunAnimKey(), true);
        this.isDown = false;
      }
    }

    const { space, up, down } = this.cursors;

    // ===== DUCK INPUT =====

    if (down.isDown && this.player.body.onFloor()) {
      if (!this.isDown) {
        // Enter duck state
        this.isDown = true;

        //Save current bottom position
        //const bottom = this.player.body.bottom;

        //  duck hitbox
        this.player.body.setSize(70, 58);

        // Center hitbox
        this.player.body.setOffset(20, 34);

        //Keep sprite aligned properly
        //this.player.setOrigin(0, 1);

        //Restore bottom position
        //this.player.body.y = bottom - this.player.body.height;
        //this.player.play(this.getRunAnimKey(), false);
        this.player.play(this.getDuckAnimKey(), true);
      }
    } else {
      if (this.isDown) {
        // Exit duck state
        this.isDown = false;

        //Save current bottom position
        //const bottom = this.player.body.bottom;

        // Normal hitbox
        this.player.body.setSize(44, 92);

        this.player.body.setOffset(0, 0);
        //this.player.play(this.getDuckAnimKey(), false);
        this.player.play(this.getRunAnimKey(), true);

        //Restore alignment
        //this.player.setOrigin(0, 1);

        //Restore bottom position
        //this.player.body.y = bottom - this.player.body.height;
      }
    }

    //Duck input
    /*if(down.isDown && this.player.body.onFloor()){
    if(!this.isDown) {
    
        this.isDown = true
        this.player.setBodySize(70, 58)
        this.player.body.setOffset(20, 34);
        this.player.play(this.getDuckAnimKey(), true);
    
    
    }
 } else {
    
    if(this.isDown){
    this.isDown = false
    this.player.setBodySize(44, 92);
    this.player.body.setOffset(0, 0);
    
    this.player.play(this.getRunAnimKey(), true);
    
    }
 } */

    const jumpPressed = Phaser.Input.Keyboard.JustDown(space) || Phaser.Input.Keyboard.JustDown(up);

    //jump logic
    if (jumpPressed && this.player.body.onFloor() && !this.isDown) {
      this.player.setVelocityY(-1150);
      this.playSound("jumping");
    }

    if (this.player.body.velocity.y > 0 && this.player.body.velocity.y < 800) {
      this.player.body.velocity.y += 40;
    }
    if (this.player.body.onFloor()) {
      this.canJump = true;
    }

    //score differ

    if (this.score >= this.nextSpeedIncrease) {
      if (this.gameSpeed < 12) {
        this.gameSpeed += 0.4;
      } else if (this.gameSpeed < 14) {
        this.gameSpeed += 0.33;
      } else if (this.gameSpeed < 16) {
        this.gameSpeed += 0.099;
      } else if (this.gameSpeed < 21) {
        this.gameSpeed += 0.1111111111111111111111111111111111111;
      }

      this.nextSpeedIncrease += 90;
    }

    //cloud appearinng and dissappearing

    Phaser.Actions.IncX(this.clouds.getChildren(), -this.gameSpeed * 0.3 * (delta / 16.666));

    this.clouds.getChildren().forEach((cloud) => {
      if (cloud.x < -cloud.width) {
        this.clouds.remove(cloud, true, true);

        const newCloud = this.add.image(
          WIDTH + Phaser.Math.Between(50, 200),
          Phaser.Math.Between(50, 150),
          "cloud"
        );

        this.clouds.add(newCloud);
      }
    });
  }

  gameOver() {
    //check to see if high score

    // Update high score if current score is higher
    if (this.score > this.highScore) {
      this.highScore = this.score;
      saveHighScore(this.highScore);

      // Format like Chrome Dino
      const formattedHighScore = String(this.highScore).padStart(5, "0");

      this.updateScoreDisplay(this.highScoreDigits, this.highScore);
      this.updateScoreDisplay(this.highScoreWhiteDigits, this.highScore);
    }

    this.physics.pause();
    this.timer = 0;
    this.isGameRunning = false;

    if (this.isNight) {
      this.gameOverWhiteContainer.setAlpha(1);
    } else {
      this.gameOverContainer.setAlpha(1);
    }

    this.anims.pauseAll();

    this.player.setTexture(this.getHurtTextureKey());
    this.playSound("hitting");
  }

  handleTouchJump() {
    if (this.isGameRunning && !this.isDown && this.player.body.onFloor()) {
      this.player.setVelocityY(-1150);
      this.playSound("jumping");
    }
  }

  playSound(key) {
    if (this.cache.audio.exists(key)) this.sound.play(key);
  }

  getRunAnimKey() {
    return this.isNight ? "dino-white-run" : "dino-run";
  }

  getDuckAnimKey() {
    return this.isNight ? "dino-white-duck" : "dino-duck";
  }

  getHurtTextureKey() {
    return this.isNight ? "dino-hurt-white" : "dino-hurt";
  }

  spawnObstacle() {
    const obstacleNum = Phaser.Math.Between(1, 6);

    const yOffsetMap = {
      1: -4,
      2: -6,
      3: -5,
      4: -8,
      5: -6,
      6: -10,
    };

    const cactusKey = this.isNight ? `obstacle-white-${obstacleNum}` : `obstacle-${obstacleNum}`;

    const yOffset = yOffsetMap[obstacleNum] || 0;

    const obstacle = this.obstacles.create(1024, 300 + yOffset, cactusKey).setOrigin(0, 1);
    obstacle.obstacleNum = obstacleNum;

    // Smaller hitbox
    obstacle.body.setSize(
      obstacle.width * 0.8,
      obstacle.height * 0.95 // larger the number, the more diffcult
    );

    // Center the hitbox
    obstacle.body.offset.x = obstacle.width * 0.1;
    obstacle.body.offset.y = obstacle.height * 0.05;
  }

  spawnBird() {
    // Two possible heights
    const birdHeights = [
      300, // near ground
      240, // dino jump height
      180, // Highest Point
    ];

    // Randomly pick one height
    const yPos = Phaser.Utils.Array.GetRandom(birdHeights);

    // Choose texture based on day/night
    const birdKey = this.isNight ? "enemy-bird-white" : "enemy-bird";

    const bird = this.obstacles.create(1024, yPos, birdKey).setOrigin(0, 1);

    // Play correct animation
    bird.play(this.isNight ? "bird-fly-white" : "bird-fly", true);

    // Hitbox
    bird.body.setSize(bird.width * 0.7, bird.height * 0.6);

    bird.body.offset.x = 10;
    bird.body.offset.y = 10;

    // Mark as bird
    bird.isBird = true;

    // Store height
    bird.flightY = yPos;
  }

  updateScoreDisplay(scoreArray, value) {
    const scoreString = String(value).padStart(scoreArray.length, "0");

    for (let i = 0; i < scoreArray.length; i++) {
      const num = parseInt(scoreString[i]);

      scoreArray[i].setFrame(num);
    }
  }
}
