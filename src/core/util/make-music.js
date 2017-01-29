/**
 * Created by VDESIDI on 8/2/2016.
 */

(function (fluid) {
    "use strict";

    fluid.defaults("sisiliano.util.makeMusic", {
        gradeNames: ["fluid.component"],
        listeners: {
            onCreate: {
                func: "sisiliano.util.makeMusic.onCreate",
                args: ["{that}"]
            }
        },
        invokers: {
            play: {
                funcName: "sisiliano.util.makeMusic.play",
                args: ["{that}", "{arguments}.0"]
            },
            release: {
                funcName: "sisiliano.util.makeMusic.release",
                args: ["{that}", "{arguments}.0"]
            },
            releaseAll: {
                funcName: "sisiliano.util.makeMusic.releaseAll",
                args: ["{that}", "{arguments}.0"]
            }
        },
        context: null,
        masterGain: null,
        nodes: {}
    });

    sisiliano.util.makeMusic.onCreate = function (that) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            that.context = new AudioContext();
        }

        that.nodes = {};
        if (that.context) {
            that.masterGain = that.context.createGain();
            that.masterGain.gain.value = 0.3;
            that.masterGain.connect(that.context.destination);
        }
    };

    sisiliano.util.makeMusic.play = function (that, frequency) {
        var node = that.nodes[frequency];
        if (that.context && !node) {
            var oscillator = that.context.createOscillator();
            oscillator.type = "triangle";
            oscillator.frequency.value = frequency;
            oscillator.connect(that.masterGain);
            oscillator.start(0);
            that.nodes[frequency] = oscillator;
        }
    };

    sisiliano.util.makeMusic.release = function (that, frequency) {
        var node = that.nodes[frequency];
        if (node) {
            node.stop(0);
            node.disconnect();
            that.nodes[frequency] = null;
        }
    };

    sisiliano.util.makeMusic.releaseAll = function (that) {
        for (var key in that.nodes) {
            sisiliano.util.makeMusic.release(that, key);
        }
    };
})(fluid);