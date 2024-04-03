let generated = false;
let roomtype = 0;
let etopd = true;
let ebotd = true;
let eleftd = true;
let erightd = true;
let wentthrough = "none";
let impossibleroom = "none";
let mouseX = 0;
let mouseY = 0;
let lastmove = "up";
let SpawnTime = true;
let lastShotTime = 0;
let lastOuch = 0;
let enemyleft = 0;
let roomswent = 1;
let gameover = false;
let perktime = false;
let perkRectangles = [];
let shotCool = 500;
let randTime = true;
let perk1 = 0;
let perk2 = 0;
let perk3 = 0;



const jsonUrl = "content.json";

async function fetchPerkData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.perks;
    } catch (error) {
        console.error(error);
        console.log("Error");
    }
}

let perks = [];

async function createPerkDeck() {
    perks = await fetchPerkData(jsonUrl);
}

async function testFetchAndCreateDeck() {
    try {
        // Call createDeck to fetch data and create the deck
        await createPerkDeck();
        
        // Log the fetched perks
        console.log("Fetched perks:", perks[0].style);
    } catch (error) {
        console.error("Error in fetching and creating deck:", error);
    }
}

// Call the test function
testFetchAndCreateDeck();



// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Define the player object
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 1.5,
    normalspeed: 1.5,
    slowspeed: 1,
    radius: 10, // Define the player's radius
    hp: 100
};

let SharpStick = {
    length: 40,
    width: 5,
    dmg: 1,
    rotation: 0,
    speed: 2
}

let StcikArray = [];

let glorpArray = [];

let glorp = {
    speed: 1,
    radius: 8,
    hp: 3
}

// walls
const topwall = {
    width: canvas.width,
    height: canvas.height / 20,
    y: 0,
    x: 0
};

const botwall = {
    width: canvas.width,
    height: canvas.height / 20,
    y: canvas.height - (canvas.height / 20),
    x: 0
};

const leftwall = {
    width: canvas.width / 20,
    height: canvas.height,
    y: 0,
    x: 0
};

const rightwall = {
    width: canvas.width / 20,
    height: canvas.height,
    y: 0,
    x: canvas.width - (canvas.width / 20)
};

// doors
const topdoor = {
    width: canvas.width / 3,
    height: canvas.height / 20,
    x: (canvas.width - (canvas.width / 3)) / 2
};

const botdoor = {
    width: canvas.width / 3,
    height: canvas.height / 20,
    y: canvas.height - (canvas.height / 20),
    x: (canvas.width - (canvas.width / 3)) / 2
};

const leftdoor = {
    width: canvas.width / 20,
    height: canvas.height / 3,
    y: (canvas.height - (canvas.height / 3)) / 2
};

const rightdoor = {
    width: canvas.width / 20,
    height: canvas.height / 3,
    y: (canvas.height - (canvas.height / 3)) / 2,
    x: canvas.width - (canvas.width / 20)
};

// draw the player
function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function updateRotation() {
    if (lastmove === "up") {
        SharpStick.rotation = 1.57;
    }
    if (lastmove === "down") {
        SharpStick.rotation = -1.57;
    }
    if (lastmove === "left") {
        SharpStick.rotation = 0;
    }
    if (lastmove === "right") {
        SharpStick.rotation = 3.15;
    }
    if (lastmove === "left_down") {
        SharpStick.rotation = -0.78;
    }
    if (lastmove === "left_up") {
        SharpStick.rotation = 0.78;
    }
    if (lastmove === "right_down") {
        SharpStick.rotation = -2.36;
    }
    if (lastmove === "right_up") {
        SharpStick.rotation = 2.36;
    }
}

function drawStick(x, y, rotation) {
    ctx.save();
    ctx.translate(x, y); // Translate to stick's position
    ctx.rotate(rotation); // Rotate around the stick's position
    // Calculate the position of the top-left corner of the stick
    const stickTopLeftX = -(SharpStick.length / 2);
    const stickTopLeftY = -(SharpStick.width / 2);
    // Draw the stick
    ctx.fillRect(stickTopLeftX, stickTopLeftY, SharpStick.length, SharpStick.width);
    ctx.strokeStyle = "#FF0000";
    ctx.restore();
}


