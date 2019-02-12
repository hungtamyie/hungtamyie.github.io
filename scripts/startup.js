var canvas;
var ctx;
var game;
var titleScreen;
var Images = {};
var fpsCoefficient = 1;
var defaultAI = "Caesar";
var soundSetting = "on";
var infiniteBoostSetting = "on";

/***********************************
 *   Setting up the game screen    *
 **********************************/
 
window.onload = function(){
    getCanvas();
    resizeCanvas();
    resizeTitleScreen();
    window.onresize = function(){resizeCanvas();resizeTitleScreen()}
    loadImages();
    loadAudio();
}

function getCanvas(){
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
}

var S;
function resizeCanvas(){
    var screenHeight = window.innerHeight
    var screenWidth = window.innerWidth
    
    var aspectRatio = {width: 16,height: 9}
    var uiSize = 0
    
    if(screenHeight/aspectRatio.height * aspectRatio.width < screenWidth){
        canvas.width = screenHeight/aspectRatio.height * aspectRatio.width
        canvas.height = screenHeight * (1-uiSize)
    }
    else {
        canvas.width = screenWidth
        canvas.height = screenWidth/aspectRatio.width * aspectRatio.height * (1-uiSize)
    }
    
    S = canvas.width/320;
}

var imagesLoaded = 0;
function loadImages(){
    for(let i = 0; i < IMAGE_DIRECTORY.length; i++){
        loadImage(IMAGE_DIRECTORY[i][0], IMAGE_DIRECTORY[i][1]);
    }
}

function loadImage(name, src){
    var img = new Image();   // Create new img element
    img.addEventListener('load', function() {
      Images[name] = img;
      imageLoaded();
    }, false);
    img.src = src; // Set source path   
}

function imageLoaded(){
    imagesLoaded++;
    if(imagesLoaded >= IMAGE_DIRECTORY.length){
        closeLoadingScreen();
        showTitleSceen();
    }
}

var scoreSoundgrassHitSound;
var metalHitSound;
var jumperLandSound;
var jumperHitSound;
var beepSound;
var boostSoundscoreSound;
var sorrySound;
var scoreSound;
var grassHitSound;
var clickSound;
var switchSound;
var gameWinSound;

function loadAudio(){
    grassHitSound = new Audio('./audio/grasshit.mp3');
    grassHitSound.preload = "auto";
    metalHitSound = new Audio('./audio/metalhit.wav');
    metalHitSound.preload = "auto";
    jumperLandSound = new Audio('./audio/grasshit.mp3');
    jumperLandSound.preload = "auto";
    jumperHitSound = new Audio('./audio/jumperhit.wav');
    jumperHitSound.preload = "auto";
    beepSound = new Audio('./audio/beep.mp3');
    beepSound.preload = "./auto";
    scoreSound = new Audio('./audio/score.mp3');
    scoreSound.preload = "auto";
    sorrySound = new Audio('./audio/sorry.wav');
    sorrySound.preload = "auto";
    clickSound = new Audio('./audio/click.wav');
    clickSound.preload = "auto";
    switchSound = new Audio('./audio/switch.wav');
    switchSound.preload = "auto";
    gameWinSound = new Audio('./audio/gameWin.wav');
    gameWinSound.preload = "auto";
}

function promptSingleplayerGame(){
    playClick();
    document.getElementById("popup").style.zIndex = "10000";
    popupShowing = "aiSelect";
    document.getElementById("popupTitle").innerHTML = "&nbsp;Play vs AI";
    document.getElementById("popupData").innerHTML = 'Test your skills against an AI opponent. These AIs are still in development<br><br> <select id="leftSelection" name="AISelectionLeft"></select>';
    
    var aiNames = Object.keys(AIStorage);
    for(var i = 0; i < aiNames.length; i++){
        document.getElementById("leftSelection").innerHTML += '<option value="' + aiNames[i] + '">' + aiNames[i] + '</option>';
    }
    
    document.getElementById("popupData").innerHTML += '<br><h2>vs</h2><br>';
    
    document.getElementById("popupData").innerHTML += '<select id="rightSelection" name="AISelectionRight"></select>';
    
    var aiNames = Object.keys(AIStorage);
    for(var i = 0; i < aiNames.length; i++){
        document.getElementById("rightSelection").innerHTML += '<option value="' + aiNames[i] + '">' + aiNames[i] + '</option>';
    }
    
    document.getElementById("popupData").innerHTML += '<br><br><br><div id="startSingleplayerGameButton" onclick="startSingleplayerGame()">START</div>';
    document.getElementById("rightSelection").value = defaultAI;
}

