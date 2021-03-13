//pick your prof title screen
//avoid blackboard icons, github icons
//points for gvsu logos

// https://www.deviantart.com/turboignited/art/Stickman-Spritesheet-691692371
// https://opengameart.org/content/man-walking-animation
// https://opengameart.org/content/animated-character
// https://leftshoe18.itch.io/animated-stick-figure-unity

//based on https://workshops.hackclub.com/platformer/
var groundSprites
var GROUND_SPRITE_WIDTH  = 50
var GROUND_SPRITE_HEIGHT = 50
var numGroundSprites
var obstacleSprites

var GRAVITY = 0.3
var JUMP    = -5

var player
var isGameOver
var score

function endGame() {
  isGameOver = true
}

function setup() {
  isGameOver = false
  score      = 0

  createCanvas(800,600)//400, 300)
  background(150, 200, 250)

  groundSprites    = new Group()
  obstacleSprites  = new Group()
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

  player = createSprite(100, height-75, 128, 128)//25, 25)//50, 50)
  player.addAnimation('walking', 'sprites/walk/1.png', 'sprites/walk/20.png')
  player.changeAnimation('walking')
}

function mouseClicked() {
  if (isGameOver) {
    for (var n = 0; n < numGroundSprites; n++) {
      var gndSprite = groundSprites[n]
      gndSprite.position.x = n * 50
    }
    player.position.x = 100
    player.position.y = height - 50 - player.height / 2
    player.velocity.y = 0

    obstacleSprites.removeSprites()
    isGameOver = false
    score = 0
  } else {
    player.velocity.y = JUMP
  }
}

function draw() {
  if (isGameOver) {
    background(0)
    fill(255)
    textAlign(CENTER)
    text('Final score: ' + score, camera.position.x, camera.position.y - 20)
    text('Game over! Click to restart', camera.position.x, camera.position.y)
  } else {
    background(150, 200, 250)

    player.velocity.y = player.velocity.y + GRAVITY

    // collision
    if (groundSprites.overlap(player)) {
        player.velocity.y = 0
        player.position.y = height - 50 - player.height / 2
    }

    // handle input
    if (keyDown(UP_ARROW)) {
        player.velocity.y = JUMP
    }


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
    //obstacleSprites.overlap(player, endGame)
    
    drawSprites()

    score = score + 1
    textAlign(CENTER)
    text(score, camera.position.x, 10)
  }
}