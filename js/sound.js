(function (global) {
  'use strict';

  var ctx = null;
  var master = null;
  var enabled = true;

  function ensure() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function tone(freq, dur, type, gain, when, slideTo) {
    if (!enabled) return;
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.2, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, gain) {
    if (!enabled) return;
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime;
    var buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    var src = c.createBufferSource();
    src.buffer = buffer;
    var g = c.createGain();
    g.gain.setValueAtTime(gain || 0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(g);
    g.connect(master);
    src.start(t0);
  }

  global.SudokuSound = {
    unlock: function () { ensure(); },
    setEnabled: function (v) { enabled = !!v; },
    isEnabled: function () { return enabled; },
    click: function () { tone(320, 0.06, 'square', 0.06); },
    select: function () { tone(520, 0.05, 'sine', 0.07); },
    place: function () { tone(660, 0.09, 'sine', 0.16); tone(990, 0.07, 'sine', 0.08, 0.03); },
    erase: function () { tone(420, 0.07, 'sine', 0.1, 0, 240); },
    noteToggle: function () { tone(440, 0.06, 'triangle', 0.12); tone(600, 0.06, 'triangle', 0.08, 0.05); },
    error: function () { tone(180, 0.18, 'sawtooth', 0.18, 0, 90); noise(0.15, 0.12); },
    hint: function () { tone(880, 0.08, 'sine', 0.14); tone(1320, 0.1, 'sine', 0.12, 0.07); },
    undo: function () { tone(500, 0.05, 'sine', 0.08, 0, 700); },
    win: function () {
      var notes = [523, 659, 784, 1047];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], 0.18, 'triangle', 0.2, i * 0.13);
      }
      tone(1568, 0.4, 'triangle', 0.16, 0.55);
      noise(0.2, 0.04);
    }
  };
})(window);