// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

let inc = 0.01;
let seed = 0;
let trees;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  generateTrees();
  $("#reimagine").click(() => {
    seed++;
    noiseSeed(seed);
    //randomSeed(seed);
    generateTrees();
    
  });
  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

function draw() {
  background(color('lightblue'));
  
  drawSun(mouseX,mouseY);
  
  drawMountain(color('white'),0);
  drawMountain(color('grey'),10);
  drawGrass();
  drawRoad(color("black"));
  seed += 0.001;
  
  for (let i = 0; i < trees.length; i++) {
    let looop = (millis() / 8500.0)%1;
    drawTree(trees[i][0]+width*looop,trees[i][1],trees[i][2])
  }
}

function drawSun(x,y){
  fill(color("yellow"));
  circle(x,y,30);
}

function drawMountain(color, yoffset){
  fill(color);
  beginShape();
  vertex(0, height);
  let xoff = seed;
  for (let x = 0; x < width; x++) {
    let y = (noise(xoff) * height  +yoffset);
    noStroke();
    vertex(x, y);
    
    xoff -= inc;
  }
  vertex(width, height);
  endShape(CLOSE);
}

function drawGrass(){
  fill(color("green"));
  rect(0,height*4/7,width,height);
}

function drawRoad(){
  fill(0);
  rect(0,height*3/4,width,height);
  drawRoadColors();
  fill(color("moccasin"));
  rect(0,height*9/10,width,height);
}

function drawRoadColors(){
  fill(color("yellow"))
  let looop = (millis() / 1000.0) % 1;
  let speed = 10
  for (let i = 0; i < speed*3; i++) {
    drawRoadRect((i-speed)+speed*looop);
  }
}

function drawRoadRect(x){
  let midRoad = (height*3/4 + height*9/10)/2
  let size = width/40;
  rect((x*size*4)-size*4,midRoad-size/2,size*2,size);
}

function drawTree(x,y,layers){
  fill(color("darkgreen"));
  let size = width/20;
  let lx = x;
  let ly = y;
  
  for (let i = 0; i < layers; i++) {
    ly=y-i*10
    if(lx>width){
      lx-=width;
    }
    triangle(lx,ly,lx+size/2,ly-size,lx+size,ly);
  }
}

function generateTrees(){
  let max = height*4/7;
  let min = height*3/4;
  let numTrees = random(3,6);
  trees = []
  for (let i = 0; i < numTrees; i++) {
    append(trees,[random(0,width),random(max,min),random(2,3)]);
  }
}