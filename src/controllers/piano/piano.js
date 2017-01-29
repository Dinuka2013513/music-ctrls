(function (fluid) {
    "use strict";

    fluid.defaults("sisiliano.piano", {
        gradeNames: ["fluid.viewComponent"],
        templateUrl: "src/controllers/piano/piano.html",
        ariaDescription: "Piano keys are accessible by mouse and the keyboad as well. Only the active area of the piano is accessible by the keyboard. If you want to move the active area, use left and right keys.",
        model: {
            startingNote: "G",
            startingPitch: 0,
            size: 14,
            keyBoard: {
                keys: [],
                activeArea: {
                    start: 0,
                    end: 10
                }
            }
        },
        events: {
            onKeyPress: null,
            onKeyRelease: null,
            onStop: null,
            onActiveAreaChange: null
        },
        selectors: {
            root: ".sisiliano",
            piano: ".sisiliano-piano",
            whiteKeys: ".sisiliano-piano-white-key",
            blackKeys: ".sisiliano-piano-black-key",
            keys: ".sisiliano-piano-key"
        },
        listeners: {
            onCreate: [
                /*{
                 func: "sisiliano.piano.generateKeyboard",
                 args: ["{that}"]
                 },*/
                {
                    func: "sisiliano.piano.onCreate",
                    args: ["{that}"]
                }
            ]
        },
        modelListeners: {
            "keyBoard.activeArea.*": {
                func: "sisiliano.piano.onChangeActiveArea",
                args: ["{that}", "{that}.model.keyBoard.keys", "{that}.model.keyBoard.activeArea"]
            },
            "keyBoard.keys": {
                func: "sisiliano.piano.onKeysChange",
                args: ["{that}", "{that}.model.keyBoard.keys"]
            }
        }
    });

    sisiliano.piano.onCreate = function (that) {
        that.container.attr("tabindex", 0);

        that.container
            .on("mousedown pointerdown touchstart contextmenu", function (evt) {
                evt.preventDefault();
                that.container.focus();
            });

        var template = Handlebars.compile(htmlTempl.templates[that.options.templateUrl]);
        var html = template(that.model);
        that.container.html(html);

        sisiliano.piano.generateKeyboard(that);
    };

    sisiliano.piano.onChangeActiveArea = function (that, keys, activeArea) {
        var allocatedComputerKey = [81, 65, 87, 83, 69, 68, 82, 70, 84, 71, 89, 72,
            85, 74, 73, 75, 79, 76, 80, 186, 219, 222, 221];

        if (!activeArea) {
            activeArea = {
                start: 0,
                end: 10
            }
        }
        var whiteKeyElements = that.locate("whiteKeys");
        var keyElements = that.locate("keys");

        var startKeyElement = $(whiteKeyElements[activeArea.start]);
        var endKeyElement = $(whiteKeyElements[activeArea.end]);
        var startIndex = startKeyElement ? startKeyElement.data("index") : 0;
        var endIndex = endKeyElement ? endKeyElement.data("index") : whiteKeyElements[whiteKeyElements.length - 1];


        var keyCodeIndex = 1;

        var startPrevKey = keys[startIndex - 1];
        if (startPrevKey && startPrevKey.color === "BLACK") {
            startIndex--;
        }

        var endNextKey = keys[endIndex + 1];
        if (endNextKey && endNextKey.color === "BLACK") {
            endIndex++;
        }

        that.locate("keys").each(function (elementIndex) {
            var index = $(this).data("index");
            var keyCode = index >= startIndex && index <= endIndex ? allocatedComputerKey[keyCodeIndex++] : undefined;
            $(this).data("keyCode", keyCode);
            $(this).attr("keyCode", keyCode);
            if (keyCode === undefined) {
                $(this).addClass("sisiliano-piano-key-disabled");
            } else {
                $(this).removeClass("sisiliano-piano-key-disabled");
            }

            var nextKey = keys[elementIndex + 1];
            if (nextKey && nextKey.color === keys[index].color) {
                keyCodeIndex++;
            }
        });
    };

    sisiliano.piano.onKeysChange = function (that, keys) {
        that.locate("piano").html("");

        var whiteKeyWidth = (100 / 14);
        var blackKeyWidth = whiteKeyWidth * (2 / 3);
        var prefix = 0;
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var keyElement = $("<div/>");

            keyElement.addClass("sisiliano-piano-key");
            if (key.color === "BLACK") {
                keyElement.addClass("sisiliano-piano-black-key");
                keyElement.css("left", (prefix - (blackKeyWidth / 2)) + "%");
                keyElement.css("width", blackKeyWidth + "%");
            } else if (key.color === "WHITE") {
                keyElement.addClass("sisiliano-piano-white-key");
                keyElement.css("left", prefix + "%");
                keyElement.css("width", whiteKeyWidth + "%");
                prefix += whiteKeyWidth;
            }
            keyElement.data("index", i);

            keyElement.data("key", key);

            that.locate("piano").append(keyElement);
        }

        sisiliano.piano.appendListeners(that);
        sisiliano.piano.onChangeActiveArea(that, that.model.keyBoard.keys, that.model.keyBoard.activeArea);
    };

    sisiliano.piano.moveTabBy = function (that, increaseBy) {
        if (increaseBy) {
            var newActiveArea = {
                start: that.model.keyBoard.activeArea.start + increaseBy,
                end: that.model.keyBoard.activeArea.end + increaseBy
            };
            var whiteKeys = that.locate("whiteKeys");
            var isValid = newActiveArea.start >= 0 && newActiveArea.start < whiteKeys.length &&
                newActiveArea.end >= 0 && newActiveArea.end < whiteKeys.length &&
                newActiveArea.start < newActiveArea.end;
            if (isValid) {
                that.applier.change("keyBoard.activeArea", newActiveArea);
            }
        }
    };


    sisiliano.piano.appendListeners = function (that) {
        that.locate("keys").on("mousedown pointerdown touchstart", function (evt) {
            that.container.data("mouseDown", true)
            that.events.onKeyPress.fire($(this).data("key").freequency);
            evt.preventDefault();
        });
        that.locate("keys").on("mouseover pointerover touchmove", function () {
            console.log("[mouseover] mouseDown : " + that.container.data("mouseDown"));
            if (that.container.data("mouseDown")) {
                that.events.onKeyPress.fire($(this).data("key").freequency);
            }
        });
        that.locate("keys").on("mouseup pointerup touchend", function () {
            that.container.data("mouseDown", false)
            that.events.onStop.fire($(this).data("key").freequency);
        });
        that.locate("keys").on("mouseleave pointerleave touchcancel", function () {
            that.events.onKeyRelease.fire($(this).data("key").freequency);
        });
        that.container.on("keydown", function (evt) {
            var pressedKeyCode = evt.keyCode;
            var pressedKeyElement = $("[keyCode=" + pressedKeyCode + "]", that.container);
            console.log("[keydown]");
            if (pressedKeyElement.length > 0) {
                pressedKeyElement.addClass("sisiliano-piano-key-pressed");

                console.log("[keydown] onKeyPress");
                that.events.onKeyPress.fire(pressedKeyElement.data("key").freequency);
            }
        });
        that.container.on("keyup", function (evt) {
            var pressedKeyCode = evt.keyCode;
            var pressedKeyElement = $("[keyCode=" + pressedKeyCode + "]", that.container);

            console.log("[keyup]");
            if (pressedKeyElement.length > 0) {
                pressedKeyElement.removeClass("sisiliano-piano-key-pressed");

                console.log("[keyup] onKeyRelease");
                that.events.onKeyRelease.fire(pressedKeyElement.data("key").freequency);
            }
        });
    };

    sisiliano.piano.playKey = function (that, key) {
        that.events.onKeyPress.fire(key.index, key.freequency);
    };

    sisiliano.piano.releaseKey = function (that, key) {
        that.events.onKeyRelease.fire(key.index);
    };

    sisiliano.piano.updateKey = function (that, key, element) {
        if (!element) {
            element = that.container.find(".sisiliano-piano-key[index='" + key.index + "']");
        }

        var className = key.className;
        className += key.isActive ? " sisiliano-piano-key-active" : " sisiliano-piano-key-inactive";
        className += key.isPressed ? " sisiliano-piano-key-pressed" : "";

        element.attr("class", className);
    };

    sisiliano.piano.getKeyByComputerKeyCode = function (computerKeyCode, keys) {
        var matchingKeys = keys.filter(function (key) {
            return key.keyCode === computerKeyCode;
        });

        if (matchingKeys.length === 0) {
            return null;
        } else {
            return matchingKeys[0];
        }
    };

    sisiliano.piano.getKeysByColor = function (keys, color) {
        return keys.filter(function (key) {
            return key.color === color;
        });
    };

    var pianoScaleConfig = [
        {color: "WHITE", musicNoteIdentifications: ["C"], freequency: 261.626},
        {color: "BLACK", musicNoteIdentifications: ["C+", "D-"], freequency: 277.183},
        {color: "WHITE", musicNoteIdentifications: ["D"], freequency: 293.665},
        {color: "BLACK", musicNoteIdentifications: ["D#"], freequency: 311.127},
        {color: "WHITE", musicNoteIdentifications: ["E"], freequency: 329.628},
        {color: "WHITE", musicNoteIdentifications: ["F"], freequency: 349.228},
        {color: "BLACK", musicNoteIdentifications: ["F+"], freequency: 369.994},
        {color: "WHITE", musicNoteIdentifications: ["G"], freequency: 391.995},
        {color: "BLACK", musicNoteIdentifications: ["G+"], freequency: 415.305},
        {color: "WHITE", musicNoteIdentifications: ["A"], freequency: 440},
        {color: "BLACK", musicNoteIdentifications: ["A+"], freequency: 466.164},
        {color: "WHITE", musicNoteIdentifications: ["B"], freequency: 493.883}
    ];

    sisiliano.piano.getFreequency = function (musicNote, pitch) {
        return Math.pow(2, pitch) * musicNote.freequency;
    };

    sisiliano.piano.generateKeyboard = function (that) {
        var startingNoteObjectIndex = 0;
        var startingPitch = 0;
        var size = 14;
        var keys = [];

        for (var i = 0; i < pianoScaleConfig.length; i++) {
            if (pianoScaleConfig[i].musicNoteIdentifications.indexOf(that.model.startingNote) >= 0) {
                startingNoteObjectIndex = i;
                if (pianoScaleConfig[i].color === "BLACK") {
                    startingNoteObjectIndex--;
                }
                break;
            }
        }

        if (that.model.startingPitch && typeof that.model.startingPitch === "number") {
            startingPitch = that.model.startingPitch;
            that.applier.change("startingPitch", startingPitch);
        }

        if (that.model.size && typeof that.model.size === "number") {
            size = that.model.size;
            that.applier.change("size", size);
        }

        var index = 0;
        for (var j = 0; j < size;) {
            console.log("J : " + j);
            var musicNoteObjectIndex = (startingNoteObjectIndex + index) % pianoScaleConfig.length;
            var pitch = startingPitch + Math.floor((startingNoteObjectIndex + index) / pianoScaleConfig.length);
            var musicNoteObject = pianoScaleConfig[musicNoteObjectIndex];
            var key = JSON.parse(JSON.stringify(musicNoteObject));
            key.freequency = sisiliano.piano.getFreequency(musicNoteObject, pitch);
            key.index = index;
            keys.push(key);
            if (key.color === "WHITE") {
                j++;
            }
            index++;
        }

        that.applier.change("keyBoard.keys", keys);
    };
})(fluid);