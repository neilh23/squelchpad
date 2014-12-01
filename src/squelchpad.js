/*
 * squelchpad
 * 
 *
 * Copyright (c) 2014 Neil Howie
 * Licensed under the MIT license.
 */

/* -- global console */

function SquelchPad($, el, options) {
  "use strict";
  this.element = el;

  this.jQuery = $;

  if (options.toggle === true) { options.toggle = 1; }

  options = this.options = $.extend({}, this.defaultOptions, options);

  var baseHue = $.Color(options.baseColor).hue();

  var defaultColor = $.Color({
    hue: baseHue,
    saturation: options.defaultSaturation,
    lightness: options.minLightness,
  });

  options.defaultColor = defaultColor;

  this.squelched = false;
  this.toggleLevel = 0;

  el.data('squelch', this);

  var borderRad = '9px';

  if (options.shape === 'circle') { borderRad = '50%'; }
  el.css({
    backgroundColor: defaultColor,
    padding: '0px',
    margin: '2px',
    borderRadius: borderRad,
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
    el.data('squelch').squelchOn(ev);
  });
  el.on("contextmenu", function() { return false; }); // disable context menu on right click
}


SquelchPad.prototype = Object.create(null, {
  squelchOn: { value: function(event) {
    if (this.sequelched) { return; }

    var el = this.element;
    var $ = this.jQuery; // is this the accepted way of doing this?
    this.squelched = true;
    var options = this.options;

    var body = $('body');

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

    var eventData = {
      velocity: velocity,
      xvel: xpos,
      yvel: ypos,
      touches: touches
    };

    var eventType = 'squelchOn';

    var toggle = options.toggle;
    if (toggle !== 0) {
      var toggleLevel = this.toggleLevel;
      toggleLevel++;
      if (toggleLevel > toggle) {
        toggleLevel = 0;
      }
      if (toggleLevel == 0) {
        eventType = 'squelchOff';
      } else if (toggleLevel != 1) {
        eventType = 'squelchLevel';
      }

      this.toggleLevel = eventData['level'] = toggleLevel;

      var minL = options.minLightness;
      var maxL = options.maxLightness;

      var newLight = minL + ((maxL - (minL + 0.05))*toggleLevel)/toggle;

      this.element.animate({ backgroundColor: $.Color(oldColor).lightness(newLight) }, options.animateSpeed);
    } else {
      var oldColor = options.defaultColor;

      var newColor = $.Color(oldColor).lightness(options.maxLightness);

      el.css('backgroundColor', newColor);
      this.oldColor = oldColor;
    }


    el.trigger(eventType, eventData);

    if (toggle === 0) { // if we're in toggle mode, toggling to zero is a squelchOff!
      body.one("mouseup mouseleave touchend touchcancel", function(ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation(); // or just stopPropagation?
        var sp = $(ev.target).data('squelch');
        return sp.squelchOff(ev);
      });
    }
  }}, 
  squelchOff: { value: function(event) {
    if (!this.squelched || event.handled === true) { return false; }

    var options = this.options;

    event.handled = true;
    this.squelched = false;
    this.element.trigger("squelchOff", {});

    this.element.animate({ backgroundColor: this.oldColor }, options.animateSpeed);

    return true;
  }},
  defaultOptions: { value: {
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
    minLightness: 0.165,
    maxLightness: 0.5,
    baseColor: 'blue',
    defaultBoxShadow: '2px 2px 2px black',
    highlightBoxShadow: '2px 2px 1px #666',
    defaultSaturation: 0.8,
    toggle: 0,
    animateSpeed: 250
  }}
});


(function ($) {
  'use strict';
  $.fn.squelch = function (options) {
    return this.each(function () {
      var sq = $(this).data('squelch');

      if (sq === undefined) {
        new SquelchPad($, $(this), options);
      } else {
        sq.squelchOn(options||{});
        sq.squelchOff(options||{});
      }
    });
  };
}(jQuery));
