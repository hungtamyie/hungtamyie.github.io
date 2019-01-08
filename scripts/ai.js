let AIStorage = {}

const CONSTANTS = {
    WALL_HEIGHT: 116,
    GRAVITY: 0.01,
}

AIStorage.you = function(myJumper, enemyJumper, ball, controlPanel, memory){}

AIStorage.Wheatley = function(myJumper, enemyJumper, ball, controlPanel, memory){
    var behind_ball_leeway = 8
    var DANGER_LENGTH = 30
    var far_behind_danger = 3


    let ball_estimated_touchdown_x = (ball.pos.x + ball.vel.x * (ball.pos.y)/1.8);

    let myJumper_optimal_location = ball_estimated_touchdown_x - behind_ball_leeway;


    if(myJumper.pos.x < (myJumper_optimal_location)){
        controlPanel.holdKey("right"); 
        controlPanel.releaseKey("left");
    }
    else if(myJumper.pos.x > myJumper_optimal_location + behind_ball_leeway){
        controlPanel.holdKey("left"); 
        controlPanel.releaseKey("right");
    }

    if(ball.pos.y < 25){
        controlPanel.holdKey("right"); 
        controlPanel.tapKey("up");
    }

    if(Math.abs(ball_estimated_touchdown_x - far_behind_danger) > far_behind_danger){
       controlPanel.tapKey("down"); 
    }

}

AIStorage.Eli = function(myJumper, enemyJumper, ball, controlPanel, memory){
    //Calculate where the ball is probably gonna hit the ground
    let ballIntercept = (ball.pos.x + ball.vel.x * (ball.pos.y)/1.5);
    
    if(ballIntercept > 160){
        ballIntercept = 160 - (ballIntercept - 160);
    }
    if(ballIntercept < 0){
        ballIntercept = -ballIntercept;
    }
    ballIntercept -= 4;
    
    if(ball.pos.x < 180){
        if(ball.pos.y < 55){
            if(Math.abs(ball.pos.x - myJumper.pos.x + (ball.vel.x * 10)) > 2){
                if(ball.pos.x - 4 + (ball.vel.x * 10) < myJumper.pos.x){
                    controlPanel.holdKey("left"); 
                    controlPanel.releaseKey("right"); 
                }
                else {
                    controlPanel.holdKey("right"); 
                    controlPanel.releaseKey("left");
                }
            }
            else {
                controlPanel.releaseKey("right");
                controlPanel.releaseKey("left");
            }
        }
        else {
            if(Math.abs(ballIntercept - myJumper.pos.x - 4) > 2){
                if(ballIntercept < myJumper.pos.x){
                    controlPanel.holdKey("left"); 
                    controlPanel.releaseKey("right"); 
                }
                else {
                    controlPanel.holdKey("right"); 
                    controlPanel.releaseKey("left");
                }
            }
            else {
                controlPanel.releaseKey("right");
                controlPanel.releaseKey("left");
            }
        }
            
        if((Math.abs(ballIntercept - myJumper.pos.x) > 10 && ball.vel.y < 0) && myJumper.touchingGround){
            controlPanel.holdKey("down");
        }
        else {
            controlPanel.releaseKey("down");
        }
        
        if(controlPanel.getKeyData().up == true && myJumper.touchingGround){
            controlPanel.releaseKey("up");
        }
        
        if(controlPanel.getKeyData().up == true && (ball.vel.y < -0.5 && !(Math.abs(ball.vel.x) < 0.3))){
            controlPanel.releaseKey("up");
        }
        
        if((Math.abs(ball.pos.x - 4 - myJumper.pos.x) < 6 && ball.pos.y < 60 && ball.vel.y < 0) || (Math.abs(ball.pos.x - myJumper.pos.x) < 16 && ball.pos.y < 25) || (Math.abs(ball.vel.x) < 0.3 && ball.pos.y < 120 && ball.vel.y < -0.5)){
            if(controlPanel.getKeyData().up == false && myJumper.touchingGround == true){
                controlPanel.holdKey("up");
            }
            else if (ball.pos.y < 120 && myJumper.pos.y > 20 && myJumper.hasSecondJump){
                controlPanel.holdKey("up");
            }
        }
        if(!myJumper.touchingGround && myJumper.pos.x < ball.pos.x - 5 && Math.abs(myJumper.pos.y - ball.pos.y) < 10){
            controlPanel.holdKey("right");
            controlPanel.tapKey("down");
        }
    }
    else if(Math.abs(myJumper.pos.x-80) > 20){
        if(myJumper.pos.x > 80){
            controlPanel.holdKey("left"); 
            controlPanel.releaseKey("right"); 
        }
        else {
            controlPanel.holdKey("right"); 
            controlPanel.releaseKey("left");
        }
    }
}