function drawglorp(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, glorp.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#876512";
    ctx.fill();
    ctx.closePath();
}

function spawnGlorp(x, y) {
    let newGlorp = {
        x: x,
        y: y,
        speed: glorp.speed,
        radius: glorp.radius,
        hp: glorp.hp
    };
    glorpArray.push(newGlorp);
}

function spawnStick() {
    // Calculate the offset from the player's position based on stick length
    let offsetX = Math.cos(SharpStick.rotation) * (SharpStick.length / 2);
    let offsetY = Math.sin(SharpStick.rotation) * (SharpStick.length / 2);

    // Calculate the starting position of the stick
    let stickStartX = player.x - offsetX;
    let stickStartY = player.y - offsetY;

    let newStick = {
        x: stickStartX,
        y: stickStartY,
        length: SharpStick.length,
        width: SharpStick.width,
        dmg: SharpStick.dmg,
        rotation: SharpStick.rotation,
        speed: SharpStick.speed
    };
    StcikArray.push(newStick);
}

function shoot() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastShotTime;
    const cooldownTime = shotCool;

    if (elapsedTime >= cooldownTime) {
        spawnStick()
        lastShotTime = currentTime;
    }
}

function ouch() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastOuch;
    const cooldownTime = 200;

    if (elapsedTime >= cooldownTime) {
        player.hp -= 10;
        if (player.hp <= 0) {
            gameover = true
            canvas.style.display = "none";
        }
        lastOuch = currentTime;
    }
}

function drawGlorps() {
    for (let i = 0; i < glorpArray.length; i++) {
        let glorp = glorpArray[i];
        drawglorp(glorp.x, glorp.y);
    }
}

function drawSticks() {
    for (let i = 0; i < StcikArray.length; i++) {
        let stick = StcikArray[i];
        drawStick(stick.x, stick.y, stick.rotation); // Pass rotation
    }
}

// draw the walls
function drawWalls() {
    ctx.fillStyle = "#506010";
    ctx.fillRect(topwall.x, topwall.y, topwall.width, topwall.height);
    ctx.fillRect(botwall.x, botwall.y, botwall.width, botwall.height);
    ctx.fillRect(leftwall.x, leftwall.y, leftwall.width, leftwall.height);
    ctx.fillRect(rightwall.x, rightwall.y, rightwall.width, rightwall.height);
}

// draw the doors
function drawDoorsp2() {
    if (!generated) {
        SpawnTime = true
        if (wentthrough === "none") {
            roomtype = Math.floor(Math.random() * 8);
            generated = true;
        }
        if (wentthrough === "bot") {
            roomtype = Math.floor(Math.random() * 8);
            drawDoorsp1();
            document.getElementById("rand").innerHTML = roomtype;
            while (impossibleroom === "bot" || impossibleroom === "top,bot") {
                roomtype = Math.floor(Math.random() * 8);
                drawDoorsp1();
            }
            generated = true;
        }
        if (wentthrough === "top") {
            roomtype = Math.floor(Math.random() * 8);
            drawDoorsp1();
            document.getElementById("rand").innerHTML = roomtype;
            while (impossibleroom === "top" || impossibleroom === "top,bot" || impossibleroom === "top,right") {
                roomtype = Math.floor(Math.random() * 8);
                drawDoorsp1();
            }
            generated = true;
        }
        if (wentthrough === "right") {
            roomtype = Math.floor(Math.random() * 8);
            drawDoorsp1();
            document.getElementById("rand").innerHTML = roomtype;
            while (impossibleroom === "right" || impossibleroom === "top,right" || impossibleroom === "left,right") {
                roomtype = Math.floor(Math.random() * 8);
                drawDoorsp1();
            }
            generated = true;
        }
        if (wentthrough === "left") {
            roomtype = Math.floor(Math.random() * 8);
            drawDoorsp1();
            document.getElementById("rand").innerHTML = roomtype;
            while (impossibleroom === "left" || impossibleroom === "left,right") {
                roomtype = Math.floor(Math.random() * 8);
                drawDoorsp1();
            }
            generated = true;
        }
    }
}


