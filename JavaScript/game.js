'use strict';

const canvas = document.getElementById('canvas');
const table = document.getElementById('table');
const button = document.getElementById('button');
const tablePosition = table.getBoundingClientRect();
const ctx = canvas.getContext('2d');

//table creation
const tableWidth = 5;
const tableSize = Math.pow(tableWidth, 2);
for (let i = 0; i < tableWidth; i++) {
  const row = document.createElement('tr');
  const maxNumber = (tableWidth - i) * tableWidth;
  for (let j = 0; j < tableWidth; j++) {
    const cell = document.createElement('th');
    let current = maxNumber;
    if (i % 2 === 0) {
      current -= j;
    } else {
      current += -tableWidth + j + 1;
    }
    cell.textContent = current;
    cell.setAttribute('id', current);
    row.appendChild(cell);
  }
  table.appendChild(row);
}

//calculate cell centers
const cells = {};
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
    this.checkScore();
    this.draw();
  }
  checkScore() {
    if (this.score > tableSize) {
      const delta = this.score - tableSize;
      this.score = tableSize - delta;
    } else if (this.score === tableSize) {
      button.onclick = () => {};
      alert('You win!');
      alert('To play again please reload the page');
    }
  }
}

const counter1 = new Counter();

button.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  counter1.step();
  console.log(counter1.score);
};
