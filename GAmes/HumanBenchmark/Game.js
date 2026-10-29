// Width of the game window
const WIDTH = 800;
// Height of the game window
const HEIGHT = 600;
// Phaser game settings
const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#222222',
    parent: 'game-box',
    scene: {
        create: create
    }
};
// Creates the game
const game = new Phaser.Game(config);
// Variables
let messageText;
let startTime;
let waitingForClick = false;
let gamestarted = false;
let timerEvent;
// CREATE FUNCTION
function create() {
    // Adds text to the screen
    messageText = this.add.text(
        WIDTH / 2,
        HEIGHT / 2,
        'Click to Start',
        {
            fontSize: '40px',
            color: '#ffffff'
        }
    );
    // Moves text origin to center
    messageText.setOrigin(0.5);
    // Detects mouse click
    this.input.on('pointerdown', () => {
        // If not waiting yet
        if (!gamestarted) {
            startTest(this);
        }
        // If screen is green
        else if (waitingForClick) {
            endTest(this);
        }
        else {
            earlyclick(this);
        }
    });
    console.log(this);
    console.log(Date.now());
}
// START TEST
function startTest(scene) {
    gamestarted = true;
    messageText.setText(
        'Wait for Green...'
    );
    scene.cameras.main.setBackgroundColor(
        '#aa0000'
    );
    waitingForClick = false;
    const delay =
        Phaser.Math.Between(2000, 5000);
    timerEvent =
        scene.time.delayedCall(delay, () => {
            scene.cameras.main.setBackgroundColor('#00aa00');
            messageText.setText('CLICK!');
            startTime = Date.now();
            waitingForClick = true;
        });
}
// END TEST
function endTest(scene) {
    // Current time
    const endTime = Date.now();
    // Calculate reaction time
    const reactionTime = endTime - startTime;
    // Show result
    messageText.setText(
        'Reaction Time:\n' +
        reactionTime +
        ' ms\n\n' +
        'Click to play again'
    );
    // White background
    scene.cameras.main.setBackgroundColor('#222222');
    // Reset state
    waitingForClick = false;
    gamestarted = false;
}
function earlyclick(scene) {
    if (timerEvent) {
        timerEvent.remove();
        timerEvent = null;
    }
    scene.cameras.main.setBackgroundColor('#4278f5');
    messageText.setText(" Too early!\n\nClick to restart."); waitingForClick = false; gamestarted = false;
}