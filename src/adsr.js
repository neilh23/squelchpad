function ADSR(context, opts) {
  this.input = this.output = context.createGain();
  this._context = context;

  var p = this.meta.params;
  opts = opts || {};
  this._attack = opts.attack || p.attack.defaultValue;
  this._peak = opts.peak || p.peak.defaultValue;
  this._decay = opts.decay || p.decay.defaultValue;
  this._sustain = opts.sustain || p.sustain.defaultValue;
  this._minSustain = opts.minSustain || p.minSustain.defaultValue;
  this._release = opts.release || p.release.defaultValue;
}

ADSR.prototype = Object.create(null, {
  connect: { value: function (dest) { this.output.connect( dest.input ? dest.input : dest ); } },
  disconnect: { value: function () { this.output.disconnect(); } },
  noteOn: { value: function() {
    var gain = this.output.gain;
    var now = this._context.currentTime;

    gain.cancelScheduledValues(now);
    if (now < this.releaseTime) {
      now = now + 0.08;
      gain.exponentialRampToValueAtTime(0.001, now);
    } else {
      gain.setValueAtTime(0.001, now);
    }
    var peakTime = (now + this._attack);
    this._decayTime = (peakTime + this._decay);
    // to investigate - using 'expRampTo' here causes the sound to cut out
    //gain.exponentialRampToValueAtTime(this._peak, peakTime);
    gain.linearRampToValueAtTime(this._peak, peakTime);
    gain.exponentialRampToValueAtTime(this._sustain, this._decayTime);
  }},
  noteOff: { value: function() {
    var gain = this.output.gain;
    var now = this._context.currentTime;
    var startRelease = this._decayTime + this._minSustain;
    this.releaseTime = Math.max(startRelease, now) + this.release;
    if (this._minSustain > 0 && now < startRelease) {
      // ramp to the same value (i.e. don't start release yet)
      gain.linearRampToValueAtTime(this._sustain, startRelease);
    }
    gain.exponentialRampToValueAtTime(0.001, this.releaseTime);
    gain.setValueAtTime(0, this.releaseTime);
  }},

  meta: { value: {
    name: "ADSR",
    params: {
      attack: { min: 0, max: 5, defaultValue: 0.01, type: "float" },
      peak: { min: 0, max: 1.0, defaultValue: 1.0, type: "float" },
      decay: { min: 0, max: 5, defaultValue: 0.01, type: "float" },
      sustain: { min: 0, max: 0.5, defaultValue: 0.8, type: "float" },
      minSustain: { min: 0, max: 5, defaultValue: 0.0, type: "float" },
      release: { min: 0, max: 10, defaultValue: 0.01, type: "float" }
    }
  } },
  attack: {
    enumerable: true,
    get: function() { return this._attack; },
    set: function(value) { this._attack = value; }
  },
  peak: {
    enumerable: true,
    get: function() { return this._peak; },
    set: function(value) { this._peak = value; }
  },
  decay: {
    enumerable: true,
    get: function() { return this._decay; },
    set: function(value) { this._decay = value; }
  },
  sustain: {
    enumerable: true,
    get: function() { return this._sustain; },
    set: function(value) { this._sustain = value; }
  },
  minSustain: {
    enumerable: true,
    get: function() { return this._minSustain; },
    set: function(value) { this._minSustain = value; }
  },
  release: {
    enumerable: true,
    get: function() { return this._release; },
    set: function(value) { this._release = value; }
  }
});
