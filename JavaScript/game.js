'use strict';

const canvas = document.getElementById('canvas');
const table = document.getElementById('table');
const button = document.getElementById('button');
const tablePosition = table.getBoundingClientRect();
const ctx = canvas.getContext('2d');

//import counter images
const counterImages = [];
for (let i = 1; i <= 10; i++) {
  const counter = new Image();
  counter.src = `counter-images/counter${i}.png`;
  counterImages.push(counter);
}
const counterW = 41;
const counterH = 70;

//calculate cell centers
const cells = {};
const tableSize = 25;
for (let i = 1; i <= tableSize; i++) {
  const element = document.getElementById(i);
  const position = element.getBoundingClientRect();
  //x,y - cell center coordinates
  const x = (position.left + position.right) / 2 - tablePosition.left;
  const y = (position.top + position.bottom) / 2 - tablePosition.top;
  cells[`c${i}`] = { x, y };
}

class Counter {
  constructor() {
    this.score = 1;
    this.number = Math.floor(Math.random() * counterImages.length);
    this.image = counterImages[this.number];
    this.draw();
  }
  draw() {
    this.image.onload = () =>
      ctx.drawImage(this.image,
        cells.c1.x - counterW / 2,
        cells.c1.y - counterH / 2);
  }
  step() {
    this.score += Math.floor(Math.random() * 6) + 1;
    const coord = cells[`c${this.score}`];
    this.image.onload = () =>
      ctx.drawImage(this.image,
        coord.x - counterW / 2,
        coord.y - counterH / 2);
  }
}

const counter1 = new Counter();
counter1.step();
console.log('1:' + counter1.score);
counter1.step();
console.log('2:' + counter1.score);
