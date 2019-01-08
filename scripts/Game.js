//The Game is 320 x 180

class Game{
    constructor(isTraining, aiLeft, aiRight){
        this.jumpers = {
            jumper0: new Jumper(80, 150, "jumperBlueImage", "Blue"),
            jumper1: new Jumper(240, 150, "jumperGreenImage", "Red")
        };
        this.ball = new Ball(100, 130);
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.timerState = "paused"
        this.pauseStartTime = Date.now();
        this.sumOfPauseTimes = 0;
        this.startTime = Date.now();
        this.lastTimestamp = Date.now();
        this.currentLoser = "none";
        this.canMove = false;
        this.gameEnded = false;
        this.winner = undefined;
        this.ticksOfGameplay = 0;
        this.mousePos = {x: 0, y: 0};
        this.gameStats = {
            ballTimeOnLeft: 0,
            ballTimeOnRight: 0,
            boostUsedLeft: 0,
            boostUsedRight: 0,
            flightTimeLeft: 0,
            flightTimeRight: 0,
        }
        this.tickLengthArray = [];
        this.canScore = true;
        this.wantsToEscape = false;
        this.state = "rallyStart";
        this.stateStartTime = Date.now();
        
        this.timerChirps = 0;
        
        this.GAME_LENGTH = 180;
        this.RESTART_DELAY_TIME = 3;
        this.killStatus = undefined;
        
        this.aiLeft = aiLeft;
        this.aiRight = aiRight;
        this.isTraining = isTraining;
        if(isTraining){
            this.canScore = false;
            this.GAME_LENGTH = 0;
        }
    }
    
    start(){
        ctx.fillStyle = "white";
        ctx.textAlign = "center"; 
        ctx.font = 20 * S + "px 'Press Start 2P'";
        ctx.fillText("Loading...", 160 * S, 100 * S);
        let self = this;
        window.setTimeout(function(){
            self.pauseStartTime = Date.now();
            self.lastTimestamp = Date.now();
            self.stateStartTime = Date.now();
            self.startTime = new Date();
            self.timerState = "paused";
            self.tick();
        }, 1000)
    }
    
    timerPause(){
        if(this.timerState != "paused"){
            this.timerState = "paused";
            this.pauseStartTime = new Date();
        }
    }
    
    timerUnpause(){
        if(this.timerState != "unpaused"){
            this.timerState = "unpaused";
            let currentTime = new Date();
            this.sumOfPauseTimes += currentTime - this.pauseStartTime;
        }
    }
    
    getMillisecondsPlayed(){
        let currentTime = new Date();
        let millisecondsPassed = currentTime - this.startTime;
        
        let timeCurrentlyPaused = 0;
        if(this.timerState == "paused"){
            let currentTime = new Date();
            timeCurrentlyPaused = currentTime - this.pauseStartTime;
        }
        
        return millisecondsPassed - this.sumOfPauseTimes - timeCurrentlyPaused;
    }
    
    tick(){
        if(this.killStatus == "KILL") return;
        ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
        let lastTickLength = Date.now() - this.lastTimestamp;
        this.tickLengthArray.push(lastTickLength);
        if(this.tickLengthArray.length > 5){
            this.tickLengthArray.splice(0,1);
        }
        
        let timeSum = 0;
        for(let i = 0; i < this.tickLengthArray.length; i++){
            timeSum += this.tickLengthArray[i];
        }
        let timeAverage = timeSum/5;
        let fps = 1000/timeAverage;
        if(fps < 30){
            fps = 30;
        }
        fpsCoefficient = 144/fps;
        
        
        //==============================\\
            drawAndUpdateClouds();
            this.drawDangerWarning();
            this.drawScore();
            this.runAI();
            this.drawAndUpdateEntities();
            drawAndUpdateSmokeParticles();
            this.drawForeground();
            drawAndUpdateDustParticles();
            drawAndUpdateSparks();
            this.checkWin();
            this.updateState();
            this.updateInfiniteBoost();
            
            //Upate Stats
            if(this.timerState == "unpaused" && this.gameEnded == false){
                this.ticksOfGameplay++;
                this.ball.updateStats(this.gameStats);
                this.jumpers.jumper0.updateStats(this.gameStats, "boostUsedLeft", "flightTimeLeft");
                this.jumpers.jumper1.updateStats(this.gameStats, "boostUsedRight", "flightTimeRight");
            }
            
            drawAndUpdateSmokeParticles();
            this.drawUI();
            this.checkGameEnd();
        //==============================\\\
        checkControllerUpdates();
        this.lastTimestamp = Date.now();
        window.requestAnimationFrame(this.tick.bind(this));
    }
    
