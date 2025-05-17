console.log("aaaa");
let canvas = document.querySelector("#canvas1");
let ctx = canvas.getContext("2d");

let difficulty = 60;
let firstMove = true;
let map = [];
let viewableMap = [];
let showAll = false;
let mapSize = 10;
let lost = false;
let canChange = true;
ctx.canvas.width = mapSize*32;
ctx.canvas.height = mapSize*32;



document.querySelector("#size").addEventListener("input", () => {
    if (canChange == false) return;
    mapSize = document.querySelector("#size").value;
    
    ctx.canvas.width = mapSize*32;
    ctx.canvas.height = mapSize*32;
    reset();
    generate();

});
document.querySelector("#difficulty").addEventListener("input", () => {
    if (canChange == false) return;
    difficulty = 100 - document.querySelector("#difficulty").value;
    reset();
});
function lostCondition() {
    for (let y=0; y<mapSize; y++) {
        for (let x=0; x<mapSize; x++) {
            let color;
            if (isBomb(map[y][x]) && viewableMap[y][x] == 2) color = "orange"
            else if (isBomb(map[y][x])) color = "red";
            else if (viewableMap[y][x] == 2) color = "gray";
            else color = "green";

            drawCell(x,y, color);

     
        }
    }
}
function reset() {
    lost = false;
    firstMove = true;
    canChange = true;
    document.querySelector("#title").textContent = "Saper";
    generate();
}

function generate() {
    for (let y=0; y<mapSize; y++) {
        map[y] = [];
        viewableMap[y] = [];
        for (let x=0; x<mapSize; x++) {
            map[y][x] = (Math.round(Math.random()*100)-1)<difficulty ? 0 : 1;
            viewableMap[y][x] = false;
            drawCell(x,y);
        }
    }
}


function isBomb(val) {
    return val==1;
}
// chatgpt
function markBombCount(mapX, mapY) {
  const rows = map.length;
  const cols = map[0].length;
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {

        if (dx === 0 && dy === 0) continue;

      const nx = mapX + dx;
      const ny = mapY + dy;

      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;

      if (isBomb(map[ny][nx])) {
        count++;
      }
    }
  }

  return count;
}
function checkAreAllBombsMarked() {
    for (let y=0; y<mapSize; y++) {
        for (let x=0; x<mapSize; x++) {
            if (viewableMap[y][x] == false) 
                return false;
            if (viewableMap[y][x] == 2 && !isBomb(map[y][x]))
                return false;
        }
    }
    document.querySelector("#title").textContent = "Saper - WYGRANA!";
    return true;
}
function drawCell(x, y, forceColor="none") {
    ctx.beginPath();
    ctx.rect(32*x, 32*y, 32, 32);
    ctx.strokeStyle = "#black"
    let text = "";
    if (viewableMap[y][x] == true) {
        ctx.fillStyle = map[y][x]==0 ? "green" : "red";
        text = markBombCount(x,y);
    }
    else if (viewableMap[y][x] == 2) {// marked as bomb
        ctx.fillStyle = "blue";
        text = "B";
    } else if(viewableMap[y][x] == false) {
        ctx.fillStyle = "gray";
        text = "";
    }

    if (map[y][x] == 1 && text!="B") 
        text = ""; // hide bomb count when cell is bomb
    if (forceColor != "none") 
        ctx.fillStyle = forceColor;

    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(text,32*x+10,32*y+24);
    ctx.stroke();
}
function refresh() {
    for (let y=0; y<mapSize; y++) 
        for (let x=0; x<mapSize; x++) 
           drawCell(y,x);
         
    checkAreAllBombsMarked()
    
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// chatgpt
async function massOpenAnimated(startX, startY, delay = 50) {
    canChange= false;
  const rows = viewableMap.length;
  const cols = viewableMap[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack   = [[startX, startY]];
  const reveal  = [];
  const dirs    = [
    [ 0, -1], // up
    [ 0,  1], // down
    [-1,  0], // left
    [ 1,  0], // right
  ];

  // Build the list of all non-bomb cells reachable
  while (stack.length) {
    const [x, y] = stack.pop();
    if (
      x < 0 || x >= cols ||
      y < 0 || y >= rows ||
      visited[y][x]
    ) continue;
    visited[y][x] = true;
    // Skip bombs
    if (isBomb(map[y][x]) || viewableMap[y][x]==2) continue;
    // Record for later reveal
    reveal.push([x, y]);
    // Enqueue neighbors
    for (const [dx, dy] of dirs) {
      stack.push([x + dx, y + dy]);
    }
  }

  // Animate the reveal list in order
  for (const [x, y] of reveal) {
    viewableMap[y][x] = true;
    refresh();
    await new Promise(r => setTimeout(r, delay));
  }
  canChange = true;
}





async function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();   
    let mapX = Math.floor((event.clientX - rect.left)/32);
    let mapY = Math.floor((event.clientY - rect.top)/32);

    if (event.button == 2 && !firstMove) { // toggle bomb flag.
        viewableMap[mapY][mapX] = viewableMap[mapY][mapX] == 2 ? false : 2;
        refresh();
        return;
    }

    
    if (firstMove) {
        // first move cannot be bomb;
        map[mapY][mapX] = 0;
        firstMove = false;
    }

    viewableMap[mapY][mapX] = false;
    if (viewableMap[mapY][mapX] == false) {
        await massOpenAnimated(mapX, mapY, 10);
    } else {
        viewableMap[mapY][mapX] = true;
        
    }
    refresh();
    if (isBomb(map[mapY][mapX]) && !firstMove) { // lost.
        document.querySelector("#title").textContent = "Saper - PRZEGRANA!";
        viewableMap[mapY][mapX] = true;
        refresh();
        lost = true;
        lostCondition();
        return;
    }
    if (checkAreAllBombsMarked()) { // win.
        canChange = false;
    }
    
}

// disable right click menu on canvas
canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }

// action when clicking canvas
canvas.addEventListener("mousedown", async (e) => {
    if(lost || !canChange)return;
    await getMousePosition(canvas, e);
    
})
// start.
generate(); 