function startSingleplayerGame(aiA, aiB){
    infiniteBoostSetting = "on";
    hideTitleScreen();
    playClick();
    if(aiA && aiB){
        game = new Game(false, aiA, aiB);
    }
    else {
        game = new Game(false, document.getElementById("leftSelection").value, document.getElementById("rightSelection").value);
    }
    closePopup();
    game.start();
    activateGameController();
}

function promptMultiplayerGame(){
    playClick();
    document.getElementById("popup").style.zIndex = "10000";
    popupShowing = "aiSelect";
    document.getElementById("popupTitle").innerHTML = "&nbsp;Head to Head";
    infiniteBoostSetting = "on";
    document.getElementById("popupData").innerHTML = '<h1>Grab a friend!</h1> <br> Player 1 uses W A S D <br> Player 2 uses I J K L <br> More info in instructions <h1><br></br> <div id="startSingleplayerGameButton" onclick="startMultiplayerGame()">START</div>';
}

function startMultiplayerGame(){
    closePopup();
    infiniteBoostSetting = "on";
    hideTitleScreen();
    playClick();
    game = new Game(false);
    game.start();
    activateGameController();
}

function startTrainingGame(){
    hideTitleScreen();
    closePopup();
    playClick();
    game = new Game(true);
    game.start();
    activateGameController();
}

function promptTrainingGame(){
    playClick();
    document.getElementById("popup").style.zIndex = "10000";
    popupShowing = "aiSelect";
    document.getElementById("popupTitle").innerHTML = "&nbsp;Training Game";
    infiniteBoostSetting = "on";
    document.getElementById("popupData").innerHTML = '<h2>Training mode will help you improve your skills!</h2><h3>Do you want infinite fuel?</h3><div id="infiniteBoostButton" onclick="toggleInfiniteBoostPreference()">Yes</div></h2>';
    document.getElementById("popupData").innerHTML += '<div id="startSingleplayerGameButton" onclick="startTrainingGame()">START</div><br>Hint: Use Left and Right shift to set up the ball. (This feature is still in beta mode)';
}

function toggleInfiniteBoostPreference(){
    if(infiniteBoostSetting == "on"){
        infiniteBoostSetting = "off";
        playClick();
        document.getElementById("infiniteBoostButton").innerHTML = "No";
    }
    else {
        infiniteBoostSetting = "on";
        playClick();
        document.getElementById("infiniteBoostButton").innerHTML = "Yes";
    }
}

function hideTitleScreen(){
    titleScreen.style.zIndex = "-1";
    canvas.style.zIndex = "1";
}

function showTitleSceen(){
    deactivateGameController();
    titleScreen.style.zIndex = "1";
    canvas.style.cursor="default";
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.style.zIndex = "-1";
}

function resizeTitleScreen(){
    titleScreen = document.getElementById("titleScreen");
    var screenHeight = window.innerHeight
    var screenWidth = window.innerWidth
    
    var aspectRatio = {width: 16,height: 9}
    
    if(screenHeight/aspectRatio.height * aspectRatio.width < screenWidth){
        titleScreen.style.width = screenHeight/aspectRatio.height * aspectRatio.width + "px";
        titleScreen.style.height = screenHeight + "px";
        document.body.style.fontSize = screenHeight/45 + "px";
    }
    else {
        titleScreen.style.width = screenWidth + "px";
        titleScreen.style.height = screenWidth/aspectRatio.width * aspectRatio.height + "px";
        document.body.style.fontSize = screenWidth/80 + "px";
    }
}