AIStorage.Blaze = function(myJumper, enemyJumper, ball, controlPanel, memory){
    
    //DECIDE ON A STATE
    var state = "none";
    var directionToGo = "none";
    var shouldBoost = false;
    var ballCollisionGuess = ball.pos.x + (ball.vel.x * (ball.pos.y * -ball.vel.y));
    var distanceFromBall = Math.sqrt(Math.pow(ball.pos.x - myJumper.pos.x, 2) + Math.pow(ball.pos.y - myJumper.pos.y, 2));
    
    if(ballCollisionGuess > 160){
        ballCollisionGuess = 160-(ballCollisionGuess-160);
    }
    if(ballCollisionGuess < 0){
        ballCollisionGuess = -ballCollisionGuess;
    }
    
    if(ball.pos.x < 160){
        if(Math.abs(ball.vel.x) < 0.21 && ball.pos.y > 70){
            state = "tapOver";
        }
        else if(Math.abs(ball.vel.x) < 0.12 && ball.vel.y < -0.2 && ball.pos.x < 140){
            state = "tapHigher";
        }
        else if(distanceFromBall < 35){
            state = "controlBall";
        }
        else {
            state = "catchBall";
        }
        
        if(myJumper.pos.y > 25){
            state = "tappingOver";
        }
    }
    else {
        state = "idle";
    }
    
    //DECIDE ON ACTION
    
    if(state == "controlBall"){
        let targetSpeed = 0;
        if(ball.pos.x < 75){
            targetSpeed = -0.1;
        }
        else if(ball.pos.x > 85) {
            targetSpeed = 0.1;
        }
        else {
            targetSpeed = 0;
        }
        let targetPos = ball.pos.x + (ball.vel.x * 13)
        if(myJumper.pos.x < targetPos - 2){
            directionToGo = "right";
            if(myJumper.pos.x < targetPos - 4){
                shouldBoost = true;
            }
            else {
                shouldBoost = false;
            }
        }
        else if(myJumper.pos.x > targetPos + 2){
            directionToGo = "left";
            if(myJumper.pos.x > targetPos + 4){
                shouldBoost = true;
            }
            else {
                shouldBoost = false;
            }
        }
        else {
            directionToGo = "none";
            shouldBoost = false;
        }
        
        if(Math.abs(ball.vel.x) < 0.1 && Math.abs(ball.vel.y) < 0.2) {
            if(myJumper.touchingGround == true){
                directionToGo = "none";
                controlPanel.tapKey("up");
            }
        }
    }
    
    if(state == "tapOver"){
        console.log("gogo")
        if(myJumper.pos.x < ball.pos.x - 2 - 20){
            directionToGo = "right";
        }
        else if(myJumper.pos.x > ball.pos.x + 2 - 20){
            directionToGo = "left";
        }
        else {
            directionToGo = "none";
            if(myJumper.touchingGround == true && myJumper.pos.x > 15 && ball.vel.y > -0.1){
                controlPanel.holdKey("up");
            }
        }
    }
    
    if(state == "tapHigher"){
        if(myJumper.pos.x < ball.pos.x + (ball.vel.x * 13) - 2){
            directionToGo = "right";
        }
        else if(myJumper.pos.x > ball.pos.x + (ball.vel.x * 13) + 2){
            directionToGo = "left";
        }
        else {
            directionToGo = "none";
        }
        
        /*if(ball.pos.y < 28 && myJumper.pos.x < ball.pos.x - 5){
            directionToGo = "right";
            shouldBoost = true;
        }
        else if(ball.pos.y < 28){
            directionToGo = "none";
        }
        if(ball.pos.y < 23) {
            if(myJumper.touchingGround){
                directionToGo = "none";
                controlPanel.holdKey("up");
            }
        }
        */
        
        if(ball.pos.y < 40 && myJumper.touchingGround == true){
            directionToGo = "none";
            controlPanel.holdKey("up");
        }
    }
    
    if(state =="tappingOver"){
        if(myJumper.pos.x < ball.pos.x - 2 - 20){
            directionToGo = "right";
        }
        else if(myJumper.pos.x > ball.pos.x + 2 - 20){
            directionToGo = "left";
        }
        else {
            directionToGo = "none";
        }
        if(myJumper.pos.y < ball.pos.y - 5){
            if(distanceFromBall > 30 && myJumper.hasSecondJump && myJumper.pos.y > 20){
                controlPanel.holdKey("up");
            }
        }
        
        let ballTarget = ball.pos.y - 7;
        ballTarget += (ball.pos.y - 90)/10;
        ballTarget += (ball.pos.x)/40;
        if(Math.abs(myJumper.pos.y - (ballTarget)) < 3){
            directionToGo = "right";
            controlPanel.releaseKey("left");
            controlPanel.holdKey("right");
            controlPanel.tapKey("down");
        }
        
        if(myJumper.touchingGround){
            controlPanel.releaseKey("up")
        }
    }
    
    if(state == "catchBall"){
        let threshold = 3;
        let targetX = (ball.pos.x + ballCollisionGuess)/2
        if(myJumper.pos.x < targetX - threshold){
            directionToGo = "right";
        }
        else if(myJumper.pos.x > targetX + threshold) {
            directionToGo = "left";
        }
        else {
            directionToGo = "none";
        }
        
        let threat = (100-ball.pos.y) * Math.abs(targetX - ball.pos.x);
        if(threat > 300){
            shouldBoost = true;
        }
    }
    if(state == "idle"){
        let threshold = 3;
        if(myJumper.pos.x < 80 - threshold){
            directionToGo = "right";
        }
        else if(myJumper.pos.x > 80 + threshold) {
            directionToGo = "left";
        }
        shouldBoost = false;
    }
    
    if(myJumper.pos.x > 140){
        directionToGo = "left";
    }
    
    
    //PERFORM ACTION
    if(shouldBoost && myJumper.touchingGround){
        controlPanel.holdKey("down");
    }
    else {
        controlPanel.releaseKey("down");
    }
    
    if(directionToGo == "left"){
        controlPanel.holdKey("left");
        controlPanel.releaseKey("right");
    }
    else if(directionToGo == "right"){
        controlPanel.holdKey("right");
        controlPanel.releaseKey("left");
    }
    else {
        controlPanel.releaseKey("right");
        controlPanel.releaseKey("left");
    }
}

