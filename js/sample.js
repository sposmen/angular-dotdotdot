var app = angular.module('sampleApp', ['angular.dotdotdot']);
app.controller('Controller', ['$scope', Controller]);

function Controller($scope){
  $scope.dotAfter = {
    after: 'a.readmore'
  };
  $scope.dotWatch = {
    watch: 'window'
  }
}