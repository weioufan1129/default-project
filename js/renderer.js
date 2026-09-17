(function (global) {
  'use strict';

  var ROOT = document.documentElement;
  var THEMES = {
    classic: {
      name: '經典',
      pageBg: '#f5f0e8',
      headerBg: '#e8ddc8',
      headerText: '#5b3f1a',
      boardBg: '#fffdf6',
      cellBg: '#ffffff',
      givenText: '#1f2937',
      userText: '#1d6fd1',
      notesText: '#6b7280',
      borderLight: '#b7a882',
      borderDark: '#8a7a58',
      selBg: '#ffe9a8',
      hlBg: '#f3e9d2',
      sameBg: '#ffd97a',
      numBtnBg: '#fbf5e8',
      numBtnText: '#5b3f1a',
      text: '#3d2f17',
      accent: '#b0712f',
      modalBg: '#fffaf0',
      chipBg: '#efe6d2',
      chipText: '#4a3a20'
    },
    dark: {
      name: '暗黑',
      pageBg: '#12141c',
      headerBg: '#1a1d29',
      headerText: '#e8eaf6',
      boardBg: '#1e2230',
      cellBg: '#262b3d',
      givenText: '#c7cbe0',
      userText: '#66b7ff',
      notesText: '#8b93ad',
      borderLight: '#3d435c',
      borderDark: '#20243a',
      selBg: '#3a5478',
      hlBg: '#2c3248',
      sameBg: '#39506e',
      numBtnBg: '#2b3045',
      numBtnText: '#e8eaf6',
      text: '#e8eaf6',
      accent: '#66b7ff',
      modalBg: '#22263a',
      chipBg: '#2b3045',
      chipText: '#c7cbe0'
    },
    neon: {
      name: '霓虹',
      pageBg: '#0a0620',
      headerBg: '#140b38',
      headerText: '#ffffff',
      boardBg: '#100a28',
      cellBg: '#191140',
      givenText: '#e9d5ff',
      userText: '#00e5ff',
      notesText: '#7d6bb8',
      borderLight: '#8b5cf6',
      borderDark: '#3b1478',
      selBg: '#3d1f8f',
      hlBg: '#241560',
      sameBg: '#ff00e0',
      numBtnBg: '#1f1450',
      numBtnText: '#ffffff',
      text: '#f3e8ff',
      accent: '#ff00e0',
      modalBg: '#191040',
      chipBg: '#241560',
      chipText: '#cdb4ff'
    }
  };

  var themeOrder = ['classic', 'dark', 'neon'];

  function applyTheme(name) {
    var t = THEMES[name] || THEMES.classic;
    ROOT.style.setProperty('--page-bg', t.pageBg);
    ROOT.style.setProperty('--header-bg', t.headerBg);
    ROOT.style.setProperty('--header-text', t.headerText);
    ROOT.style.setProperty('--board-bg', t.boardBg);
    ROOT.style.setProperty('--cell-bg', t.cellBg);
    ROOT.style.setProperty('--given-text', t.givenText);
    ROOT.style.setProperty('--user-text', t.userText);
    ROOT.style.setProperty('--notes-text', t.notesText);
    ROOT.style.setProperty('--border-light', t.borderLight);
    ROOT.style.setProperty('--border-dark', t.borderDark);
    ROOT.style.setProperty('--sel-bg', t.selBg);
    ROOT.style.setProperty('--hl-bg', t.hlBg);
    ROOT.style.setProperty('--same-bg', t.sameBg);
    ROOT.style.setProperty('--num-btn-bg', t.numBtnBg);
    ROOT.style.setProperty('--num-btn-text', t.numBtnText);
    ROOT.style.setProperty('--text', t.text);
    ROOT.style.setProperty('--accent', t.accent);
    ROOT.style.setProperty('--modal-bg', t.modalBg);
    ROOT.style.setProperty('--chip-bg', t.chipBg);
    ROOT.style.setProperty('--chip-text', t.chipText);
    return name;
  }

  function themeNames() {
    return themeOrder.map(function (k) { return { id: k, name: THEMES[k].name }; });
  }

  function build(boardEl, onCellClick) {
    boardEl.innerHTML = '';
    for (var i = 0; i < 81; i++) {
      var cell = document.createElement('button');
      cell.className = 'cell';
      cell.type = 'button';
      cell.dataset.index = i;
      cell.setAttribute('aria-label', '格子 ' + (i + 1));
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
  }

  function cellEl(boardEl, i) {
    return boardEl.children[i];
  }

  function renderCell(elm, cell, selected) {
    elm.classList.remove('given', 'selected', 'same', 'hl', 'conflict', 'has-value', 'is-notes', 'numhl');
    elm.classList.remove('p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-7', 'p-8', 'p-9');
    elm.textContent = '';
    if (!cell) return;
    if (cell.given) elm.classList.add('given');
    if (cell.selected) elm.classList.add('selected');
    if (cell.hl) elm.classList.add('hl');
    if (cell.same) elm.classList.add('same');
    if (cell.conflict) elm.classList.add('conflict');
    if (cell.numhl) elm.classList.add('numhl');
    if (cell.value) {
      elm.classList.add('has-value');
      elm.textContent = String(cell.value);
    } else if (cell.notes && cell.notes.length) {
      elm.classList.add('is-notes');
      for (var k = 0; k < cell.notes.length; k++) {
        elm.classList.add('p-' + cell.notes[k]);
      }
      elm.innerHTML = notesHtml(cell.notes);
    }
  }

  function notesHtml(notes) {
    var html = '';
    for (var n = 1; n <= 9; n++) {
      var has = notes.indexOf(n) !== -1;
      html += '<span>' + (has ? n : '') + '</span>';
    }
    return html;
  }

  function renderBoard(boardEl, cells) {
    for (var i = 0; i < 81; i++) {
      renderCell(cellEl(boardEl, i), cells[i], false);
    }
  }

  global.SudokuRenderer = {
    THEMES: THEMES,
    themeOrder: themeOrder,
    applyTheme: applyTheme,
    themeNames: themeNames,
    build: build,
    renderCell: renderCell,
    renderBoard: renderBoard
  };
})(window);