(function (fluid) {
    "use strict";

    fluid.defaults("sisiliano.linearSlider", {
        gradeNames: ["sisiliano.slider"],
        defaultViewBox: [0, 0, 500, 50],
        ariaDescription: "Linear slider, the value can be adjusted by arrow keys. If you are using the mouse, drag along the slider",
        templateUrl: "src/controllers/linear-slider/linear-slider.html",
        model: {
            rulerPoints: [0, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            orientation: "vertical", // vertical or horizontal
            title: "linearSlider Controller",
            description: ""
        },
        selectors: {
            "sliderBar-rangeBar": ".sisiliano-linear-slider-range-bar",
            "sliderBar-valueBar": ".sisiliano-linear-slider-value-bar",
            "sliderValue-valuePointer": ".sisiliano-linear-slider-value-pointer-container"
        },
        listeners: {
            onValueChange: {
                func: "sisiliano.linearSlider.onValueChange",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            onCreate: {
                func: "sisiliano.linearSlider.addListeners",
                args: ["{that}"]
            }
        }
    });

    sisiliano.linearSlider.onValueChange = function (that, obviousValue) {
        //Slider Bar
        that.locate("sliderBar-valueBar").css("width", ((obviousValue / (that.model.max - that.model.min)) * 100) + "%");

        //Value Pointer
        that.locate("sliderValue-valuePointer").css("left", ((obviousValue / (that.model.max - that.model.min)) * 100) + "%");
    };


    sisiliano.linearSlider.setValueByPosition = function (that, clickedPosition) {
        var sliderRangeBar = that.locate("sliderBar-rangeBar");
        var sliderRangeBarZerothPosition = sliderRangeBar.offset();

        //TODO fix: width is not calculated properly
        //TODO update the test cases after the fix
        var sliderRangeBarWidth = sliderRangeBar.width();

        if (clickedPosition.left <= sliderRangeBarZerothPosition.left) {
            that.applier.change("value", that.model.min);
        } else if ((clickedPosition.left + sliderRangeBarWidth) <= sliderRangeBarZerothPosition.left) {
            that.applier.change("value", that.model.max);
        } else {
            var val = that.model.min + ((that.model.max - that.model.min) * ((clickedPosition.left - sliderRangeBarZerothPosition.left) / sliderRangeBarWidth));
            that.applier.change("value", val);
        }
    };

    sisiliano.linearSlider.addListeners = function (that) {
        $(document).on("mousemove pointermove touchmove", function (evt) {
            if (that.model.status.isActive) {
                //Considering the firstly touched position if there are many touch points
                evt = evt.type === "touchmove" ? evt.touches[0] : evt;

                var mousePosition = {left: evt.pageX, top: evt.pageY};
                sisiliano.linearSlider.setValueByPosition(that, mousePosition);

                evt.preventDefault(evt);
            }
        });
    };
})(fluid);