let popupShowing = "none";

function closePopup(){
    document.getElementById("popup").style.zIndex = "-1";
    playClick();
}

function toggleInstructions(){
    if(popupShowing == "instructions"){
        document.getElementById("popup").style.zIndex = "-1";
        popupShowing = "none";
    }
    else {
        document.getElementById("popup").style.zIndex = "10000";
        popupShowing = "instructions";
        document.getElementById("popupTitle").innerHTML = "&nbsp;Instructions"
        document.getElementById("popupData").innerHTML = "DO NOT LET THE BALL TOUCH THE GROUND. <br><br> And that's how you play! <br> On to the controls: <br><br> Player 1 moves with WASD and Player 2 moves with IJKL. <br><br> Press the up key to jump. <br> Use the arrow keys to move left and right. <br><br> Those are the basic controls. If you're new, I suggest experimenting with those in training mode before reading the advanced controls. <br><br> Hit jump (the up key) once to jump off the ground. The longer you hold the jump button, the higher you will jump. Hit jump again to do an air jump. If you hit jump a third time while in the air, you will start flying. While in flight mode hold the jump button to fly up. <br><br> Last key is the boost key. That will be the down key, either S or I. Hold it while moving in some direction to sprint. If you're in the air, you can hit it once while moving in some direction to perform an air dash. <br><br> That's it! Four buttons. Master them and you will have no problem defeating your opponents."
    }
    playClick();
}

function toggleCredits(){
    if(popupShowing == "credits"){
        document.getElementById("popup").style.zIndex = "-1";
        popupShowing = "none"
    }
    else {
        document.getElementById("popup").style.zIndex = "10000";
        popupShowing = "credits";
        document.getElementById("popupTitle").innerHTML = "&nbsp;Credits";
        document.getElementById("popupData").innerHTML = 
        "Developer: Hung-Tam Yie <br><br> Artist: Hung-Tam Yie <br><br> AI Developers: <br>Hung-Tam Yie <br> MrPannkaka <br><br> Sound Effects: Mike Koenig, Breviceps, Volivieri, AgentDD, benboncan, littlerobotsoundfactory, gameaudio, gabbermikeg, Caroline Ford <br><br> Sounds from Soundbible.com and Freesound.org <br><br> Many thanks to my parents who supported me and gave me programming advice. <br><br> Huge thanks to Albert! He helped me with handling collisions in the physics engine and there's no way this game could exist without him. Thank you Albert! <br><br> Oh, and thank you, Player, for playing and (hopefully) enjoying this game. Good luck have fun!";
    }
    playClick();
}

function toggleSound(){
    if(soundSetting == "off"){
        soundSetting = "on";
        document.getElementById("soundButton").innerHTML = "Sound FX: On";
        clickSound.currentTime = 0;
        clickSound.play(); 
    }
    else {
        soundSetting = "off";
        document.getElementById("soundButton").innerHTML = "Sound FX: Off";
    }
}

function openAIEditor(){
    playClick();
    document.getElementById("codeTextBox").value = "AIStorage.YOUR_AI_NAME_HERE = function(myJumper, enemyJumper, ball, controlPanel){ \n //Your code here \n\n}"
    document.getElementById("aiEditor").style.visibility = "visible";
    document.getElementById("aiEditor").style.zIndex = "200000000000000000";
}

function playClick(){
    if(soundSetting == "on"){
        clickSound.currentTime = 0;
        clickSound.play(); 
    }
}

function playSorry(){
    if(soundSetting == "on"){
        sorrySound.currentTime = 0;
        sorrySound.play(); 
    }
}

function closeLoadingScreen(){
    /*window.setTimeout(function(){
        
    },2000)*/
    document.getElementById("loadingScreen").style.zIndex = "-1";   
    document.getElementById("ballGif").src = "";   
}

function addAI(){
    document.getElementById("aiEditor").style.zIndex = "-1";
    playClick();
    eval(document.getElementById("codeTextBox").value);
    document.getElementById("aiEditor").style.visibility = "hidden";
}