
/**
 * Add a method to split a string in to an array at line breaks to the String prototype
 */
String.prototype.splitLines = function() {
  return this.match(/^.*((\r\n|\n|\r)|$)/gm);
};

/**
 * Add a method to the String prototype to split a CSV line
 */
String.prototype.splitCSVLine = function() {
  return this.split(/[,;\t]+/);
}




var mapQuestApp = angular.module('mapQuestApp', []);

mapQuestApp.controller('MapQuestCtrl', function($scope) {

  $scope.pageData = {
      title: "Map Quest"
  };
  $scope.csvData = {
    headers: [],
    records: [],
    filtering : []
  };






  /**
   * Generates the records from the raw csv data in the textarea
   */
  $scope.generateDataFromTextarea = function(){

    // get the data from the textarea
    var rawData = $('#inputArea').val();

    if (typeof rawData === 'undefined') return;

    // split at line endings. generates a matrix
    var splittedRawData = rawData.splitLines();


    $scope.csvData.records = [];

    // traverse the data and split each line
    var count = 0;
    for(var i in splittedRawData) {
      var csvRawRow = splittedRawData[i];

      // split the csv row
      var splittedCsvRow = csvRawRow.splitCSVLine();

      // remove whitespace
      for (var j in splittedCsvRow) {
        splittedCsvRow[j] = splittedCsvRow[j].trim();
      }

      if (count == 0) $scope.csvData.headers = splittedCsvRow;
      else $scope.csvData.records.push(splittedCsvRow);

      count++;
    }
    console.log($scope.csvData);

  }



  // run
  $scope.generateDataFromTextarea();
});
