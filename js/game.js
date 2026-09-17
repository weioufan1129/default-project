(function (global) {
  'use strict';

  var R = global.SudokuRenderer;
  var Cfg = global.SudokuConfig;
  var S = global.Sudoku;

  var MISTAKE_LIMIT = 3;

  function Game(level, diff) {
    this.level = level;
    this.diff = diff;
    this.puzzle = null;
    this.solution = null;
    this.cells = null;
    this.selected = -1;
    this.mistakes = 0;
    this.timeSec = 0;
    this.running = false;
    this.over = false;
    this.won = false;
    this.undoStack = [];
  }

  Game.prototype.generate = function () {
    var cfg = Cfg.DIFFICULTIES[this.diff];
    var data = S.generatePuzzle(cfg.clues);
    this.puzzle = data.puzzle;
    this.solution = data.solution;
    this.cells = this.buildCells(data.puzzle);
    this.selected = -1;
    this.mistakes = 0;
    this.timeSec = 0;
    this.running = false;
    this.over = false;
    this.won = false;
    this.undoStack = [];
  };

  Game.prototype.stepTimer = function () {
    if (!this.running || this.over) return this.timeSec;
    this.timeSec += 1;
    return this.timeSec;
  };

  Game.prototype.pause = function () {
    this.running = false;
  };

  Game.prototype.resume = function () {
    if (!this.over && !this.won) this.running = true;
  };

  Game.prototype.startIfIdle = function () {
    if (!this.running && !this.over && !this.won) {
      this.running = true;
      return true;
    }
    return false;
  };

  Game.prototype.buildCells = function (puzzle) {
    var cells = [];
    for (var i = 0; i < 81; i++) {
      var r = Math.floor(i / 9);
      var c = i % 9;
      var val = puzzle[r][c];
      cells.push({
        index: i,
        row: r,
        col: c,
        box: Math.floor(r / 3) * 3 + Math.floor(c / 3),
        value: val,
        given: val !== 0,
        notes: [],
        selected: false,
        hl: false,
        same: false,
        conflict: false
      });
    }
    return cells;
  };

  Game.prototype.cell = function (i) {
    return this.cells[i];
  };

  Game.prototype.select = function (i) {
    if (this.over) return;
    if (this.selected >= 0) this.cells[this.selected].selected = false;
    this.selected = i;
    this.cells[i].selected = true;
    this.updateHints();
    return this.cells[i];
  };

  Game.prototype.erase = function () {
    if (this.over || this.selected < 0) return false;
    var cell = this.cells[this.selected];
    if (cell.given) return false;
    if (!cell.value && cell.notes.length === 0) return false;
    this.snapshot();
    cell.value = 0;
    cell.notes = [];
    cell.conflict = false;
    this.resumeTick();
    this.updateHints();
    return true;
  };

  Game.prototype.setValue = function (num) {
    if (this.over || this.selected < 0) return { ok: false };
    var cell = this.cells[this.selected];
    if (cell.given) return { ok: false };
    this.snapshot();
    var isCorrect = this.solution[cell.row][cell.col] === num;
    cell.value = num;
    cell.notes = [];
    if (isCorrect) {
      cell.conflict = false;
      cell.same = false;
    } else {
      cell.conflict = true;
      this.mistakes += 1;
    }
    this.resumeTick();
    this.updateHints();
    var won = this.checkWin();
    var failed = !won && this.mistakes >= MISTAKE_LIMIT;
    return { ok: true, correct: isCorrect, won: won, failed: failed };
  };

  Game.prototype.toggleNote = function (num) {
    if (this.over || this.selected < 0) return false;
    var cell = this.cells[this.selected];
    if (cell.given || cell.value) return false;
    this.snapshot();
    var idx = cell.notes.indexOf(num);
    if (idx === -1) {
      cell.notes.push(num);
      cell.notes.sort(function (a, b) { return a - b; });
    } else {
      cell.notes.splice(idx, 1);
    }
    this.resumeTick();
    return true;
  };

  Game.prototype.snapshot = function () {
    this.undoStack.push({
      values: this.cells.map(function (c) { return c.value; }),
      notes: this.cells.map(function (c) { return c.notes.slice(); }),
      mistakes: this.mistakes
    });
    if (this.undoStack.length > 200) this.undoStack.shift();
  };

  Game.prototype.undo = function () {
    if (!this.undoStack.length) return false;
    var s = this.undoStack.pop();
    s.values.forEach(function (v, i) {
      this.cells[i].value = v;
      this.cells[i].notes = s.notes[i].slice();
      this.cells[i].conflict = false;
    }, this);
    this.mistakes = s.mistakes;
    this.resumeTick();
    this.updateHints();
    return true;
  };

  Game.prototype.hint = function () {
    if (this.over || this.won) return null;
    var empties = [];
    this.cells.forEach(function (c) {
      if (!c.given && c.value === 0) empties.push(c.index);
    });
    if (!empties.length) return null;
    var pick = empties[Math.floor(Math.random() * empties.length)];
    var cell = this.cells[pick];
    this.snapshot();
    cell.value = this.solution[cell.row][cell.col];
    cell.notes = [];
    cell.conflict = false;
    this.resumeTick();
    this.updateHints();
    var won = this.checkWin();
    return { index: pick, value: cell.value, won: won };
  };

  Game.prototype.resumeTick = function () {
    if (this.over || this.won) return;
    this.running = true;
  };

  Game.prototype.updateHints = function () {
    var that = this;
    this.cells.forEach(function (c) {
      c.hl = false;
      c.same = false;
    });
    if (this.selected < 0) return;
    var sel = this.cells[this.selected];
    var selVal = sel.value;
    this.cells.forEach(function (c) {
      if (c.index === sel.index) return;
      if (c.row === sel.row || c.col === sel.col || c.box === sel.box) {
        c.hl = true;
        if (selVal && c.value === selVal) c.same = true;
      }
    });
  };

  Game.prototype.checkWin = function () {
    if (this.over) return this.won;
    var allFilled = true;
    this.cells.forEach(function (c) {
      if (!c.value || c.value !== this.solution[c.row][c.col]) {
        allFilled = false;
      }
    }, this);
    if (allFilled) {
      this.won = true;
      this.running = false;
      this.over = true;
    }
    return this.won;
  };

  Game.prototype.markLost = function () {
    this.over = true;
    this.running = false;
  };

  Game.prototype.serialize = function () {
    return {
      version: 1,
      level: this.level,
      diff: this.diff,
      puzzleStr: S.serializeGrid(this.puzzle),
      solutionStr: S.serializeGrid(this.solution),
      values: this.cells.map(function (c) { return c.value; }),
      notes: this.cells.map(function (c) { return c.notes.slice(); }),
      selected: this.selected,
      mistakes: this.mistakes,
      timeSec: this.timeSec,
      running: this.running,
      over: this.over,
      won: this.won,
      undoStack: this.undoStack
    };
  };

  Game.prototype.restore = function (data) {
    this.level = data.level || 1;
    this.diff = data.diff || 'easy';
    this.puzzle = S.deserializeGrid(data.puzzleStr);
    this.solution = S.deserializeGrid(data.solutionStr);
    this.cells = this.buildCells(this.puzzle);
    var that = this;
    (data.values || []).forEach(function (v, i) {
      that.cells[i].value = v;
      that.cells[i].notes = (data.notes[i] || []).slice();
    });
    this.selected = data.selected || -1;
    if (this.selected >= 0) this.cells[this.selected].selected = true;
    this.mistakes = data.mistakes || 0;
    this.timeSec = data.timeSec || 0;
    this.running = !!data.running;
    this.over = !!data.over;
    this.won = !!data.won;
    this.undoStack = data.undoStack || [];
    this.updateHints();
  };

  global.SudokuGame = {
    Game: Game,
    MISTAKE_LIMIT: MISTAKE_LIMIT
  };
})(window);