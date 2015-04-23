/* -- global console */
function Tinkle(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 

  this.frequency = args.frequency;

  /* global ADSR */
  this.adsr = new ADSR(args.context, { 
    attack: 0.05||args.attack,
    peak: 1.0||args.peak,
    decay: 0.02||args.decay,
    sustain: 0.85||args.sustain,
    release: 0.9||args.release
  });
  this.gain = args.context.createGain();
  this.adsr.connect(this.gain);
  this.gain.connect(this.destination);
}

Tinkle.prototype = Object.create(null, {
  playNote: { value: function(args) {
    "use strict";
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 0;
    this.oscillator.connect(this.adsr.input);
    // this.oscillator.connect(this.gain);

    this.oscillator.frequency.value = this.frequency;

    var volume = 0.05 + (args.yvel||Math.sqrt(Math.random()))*0.3;

    this.gain.gain.setValueAtTime(volume, this.context.currentTime);

    this.oscillator.start(0);
    this.adsr.noteOn();
  }},
  stopNote: { value: function(/*args*/) {
    this.adsr.noteOff();
    this.oscillator.stop(this.adsr.releaseTime);
  }}
});

/* global addSynth */
if (addSynth !== undefined) {
  addSynth("Tinkle", function(args) { return new Tinkle(args); });
}
