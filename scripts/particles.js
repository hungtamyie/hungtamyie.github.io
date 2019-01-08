var FOREGROUND_CLOUD_DATA = [
    [3, 5, 475, 149],
    [142, 196, 207, 34],
    [33, 245, 415, 107],
    [37, 468, 346, 40],
    [501, 188, 385, 174],
]

var BACKGROUND_CLOUD_DATA = [
    [0, 397, 520, 38],
    [515, 12, 569, 143],
    [509, 434, 473, 91],
]

var foregroundClouds = [];
var backgroundClouds = [];
var cloudscale = 0.2;
var foregroundCloudSpeed = 0.06;
var backgroundCloudSpeed = 0.02;

function createForegroundCloud(){
    foregroundClouds.push([getRandomInt(-800, -100), getRandomInt(-15, 85), FOREGROUND_CLOUD_DATA[getRandomInt(0, FOREGROUND_CLOUD_DATA.length)], Math.random()/10])
}
for(var i = 0; i < 5; i++){
    createForegroundCloud();
    foregroundClouds[i][0] += 360;
}

function createBackgroundCloud(){
    backgroundClouds.push([getRandomInt(-800, -100), getRandomInt(-15, 85), BACKGROUND_CLOUD_DATA[getRandomInt(0, BACKGROUND_CLOUD_DATA.length)], Math.random()/20])
}
for(var i = 0; i < 15; i++){
    createBackgroundCloud();
    backgroundClouds[i][0] += 360;
}

function drawAndUpdateClouds(){
    let image = Images.clouds;
    
    for(let i = 0; i < backgroundClouds.length; i++){
        let cloud = backgroundClouds[i];
        cloud[0] += (backgroundCloudSpeed + cloud[3]) * fpsCoefficient;        
        
        ctx.drawImage(image, cloud[2][0], cloud[2][1], cloud[2][2], cloud[2][3], cloud[0] * S, cloud[1] * S, cloud[2][2] * S * cloudscale, cloud[2][3] * S * cloudscale)
    }
    
    let backgroundCloudsDeleted = 0;
    for(let i = 0; i < backgroundClouds.length; i++){
        let cloud = backgroundClouds[i];
        if(cloud[0] > 320){
            backgroundClouds.splice(i, 1);
            backgroundCloudsDeleted++;
        }
    }
    
    while(backgroundCloudsDeleted > 0){
        createBackgroundCloud();
        backgroundCloudsDeleted--;
    }
    
    for(let i = 0; i < foregroundClouds.length; i++){
        let cloud = foregroundClouds[i];
        cloud[0] += (foregroundCloudSpeed + cloud[3]) * fpsCoefficient;        
        
        ctx.drawImage(image, cloud[2][0], cloud[2][1], cloud[2][2], cloud[2][3], cloud[0] * S, cloud[1] * S, cloud[2][2] * S * cloudscale, cloud[2][3] * S * cloudscale)
    }
    
    let cloudsDeleted = 0;
    for(let i = 0; i < foregroundClouds.length; i++){
        let cloud = foregroundClouds[i];
        if(cloud[0] > 320){
            foregroundClouds.splice(i, 1);
            cloudsDeleted++;
        }
    }
    
    while(cloudsDeleted > 0){
        createForegroundCloud();
        cloudsDeleted--;
    }
};


var smokeParticles = [];
var smokeParticleLifetime = 30;
var smokeParticleScale = .5;

function createSmokeParticle(x, y, vector){
    smokeParticles.push([x, y, vector, smokeParticleLifetime]);
}

function drawAndUpdateSmokeParticles(){
    for(let i = 0; i < smokeParticles.length; i++){
        let particle = smokeParticles[i];
        
        let frame = 0;
        if(particle[3] > smokeParticleLifetime * 3/4) frame = 0;
        else if(particle[3] > smokeParticleLifetime * 2/4) frame = 1;
        else if(particle[3] > smokeParticleLifetime * 1/4) frame = 2;
        else frame = 3;
        
        ctx.drawImage(Images.smoke, 64 * frame, 0, 64, 64, (particle[0]-4*smokeParticleScale) * S, (particle[1]-4*smokeParticleScale) * S, 64 * smokeParticleScale, 64 * smokeParticleScale);
        particle[3] -= 1 * fpsCoefficient;
        particle[0] += particle[2].x * fpsCoefficient;
        particle[1] += particle[2].y * fpsCoefficient;
    }
    
    for(let i = 0; i < smokeParticles.length; i++){
        let particle = smokeParticles[i];
        if(particle[3] < 0){
            smokeParticles.splice(i, 1);
        }
    }
}


let dustParticles = [];
for(var i = 0; i < 30; i++){
    dustParticles.push([getRandomInt(0, 320), getRandomInt(0, 180), getRandomInt(0, 3000), new Vector(0.02, 0)])
}
function drawAndUpdateDustParticles(){
    for(let i = 0; i < dustParticles.length; i++){
        let particle = dustParticles[i];
        let decimal = Math.abs(1500 - particle[2])/1500
        particle[2] += 1 * fpsCoefficient;
        if(particle[2] > 3000){
            particle[2] = 0;
        }
        
        if(Math.random() > 0.999){
            particle[3].setDirection(getRandomInt(0, 360) * Math.PI/180);
        }
        if(particle[0] < 0){
            particle[0] = 320;
        }
        if(particle[0] > 320){
            particle[0] = 0;
        }
        if(particle[1] < 0){
            particle[1] = 180;
        }
        if(particle[1] > 180){
            particle[1] = 0;
        }
        
        particle[0] += particle[3].x * fpsCoefficient;
        particle[1] += particle[3].y * fpsCoefficient;
        ctx.fillStyle = "rgba(255,255,10," + decimal/3 + ")";
        ctx.fillRect(particle[0] * S, particle[1] * S, 1 * S, 1 * S);
    }  
}

let sparks = [];
function addSparks(x, y, number){
    for(let i = 0; i < number; i++){
        let vector = new Vector(getRandomInt(20, 60)/100, 0);
        vector.setDirection(getRandomInt(0, 360) * Math.PI/180);
        sparks.push([x, y, vector, getRandomInt(40, 20)])
    }
}

function drawAndUpdateSparks(){
    for(let i = 0; i < sparks.length; i++){
        let spark = sparks[i];
        ctx.fillStyle = "yellow";
        if(getRandomInt(0, 20) < 10){
            ctx.fillStyle = "orange";
        }
        spark[0] += spark[2].x * fpsCoefficient;
        spark[1] += spark[2].y * fpsCoefficient;
        spark[2].y += GRAVITY * fpsCoefficient;
        spark[3] -= 1 * fpsCoefficient;
        ctx.fillRect(spark[0] * S, spark[1] * S, 1 * S, 1 * S);
    }
    
    for(let i = 0; i < sparks.length; i++){
        let spark = sparks[i];
        if(spark[3] <= 0){
            sparks.splice(i, 1);
        }
    }
}