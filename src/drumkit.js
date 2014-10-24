var audioContext,destination,wet,dry,pan;

function bufferSound(event) {
  var index = event.target.squindex;


  audioContext.decodeAudioData(event.target.response, function(buffer) {
    var bt = $('#bt'+index);
    bt.on("squelchOn", function(e, args) {
      var vel = args.velocity;

      wet.gain.value = 1.0 - vel;
      dry.gain.value = vel;0

      if (index == 1) {
        console.log(args.posX);
        pan.setPosition(args.posX, 0, 1-Math.abs(args.posX));
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

  var samples = [ "sounds/kick.wav", "sounds/hihat.wav", "sounds/snare.wav" ];

  for (var i = 0; i < samples.length; i++) {
    var request = new XMLHttpRequest();
    request.open('GET', samples[i], true);
    request.responseType = 'arraybuffer';
    request.squindex = i;
    request.addEventListener('load', bufferSound, false);
    request.send();
  }
}

