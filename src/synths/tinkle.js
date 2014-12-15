/* -- global console */
function Tinkle(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 

  this.attack = 0.05||args.attack;
  this.decay = 0.02||args.attack;
  this.release = 1.4||args.release;
  this.frequency = args.frequency;
}

Tinkle.prototype = Object.create(null, {
  playNote: { value: function(args) {
    "use strict";
    this.gain = this.context.createGain();
    this.gain.connect(this.destination);

    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 0;
    this.oscillator.connect(this.gain);
    this.oscillator.start(0);

    this.oscillator.frequency.value = this.frequency;

    var now = this.context.currentTime;
    var param = this.gain.gain;
    this.peakTime = (now + this.attack);
    this.decayTime = (this.peakTime + this.decay);
    args.yvel = args.yvel|| Math.random();

    var peak = 0.1 + (args.yvel||Math.sqrt(Math.random()))*0.3;

    param.setValueAtTime(0.01, now);
    param.exponentialRampToValueAtTime(peak, this.peakTime);
    var decay = peak*0.85;
    param.exponentialRampToValueAtTime(decay, this.decayTime);
  }},
  stopNote: { value: function(/*args*/) {
    var param = this.gain.gain;
    var now = this.context.currentTime;
    this.releaseTime = Math.max(this.decayTime, now) + this.release;
    param.exponentialRampToValueAtTime(0.01, this.releaseTime);
    this.oscillator.stop(now + this.release);
  }}
});

/* global addSynth */
if (addSynth !== undefined) {
  addSynth("Tinkle", function(args) { return new Tinkle(args); });
}