function drawDoorsp1() {
    if (roomswent == 5) {
        roomtype = 69
    }
    if (roomtype === 69) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(topdoor.x, 0, topdoor.width, topdoor.height);
        ctx.fillRect(botdoor.x, botdoor.y, botdoor.width, botdoor.height);
        ctx.fillRect(0, leftdoor.y, leftdoor.width, leftdoor.height);
        ctx.fillRect(rightdoor.x, rightdoor.y, rightdoor.width, rightdoor.height);
        etopd = true;
        ebotd = true;
        eleftd = true;
        erightd = true;
        impossibleroom = "none";
        perktime = true;
    }
    if (roomtype === 1) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(topdoor.x, 0, topdoor.width, topdoor.height);
        ctx.fillRect(botdoor.x, botdoor.y, botdoor.width, botdoor.height);
        ctx.fillRect(0, leftdoor.y, leftdoor.width, leftdoor.height);
        ctx.fillRect(rightdoor.x, rightdoor.y, rightdoor.width, rightdoor.height);
        etopd = true;
        ebotd = true;
        eleftd = true;
        erightd = true;
        impossibleroom = "none";
        perktime = false;
    }
    if (roomtype === 0) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(botdoor.x, botdoor.y, botdoor.width, botdoor.height);
        ctx.fillRect(0, leftdoor.y, leftdoor.width, leftdoor.height);
        ctx.fillRect(rightdoor.x, rightdoor.y, rightdoor.width, rightdoor.height);
        etopd = false;
        ebotd = true;
        eleftd = true;
        erightd = true;
        impossibleroom = "bot";
        if (SpawnTime) {
            SpawnTime = false
            spawnGlorp(50,50);
            spawnGlorp(50,100);
            spawnGlorp(100,100);
            enemyleft = 3
        }
        perktime = false;
    }
    if (roomtype === 2) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(topdoor.x, 0, topdoor.width, topdoor.height);
        ctx.fillRect(0, leftdoor.y, leftdoor.width, leftdoor.height);
        ctx.fillRect(rightdoor.x, rightdoor.y, rightdoor.width, rightdoor.height);
        etopd = true;
        ebotd = false;
        eleftd = true;
        erightd = true;
        impossibleroom = "top";
        if (SpawnTime) {
            SpawnTime = false
            spawnGlorp(50,50);
            enemyleft = 1
        }
        perktime = false;
    }
    if (roomtype === 3) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(topdoor.x, 0, topdoor.width, topdoor.height);
        ctx.fillRect(botdoor.x, botdoor.y, botdoor.width, botdoor.height);
        ctx.fillRect(rightdoor.x, rightdoor.y, rightdoor.width, rightdoor.height);
        etopd = true;
        ebotd = true;
        eleftd = false;
        erightd = true;
        impossibleroom = "right";
        perktime = false;
    }
    if (roomtype === 4) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(topdoor.x, 0, topdoor.width, topdoor.height);
        ctx.fillRect(botdoor.x, botdoor.y, botdoor.width, botdoor.height);
        ctx.fillRect(0, leftdoor.y, leftdoor.width, leftdoor.height);
        etopd = true;
        ebotd = true;
        eleftd = true;
        erightd = false;
        impossibleroom = "left";
        perktime = false;
    }
    if (roomtype === 5) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(topdoor.x, 0, topdoor.width, topdoor.height);
        ctx.fillRect(rightdoor.x, rightdoor.y, rightdoor.width, rightdoor.height);
        etopd = true;
        ebotd = false;
        eleftd = false;
        erightd = true;
        impossibleroom = "top,right";
        perktime = false;
    }
    if (roomtype === 6) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(topdoor.x, 0, topdoor.width, topdoor.height);
        ctx.fillRect(botdoor.x, botdoor.y, botdoor.width, botdoor.height);
        etopd = true;
        ebotd = true;
        eleftd = false;
        erightd = false;
        impossibleroom = "left,right";
        perktime = false;
    }
    if (roomtype === 7) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, leftdoor.y, leftdoor.width, leftdoor.height);
        ctx.fillRect(rightdoor.x, rightdoor.y, rightdoor.width, rightdoor.height);
        etopd = false;
        ebotd = false;
        eleftd = true;
        erightd = true;
        impossibleroom = "top,bot";
        perktime = false;
    }
}

