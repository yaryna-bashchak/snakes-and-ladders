'use strict';

const canvas = document.getElementById('canvas');
const table = document.getElementById('table');
const buttonDice = document.getElementById('dice');
const buttonNewPlayer = document.getElementById('new player');
const lastEvent = document.getElementById('last-event');
const winner = document.getElementById('winner');
const info = document.getElementById('info');
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
  constructor(ctx, cells) {
    this.ctx = ctx;
    this.cells = cells;
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
    const coord = this.cells[`c${this.score}`];
    this.ctx.drawImage(this.image,
      coord.x - this.width / 2,
      coord.y - this.height / 2);
  }

  step() {
    const point = Math.floor(Math.random() * 6) + 1;
    this.score += point;
    this.note(point);
  }

  checkScore() {
    if (this.score > tableSize) {
      const delta = this.score - tableSize;
      this.score = tableSize - delta;
    } else if (this.score === tableSize) {
      buttonDice.onclick = () => {};
      winner.textContent = '🎉Player1 win!';
      info.textContent = '🔁To play again please reload the page';
    }
  }

  note(point) {
    lastEvent.textContent = `Player1: ${point} point(-s)`;
  }

  carry(dict) {
    if (dict.hasOwnProperty(this.score)) {
      info.textContent = this.score + ' => ' + dict[this.score];
      this.score = dict[this.score];
    }
  }
}

//Ladders
const ladders = {
  '2': 12,
  '5': 9,
  '8': 11,
  '14': 21,
  '6': 22,
};

//Snakes
const snakes = {
  '10': 7,
  '23': 16,
  '18': 10,
  '17': 3,
  '13': 4,
};

const counter1 = new Counter(ctx, cells);

buttonDice.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  counter1.step();
  counter1.checkScore();
  counter1.carry(ladders);
  counter1.carry(snakes);
  counter1.draw();
  console.log(counter1.score);
};

buttonNewPlayer.onclick = () => {};
