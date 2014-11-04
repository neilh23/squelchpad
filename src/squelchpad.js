/*
 * squelchpad
 * 
 *
 * Copyright (c) 2014 Neil Howie
 * Licensed under the MIT license.
 */

/* -- global console */

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
      if (el.data('squelch')) {
        el.trigger("mousedown", {});
        el.trigger("mouseup", {});
        return;
      } 
      el.squelched = false;
      el.data('squelch', options);
      el.css({
        backgroundColor: defaultColor,
        padding: '0px',
        margin: '2px',
        borderRadius: '9px',
        boxShadow: options.defaultBoxShadow,
        width: options.width,
        height: options.height||options.width,
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'moz-none',
        '-ms-user-select': 'none',
        'user-select': 'none'

      });
      el.on("mousedown touchstart", function(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation(); // or just stopPropagation?
        el.squelch.bclick(el, ev);
      });
      el.on("contextmenu", function() { return false; }); // disable context menu on right click
    });
  };

  $.fn.squelch.bclick = function(el, event) {
    if (el.squelched) { return; }

    el.squelched = true;

    var body = $('body');

    var options = el.data('squelch');

    var oldColor = options.defaultColor;
    var light = oldColor.lightness();
    light = Math.min(light + 0.2, 1.0);

    var newColor = $.Color(oldColor).lightness(light);

    var parentOffset = el.parent().offset(); 
    var posSource;

    var touches = 1;

    // console.log("Event: " + event.type);

    if (event.type === 'touchstart') {
      posSource = event.originalEvent.touches[0];
      touches = event.originalEvent.touches.length;
    } else {
      posSource = event;
      // make right-click look like two-finger tap
      if (event.which === 3) { touches = 2; }
    }

    //console.log("pageX/Y: " + posSource.pageX + "/" + posSource.pageY);
    //console.log("parentOffset: " + parentOffset.left + "/" + parentOffset.top);

    var relX = posSource.pageX - parentOffset.left;
    var relY = posSource.pageY - parentOffset.top;
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

    el.trigger("squelchOn", {velocity: velocity, xvel: xpos, yvel: ypos, touches: touches});

    el.css('backgroundColor', newColor);

    // FIXME: use hammer.js? - https://hammerjs.github.io/ Maybe not - try and reduce dependencies!
    body.one("mouseup mouseleave touchend touchcancel", function(ev) {
      ev.preventDefault();
      ev.stopImmediatePropagation(); // or just stopPropagation?
      if(el.squelched && ev.handled !== true) {
        ev.handled = true;
        el.squelched = false;
        el.trigger("squelchOff", {});
        el.animate({ backgroundColor: oldColor }, 300);
      } else {
        return false;
      }
    });
  };

  $.fn.squelch.options = {
    width: 140,
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
