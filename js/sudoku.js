(function (global) {
  'use strict';

  var SIZE = 9;
  var BOX = 3;

  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = array[i];
      array[i] = array[j];
      array[j] = t;
    }
    return array;
  }

  function emptyGrid() {
    var g = [];
    for (var r = 0; r < SIZE; r++) {
      g.push(new Array(SIZE).fill(0));
    }
    return g;
  }

  function cloneGrid(g) {
    return g.map(function (row) { return row.slice(); });
  }

  function validAt(grid, row, col, num) {
    for (var i = 0; i < SIZE; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    var br = Math.floor(row / BOX) * BOX;
    var bc = Math.floor(col / BOX) * BOX;
    for (var r = br; r < br + BOX; r++) {
      for (var c = bc; c < bc + BOX; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  function candidatesAt(grid, row, col) {
    var used = {};
    for (var i = 0; i < SIZE; i++) {
      if (grid[row][i]) used[grid[row][i]] = true;
      if (grid[i][col]) used[grid[i][col]] = true;
    }
    var br = Math.floor(row / BOX) * BOX;
    var bc = Math.floor(col / BOX) * BOX;
    for (var r = br; r < br + BOX; r++) {
      for (var c = bc; c < bc + BOX; c++) {
        if (grid[r][c]) used[grid[r][c]] = true;
      }
    }
    var list = [];
    for (var n = 1; n <= SIZE; n++) {
      if (!used[n]) list.push(n);
    }
    return list;
  }

  function solve(grid) {
    for (var row = 0; row < SIZE; row++) {
      for (var col = 0; col < SIZE; col++) {
        if (grid[row][col] === 0) {
          var cands = candidatesAt(grid, row, col);
          for (var i = 0; i < cands.length; i++) {
            var n = cands[i];
            if (validAt(grid, row, col, n)) {
              grid[row][col] = n;
              if (solve(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function countSolutions(grid, limit) {
    var count = 0;
    function countRec(work) {
      if (count >= limit) return;
      var bestRow = -1;
      var bestCol = -1;
      var bestCands = null;
      for (var row = 0; row < SIZE; row++) {
        for (var col = 0; col < SIZE; col++) {
          if (work[row][col] === 0) {
            var cands = candidatesAt(work, row, col);
            if (cands.length === 0) return;
            if (!bestCands || cands.length < bestCands.length) {
              bestCands = cands;
              bestRow = row;
              bestCol = col;
              if (cands.length === 1) {
                row = SIZE;
                break;
              }
            }
          }
        }
      }
      if (bestRow === -1) {
        count++;
        return;
      }
      for (var i = 0; i < bestCands.length; i++) {
        work[bestRow][bestCol] = bestCands[i];
        countRec(work);
        work[bestRow][bestCol] = 0;
        if (count >= limit) return;
      }
    }
    countRec(cloneGrid(grid));
    return count;
  }

  function hasUniqueSolution(grid) {
    return countSolutions(grid, 2) === 1;
  }

  function generateSolution() {
    var g = emptyGrid();
    solve(g);
    return g;
  }

  function generatePuzzle(clues) {
    var solution = generateSolution();
    var puzzle = cloneGrid(solution);
    var cells = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        cells.push([r, c]);
      }
    }
    shuffle(cells);
    var removed = 0;
    var target = SIZE * SIZE - clues;
    var guard = 0;
    for (var i = 0; i < cells.length && removed < target; i++) {
      var r = cells[i][0];
      var c = cells[i][1];
      var backup = puzzle[r][c];
      puzzle[r][c] = 0;
      if (!hasUniqueSolution(puzzle)) {
        puzzle[r][c] = backup;
        if (++guard > 400) break;
      } else {
        removed++;
      }
    }
    return { puzzle: puzzle, solution: solution, clues: SIZE * SIZE - removed };
  }

  function serializeGrid(g) {
    return g.map(function (row) { return row.join(''); }).join('');
  }

  function deserializeGrid(str) {
    var g = emptyGrid();
    for (var i = 0; i < SIZE; i++) {
      for (var j = 0; j < SIZE; j++) {
        g[i][j] = parseInt(str.charAt(i * SIZE + j), 10) || 0;
      }
    }
    return g;
  }

  global.Sudoku = {
    SIZE: SIZE,
    emptyGrid: emptyGrid,
    cloneGrid: cloneGrid,
    validAt: validAt,
    candidatesAt: candidatesAt,
    solve: solve,
    countSolutions: countSolutions,
    hasUniqueSolution: hasUniqueSolution,
    generateSolution: generateSolution,
    generatePuzzle: generatePuzzle,
    serializeGrid: serializeGrid,
    deserializeGrid: deserializeGrid
  };
})(window);