function drawPerks() {
    if (perktime) {
        x = (canvas.width - (canvas.width / 3)) / 2;
        const perkWidth = 75;
        const perkHeight = 280;

        // Store the position and dimensions of each perk rectangle
        perkRectangles.push({
            x: x / 2 - 10,
            y: 60,
            width: perkWidth,
            height: perkHeight
        });
        perkRectangles.push({
            x: x + 30,
            y: 60,
            width: perkWidth,
            height: perkHeight
        });
        perkRectangles.push({
            x: x * 2,
            y: 60,
            width: perkWidth,
            height: perkHeight
        });

        // Draw each perk rectangle
        ctx.fillStyle = perks[1].style;
        for (let i = 0; i < perkRectangles.length && i < perks.length; i++) {
            const perk = perkRectangles[i];
            ctx.fillRect(perk.x, perk.y, perk.width, perk.height);
        }
    }
}

function randomisePerks() {
    if (randTime) {
        perk1 = Math.floor(Math.random() * perks.length);
        perk2 = Math.floor(Math.random() * perks.length);
        perk3 = Math.floor(Math.random() * perks.length);

        randTime = false;
    } 
}


// clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Event listener for keyboard input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let spacePressed = false;

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === "Up" || e.key === "ArrowUp") {
        upPressed = true;
    } else if (e.key === "Down" || e.key === "ArrowDown") {
        downPressed = true;
    } else if (e.key === " ") {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    } else if (e.key === "Up" || e.key === "ArrowUp") {
        upPressed = false;
    } else if (e.key === "Down" || e.key === "ArrowDown") {
        downPressed = false;
    } else if (e.key === " ") {
        spacePressed = false;
    }
}

