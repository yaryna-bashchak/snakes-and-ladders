'use strict';

const canvas = document.getElementById('canvas');
const table = document.getElementById('table');
const button = document.getElementById('button');
const tablePosition = table.getBoundingClientRect();
const ctx = canvas.getContext('2d');

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
    this.number = Math.floor(Math.random() * 10) + 1;
  }
  set number(i) {
    this.image = new Image();
    this.image.src = `counter-images/counter${i}.png`;
    this.image.onload = () => {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
      this.draw();
    };
  }
  draw() {
    const coord = cells[`c${this.score}`];
    ctx.drawImage(this.image,
      coord.x - this.width / 2,
      coord.y - this.height / 2);
  }
  step() {
    this.score += Math.floor(Math.random() * 6) + 1;
    this.draw();
  }
}

const counter1 = new Counter();

button.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  counter1.step();
  console.log(counter1.score);
};
