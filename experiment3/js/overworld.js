/* exported preload, setup, draw, placeTile */

/* global generateGrid drawGrid */

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.global/dee00f8e-26d5-4625-a77a-62e95c401a6e/tileset.png?v=1713908932265"
  );
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

function setup() {
  numCols = select("#asciiBox").attribute("rows") | 0;
  numRows = select("#asciiBox").attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#reseedButton").mousePressed(reseed);
  select("#asciiBox").input(reparseGrid);

  reseed();
  
  setInterval(birdMove,1000);
}


function draw() {
  randomSeed(seed);
  noiseSeed(seed);
  drawGrid(currentGrid);
  drawPlayer(playerX,playerY);
  drawBird(birdX,birdY);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}


/* exported generateGrid, drawGrid */
/* global placeTile */

let zoom = 0.1;
//let speed = 0.001;
let playerX = 0;
let playerY = 0;
let birdX = 1;
let birdY = 1;
let birdDir = 0;

function generateGrid(numCols, numRows) {
  let spawnable = [];
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      let n = noise(i*zoom,j*zoom);
      n=max(floor(n*10)-1,0);
      row.push(numToTerrain(n))
      //row.push("_");
      if(numToTerrain(n)==='g'){
        spawnable.push([i,j]);
      }
    }
    grid.push(row);
  }
  if(spawnable.length>2){
    let playerSpawn = floor(random(spawnable.length));
    playerX = spawnable[playerSpawn][1];
    playerY = spawnable[playerSpawn][0];
    spawnable.splice(playerSpawn,1);
    let birdSpawn = floor(random(spawnable.length));
    birdX = spawnable[birdSpawn][1];
    birdY = spawnable[birdSpawn][0];
  }
  
  return grid;
}

function drawGrid(grid) {
  background(128);

  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == 'g') {
        placeTile(i, j, (floor(random(4))), 0);
      }
      else if (grid[i][j] == 'd') {
        placeTile(i, j, (floor(random(4))), 3);
      }
      else if (grid[i][j] == 's') {
        placeTile(i, j, (floor(random(4))), 15);
      }
      else if (grid[i][j] == 't') {
        placeTile(i, j, 0, 0);
        
        placeTile(i,j, 14, 0);
      }
      checkNeighbor(i,j,grid);
    }
  }
}

function numToTerrain(n){
  if(n<3){
    return "d";
  }
  else if(n<6){
    if(random(1)<0.05){
      return "t";
    }
    return "g";
  }
  else{
    return "s";
  }
}


function checkNeighbor(i,j,grid){
  let currentTerrain = grid[i][j];
  if(['g','t'].includes(currentTerrain)){
    return;
  }
  //check above
  if(i>0&&['g','t'].includes(grid[i-1][j])){
    placeTile(i, j, 5, 0);
  }
  //below
  if(i+1<numRows&&['g','t'].includes(grid[i+1][j])){
    placeTile(i, j, 5, 2);
  }
  //left
  if(j>0&&['g','t'].includes(grid[i][j-1])){
    placeTile(i, j, 4, 1);
  }
  //right
  if(j+1<numCols&&['g','t'].includes(grid[i][j+1])){
    placeTile(i, j, 6, 1);
  }
}

function drawPlayer(x,y){
  if(int(millis()/800)%2==0){
    placeTile(y,x,0,31)
  }
  else{
    placeTile(y,x,1,31)
  }
  
}
function drawBird(x,y){
  if(birdDir===0){
    placeTile(y,x,3,31)
  }
  else{
    placeTile(y,x,4,31)
  }
}
function birdMove(){
  let dir = floor(random(4));
  console.log(dir);
  let nextY = birdY;
  let nextX = birdX;
  //up
  if(dir==0){
    nextY = (nextY-1)%numRows;
    if(nextY<0){
      nextY+=numRows;
    }
  }
  //down
  if(dir==1){
    nextY = (nextY+1)%numRows;
  }
  //left
  if(dir==2){
    birdDir = 1;
    nextX = (nextX-1)%numCols;
    if(nextX<0){
      nextX+=numCols;
    }
  }
  //right
  if(dir==3){
    birdDir = 0;
    nextX = (nextX+1)%numCols;
  }
  if(currentGrid[nextY][nextX]!='t'){
    birdY=nextY;
    birdX=nextX;
  }
}

function keyPressed(){
  let nextY=playerY;
  let nextX=playerX
  //up
  if(keyCode === 87||keyCode===38){
    nextY = (nextY-1)%numRows;
    if(nextY<0){
      nextY+=numRows;
    }
  }
  //down
  if(keyCode === 83||keyCode===40){
    nextY = (nextY+1)%numRows;
  }
  //left
  if(keyCode === 65||keyCode===37){
    nextX = (nextX-1)%numCols;
    if(nextX<0){
      nextX+=numCols;
    }
  }
  //right
  if(keyCode === 68||keyCode==39){
    nextX = (nextX+1)%numCols;
  }
  if(currentGrid[nextY][nextX]!='t'){
    playerY=nextY;
    playerX=nextX;
  }
}