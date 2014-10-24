var audioContext;
var $;

function bufferSound(event) {
  var index = event.target.squindex;

  audioContext.decodeAudioData(event.target.response, function(buffer) {
    var bt = $('#bt'+index);
    bt.on("squelchOn", function(e, args) {
      var src = audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(audioContext.destination);
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

