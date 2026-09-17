(function (global) {
  'use strict';

  var DIFFICULTIES = {
    easy: { label: '簡單', clues: 38 },
    medium: { label: '中等', clues: 31 },
    hard: { label: '困難', clues: 26 },
    expert: { label: '高手', clues: 22 }
  };

  var DEFAULT_SETTINGS = {
    theme: 'classic',
    sound: true,
    currentDiff: 'easy'
  };

  var SETTINGS_KEY = 'sudoku.settings.v1';
  var STATS_KEY = 'sudoku.stats.v1';
  var SAVE_KEY = 'sudoku.save.v1';
  var LEVELS_KEY = 'sudoku.level.v1';

  function loadJSON(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      var data = JSON.parse(raw);
      if (data == null) return fallback;
      if (typeof data === 'object' && typeof fallback === 'object') {
        return Object.assign({}, fallback, data);
      }
      return data;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function loadSettings() {
    return Object.assign({}, DEFAULT_SETTINGS, loadJSON(SETTINGS_KEY, {}));
  }

  function saveSettings(s) {
    saveJSON(SETTINGS_KEY, s);
  }

  function defaultStats() {
    var stats = {
      games: 0,
      wins: 0,
      totalTimeSec: 0,
      hints: 0,
      bestByDiff: {}
    };
    Object.keys(DIFFICULTIES).forEach(function (k) {
      stats.bestByDiff[k] = { best: null, games: 0, wins: 0 };
    });
    return stats;
  }

  function loadStats() {
    return loadJSON(STATS_KEY, defaultStats());
  }

  function saveStats(stats) {
    saveJSON(STATS_KEY, stats);
  }

  function loadLevel() {
    var n = loadJSON(LEVELS_KEY, 1);
    return typeof n === 'number' && n > 0 ? n : 1;
  }

  function saveLevel(n) {
    saveJSON(LEVELS_KEY, n);
  }

  function loadSave() {
    return loadJSON(SAVE_KEY, null);
  }

  function saveGame(state) {
    saveJSON(SAVE_KEY, state);
  }

  function clearSave() {
    try {
      global.localStorage.removeItem(SAVE_KEY);
    } catch (e) {}
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  global.SudokuConfig = {
    DIFFICULTIES: DIFFICULTIES,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    SETTINGS_KEY: SETTINGS_KEY,
    STATS_KEY: STATS_KEY,
    SAVE_KEY: SAVE_KEY,
    LEVELS_KEY: LEVELS_KEY,
    loadJSON: loadJSON,
    saveJSON: saveJSON,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    defaultStats: defaultStats,
    loadStats: loadStats,
    saveStats: saveStats,
    loadLevel: loadLevel,
    saveLevel: saveLevel,
    loadSave: loadSave,
    saveGame: saveGame,
    clearSave: clearSave,
    formatTime: formatTime
  };
})(window);