// Function to handle player movement
function movePlayer() {
    // Save the player's current position
    const prevX = player.x;
    const prevY = player.y;

    // Move the player based on input
    if (rightPressed && player.x + player.radius < canvas.width) {
        player.x += player.speed;
    } else if (leftPressed && player.x - player.radius > 0) {
        player.x -= player.speed;
    }

    if (upPressed && player.y - player.radius > 0) {
        player.y -= player.speed;
    } else if (downPressed && player.y + player.radius < canvas.height) {
        player.y += player.speed;
    }

    if (spacePressed) {
        shoot()
    }

    if (prevX > player.x && prevY === player.y) {
        lastmove = "left";
    } 
    if (prevX < player.x && prevY === player.y) {
        lastmove = "right";
    } 
    if (prevY < player.y && prevX === player.x) {
        lastmove = "down";
    } 
    if (prevY > player.y && prevX === player.x) {
        lastmove = "up";
    } 
    if (prevX > player.x && prevY < player.y) {
        lastmove = "left_down";
    }
    if (prevX < player.x && prevY < player.y) {
        lastmove = "right_down";
    }
    if (prevX > player.x && prevY > player.y) {
        lastmove = "left_up";
    }
    if (prevX < player.x && prevY > player.y) {
        lastmove = "right_up";
    }

    if (lastmove == "left_down" || lastmove == "right_down" || lastmove == "left_up" || lastmove == "right_up") {
        player.speed = player.slowspeed
    } else {
        player.speed = player.normalspeed
    }
    

    // Check for collision with doors
    if (
        player.x + player.radius > topdoor.x &&
        player.x - player.radius < topdoor.x + topdoor.width &&
        player.y - player.radius < topdoor.height &&
        etopd &&
        enemyleft == 0
    ) {
        player.x = prevX;
        player.y = botdoor.y - (botdoor.height / 2);
        generated = false;
        wentthrough = "top";
        if (roomswent == 6) {
            roomswent = 0
        } else {
            roomswent += 1;   
        }
    }

    if (
        player.x + player.radius > botdoor.x &&
        player.x - player.radius < botdoor.x + botdoor.width &&
        player.y + player.radius > botdoor.y &&
        ebotd &&
        enemyleft == 0
    ) {
        player.x = prevX;
        player.y = topdoor.height * 1.5;
        generated = false;
        wentthrough = "bot";
        if (roomswent == 6) {
            roomswent = 0
        } else {
            roomswent += 1;   
        }
    }

    if (
        player.x - player.radius < leftdoor.width &&
        player.y + player.radius > leftdoor.y &&
        player.y - player.radius < leftdoor.y + leftdoor.height &&
        eleftd &&
        enemyleft == 0
    ) {
        player.x = rightdoor.x - (rightdoor.width / 2);
        player.y = prevY;
        generated = false;
        wentthrough = "left";
        if (roomswent == 6) {
            roomswent = 0
        } else {
            roomswent += 1;   
        }
    }

    if (
        player.x + player.radius > rightdoor.x &&
        player.y + player.radius > rightdoor.y &&
        player.y - player.radius < rightdoor.y + rightdoor.height &&
        erightd &&
        enemyleft == 0
    ) {
        player.x = leftdoor.width * 1.5;
        player.y = prevY; 
        generated = false;
        wentthrough = "right";
        if (roomswent == 6) {
            roomswent = 0
        } else {
            roomswent += 1;   
        }
    }
    
    // Check for collision with walls
    if (
        player.x + player.radius > topwall.x &&
        player.x - player.radius < topwall.x + topwall.width &&
        player.y - player.radius < topwall.height
    ) {
        player.x = prevX;
        player.y = prevY;
    }

    if (
        player.x + player.radius > botwall.x &&
        player.x - player.radius < botwall.x + botwall.width &&
        player.y + player.radius > botwall.y
    ) {
        player.x = prevX;
        player.y = prevY;
    }

    if (
        player.x - player.radius < leftwall.width &&
        player.y + player.radius > leftwall.y &&
        player.y - player.radius < leftwall.y + leftwall.height
    ) {
        player.x = prevX;
        player.y = prevY;
    }

    if (player.x + player.radius > rightwall.x &&
        player.y + player.radius > rightwall.y &&
        player.y - player.radius < rightwall.y + rightwall.height
    ) {
        player.x = prevX;
        player.y = prevY;
    }

    // Check for collision with perk rectangles
    if (roomtype == 69) {
        randomisePerks();
        for (let i = 0; i < perkRectangles.length; i++) {
            const perkrac = perkRectangles[i];
            if (
                player.x + player.radius > perkrac.x &&
                player.x - player.radius < perkrac.x + perkrac.width &&
                player.y + player.radius > perkrac.y &&
                player.y - player.radius < perkrac.y + perkrac.height
            ) {
                if (i == 1 && spacePressed) {
                    console.log(1)
                    eval(perks[perk1].code)
                    roomswent = 0
                    roomtype = 1
                }
                if (i == 2 && spacePressed) {
                    console.log(2)
                    eval(perks[perk2].code)
                    roomswent = 0
                    roomtype = 1
                }
                if (i == 3 && spacePressed) {
                    console.log(3)
                    eval(perks[perk3].code)
                    roomswent = 0
                    roomtype = 1
                }
            }
    }

    }
    // glorpy stuff
    for (let i = 0; i < glorpArray.length; i++) {
        let glorp = glorpArray[i];
        let dx = player.x - glorp.x;
        let dy = player.y - glorp.y;
        let distance = Math.sqrt(dx * dx + dy * dy); // Distance between player and glorp
        
        // Check if player collides with glorp
        if (distance < player.radius + glorp.radius) {
            ouch()
        }
    }   
}

