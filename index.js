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
ctx.canvas.width = mapSize*32;
ctx.canvas.height = mapSize*32;
document.querySelector("#size").addEventListener("input", () => {
    mapSize = document.querySelector("#size").value;
    
    ctx.canvas.width = mapSize*32;
    ctx.canvas.height = mapSize*32;
    reset();
    generate();

});
document.querySelector("#difficulty").addEventListener("input", () => {
    difficulty = 100 -document.querySelector("#difficulty").value;
    reset();
    generate();

});
function reset() {
    lost = false;
    firstMove = true;
    document.querySelector("#title").textContent = "Saper!";

    generate();
}

function generate() {
    for (let y=0; y<mapSize; y++) {
        map[y] = [];
        viewableMap[y] = [];
        for (let x=0; x<mapSize; x++) {
            map[y][x] = Math.round(Math.random()*100)-1;
            map[y][x] = map[y][x]<difficulty ? 0 : 1;
            viewableMap[y][x] = false;
            ctx.beginPath();
            ctx.rect(32*x, 32*y, 32,32);
            ctx.fillStyle = "gray";
            if (showAll)
                ctx.fillStyle =  map[y][x]<difficulty ? "green" : "red";
            ctx.fill();        
        }
    }
}
generate()

function between(x, min, max) {
  return x >= min && x < max;
}
function isBomb(val) {
    return val==1;
}
function markBombCount(mapX, mapY) {
  const rows = map.length;
  const cols = map[0].length;
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      // skip the cell itself
      if (dx === 0 && dy === 0) continue;

      const nx = mapX + dx;
      const ny = mapY + dy;

      // skip out-of-bounds neighbors
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;

      // if it’s a bomb (>= difficulty), increment
      if (map[ny][nx] >= difficulty) {
        count++;
      }
    }
  }

  return count;
}
function checkAreAllBombsMarked() {
    for (let y=0; y<mapSize; y++) {
        for (let x=0; x<mapSize; x++) {
            if (viewableMap[y][x] == false) {
                console.log("x " + x + "y " + y + "is unchecked");
                return false;
            }
            if (viewableMap[y][x] != 2 && viewableMap[y][x] != true && isBomb(map[y][x])) {
                console.log(`X ${x} Y ${y} is ${viewableMap[y][x]} and isBomb=${isBomb(map[y][x])}`)
                return false;
            }
        }
    }
    console.log("OK")
    document.querySelector("#title").textContent = "Saper - WYGRANA!";
    return true;
}
function refresh() {
    for (let y=0; y<mapSize; y++) {
        for (let x=0; x<mapSize; x++) {
            ctx.beginPath();
            ctx.rect(32*x, 32*y, 32,32);
            if (viewableMap[y][x] == true || showAll == true) {
                ctx.fillStyle = map[y][x]<difficulty ? "green" : "red";
                map[y][x] = map[y][x]<difficulty ? 0 : 1;
                ctx.fill();
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.fillText(markBombCount(x,y),32*x+10,32*y+24);
            } else if (viewableMap[y][x] == 2) {
                ctx.fillStyle = "orange";
                ctx.fill(); 
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.fillText("B",32*x+10, 32*y+24);
            } else {
                ctx.fillStyle = "gray";
                ctx.fill(); 
            }
                   
        }
    }
    checkAreAllBombsMarked()
    
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function massOpenAnimated(startX, startY, delay = 50) {
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
    if (map[y][x] >= difficulty) continue;
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
}

canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }




async function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    console.log("Coordinate x: " + x,
        "Coordinate y: " + y);
    let mapX = Math.floor(x/32);
    let mapY = Math.floor(y/32);
    if (event.button == 2 && !firstMove) {
        viewableMap[mapY][mapX] = viewableMap[mapY][mapX] == 2 ? false : 2;
        refresh();
        return;
    }

    if (isBomb(map[mapY][mapX]) && !firstMove) {
        // lost.
            document.querySelector("#title").textContent = "Saper - PRZEGRANA!";
        viewableMap[mapY][mapX] = true;
        refresh();
        lost = true;
    }
    if (firstMove) {
        // first move cannot be bomb;
        map[mapY][mapX] = 0;
        firstMove = false;
    }

    viewableMap[mapY][mapX] = false;
    if (viewableMap[mapY][mapX] == false) {
        console.log("cell is closed, opening!");
        await massOpenAnimated(mapX, mapY, 10);
    } else {
        viewableMap[mapY][mapX] = true;
        refresh();
    }
    
    let finished = checkAreAllBombsMarked();
    if (finished) {
        document.querySelector("#title").textContent = "Saper - WYGRANA!";
    }
    
    console.log(map[mapY][mapX]<difficulty ? "green" : "red");
}
canvas.addEventListener("mousedown", async (e) => {
    if(lost)return;
    await getMousePosition(canvas, e);
    
})