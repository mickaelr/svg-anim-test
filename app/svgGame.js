$(document).ready(function() {

  /* ---------------- *\
     GLOBAL VARIABLES
  \* ---------------- */

  var playerState = 0;
  var endOfStage = true;
  var keyLeft = false;
  var keyRight = false;
  var envFriction = 2;
  var board = {
    width: 1000,
    height: 2000
  };
  var requestID = 0;
  var lastObjectId = 0;
  var loading = true;
  var playable = false;
  var playing = false;



  /* --------------- *\
     GAMER VARIABLES
  \* --------------- */

  var gamer = {
    x: 0,
    y: 0,
    lifePoints: 100,
    isInitialyMirrored: false,
    mirrored: false,
    xSpeed: 0,
    ySpeed: 4,
    xSpeedStep: 2,
    ySpeedStep: 0,
    xSpeedMax: 10,
    ySpeedMax: 10,
    previouslyCollidedWith: [],
    setGamerBox: function() {
      if(this.element) {
        this.width = this.element[0].getBBox().width;
        if(this.container)
          this.container.attr("width", this.width);
        this.height = this.element[0].getBBox().height;
        if(this.container)
          this.container.attr("height", this.height);
      }
    },
    draw: function() {
      this.container.attr("transform", "translate(" + this.x + ", " + this.y + ")");
      if(this.mirrored)
        this.element.attr("transform", "translate(" + this.width + ", 0)" + " scale(-1, 1)");
      else
        this.element.attr("transform", "");
    }
  };



  /* --------------------------- *\
     OBSTACLES & REWARDS OBJECTS
  \* --------------------------- */

  var entities = {};

  function findEntitiesById(id) {
    if(isNaN(id)) return;

    var result;
    for(var i in entities) {
      for(var j = 0; j < entities[i].length; j++) {
        if(entities[i][j] && entities[i][j].id == id)
          result = entities[i][j];
      }
    }
    return result;
  }

  var treeBuilder = new ObjectBuilder({
    constructor: function() {
      var objContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Create a g in SVG's namespace
      var obj = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
      obj.setAttribute("d", "M255.996,0l179.206,255.988h-87.045L486.39,409.576H383.982L512,563.172H307.185v128.011H204.8V563.172H0l128.002-153.596  h-102.4l138.233-153.588H76.798L255.996,0z"); //Set path's data
      obj.setAttribute("fill", "black");
      obj.setAttribute("transform", "scale(0.25, 0.3)");
      objContainer.appendChild(obj);
      return objContainer;
    },
    xSpeed: 0,
    ySpeed: 0,
    boardId: '#snowboarderBoard',
    onCollision: function() {
      console.log('tree');
      gamer.lifePoints -= 50;
    }
  });
  var cloudBuilder = new ObjectBuilder({
    constructor: function() {
      var objContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Create a g in SVG's namespace
      var obj = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
      obj.setAttribute("d", "M250.5,114.661c0,21.24-17.222,38.462-38.462,38.462v0.3H48.577C22.022,153.423,0.5,131.9,0.5,105.346 c0-23.287,16.564-42.706,38.556-47.119c0-0.319-0.094-0.62-0.094-0.958c0-31.87,25.823-57.692,57.693-57.692 c22.498,0,41.767,12.996,51.288,31.775c5.033-1.766,10.366-2.93,16.02-2.93c26.348,0,47.683,21.184,48.021,47.477h0.056v0.3 C233.278,76.199,250.5,93.421,250.5,114.661z"); //Set path's data
      obj.setAttribute("fill", "#dddddd");
      obj.setAttribute("transform", "scale(1, 1)");
      objContainer.appendChild(obj);
      return objContainer;
    },
    xSpeed: 1,
    ySpeed: 0,
    boardId: '#parachutistBoard',
    onCollision: function() {
      console.log('cloud');
    },
    onAnimation: function(cloud) {
      cloud.move();
    }
  });
  var birdBuilder = new ObjectBuilder({
    constructor: function() {
      var objContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Create a g in SVG's namespace
      var obj = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
      obj.setAttribute("d", "M18.055,1.356c34.729,0,49.06,0.917,87.262,57.399c0,0,20.601,27.312,45.609,25.925 c0,0,17.132,3.686,32.401-31.479C198.608,18.014,211.109-1.429,250,3.655c0,0-18.055,15.74-20.611,22.452 c-2.539,6.717-43.896,56.716-66.505,60.189c3.312,0.929,7.948,2.069,15.807,0.688c0,0,8.099,0.47,9.38,4.396 c-7.981-0.688-34.365,7.182-39.92,11.354c-5.543,4.178-24.582,15.303-39.841,3.948c3.267-0.48,21.534-3.848,29.991-11.992 c-14.229,0.162-37.828-4.469-55.436-20.896C65.297,57.357,22.681,7.816,0,4.114L18.055,1.356"); //Set path's data
      obj.setAttribute("fill", "#015673");
      obj.setAttribute("transform", "scale(0.3, 0.3)");
      objContainer.appendChild(obj);
      return objContainer;
    },
    xSpeed: 4,
    ySpeed: 0,
    boardId: '#parachutistBoard',
    onCollision: function() {
      console.log('bird');
      gamer.lifePoints -= 20;
    },
    onAnimation: function(bird) {
      bird.move();
    }
  });
  var boatBuilder = new ObjectBuilder({
    constructor: function() {
      var objContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Create a g in SVG's namespace
      var obj = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
      obj.setAttribute("d", "M299.236,44.172l-76.35,2.051l-27.716-45.88L99.016,2.101v14.766l22.676-0.645l18.517,31.7L2.627,51.321 c0,0-3.047-0.176-2.578,2.754l21.329,58.36c1.699,0.352,222.018,0.821,222.018,0.821c8.496,0,21.094-14.825,21.094-14.825 l34.454-51.623C298.943,46.868,301.111,43.762,299.236,44.172z M165.815,47.337l-19.454-31.114l43.36-1.348l18.81,31.291 L165.815,47.337z"); //Set path's data
      obj.setAttribute("fill", "black");
      obj.setAttribute("transform", "scale(0.8, 0.8)");
      objContainer.appendChild(obj);
      return objContainer;
    },
    xSpeed: 2,
    ySpeed: 0,
    boardId: '#kiterBoard',
    onCollision: function() {
      console.log('boat');
      gamer.lifePoints -= 50;
    },
    onAnimation: function(boat) {
      boat.move();
    }
  });
  var fishBuilder = new ObjectBuilder({
    constructor: function() {
      var objContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Create a g in SVG's namespace
      var obj = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
      obj.setAttribute("d", "M0.259,90.376c-0.291,0.606-0.27,1.047,0.016,1.343c3.316,3.514,43.578-13.085,53.277-17.982 c2.922-1.475,7.012-4.53,8.586-3.246c11.69,9.539,31.319,20.675,56.141,27.738c0.636,0.18,1.248,0.824,0.49,1.664l-11.178,8.906 c0,0-1.068,0.709,1.168,1.325c2.561,0.706,8.176,1.394,19.97,3.405c22.301,3.803,44.416-10.367,46.115-10.547 c21.009-2.211,34.276-9.325,34.277-9.325c1.129-0.485,0.956-1.982,0.311-2.283c-3.757-3.136-10.373-5.997-10.415-9.526 c-0.001-0.119,0.193-0.707,0.458-0.75c0.206-0.033,0.528,0.08,1.025,0.307c0.495,0.212,12.959,4.906,14.714,5.434 c6.547,1.967,9.527-0.173,9.919-0.109c19.524-9.244,24.868-15.896,24.868-25.807c0-14.766-34.393-52.097-85.249-53.835 c-2.233-0.276-3.354-0.737-4.455-1.131c-2.563-0.914-5.681-2.025-9.48-3.378c-18.648-6.644-40.199,0.583-45.374,2.269 c-1.051,0.342-0.233,1.05-0.233,1.05l10.457,7.312c0.701,0.649,0.185,0.959-0.224,1.09C91.028,22.142,72.509,36.227,59.8,44.156 c-2.516,1.57-6.33-0.491-6.33-0.491S31.554,33.094,20.78,25.871c-4.938-3.31-8.866-5.672-11.956-7.256 c0-0.001-0.003-0.003-0.003-0.004C-7.615,11.118,3.926,29.62,4.088,29.89c0.026,0.047,0.058,0.094,0.084,0.14 c1.002,1.656,2.088,3.358,3.201,5.047c0.004,0.004,0.008,0.01,0.012,0.015c4.935,7.487,10.384,14.711,11.181,16.423 C26.401,68.326,5.925,78.477,0.259,90.376z M202.339,43.765c0-3.646,2.904-6.603,6.485-6.603c3.58,0,6.484,2.957,6.484,6.603 c0,3.647-2.904,6.604-6.484,6.604C205.243,50.369,202.339,47.412,202.339,43.765z M177.409,20.3 c0.344-0.416,0.362,0.111,0.362,0.111s-9.816,18.045-8.835,32.779c1.312,19.66,11.42,34.871,11.42,34.871 c0.211,0.778-0.152,0.236-0.552-0.121C139.503,51.716,173.914,24.528,177.409,20.3z"); //Set path's data
      obj.setAttribute("fill", "black");
      obj.setAttribute("transform", "scale(0.3, 0.3)");
      objContainer.appendChild(obj);
      return objContainer;
    },
    xSpeed: 3,
    ySpeed: 0,
    boardId: '#diverBoard',
    onCollision: function() {
      console.log('fish');
      gamer.lifePoints -= 10;
    },
    onAnimation: function(fish) {
      fish.move();
    }
  });
  var waveBuilder = new ObjectBuilder({
    constructor: function() {
      var objContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Create a g in SVG's namespace
      var obj = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
      obj.setAttribute("d", "M68.227,30c-9.785,0-18.119-3.441-25-10.322c-4.301-4.301-9.436-6.452-15.403-6.452c-5.968,0-11.103,2.151-15.403,6.452 c-1.29,1.29-2.877,1.935-4.758,1.935c-1.882,0-3.467-0.645-4.758-1.935c-1.29-1.291-1.936-2.85-1.936-4.678s0.646-3.387,1.936-4.678 C9.786,3.441,18.092,0,27.824,0c9.731,0,18.037,3.441,24.919,10.322c4.301,4.301,9.434,6.451,15.403,6.451 c5.967,0,11.102-2.15,15.402-6.451c1.289-1.29,2.876-1.935,4.757-1.935c1.883,0,3.47,0.645,4.759,1.935 C94.355,11.613,95,13.172,95,15s-0.645,3.387-1.936,4.678C86.183,26.559,77.903,30,68.227,30z"); //Set path's data
      obj.setAttribute("fill", "#008F91");
      obj.setAttribute("transform", "scale(0.5, 0.5)");
      objContainer.appendChild(obj);
      return objContainer;
    },
    xSpeed: 2,
    ySpeed: 0,
    boardId: '#diverBoard',
    singleDirection: true,
    onCollision: function() {
      console.log('wave');
    },
    onAnimation: function(wave) {
      wave.move();
    }
  });

  function removeEntitiesElements(entitiesArray) {
    if(entitiesArray && entitiesArray.length > 0) {
      for(var i = 0; i < entitiesArray.length; i++) {
        if(entitiesArray[i] && entitiesArray[i].element) {
          entitiesArray[i].element.remove();
        }
      }
    }
  }

  function removeAllEntitiesElements() {
    for(var i in entities) {
      removeEntitiesElements(entities[i]);
    }
  }



  /* ---------- *\
     WEB WORKER
  \* ---------- */
  var worker;

  function startWorker() {
    if(typeof(Worker) !== "undefined") {
      if(typeof(worker) == "undefined") {
        worker = new Worker("app/worker.js");
      }
      handleWorkerMessages();
    } else {
      console.log('Sorry! No Web Worker support.');
    }
  }

  function handleWorkerMessages() {
    worker.onmessage = function(e) {
      if(e && e.data) {
        switch(e.data.command) {
          case 'updated':
            updateGamerFromWorker(e.data.gamer);
            break;
          case 'changeState':
            incrementState();
            onStateChange(playerState);
            if(worker) {
              worker.postMessage({
                command: 'stateChanged',
                gamer: formatGamer(),
                game: formatGameVariables()
              });
            }
            break;
          case 'collision':
            var collided = findEntitiesById(e.data.entityId);
            if(collided && collided.onCollision instanceof Function) {
              collided.onCollision();
            }
            if(worker) {
              worker.postMessage({
                command: 'collided',
                gamer: formatGamer()
              });
            }
            break;
        }
      }
    };
  }

  function stopWorker() {
    if(worker) {
      worker.terminate();
      worker = undefined;
    }
  }



  /* -------------- *\
     FORMAT METHODS
  \* -------------- */

  function formatGameVariables() {
    return {
      playerState: playerState,
      endOfStage: endOfStage,
      keyLeft: keyLeft,
      keyRight: keyRight,
      envFriction: envFriction,
      board: board,
      requestID: requestID,
      lastObjectId: lastObjectId,
      playing: playing
    };
  }

  function formatGamer() {
    return {
      x: gamer.x,
      y: gamer.y,
      width: gamer.width,
      height: gamer.height,
      lifePoints: gamer.lifePoints,
      isInitialyMirrored: gamer.isInitialyMirrored,
      mirrored: gamer.mirrored,
      xSpeed: gamer.xSpeed,
      ySpeed: gamer.ySpeed,
      xSpeedStep: gamer.xSpeedStep,
      ySpeedStep: gamer.ySpeedStep,
      xSpeedMax: gamer.xSpeedMax,
      ySpeedMax: gamer.ySpeedMax,
      previouslyCollidedWith: gamer.previouslyCollidedWith
    };
  }

  function formatEntities() {
    var result = {};
    for(var entity in entities) {
      result[entity] = formatEntityItems(entities[entity]);
    }
    return result;
  }

  function formatEntityItems(items) {
    if(items && items.length > 0) {
      var result = [];

      for(var i = 0; i < items.length; i++) {
        result.push({
          id: items[i].id,
          computedDirection: items[i].computedDirection,
          x: items[i].x,
          y: items[i].y,
          xSpeed: items[i].xSpeed,
          ySpeed: items[i].ySpeed,
          width: items[i].width,
          height: items[i].height
        });
      }

      return result;
    }
  }

  // for worker format & update methods we could use a properties-names-to-update array
  function updateGamerFromWorker(workerData) {
    gamer.x = workerData.x;
    gamer.y = workerData.y;
    gamer.lifePoints = workerData.lifePoints;
    gamer.mirrored = workerData.mirrored;
    gamer.xSpeed = workerData.xSpeed;
    gamer.ySpeed = workerData.ySpeed;
    gamer.xSpeedStep = workerData.xSpeedStep;
    gamer.ySpeedStep = workerData.ySpeedStep;
    gamer.xSpeedMax = workerData.xSpeedMax;
    gamer.ySpeedMax = workerData.ySpeedMax;
    gamer.previouslyCollidedWith = workerData.previouslyCollidedWith;
  }



  /* --------------------- *\
     REQUESTANIMATIONFRAME
  \* --------------------- */

  window.requestAnimationFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback) {
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  function timestamp() {
    return performance && performance.now ? performance.now() : new Date().getTime();
  }

  var fps = {
    startTime: timestamp(),
    frameNumber: 0,
    getFPS: function() {
      this.frameNumber++;
      var d = timestamp(),
      currentTime = (d - this.startTime) / 1000,
      result = Math.floor(this.frameNumber / currentTime);
      if(currentTime > 1) {
        this.startTime = timestamp();
        this.frameNumber = 0;
      }
      return result;
    }
  };



  /* --------- *\
     GAME LOOP
  \* --------- */

  function render() {
    if(gamer.element) {
      gamer.draw();
      $('body').scroll2(gamer.id);

      switch(playerState) {
        case 0:
          break;
        case 1:
          break;
        case 2:
          entities.clouds.forEach(function(element, index, array) {
            element.onAnimation(element);
          });
          entities.birds.forEach(function(element, index, array) {
            element.onAnimation(element);
          });
          break;
        case 3:
          entities.boats.forEach(function(element, index, array) {
            element.onAnimation(element);
          });
          break;
        case 4:
          entities.fishes.forEach(function(element, index, array) {
            element.onAnimation(element);
          });
          entities.waves.forEach(function(element, index, array) {
            element.onAnimation(element);
          });
          break;
      }
    }
  }

  function frame() {
    render();
    if(gamer.lifePoints > 0 && !endOfStage) {
      if(worker) {
        worker.postMessage({
          command: 'update',
          game: formatGameVariables(),
          gamer: formatGamer(),
          entities: formatEntities()
        });
      }
      requestID = window.requestAnimationFrame(frame);
    } else {
      stopWorker();
    }
    fps.getFPS();
  }

  function initGame() {
    loading = true;
    startWorker();
    if(worker) {
      playable = true;
    }
    incrementState();
    onStateChange(playerState);
    if(worker) {
      worker.postMessage({
        command: 'update',
        game: formatGameVariables(),
        gamer: formatGamer(),
        entities: formatEntities()
      });
    }
  }

  function startGame() {
    playing = true;
    worker.postMessage({
      command: 'play'
    });
    requestID = window.requestAnimationFrame(frame);
  }

  function stopGame(deep) {
    playing = false;
    worker.postMessage({
      command: 'pause'
    });
    window.cancelAnimationFrame(requestID);
    if(deep === true) {
      stopWorker();
      playable = false;
    }
  }



  /* ------------ *\
     GAME METHODS
  \* ------------ */

  var incrementState = function() {
    endOfStage = false;
    gamer.y = 0;
    playerState++;
  };

  function onStateChange(newState) {
    console.log('onStateChange to ' + newState);
    switch(newState) {
      case 1:
      case 2:
      case 3:
      case 4:
        loading = true;
        stopGame(false);
        removeAllEntitiesElements();
        setGamerElements(newState);
        gamer.element.show();
        break;
      case 5:
        stopGame(true);
        removeAllEntitiesElements();
        break;
    }
    switch(newState) {
      case 1:
        entities = {
          trees: treeBuilder.buildObjects(8, false)
        };
        break;
      case 2:
        entities = {
          clouds: cloudBuilder.buildObjects(6, true),
          birds: birdBuilder.buildObjects(10, false)
        };
        break;
      case 3:
        entities = {
          boats: boatBuilder.buildObjects(4, false)
        };
        break;
      case 4:
        entities = {
          fishes: fishBuilder.buildObjects(10, false),
          waves: waveBuilder.buildObjects(20, false)
        };
        break;
    }
    switch(newState) {
      case 1:
      case 2:
      case 3:
      case 4:
        loading = false;
        startGame();
        break;
    }
  }

  var setGamerElements = function(state) {
    var gameState = state ? state : playerState;
    if(!gameState) return;
    if(!gamer) gamer = {};

    switch(gameState) {
      case 0:
        break;
      case 1:
        gamer.id = "#snowboarder";
        gamer.element = $(gamer.id);
        gamer.container = $("#snowboarderContainer");
        gamer.board = $("#snowboarderBoard");
        gamer.isInitialyMirrored = false;
        gamer.mirrored = false;
        break;
      case 2:
        gamer.id = "#parachutist";
        gamer.element = $(gamer.id);
        gamer.container = $("#parachutistContainer");
        gamer.board = $("#parachutistBoard");
        gamer.isInitialyMirrored = false;
        gamer.mirrored = false;
        break;
      case 3:
        gamer.id = "#kiter";
        gamer.element = $(gamer.id);
        gamer.container = $("#kiterContainer");
        gamer.board = $("#kiterBoard");
        gamer.isInitialyMirrored = true;
        gamer.mirrored = true;
        break;
      case 4:
        gamer.id = "#diver";
        gamer.element = $(gamer.id);
        gamer.container = $("#diverContainer");
        gamer.board = $("#diverBoard");
        gamer.isInitialyMirrored = false;
        gamer.mirrored = false;
        break;
    }
    gamer.setGamerBox();
  }

  var newObjectId = function() {
    lastObjectId++;
    return lastObjectId;
  };

  var randomCoordinates = function() {
    return {x: Math.floor((Math.random() * board.width) + 1), y: Math.floor((Math.random() * board.height) + 1)};
  };

  var isValueInRange = function(val, range) {
    if(!val || !range) return;

    var min = Math.min(range.min, range.max);
    var max = Math.max(range.min, range.max);
    return (val >= min && val <= max);
  };

  var isValueInRanges = function(val, ranges) {
    if(!val || !ranges) return;

    var result = false;
    for(var i = 0; i < ranges.length; i++) {
      if(isValueInRange(val, ranges[i]))
        result = true;
    }
    return result;
  };

  var isRangeOverlappingRange = function(range1, range2) {
    if(!range1 || !range2) return;

    if(isValueInRange(range1.min, range2) || isValueInRange(range1.max, range2) || isValueInRange(range2.min, range1) || isValueInRange(range2.max, range1))
      return true;
  };

  var isRangeOverlappingRanges = function(range1, ranges) {
    if(!range1 || !ranges) return;

    var result = false;
    for(var i = 0; i < ranges.length; i++) {
      if(isRangeOverlappingRange(range1, ranges[i]))
        result = true;
    }
    return result;
  };

  // method that returns an Object builder, which could be used to build all "random" game objects like trees...
  function ObjectBuilder(options) {
    if(options == undefined) return;

    this.constructor = options.constructor;
    this.isInitialyMirrored = options.isInitialyMirrored;
    this.xSpeed = options.xSpeed;
    this.ySpeed = options.ySpeed;
    this.singleDirection = options.singleDirection;
    this.board = $(options.boardId);
    this.onCollision = options.onCollision;
    this.onAnimation = options.onAnimation;
    this.buildObjects = function(max, recoveringAllowed) {
      var objNb = Math.floor((Math.random() * max) + 1);
      var forbiddenXRanges = [];
      var forbiddenYRanges = [];
      var objWidth, objHeight;
      var objList = [];

      for(var i = 0; i < objNb; i++) {
        var objElm = this.constructor();
        var xy;
        var computedDirection = 'right';
        if(this.singleDirection !== true)
          computedDirection = Math.round(Math.random()) ? 'left' : 'right';

        if(recoveringAllowed == true) {
          xy = randomCoordinates();
          objElm.setAttribute("transform", "translate(" + xy.x + ", " + xy.y + ")");

          this.board[0].appendChild(objElm); //Append path to svg element
          objWidth = objElm.getBBox().width;
          objHeight = objElm.getBBox().height;
        } else {
          if(forbiddenXRanges.length == 0 && forbiddenYRanges.length == 0) {
            xy = randomCoordinates();
            objElm.setAttribute("transform", "translate(" + xy.x + ", " + xy.y + ")");

            this.board[0].appendChild(objElm); //Append path to svg element

            objWidth = objElm.getBBox().width;
            objHeight = objElm.getBBox().height;

            forbiddenXRanges.push({min: xy.x, max: xy.x + objWidth});
            forbiddenYRanges.push({min: xy.y, max: xy.y + objHeight});
          } else {
            xy = randomCoordinates();
            var overlappingCheckLoopIteration = 0;
            while(
              overlappingCheckLoopIteration <= 1000
              && isRangeOverlappingRanges({min: xy.x, max: xy.x + objWidth}, forbiddenXRanges)
              && isRangeOverlappingRanges({min: xy.y, max: xy.y + objHeight}, forbiddenYRanges)
            ) {
              xy = randomCoordinates();
              overlappingCheckLoopIteration++;
            }

            // we limit to 1000 iterations to avoid game freeze
            if(overlappingCheckLoopIteration >= 1000) {
              recoveringAllowed = true;
            }

            objElm.setAttribute("transform", "translate(" + xy.x + ", " + xy.y + ")");
            forbiddenXRanges.push({min: xy.x, max: xy.x + objWidth});
            forbiddenYRanges.push({min: xy.y, max: xy.y + objHeight});

            this.board[0].appendChild(objElm); //Append path to svg element
          }
        }

        function moveObject() {
          if(isNaN(this.xSpeed) || isNaN(this.ySpeed)) return;

          var objScale = '';

          // translate object to the other side of the game board to avoid loosing all objects
          if ((this.x + (this.width ? this.width : 0)) < 0) {
            this.x = board.width;
          } else if (this.x > board.width) {
            this.x = - (this.width ? this.width : 0);
          }

          // calculate new coordinates
          if(this.computedDirection == 'left') {
            this.x = this.x - (this.xSpeed / envFriction);
            this.y = this.y - (this.ySpeed / envFriction);
          } else {
            this.x = this.x + (this.xSpeed / envFriction);
            this.y = this.y + (this.ySpeed / envFriction);
          }

          if(this.computedDirection == 'left')
            $(this.element).attr("transform", "translate(" + (this.x + this.width) + ", " + this.y + ") scale(-1, 1)");
          else
            $(this.element).attr("transform", "translate(" + this.x + ", " + this.y + ")");
        }

        objList.push({
          id: newObjectId(),
          element: objElm,
          x: xy.x,
          y: xy.y,
          xSpeed: this.xSpeed,
          ySpeed: this.ySpeed,
          board: this.board,
          width: objWidth,
          height: objHeight,
          computedDirection: computedDirection,
          move: moveObject,
          onCollision: this.onCollision,
          onAnimation: this.onAnimation
        });
      }

      return objList;
    }.bind(this);
  }



  /* ------------- *\
     EVENT HANDLER
  \* ------------- */

  window.addEventListener("keydown", onKeyDown, false);
  window.addEventListener("keyup", onKeyUp, false);

  function onKeyDown(event) {
    switch (event.keyCode) {
      case 27: // escape key
        if(playing === true) {
          stopGame(false);
        } else {
          startGame();
        }
        break;
      case 37: // left arrow
        keyLeft = true;
        break;
      case 39: // right arrow
        keyRight = true;
        break;
    }
    if(playing === true && worker) {
      worker.postMessage({
        command: 'keydown',
        game: formatGameVariables()
      });
    }
  }

  function onKeyUp(event) {
    switch (event.keyCode) {
      case 37: // left arrow
        keyLeft = false;
        break;
      case 39: // right arrow
        keyRight = false;
        break;
    }
    if(playing === true && worker) {
      worker.postMessage({
        command: 'keyup',
        game: formatGameVariables()
      });
    }
  }



  /* ---------- *\
     START GAME
  \* ---------- */

  initGame();

});
