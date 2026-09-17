(function (global) {
  'use strict';

  var Cfg = global.SudokuConfig;

  var cache = Cfg.loadSettings();
  var stats = Cfg.loadStats();
  var level = Cfg.loadLevel();

  function getLevel() {
    return level;
  }

  function nextLevel() {
    level += 1;
    Cfg.saveLevel(level);
    return level;
  }

  function getSettings() {
    return cache;
  }

  function setTheme(t) {
    cache.theme = t;
    Cfg.saveSettings(cache);
  }

  function getTheme() {
    return cache.theme;
  }

  function setSound(on) {
    cache.sound = on;
    Cfg.saveSettings(cache);
  }

  function isSoundOn() {
    return cache.sound;
  }

  function getBestTime(diff) {
    var b = stats.bestByDiff[diff];
    return b ? b.best : null;
  }

  function recordGame(diff, won, seconds) {
    stats.games += 1;
    var b = stats.bestByDiff[diff];
    b.games += 1;
    if (won) {
      stats.wins += 1;
      b.wins += 1;
      if (!b.best || seconds < b.best) {
        b.best = seconds;
      }
    }
    stats.totalTimeSec += seconds || 0;
    Cfg.saveStats(stats);
  }

  function recordHint() {
    stats.hints += 1;
    Cfg.saveStats(stats);
  }

  function getStats() {
    return stats;
  }

  global.SudokuStats = {
    getLevel: getLevel,
    nextLevel: nextLevel,
    getSettings: getSettings,
    setTheme: setTheme,
    getTheme: getTheme,
    setSound: setSound,
    isSoundOn: isSoundOn,
    getBestTime: getBestTime,
    recordGame: recordGame,
    recordHint: recordHint,
    getStats: getStats
  };
})(window);