    runAI(){
        if(this.aiRight){
            //Runs the AI function
            let ballData = {pos: {x: 320 - this.ball.pos.x, y: floorY - this.ball.pos.y}, vel: {x: this.ball.vel.x * -1, y: this.ball.vel.y * -1}, spin: this.ball.spin * -1};
            
            let myJumperData = {
                pos: {x: 320 - this.jumpers.jumper1.pos.x, y: floorY - this.jumpers.jumper1.pos.y}, 
                vel: {x: this.jumpers.jumper1.vel.x * -1, y: this.jumpers.jumper1.vel.y * -1},
                touchingGround: this.jumpers.jumper1.touchingGround, 
                hasSecondJump: this.jumpers.jumper1.hasSecondJump, 
                hasFlip: this.jumpers.jumper1.hasFlip,
                fuel: this.jumpers.jumper1.fuel,
                flying: this.jumpers.jumper1.flying,
                score: this.scoreRight,
            };
            
            let enemyJumperData = {
                pos: {x: 320 - this.jumpers.jumper0.pos.x, y: floorY - this.jumpers.jumper0.pos.y}, 
                vel: {x: this.jumpers.jumper0.vel.x * -1, y: this.jumpers.jumper0.vel.y * -1},
                touchingGround: this.jumpers.jumper0.touchingGround, 
                hasSecondJump: this.jumpers.jumper0.hasSecondJump, 
                hasFlip: this.jumpers.jumper0.hasFlip,
                fuel: this.jumpers.jumper0.fuel,
                flying: this.jumpers.jumper0.flying,
                score: this.scoreLeft,
            };
            
            let myControlPanel = new ControlPanel({up: "i", left: "l", down: "k", right: "j"}, true);
            AIStorage[this.aiRight](myJumperData, enemyJumperData, ballData, myControlPanel, this.jumpers.jumper1.memory);
        }
        if(this.aiLeft){
            //Runs the AI function
            let ballData = {pos: {x: this.ball.pos.x, y: floorY - this.ball.pos.y}, vel: {x: this.ball.vel.x, y: this.ball.vel.y * -1}, spin: this.ball.spin};
            let enemyJumperData = {
                pos: {x: this.jumpers.jumper1.pos.x, y: floorY - this.jumpers.jumper1.pos.y}, 
                vel: {x: this.jumpers.jumper1.vel.x, y: this.jumpers.jumper1.vel.y * -1},
                touchingGround: this.jumpers.jumper1.touchingGround, 
                hasSecondJump: this.jumpers.jumper1.hasSecondJump, 
                hasFlip: this.jumpers.jumper1.hasFlip,
                fuel: this.jumpers.jumper1.fuel,
                flying: this.jumpers.jumper1.flying,
                score: this.scoreRight,
            };
            
            let myJumperData = {
                pos: {x: this.jumpers.jumper0.pos.x, y: floorY - this.jumpers.jumper0.pos.y}, 
                vel: {x: this.jumpers.jumper0.vel.x, y: this.jumpers.jumper0.vel.y * -1},
                touchingGround: this.jumpers.jumper0.touchingGround, 
                hasSecondJump: this.jumpers.jumper0.hasSecondJump, 
                hasFlip: this.jumpers.jumper0.hasFlip,
                fuel: this.jumpers.jumper0.fuel,
                flying: this.jumpers.jumper0.flying,
                score: this.scoreLeft,
            };
            
            let myControlPanel = new ControlPanel({up: "w", left: "a", down: "s", right: "d"}, true);
            AIStorage[this.aiLeft](myJumperData, enemyJumperData, ballData, myControlPanel, this.jumpers.jumper0.memory);
        }
        
        function ControlPanel(bindings, flipped){
            this.flipped = flipped;
            
            this.holdKey = function(key){
                if(key == "up" || key == "left" || key == "right" || key == "down"){
                    changeKeyState(bindings[key], true);
                    checkControllerUpdates();
                }
            }
            
            this.releaseKey = function(key){
                if(key == "up" || key == "left" || key == "right" || key == "down"){
                    changeKeyState(bindings[key], false);
                    checkControllerUpdates();
                }
            }
            
            this.tapKey = function(key){
                this.holdKey(key);
                this.releaseKey(key);
            }
            
            this.getKeyData = function(key){
                return {up: keys[bindings.up], down: keys[bindings.down], left: keys[bindings.left], right: keys[bindings.right]}
            }
        }
    }
    
