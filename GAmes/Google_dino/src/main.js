const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  backgroundColor: "#FFF",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Game],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

const dinoGame = new Phaser.Game(config);

window.addEventListener(
  "pagehide",
  (event) => {
    if (!event.persisted) dinoGame.destroy(true);
  },
  { once: true }
);
