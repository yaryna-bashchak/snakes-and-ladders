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
  cells[i] = { x, y, height: position.height };
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
      this.height = this.cells['1'].height * 0.8;
      const k = this.height / this.image.naturalHeight;
      this.width = this.image.naturalWidth * k;
      this.draw();
    };
  }

  draw() {
    const coord = this.cells[this.score];
    this.ctx.drawImage(this.image,
      coord.x - this.width / 2,
      coord.y - this.height / 2,
      this.width, this.height);
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
  '2': 36,
  '12': 53,
  '23': 60,
  '45': 82,
  '65': 94,
  '34': 46,
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
  'color': '#d66519',
};

snakes.draw = ladders.draw.bind(snakes);

const counter1 = new Counter(ctx, cells);
ladders.draw(ctx, cells);
snakes.draw(ctx, cells);

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
