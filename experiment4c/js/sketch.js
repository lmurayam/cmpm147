"use strict";

/* global p5 */
/* exported preload, setup, draw, mouseClicked */

// Project base code provided by {amsmith,ikarth}@ucsc.edu


let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;

/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i, j];
}

function tileRenderingOrder(offset) {
  return [offset[1] - offset[0], offset[0] + offset[1]];
}

function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
  screen_x -= camera_x;
  screen_y -= camera_y;
  screen_x /= tile_width_step_main * 2;
  screen_y /= tile_height_step_main * 2;
  screen_y += 0.5;
  return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width_step_main * 2);
  let world_y = camera_y / (tile_height_step_main * 2);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}

function worldOffsetToCamera([world_x, world_y]) {
  let camera_x = world_x * (tile_width_step_main * 2);
  let camera_y = world_y * (tile_height_step_main * 2);
  return new p5.Vector(camera_x, camera_y);
}

function preload() {
  if (window.p3_preload) {
    window.p3_preload();
  }
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("container");

  camera_offset = new p5.Vector(-width / 2, height / 2);
  camera_velocity = new p5.Vector(0, 0);

  if (window.p3_setup) {
    window.p3_setup();
  }

  let label = createP();
  label.html("World key: ");
  label.parent("container");

  let input = createInput("xyzzy");
  input.parent(label);
  input.input(() => {
    rebuildWorld(input.value());
  });

  createP("Arrow keys scroll. Clicking changes tiles.").parent("container");

  rebuildWorld(input.value());
}

function rebuildWorld(key) {
  if (window.p3_worldKeyChanged) {
    window.p3_worldKeyChanged(key);
  }
  tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
  tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
  tile_width_step_main = 27.62;
  tile_height_step_main = 23.9;
  tile_columns = Math.ceil(width / (tile_width_step_main * 2));
  tile_rows = Math.ceil(height / (tile_height_step_main * 2));
}

function mouseClicked() {
  let world_pos_normal = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY+yOffsets[[world_pos_normal[0],world_pos_normal[1]]]],
    [camera_offset.x, camera_offset.y]
  );
  if (window.p3_tileClicked) {
    window.p3_tileClicked(world_pos[0], world_pos[1]);
  }
  return false;
}

function draw() {
  // Keyboard controls!
  if (keyIsDown(LEFT_ARROW)) {
    camera_velocity.x -= 1;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    camera_velocity.x += 1;
  }
  if (keyIsDown(DOWN_ARROW)) {
    camera_velocity.y -= 1;
  }
  if (keyIsDown(UP_ARROW)) {
    camera_velocity.y += 1;
  }

  let camera_delta = new p5.Vector(0, 0);
  camera_velocity.add(camera_delta);
  camera_offset.add(camera_velocity);
  camera_velocity.mult(0.95); // cheap easing
  if (camera_velocity.mag() < 0.01) {
    camera_velocity.setMag(0);
  }
  let world_pos_normal = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY+yOffsets[[world_pos_normal[0],world_pos_normal[1]]]],
    [camera_offset.x, camera_offset.y]
  );
  let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

  background(100);

  if (window.p3_drawBefore) {
    window.p3_drawBefore();
  }

  let overdraw = 0.6;

  let y0 = Math.floor((0 - overdraw) * tile_rows);
  let y1 = Math.floor((1 + overdraw) * tile_rows);
  let x0 = Math.floor((0 - overdraw) * tile_columns);
  let x1 = Math.floor((1 + overdraw) * tile_columns);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
        camera_offset.x,
        camera_offset.y
      ]); // odd row
    }
    for (let x = x0; x < x1; x++) {
      drawTile(
        tileRenderingOrder([
          x + .5 + world_offset.x,
          y + .5 - world_offset.y
        ]),
        [camera_offset.x, camera_offset.y]
      );
    }
  }

  describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

  if (window.p3_drawAfter) {
    window.p3_drawAfter();
  }
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
}

function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
  push();
  translate(screen_x, screen_y);
  if (window.p3_drawSelectedTile) {
    window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
  }
  pop();
}

