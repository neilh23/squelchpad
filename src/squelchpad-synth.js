/* -- global console */
function Synth(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination;
  this.synth = Synth.default_synth;

  // override this to 432hz
  // http://www.whydontyoutrythis.com/2013/08/440hz-music-conspiracy-to-detune-good-vibrations-from-natural-432hz.html
  this.base_frequency = args.base_frequency || 440;
  this.base_octave = args.base_octave || 4;

  this.base_color = args.base_color;
}

Synth.synths = {};

/* exported addSynth */
function addSynth(name, factory) {
  Synth.synths[name] = factory;
  if (Synth.default_synth === undefined) {
    Synth.default_synth = {
      "name": name,
      "factory": factory
    };
  }
}

Synth.prototype = Object.create(null, {
  midicps: {
    value: function(midi) {
      return (this.base_freq || 440) * Math.pow(2, (midi - 69) / 12);
    }
  },
  // FIXME: create function for note 2 cps, e.g. 'C4', 'D#6', 'Gb3'

  setSynth: {
    value: function(name) {
      if (Synth.synths[name] === undefined) {
        throw "No such synth: " + name;
      }
      this.synth = {
        "name": name,
        "factory": Synth.synths[name]
      };
    }
  },

  addNote: {
    value: function(element, note, args) {
      "use strict";

      if (args.base_color !== undefined) {
        this.base_color = args.base_color;
      }
      if (args.base_octave !== undefined) {
        this.base_octave = args.base_octave;
      }

      if (args.synth !== undefined) {
        this.setSynth(args.synth);
      }

      var frequency = this.midicps(note);
      // console.log("Calculated frequency " + frequency + " for midi note: " + note);

      element.squelch({
        baseColor: this.base_color || 'blue',
        width: 90,
        xveltype: 'exp',
        xvelmin: 0,
        xvelmax: 1,
        yveltype: 'exp',
        yvelmin: 0,
        yvelmax: 1,
        velmin: 0,
        velmax: 0
      });

      element.squelch_synth = this.synth.factory({
        "frequency": frequency,
        "context": this.context,
        "destination": this.destination
      });

      element.on("squelchOn", function(e, args) {
        element.squelch_synth.playNote(args);
      });
      element.on("squelchOff", function(e, args) {
        element.squelch_synth.stopNote(args);
      });

    }
  }
});
