/**
 * Created by VDESIDI on 7/23/2016.
 */
(function (fluid) {
    "use strict";

    fluid.defaults("sisiliano.component", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            templateUrl: "",
            template: null
        },
        selectors: {
            svg: "svg",
            componentDiv: ".sisiliano"
        },
        listeners: {
            onCreate: [
                {
                    func: "sisiliano.component.onTemplateChange",
                    args: ["{that}", "{that}.options.template", "{that}.options.templateUrl"]
                },
                {
                    func: "sisiliano.component.onInit",
                    args: ["{that}"]
                },
                {
                    func: "sisiliano.component.addAriaDescription",
                    args: ["{that}"]
                }
            ]
        },
        styleRules: {
            attributes: [
                "class", "cx", "cy",
                "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-width",
                "x", "y", "width", "height", "fill", "fill-opacity",
                "stroke-opacity", "transform",  "r"
            ]
        }
    });

    sisiliano.component.onInit = function (that) {
        that.container.attr("tabindex", 0);

        that.container
            .on("mousedown pointerdown touchstart contextmenu", function (evt) {
                evt.preventDefault();
                that.container.focus();
            });
    };

    sisiliano.component.addAriaDescription = function (that) {
        var descriptionsPane = $("#sisiliano-component-guide-descriptions");
        if (descriptionsPane.length === 0) {
            descriptionsPane = $("<div id='sisiliano-component-guide-descriptions' style='visibility: hidden'></div>");
            $("body").append(descriptionsPane);
        }

        var descriptionElementIdOfTheComponent = (that.typeName.replace(/\./g, "-") + "-guide-description").toLowerCase();
        var descriptionElementOfTheComponent = $("#" + descriptionElementIdOfTheComponent);
        if (descriptionElementOfTheComponent.length === 0) {
            descriptionElementOfTheComponent = $("<div id='" + descriptionElementIdOfTheComponent + "'>" + that.options.ariaDescription + "</div>");
            descriptionsPane.append(descriptionElementOfTheComponent);
        }

        that.container.attr("aria-describedby", descriptionElementIdOfTheComponent);
    };

    sisiliano.component.onTemplateChange = function (that, template, templateUrl) {
        //Initializing the sisiliano ID
        var sisilianoId = "fluid-sisiliano-id-" + that.id;
        that.applier.change("id", sisilianoId);
        that.container.html("<div class='sisiliano' id='" + sisilianoId + "'></div>");

        var template = Handlebars.compile(htmlTempl.templates[templateUrl]);
        var html = template(that.model);
        that.locate("componentDiv").html(html);
    };

    fluid.defaults("sisiliano.border", {
        gradeNames: ["sisiliano.component"],
        model: {
            styles: {
                border: {
                    padding: {
                        left: 2,
                        right: 2,
                        top: 2,
                        bottom: 2
                    },
                    margin: {
                        left: 3,
                        right: 3,
                        top: 3,
                        bottom: 3
                    }
                },
                controller: {
                    width: 10,
                    height: 10
                }
            },
            viewBox: {
                width: 10,
                height: 10
            }
        },
        selectors: {
            controller: ".sisiliano-controller-div",
            border: ".sisiliano-border-div"
        },
        listeners: {
            onCreate: [
                {
                    func: "sisiliano.border.onControllerStyleChange",
                    args: ["{that}", "{that}.model.styles"]
                },
                {
                    func: "sisiliano.border.onBorderStyleChange",
                    args: ["{that}", "{that}.model.styles"]
                }
            ]
        },
        modelListeners: {
            "viewBox.*": {
                func: "sisiliano.border.onViewBoxChange",
                args: ["{that}", "{that}.model.viewBox"]
            },
            "styles.controller.*": {
                func: "sisiliano.border.onControllerStyleChange",
                args: ["{that}", "{that}.model.styles"]
            },
            "styles.border.*": {
                func: "sisiliano.border.onBorderStyleChange",
                args: ["{that}", "{that}.model.styles"]
            }
        }
    });

    sisiliano.border.onViewBoxChange = function (that, viewBox) {
        d3.select(that.locate("svg").get(0)).attr("viewBox", "0 0 " + viewBox.width + " " + viewBox.height);
    };

    sisiliano.border.onResize = function (that, styles) {
        if (styles.controller.height && !styles.controller.width) {
            //Define the width based on the parent
            var containerHeight = that.container.height();
            var containerWidth = that.container.width();
            var svgHeight = styles.controller.height + styles.border.padding.top + styles.border.padding.bottom + styles.border.margin.top + styles.border.margin.bottom;
            var svgWidth = (containerWidth / containerHeight) * svgHeight;
            that.applier.change("styles.controller.width", svgWidth - styles.border.padding.left - styles.border.padding.right - styles.border.margin.left - styles.border.margin.right);
        }
    };

    sisiliano.border.onBorderStyleChange = function (that, styles) {
        sisiliano.border.onResize(that, styles);
        that.applier.change("styles.border.width",
            styles.controller.width + styles.border.padding.left + styles.border.padding.right);
        that.applier.change("styles.border.height",
            styles.controller.height + styles.border.padding.top + styles.border.padding.bottom);

        that.applier.change("styles.border.x", styles.border.margin.left);
        that.applier.change("styles.border.y", styles.border.margin.top);

        that.applier.change("styles.controller.x", styles.border.x + styles.border.padding.left);
        that.applier.change("styles.controller.y", styles.border.y + styles.border.padding.top);

        that.locate("border")
            .attr("width", styles.border.width)
            .attr("height", styles.border.height)
            .attr("x", styles.border.x)
            .attr("y", styles.border.y);

        that.locate("controller").attr("transform",
            "translate(" + styles.controller.x + "," + styles.controller.y + ")");

        that.applier.change("viewBox", {
            width: styles.border.width + styles.border.margin.left + styles.border.margin.right,
            height: styles.border.height + styles.border.margin.top + styles.border.margin.bottom
        });
    };

    sisiliano.border.onControllerStyleChange = function (that, styles) {
        sisiliano.border.onResize(that, styles);
        that.locate("controller")
            .attr("width", styles.controller.width)
            .attr("height", styles.controller.height);
        sisiliano.border.onBorderStyleChange(that, styles);
    };
})(fluid);