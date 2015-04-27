var MAXDELAY = 5.0;
/*
 * input = offset (delay)
 * offset Connected to delay
 * delay connected to decay
 * decay connected to delay and output
 */
function DelayChain(context, opts) {
  var p = this.meta.params;
  opts = opts || {};

  this.input = this.offsetNode = context.createDelay(MAXDELAY);
  this.delayNode = context.createDelay(MAXDELAY);
  this.output = this.decayNode = context.createGain();

  this._offset = opts.offset || p.offset.defaultValue;
  this._decay = opts.decay || p.decay.defaultValue;
  this._time = opts.time || p.time.defaultValue;

  console.log("Offset: " + this.offset);

  this.offsetNode.delayTime.value = this._offset;
  this.delayNode.delayTime.value = this._time;
  this.decayNode.gain.value = this._decay;

  this.offsetNode.connect(this.delayNode);
  this.delayNode.connect(this.decayNode);
  this.decayNode.connect(this.delayNode);
}

DelayChain.prototype = Object.create(null, {
  connect: { value: function (dest) { this.output.connect( dest.input ? dest.input : dest ); } },
  disconnect: { value: function () { this.output.disconnect(); } },
  meta: { value: {
    name: "DelayChain",
    params: {
      offset: { min: 0, max: 5.0, defaultValue: 0.0, type: "float" },
      decay: { min: 0, max: 0.9, defaultValue: 0.4, type: "float" },
      time: { min: 0, max: 5.0, defaultValue: 1.0, type: "float" }
    }
  } },
  offset: {
    enumerable: true,
    get: function() { return this._offset; },
    set: function(value) {
      this._offset = value;
      this.offsetNode.delayTime.value = value;
    }
  },
  decay: {
    enumerable: true,
    get: function() { return this._decay; },
    set: function(value) {
      this._decay = value;
      this.decayNode.gain.value = value;
    }
  },
  time: {
    enumerable: true,
    get: function() { return this._timeVal; },
    set: function(value) {
      this._timeVal = value;
      this.offsetNode.delayTime.value = value;
    }
  }
});

/* 
 * input = inputGain
 * inputGain connected to wetGain and dryGain
 * wetGain connected to
 * left and right DelayChains
 * delayChains connected to lPan and rPan
 * lPan connected to outputGain
 * r chain identical to l chain
 *
 * dryGain connected outGain
 */
function Delay(context /*, opts*/) {
  this.input = this.inputGain = context.createGain();
  this.wetGain = context.createGain();
  this.dryGain = context.createGain();
  this.leftDelayChain = new DelayChain(context, {
    offset: 0,
    decay: 0.45,
    time: 0.85
  });
  this.rightDelayChain = new DelayChain(context, {
    offset: 1/3,
    decay: 0.45,
    time: 0.85
  });
  this.leftPan = context.createStereoPanner();
  this.rightPan = context.createStereoPanner();
  this.output = this.outGain = context.createGain();

  this.inputGain.connect(this.wetGain);
  this.inputGain.connect(this.dryGain);
  this.dryGain.connect(this.outGain);
  this.wetGain.connect(this.leftDelayChain.input);
  this.wetGain.connect(this.rightDelayChain.input);
  this.leftPan.pan.value = -0.9;
  this.rightPan.pan.value = 0.9;
  this.leftDelayChain.connect(this.leftPan);
  this.rightDelayChain.connect(this.rightPan);
  this.leftPan.connect(this.outGain);
  this.rightPan.connect(this.outGain);

  // var p = this.meta.params;
  // opts = opts || {};
}

Delay.prototype = Object.create(null, {
  connect: { value: function (dest) { this.output.connect( dest.input ? dest.input : dest ); } },
  disconnect: { value: function () { this.output.disconnect(); } },
  meta: { value: {
    name: "Delay",
    params: {
      decay: { min: 0, max: 0.9, defaultValue: 0.4, type: "float" },
      time: { min: 0, max: 5.0, defaultValue: 1.0, type: "float" }
    }
  } },
  decay: {
    enumerable: true,
    get: function() { return this._decay; },
    set: function(value) { this._decay = value; }
  },
  time: {
    enumerable: true,
    get: function() { return this._time; },
    set: function(value) { this._time = value; }
  }
});
