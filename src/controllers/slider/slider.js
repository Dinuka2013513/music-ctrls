(function (fluid) {
    "use strict";

    fluid.defaults("sisiliano.slider", {
        gradeNames: ["sisiliano.component"],
        model: {
            min: 0,
            max: 100,
            value: null,
            size: 100,
            tickValue: 1,
            status: {
                isActive: false
            },
            formatValue: function (value) {
                return Math.round(value * 100) / 100.0;
            },
            title: "Abstract Slider Controller"
        },
        ariaDescription: "",
        selectors: {
            svg: "svg",
            valueLabel: ".sisiliano-slider-value-text"
        },
        events: {
            onValueChange: null,
            onStatusChange: null
        },
        listeners: {
            onCreate: [
                {
                    func: "sisiliano.slider.validateInputs",
                    args: ["{that}"]
                },
                {
                    func: "sisiliano.slider.onInit",
                    args: ["{that}"]
                },
                {
                    func: "sisiliano.slider.onMinValueChange",
                    args: ["{that}", "{that}.model.min"]
                },
                {
                    func: "sisiliano.slider.onMaxValueChange",
                    args: ["{that}", "{that}.model.max"]
                }
            ]
        },
        modelListeners: {
            "value": {
                func: "sisiliano.slider.onValueChange",
                args: ["{that}", "{that}.model.value"]
            },
            "formatValue": {
                func: "sisiliano.slider.onValueChange",
                args: ["{that}", "{that}.model.value"]
            },
            "min": {
                func: "sisiliano.slider.onMinValueChange",
                args: ["{that}", "{that}.model.min"]
            },
            "max": {
                func: "sisiliano.slider.onMaxValueChange",
                args: ["{that}", "{that}.model.max"]
            },
            "status.isActive": {
                func: "sisiliano.slider.onStatusChange",
                args: ["{that}", "{that}.model.status.isActive"]
            }
        }
    });
    
    sisiliano.slider.onStatusChange = function (that) {
        that.events.onStatusChange.fire();
    };

    sisiliano.slider.onInit = function (that) {
        that.container.attr("tabindex", 0);
        that.container.attr("role", "slider");

        sisiliano.slider.addListeners(that);
    };

    sisiliano.slider.onMinValueChange = function (that, min) {
        that.container.attr("aria-valuemin", min);
        that.applier.change("size", sisiliano.slider.getSize(that));
        sisiliano.slider.onValueChange(that, that.model.value);
    };

    sisiliano.slider.onMaxValueChange = function (that, max) {
        that.container.attr("aria-valuemax", max);
        that.applier.change("size", sisiliano.slider.getSize(that));
        sisiliano.slider.onValueChange(that, that.model.value);
    };

    sisiliano.slider.onValueChange = function (that, newValue) {
        if (typeof newValue !== "number") {
            sisiliano.slider.updateTheValueInUI(that, that.model.min);
        } if (newValue < that.model.min) {
            newValue = that.model.min;
            that.applier.change("value", newValue);
        } else if (newValue > that.model.max) {
            newValue = that.model.max;
            that.applier.change("value", newValue);
        } else {
            sisiliano.slider.updateTheValueInUI(that, newValue);
        }
    };

    sisiliano.slider.updateTheValueInUI = function (that, newValue) {
        var formatedValue = newValue;
        if (that.model.formatValue && typeof that.model.formatValue === "function") {
            formatedValue = that.model.formatValue(newValue);
        }

        //Update the aria-valuenow
        that.container.attr("aria-valuenow", formatedValue);

        //Update the value in the UI
        that.locate("valueLabel").text(formatedValue);
        that.events.onValueChange.fire(that, sisiliano.slider.getObviousValue(that, that.model.value));
    };

    sisiliano.slider.addListeners = function (that) {
        var keyDownHandler = function (event) {
            var currentValue = sisiliano.slider.getValue(that);
            if (event.keyCode === 38 || event.keyCode === 39) {
                that.applier.change("value", currentValue + that.model.tickValue);
                event.preventDefault();
            } else if (event.keyCode === 37 || event.keyCode === 40) {
                that.applier.change("value", currentValue - that.model.tickValue);
                event.preventDefault();
            }
        };

        that.container.on("keydown", keyDownHandler)

            .on("mousedown", sisiliano.slider.setSliderActiveStatus.bind(this, that, true))
            .on("pointerdown", sisiliano.slider.setSliderActiveStatus.bind(this, that, true))
            .on("touchstart", sisiliano.slider.setSliderActiveStatus.bind(this, that, true))

            .on("mouseup", sisiliano.slider.setSliderActiveStatus.bind(this, that, false))
            .on("pointerup", sisiliano.slider.setSliderActiveStatus.bind(this, that, false))
            .on("touchend", sisiliano.slider.setSliderActiveStatus.bind(this, that, false));

        document.addEventListener("mouseup", sisiliano.slider.setSliderActiveStatus.bind(this, that, false));
        document.addEventListener("pointerup", sisiliano.slider.setSliderActiveStatus.bind(this, that, false));
        document.addEventListener("touchend", sisiliano.slider.setSliderActiveStatus.bind(this, that, false));
    };

    sisiliano.slider.setSliderActiveStatus = function (that, status) {
        that.applier.change("status.isActive", status);
    };

    sisiliano.slider.getValue = function (that) {
        if (typeof that.model.value === "number") {
            return that.model.value;
        } else {
            return that.model.min;
        }
    };

    sisiliano.slider.validateInputs = function (that) {
        //TODO modified according to the standards of infusion
        if (that.model.min >= that.model.max) {
            throw new Error("Min should be less than max");
        }
    };

    sisiliano.slider.getSize = function (that) {
        return Math.abs(that.model.max - that.model.min);
    };

    sisiliano.slider.getValue = function (that) {
        if (typeof that.model.value === "number") {
            return that.model.value;
        } else {
            return that.model.min;
        }
    };

    sisiliano.slider.getObviousValue = function (that, value) {
        return value - that.model.min;
    };
})(fluid);