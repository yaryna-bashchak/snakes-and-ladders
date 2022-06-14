'use strict';

const canvas = document.getElementById('canvas');
const table = document.getElementById('table');
const buttonDice = document.getElementById('dice');
const buttonAddPlayer = document.getElementById('add-player');
const inputName = document.getElementById('input-name');
const errorName = document.getElementById('error-name');
const errorDice = document.getElementById('error-dice');
const lastEvent = document.getElementById('last-event');
const winner = document.getElementById('winner');
const info = document.getElementById('info');
const playersListDiv = document.getElementById('list-of-players');
let tablePosition = table.getBoundingClientRect();
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

//canvas position

const fixCanvasPosition = () => {
  tablePosition = table.getBoundingClientRect();
  canvas.style.left = `${tablePosition.left}px`;
  canvas.style.top = `${tablePosition.top}px`;
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
  constructor(ctx, cells, number, name) {
    this.ctx = ctx;
    this.cells = cells;
    this.score = 1;
    this.number = number;
    this.name = name;
    this.isNext = true;
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
    if (this.isNext === true) this.score++;
    else this.score--;
    if (this.score === tableSize) this.isNext = false;
  }

  checkScore() {
    if (this.score === tableSize) {
      const winnerMessage = gameOver(this.name);
      buttonDice.onclick = () => winnerMessage(errorDice);
      buttonAddPlayer.onclick = () => winnerMessage(errorName);
      winner.textContent = `🎉${this.name} win!`;
      info.textContent = '🔁To play again please reload the page';
    }
  }

  note(points, scoreItems) {
    lastEvent.textContent = `${this.name}: ${points} point(-s)`;
    scoreItems[this.name].textContent = ` ${this.name}: ${this.score} points`;
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
fixCanvasPosition();
const cells = calcCellCenters(tableSize);
ladders.generate(nLadders, tableSize, cells);
snakes.generate(nSnakes, tableSize, cells);
ladders.draw(ctx, cells);
snakes.draw(ctx, cells);

//functions for buttons

const counters = [];
const notUsedNumbers = [...Array(11).keys()];
notUsedNumbers.shift();
inputName.value = `Player${counters.length + 1}`;
const scoreItems = {};
const items = {};
let queue = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const drawAll = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ladders.draw(ctx, cells);
  snakes.draw(ctx, cells);
  for (const counter of counters) counter.draw();
};

async function rollDice() {
  const counter = counters[queue];
  clearAllErrors();
  buttonDice.onclick = () => {};
  const points = random(1, 6);
  for (let i = 0; i < points; i++) {
    counter.step();
    drawAll();
    await sleep(700 / points);
  }
  counter.isNext = true;
  counter.carry(ladders);
  counter.carry(snakes);
  counter.note(points, scoreItems);
  drawAll();
  buttonDice.onclick = rollDice;
  counter.checkScore();
  if (queue < counters.length - 1) queue++;
  else queue = 0;
}

const gameHasBegun = () => `
  Sorry, no more players can join.
  The game has already begun
`;

const errorPlayersLimit = () => `
  Sorry, no more players can join.
  Players limit: 10
`;

const errorNameExist = name => `! ${name} already exist`;

const errorNameNull = () => '! Name cannot be empty';

const noPlayer = () => `
  There are no players in the game.
  Click on "New player"
`;

const gameOver = name => field => {
  const text = `
    🎉${name} win!
    🔁To play again please reload the page
  `;
  clearAllErrors();
  fillText(field, text);
};

const fillText = (element, text) => element.textContent = text;
const clearAllErrors = () => {
  for (const element of [errorName, errorDice])
    fillText(element, '');
};

const writePlayerInList = (list, name, image, scoreItems, items) => {
  const row = document.createElement('div');
  row.setAttribute('class', 'item');
  image.height = '30';
  row.appendChild(image);
  const span = document.createElement('span');
  fillText(span, ` ${name}: 1 point`);
  span.setAttribute('class', 'text-in-item');
  scoreItems[name] = span;
  items[name] = row;
  row.appendChild(span);
  list.appendChild(row);
};

const isNameUnique = (name, counters) => {
  let result = true;
  for (const counter of counters)
    if (name === counter.name) {
      result = false;
      break;
    }
  return result;
};

const addPlayer = () => {
  const name = inputName.value;
  clearAllErrors();
  if (name) {
    if (isNameUnique(name, counters)) {
      const count = notUsedNumbers.length - 1;
      const n = random(0, count);
      const number = notUsedNumbers[n];
      notUsedNumbers.splice(n, 1);
      const counter = new Counter(ctx, cells, number, name);
      counters.push(counter);
      if (counters.length === 10)
        buttonAddPlayer.onclick = () =>
          fillText(errorName, errorPlayersLimit());
      writePlayerInList(
        playersListDiv,
        counter.name,
        counter.image,
        scoreItems,
        items,
      );
    } else {
      fillText(errorName, errorNameExist(name));
      return;
    }
  } else {
    fillText(errorName, errorNameNull());
  }
  inputName.value =
    (counters.length < 10) ?
      `Player${counters.length + 1}` : '';
};

//event listeners

buttonAddPlayer.onclick = () => {
  clearAllErrors();
  const prev = counters.length;
  addPlayer();
  if (prev + 1 === counters.length) {
    buttonAddPlayer.onclick = addPlayer;
    buttonDice.onclick = () => {
      rollDice();
      buttonAddPlayer.onclick = () =>
        fillText(errorName, gameHasBegun());
      buttonDice.onclick = rollDice;
    };
  }
};

buttonDice.onclick = () => {
  clearAllErrors();
  fillText(errorDice, noPlayer());
};

window.onresize = fixCanvasPosition;
