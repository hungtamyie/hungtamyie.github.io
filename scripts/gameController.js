var keys = {
    "w": false,
    "a": false,
    "s": false,
    "d": false,
    "i": false,
    "j": false,
    "k": false,
    "l": false,
}

var changeKeyState = function(key, state){
    if(key == "w"){
        keys.w = state;
        if(state == true){
            game.jumpers.jumper0.jump();
        }
        else {
            game.jumpers.jumper0.holdingJump = false;
        }
    }
    
    if(key == "a"){
        keys.a = state;
    }
    
    if(key == "s"){
        keys.s = state;
        if(state == true){
            game.jumpers.jumper0.boosting = true;
            game.jumpers.jumper0.flip();
        }
        else {
            game.jumpers.jumper0.boosting = false;
        }
    }
    
    if(key == "d"){
        keys.d = state;
    }
    
    if(key == "i"){
        keys.i = state;
        if(state == true){
            game.jumpers.jumper1.jump();
        }
        else {
            game.jumpers.jumper1.holdingJump = false;
        }
    }
    
    if(key == "j"){
        keys.j = state;
    }
    
    if(key == "k"){
        keys.k = state;
        if(state == true){
            game.jumpers.jumper1.boosting = true;
            game.jumpers.jumper1.flip();
        }
        else {
            game.jumpers.jumper1.boosting = false;
        }
    }
    
    if(key == "l"){
        keys.l = state;
    }
    
    if(key == " "){
        if(state == true){
            game.spacebarClicked();
        }
    }
}

function activateGameController(){
    
    document.onkeydown = function(e){
        if (e.repeat) { return }
        changeKeyState(e.key.toLowerCase(), true);
        
        if (event.which == 16) {
            if (event.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT){
              game.spawnBall("left");
            } else if (event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT){
              game.spawnBall("right");
            }
          }
    }
    
    document.onkeyup = function(e){
        changeKeyState(e.key.toLowerCase(), false);
    }
    
    document.onmousemove = function(e){
        game.mousePos = getMousePos(canvas, e);
    }
    
    document.onmousedown = function(e){
        game.mouseClicked()
    }
}

function deactivateGameController(){
    
    document.onkeydown = function(e){
    }
    
    document.onkeyup = function(e){
    }
    
    document.onmousemove = function(e){
    }
    
    document.onmousedown = function(e){
    }
}

function checkControllerUpdates(){
    if(keys.w == true){
        game.jumpers.jumper0.holdingUp = true;
    }
    else {
        game.jumpers.jumper0.holdingUp = false;
    }
    if(keys.s == true){
        game.jumpers.jumper0.holdingDown = true;
    }
    else {
        game.jumpers.jumper0.holdingDown = false;
    }
    
    if(keys.a == true && keys.d == false){
        game.jumpers.jumper0.isGoing = "left";
    }
    if(keys.d == true && keys.a == false){
        game.jumpers.jumper0.isGoing = "right";
    }
    if(keys.d == false && keys.a == false){
        game.jumpers.jumper0.isGoing = "none";
    }
    
    if(keys.i == true){
        game.jumpers.jumper1.holdingUp = true;
    }
    else {
        game.jumpers.jumper1.holdingUp = false;
    }
    if(keys.k == true){
        game.jumpers.jumper1.holdingDown = true;
    }
    else {
        game.jumpers.jumper1.holdingDown = false;
    }
    
    if(keys.j == true && keys.l == false){
        game.jumpers.jumper1.isGoing = "left";
    }
    if(keys.l == true && keys.j == false){
        game.jumpers.jumper1.isGoing = "right";
    }
    if(keys.j == false && keys.l == false){
        game.jumpers.jumper1.isGoing = "none";
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}