AIStorage.Janus = function(myJumper, enemyJumper, ball, controlPanel){
    //Calculate landing ball

    let ballVelX = ball.vel.x
    let ballVelY = ball.vel.y
    let xBallPredict = ball.pos.x + Math.floor(ball.vel.x * Math.abs(ball.pos.y / (ball.vel.y * 10)))
    
    if (xBallPredict > 155) {
        xBallPredict = 155 - (xBallPredict - 155)
    }
    else if (xBallPredict < 2) {
        xBallPredict = Math.abs(xBallPredict)
    }
    
    let ballDistance = Math.abs((ball.pos.x - myJumper.pos.x))
    
    //Basic Ground Movement - Friendly Side
    if ((xBallPredict - myJumper.pos.x > 10)){
        controlPanel.releaseKey("left");
        controlPanel.holdKey("right");
    }

    else if ((myJumper.pos.x - xBallPredict > 10)){
        controlPanel.releaseKey("right");
        controlPanel.holdKey("left");
    }

    else if (ball.pos.x <= 160 && ball.pos.y < 150 && ballVelY <= 0 && myJumper.hasSecondJump) {
        controlPanel.releaseKey("down");
        controlPanel.holdKey("up");
        if (ball.pos.y <= myJumper.pos.y) {
            controlPanel.releaseKey("up")
        }
    }
    else {
        controlPanel.holdKey("left")
        controlPanel.releaseKey("right")
        controlPanel.releaseKey("down")
        
        if (myJumper.pos.x < 75) {
            controlPanel.releaseKey("left")
            controlPanel.holdKey("right")
        }
    }
    
    //Boosts
    if ((Math.abs(xBallPredict - myJumper.pos.x > 15)) && xBallPredict < 155) {
        controlPanel.holdKey("down")
    }
    else {
        controlPanel.releaseKey("down")
    }
}

AIStorage.Athena = function(myJumper, enemyJumper, ball, controlPanel){

    var direction_to_go = "none";
    var leave_em_alone = 250
    var home_location = 130
    var ball_behind = -3
    //logic

    if(ball.pos.x + ball_behind < myJumper.pos.x){
        direction_to_go = "left";
    }
    else{
        direction_to_go = "right";
    }

    if(ball.pos.x > leave_em_alone){

        if(myJumper.pos.x > home_location){
            direction_to_go = "left";
        }
        else{
            direction_to_go = "right";
        }

    }
//  keystrokes
    if(direction_to_go == "left"){
        controlPanel.holdKey("left");
        controlPanel.releaseKey("right");
    }
    else if(direction_to_go == "right"){
        controlPanel.holdKey("right");
        controlPanel.releaseKey("left");
    }
    else {
        controlPanel.releaseKey("right");
        controlPanel.releaseKey("left");
    }
    controlPanel.holdKey("up");
}