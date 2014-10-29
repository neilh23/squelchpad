function SynthPad(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 
  var el = this.element = args.element;

  el.squelch({
    baseColor: args.baseColor||'blue',
    xvelmin: 90,
    xvelmax: 8000,
    yvelmin: 6.0,
    yvelmax: 0.1
  });

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
    target.gain.gain.value = args.yvel;
  });
  el.on("squelchOff", function(e, args) {
    // TODO: less efficient than just recreating the oscillator
    // every time?
    target.gain.gain.value = 0.0;
  });
}
