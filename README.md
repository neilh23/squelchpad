# Squelchpad

pad control influenced by synth control pads

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/neilh23/squelchpad/master/dist/jquery.squelchpad.min.js
[max]: https://raw.github.com/neilh23/squelchpad/master/dist/jquery.squelchpad.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/squelchpad.min.js"></script>
<script>
jQuery(function($) {
  $('#bt1').squelch({baseColor: 'red'});
  $('#bt2').squelch({baseColor: 'green'});
  $('#bt3').squelch({baseColor: 'blue'});

  $('#bt1').on("squelchOn", function(e, args) {
    // your code goes here, args contains at least the following:
    // args.velocity - value between 0 and  1 based on distance from centre
    // args.xvel - value between -1 and 1 based on horizontal position
    // args.yvel - value between -1 and 1 based on vertical position
    // args.touches - number of fingers pressed down if touched
  });
...
});
</script>
...
<div id="bt1"></div>
<div id="bt2"></div>
<div id="bt3"></div>
```

... or create a drumpad
```html
<script src="jquery.js"></script>
<script src="dist/squelchpad.min.js"></script>
<script src="dist/squelchpad-drum.min.js"></script>
<script>$(function($) { 
  var context;
  
  try {
    context = new webkitAudioContext();
  } catch(e) { alert("Web Audio API is not supported in this browser"); }

  new DrumPad({
    context: context,
    element: $('#bt0'),
    baseColor: 'red',
    samples: [ { sample: 'sounds/kick.wav' } ],
  });
  new DrumPad({
    context: context,
    element: $('#bt1'),
    baseColor: 'green',
    samples: [ { sample: 'sounds/hihat.wav' } ],
  });
  new DrumPad({
    context: context,
    element: $('#bt2'),
    baseColor: 'blue',
    samples: [ { sample: 'sounds/snare.wav' } ],
  });
</script>

...

<div id="bt1"></div>
<div id="bt2"></div>
<div id="bt3"></div>
```

## Documentation
_(Coming soon)_

## Examples
* [Drum kit made with DrumPad class](http://neilh23.github.io/squelchpad/drumkit.html "DrumPad"

## Release History
_(Nothing yet)_
