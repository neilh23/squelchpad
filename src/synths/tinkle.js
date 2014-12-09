/* -- global console */
function Tinkle(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 

  this.attack = 0.18||args.attack;
  this.release = 1.8||args.release;
  this.frequency = args.frequency;
}

Tinkle.prototype = Object.create(null, {
  playNote: { value: function(args) {
    "use strict";
    this.gain = this.context.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.destination);

    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 0;
    this.oscillator.connect(this.gain);
    this.oscillator.start(0);

    this.oscillator.frequency.value = this.frequency;

    var now = this.context.currentTime;
    var param = this.gain.gain;
    this.peakTime = (now + this.attack);
    param.exponentialRampToValueAtTime(args.yvel, this.peakTime);
  }},
  stopNote: { value: function(/*args*/) {
    // TODO: oscillator is still running in the background,
    // should probably do some cleanup here
    var param = this.gain.gain;
    var now = this.context.currentTime;
    this.releaseTime = Math.max(this.peakTime, now) + this.release;
    param.exponentialRampToValueAtTime(0.01, this.releaseTime);
    this.oscillator.stop(now + this.release);
  }}
});

/* global addSynth */
if (addSynth !== undefined) {
  addSynth("Tinkle", function(args) { return new Tinkle(args); });
}