    drawAndUpdateEntities(){
        this.ball.lpos = {x: this.ball.pos.x, y: this.ball.pos.y}
        
        for(let i = 0; i < Object.size(this.jumpers); i++){
            let jumper = this.jumpers["jumper" + i];
            jumper.lpos = {x: jumper.pos.x, y: jumper.pos.y}
            pushApart(jumper, this.ball)
        }
        
        this.ball.updatePos();
        this.ball.draw();
        this.ball.keepSoundsInMemory();
        
        for(let i = 0; i < Object.size(this.jumpers); i++){
            let jumper = this.jumpers["jumper" + i];
            jumper.updatePos();
            jumper.keepSoundsInMemory();
            
            if(jumper.boosting && jumper.touchingGround && jumper.fuel > 0 && game.canMove){
                let vector = new Vector(0, Math.random()/2);
                if(jumper.isGoing == "right"){
                    jumper.boostSound.muted = "";
                    vector.setDirection(getRandomInt(180, 210) * Math.PI/180);
                    createSmokeParticle(jumper.pos.x - 1, jumper.pos.y + 3.5, vector)
                    jumper.boostSound.volume = 1;
                    if((jumper.boostSound.currentTime == 0 || jumper.boostSound.currentTime > 0.2) && soundSetting == "on"){
                        jumper.boostSound.currentTime = 0;
                        jumper.boostSound.play();
                    }
                }
                else if(jumper.isGoing == "left") {
                    jumper.boostSound.muted = false;
                    vector.setDirection(getRandomInt(-30, 0) * Math.PI/180);
                    createSmokeParticle(jumper.pos.x - 1, jumper.pos.y + 3.5, vector)
                    jumper.boostSound.volume = 1;
                    if((jumper.boostSound.currentTime == 0 || jumper.boostSound.currentTime > 0.2) && soundSetting == "on"){
                        jumper.boostSound.currentTime = 0;
                        jumper.boostSound.play();
                    }
                }
            }
            else {
                jumper.boostSound.muted = "true";
            }
            
            if(checkCollision(this.ball, jumper) == true) resolve(this.ball, jumper);
            jumper.draw();
        }
        
        if(checkCollision(this.jumpers.jumper0, this.jumpers.jumper1) == true){
            resolve(this.jumpers.jumper0, this.jumpers.jumper1);
            pushApart(this.jumpers.jumper0, this.jumpers.jumper1);
        };
        
        bounceOffWalls(this.ball);
    }
    
    checkWin(){
        if(this.ball.hasScored && this.state == "playingRally" && this.canScore){
            this.currentLoser = this.ball.hasScored;
            this.timerPause();
            this.stateStartTime = new Date();
            this.state = "endedRally";
        }
    }
    
    updateState(){
        if(this.state == "rallyStart"){
            let timePassed = this.getTimeSinceLastState();
            if(timePassed > 3000){
                this.state = "playingRally";
                this.canMove = true;
                this.timerUnpause();
            }
        }
        if(this.state == "endedRally"){
            if(this.getTimeSinceLastState()/1000 >= this.RESTART_DELAY_TIME){
                this.restart();
            }
        }
    }
    
    getTimeSinceLastState(){
        let currentTime = new Date();
        return currentTime - this.stateStartTime;
    }
    
    restart(){
        this.state = "rallyStart";
        this.timerChirps = 0;
        this.stateStartTime = new Date();
        this.canMove = false;
        this.jumpers = {
            jumper0: new Jumper(80, 150, "jumperBlueImage", "Blue"),
            jumper1: new Jumper(240, 150, "jumperGreenImage", "Red")
        };
        if(this.currentLoser == "left"){
            this.ball = new Ball(100, 130);
        }
        else {
            this.ball = new Ball(220, 130);
        }
        this.currentLoser = "none";
        
    }
    
