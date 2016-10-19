(function (fluid, jqUnit) {
    "use strict";

    fluid.registerNamespace("sisiliano.tests.linearSlider");

    sisiliano.tests.linearSlider.verifyValue = function (linearSlider, message, expectedValue) {
        jqUnit.assertEquals(message + " : value", expectedValue, linearSlider.model.value);
        //var formattedValue = linearSlider.model.formatValue ? linearSlider.model.formatValue(expectedValue) : expectedValue;
        //jqUnit.assertEquals(message + " : label", formattedValue + "", linearSlider.locate("valueLabel").text());
    };

    jqUnit.test("linearSlider: slider regression", function () {
        $(".test").empty();
        var linearSlider = sisiliano.linearSlider(".test");

        sisiliano.tests.verifySlider("linearSlider regression of slider features", linearSlider);
    });

    /////////////////////////////////////////////////////////
    /////           Verifying mouse events
    /////////////////////////////////////////////////////////

    fluid.registerNamespace("sisiliano.tests.linearSlider.mouseEvents");
    
    jqUnit.test("linearSlider: mouse events", function () {
        $(".test").empty();
        var linearSlider = sisiliano.linearSlider(".test");
        sisiliano.tests.linearSlider.verifyMouseEvents("linearSlider: mouse events", linearSlider);
    });

    sisiliano.tests.linearSlider.verifyMouseEvents = function (message, linearSlider) {
        var sliderWidth = linearSlider.locate("componentDiv").width();
        var sliderPosition = linearSlider.locate("componentDiv").position();

        var testCases = [
            {
                position: {x: sliderPosition.left, y: sliderPosition.top},
                expectedValue: linearSlider.model.min
            },

            //TODO fixed
            /*{
                position: {x: sliderPosition.left + (sliderWidth / 2), y: sliderPosition.top},
                expectedValue: linearSlider.model.min + ((linearSlider.model.max - linearSlider.model.min) / 2)
            },*/


            {
                position: {x: sliderPosition.left + sliderWidth, y: sliderPosition.top},
                expectedValue: linearSlider.model.max
            }
        ];

        //Inside the slider
        sisiliano.tests.linearSlider.verifyLinearSliderMouseEventTestCases(message + " : inside the slider",
            linearSlider.locate("componentDiv"), linearSlider, testCases);

        //Outside the slider
        sisiliano.tests.linearSlider.verifyLinearSliderMouseEventTestCases(message + " : outside the slider",
            $(document), linearSlider, testCases);
    };

    sisiliano.tests.linearSlider.verifyLinearSliderMouseEventTestCases = function (message, element, linearSlider, testCases) {
        fluid.each(testCases, function (testCase) {
            sisiliano.tests.util.mouseEvents.mouseUp(linearSlider.locate("componentDiv"));
            sisiliano.tests.linearSlider.verifyValueWhenMouseIsMoved(message + " : when mouseup",
                element, linearSlider, testCase.position, linearSlider.model.value);

            sisiliano.tests.util.mouseEvents.mouseDown(linearSlider.locate("componentDiv"));
            sisiliano.tests.linearSlider.verifyValueWhenMouseIsMoved(message + " : when mousedown",
                element, linearSlider, testCase.position, testCase.expectedValue);

            sisiliano.tests.util.mouseEvents.mouseUp(linearSlider.locate("componentDiv"));
        });
    };

    sisiliano.tests.linearSlider.verifyValueWhenMouseIsMoved = function (message, element, linearSlider, newPosition, expectedValue) {
        sisiliano.tests.util.mouseEvents.moveMouseTo(element, newPosition.x, newPosition.y);
        sisiliano.tests.linearSlider.verifyValue(linearSlider, message, expectedValue);
    };
})(fluid, jqUnit);