/*
 * squelchscope
 *
 *
 * Copyright (c) 2014 Neil Howie
 * Licensed under the MIT license.
 */

/* -- global console */

function SquelchScope($, el, options) {
  // TODO: code nicked from squelchpad class
  // move this into a utility class,
  // still need to rewrite colour bits to not use jqueryColor library ...

  "use strict";
  this.element = el;

  this.jQuery = $;

  if (options !== undefined) {
    if (options.toggle === undefined) {
      options.toggle = 0;
    } else if (options.toggle === true) {
      options.toggle = 1;
    }
  }

  options = this.options = $.extend({}, this.defaultOptions, options);

  this._context = options.context;

  if (this._context === undefined) {
    throw "No audio context passed to scope constructor";
  }

  var baseHue = $.Color(options.baseColor).hue();

  var defaultColor = $.Color({
    hue: baseHue,
    saturation: options.saturation,
    lightness: options.lightness,
  });

  options.defaultColor = defaultColor;

  var borderRad = '9px';

  if (options.shape === 'circle') {
    borderRad = '50%';
  }

  el.on("contextmenu", function() {
    return false;
  }); // disable context menu on right click

  this.input = this.output = this._analyser =  this._context.createAnalyser();
  this._bufferLength = this._analyser.fftSize;
  this._dataArray = new Uint8Array(this._bufferLength);
  this._analyser.minDecibels = -90;
  this._analyser.maxDecibels = -10;
  this._analyser.smoothingTimeConstant = 0.85;

  el.css({
    backgroundColor: defaultColor,
    padding: '0px',
    margin: '2px',
    borderRadius: borderRad,
    boxShadow: options.defaultBoxShadow,
    width: options.width,
    height: options.height || options.width,
    '-webkit-touch-callout': 'none',
    '-webkit-user-select': 'none',
    '-khtml-user-select': 'none',
    '-moz-user-select': 'moz-none',
    '-ms-user-select': 'none',
    'user-select': 'none'
  });


  this._width = el.width();
  this._height = el.height();

  var newCanvas = $('<canvas style="margin-left:auto;margin-right:auto"/>').width(this._width).height(this._height);
  el.append($(newCanvas));

  newCanvas.css({
    backgroundColor: defaultColor,
    padding: '0px',
    margin: '2px',
    borderRadius: borderRad,
    boxShadow: options.defaultBoxShadow,
    width: this._width,
    height: this._height,
    '-webkit-touch-callout': 'none',
    '-webkit-user-select': 'none',
    '-khtml-user-select': 'none',
    '-moz-user-select': 'moz-none',
    '-ms-user-select': 'none',
    'user-select': 'none'
  });
  

  this._canvasCtx = $(newCanvas).get(0).getContext("2d");

  this._draw();
}

SquelchScope.prototype = Object.create(null, {
  connect: { value: function (dest) { this.output.connect( dest.input ? dest.input : dest ); } },
  disconnect: { value: function () { this.output.disconnect(); } },
  _draw: { value: function () {
    var scope = this;
    function draw() {
      // later, can call window.cancelAnimationFrame(drawVisual);
      /* var drawVisual = */ window.requestAnimationFrame(draw);
      var analyser = scope._analyser;
      var canvasCtx = scope._canvasCtx;

      analyser.getByteTimeDomainData(scope._dataArray);

      canvasCtx.fillStyle = scope.options.defaultColor;
      canvasCtx.fillRect(0, 0, scope._width, scope._height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

      canvasCtx.beginPath();

      var sliceWidth = scope._width * 1.0 / scope._bufferLength;
      var x = 0;

      for(var i = 0; i < scope._bufferLength; i++) {
   
        var v = scope._dataArray[i] / 128.0;
        var y = v * scope._height/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(scope._width, scope._height/2);
      canvasCtx.stroke();
    }
    draw();
  }},
  defaultOptions: {
    value: {
      width: 140,
      baseColor: 'blue',
      defaultBoxShadow: '2px 2px 2px black',
      highlightBoxShadow: '2px 2px 1px #666',
      saturation: 0.8,
      lightness: 0.4
    }
  }
});

(function($) {
  'use strict';
  $.fn.squelch_scope = function(options) {
    return this.each(function() { new SquelchScope($, $(this), options); });
  };
}(jQuery));

