// taken and modified from https://github.com/web-audio-components/simple-reverb

/**
 * Simple Reverb constructor.
 *
 * @param {AudioContext} context
 * @param {object} opts
 * @param {number} opts.seconds
 * @param {number} opts.decay
 * @param {boolean} opts.reverse
 */

function SimpleReverb (context, opts) {
  this.input = this.output = context.createConvolver();
  this._context = context;

  var p = this.meta.params;
  opts = opts || {};
  this._seconds   = opts.seconds  || p.seconds.defaultValue;
  this._decay     = opts.decay    || p.decay.defaultValue;
  this._reverse   = opts.reverse  || p.reverse.defaultValue;
  this._wet   = opts.wet  || p.wet.defaultValue;
  this._dry   = opts.dry  || p.dry.defaultValue;
  this._buildImpulse();
}

SimpleReverb.prototype = Object.create(null, {

  /**
   * AudioNode prototype `connect` method.
   *
   * @param {AudioNode} dest
   */

  connect: {
    value: function (dest) {
      this.output.connect( dest.input ? dest.input : dest );
    }
  },

  /**
   * AudioNode prototype `disconnect` method.
   */

  disconnect: {
    value: function () {
      this.output.disconnect();
    }
  },

  /**
   * Utility function for building an impulse response
   * from the module parameters.
   */

  _buildImpulse: {
    value: function () {
      var rate = this._context.sampleRate
        , length = rate * this.seconds
        , decay = this.decay
        , impulse = this._context.createBuffer(2, length, rate)
        , impulseL = impulse.getChannelData(0)
        , impulseR = impulse.getChannelData(1)
        , n, i;

      for (i = 0; i < length; i++) {
        n = this.reverse ? length - i : i;
        impulseL[i] = (Math.random()*2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random()*2 - 1) * Math.pow(1 - n / length, decay);
      }

      this.input.buffer = impulse;
    }
  },

  /**
   * Module parameter metadata.
   */

  meta: {
    value: {
      name: "SimpleReverb",
      params: {
        seconds: {
          min: 1,
          max: 50,
          defaultValue: 3,
          type: "float"
        },
        decay: {
          min: 0,
          max: 100,
          defaultValue: 2,
          type: "float"
        },
        reverse: {
          min: 0,
          max: 1,
          defaultValue: 0,
          type: "bool"
        },
        wet: {
          min: 0,
          max: 1,
          defaultValue: 0.8,
          type: "float"
        },
        dry: {
          min: 0,
          max: 1,
          defaultValue: 0.2,
          type: "float"
        }
      }
    }
  },

  /**
   * Public parameters.
   */

  seconds: {
    enumerable: true,
    get: function () { return this._seconds; },
    set: function (value) {
      this._seconds = value;
      this._buildImpulse();
    }
  },

  decay: {
    enumerable: true,
    get: function () { return this._decay; },
    set: function (value) {
      this._decay = value;
      this._buildImpulse();
    }
  },

  reverse: {
    enumerable: true,
    get: function () { return this._reverse; },
    set: function (value) {
      this._reverse = value;
      this._buildImpulse();
    }
  },
  
  wet: {
    enumerable: true,
    get: function () { return this._wet; },
    set: function (value) {
      this._wet = value;
      this._buildImpulse();
    }
  },
  dry: {
    enumerable: true,
    get: function () { return this._dry; },
    set: function (value) {
      this._dry = value;
      this._buildImpulse();
    }
  },

});

