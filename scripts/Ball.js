class Ball{
    constructor(x, y){
        this.pos = {x: x, y: y};
        this.lpos = this.pos;
        this.vel = new Vector(0, -1.1);
        this.radius = 9.5;
        this.mass = 2;
        this.hasControls = false;
        
        this.angle = 0;
        this.spin = 0;
        this.trail = {
            a: [],
            b: [],
            c: [],
            d: [],
            center: [],
        };
        this.trailCooldown = 14;
        this.hasScored = false;
        this.hasHitSide = "none";
        this.flashTimer = 0;
        this.dangerStart = 0;
        
        this.MAX_TRAIL_COOLDOWN = 8;
        this.TRAIL_LENGTH = 15;
        this.DRAW_SIZE = 23;
        this.VISUAL_SPIN_COEFFICIENT = 7.5;
        this.FLOOR_ELASTICITY = 0.64;
        this.FLOOR_RESISTANCE = 0.9;
        this.WALL_ELASTICITY = 0.9;
        this.WALL_RESISTANCE = 0.96;
        this.ENTITY_ELASTICITY = 1.1;
        this.SPIN_FACTOR = 0.006;
        this.TERM_VEL = 1.5;
        this.FLASH_TIME = 25;
    }
    
    updateStats(gameStats){
        if(this.pos.x < 160 && game.canMove){
            gameStats.ballTimeOnLeft++;
        }
        else if(this.pos.x > 160 && game.canMove) {
            gameStats.ballTimeOnRight++;
        }
    }
    
    updatePos(){
        if(game.canMove){
            this.pos.x += this.vel.x * fpsCoefficient;
            this.pos.y += this.vel.y * fpsCoefficient;
            this.vel.y += GRAVITY * fpsCoefficient;
        }
        
        this.trailCooldown -= fpsCoefficient;
        let trailOffset = new Vector(0, this.radius);
        if(this.trailCooldown <= 0){
            this.trailCooldown = this.MAX_TRAIL_COOLDOWN;
            this.trail.center.push({x: this.pos.x, y: this.pos.y})
            if(this.trail.center.length > this.TRAIL_LENGTH){
                this.trail.center.splice(0,1);
            }
            
            trailOffset.setDirection(0 * Math.PI/180);
            this.trail.a.push({x: this.pos.x + trailOffset.x, y: this.pos.y + trailOffset.y})
            if(this.trail.a.length > this.TRAIL_LENGTH){
                this.trail.a.splice(0,1);
            }
            
            trailOffset.setDirection((90 + this.angle) * Math.PI/180);
            this.trail.b.push({x: this.pos.x + trailOffset.x, y: this.pos.y + trailOffset.y})
            if(this.trail.b.length > this.TRAIL_LENGTH){
                this.trail.b.splice(0,1);
            }
            
            trailOffset.setDirection((180 + this.angle) * Math.PI/180);
            this.trail.c.push({x: this.pos.x + trailOffset.x, y: this.pos.y + trailOffset.y})
            if(this.trail.c.length > this.TRAIL_LENGTH){
                this.trail.c.splice(0,1);
            }
            
            trailOffset.setDirection((270 + this.angle) * Math.PI/180);
            this.trail.d.push({x: this.pos.x + trailOffset.x, y: this.pos.y + trailOffset.y})
            if(this.trail.d.length > this.TRAIL_LENGTH){
                this.trail.d.splice(0,1);
            }
            
            
        }
        
        this.angle += this.spin * this.VISUAL_SPIN_COEFFICIENT * fpsCoefficient;
        let newDir = this.vel.getDirection() + this.spin * this.SPIN_FACTOR * fpsCoefficient;
        this.vel.setDirection(newDir);
        
        if(this.pos.y + this.radius >= floorY){
            if(this.hasScored == false && game.canScore){
                if(this.pos.x < 160){
                    if(this.hasHitSide == "left"){
                        this.hasScored = "left";
                        game.scoreRight += 1;    
                        this.flashTimer = this.FLASH_TIME;
                        if(soundSetting == "on"){
                            scoreSound.currentTime = 0;
                            scoreSound.volume = 0.8;
                            scoreSound.play();
                        }
                    }
                    this.hasHitSide = "left";
                    this.dangerStart = new Date();
                    if(soundSetting == "on"){
                        switchSound.currentTime = 0;
                        switchSound.play();
                    }
                }
                else {
                    if(this.hasHitSide == "right"){
                        this.hasScored = "right";
                        game.scoreLeft += 1;
                        this.flashTimer = this.FLASH_TIME;
                        if(soundSetting == "on"){
                            scoreSound.currentTime = 0;
                            scoreSound.volume = 0.8;
                            scoreSound.play();
                        }
                    }
                    this.hasHitSide = "right";
                    this.dangerStart = new Date();
                    if(soundSetting == "on"){
                        switchSound.currentTime = 0;
                        switchSound.play();
                    }
                }
            }
        }
        
        if(this.hasHitSide != "none" && this.getTimeSinceDangerStart() > dangerTime - 1){
            this.hasHitSide = "none"
        }
        
        if(this.flashTimer > 0){
            this.flashTimer -= 1 * fpsCoefficient;
        }
        
        //Apply term vel
        let currentSpeed = this.vel.magnitude;
        if(currentSpeed > this.TERM_VEL) this.vel.setMagnitude(currentSpeed - (this.TERM_VEL - currentSpeed)/this.TERM_VEL * 0.1); 
        
        while(this.angle > 360){this.angle -= 360;}
        while(this.angle <   0){this.angle += 360;}
    }
    
    keepSoundsInMemory(){
        if(!this.hasScored){
            scoreSound.volume = 0;
            scoreSound.play();
        }
    }
    
    getTimeSinceDangerStart(){
        let currentTime = new Date();
        return Math.floor((currentTime - this.dangerStart)/1000);
    }
    
    collided(x, y, force, collisionWithCenterWall){
        addSparks(x, y, Math.floor(force));
        
        if(x == this.pos.x){
            let volume = force/2;
            if(volume > 1){
                volume = 1;
            }
            
            if(grassHitSound.currentTime > 0.2 || grassHitSound.currentTime == 0 && !isNaN(volume) && soundSetting == "on"){
                grassHitSound.currentTime = 0.09;
                grassHitSound.volume = volume * volume;
                grassHitSound.play();
            }
        }
        
        else if(y == this.pos.y || collisionWithCenterWall){
            let volume = force/7;
            if(volume > 1){
                volume = 1;
            }
            if(!isNaN(volume) && soundSetting == "on"){
                metalHitSound.currentTime = 0.1;
                metalHitSound.volume = volume;
                metalHitSound.play();
            }
        }
    }
    
    draw(){
        //Draw the ball trail
        
        if(this.trail.center.length > 2){
            for(let i = 0; i < this.trail.center.length - 1; i++){
                let ratio = i/this.TRAIL_LENGTH;
                ctx.beginPath();
                ctx.moveTo(this.trail.center[i].x * S, this.trail.center[i].y * S);
                ctx.lineTo(this.trail.center[i + 1].x * S, this.trail.center[i + 1].y * S);
                ctx.lineWidth = 6 * ratio * S;
                ctx.strokeStyle = "rgba(255, 255, 100, " + (0.7 * ratio) + ")"
                ctx.stroke();
            }
            
            for(let i = 0; i < this.trail.a.length - 1; i++){
                let ratio = i/this.TRAIL_LENGTH;
                ctx.beginPath();
                ctx.moveTo(this.trail.a[i].x * S, this.trail.a[i].y * S);
                ctx.lineTo(this.trail.a[i + 1].x * S, this.trail.a[i + 1].y * S);
                ctx.lineWidth = 2 * ratio * S;
                ctx.strokeStyle = "rgba(255, 255, 255, " + (0.3 * ratio) + ")"
                ctx.stroke();
            }
            
            for(let i = 0; i < this.trail.b.length - 1; i++){
                let ratio = i/this.TRAIL_LENGTH;
                ctx.beginPath();
                ctx.moveTo(this.trail.b[i].x * S, this.trail.b[i].y * S);
                ctx.lineTo(this.trail.b[i + 1].x * S, this.trail.b[i + 1].y * S);
                ctx.lineWidth = 2 * ratio * S;
                ctx.strokeStyle = "rgba(255, 255, 255, " + (0.3 * ratio) + ")"
                ctx.stroke();
            }
            
            for(let i = 0; i < this.trail.c.length - 1; i++){
                let ratio = i/this.TRAIL_LENGTH;
                ctx.beginPath();
                ctx.moveTo(this.trail.c[i].x * S, this.trail.c[i].y * S);
                ctx.lineTo(this.trail.c[i + 1].x * S, this.trail.c[i + 1].y * S);
                ctx.lineWidth = 2 * ratio * S;
                ctx.strokeStyle = "rgba(255, 255, 255, " + (0.3 * ratio) + ")"
                ctx.stroke();
            }
            
            for(let i = 0; i < this.trail.d.length - 1; i++){
                let ratio = i/this.TRAIL_LENGTH;
                ctx.beginPath();
                ctx.moveTo(this.trail.d[i].x * S, this.trail.d[i].y * S);
                ctx.lineTo(this.trail.d[i + 1].x * S, this.trail.d[i + 1].y * S);
                ctx.lineWidth = 2 * ratio * S;
                ctx.strokeStyle = "rgba(255, 255, 255, " + (0.3 * ratio) + ")"
                ctx.stroke();
            }
        }
        
        //Calculate which angle to draw the ball at;
        let simplifiedAngle = this.angle;
        while(simplifiedAngle > 90){
            simplifiedAngle -= 90;
        }
        let frameNum = 0;
        
        if(simplifiedAngle > 75){
            frameNum = 5
        }
        else if (simplifiedAngle > 60){
            frameNum = 4
        }
        else if(simplifiedAngle > 45){
            frameNum = 3
        }
        else if(simplifiedAngle > 30){
            frameNum = 2
        }
        else if(simplifiedAngle > 15){
            frameNum = 1
        }
        else {
            frameNum = 0
        }
        
        if(this.flashTimer > 0){
            frameNum = 6;
        }
        
        let vertFrameNum = 0;
        if(this.hasHitSide == "left"){
            //vertFrameNum = 2;
        }
        else if(this.hasHitSide == "right"){
            //vertFrameNum = 1;
        }
        
        if(this.hasScored){
            vertFrameNum = 0;    
        }
        
        //Draw the ball
        let ballImage = Images.ballImage;
        let imageSize = 105;
        ctx.drawImage(ballImage, 
            
            //Source Coordinates
            frameNum * imageSize,
            vertFrameNum * imageSize, 
            imageSize,
            imageSize,
            
            //Draw Coordinates
            (this.pos.x - this.DRAW_SIZE/2) * S,  
            (this.pos.y - this.DRAW_SIZE/2) * S, 
            this.DRAW_SIZE * S,
            this.DRAW_SIZE * S
            
        )
        
        if(this.pos.y + this.radius < 0){
            ctx.fillStyle = "#c7bf19";
            ctx.lineWidth = 0.5 * S;
            ctx.strokeStyle = "#4a4611"
            ctx.beginPath();
            ctx.moveTo(this.pos.x * S, 5 * S)
            ctx.lineTo((this.pos.x + 3) * S, 7 * S);
            ctx.lineTo((this.pos.x - 3) * S, 7 * S);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = "#4a4611";
            let distance = Math.floor(Math.abs(this.pos.y + this.radius)) + 1;
            ctx.textAlign = "center";
            ctx.font = 5 * S + "px 'Press Start 2P'";
            ctx.fillText(distance, this.pos.x * S, 16 * S);
        }
    }
}