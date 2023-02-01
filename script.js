const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const score = document.getElementById("score");
let count = 0;
let scoreVal = 0
const grid = 32;
let gameOver = false;


function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
function game() {
  count = 0;
 scoreVal = 0

  let tetrSequence = [];
  let playField = [];

  for (let row = -2; row < 20; row++) {
    playField[row] = [];

    for (let col = 0; col < 10; col++) {
      playField[row][col] = 0;
    }
  }

  const tetrominos = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    O: [
      [1, 1],
      [1, 1],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  };

  // цвет каждой фигуры
  const colors = {
    I: "cyan",
    O: "yellow",
    T: "purple",
    S: "green",
    Z: "red",
    J: "blue",
    L: "orange",
  };

  // счётчик
  // текущая фигура в игре
  let tetromino = getNextTetromino();
  // следим за кадрами анимации, чтобы если что — остановить игру
  let rAF = null;
  // флаг конца игры, на старте — неактивный

  function randomInt(min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  function generateSequence() {
    const sequence = ["I", "J", "L", "O", "S", "T", "Z"];

    while (sequence.length) {
      // случайным образом находим любую из них
      const rand = randomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      // помещаем выбранную фигуру в игровой массив с последовательностями
      tetrSequence.push(name);
    }
  }

  // получаем следующую фигуру
  function getNextTetromino() {
    // если следующей нет — генерируем
    if (tetrSequence.length === 0) {
      generateSequence();
    }
    // берём первую фигуру из массива
    const name = tetrSequence.pop();
    // сразу создаём матрицу, с которой мы отрисуем фигуру
    const matrix = tetrominos[name];

    // I и O стартуют с середины, остальные — чуть левее
    const col = playField[0].length / 2 - Math.ceil(matrix[0].length / 2);

    // I начинает с 21 строки (смещение -1), а все остальные — со строки 22 (смещение -2)
    const row = name === "I" ? -1 : -2;

    // вот что возвращает функция
    return {
      name: name, // название фигуры (L, O, и т.д.)
      matrix: matrix, // матрица с фигурой
      row: row, // текущая строка (фигуры стартуют за видимой областью холста)
      col: col, // текущий столбец
    };
  }

  // поворачиваем матрицу на 90 градусов
  // https://codereview.stackexchange.com/a/186834
  function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
    // на входе матрица, и на выходе тоже отдаём матрицу
    return result;
  }

  // проверяем после появления или вращения, может ли матрица (фигура) быть в этом месте поля или она вылезет за его границы
  function isValidMove(matrix, cellRow, cellCol) {
    // проверяем все строки и столбцы
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (
          matrix[row][col] &&
          // если выходит за границы поля…
          (cellCol + col < 0 ||
            cellCol + col >= playField[0].length ||
            cellRow + row >= playField.length ||
            // …или пересекается с другими фигурами
            playField[cellRow + row][cellCol + col])
        ) {
          // то возвращаем, что нет, так не пойдёт
          return false;
        }
      }
    }
    // а если мы дошли до этого момента и не закончили раньше — то всё в порядке
    return true;
  }

  // когда фигура окончательна встала на своё место
  function placeTetromino() {
    // обрабатываем все строки и столбцы в игровом поле
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          // если край фигуры после установки вылезает за границы поля, то игра закончилась
          if (tetromino.row + row < 0) {
            return showGameOver();
          }
          // если всё в порядке, то записываем в массив игрового поля нашу фигуру
          playField[tetromino.row + row][tetromino.col + col] = tetromino.name;
        }
      }
    }

    // проверяем, чтобы заполненные ряды очистились снизу вверх
    for (let row = playField.length - 1; row >= 0; ) {
      // если ряд заполнен
      if (playField[row].every((cell) => !!cell)) {
        // очищаем его и опускаем всё вниз на одну клетку
        console.log('row down');
        scoreVal = scoreVal + 1;
        score.textContent = scoreVal;
        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < playField[r].length; c++) {
            playField[r][c] = playField[r - 1][c];
            
          }
        }
        
      } else {
        // переходим к следующему ряду
        
        row--;
      }
      
    }
    // получаем следующую фигуру
    tetromino = getNextTetromino();
  }

  // показываем надпись Game Over
  function showGameOver() {
    // прекращаем всю анимацию игры
    cancelAnimationFrame(rAF);
    // ставим флаг окончания
    gameOver = true;
    // рисуем чёрный прямоугольник посередине поля
    context.fillStyle = "black";
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    // пишем надпись белым моноширинным шрифтом по центру
    context.globalAlpha = 1;
    context.fillStyle = "white";
    context.font = "36px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
  }


  // главный цикл игры
  function loop() {
    // начинаем анимацию
    rAF = requestAnimationFrame(loop);
    // очищаем холст
    clearCanvas();

    // рисуем игровое поле с учётом заполненных фигур
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (playField[row][col]) {
          const name = playField[row][col];
          context.fillStyle = colors[name];

          // рисуем всё на один пиксель меньше, чтобы получился эффект «в клетку»
          context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
        }
      }
    }

    // рисуем текущую фигуру
    if (tetromino) {
      // фигура сдвигается вниз каждые 35 кадров
      if (++count > 35) {
        tetromino.row++;
        count = 0;

        // если движение закончилось — рисуем фигуру в поле и проверяем, можно ли удалить строки
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
          tetromino.row--;
          
          placeTetromino();
        }
      }

      // не забываем про цвет текущей фигуры
      context.fillStyle = colors[tetromino.name];

      // отрисовываем её
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
            // и снова рисуем на один пиксель меньше
            context.fillRect(
              (tetromino.col + col) * grid,
              (tetromino.row + row) * grid,
              grid - 1,
              grid - 1
            );
          }
        }
      }
    }
  }
  loop();
  document.addEventListener("keydown", function (e){


    if (e.which === 37 || e.which === 39) {
        const col =
          e.which === 37
            ? // если влево, то уменьшаем индекс в столбце, если вправо — увеличиваем
              tetromino.col - 1
            : tetromino.col + 1;
    
        // если так ходить можно, то запоминаем текущее положение
        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
          tetromino.col = col;
        }
      }
    
      // стрелка вверх — поворот
      if (e.which === 38) {
        // поворачиваем фигуру на 90 градусов
        const matrix = rotate(tetromino.matrix);
        // если так ходить можно — запоминаем
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
          tetromino.matrix = matrix;
        }
      }
    
      // стрелка вниз — ускорить падение
      if (e.which === 40) {
        // смещаем фигуру на строку вниз
        const row = tetromino.row + 1;
        // если опускаться больше некуда — запоминаем новое положение
        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
          tetromino.row = row - 1;
          // ставим на место и смотрим на заполненные ряды
          placeTetromino();
          return;
        }
        // запоминаем строку, куда стала фигура
        tetromino.row = row;
      }
  })
}

// следим за нажатиями на клавиши
document.addEventListener("keydown", function (e) {
  //
  if (e.which === 13) {
    gameOver = false;
    game();
  }
  if (gameOver) return;

  // стрелки влево и вправо
  
});
