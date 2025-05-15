console.log("aaaa");
let canvas = document.querySelector("#canvas1");
let ctx = canvas.getContext("2d");
// 128x128 map
const difficulty = 60;
let firstMove = true;
let map = [];
for (let y=0; y<20; y++) {
    map[y] = [];
    for (let x=0; x<20; x++) {
        map[y][x] = Math.round(Math.random()*100)-1;
        ctx.beginPath();
        ctx.rect(32*x, 32*y, 32,32);
        ctx.fillStyle =  map[y][x]<difficulty ? "green" : "red";
        ctx.fill();        
    }
}
function refresh() {
    for (let y=0; y<20; y++) {
        for (let x=0; x<20; x++) {
            ctx.beginPath();
            ctx.rect(32*x, 32*y, 32,32);
            ctx.fillStyle =  map[y][x]<difficulty ? "green" : "red";
            ctx.fill();        
        }
    }
}
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    console.log("Coordinate x: " + x,
        "Coordinate y: " + y);
    let mapX = Math.floor(x/32);
    let mapY = Math.floor(y/32);
    if (firstMove) {
        map[mapY][mapX] = 0;
        firstMove = false;
    }

    
    console.log(map[mapY][mapX]<difficulty ? "green" : "red");
}
canvas.addEventListener("mousedown", (e) => {
    getMousePosition(canvas, e);
    refresh();
})