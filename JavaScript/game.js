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

const tableWidth = 10;
const tableHeight = tableWidth;
const tableSize = tableWidth * tableHeight;

const createTable = (width, height) => {
  for (let i = 0; i < height; i++) {
    const row = document.createElement('tr');
    const maxNumber = (height - i) * width;
    for (let j = 0; j < width; j++) {
      const cell = document.createElement('th');
      let current = maxNumber;
      current += (i % 2 === 0) ? -j : (j - width + 1);
      cell.textContent = current;
      cell.setAttribute('id', current);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
};



//calculate cell centers

const calcMiddle = (begin, end, cell, table) =>
  (cell[begin] + cell[end]) / 2 - table[begin];

const calcCellCenters = size => {
  const obj = {};
  for (let i = 1; i <= size; i++) {
    const position = document.getElementById(i).getBoundingClientRect();
    //x,y - cell center coordinates
    const x = calcMiddle('left', 'right', position, tablePosition);
    const y = calcMiddle('top', 'bottom', position, tablePosition);
    obj[i] = { x, y, height: position.height };
  }
  return obj;
};



const random = max => Math.floor(Math.random() * max) + 1;

//class Counter - фішка

class Counter {
  constructor(ctx, cells) {
    this.ctx = ctx;
    this.cells = cells;
    this.score = 1;
    this.number = random(10);
  }

  set number(i) {
    this.image = new Image();
    this.image.src = `counter-images/counter${i}.png`;
    this.image.onload = () => {
      this.height = this.cells['1'].height * 0.8;
      const k = this.height / this.image.naturalHeight;
      this.width = this.image.naturalWidth * k;
      this.draw();
    };
  }

  draw() {
    const coord = this.cells[this.score];
    this.ctx.drawImage(
      this.image,
      coord.x - this.width / 2,
      coord.y - this.height / 2,
      this.width,
      this.height,
    );
  }

  step() {
    const point = random(6);
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
  '2': 36,
  '12': 53,
  '23': 60,
  '45': 82,
  '65': 94,
  '6': 25,
  '37': 56,
  '76': 99,
  '68': 92,
  '14': 49,
  'color': '#0db036',
  draw(ctx, cells) {
    const drawLine = key => {
      ctx.beginPath();
      ctx.moveTo(cells[key].x, cells[key].y);
      ctx.lineTo(cells[this[key]].x, cells[this[key]].y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.stroke();
    };
    Object.keys(this)
      .filter(key => typeof this[key] === 'number')
      .forEach(drawLine);

  },
};

//Snakes
const snakes = {
  '58': 21,
  '75': 54,
  '84': 62,
  '93': 72,
  '80': 43,
  '13': 4,
  '88': 66,
  '50': 27,
  '86': 74,
  '19': 3,
  'color': '#d66519',
};

snakes.draw = ladders.draw.bind(snakes);

//draw the starting field

createTable(tableWidth, tableHeight);
const cells = calcCellCenters(tableSize);
const counter1 = new Counter(ctx, cells);
ladders.draw(ctx, cells);
snakes.draw(ctx, cells);

//event listeners

buttonDice.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  counter1.step();
  counter1.checkScore();
  counter1.carry(ladders);
  counter1.carry(snakes);
  ladders.draw(ctx, cells);
  snakes.draw(ctx, cells);
  counter1.draw();
  console.log(counter1.score);
};

buttonNewPlayer.onclick = () => {};
