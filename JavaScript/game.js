'use strict';

const canvas = document.getElementById('canvas');
const table = document.getElementById('table');
const buttonDice = document.getElementById('dice');
const buttonNewPlayer = document.getElementById('new player');
const lastEvent = document.getElementById('last-event');
const winner = document.getElementById('winner');
const info = document.getElementById('info');
const playersListDiv = document.getElementById('list-of-players');
const tablePosition = table.getBoundingClientRect();
const ctx = canvas.getContext('2d');

//table creation

const tableWidth = 10;
const tableHeight = tableWidth;
const tableSize = tableWidth * tableHeight;
const nLadders = Math.floor(0.1 * tableSize);
const nSnakes = nLadders;

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
    obj[i] = { x, y, height: position.height, isUsed: false };
  }
  return obj;
};



const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomNotUsed = (min, max, obj) => {
  let result;
  while (!result) {
    const x = random(min, max);
    if (obj[x].isUsed === false) {
      obj[x].isUsed = true;
      result = x;
    }
  }
  return result;
};

const rightQueue = (x, y, isFirstSmaller) => {
  if (((x < y) && isFirstSmaller) || ((x > y) && !isFirstSmaller))
    return [x, y];
  return [y, x];
};

//class Counter - фішка

class Counter {
  constructor(ctx, cells, number, i) {
    this.ctx = ctx;
    this.cells = cells;
    this.score = 1;
    this.number = number;
    this.name = prompt('Please enter your name', `Player${i}`);
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
    const points = random(1, 6);
    this.score += points;
    return points;
  }

  checkScore() {
    if (this.score > tableSize) {
      const delta = this.score - tableSize;
      this.score = tableSize - delta;
    } else if (this.score === tableSize) {
      buttonDice.onclick = () => gameOver(this.name);
      buttonNewPlayer.onclick = () => gameOver(this.name);
      winner.textContent = `🎉${this.name} win!`;
      info.textContent = '🔁To play again please reload the page';
    }
  }

  note(points, items) {
    lastEvent.textContent = `${this.name}: ${points} point(-s)`;
    items[this.name].textContent = ` ${this.name}: ${this.score} points`;
  }

  carry(dict) {
    if (dict.hasOwnProperty(this.score))
      this.score = dict[this.score];
  }
}

//Ladders
const ladders = {
  'color': '#0db036',
  'isFirstSmaller': true,

  generate(n, size, obj) {
    for (let i = 1; i <= n; i++) {
      const [first, second] = rightQueue(
        randomNotUsed(2, size - 1, obj),
        randomNotUsed(2, size - 1, obj),
        this.isFirstSmaller
      );
      this[first] = second;
    }
  },

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
  'color': '#d66519',
  'isFirstSmaller': false,
};

snakes.draw = ladders.draw.bind(snakes);
snakes.generate = ladders.generate.bind(snakes);

//draw the starting field

createTable(tableWidth, tableHeight);
const cells = calcCellCenters(tableSize);
ladders.generate(nLadders, tableSize, cells);
snakes.generate(nSnakes, tableSize, cells);
ladders.draw(ctx, cells);
snakes.draw(ctx, cells);

//functions for buttons

const counters = [];
const usedNumbers = [];
const scoreItems = {};
let queue = 0;

const rollDice = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const points = counters[queue].step();
  counters[queue].checkScore();
  counters[queue].carry(ladders);
  counters[queue].carry(snakes);
  counters[queue].note(points, scoreItems);
  ladders.draw(ctx, cells);
  snakes.draw(ctx, cells);
  for (const counter of counters) counter.draw();
  if (queue < counters.length - 1) queue++;
  else queue = 0;
};

const gameHasBegun = () => alert(`
  Sorry, no more players can join.
  The game has already begun
`);

const playersLimit = () => alert(`
  Sorry, no more players can join.
  Players limit: 10
`);

const noPlayer = () => alert(`
  There are no players in the game.
  Click on "New player"
`);

const gameOver = name => alert(`
  🎉${name} win!
  🔁To play again please reload the page
`);

const writePlayerInList = (list, name, image, items) => {
  const row = document.createElement('div');
  row.setAttribute('class', 'item');
  image.height = '30';
  row.appendChild(image);
  const span = document.createElement('span');
  span.textContent = ` ${name}: 1 point`;
  span.setAttribute('class', 'text-in-item');
  span.setAttribute('id', name);
  items[name] = span;
  row.appendChild(span);
  list.appendChild(row);
};

const addPlayer = () => {
  let number;
  while (!number) {
    const x = random(1, 10);
    if (!usedNumbers.includes(x)) number = x;
  }
  usedNumbers.push(number);
  const counter = new Counter(ctx, cells, number, usedNumbers.length);
  counters.push(counter);
  if (counters.length === 10)
    buttonNewPlayer.onclick = playersLimit;
  writePlayerInList(playersListDiv, counter.name, counter.image, scoreItems);
};

//event listeners

buttonNewPlayer.onclick = () => {
  addPlayer();
  buttonNewPlayer.onclick = addPlayer;
  buttonDice.onclick = () => {
    rollDice();
    buttonNewPlayer.onclick = gameHasBegun;
    buttonDice.onclick = rollDice;
  };
};

buttonDice.onclick = noPlayer;
