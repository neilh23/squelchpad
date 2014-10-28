var audioContext,destination,wet,dry,pan;

function bufferSound(event) {
  var index = event.target.squindex;


  audioContext.decodeAudioData(event.target.response, function(buffer) {
    var bt = $('#bt'+index);
    bt.on("squelchOn", function(e, args) {
      var vel = args.velocity;

      wet.gain.value = 1.0 - vel;
      dry.gain.value = vel;

      if (index == 1) {
        pan.setPosition(args.xvel, 0, 1-Math.abs(args.xvel));
      }

      var src = audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(destination[index]);
      src.noteOn(0);
    });
    /*
    bt.on("squelchOff", function(args) {
      console.log("Unsquelched " + index);
    });
    */
  });
}

function startKit() {
  try {
    audioContext = new webkitAudioContext();
  } catch(e) { alert("Web Audio API is not supported in this browser"); }

  $('#bt0').squelch({baseColor: 'red'});
  $('#bt1').squelch({baseColor: 'green'});
  $('#bt2').squelch({baseColor: 'blue'});
  /*
  $('.squelch').on("squelchOn", function(e, args) {
    console.log("Squelch: " + args.velocity + "/" + args.xvel + "/" + args.yvel);
  });
  */

  var verb = new SimpleReverb(audioContext, { seconds: 1.0, decay: 4, reverse: 0 });
  var master = audioContext.createGain();
  wet = audioContext.createGain();
  dry = audioContext.createGain();
  pan = audioContext.createPanner();
  pan.panningModel = 'equalpower';

  pan.connect(verb.input);
  pan.connect(dry);

  master.connect(verb.input);
  master.connect(dry);

  verb.connect(wet);

  wet.connect(audioContext.destination);
  dry.connect(audioContext.destination);

  destination = [ master, pan, master ];

  var samples = [ "sounds/kick.wav", "sounds/hihat-closed.wav", "sounds/hihat-closed.wav", "sounds/snare.wav" ];

  var index = 0;
  for (var i = 0; i < samples.length; i++) {
    var request = new XMLHttpRequest();
    request.open('GET', samples[i], true);
    request.responseType = 'arraybuffer';
    request.squindex = i;
    request.addEventListener('load', bufferSound, false);
    request.send();
    if (i != 1) { index++; }
  }
}

/*
 * position:
 * +---------------------+
 * |TR        T        TL|
 * |                     |
 * |                     |
 * |                     |
 * |R         M         L|
 * |                     |
 * |                     |
 * |                     |
 * |BR        B        BL|
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
  this.destination = args.destination || context.destination; 
  var el = this.element = args.element;

  this.samples = args.samples;
  this.loaded = 0;

  this.hasPan = false;

  el.squelch({baseColor: args.baseColor||'blue' });

  for (var i = 0; i < this.samples.length; i++) {
    var p = this.samples[i];
    if (p.pan && !this.hasPan) {
      this.hasPan = true;

      pan = audioContext.createPanner();
      pan.panningModel = 'equalpower';
      pan.connect(this.destination);
    }
    var request = new XMLHttpRequest();
    request.open('GET', p.sample, true);
    request.responseType = 'arraybuffer';
    request.drumpad = this;
    request.squindex = this;
    request.addEventListener('load', function(e) { var t = e.target; t.drumpad.fileLoaded(t.squindex, t.response); }, false);
    request.send();
  }
}

DrumPad.prototype = Object.create(null, {
  squelch: { value: function(args) {
    "use strict";
    var vel = args.velocity;

    wet.gain.value = 1.0 - vel;
    dry.gain.value = vel;

    if (this.hasPan) {
      this.pan.setPosition(args.xvel, 0, 1-Math.abs(args.xvel));
    }

    for (var i = 0; i < this.samples.length; i++) {
      var p = this.samples[i];

      var src = audioContext.createBufferSource();
      src.buffer = p.buffer;
      if (p.pan) {
        src.connect(this.pan);
      } else {
        src.connect(this.destination);
      }
      var gain = 1.0;
      switch(p.position) {
        case 'M': gain = vel; break;
        case 'L': gain = xvel; break;
      }
      if (p.inverse) {
        gain = 1.0 - gain;
      }
      src.noteOn(0);
    }
  }},
  fileLoaded: { value: function(index, response) {
    this.context.decodeAudioData(response, function(buffer) {
      this.samples[index].buffer = buffer;
      this.loaded++;
      if (this.loaded >= this.samples.length) {
        this.element.on("squelchOn", function(e, args) { this.squelch(args); });
      });
    });
  }}
});
