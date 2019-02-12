class Jumper{
    constructor(x, y, imageName, colorName){
        this.pos = {x: x, y: y};
        this.lpos = this.pos;
        this.vel = new Vector(0, 0);
        this.angle = 0;
        this.radius = 6.5;
        this.mass = 3;
        this.imageName = imageName;
        this.hasControls = true;
        this.name = colorName;
        
        this.facing = "right";
        this.isGoing = "none";
        this.holdingJump = false;
        this.holdingUp = false;
        this.hasSecondJump = false;
        this.hasFlip = false;
        this.jumpHoldTimer = 0;
        this.touchingGround = false;
        this.boosting = false;
        this.flipping = false;
        this.flipTimer = 0;
        this.collisionCooldown = 0;
        this.flying = false;
        this.flightFrame = 0;
        this.frameDelay = 0;
        this.fuel = 15;
        this.hasUsedFuelTimer = 0;
        
        this.boostSound = new Audio('./audio/boost.mp3');
        this.boostSound.preload = "auto";
        this.flapSound = new Audio('./audio/flap.wav');
        this.flapSound.preload = "auto";
        this.jumpSound = new Audio('./audio/jump.wav');
        this.jumpSound.preload = "auto";
        this.flashSound = new Audio('./audio/flash.wav');
        this.flashSound.preload = "auto";
        
        this.memory = {};
        this.DRAW_SIZE = 29;
        this.MOVEMENT_ACCELERATION = .13;
        this.TERM_VEL = 0.35;
        this.BOOST_POWER = 0.18;
        this.JUMP_POWER = 0.54;
        this.JUMP_HOLD_TIME = 38;
        this.ENTITY_ELASTICITY = 1.1;
        this.HORIZONTAL_HITBOX_RADIUS = 6;
        this.CENTER_WALL_HEIGHT_OFFSET = -9;
        this.DRAW_OFFSET_Y = 1.5;
        this.BOOST_LENGTH = 100;
        this.FLIP_POWER = 0.4;
        this.FLIP_TIME = 30;
        this.FLIGHT_POWER_HORIZONTAL = 0.08;
        this.FLIGHT_POWER_UP = 0.03;
        this.TERM_VEL_VERTICAL = .5;
        this.FRAME_RATE_FLIGHT = 45;
        this.FLYING_FUEL_RATE = 0.6;
        this.BOOSTING_FUEL_RATE = 0.45;
        this.FLIP_FUEL_RATE = 15;
        this.REFUEL_DELAY = 100;
        this.REFUEL_RATE = 0.094;
    }
    
    updateStats(gameStats, boostUsed, flightTime){
        if(this.boosting && this.touchingGround && this.fuel > 0 && game.canMove){
            gameStats[boostUsed] += this.BOOSTING_FUEL_RATE;
        }
        
        if(this.flying){
            if(this.holdingUp == true && this.fuel > 0){
                gameStats[boostUsed] += this.FLYING_FUEL_RATE;
            }
        }
        
        if(!this.touchingGround){
            gameStats[flightTime]++;
        }
    }
    
    updatePos(){
        this.lpos = {x: this.pos.x, y: this.pos.y};
        if(this.boosting && this.touchingGround && this.fuel > 0 && game.canMove){
            if(this.isGoing == "right"){
                this.vel.x += this.BOOST_POWER;
                this.fuel -= this.BOOSTING_FUEL_RATE * fpsCoefficient;
                this.hasUsedFuelTimer = this.REFUEL_DELAY;
            }
            else if(this.isGoing == "left"){
                this.vel.x -= this.BOOST_POWER;
                this.fuel -= this.BOOSTING_FUEL_RATE * fpsCoefficient;
                this.hasUsedFuelTimer = this.REFUEL_DELAY;
            }
        }
        
        if(this.fuel < 0){
            this.fuel = 0;
        }
        if(this.fuel > 100){
            this.fuel = 100;
        }
        
        this.hasUsedFuelTimer -= 1 * fpsCoefficient;
        if(this.hasUsedFuelTimer < 0 && game.canMove){
            this.fuel += this.REFUEL_RATE * fpsCoefficient;
        }
    
        if(this.flying){
            if(this.holdingUp == true && this.fuel > 0){
                this.vel.y -= this.FLIGHT_POWER_UP * fpsCoefficient;
                this.fuel -= this.FLYING_FUEL_RATE * fpsCoefficient;
                this.hasUsedFuelTimer = this.REFUEL_DELAY;
                if(this.vel.y < -1){
                    this.vel.y += ((Math.abs(this.vel.y) - this.TERM_VEL_VERTICAL)/5);
                }
            }
            if(this.isGoing == "right"){
                this.vel.x += this.FLIGHT_POWER_HORIZONTAL;
            }
            else if(this.isGoing == "left"){
                this.vel.x -= this.FLIGHT_POWER_HORIZONTAL;
            }
        }
        
        let vertVel = this.vel.y * fpsCoefficient + GRAVITY * fpsCoefficient;
        if(this.pos.y + vertVel + this.radius> floorY){
            if(vertVel > 0.2){
                vertVel /= 2;
                if(vertVel > 1){
                    vertVel = 1;
                }
                if(soundSetting == "on"){
                    jumperLandSound.volume = vertVel;
                    jumperLandSound.currentTime = 0.09;
                    jumperLandSound.play();
                }
            }
        }
        
        this.pos.x += this.vel.x * fpsCoefficient;
        this.pos.y += this.vel.y * fpsCoefficient;
        this.vel.y += GRAVITY * fpsCoefficient;
        
        if(this.pos.y + this.radius + this.vel.y > floorY){
            this.touchingGround = true;
            this.flying = false;
            this.hasFlip = true;
            this.flipping = false;
            this.hasSecondJump = true;
        }
        else {
            this.touchingGround = false;
        }
        this.collideWithWalls();
        this.changeXPos();
        
        if(this.flipping == true){
            this.vel.x += (Math.sqrt(Math.abs(this.FLIP_POWER * Math.abs(this.flipTimer)/this.FLIP_TIME))) * Math.abs(this.flipTimer)/this.flipTimer;
            this.flipTimer -= Math.sign(this.flipTimer) * fpsCoefficient;
            this.vel.y *= .5;
            if(Math.abs(this.flipTimer) <= 3 && Math.abs(this.flipTimer) >= -3){
                this.flipping = false;
            }
        }
        
        if(this.holdingJump){
            this.vel.y -= (GRAVITY+0.01)*(Math.pow(this.jumpHoldTimer/this.JUMP_HOLD_TIME, .5))*fpsCoefficient;
            this.jumpHoldTimer -= fpsCoefficient;
            if(this.jumpHoldTimer <= 0){
                this.holdingJump = false;
            }
        }
        
        this.collisionCooldown--;
        
        applyTerminalVelocityX(this);
    }
    
    keepSoundsInMemory(){
        if(!this.flipping && soundSetting == "on"){
            this.flashSound.play();
            this.flashSound.volume = 0;
        }
    }
    
    collided(x, y, force){
        if(soundSetting == "on"){
            let volume = force/4;
            if(volume > 1){
                volume = 1;
            }
            jumperHitSound.currentTime = 0;
            jumperHitSound.volume = volume;
            jumperHitSound.play();
        }
        if(y == this.pos.y){
            this.touchingGround = true;
        }
    }
    
    flip(){
        if(!this.touchingGround && this.hasFlip && game.canMove){
            if(this.isGoing == "right"){
                this.facing = "right";
                this.flipping = true;
                this.flipTimer = this.FLIP_TIME;
                this.hasFlip = false;
                playFlashSound(this);
            }
            else if(this.isGoing == "left"){
                this.facing = "left";
                this.flipping = true;
                this.flipTimer = -this.FLIP_TIME;
                this.hasFlip = false;
                playFlashSound(this);
            }
        }
        
        function playFlashSound(self){
            if(soundSetting == "on"){
                self.flashSound.currentTime = 0;
                self.flashSound.volume = 0.3;
                self.flashSound.play();
            }
        }
    }
    
    changeXPos(){
        if(this.isGoing == "right" && game.canMove){
            this.facing = "right";
            this.vel.x += this.MOVEMENT_ACCELERATION;   
        }
        else if(this.isGoing == "left" && game.canMove){
            this.facing = "left";
            this.vel.x -= this.MOVEMENT_ACCELERATION;
        }
        else if(this.touchingGround){
            this.vel.x *= 0.9;
        }
    }
    
    collideWithWalls(){
        if(this.pos.y + this.radius > floorY){
            this.pos.y = floorY - this.radius;
            this.vel.y = 0;
        }
        if(this.pos.x - this.HORIZONTAL_HITBOX_RADIUS < wallLeft){
            this.pos.x = wallLeft + this.HORIZONTAL_HITBOX_RADIUS;
            this.vel.x = 0.001;
        }
        if(this.pos.x + this.HORIZONTAL_HITBOX_RADIUS > wallRight){
            this.pos.x = wallRight - this.HORIZONTAL_HITBOX_RADIUS;
            this.vel.x = -0.001;
        }
        
        if(this.pos.x > centerWallLeft - this.HORIZONTAL_HITBOX_RADIUS && this.pos.x < centerWallRight + this.HORIZONTAL_HITBOX_RADIUS && this.lpos.y <= centerWallHeight + this.CENTER_WALL_HEIGHT_OFFSET && this.pos.y > centerWallHeight + this.CENTER_WALL_HEIGHT_OFFSET){
            this.pos.y = centerWallHeight + this.CENTER_WALL_HEIGHT_OFFSET;
            this.vel.y = 0;
            //this.pos.x -= (this.pos.x - 160)/15;
        }
        else if(this.pos.y > centerWallHeight + this.CENTER_WALL_HEIGHT_OFFSET){
            if(this.lpos.x + this.HORIZONTAL_HITBOX_RADIUS <= centerWallLeft && this.pos.x + this.HORIZONTAL_HITBOX_RADIUS > centerWallLeft){
                this.pos.x = centerWallLeft - this.HORIZONTAL_HITBOX_RADIUS;
                this.vel.x = 0;
            }
            if(this.lpos.x - this.HORIZONTAL_HITBOX_RADIUS >= centerWallRight && this.pos.x - this.HORIZONTAL_HITBOX_RADIUS < centerWallRight){
                this.pos.x = centerWallRight + this.HORIZONTAL_HITBOX_RADIUS;
                this.vel.x = 0;
            }
        }
        
        if(this.pos.y > centerWallHeight + this.CENTER_WALL_HEIGHT_OFFSET && this.pos.x + this.HORIZONTAL_HITBOX_RADIUS > centerWallLeft && this.pos.x + this.HORIZONTAL_HITBOX_RADIUS < centerWallRight){
            this.pos.x = centerWallLeft - this.HORIZONTAL_HITBOX_RADIUS;
            this.vel.x = 0;
        }
        if(this.pos.y > centerWallHeight + this.CENTER_WALL_HEIGHT_OFFSET && this.pos.x - this.HORIZONTAL_HITBOX_RADIUS < centerWallRight && this.pos.x - this.HORIZONTAL_HITBOX_RADIUS > centerWallLeft){
            this.pos.x = centerWallRight + this.HORIZONTAL_HITBOX_RADIUS;
            this.vel.x = 0;
        }
        
    }
    
    jump(){
        if(game.canMove){
            if(!this.touchingGround) {
                if(this.hasSecondJump){
                    this.hasSecondJump = false;
                }
                else{
                    if(this.flying == false && soundSetting == "on"){
                        this.flapSound.volume = 1;
                        this.flapSound.currentTime = 0.1;
                        this.flapSound.play();
                    }
                    this.flying = true;
                    return;
                }    
            }
            
            this.vel.y = -this.JUMP_POWER;
            this.jumpHoldTimer = this.JUMP_HOLD_TIME;
            this.holdingJump = true;
            
            if(soundSetting == "on"){
                this.jumpSound.currentTime = 0;
                this.jumpSound.volume = 0.2;
                this.jumpSound.play();
            }
            
            for(var i = 0; i < 10; i++){
                createSmokeParticle(this.pos.x - 2.5, this.pos.y - 0.5, {x: 0, y: -0.01 * (i/10)})
            }    
        }
    }
    
    getFrame(){
        this.frameDelay -= fpsCoefficient;
        if(this.frameDelay <= 0){
            this.flightFrame += 1;
            if(this.flightFrame > 2){
                if(this.flying && soundSetting == "on"){
                    this.flapSound.volume = 0.4;
                    this.flapSound.currentTime = 0;
                    this.flapSound.play();
                }
                this.flightFrame = 0;
            }
            this.frameDelay = this.FRAME_RATE_FLIGHT
        }
        else{
            this.frameDelay--;
        }
        
        if(this.flipping){
            this.flightFrame = 4;
        }
        
        if(this.flying || this.flipping){
            return this.flightFrame + 1;
        }
        else {
            return 0;
        }
    }
    
    draw(){
        let frame = this.getFrame();
        let leftOrRight = ((this.facing == "right") ? 0 : 1);
        let jumperImage = Images.jumperImage;
        let imageSize = 160;
        ctx.drawImage(Images[this.imageName], 
            
            //Source Coordinates
            frame * imageSize,
            leftOrRight * imageSize, 
            imageSize,
            imageSize,
            
            //Draw Coordinates
            (this.pos.x - this.DRAW_SIZE/2) * S,  
            (this.pos.y - this.DRAW_SIZE/2 - this.DRAW_OFFSET_Y) * S, 
            this.DRAW_SIZE * S,
            this.DRAW_SIZE * S
            
        )
    }
}