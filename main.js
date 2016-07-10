/**
 * @file main.js
 * 
 * Plays a tone based on the color a user selects on an interactive color wheel.
 * Adapted from https://github.com/bgrins/colorwheel-1k
 */

(function(){
    // Global constants
    var BODY = document.body;
    var CANVAS = document.getElementsByTagName('canvas')[0];
    var CONTEXT = CANVAS.getContext('2d');

    var LENGTH = 400;
    var CIRCLE_OFFSET = 10;
    var DIAMETER = LENGTH - (CIRCLE_OFFSET * 2);
    var RADIUS = DIAMETER / 2;
    var MAX_RGB = 255;
    var CURSOR_PIXELS = 4;

    // Global variables
    var image_data = CONTEXT.createImageData(LENGTH, LENGTH);
    var pixels = image_data.data;
    var position = CIRCLE_OFFSET * 4 * LENGTH + (CIRCLE_OFFSET * 4);

    var curr_y = 100;
    var curr_x = -curr_y;

    CANVAS.width = CANVAS.height = LENGTH;
    
    document.onmouseup = function(e) {
        document.onmousemove = null;
    }

    CANVAS.onmousedown = function(e) {
        document.onmousemove = (redraw(e), redraw);
    }

    displayColorWheel();
    redraw(0);


    function getDistanceFromCenter(x, y) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }


    function getAngle(x, y) {
        return Math.atan2(y, x);
    }


    function getRgb(theta, distance) {
        var hue = (theta + Math.PI) / (Math.PI * 2);
        var saturation = distance / RADIUS;
        return hsvToRgb(hue, saturation, 1);
    }


    /**
     * Code from http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c/
     * 
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  v       The value
     * @return  Array           The RGB representation
     */
    function hsvToRgb(h, s, v){
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [r * 255, g * 255, b * 255];
    }


    function displayColorWheel() {
        for (y = 0; y < LENGTH; y++) {
            for (x = 0; x < LENGTH; x++) {
                var rx = x - RADIUS;
                var ry = y - RADIUS;
                var theta = getAngle(rx, ry);
                var distance = getDistanceFromCenter(rx, ry);

                var [r, g, b] = getRgb(theta, distance);
                var a = distance > RADIUS ? 0 : MAX_RGB;

                // Display current color
                pixels[position++] = r;
                pixels[position++] = g;
                pixels[position++] = b;
                pixels[position++] = a;
            }
        }
    }


    function redraw(e) {
        // Update position if mouse has moved
        if (e.pageX) {
            curr_x = e.pageX - CANVAS.offsetLeft - (RADIUS + CIRCLE_OFFSET);
            curr_y = e.pageY - CANVAS.offsetTop - (RADIUS + CIRCLE_OFFSET);
        }

        var theta = getAngle(curr_x, curr_y);
        var distance = getDistanceFromCenter(curr_x, curr_y);

        // Place cursor on edge of circle if mouse is outside
        if (distance > RADIUS) {
            curr_x = RADIUS * Math.cos(theta);
            curr_y = RADIUS * Math.sin(theta);
            var theta = getAngle(curr_x, curr_y);
            var distance = getDistanceFromCenter(curr_x, curr_y);
        }

        // Update sound filter
        var [r, g, b] = getRgb(theta, distance)
        updateFilter(d3.rgb(r, g, b));

        // Clear previous cursor and redraw
        CONTEXT.putImageData(image_data, 0, 0);
        CONTEXT.font = "1em arial";
        x_pos = curr_x + RADIUS + CIRCLE_OFFSET - CURSOR_PIXELS;
        y_pos = curr_y + RADIUS + CIRCLE_OFFSET + CURSOR_PIXELS
        CONTEXT.fillText("♥", x_pos, y_pos); 
    }
})();
