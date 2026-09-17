(function (global) {
  'use strict';

  var Cfg = global.SudokuConfig;
  var R = global.SudokuRenderer;
  var Sound = global.SudokuSound;
  var Stats = global.SudokuStats;
  var GG = global.SudokuGame;

  var boardEl = document.getElementById('board');
  var themeSelect = document.getElementById('theme-select');
  var soundBtn = document.getElementById('sound-toggle');
  var statsBtn = document.getElementById('stats-btn');
  var helpBtn = document.getElementById('help-btn');
  var faceDiffBar = document.querySelectorAll('.diff-btn');
  var timerEl = document.getElementById('timer');
  var mistakesEl = document.getElementById('mistakes');
  var bestTimeEl = document.getElementById('best-time');
  var levelNumEl = document.getElementById('level-num');
  var overlay = document.getElementById('modal-overlay');
  var dialogTitle = document.getElementById('dialog-title');
  var dialogBody = document.getElementById('dialog-body');
  var dialogActions = document.getElementById('dialog-actions');
  var padNumbers = document.getElementById('pad-numbers');
  var padActions = document.querySelectorAll('.pad-action');
  var notesMode = false;
  var activeNum = 0;
  var notesBtn = null;
  var lastNewGameTime = 0;

  var game = null;
  var timerId = null;

  function $(id) { return document.getElementById(id); }

  function init() {
    var settings = Stats.getSettings();
    R.applyTheme(Stats.getTheme());
    var names = R.themeNames();
    names.forEach(function (t) {
      var opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      if (t.id === settings.theme) opt.selected = true;
      themeSelect.appendChild(opt);
    });
    themeSelect.addEventListener('change', function () {
      R.applyTheme(themeSelect.value);
      Stats.setTheme(themeSelect.value);
      Sound.select();
    });
    Sound.setEnabled(Stats.isSoundOn());
    updateSoundBtn();
    soundBtn.addEventListener('click', function () {
      Sound.unlock();
      var on = !Sound.isEnabled();
      Stats.setSound(on);
      Sound.setEnabled(on);
      updateSoundBtn();
      if (on) Sound.click();
    });
    statsBtn.addEventListener('click', function () {
      Sound.select();
      showStats();
    });
    helpBtn.addEventListener('click', function () {
      Sound.select();
      showHelp();
    });

    faceDiffBar.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setDiff(btn.dataset.diff, true);
      });
    });

    var sel = document.querySelector('[data-diff="' + Stats.getSettings().currentDiff + '"]');
    if (sel) sel.classList.add('active');

    boardEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    R.build(boardEl, onCellClick);

    buildPad();
    padActions.forEach(function (b) {
      b.addEventListener('click', function () { onPadAction(b.dataset.action); });
    });

    document.addEventListener('keydown', onKeydown);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    restoreOrNew();
    startTimer();
  }

  function updateSoundBtn() {
    soundBtn.textContent = Sound.isEnabled() ? '🔊' : '🔇';
  }

  function buildPad() {
    padNumbers.innerHTML = '';
    for (var n = 1; n <= 9; n++) {
      var b = document.createElement('button');
      b.className = 'num-btn';
      b.dataset.num = n;
      b.textContent = String(n);
      b.addEventListener('click', function () {
        Sound.unlock();
        toggleActiveNum(parseInt(this.dataset.num, 10));
        inputNumber(parseInt(this.dataset.num, 10));
      });
      b.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        Sound.unlock();
        inputNumber(parseInt(this.dataset.num, 10));
      });
      padNumbers.appendChild(b);
    }
    notesBtn = document.querySelector('[data-action="notes"]');
  }

  function setDiff(diff, restart) {
    var btns = faceDiffBar;
    btns.forEach(function (b) {
      b.classList.toggle('active', b.dataset.diff === diff);
    });
    var settings = Stats.getSettings();
    settings.currentDiff = diff;
    Cfg.saveSettings(settings);
    if (restart) {
      newGame(diff);
    }
  }

  function newGame(diff, force) {
    var stats = Stats.getStats();
    stats.games += 1;
    Cfg.saveStats(stats);
    game = new GG.Game(Stats.getLevel(), diff);
    game.generate();
    notesMode = false;
    activeNum = 0;
    updateNotesBtn();
    mistakesEl.textContent = '0';
    bestTimeEl.textContent = '--';
    renderAll();
    persist();
  }

  function restoreOrNew() {
    var save = Cfg.loadSave();
    if (save && typeof save.puzzleStr === 'string') {
      game = new GG.Game(1, 'easy');
      game.restore(save);
      setDiffVisual(game.diff);
      levelNumEl.textContent = String(game.level);
      if (!game.over && !game.won) {
        game.running = true;
      }
      mistakesEl.textContent = String(game.mistakes);
      updateBestDisplay(game.diff);
      notesMode = false;
      activeNum = 0;
      updateNotesBtn();
      renderAll();
      return;
    }
    var settings = Stats.getSettings();
    setDiffVisual(settings.currentDiff);
    levelNumEl.textContent = String(Stats.getLevel());
    newGame(settings.currentDiff);
  }

  function setDiffVisual(diff) {
    faceDiffBar.forEach(function (b) {
      b.classList.toggle('active', b.dataset.diff === diff);
    });
  }

  function onCellClick(e) {
    Sound.unlock();
    var idx = parseInt(e.currentTarget.dataset.index, 10);
    Sound.select();
    if (game.over && game.won) return;
    if (game.over) return;
    game.select(idx);
    renderAll();
    persist();
  }

  function toggleActiveNum(n) {
    activeNum = n;
    renderAll();
  }

  function inputNumber(n) {
    if (!game || game.over) return;
    if (notesMode) {
      var ok = game.toggleNote(n);
      if (ok) Sound.noteToggle();
      renderAll();
      persist();
      return;
    }
    var res = game.setValue(n);
    if (!res.ok) { Sound.click(); return; }
    if (res.correct) {
      Sound.place();
    } else {
      Sound.error();
      mistakesEl.textContent = String(game.mistakes);
      persist();
      renderAll();
      if (res.failed) {
        setTimeout(function () { showLost(); }, 350);
        return;
      }
      return;
    }
    mistakesEl.textContent = String(game.mistakes);
    renderAll();
    persist();
    if (res.won) {
      Sound.win();
      onWin();
    }
  }

  function erase() {
    if (!game || game.over) return;
    if (game.erase()) {
      Sound.erase();
      mistakesEl.textContent = String(game.mistakes);
      renderAll();
      persist();
    }
  }

  function undoAction() {
    if (!game || game.over) return;
    if (game.undo()) {
      Sound.undo();
      mistakesEl.textContent = String(game.mistakes);
      renderAll();
      persist();
    }
  }

  function hintAction() {
    if (!game || game.over) return;
    var res = game.hint();
    if (!res) { Sound.error(); return; }
    Stats.recordHint();
    Sound.hint();
    renderAll();
    persist();
    if (res.won) {
      Sound.win();
      onWin();
    }
  }

  function notesAction() {
    notesMode = !notesMode;
    updateNotesBtn();
    Sound.click();
  }

  function updateNotesBtn() {
    if (notesBtn) notesBtn.classList.toggle('active', notesMode);
  }

  function onPadAction(action) {
    Sound.unlock();
    switch (action) {
      case 'erase': erase(); break;
      case 'notes': notesAction(); break;
      case 'undo': undoAction(); break;
      case 'hint': hintAction(); break;
      case 'new':
        if (confirmNew()) {
          Sound.click();
          newGame(game ? game.diff : Stats.getSettings().currentDiff);
        }
        break;
    }
  }

  function confirmNew() {
    var now = Date.now();
    if (now - lastNewGameTime < 1200) return true;
    lastNewGameTime = now;
    return true;
  }

  function onKeydown(e) {
    var k = e.key;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (overlay.classList.contains('hidden')) {
      if (k >= '1' && k <= '9') {
        e.preventDefault();
        var kn = parseInt(k, 10);
        toggleActiveNum(kn);
        inputNumber(kn);
        return;
      }
      switch (k) {
        case 'Backspace': case 'Delete': e.preventDefault(); erase(); return;
        case 'ArrowLeft': case 'ArrowRight': case 'ArrowUp': case 'ArrowDown':
          e.preventDefault(); moveSelection(k); return;
        case 'n': case 'N': notesAction(); return;
        case 'u': case 'U': undoAction(); return;
        case 'h': case 'H': hintAction(); return;
        case 'r': case 'R':
          newGame(game ? game.diff : Stats.getSettings().currentDiff);
          return;
        case 'Escape': closeModal(); return;
      }
      return;
    }
    if (overlay.classList.contains('hidden')) return;
  }

  function moveSelection(key) {
    if (game.selected < 0) return;
    var r = Math.floor(game.selected / 9);
    var c = game.selected % 9;
    if (key === 'ArrowLeft') c = c > 0 ? c - 1 : 8;
    else if (key === 'ArrowRight') c = c < 8 ? c + 1 : 0;
    else if (key === 'ArrowUp') r = r > 0 ? r - 1 : 8;
    else if (key === 'ArrowDown') r = r < 8 ? r + 1 : 0;
    game.select(r * 9 + c);
    Sound.select();
    renderAll();
    persist();
  }

  function onVisibility() {
    if (document.hidden && game) game.pause();
    else if (!document.hidden && game && !game.over) game.resume();
  }

  function onBlur() {
    if (game) {
      game.pause();
      persist();
    }
  }

  function renderAll() {
    if (!game) return;
    var show = game.cells.map(function (c) {
      return {
        value: c.value,
        given: c.given,
        notes: c.notes,
        selected: c.selected,
        hl: c.hl,
        same: c.same,
        conflict: c.conflict,
        numhl: activeNum > 0 && c.value === activeNum
      };
    });
    R.renderBoard(boardEl, show);
    timerEl.textContent = Cfg.formatTime(game.timeSec);
    mistakesEl.textContent = String(game.mistakes);
    levelNumEl.textContent = String(game.level);
    updateBestDisplay(game.diff);
    updateNumButtons();
  }

  function updateNumButtons() {
    var btns = padNumbers.children;
    for (var n = 1; n <= 9; n++) {
      var b = btns[n - 1];
      if (!b) continue;
      var isActive = activeNum === n;
      var isDone = game && game.isNumberComplete(n);
      b.classList.toggle('active', isActive);
      b.classList.toggle('done', !!isDone);
      b.disabled = !!isDone;
    }
  }

  function updateBestDisplay(diff) {
    var best = Stats.getBestTime(diff);
    bestTimeEl.textContent = best == null ? '--' : Cfg.formatTime(best);
  }

  function startTimer() {
    if (timerId) return;
    timerId = setInterval(function () {
      if (!game) return;
      var t = game.stepTimer();
      timerEl.textContent = Cfg.formatTime(t);
      if (t % 10 === 0) persist();
    }, 1000);
  }

  function persist() {
    if (!game) return;
    if (game.over || game.won) {
      Cfg.clearSave();
      return;
    }
    Cfg.saveGame(game.serialize());
  }

  function onWin() {
    Stats.recordGame(game.diff, true, game.timeSec);
    Stats.nextLevel();
    levelNumEl.textContent = String(Stats.getLevel());
    Cfg.clearSave();
    var best = Stats.getBestTime(game.diff);
    var isRecord = best != null && game.timeSec <= best;
    var body = document.createElement('div');
    body.innerHTML =
      '<div class="win-emoji">🏆</div>' +
      '<p class="win-line">完成！耗時 <b>' + Cfg.formatTime(game.timeSec) + '</b></p>' +
      '<p class="win-line">難度：<b>' + Cfg.DIFFICULTIES[game.diff].label + '</b> · 錯誤 <b>' + game.mistakes + '</b></p>' +
      (isRecord ? '<p class="record-badge">🎉 新紀錄！</p>' : '') +
      '<p class="win-line">進入第 <b>' + Stats.getLevel() + '</b> 關</p>';
    dialogTitle.textContent = '🎉 過關！';
    dialogBody.innerHTML = '';
    dialogBody.appendChild(body);
    dialogActions.innerHTML =
      '<button class="dlg-btn primary" id="dlg-next">下一關</button>' +
      '<button class="dlg-btn" id="dlg-stats">統計</button>' +
      '<button class="dlg-btn" id="dlg-close">關閉</button>';
    showModal();
    $('dlg-next').addEventListener('click', function () {
      closeModal();
      Sound.click();
      newGame(game.diff);
    });
    $('dlg-stats').addEventListener('click', function () {
      closeModal();
      showStats();
    });
    $('dlg-close').addEventListener('click', function () {
      closeModal();
      tryAgain();
    });
  }

  function showLost() {
    game.markLost();
    persist();
    dialogTitle.textContent = '💥 失敗了';
    dialogBody.innerHTML = '<p class="lose-line">錯誤超過 <b>' + GG.MISTAKE_LIMIT + '</b> 次，挑戰結束。</p>';
    dialogActions.innerHTML =
      '<button class="dlg-btn primary" id="dlg-retry">再試一次</button>' +
      '<button class="dlg-btn" id="dlg-newdiff">更換難度</button>' +
      '<button class="dlg-btn" id="dlg-close2">關閉</button>';
    showModal();
    $('dlg-retry').addEventListener('click', function () {
      closeModal();
      Sound.click();
      newGame(game.diff);
    });
    $('dlg-newdiff').addEventListener('click', function () {
      closeModal();
      faceDiffBar[0].click();
    });
    $('dlg-close2').addEventListener('click', closeModal);
  }

  function tryAgain() {
    if (!game) return;
    var settings = Stats.getSettings();
    setDiffVisual(settings.currentDiff);
    newGame(settings.currentDiff);
  }

  function showModal() {
    overlay.classList.remove('hidden');
  }

  function closeModal() {
    overlay.classList.add('hidden');
    dialogBody.innerHTML = '';
    dialogActions.innerHTML = '';
  }

  function showStats() {
    var st = Stats.getStats();
    var rows = Object.keys(Cfg.DIFFICULTIES).map(function (k) {
      var b = st.bestByDiff[k];
      return '<tr><td>' + Cfg.DIFFICULTIES[k].label + '</td><td>' +
        (b.best == null ? '--' : Cfg.formatTime(b.best)) + '</td><td>' + b.wins + '/' + b.games + '</td></tr>';
    }).join('');
    dialogTitle.textContent = '📊 統計';
    dialogBody.innerHTML =
      '<div class="stats-grid">' +
      '<div class="stat-card"><b>' + st.wins + '</b><span>勝場</span></div>' +
      '<div class="stat-card"><b>' + st.games + '</b><span>局數</span></div>' +
      '<div class="stat-card"><b>' + Stats.getLevel() + '</b><span>已達關卡</span></div>' +
      '<div class="stat-card"><b>' + st.hints + '</b><span>提示次數</span></div>' +
      '</div>' +
      '<table class="stats-table"><thead><tr><th>難度</th><th>最快</th><th>勝/局</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>';
    dialogActions.innerHTML = '<button class="dlg-btn primary" id="dlg-ok">確定</button>';
    showModal();
    $('dlg-ok').addEventListener('click', closeModal);
  }

  function showHelp() {
    dialogTitle.textContent = '❓ 遊戲說明';
    dialogBody.innerHTML =
      '<ul class="help-list">' +
      '<li>點選格子選取，再按 1–9 填入數字。</li>' +
      '<li>開啟 ✎ 筆記模式可填入多個候選數。</li>' +
      '<li>按 ⌫ 清除，↺ 復原，💡 獲得提示。</li>' +
      '<li>錯誤超過 ' + GG.MISTAKE_LIMIT + ' 次即挑戰失敗。</li>' +
      '<li>依難度與關卡推進，挑戰你的最佳時間！</li>' +
      '</ul>';
    dialogActions.innerHTML = '<button class="dlg-btn primary" id="dlg-help-ok">明白了</button>';
    showModal();
    $('dlg-help-ok').addEventListener('click', closeModal);
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);