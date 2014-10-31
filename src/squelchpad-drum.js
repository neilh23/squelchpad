/*
 * position:
 * +---------------------+
 * |TL        T        TR|
 * |                     |
 * |                     |
 * |                     |
 * |L         M         R|
 * |                     |
 * |                     |
 * |                     |
 * |BL        B        BR|
 * +---------------------+
 * or no specification for constant
 * e.g.
 * samples: [ { sample: 'kick1.wav', pan: true },
 *   { sample: 'kick2.wav', position: 'M' },
 *   { sample: 'kick3.wav', position: 'M', inverse: true },
 *   { sample: 'kick4.wav', position: 'TR' },
 *   { sample: 'kick5.wav', position: 'TL' },
 *   { sample: 'kick6.wav', position: 'BR' },
 *   { sample: 'kick7.wav', position: 'BL' },
 * ]
 * will create a drumpad which has:
 * * kick1 played at a constant volume, but panned based on 
 * * kick2 played loudest closest to the centre
 * * kick3 played quietest closest to the centre
 * * kicks 4,5,6,7 played loudest closest to the four corners
 *
 * options:
 * * baseColor: passed through to squelchpad
 */

function DrumPad(args) {
  "use strict";
  this.context = args.context;
  this.destination = args.destination || this.context.destination; 
  var el = this.element = args.element;

  this.samples = args.samples;
  this.loaded = 0;

  this.hasPan = false;

  el.squelch({baseColor: args.baseColor||'blue' });

  for (var i = 0; i < this.samples.length; i++) {
    var p = this.samples[i];

    p.gainNode = this.context.createGain();
    if (p.pan) {
      if (!this.hasPan) {
        this.hasPan = true;

        this.pan = this.context.createPanner();
        this.pan.panningModel = 'equalpower';
        this.pan.connect(this.destination);
      }
      p.gainNode.connect(this.pan);
    } else {
      p.gainNode.connect(this.destination);
    }
    var request = new XMLHttpRequest();
    request.open('GET', p.sample, true);
    request.responseType = 'arraybuffer';
    request.drumpad = this;
    request.squindex = i;
    /* jshint ignore:start */
    request.addEventListener('load',
      function(e) {
        var t = e.target;
        t.drumpad.fileLoaded(t.squindex, t.response);
      }, false
    );
    /* jshint ignore:end */
    request.send();
  }
}

DrumPad.prototype = Object.create(null, {
  cornerGain: { value: function(xvel, yvel) {
    "use strict";
    if (xvel <= 0) { return 0; }
    if (yvel <= 0) { return 0; }

    return Math.sqrt(Math.pow(xvel, 2) + Math.pow(yvel, 2));
  }}, 
  squelch: { value: function(args) {
    "use strict";
    if (this.hasPan) {
      this.pan.setPosition(args.xvel, 0, 1-Math.abs(args.xvel));
    }

    for (var i = 0; i < this.samples.length; i++) {
      var p = this.samples[i];

      var gain = 1.0;
      switch(p.position) {
        case 'M': gain = args.velocity; break;
        case 'R': gain = args.xvel; break;
        case 'L': gain = 1.0 - args.xvel; break;
        case 'T': gain = args.yvel;  break;
        case 'B': gain = 1.0 - args.yvel;  break;
        case 'TR': gain = this.cornerGain(args.xvel, -args.yvel); break;
        case 'TL': gain = this.cornerGain(-args.xvel, -args.yvel); break;
        case 'BR': gain = this.cornerGain(args.xvel, args.yvel); break;
        case 'BL': gain = this.cornerGain(-args.xvel, args.yvel); break;
      }
      if (p.inverse) { gain = 1.0 - gain; }

      if (gain <= 0.0) { continue; }

      p.gainNode.gain.value = gain;

      var src = this.context.createBufferSource();

      src.buffer = p.buffer;

      src.connect(p.gainNode);

      src.start(0);
    }
  }},
  fileLoaded: { value: function(index, response) {
    var target = this;
    this.context.decodeAudioData(response, function(buffer) {
      target.samples[index].buffer = buffer;
      target.loaded++;
      if (target.loaded >= target.samples.length) {
        target.element.on("squelchOn", function(e, args) { target.squelch(args); });
      }
    });
  }}
});
