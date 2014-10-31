/* global console */
function SynthPad(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 
  var el = this.element = args.element;

  el.squelch({
    baseColor: args.baseColor||'blue',
    xvelmin: 90,
    xvelmax: 8000,
    yvelmin: 0.8,
    yvelmax: 0.1
  });

  this.attack = 0.1||args.attack;
  this.decay = 0.5||args.decay;

  // override this to 432hz
  // http://www.whydontyoutrythis.com/2013/08/440hz-music-conspiracy-to-detune-good-vibrations-from-natural-432hz.html
  this.base_frequency = 440||args.base_frequency;

  this.gain = this.context.createGain();
  this.gain.connect(this.destination);
  this.gain.gain.value = 0.0;

  this.oscillator = this.context.createOscillator();
  this.oscillator.type = 0;
  this.oscillator.connect(this.gain);
  this.oscillator.start(0);

  var target = this;
  el.on("squelchOn", function(e, args) {
    target.oscillator.frequency.value = args.xvel;
    var now = target.context.currentTime;
    var param = target.gain.gain;
    param.cancelScheduledValues(now);
    console.log("Ramping value to " + args.yvel);
    param.linearRampToValueAtTime(args.yvel, now + this.attack);
  });
  el.on("squelchOff", function() {
    // TODO: oscillator is still running in the background,
    // should probably do some cleanup here
    var param = target.gain.gain;
    var now = target.context.currentTime;
    param.cancelScheduledValues(now);
    console.log("Ramping value to 0");
    param.linearRampToValueAtTime(0, now + this.decay);
  });
}

SynthPad.prototype = Object.create(null, {
  midicps: { value: function(midi) { return (this.base_freq||440)* Math.pow(2, (midi - 69) / 12); }},
  // FIXME: create function for note 2 cps, e.g. 'C4', 'D#6', 'Gb3'
});