function moveGlorp() {
    for (let i = 0; i < glorpArray.length; i++) {
        const glorp = glorpArray[i];
        const prevX = glorpArray[i].x;
        const prevY = glorpArray[i].y;

        // Calculate the distance between the glorp and the player
        const dx = player.x - glorp.x;
        const dy = player.y - glorp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate the unit vector (direction) towards the player
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Move the glorp towards the player
        glorp.x += directionX * glorp.speed;
        glorp.y += directionY * glorp.speed;
        
        if (
            glorp.x + glorp.radius > topwall.x &&
            glorp.x - glorp.radius < topwall.x + topwall.width &&
            glorp.y - glorp.radius < topwall.height
        ) {
            glorp.x = prevX;
            glorp.y = prevY;
        }
    
        if (
            glorp.x + glorp.radius > botwall.x &&
            glorp.x - glorp.radius < botwall.x + botwall.width &&
            glorp.y + glorp.radius > botwall.y
        ) {
            glorp.x = prevX;
            glorp.y = prevY;
        }
    
        if (
            glorp.x - glorp.radius < leftwall.width &&
            glorp.y + glorp.radius > leftwall.y &&
            glorp.y - glorp.radius < leftwall.y + leftwall.height
        ) {
            glorp.x = prevX;
            glorp.y = prevY;
        }
    
        if (
            glorp.x + glorp.radius > rightwall.x &&
            glorp.y + glorp.radius > rightwall.y &&
            glorp.y - glorp.radius < rightwall.y + rightwall.height
        ) {
            glorp.x = prevX;
            glorp.y = prevY;
        }

        for (let j = 0; j < glorpArray.length; j++) {
            if (i !== j) {
                const otherGlorp = glorpArray[j];
                const dx2 = otherGlorp.x - glorp.x;
                const dy2 = otherGlorp.y - glorp.y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (distance2 < glorp.radius * 2) {
                    // If too close, move away from the other glorp
                    const awayX = glorp.x - dx2 / distance2 * glorp.speed;
                    const awayY = glorp.y - dy2 / distance2 * glorp.speed;
                    glorp.x = awayX;
                    glorp.y = awayY;
                }
            }
        }
    }
}


function moveStick() {
    for (let i = 0; i < StcikArray.length; i++) {
        const stick = StcikArray[i];
        
        for (let j = 0; j < glorpArray.length; j++) {
            const glorp = glorpArray[j];

            // Calculate the distance between the stick and the glorp
            const dx = stick.x - glorp.x;
            const dy = stick.y - glorp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if the stick collides with the glorp
            if (distance < stick.length / 2 + glorp.radius) {
                glorp.hp -= stick.dmg;
                
                // Remove the stick and glorp if the glorp's HP is depleted
                if (glorp.hp <= 0) {
                    glorpArray.splice(j, 1);
                    enemyleft -= 1;
                    j--;
                }

                // Remove the stick after collision
                StcikArray.splice(i, 1); 
                i--;
                break;
            }
        }

        // Move the stick
        const speedX = Math.cos(stick.rotation) * stick.speed;
        const speedY = Math.sin(stick.rotation) * stick.speed;
        stick.x -= speedX;
        stick.y -= speedY;
    }
}


function debug() {
    document.getElementById("x").innerHTML = player.x;
    document.getElementById("y").innerHTML = player.y;
    document.getElementById("glorbsl").innerHTML = roomswent;
    document.getElementById("rand").innerHTML = roomtype;
}


function gameLoop() {
    if (!gameover) {
        clearCanvas();
        movePlayer();
        updateRotation();
        drawPerks();
        drawPlayer();
        drawSticks();
        drawGlorps();
        drawWalls();
        moveStick();
        moveGlorp();
        drawDoorsp2();
        drawDoorsp1();
        document.getElementById("hp").innerHTML = player.hp;
//        debug();
        requestAnimationFrame(gameLoop); 
    }
}

// Start the game loop
gameLoop();
