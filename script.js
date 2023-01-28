const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const grid = 32;

let tetrSequence = [];
let playField = [];
let count = 0;
let tetromino = getNextTetromino();
// следим за кадрами анимации, чтобы если что — остановить игру
let rAF = null; 
let gameOver = false;


for (let row = -2; row < 20; row++) {
  playField[row] = [];

  for (let col = 0; col < 10; col++) {
    playField[row][col] = 0;
  }
}

const tetrominos = {
    'I': [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    'J': [
      [1,0,0],
      [1,1,1],
      [0,0,0],
    ],
    'L': [
      [0,0,1],
      [1,1,1],
      [0,0,0],
    ],
    'O': [
      [1,1],
      [1,1],
    ],
    'S': [
      [0,1,1],
      [1,1,0],
      [0,0,0],
    ],
    'Z': [
      [1,1,0],
      [0,1,1],
      [0,0,0],
    ],
    'T': [
      [0,1,0],
      [1,1,1],
      [0,0,0],
    ]
  };
  
  // цвет каждой фигуры
  const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
  };

  function randomInt(min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  
    while (sequence.length) {
      // случайным образом находим любую из них
      const rand = randomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      // помещаем выбранную фигуру в игровой массив с последовательностями
      tetrSequence.push(name);
    }
  }

