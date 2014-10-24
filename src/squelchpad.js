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
      el.mousedown(function(ev) { el.squelch.bclick(el, ev); } );
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
    var wdth = el.width();
    var hght = el.height();
    var posX = (2*relX - wdth)/wdth;
    var posY = (2*relY - hght)/hght;

    // FIXME: optimise some of this ...
    var radius = Math.sqrt(Math.pow(wdth/2, 2) + Math.pow(wdth/2, 2));
    // console.log("Radius: " + radius);
    var x1 = Math.pow(relX - wdth/2, 2);
    var y1 = Math.pow(relY - hght/2, 2);
    var z = x1 + y1;
    var p = Math.sqrt(z)/radius;
    // console.log("z: " + z + " , p " + p);

    var velocity = 1.0 - p;

    // console.log("Velocity: " + velocity);

    el.trigger("squelchOn", {velocity: velocity, posX: posX, posY: posY});

    el.css('backgroundColor', newColor);

    body.one("mouseup mouseleave", function() {
      el.trigger("squelchOff", {});
      el.animate({ backgroundColor: oldColor }, 200);
    });
  };

  $.fn.squelch.options = {
    height: 140,
    xmin: 0.0,
    xmax: 1.0,
    ymin: 0.0,
    ymax: 1.0,
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

  // Custom selector.
  $.expr[':'].squelch = function (elem) {
    return $(elem).text().indexOf('squelch') !== -1;
  };

}(jQuery));
