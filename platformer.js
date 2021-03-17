//pick your prof title screen
//avoid blackboard icons, github icons
//points for gvsu logos

// https://www.deviantart.com/turboignited/art/Stickman-Spritesheet-691692371
// https://opengameart.org/content/man-walking-animation
// https://opengameart.org/content/animated-character
// https://leftshoe18.itch.io/animated-stick-figure-unity

//stickman: https://www.deviantart.com/turboignited/art/Stickman-Spritesheet-691692371

// https://www.kenney.nl/assets/simplified-platformer-pack
// solarize --> brightness:60 --> duplicate/add noise/75% opacity on top



//based on https://workshops.hackclub.com/platformer/
var uiSprites
var groundSprites
var GROUND_SPRITE_WIDTH = 50
var GROUND_SPRITE_HEIGHT = 50
var numGroundSprites
var obstacleSprites
var coinSprites
var coinImg

var powerupSprites
var powerupImg

var GRAVITY = 0.3
var JUMP = -5

var player
var isGameOver
var isPaused
var powerupTimer
var score

let systems

//// particle stuff
////

function collideEntity(e, p) {
  if (powerupTimer > 0) {
    score += 200
    e.remove()
  } else
    isGameOver = true
}

function addCoin(c, p) {
  let _p = new ParticleSystem(createVector(c.position.x, c.position.y));
  systems.push(_p);

  score += 100
  c.remove()
}

function addPowerup(c, p) {
  powerupTimer = 100
  player.changeAnimation('powerup')
  c.remove()
}

function setup() {
  isGameOver = false
  isPaused = false
  powerupTimer = 0
  score = 0
  systems = []

  let kenneyPath = "sprites/kenney/PNG/"

  coinImg = loadImage("sprites/gvsu-logo-1.png")
  powerupImg = loadImage(kenneyPath + "Tiles/platformPack_tile023.png")

  createCanvas(800, 600)//400, 300)
  background(150, 200, 250)

  groundSprites = new Group()
  obstacleSprites = new Group()
  coinSprites = new Group()
  powerupSprites = new Group()
  uiSprites = new Group()
  numGroundSprites = width / GROUND_SPRITE_WIDTH + 1

  for (let n = 0; n < numGroundSprites; n++) {
    let gs = createSprite(
      n * 50,
      height - 25,
      GROUND_SPRITE_WIDTH,
      GROUND_SPRITE_HEIGHT
    )
    groundSprites.add(gs)
  }

  /// Player sprites
  //player = createSprite(100, height-75, 25, 25)//50, 50)
  player = createSprite(100, height - 75, 96, 96)//128, 128)//25, 25)//50, 50)
  playerAnim = player.addAnimation('walking', kenneyPath + "Characters/platformChar_walk1.png", kenneyPath + "Characters/platformChar_walk2.png")//'sprites/walk/1.png', 'sprites/walk/20.png')
  playerAnim.frameDelay = 12

  powerupAnim = player.addAnimation('powerup', kenneyPath + "Characters/platformChar_walk1-power.png", kenneyPath + "Characters/platformChar_walk2-power.png")//'sprites/walk/1.png', 'sprites/walk/20.png')
  powerupAnim.frameDelay = 12

  player.changeAnimation('walking')
  player.setCollider('rectangle', 1, 15, 78, 68)//8, 24, 78, 64)

  /// UI sprites
  ui = createSprite(0, 0, width, 40)
  uiSprites.add(ui)
}

function resetGame() {
  for (var n = 0; n < numGroundSprites; n++) {
    var gndSprite = groundSprites[n]
    gndSprite.position.x = n * 50
  }
  player.position.x = 100
  player.position.y = height - 50 - player.height / 2
  player.velocity.y = 0

  coinSprites.removeSprites()
  obstacleSprites.removeSprites()
  powerupSprites.removeSprites()

  systems = []

  isPaused = false
  isGameOver = false
  score = 0
}

function mouseClicked() {
  if (isGameOver)
    resetGame()
  else {
    player.velocity.y = JUMP
  }
}

