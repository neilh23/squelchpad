/* -- global console */
function SynthPad(args) {
  "use strict";

  this.context = args.context;
  this.destination = args.destination || this.context.destination; 
  var el = this.element = args.element;

  el.squelch({
    baseColor: args.baseColor||'blue',
    width: 300,
    xvelmin: 150,
    xvelmax: 2000,
    xveltype: 'exp',
    yvelmin: 0.5,
    yvelmax: 0.25,
    yveltype: 'exp',
  });

  /* TODO: design:
   * 6 source oscillators:
   * 1. sin. base frequency - 2 octaves, amp modulated LFO 1 (not freq modulated)
   * 2. sin. base frequency - 1 octave, freq modulated by LFO 2 (detune). amp modulated by LFO 3
   * 3. sin. base frequency, freq modulated by LFO 2 (detune)
   * 4. square. base frequency, freq modulated by LFO 4 (detune)
   * 5. square. base frequency - 2hz, freq modulated by LFO 4 (detune), + phase modulated by LFO 5 (*)
   * 6. triangle - base frequency + 1 octave, freq modulated by OSCFM1 - set at 2 thirds base frequency
   *
   * 4, 5, 6 piped through low-pass filter controlled by LFO 6
   * 1, 2, 3 piped through compression
   * 3, 4, 5, 6 piped through slight reverb
   * everything piped through waveshaper set to gentle valve distortion (TODO - need to learn how to do this!)
   *   - waveshaper function for testing (gnuplot syntax)
   *   (sgn(x) * abs(x)**(1./3.)) + (1-abs(x))*sin(x*8*pi)/12
   *
   * ADSR - attack affects gain on LFO for low-pass filter + master gain, release only master gain
   *
   * ... 
   *
   * simples ;-)
   *
   * (*) Web audio api doesn't do phase modulation! Can't even simply set the phase on an oscillator, which seems
   *     a huuuuuge oversight in the spec. Can simulate this with a delay on osc5
   */

  this.attack = 0.18||args.attack;
  this.release = 1.8||args.release;

  // override this to 432hz
  // http://www.whydontyoutrythis.com/2013/08/440hz-music-conspiracy-to-detune-good-vibrations-from-natural-432hz.html
  this.base_frequency = 440||args.base_frequency;

  var target = this;
  el.on("squelchOn", function(e, args) { target.playNote(args); });
  el.on("squelchOff", function(e, args) { target.stopNote(args); });
}

SynthPad.prototype = Object.create(null, {
  midicps: { value: function(midi) { return (this.base_freq||440)* Math.pow(2, (midi - 69) / 12); }},
  // FIXME: create function for note 2 cps, e.g. 'C4', 'D#6', 'Gb3'
  playNote: { value: function(args) {
    "use strict";
    this.gain = this.context.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.destination);

    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 0;
    this.oscillator.connect(this.gain);
    this.oscillator.start(0);

    this.oscillator.frequency.value = args.xvel;
    var now = this.context.currentTime;
    var param = this.gain.gain;
    this.peakTime = (now + this.attack);
    param.exponentialRampToValueAtTime(args.yvel, this.peakTime);
  }},
  stopNote: { value: function() {
    // TODO: oscillator is still running in the background,
    // should probably do some cleanup here
    var param = this.gain.gain;
    var now = this.context.currentTime;
    this.releaseTime = Math.max(this.peakTime, now) + this.release;
    param.exponentialRampToValueAtTime(0.01, this.releaseTime);
    this.oscillator.stop(now + this.release);
  }}
});
