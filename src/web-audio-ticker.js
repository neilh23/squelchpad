// ticker based on web audio timings
//

/* global console */


/**
 * Web audio ticker
 *
 * @param {AudioContext} context
 * @param {object} opts
 * @param {number} opts.bpm - beats per minute
 * @param {number} opts.bpt - beats per tick
 * @param {function} tick
 */

function WebAudioTicker(context, tick, opts) {
  this._context = context;

  opts = opts || {};

  this._bpm   = opts.bpm || 93;
  this._bpt = opts.bpt || 1;
  this._bpb = opts.bpt || 4;
  this._callback = tick || function() { console.log("Tick"); };

  this._bar = 0;
  this._beat = -1;

  this._ticktime = (60.0/this._bpm)*this._bpt;

  /* because javascript's timeout is not guaranteed (especially in an inactive tab), we need to constantly poll
   * for the right time */
  this._timeout = Math.floor(((this._ticktime/3))*1000);
  this._stopped = true;
  this._stopflag = false;
}

WebAudioTicker.prototype = Object.create(null, {
  tick: {
    value: function() {
      if (this._stopflag) {
        this._stopped = true;
        return;
      }

      try {
        var now = this._context.currentTime;

        var basetime = this._nextTick || now;

        if (this._ahead === false) {
          this._aheadCount = 0;
        } else {
          this._ahead = false;
        }

        // console.log("Tick at " + now + " current: " + this._currentTick + " next: " + this._nextTick);

        if (now >= this._currentTick || this._currentTick === undefined) {
          this._currentTick = basetime;

          this._nextTick = this._currentTick + this._ticktime;

          if (this._nextTick < now) {
            console.log("ERROR - behind by " + (now - this._nextTick) + " seconds :-(");
            this._timeout /= 2;
            this._nextTick = now + this._ticktime;
          }

          this._beat++;

          if (this._beat >= this._bpb) {
            this._beat = 0;
            this._bar++;
          }
          this._callback(this, this._bar, this._beat);

        } else {
          this._ahead = true;
          if (++this._aheadCount >= 4) {
            console.log("Callback ahead - increasing timeout");
            this._timeout += (this._timeout/4);
          }
        }
        var ticker = this;
        setTimeout(function() { ticker.tick(); }, ticker._timeout);
      } catch(e) {
        console.log("Caught exception " + e.message);
        this._stopped = true;
      }
    }
  },

  /**
   * return the time a particular note would be played relative to the current position, based on a zero-indexed float
   * for example if called at the beginning of a bar,
   *   noteTime(0) - return the time of the first beat in the bar
   *   noteTime(1.5) would return the time that a note would play half a beat after the second beat in the bar.
   */
  noteTime: {
    value: function(index, callback) {
      var now = this._context.currentTime;
      var base = this._currentTick || now;

      var diff = Math.max(0, (base - now));

      var timeout = (60.0*index/this._bpm);

      if (callback !== undefined) { setTimeout(callback, (diff + timeout)*1000); }

      return base + timeout;
    }
  },
  start: { value: function() { this._stopflag = false; if (this._stopped) { this.tick(); } } },
  stop: { value: function() { this._stopflag = true; } }
});