function draw() {
  if (isGameOver) {
    background(0)
    fill(255)
    textAlign(CENTER)
    text('Final score: ' + score, camera.position.x, camera.position.y - 20)
    text('Game over! Click or press any key to restart', camera.position.x, camera.position.y)

    if (keyIsPressed === true)
      resetGame()

  } else {
    background(150, 200, 250)

    if (!isPaused) {
      player.velocity.y = player.velocity.y + GRAVITY

      // collision
      if (groundSprites.overlap(player)) {
        player.velocity.y = 0
        player.position.y = height - 50 - player.height / 2
      }

      if (uiSprites.overlap(player)) {
        player.position.y = height - 50 - player.height / 2
      }

      // handle input
      if (keyDown(UP_ARROW)) {
        player.velocity.y = JUMP
        //console.log('wtf')
      }

      // DEBUG
      if (keyDown('a')) {
        powerupTimer = 200
        player.changeAnimation('powerup')
      }

      fill(128)
      ui.position.x = camera.position.x

      player.position.x = player.position.x + 5
      camera.position.x = player.position.x + width / 4

      var firstGroundSprite = groundSprites[0]
      if (firstGroundSprite.position.x <= camera.position.x - (width / 2 + firstGroundSprite.width / 2)) {
        groundSprites.remove(firstGroundSprite)
        firstGroundSprite.position.x = firstGroundSprite.position.x + numGroundSprites * firstGroundSprite.width
        groundSprites.add(firstGroundSprite)
      }

      // spawn obstacles randomly
      if (random() > 0.95) {
        var obstacle = createSprite(camera.position.x + width,
          random(0, height - 50 - 15),
          30, 30)
        obstacleSprites.add(obstacle)
      }

      // remove if necessary
      var firstObstacle = obstacleSprites[0]
      if ((obstacleSprites.length > 0) && (firstObstacle.position.x <= camera.position.x - (width / 2 + firstObstacle.width / 2))) {
        removeSprite(firstObstacle)
      }

      // collide
      obstacleSprites.overlap(player, collideEntity)


      //// coins
      if (random() > 0.95) {
        var coin = createSprite(camera.position.x + width,
          random(0, height - 50 - 15),
          30, 30)
        coin.addImage(coinImg)
        coinSprites.add(coin)
      }
      // remove if necessary
      var firstCoin = coinSprites[0]
      if ((coinSprites.length > 0) && (firstCoin.position.x <= camera.position.x - (width / 2 + firstCoin.width / 2))) {
        removeSprite(firstCoin)
      }
      // collide
      coinSprites.overlap(player, addCoin)


      //// powerups
      if (random() > 0.99) {
        var powerup = createSprite(camera.position.x + width,
          random(0, height - 50 - 15),
          30, 30)
        powerup.addImage(powerupImg)
        powerup.scale = 0.75
        powerupSprites.add(powerup)

      }
      // remove if necessary
      var firstPowerup = powerupSprites[0]
      if ((powerupSprites.length > 0) && (firstPowerup.position.x <= camera.position.x - (width / 2 + firstPowerup.width / 2))) {
        removeSprite(firstPowerup)
      }
      // collide
      powerupSprites.overlap(player, addPowerup)




      for (i = 0; i < systems.length; i++) {
        systems[i].run();
        systems[i].addParticle();

        if (systems[i].particles.length > 10) {
          systems.splice(i, 1);
        }
      }

      drawSprites()

      // score
      score = score + 1
      textAlign(CENTER)
      text(score, camera.position.x, 10)

      // powerup
      if (powerupTimer > 0) {
        powerupTimer--
        if (powerupTimer == 0)
          player.changeAnimation('walking')
      }
    } else {
      console.log("paused")
    }
  }
}

function keyReleased() {
  if ((keyCode == 80) && (!isGameOver)) { // pause
    isPaused = !isPaused
  }
}


// A simple Particle class
let Particle = function (position) {
  this.acceleration = createVector(0, 0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 255.0;
};

Particle.prototype.run = function () {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function () {
  stroke(200, this.lifespan);
  strokeWeight(2);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

let ParticleSystem = function (position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function () {
  // Add either a Particle or CrazyParticle to the system
  if (int(random(0, 2)) == 0) {
    p = new Particle(this.origin);
  }
  else {
    p = new CrazyParticle(this.origin);
  }
  this.particles.push(p);
};

ParticleSystem.prototype.run = function () {
  for (let i = this.particles.length - 1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};

// A subclass of Particle

function CrazyParticle(origin) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  Particle.call(this, origin);

  // Initialize our added properties
  this.theta = 0.0;
};

// Create a Crazy.prototype object that inherits from Particle.prototype.
// Note: A common error here is to use "new Particle()" to create the
// Crazy.prototype. That's incorrect for several reasons, not least
// that we don't have anything to give Particle for the "origin"
// argument. The correct place to call Particle is above, where we call
// it from Crazy.
CrazyParticle.prototype = Object.create(Particle.prototype); // See note below

// Set the "constructor" property to refer to CrazyParticle
CrazyParticle.prototype.constructor = CrazyParticle;

// Notice we don't have the method run() here; it is inherited from Particle

// This update() method overrides the parent class update() method
CrazyParticle.prototype.update = function () {
  Particle.prototype.update.call(this);
  // Increment rotation based on horizontal velocity
  this.theta += (this.velocity.x * this.velocity.mag()) / 10.0;
}

// This display() method overrides the parent class display() method
CrazyParticle.prototype.display = function () {
  // Render the ellipse just like in a regular particle
  Particle.prototype.display.call(this);
  // Then add a rotating line
  push();
  translate(this.position.x, this.position.y);
  rotate(this.theta);
  stroke(255, this.lifespan);
  //line(0, 0, 25, 0);
  pop();
}