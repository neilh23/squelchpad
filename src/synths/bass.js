/* -- global console */
function Bass(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 

  this.attack = 0.01||args.attack;
  this.decay = 0.1||args.attack;
  this.release = 0.5||args.release;
  this.frequency = args.frequency;
}

Bass.prototype = Object.create(null, {
  playNote: { value: function(args) {
    "use strict";
    this.gain = this.context.createGain();
    this.gain.connect(this.destination);

    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 0;
    this.oscillator.connect(this.gain);
    this.oscillator.start(0);

    this.oscillator.frequency.value = this.frequency;

    this.sub = this.context.createOscillator();
    this.sub.type = 0;
    this.sub.connect(this.gain);
    this.sub.start(0);

    this.sub.frequency.value = this.frequency/2;

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
  addSynth("Bass", function(args) { return new Bass(args); });
}
