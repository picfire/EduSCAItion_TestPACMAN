/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 } } },


  scene: {
    preload: preload,
    create: create,
    update: update } };



const game = new Phaser.Game(config);
let cursors;
let player;
let showDebug = false;
let interactText;
let canInteract = false;
let objectToInteract;
let battleVariables;
let canBattle = false;
let battleText;
let helpTextHidden = false;

function preload() {
  this.load.image("tiles", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "https://raw.githubusercontent.com/jesus-aguilar-pro/EduSCAItion/refs/heads/main/assets/map/tilemaps/tuxemon-town.json?token=GHSAT0AAAAAAC5WCSXQVZYLLW3ZUU6EKTBW2AFFDSQ");

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.png", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.json");
}

function create() {
  const map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createLayer("World", tileset, 0, 0);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  player = this.physics.add.
  sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front").
  setSize(30, 40).
  setOffset(0, 24);

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });

  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });

  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });

  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });


  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  // Help text that has a "fixed" position on the screen
  const helpText = this.add.
  text(16, 16, 'Use the arrow keys to move, go ahead and enter the battle gym \nto learn about variables! (Press "Enter" to hide)', {
    font: "18px monospace",
    fill: "#000000",
    padding: { x: 20, y: 10},
    backgroundColor: "#ffffff" }).

  setScrollFactor(0).
  setDepth(30);

  // Hide help text with fade when Enter is pressed
  this.input.keyboard.on("keydown-ENTER", () => {
    this.tweens.add({
      targets: helpText,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        helpText.setVisible(false);
        helpTextHidden = true; // Set flag when help text is hidden
      }
    });
  });

  // Debug graphics
  this.input.keyboard.once("keydown-D", event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add.
    graphics().
    setAlpha(0.75).
    setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });

  // Add first battle (Teaches Variables)
  // Located in the first building on the left

  battleVariables = this.add.rectangle(276, 1095, 60, 60, 0x0000ff);
  battleVariables.setAlpha(0); // Make it invisible
  this.physics.add.existing(battleVariables, true); // Add physics

  // Add overlap detection for battle
  this.physics.add.overlap(player, battleVariables, () => {
    if (!canBattle && helpTextHidden) { // Only show if help text is hidden
      battleText = this.add.text(16, 16, 'Press SPACE to start battle', {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(30);
      canBattle = true;
    }
  }, null, this);

  // Add an interactive object
  objectToInteract = this.add.rectangle(460, 1040, 40, 40, 0x00ff00);
  objectToInteract.setAlpha(0);
  this.physics.add.existing(objectToInteract, true); // Make it a static physics object

  // Add overlap detection
  this.physics.add.overlap(player, objectToInteract, () => {
    if (!canInteract && helpTextHidden) { // Only show if help text is hidden
      interactText = this.add.text(16, 16, 'Press SPACE to interact', {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(30);
      canInteract = true;
    }
  }, null, this);

  // Add spacebar interaction
  this.input.keyboard.on('keydown-SPACE', () => {
    if (canInteract) {
      // Show interaction message
      const message = this.add.text(16, 60, 'You found a special object!', {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(30);

      // Fade out after 2 seconds
      this.tweens.add({
        targets: message,
        alpha: 0,
        duration: 1000,
        delay: 2000,
        onComplete: () => message.destroy()
      });
    }

    if (canBattle) {
      // Show battle message
      const battleMessage = this.add.text(16, 60, 'Battle Started!', {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setDepth(30);

      // Fade out after 2 seconds
      this.tweens.add({
        targets: battleMessage,
        alpha: 0,
        duration: 1000,
        delay: 2000,
        onComplete: () => {
          battleMessage.destroy();
          // Transition to Pokemon battle page
          window.location.href = '../../pokecode_progr_game/pokemon.html';
        }
      });
    }
  });
}

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");else
    if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");else
    if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");else
    if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
  }

  // Check if player is not overlapping anymore
  if (!this.physics.overlap(player, objectToInteract) && canInteract) {
    if (interactText) {
      interactText.destroy();
    }
    canInteract = false;
  }

  // Check if player is not overlapping with battleVariables anymore
  if (!this.physics.overlap(player, battleVariables) && canBattle) {
    if (battleText) {
      battleText.destroy();
    }
    canBattle = false;
  }
}