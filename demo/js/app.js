/**
 * Created by VDESIDI on 7/29/2016.
 */

angular.module("sisiliano.demo", ["ngRoute"])
    .controller("demoCtrl", function($scope, $route, $routeParams, $location) {
        "use strict";

        $scope.title = "Haaaai";
        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;
    })
    .config(function($routeProvider) {
        "use strict";

        $routeProvider
            .when("/", {
                templateUrl: "./pages/introduction.html"
            })
            .when("/controllers/piano/", {
                templateUrl: "./pages/controllers/piano.html"
            })
            .when("/controllers/sliders/knob", {
                templateUrl: "./pages/controllers/sliders/knob.html"
            })
            .when("/controllers/sliders/linear-slider", {
                templateUrl: "./pages/controllers/sliders/linear-slider.html"
            })
            .when("/introduction", {
                templateUrl: "./pages/introduction.html"
            })
            .otherwise({ redirectTo: "/" });
    });