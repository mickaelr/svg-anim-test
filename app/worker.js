/* -------------- *\
   GLOBAL METHODS
\* -------------- */

function inArray(array, value) {
  // Returns true if the passed value is found in the array. Returns false if it is not.
  var i;
  for(i=0; i < array.length; i++) {
    if(array[i] == value) {
      return true;
    }
  }
  return false;
};



/* -------------------- *\
   SELF ADJUSTING TIMER
\* -------------------- */

var fps = 60;
var timerIteration = 0;

function timestamp() {
  return performance && performance.now ? performance.now() : new Date().getTime();
}

var start = timestamp();
var time = 0;

function instance() {
  if(timerIteration != 0)
    time += 1000 / fps;
  timerIteration++;

  if(game && gamer) {
    calcGamerPosition();
    calcGamerInteractions();
    postMessage({
      command: 'updated',
      gamer: gamer
    });
  }

  var diff = (timestamp() - start) - time;
  setTimeout("instance()", (1000 / fps - diff));
}
instance();



/* --------------------- *\
   GAME VARIABLES UPDATE
\* --------------------- */

var game, gamer, entities;

onmessage = function(e) {
  if(e && e.data) {
    switch(e.data.command) {
      case 'update':
        if(!game) {
          game = e.data.game;
        }
        if(!gamer) {
          gamer = e.data.gamer;
        } else {
          gamer.isInitialyMirrored = e.data.gamer.isInitialyMirrored;
          gamer.mirrored = e.data.gamer.mirrored;
        }
        entities = e.data.entities;
        break;
      case 'stateChanged':
        game = e.data.game;
        gamer = e.data.gamer;
        break;
      case 'collided':
        gamer.lifePoints = e.data.gamer.lifePoints;
        break;
      case 'keydown':
        game = e.data.game;
        break;
      case 'keyup':
        game = e.data.game;
        break;
    }
  }
}



/* -------------- *\
   UPDATE METHODS
\* -------------- */

var mirrorGamer = function() {
  if((!gamer.isInitialyMirrored && gamer.xSpeed < 0) || (gamer.isInitialyMirrored && gamer.xSpeed > 0))
    gamer.mirrored = true;
  else if((!gamer.isInitialyMirrored && gamer.xSpeed > 0) || (gamer.isInitialyMirrored && gamer.xSpeed < 0))
    gamer.mirrored = false;
}

var calcGamerPosition = function() {

  if(game.keyLeft) {
    gamer.xSpeed = (gamer.xSpeed > 0) ? 0 : (gamer.xSpeed - gamer.xSpeedStep / game.envFriction);
  } else if(game.keyRight) {
    gamer.xSpeed = (gamer.xSpeed < 0) ? 0 : (gamer.xSpeed + gamer.xSpeedStep / game.envFriction);
  } else if(!game.keyLeft && !game.keyRight && gamer.xSpeed != 0) {
    if(gamer.xSpeed < 0)
      gamer.xSpeed += 1 / game.envFriction;
    else if(gamer.xSpeed > 0)
      gamer.xSpeed -= 1 / game.envFriction;
  }

  mirrorGamer();

  if(gamer.xSpeed > gamer.xSpeedMax)
    gamer.xSpeed = gamer.xSpeedMax;
  if(gamer.xSpeed < - gamer.xSpeedMax)
    gamer.xSpeed = - gamer.xSpeedMax;
  if(gamer.ySpeed > gamer.ySpeedMax)
    gamer.ySpeed = gamer.ySpeedMax;
  if(gamer.ySpeed < - gamer.ySpeedMax)
    gamer.ySpeed = - gamer.ySpeedMax;

  // Change the gamer location.
  gamer.x += gamer.xSpeed;
  gamer.y += gamer.ySpeed;

  if (gamer.x < 0)
    gamer.x = 0;
  if (gamer.x > game.board.width - (gamer.width ? gamer.width : 0))
    gamer.x = game.board.width - (gamer.width ? gamer.width : 0);
  if (gamer.y > game.board.height) {
    gamer.y = game.board.height;
    postMessage({
      command: 'changeState'
    });
  }
}



/* ------------------ *\
   COLLISION HANDLING
\* ------------------ */

var calcGamerInteractions = function() {
  switch(game.playerState) {
    case 0:
      break;
    case 1:
      handleObjectsCollision(entities.trees);
      break;
    case 2:
      handleObjectsCollision(entities.birds);
      break;
    case 3:
      handleObjectsCollision(entities.boats);
      break;
    case 4:
      handleObjectsCollision(entities.fishes);
      break;
  }
}

function areColliding(elm1, elm2) {
  return !(
      ((elm1.y + elm1.height) < (elm2.y)) ||
      (elm1.y > (elm2.y + elm2.height)) ||
      ((elm1.x + elm1.width) < elm2.x) ||
      (elm1.x > (elm2.x + elm2.width))
  );
}

var handleObjectsCollision = function(objArray) {
  var currentlyCollidedWith = [];

  objArray.forEach(function(element, index, array) {
    if(areColliding(element, {x: gamer.x, y: gamer.y, width: gamer.width, height: gamer.height})) {
      currentlyCollidedWith.push(element.id);
      if(!inArray(gamer.previouslyCollidedWith, element.id)) {
        postMessage({
          command: 'collision',
          entityId: element.id
        });
      }
    }
  });

  gamer.previouslyCollidedWith = currentlyCollidedWith;
}