    drawUI(){
        let secondsPassed = this.getMillisecondsPlayed()/1000;
        let timeToDisplay = fancyTimeFormat(this.GAME_LENGTH - secondsPassed);
        if(this.GAME_LENGTH - secondsPassed < 0){
            timeToDisplay = "0:00"
        }
        
        ctx.fillStyle = "#c7bf19";
        ctx.textAlign = "center"; 
        if(this.isTraining){
            ctx.font = 3 * S + "px 'Press Start 2P'";
            ctx.fillText("Practice", 161.2 * S, 173 * S);
        }
        else {
            ctx.font = 6 * S + "px 'Press Start 2P'";
            ctx.fillText(timeToDisplay, 161.2 * S, 175 * S);
        }
        
        ctx.fillStyle = "#e45d5d";
        ctx.fillRect(204 * S, 167 * S, (87 * (this.jumpers.jumper1.fuel/100)) * S, 6 * S);
        ctx.fillStyle = "#f1938c";
        ctx.fillRect(204 * S, 168.5 * S, (87 * (this.jumpers.jumper1.fuel/100)) * S, 2 * S);
        
        ctx.fillStyle = "#5d86e4";
        ctx.fillRect(30 * S, 167 * S, (87 * (this.jumpers.jumper0.fuel/100)) * S, 6 * S);
        ctx.fillStyle = "#8cabf1";
        ctx.fillRect(30 * S, 168.5 * S, (87 * (this.jumpers.jumper0.fuel/100)) * S, 2 * S);
        
        if(this.state == "rallyStart"){
            let numToDisplay = -(Math.floor(this.getTimeSinceLastState()/1000)-3);
            
            beepSound.volume = 0.4;
            if(soundSetting == "on"){
                if(this.timerChirps == 0 && numToDisplay == 3){
                    this.timerChirps++;
                    beepSound.currentTime = 0;
                    beepSound.play();
                }
                else if(this.timerChirps == 1 && numToDisplay == 2){
                    this.timerChirps++;
                    beepSound.currentTime = 0;
                    beepSound.play();
                }
                else if(this.timerChirps == 2 && numToDisplay == 1){
                    this.timerChirps++;
                    beepSound.currentTime = 0;
                    beepSound.play();
                }
            }
            
            ctx.textAlign = "center"; 
            ctx.fillStyle = "#1d1c08";
            ctx.font = 30 * S + "px 'Press Start 2P'";
            ctx.fillText(numToDisplay, 160 * S, 90 * S);
            ctx.textAlign = "center"; 
            ctx.fillStyle = "white";
            ctx.font = 30 * S + "px 'Press Start 2P'";
            ctx.fillText(numToDisplay, 162 * S, 88 * S);
        }
        
        if(this.currentLoser == "left" && this.state == "endedRally"){
            ctx.textAlign = "center"; 
            ctx.fillStyle = "white";
            ctx.font = 20 * S + "px 'Press Start 2P'";
            ctx.fillText("Red Scored", 160 * S, 90 * S);
            ctx.fillStyle = "#661c1c";
            ctx.fillText("Red Scored", 162 * S, 88 * S);
        }
        else if(this.currentLoser == "right" && this.state == "endedRally"){
            ctx.textAlign = "center"; 
            ctx.fillStyle = "white";
            ctx.font = 20 * S + "px 'Press Start 2P'";
            ctx.fillText("Blue Scored", 160 * S, 90 * S);
            ctx.fillStyle = "#252561";
            ctx.fillText("Blue Scored", 162 * S, 88 * S);
        }
        
        if(this.state == "endedRally"){
            let factor = 1-(this.getTimeSinceLastState()/1000)/this.RESTART_DELAY_TIME;
            factor -= 0.9;
            factor *= 2;
            if(factor < 0){
                factor = 0;
            }
            if(factor > 1){
                factor = 0;
            }
            
        
            ctx.fillStyle = "rgba(255, 255, 100, " + factor + ")"
            ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        
        if(this.wantsToEscape){
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
            ctx.fillRect(0,0,canvas.width,canvas.height);
            this.drawExitButton();
            ctx.textAlign = "center"; 
            ctx.fillStyle = "#5d4613";
            ctx.font = 30 * S + "px 'Press Start 2P'";
            ctx.fillText("Exit?", 160 * S, 100 * S);
            ctx.textAlign = "center"; 
            ctx.fillStyle = "#e1c394";
            ctx.font = 30 * S + "px 'Press Start 2P'";
            ctx.fillText("Exit?", 162 * S, 98 * S);
        }
    }
    
    drawScore(){
        if(!this.isTraining){
            ctx.fillStyle = "#98e1fc";
            if(this.currentLoser == "right") ctx.fillStyle = "#252561";
            ctx.textAlign = "start"; 
            ctx.font = 20 * S + "px 'Press Start 2P'";
            ctx.fillText(this.scoreLeft, 7 * S, 23 * S);
            
            ctx.fillStyle = "#98e1fc";
            if(this.currentLoser == "left") ctx.fillStyle = "#661c1c";
            ctx.textAlign = "end"; 
            ctx.font = 20 * S + "px 'Press Start 2P'";
            ctx.fillText(this.scoreRight, 315 * S, 23 * S);
        }
    }
    
    drawForeground(){
        if(!this.isTraining){
            let image = Images.foregroundReal;
            ctx.drawImage(image, 0, 0, 1600, 900, 0, 0, 320 * S  , 180 * S);
        }
        else {
            let image = Images.foreground;
            ctx.drawImage(image, 0, 0, 1600, 900, 0, 0, 320 * S  , 180 * S);
        }
    }
    
    checkGameEnd(){
        let secondsPassed = this.getMillisecondsPlayed()/1000;
        if(secondsPassed > this.GAME_LENGTH && this.scoreLeft != this.scoreRight && !this.gameEnded){
            if(soundSetting == "on"){
                gameWinSound.currentTime = 0;
                gameWinSound.play();
            }
            this.gameEnded = true;
            this.canScore = false;
            if(this.scoreLeft > this.scoreRight){
                this.winner = this.jumpers.jumper0;
            }
            else {
                this.winner = this.jumpers.jumper1;
            }
            this.timerPause();
            this.gameStats.ballTimeOnLeft = fancyTimeFormat((this.gameStats.ballTimeOnLeft / this.ticksOfGameplay) * secondsPassed);
            this.gameStats.ballTimeOnRight = fancyTimeFormat((this.gameStats.ballTimeOnRight / this.ticksOfGameplay) * secondsPassed);
            
            this.gameStats.boostUsedLeft = Math.floor(this.gameStats.boostUsedLeft);
            this.gameStats.boostUsedRight = Math.floor(this.gameStats.boostUsedRight);
            
            this.gameStats.flightTimeLeft = fancyTimeFormat((this.gameStats.flightTimeLeft / this.ticksOfGameplay) * secondsPassed);
            this.gameStats.flightTimeRight = fancyTimeFormat((this.gameStats.flightTimeRight / this.ticksOfGameplay) * secondsPassed);
        }
        
        if(this.gameEnded){
            ctx.drawImage(Images.winScreen, 0, 0, 700, 800, (160 - 140/2) * S, (90 - 160/2) * S, 140 * S, 160 * S);
            this.wantsToEscape = false;
            
            //Draw winner name at top
            ctx.font = 12 * S + "px 'Press Start 2P'";
            ctx.textAlign = "center"; 
            ctx.fillStyle = "white";
            ctx.fillText(this.winner.name + " wins", 159 * S, 33 * S);
            ctx.fillStyle = "#252561"
            if(this.winner.name == "Red") ctx.fillStyle = "#661c1c";
            ctx.fillText(this.winner.name + " wins", 160 * S, 32 * S);
            
            
            //Draw Scores
            ctx.fillStyle = "white";
            ctx.font = 17 * S + "px 'Press Start 2P'";
            ctx.fillText(this.scoreLeft, (160 - 30) * S,  78 * S);
            ctx.fillText(this.scoreRight, (160 + 30) * S,  78 * S);
            
            //Draw Time Playing Defense
            
            ctx.fillStyle = "#e1be21";
            ctx.font = 6 * S + "px 'Press Start 2P'";
            ctx.fillText("Time On Defense",  (160) * S,  104 * S);
            ctx.fillStyle = "white";
            ctx.fillText(this.gameStats.ballTimeOnLeft,  (160 - 30) * S,  115 * S);
            ctx.fillText(this.gameStats.ballTimeOnRight,  (160 + 30) * S,  115 * S);
            
            //Draw Boost Used
            
            ctx.fillStyle = "#e1be21";
            ctx.fillText("Boost Used",  (160) * S,  129 * S);
            ctx.fillStyle = "white";
            ctx.fillText(this.gameStats.boostUsedLeft,  (160 - 30) * S,  140 * S);
            ctx.fillText(this.gameStats.boostUsedRight,  (160 + 30) * S,  140 * S);
            
            //Draw Flight Time
            
            ctx.fillStyle = "#e1be21";
            ctx.fillText("Flight Time",  (160) * S,  152 * S);
            ctx.fillStyle = "white";
            ctx.fillText(this.gameStats.flightTimeLeft,  (160 - 30) * S,  163 * S);
            ctx.fillText(this.gameStats.flightTimeRight,  (160 + 30) * S,  163 * S);
            
            //Draw Exit Button
            
            this.drawExitButton()
        }
    }
    
    drawExitButton(){
        if(!this.checkMouseWithinExitButton()){
            ctx.drawImage(Images.exitButton, 0, 0, 170, 170, (320-36) * S, 2 * S, 32 * S, 32 * S);
            canvas.style.cursor="default";
        }
        else {
            ctx.drawImage(Images.exitButton, 170, 0, 170, 170, (320-36) * S, 2 * S, 32 * S, 32 * S);
            canvas.style.cursor="pointer";
        }
    }
    
    updateInfiniteBoost(){
        if(infiniteBoostSetting == "on" && this.isTraining){
            this.jumpers.jumper0.fuel = 100;
            this.jumpers.jumper1.fuel = 100;
        }
    }
    
    mouseClicked(){
        if(this.checkMouseWithinExitButton() == true && (this.gameEnded || this.wantsToEscape)){
            this.killStatus = "KILL";
            showTitleSceen();
            if(soundSetting == "on"){
            clickSound.currentTime = 0;
            clickSound.play();
            }
        }
        else if(this.wantsToEscape && this.checkMouseWithinExitButton() == false){
            this.wantsToEscape = false;
            if(soundSetting == "on"){
            clickSound.currentTime = 0;
            clickSound.play();
            }
        }
        else {
            if(!this.gameEnded){
                this.wantsToEscape = true;    
                if(soundSetting == "on"){
                clickSound.currentTime = 0;
                clickSound.play();
                }
            }
        }
    }
    
    spawnBall(side){
        if(this.isTraining){
            this.ball.trail = {
                a: [],
                b: [],
                c: [],
                d: [],
                center: [],
            };
            if(side == "left"){
                let random = getRandomInt(0, 4);
                if(random == 0){
                    this.ball.spin = getRandomArbitrary(-0.6,0.6);
                    this.ball.pos.x = getRandomInt(200, 300);
                    this.ball.pos.y = getRandomInt(120, 140);
                    this.ball.vel.x = getRandomArbitrary(-1.1, -0.9);
                    this.ball.vel.y = getRandomArbitrary(-1.5, -0.9);
                }
                if(random == 1){
                    this.ball.spin = getRandomArbitrary(-1,1);
                    this.ball.pos.x = 300;
                    this.ball.pos.y = 10;
                    this.ball.vel.x = getRandomArbitrary(-2.3, -1);
                    this.ball.vel.y = getRandomArbitrary(0.2, 0.6);
                }
                if(random == 2){
                    this.ball.spin = getRandomArbitrary(-2,2);
                    this.ball.pos.x = 80;
                    this.ball.pos.y = 80;
                    this.ball.vel.x = getRandomArbitrary(-0.2, 0.2);
                    this.ball.vel.y = getRandomArbitrary(-2, -0.2);
                }
                if(random == 3){
                    this.ball.spin = getRandomArbitrary(-1.2,1.2);
                    this.ball.pos.x = 300;
                    this.ball.pos.y = getRandomInt(50, 90);
                    this.ball.vel.x = getRandomArbitrary(-2.2, -1);
                    this.ball.vel.y = getRandomArbitrary(-0.1, 0.3);
                }
            }
            else {
                let random = getRandomInt(0, 4);
                if(random == 0){
                    this.ball.spin = getRandomArbitrary(-0.6,0.6);
                    this.ball.pos.x = getRandomInt(320 - 200, 320 - 300);
                    this.ball.pos.y = getRandomInt(120, 140);
                    this.ball.vel.x = getRandomArbitrary(-1.1 * -1, -0.9 * -1);
                    this.ball.vel.y = getRandomArbitrary(-1.5, -0.9);
                }
                if(random == 1){
                    this.ball.spin = getRandomArbitrary(-1,1);
                    this.ball.pos.x = 320 - 300;
                    this.ball.pos.y = 10;
                    this.ball.vel.x = getRandomArbitrary(-2.3 * -1, -1 * -1);
                    this.ball.vel.y = getRandomArbitrary(0.2, 0.6);
                }
                if(random == 2){
                    this.ball.spin = getRandomArbitrary(-2,2);
                    this.ball.pos.x = 320 - 80;
                    this.ball.pos.y = 80;
                    this.ball.vel.x = getRandomArbitrary(-0.2 * -1, 0.2 * -1);
                    this.ball.vel.y = getRandomArbitrary(-2 * -1, -0.2);
                }
                if(random == 3){
                    this.ball.spin = getRandomArbitrary(-1.2,1.2);
                    this.ball.pos.x = 320 - 300;
                    this.ball.pos.y = getRandomInt(50, 90);
                    this.ball.vel.x = getRandomArbitrary(-2.2 * -1, -1 * -1);
                    this.ball.vel.y = getRandomArbitrary(-0.1, 0.3);
                }
            }
        }
    }
    
    spacebarClicked(){
        if(!this.gameEnded){
            if(this.wantsToEscape){
                this.wantsToEscape = false;
                if(soundSetting == "on"){
                clickSound.currentTime = 0;
                clickSound.play();
                }
            }
            else {
                this.wantsToEscape = true;  
                if(soundSetting == "on"){
                clickSound.currentTime = 0;
                clickSound.play();
                }
            }
        }
    }
    
    drawDangerWarning(){
        if(Math.floor(this.getMillisecondsPlayed()/500) % 2 == 0 && this.state == "playingRally"){
            if(this.ball.hasHitSide == "left"){
                ctx.textAlign = "center"; 
                ctx.fillStyle = "#810c0c";
                ctx.font = 10 * S + "px 'Press Start 2P'";
                ctx.fillText("Danger!", 80 * S, 80 * S);
                ctx.fillText(dangerTime-this.ball.getTimeSinceDangerStart(), 80 * S, 95 * S);
            }
            else if(this.ball.hasHitSide == "right"){
                ctx.textAlign = "center"; 
                ctx.fillStyle = "#810c0c";
                ctx.font = 10 * S + "px 'Press Start 2P'";
                ctx.fillText("Danger!", 240 * S, 80 * S);
                ctx.fillText(dangerTime-this.ball.getTimeSinceDangerStart(), 240 * S, 95 * S);
            }
        }
        else if(this.state == "playingRally"){
            if(this.ball.hasHitSide == "left"){
                ctx.textAlign = "center"; 
                ctx.fillStyle = "white";
                ctx.font = 10 * S + "px 'Press Start 2P'";
                ctx.fillText("Danger!", 80 * S, 80 * S);
                ctx.fillText(dangerTime-this.ball.getTimeSinceDangerStart(), 80 * S, 95 * S);
            }
            else if(this.ball.hasHitSide == "right"){
                ctx.textAlign = "center"; 
                ctx.fillStyle = "white";
                ctx.font = 10 * S + "px 'Press Start 2P'";
                ctx.fillText("Danger!", 240 * S, 80 * S);
                ctx.fillText(dangerTime-this.ball.getTimeSinceDangerStart(), 240 * S, 95 * S);
            }
        }
    }
    
    checkMouseWithinExitButton(){
        if(this.mousePos.x > 282 * S && this.mousePos.x < 320 * S && this.mousePos.y > 2 * S && this.mousePos.y < 36 * S){
            return true;
        }
        return false;
    }
}