// Draw a tile, mostly by calling the user's drawing code.
function drawTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  push();
  translate(0 - screen_x, screen_y);
  if (window.p3_drawTile) {
    window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
  }
  pop();
}
"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {}

let worldSeed;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 64;
}
function p3_tileHeight() {
  return 32;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};
let yOffsets = {};

let zoom = 0.1;

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {}
let trigger = false
function p3_drawTile(i, j) {
  noStroke();
  let noiseVal = noise(i*zoom,j*zoom);
  let terrainType;
  let colorVal;
  if(noiseVal<.5){
    terrainType = 'water';
    colorVal = color(0,map(noiseVal,0,1,20,100),map(noiseVal,0,1,50,255));
    fill(colorVal);
  }
  else{
    terrainType = 'basalt'
    let n = clicks[[i, j]] | 0;
    let randomPercent = (XXH.h32("tile:" + [i, j] + n, worldSeed) % 100)/100
    colorVal = lerpColor(color('grey'), color(87, 51, 0), randomPercent);
    fill(colorVal);
  }
  
  push();
  
  //https://www.quora.com/How-can-you-find-the-coordinates-in-a-hexagon
  beginShape();

  for (let i = 0; i < 6; i++) {
    let angle = radians(360/6)*i + radians(30);
    let x = cos(angle) * (tw/2);
    let y = sin(angle) * (th/2);
    vertex(x, y);
  }
  endShape(CLOSE);
  
  let yOffset=0;
  
  if(terrainType=='basalt'){
    yOffset += pow(map(noiseVal,0,1,0,20),2)
    extrude_tile(yOffset,colorVal);
  }
  if(terrainType=='water'){
    yOffset += map(noiseVal,0,0.5,0,1) + (sin((millis()/500)+XXH.h32("tile:" + [i, j], worldSeed) % 4)*2)+2 
    extrude_tile(yOffset,colorVal);
  }
  
  
  
  yOffsets[[i,j]] = yOffset;
  
  translate(0,-yOffset);

  pop();
}

function extrude_tile(length,colorVal){
  beginShape();
  fill(colorVal);
  for (let i = 0; i < 6; i++) {
    let angle = radians(360/6)*i + radians(30);
    let newX = cos(angle) * (tw/2);
    let newY = sin(angle) * (th/2);
    vertex(newX, newY-length);
  }
  endShape(CLOSE);
  let angle;
  let x,y;
  beginShape();
  fill(modifyColor(colorVal,.2,1));
  angle = radians(360) + radians(30);
  x = cos(angle) * (tw/2);
  y = sin(angle) * (th/2);
  vertex(x, y);
  vertex(x, y-length);
  angle = radians(360/6) + radians(30);
  x = cos(angle) * (tw/2);
  y = sin(angle) * (th/2);
  vertex(x, y-length);
  vertex(x, y);
  endShape(CLOSE);
  
  beginShape();
  fill(modifyColor(colorVal,.2,0));
  angle = radians(360/6) + radians(30);
  x = cos(angle) * (tw/2);
  y = sin(angle) * (th/2);
  vertex(x, y-length);
  vertex(x, y);
  angle = radians(360/6)*2 + radians(30);
  x = cos(angle) * (tw/2);
  y = sin(angle) * (th/2);
  vertex(x, y);
  vertex(x, y-length);
  endShape(CLOSE);
}

function p3_drawSelectedTile(i, j) {
  push();
  translate(0,-yOffsets[[i,j]]);
  noFill();
  stroke(0, 255, 0);
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = radians(360/6)*i + radians(30);
    let newX = cos(angle) * (tw/2);
    let newY = sin(angle) * (th/2);
    vertex(newX, newY);
  }
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
  pop();
}

function p3_drawAfter() {}

function modifyColor(col, factor, type) {
  let r = red(col);
  let g = green(col);
  let b = blue(col);
  
  if(type==0){
    r = min(255, r + 255 * factor);
    g = min(255, g + 255 * factor);
    b = min(255, b + 255 * factor);
  }
  else{
    r *= (1 - factor);
    g *= (1 - factor);
    b *= (1 - factor);
  }
  
  return color(r, g, b);
}
