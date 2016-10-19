(function (fluid, jqUnit) {
    "use strict";

    fluid.registerNamespace("sisiliano.tests.slider");

    sisiliano.tests.verifySlider = function (message, slider) {
        sisiliano.tests.slider.keyEvents.verifyKeyEvents(message, slider);
        sisiliano.tests.slider.verifyMinMaxValues(message, slider);
        sisiliano.tests.slider.verifyTickValue(message, slider);
        sisiliano.tests.slider.verifyAriaDescription(message, slider);

        //TODO
        //sisiliano.tests.slider.verifyFormatValue(message, slider);
    };
    
    sisiliano.tests.slider.createNewSlider = function (options) {
        if (!options) {
            options = {};
        }

        options.template = function () {
            return "<div class='sisiliano-slider-value-text'></div>";
        };

        var slider = sisiliano.slider(".test", options);

        return slider;
    };

    sisiliano.tests.slider.verifyValue = function (slider, message, expectedValue) {
        jqUnit.assertEquals(message + " : value", expectedValue, slider.model.value);
        //var formattedValue = slider.model.formatValue ? slider.model.formatValue(expectedValue) : expectedValue;
        //jqUnit.assertEquals(message + " : label", slider.locate("valueLabel").text(), formattedValue + "");
    };

    /////////////////////////////////////////////////////////
    /////           Verifying key events
    /////////////////////////////////////////////////////////
    fluid.registerNamespace("sisiliano.tests.slider.keyEvents");
    jqUnit.test("slider : key events", function () {
        var slider = sisiliano.tests.slider.createNewSlider();
        sisiliano.tests.slider.keyEvents.verifyKeyEvents("Slider key events verification", slider);
    });
    sisiliano.tests.slider.keyEvents.verifyKeyEvents = function (message, slider) {
        //Reset value to min
        slider.applier.change("value", slider.model.min);

        var expectedValue = slider.model.value + slider.model.tickValue;
        sisiliano.tests.slider.keyEvents.pressKeyUp(slider);
        sisiliano.tests.slider.verifyValue(slider, message + " : value should be increased when up key is pressed", expectedValue);

        expectedValue = slider.model.value - slider.model.tickValue;
        sisiliano.tests.slider.keyEvents.pressKeyDown(slider);
        sisiliano.tests.slider.verifyValue(slider, message + " : value should be decreased when down key is pressed", expectedValue);

        sisiliano.tests.slider.keyEvents.verifyMinMax(message, slider);
    };

    sisiliano.tests.slider.keyEvents.verifyMinMax = function (message, slider) {
        var min = slider.model.min;
        var max = slider.model.max;

        slider.applier.change("value", min + slider.model.tickValue);
        sisiliano.tests.slider.keyEvents.pressKeyDown(slider);
        sisiliano.tests.slider.keyEvents.pressKeyDown(slider);
        sisiliano.tests.slider.keyEvents.pressKeyDown(slider);
        sisiliano.tests.slider.verifyValue(slider, message + " : value should be not decreasing less than the min value", min);

        slider.applier.change("value", max - slider.model.tickValue);
        sisiliano.tests.slider.keyEvents.pressKeyUp(slider);
        sisiliano.tests.slider.keyEvents.pressKeyUp(slider);
        sisiliano.tests.slider.keyEvents.pressKeyUp(slider);
        sisiliano.tests.slider.verifyValue(slider, message + " : value should be not increasing greater than the max value", max);
    };

    sisiliano.tests.slider.keyEvents.pressKeyUp = function (slider) {
        sisiliano.tests.slider.keyEvents.triggerKeyDown(slider, 38);
    };
    sisiliano.tests.slider.keyEvents.pressKeyDown = function (slider) {
        sisiliano.tests.slider.keyEvents.triggerKeyDown(slider, 40);
    };
    sisiliano.tests.slider.keyEvents.triggerKeyDown = function (slider, keyCode) {
        slider.locate("componentDiv").simulate("keydown", {
            keyCode: keyCode
        });
    };

    /////////////////////////////////////////////////////////
    /////           Verifying min and max values
    /////////////////////////////////////////////////////////
    jqUnit.test("slider : min max", function () {
        var slider = sisiliano.tests.slider.createNewSlider();
        sisiliano.tests.slider.verifyMinMaxValues("Slider min max value verification", slider);
    });

    sisiliano.tests.slider.verifyMinMaxValues = function (message, slider) {
        var testCases = [
            {min: 10, max: 150},
            {min: -10, max: 100},
            {min: -140, max: -20}
        ];
        fluid.each(testCases, function (testCase) {
            slider.applier.change("min", testCase.min);
            slider.applier.change("max", testCase.max);

            var min = slider.model.min;
            var max = slider.model.max;

            jqUnit.assertEquals(message + " : aria-valuemax label should have been added", max + "",
                slider.locate("componentDiv").attr("aria-valuemax"));
            jqUnit.assertEquals(message + " : aria-valuemin label should have been added", min + "",
                slider.locate("componentDiv").attr("aria-valuemin"));
        });
    };

    /////////////////////////////////////////////////////////
    /////           Verifying tick value
    /////////////////////////////////////////////////////////
    jqUnit.test("slider : tick value", function () {
        var slider = sisiliano.tests.slider.createNewSlider();
        sisiliano.tests.slider.verifyTickValue("Slider tick value verifications", slider);
    });

    sisiliano.tests.slider.verifyTickValue = function (message, slider) {
        var testingTickValues = [1, 2, 5, 7, 10];
        fluid.each(testingTickValues, function (tickValue) {
            slider.applier.change("tickValue", tickValue);
            sisiliano.tests.slider.keyEvents.verifyKeyEvents(message + " : when tick value is " + tickValue, slider);
        });
    };


    /////////////////////////////////////////////////////////
    /////           Verifying format value
    /////////////////////////////////////////////////////////

    //TODO
    /*jqUnit.test("slider : format value", function () {
        var slider = sisiliano.tests.slider.createNewSlider();
        sisiliano.tests.slider.verifyFormatValue("Slider format value verification", slider);
    });

    sisiliano.tests.slider.verifyFormatValue = function (message, slider) {
        var newValue = slider.model.min + (slider.model.max - slider.model.min) / 2;
        slider.applier.change("value", newValue);
        var testCases = [
            {
                formatValue: function (value) { return "#### " + value; },
                expectedValue: "#### " + newValue
            },
            {
                formatValue: function () { return "%%%"; },
                expectedValue: "%%%"
            }
        ];

        fluid.each(testCases, function (testCase) {
            slider.applier.change("formatValue", testCase.formatValue);
            jqUnit.assertEquals(message + " : value should be formatted", slider.locate("valueLabel").text(),
                testCase.expectedValue);
        });
    };*/

    /////////////////////////////////////////////////////////
    /////           aria-describeby
    /////////////////////////////////////////////////////////
    jqUnit.test("slider : aria description", function () {
        var slider = sisiliano.tests.slider.createNewSlider();
        sisiliano.tests.slider.verifyAriaDescription("Slider aria description", slider);
    });
    sisiliano.tests.slider.verifyAriaDescription = function (message, slider) {
        var ariaDescribebyValue = slider.locate("componentDiv").attr("aria-describedby");
        jqUnit.assertTrue(message + " : aria-describedby should have been defined", ariaDescribebyValue);
        jqUnit.assertEquals(message + " : an element should have been defined for the aria description",
            slider.options.ariaDescription, $("#" + ariaDescribebyValue).html());
    };
})(fluid, jqUnit);