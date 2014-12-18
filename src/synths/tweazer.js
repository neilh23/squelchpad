/* -- global console */
function Tweazer(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 

  this.frequency = args.frequency;

  /* global ADSR */
  this.adsr = new ADSR(args.context, { 
    attack: 0.15||args.attack,
    peak: 1.0||args.peak,
    decay: 0.09||args.decay,
    sustain: 0.85||args.sustain,
    release: 1.9||args.release
  });
  this.gain = args.context.createGain();
  this.adsr.connect(this.gain);
  this.lopass = this.context.createBiquadFilter();
  this.lopass.frequency.value = 180;
  this.lfogain = args.context.createGain();
  this.lfogain.gain.value = 100;
  this.lfo = this.context.createOscillator();
  this.lfo.type = 0;
  this.lfo.frequency.value = 9;
  this.lfo.connect(this.lfogain);
  //this.lfogain.connect(this.lopass.detune);
  this.lfogain.connect(this.lopass.frequency);
  this.lfo.start(0);

  this.gain.connect(this.lopass);
  this.lopass.connect(this.destination);
}

Tweazer.prototype = Object.create(null, {
  playNote: { value: function(args) {
    "use strict";
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 0;
    this.oscillator.connect(this.adsr.input);
    this.oscillator.frequency.value = this.frequency;

    this.osc2 = this.context.createOscillator();
    this.osc2.type = 2;
    this.osc2.frequency.value = this.frequency*3/2;

    this.osc2.connect(this.adsr.input);

    var volume = 0.6 + (args.yvel||Math.sqrt(Math.random()))*0.3;

    this.gain.gain.setValueAtTime(volume, this.context.currentTime);

    this.oscillator.start(0);
    this.osc2.start(0);
    this.adsr.noteOn();
  }},
  stopNote: { value: function(/*args*/) {
    this.adsr.noteOff();
    this.oscillator.stop(this.adsr.releaseTime);
    this.osc2.stop(this.adsr.releaseTime);
  }}
});

/* global addSynth */
if (addSynth !== undefined) {
  addSynth("Tweazer", function(args) { return new Tweazer(args); });
}
