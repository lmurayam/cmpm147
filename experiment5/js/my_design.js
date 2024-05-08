/* exported getInspirations, initDesign, renderDesign, mutateDesign */


function getInspirations() {
  return [
    {
      name: "Girl with a Pearl Earring", 
      assetUrl: "https://cdn.glitch.global/f7f6faf0-2078-494c-b7a7-f0bd88690fe4/1665_Girl_with_a_Pearl_Earring.jpg?v=1715104127177",
      credit: "Johannes Vermeer, 1665"
    },
    {
      name: "The Starry Night", 
      assetUrl: "https://cdn.glitch.global/f7f6faf0-2078-494c-b7a7-f0bd88690fe4/The-Starry-Night-1200x630-1.jpg?v=1715122335701",
      credit: "Vincent van Gogh, 1889"
    },
    {
      name: "Migrant West", 
      assetUrl: "https://cdn.glitch.global/f7f6faf0-2078-494c-b7a7-f0bd88690fe4/west.jpg?v=1715122618872",
      credit: "Anonymous/Unknown"
    },
    {
      name: "Mona Lisa", 
      assetUrl: "https://cdn.glitch.global/f7f6faf0-2078-494c-b7a7-f0bd88690fe4/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg?v=1715124491647",
      credit: "Leonardo da Vinci, 1503"
    },
    {
      name: "Test", 
      assetUrl: "https://cdn.glitch.global/f7f6faf0-2078-494c-b7a7-f0bd88690fe4/test.jpg?v=1715113239465",
      credit: ""
    },
  ];
}

function initDesign(inspiration) {
  let maxArea = canvasSize;
  let currentArea = inspiration.image.width*inspiration.image.height;
  if (currentArea > maxArea) {
    let ratio = sqrt(maxArea / currentArea);
    let newWidth = round(inspiration.image.width * ratio);
    let newHeight = round(inspiration.image.height * ratio);
    resizeCanvas(newWidth, newHeight);
  }
  let img = inspiration.image.get();
  img.loadPixels();
  
  let c = calculateAverageColor(img.pixels, 0, 0, img.width, img.height);
  let design = {
    bg: [red(c),green(c),blue(c)],
    fg: [],
  }
  
  
  for(let i = 0; i < 100; i++) {
    design.fg.push({x: random(width),
                    y: random(height),
                    w: random(width),
                    h: random(height),
                    l: 1                   
                   })
  }
  for(let i = 0; i < 500; i++) {
    design.fg.push({x: random(width),
                    y: random(height),
                    w: random(width/5),
                    h: random(height/5),
                    l: 5                   
                   })
  }
  for(let i = 0; i < 1000; i++) {
    design.fg.push({x: random(width),
                    y: random(height),
                    w: random(width/10),
                    h: random(height/10),
                    l: 10                  
                   })
  }

  
  return design;
}

function renderDesign(design, inspiration) {
  
  background(design.bg);
  noStroke();
  for(let box of design.fg) {
    fill(calculateAverageColor(currentInspirationPixels, box.x, box.y, box.w, box.h));
    rect(box.x, box.y, box.w, box.h);
  }
}

function mutateDesign(design, inspiration, rate) {
  for(let box of design.fg) {
    box.x = mut(box.x, 0, width, rate);
    box.y = mut(box.y, 0, height, rate);
    box.w = mut(box.w, 0, width/box.l, rate);
    box.h = mut(box.h, 0, height/box.l, rate);
  }
}


function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}

function calculateAverageColor(imgPixels,x, y, w, h) {
  
  x = round(constrain(x, 0, width - 1));
  y = round(constrain(y, 0, height - 1));
  w = round(min(w, width - x));
  h = round(min(h, height - y));
  
  let totalPixels = 0;
  let totalR = 0;
  let totalG = 0; 
  let totalB = 0;
  
  for (let i = x; i < x + w; i++) {
    for (let j = y; j < y + h; j++) {
      let loc = (i + j * width) * 4;
      let r = imgPixels[loc];
      let g = imgPixels[loc + 1]; 
      let b = imgPixels[loc + 2]; 
      
      totalR += r;
      totalG += g;
      totalB += b;
      
      totalPixels++; 
    }
  }
  
  let avgR = totalR / totalPixels;
  let avgG = totalG / totalPixels;
  let avgB = totalB / totalPixels;  
  
  return color(avgR,avgG,avgB);
}
