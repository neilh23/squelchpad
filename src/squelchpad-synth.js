/* -- global console */
function Synth(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 
  this.synth = Synth.default_synth;

  // override this to 432hz
  // http://www.whydontyoutrythis.com/2013/08/440hz-music-conspiracy-to-detune-good-vibrations-from-natural-432hz.html
  this.base_frequency = args.base_frequency||440;
  this.base_octave = args.base_octave||4;

  this.base_color = args.base_color;
}

Synth.synths = {};

/* exported addSynth */
function addSynth(name, factory) {
  Synth.synths[name] = factory;
  if (Synth.default_synth === undefined) {
    Synth.default_synth = { "name": name, "factory": factory };
  }
}

Synth.prototype = Object.create(null, {
  midicps: { value: function(midi) { return (this.base_freq||440)* Math.pow(2, (midi - 69) / 12); }},
  // FIXME: create function for note 2 cps, e.g. 'C4', 'D#6', 'Gb3'

  addNote: { value: function(element, note) {
    "use strict";
    var frequency = this.midicps(note);
    // console.log("Calculated frequency " + frequency + " for midi note: " + note);

    element.squelch({
      baseColor: this.base_color||'blue',
      width: 90,
      xvelmin: 150,
      xvelmax: 2000,
      xveltype: 'exp',
      yvelmin: 0.5,
      yvelmax: 0.25,
      yveltype: 'exp',
    });

    element.squelch_synth = this.synth.factory({ "frequency": frequency, "context": this.context });

    element.on("squelchOn", function(e, args) { element.squelch_synth.playNote(args); });
    element.on("squelchOff", function(e, args) { element.squelch_synth.stopNote(args); });

  }}
});
