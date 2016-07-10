/**
 * @file tones.js
 *
 * Exports helper functions for generating a soundwave filter.
 */

// Global constants
var RED_WAVELENGTH = 655;
var VIOLET_WAVELENGTH = 445;
var WAVELENGTH_RANGE = RED_WAVELENGTH - VIOLET_WAVELENGTH;

var MIN_FREQUENCY = 80;       
var MAX_FREQUENCY = 20480;

var MIN_BRIGHTNESS = 0.5;   // Brightness along circumfrence of color wheel
var MAX_BRIGHTNESS = 1;     // Brightness of white

var MAX_Q_VALUE = 2;        // Widest possible filter
var MIN_Q_VALUE = 0;        // Narrowest filter

var MAX_HUE = 240;

var synth = new Tone.MonoSynth({
    "filterEnvelope": {
        "attack": 1,
        "decay": 0,
        "sustain": 0,
        "release": 0,
        "octaves": 4
    }, "filter": { "type": "bandpass" }
});

var playing = false;

synth.toMaster();


/**
 * Calculates the appropriate width of our bandpass filter given the brightness
 * of our selected color.
 */
function convertColorToQValue(color) {
    var q_scale = d3.scaleLinear()
        .domain([MIN_BRIGHTNESS, MAX_BRIGHTNESS])
        .range([MAX_Q_VALUE, MIN_Q_VALUE]);
    return q_scale(d3.hsl(color).l);
}


/**
 * Calculates the wavelength of a color given its hue.
 */
function convertHueToWavelength(color) {
    var hue = d3.hsl(color).h;
    return -(hue * WAVELENGTH_RANGE) / MAX_HUE + RED_WAVELENGTH;
}


/**
 * Calculates a corresponding frequency used to generate a color.
 */
function convertColorToFrequency(color) {
    var wavelength_to_frequency = d3.scaleLinear()
        .domain([RED_WAVELENGTH, VIOLET_WAVELENGTH])
        .range([MIN_FREQUENCY, MAX_FREQUENCY])
        .clamp(true);

    var wavelength = convertHueToWavelength(color);
    return wavelength_to_frequency(wavelength);
}


/**
 * Applies a bandpass filter to our soundwave. The filter limits any
 * frequencies other than the one used to generate the selected color from
 * passing through. The width (q value) of the filter is determined using
 * the selected color's brightness.
 */
function updateFilter(color) {
    var color_frequency = convertColorToFrequency(color);
    if (color_frequency) {
        synth.filterEnvelope.baseFrequency = color_frequency;
    }

    var q_value = convertColorToQValue(color);
    synth.filter.Q._param.value = q_value;
}


/**
 * Click handler for the start stop button. Starts or stops the synthesizer
 * sound.
 */
function trigger() {
    if (playing) {
        synth.triggerRelease();
    } else {
        synth.triggerAttack("C4");
    }
    playing = !playing;
}
