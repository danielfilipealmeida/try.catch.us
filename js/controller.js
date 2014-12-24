
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

/**
 * method to calculate the camelCase of a string
 */
String.prototype.camelCase = function() {
  return this.toLowerCase().replace(/[-\s](.)/g, function(match, group1) {
    return group1.toUpperCase();
  });
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
   * generates an object from the data of the splitted csv row and uses
   * the corresponding column header value as it's name
   */
  $scope.generateRecordRowFromCSVArray = function(csvArray) {
    if (typeof $scope.csvData.headers === 'undefined' || $scope.csvData.headers == null) return {};

    var returningObj = {};

    for (var i in csvArray) {
      if (typeof $scope.csvData.headers[i]!=='undefined') {
        var columnName = $scope.csvData.headers[i].camelCase();
        returningObj[columnName] = csvArray[i];
      }

    }

    return returningObj
  }



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
      else {
        //$scope.csvData.records.push(splittedCsvRow);
        $scope.csvData.records.push($scope.generateRecordRowFromCSVArray(splittedCsvRow));

      }

      count++;
    }
    console.log($scope.csvData);

  }



  // run
  $scope.generateDataFromTextarea();
});
