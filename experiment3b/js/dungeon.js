/* exported preload, setup, draw, placeTile */

/* global generateGrid drawGrid */

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.global/45825b76-e997-46b8-9cf7-1e88866567af/tileset.png?v=1713916682213"
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
}


function draw() {
  randomSeed(seed);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}


let rooms = [];
function generateGrid(numCols, numRows) {
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("_");
    }
    grid.push(row);
  }
  rooms = [];
  let numRooms = floor(random(3,7));
  for (let i = 0; i < numRooms; i++) {
    let tries = 0;
    while(tries<3){
      if(generateRoom(grid, numCols, numRows, rooms)){
        break
      }
      tries += 1;
    }
  }
  generateCoriddors(grid,rooms);
  return grid;
}

function generateRoom(grid, numCols, numRows, rooms){
  let width = floor(random(5,10));
  let height = floor(random(5,10));

  let topLeftH = numRows-height;
  let topLeftW = numCols-width;
  let topLeft=[floor(random(topLeftH)),floor(random(topLeftW))]

  for(let i = 0; i <rooms.length; i++){
    if(calcOverlap(rooms[i],[topLeft[0],topLeft[1],topLeft[0]+height,topLeft[1]+width])){
      return false;
    }
  }

  for(let h = 0; h < height; h ++){
    for(let w = 0; w < width; w ++){
      let coord = [h+topLeft[0],w+topLeft[1]];
      if(h==0||w==0||h+1==height||w+1==width){
        grid[coord[0]][coord[1]]='f'
      }
      else{grid[coord[0]][coord[1]]='f'}
    }
  }
  rooms.push([topLeft[0],topLeft[1],topLeft[0]+height,topLeft[1]+width])
  return true;
}

function calcOverlap(rect1,rect2){
  if(rect1[1]>rect2[3]||rect2[1]>rect1[3]){
    return false;
  }
  if(rect1[0]>rect2[2]||rect2[0]>rect1[2]){
    return false;
  }
  return true;
}

function generateCoriddors(grid,rooms){
  if(rooms.length==1){
    return;
  }
  else{
    let mainRoom = rooms[0]
    let midPoint = [floor((mainRoom[0]+mainRoom[2])/2),floor((mainRoom[1]+mainRoom[3])/2)]
    for (let i = 1; i< rooms.length; i++){
      let otherRoom = rooms[i];
      let otherMidPoint = [floor((otherRoom[0]+otherRoom[2])/2),floor((otherRoom[1]+otherRoom[3])/2)];
      let mid;
      mid = [midPoint[0],otherMidPoint[1]]
      for(let x = 0; x<numCols;x++){
        if ((x >= min(midPoint[1], otherMidPoint[1])) && (x <= max(midPoint[1], otherMidPoint[1]))) {
          grid[midPoint[0]][x]='f';
        }
      }
      for(let y = 0; y<numRows;y++){
        if ((y >= min(midPoint[0], otherMidPoint[0])) && (y <= max(midPoint[0], otherMidPoint[0]))) {
          grid[y][otherMidPoint[1]]='f';
        }
      }
      grid[mid[0]][mid[1]] = 'f'
    }
  }
}

function changeValuesInRange(row, x, y) {
  if (y > x) {
    let temp = x;
    x = y;
    y = temp;
  }

  for (let i = 0; i < row.length; i++) {
    if (row[i] >= x && row[i] <= y) {
      row[i] = 'f';
    }
  }
}

function drawGrid(grid) {
  background(128);

  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      if (gridCheck(grid,i,j,'_')){
        drawContext(grid,i,j,'_',0);
      }
      if (gridCheck(grid,i,j,'f')){
        let gc = gridCode(grid,i,j,'_');
        drawContext(grid,i,j,'f',gc);
      }
    }
  }
}

function drawSkeleton(i,j){
  if(int(millis()/800)%2==0){
    placeTile(i,j,6,31)
  }
  else{
    placeTile(i,j,7,31)
  } 
}


function gridCheck(grid,i,j,target){
  if(i<grid.length&&j<grid[0].length){
    if(grid[i][j]== target){
      return true;
    }
  }
  return false;
}

function gridCode(grid,i,j,target){
  //check above
  let numRows=grid.length;
  let numCols=grid[0].length;
  let code = 0;
  if(i>0&&[target].includes(grid[i-1][j])||i==0){
    code |= 1; //set first bit
  }
  //below
  if(i+1<numRows&&[target].includes(grid[i+1][j])){
    code |= (1<<2); //set third bit
  }
  //left
  if(j>0&&[target].includes(grid[i][j-1])){
    code |= (1<<1); //set second bit
  }
  //right
  if(j+1<numCols&&[target].includes(grid[i][j+1])){
    code |= (1<<3); //set fourth bit
  }
  return code;
}

function drawContext(grid,i,j,target, code){
  if(target=='_'){
    placeTile(i,j, 21+floor(random(4)), 21);
  }
  if(target=='f'){
    placeTile(i,j, 1+floor(random(4)),22+floor(random(3)));
    if(code==0){
      if(random(1)<.02){
        placeTile(i,j, floor(random(5)),28+floor(random(3)));
      }
      else{
        if(random(1)<.1){
          drawSkeleton(i,j);
        }
      }
    }
    if(code==1){
      placeTile(i,j, 16,21);
    }
    if(code==2){
      placeTile(i,j, 15,22);
    }
    if(code==3){
      placeTile(i,j, 15,21);
    }
    if(code==4){
      placeTile(i,j, 16,23);
    }
    if(code==6){
      placeTile(i,j, 15,23);
    }
    if(code==8){
      placeTile(i,j, 17,22);
    }
    if(code==9){
      placeTile(i,j, 17,21);
    }
    if(code==12){
      placeTile(i,j, 17,23);
    }
  }
}

