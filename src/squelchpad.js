/*
 * squelchpad
 * 
 *
 * Copyright (c) 2014 Neil Howie
 * Licensed under the MIT license.
 */

(function ($) {
  'use strict';
  // Collection method.
  $.fn.squelch = function (options) {
    options = $.extend({}, $.fn.squelch.options, options);
    var baseHue = $.Color(options.baseColor).hue();
    var defaultColor = $.Color({
      hue: baseHue,
      saturation: options.defaultSaturation,
      lightness: options.minLightness,
    });
    options.defaultColor = defaultColor;
    return this.each(function () {
      var el = $(this);
      el.data('squelch', options);
      el.css({
        backgroundColor: defaultColor,
        padding: '0px',
        margin: '2px',
        borderRadius: '9px',
        boxShadow: options.defaultBoxShadow,
        width: options.height + 'px',
        height: options.height + 'px',
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'moz-none',
        '-ms-user-select': 'none',
        'user-select': 'none'

      });
      el.on("mousedown touchstart", function(ev) { el.squelch.bclick(el, ev); } );
    });
  };

  $.fn.squelch.bclick = function(el, event) {
    var body = $('body');

    var options = el.data('squelch');

    var oldColor = options.defaultColor;
    var light = oldColor.lightness();
    light = Math.min(light + 0.2, 1.0);

    var newColor = $.Color(oldColor).lightness(light);

    var parentOffset = el.parent().offset(); 
    var relX = event.pageX - parentOffset.left;
    var relY = event.pageY - parentOffset.top;
    var wdth = el.width(); // get these fresh in case of size change underneath
    var hght = el.height();
    var xmin = options.yvelmin;
    var xmax = options.xvelmax;
    var ymin = options.yvelmin;
    var ymax = options.yvelmax;
    var xpos = xmin + (xmax - xmin)*relX/wdth;
    var ypos = ymin + (ymax - ymin)*relY/hght;
    var velmin = options.velmin;
    var velmax = options.velmax;

    // FIXME: optimise some of this ...
    var radius = Math.sqrt(Math.pow(wdth/2, 2) + Math.pow(wdth/2, 2));
    var z = Math.pow(relX - wdth/2, 2) + Math.pow(relY - hght/2, 2);
    var p = Math.sqrt(z)/radius;
    // console.log("z: " + z + " , p " + p);

    // var velocity = velmin + velmax - p*(velmax - velmin);
    var velocity = velmin*(1 + p) + velmax*(1 - p);

    el.trigger("squelchOn", {velocity: velocity, xvel: xpos, yvel: ypos});

    el.css('backgroundColor', newColor);

    // FIXME: use hammer.js - https://hammerjs.github.io/
    body.one("mouseup mouseleave touchend touchcancel", function() {
      el.trigger("squelchOff", {});
      el.animate({ backgroundColor: oldColor }, 200);
    });
  };

  $.fn.squelch.options = {
    height: 140,
    xvelmin: -1.0,
    xvelmax: 1.0,
    xveltype: 'lin',
    yvelmin: -1.0,
    yvelmax: 1.0,
    yveltype: 'exp',
    velmin: 0.0,
    velmax: 1.0,
    veltype: 'lin', // 'lin' or 'exp'
    minLightness: 0.25,
    maxLightness: 0.9,
    baseColor: 'blue',
    defaultBoxShadow: '2px 2px 2px black',
    highlightBoxShadow: '2px 2px 1px #666',
    defaultSaturation: 0.8,
  };

  // Static method.
  $.squelch = function (options) {
    options = $.extend({}, $.squelch.options, options);
    return '';
  };

  // Static method default options.
  $.squelch.options = {
  };

}(jQuery));
