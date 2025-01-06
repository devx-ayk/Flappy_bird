// board
let highScore = localStorage.getItem("highScore") || 0; // Load high score or default to 0
let board;
let boardWidth = 360;
let boardHeight =640;
let context;

// bird

let birdWdith = 34; //Width/Height ratio = 408/228 = 17/12
let birdHeight = 24;// Height of the bird
let birdX = boardWidth/8;// Horizontal position of the bird
let birdY = boardHeight/2; // Vertical position of the bird
// let birdImg;
let birdImgs = [];
let birdImgsIndex = 0;
  
let bird ={
    x : birdX,
    y : birdY,
    width : birdWdith,
    height : birdHeight
}

// pipes
let pipeArray =[];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics

let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

let wingSound = new Audio("flap-101soundboards.mp3");
let hitSound = new Audio("flappy-bird-hit-sound-101soundboards.mp3");
let bgMusic = new Audio("01. Ground Theme.mp3");
let GOmusic = new Audio("21. Game Over (Alt) (Unused).mp3");

window.onload = function() {

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
 

for(let i = 0; i<4; i++){
    let birdImg = new Image();
    birdImg.src = `./flappybird${i}.png`;
    birdImgs.push(birdImg);
}
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();    
    bottomPipeImg.src = "./bottompipe.png";                  
  
   requestAnimationFrame(update);
   setInterval(placePipes, 1500); //every 1.5 sec
   setInterval(animateBird, 100);
   document.addEventListener("keydown", moveBird);// For keyboard input
   document.addEventListener("touchstart", moveBird);// For touch input

}

function update()  {
     requestAnimationFrame(update);
     if (gameOver) {
        // Check and update high score
        if(score > highScore){
            highScore = score;
            localStorage.setItem("highScore",highScore); //saves the new high score
        }
        return;
     }
     context.clearRect(0, 0, board.width, board.height);

     //bird
     velocityY += gravity;
     bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
     context.drawImage(birdImgs[birdImgsIndex], bird.x, bird.y, bird.width, bird.height);
   // birdImgsIndex++;
    //birdImgsIndex %= birdImgs.length; //circle back with modulus, max frames is 4
// 012301230123
     if(bird.y > boardHeight){
        gameOver = true;
     }
    //  pipes
    for(let i = 0; i < pipeArray.length; i++){
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if(!pipe.passed && bird.x > pipe.x + pipe.width){
            score +=0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)){
            hitSound.play();
            gameOver = true;  
        }
    }

//    clear old pipes
     while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
        pipeArray.shift(); //removes first element from the array
     }

    // Score display   
    context.fillStyle = "yellow";      
    context.font = "25px 'Press Start 2P', cursive";
    context.fillText("⭐ "+score, 5, 45);
    context.fillText("🏆 "+highScore, 5, 75); //Display high score

// Game Over display
    if(gameOver){
        const gameOverText = "GAME OVER";
        const textWidth = context.measureText(gameOverText).width;
        const textX = (boardWidth - textWidth) / 2; //center horizontally
        const textY = boardHeight / 2; //center vertically

        context.fillText(gameOverText, textX,textY);


        // context.fillText("GAME OVER", 5,90); 
           bgMusic.pause();
           bgMusic.currentTime = 0;
    }
}

function animateBird(){
    birdImgsIndex++; //increment to next frame
    birdImgsIndex %= birdImgs.length; // circle back with modulus, max frames is 4 
}

function placePipes() {
    if(gameOver){
        return;
    }

   let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
   let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY, 
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    // Check if the game is over
    if (gameOver) {
        // Reset the game
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        velocityY = -6; // Make the bird jump on reset

        // Stop and reset Game over sound
        GOmusic.pause();
        GOmusic.currentTime = 0;

        return;
    }

    // Handle jump logic
    if (e.type === "keydown") {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
            if(GOmusic.paused){
                bgMusic.play();
            }
            
            wingSound.play();
            velocityY = -6; // Jump
            console.log("Key pressed:", e.code);
        }
    } else if (e.type === "touchstart") {
        bgMusic.play();
        wingSound.play();
        velocityY = -6; // Jump
        console.log("Screen tapped");
    }
}


function detectCollision(a,b) {
    if( a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    ){
        hitSound.play(); //plays hit sound

        // Stop any currently playing game-over sound
        GOmusic.pause();
        GOmusic.currentTime = 0;

        // wait for the hit sound to finish, then play the game-over sound

        hitSound.onended = () => {
            GOmusic.play();
        };

        gameOver = true;
        return true;
    }

    return false;


}
// Key Components:
// pipeY: Represents a reference y position (likely the default or starting point for the pipes).
// pipeHeight: The height of the pipe.
// Math.random(): Generates a random number between 0 and 1.
// randomPipeY formula:
// javascript
// Copy code
// pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2)
// pipeHeight/4: Shifts the top pipe slightly downward.
// Math.random()*(pipeHeight/2): Ensures the top pipe's y position varies within a range of half the pipe height.
// This randomness creates variability in pipe placement, making the game more challenging.
