
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


/***
 * method to detect if a string is a url
 */
String.prototype.isUrl = function() {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(this);
}

/**
 * returns the filename from an url
 */
String.prototype.fileFromUrl = function() {
  return this.substring(this.lastIndexOf('/')+1);
}


/**
 * check if a filename has an image extention
 */
String.prototype.isImage = function() {
  var imageExts = ["jpg", "gif", "png"];

  // split at point
  filenameArray = this.split('.');

  if (filenameArray.length==1) return false;

  return imageExts.indexOf(filenameArray[1].toLowerCase()) >= 0 ? true : false;

}


var mapQuestApp = angular.module('mapQuestApp', ['ngSanitize']);

mapQuestApp.controller('MapQuestCtrl', function($scope, $sce) {

  $scope.pageData = {
      title: "Map Quest"
  };
  $scope.csvData = {
    headers: {},
    records: [],
    filtering : [],
    columnOrdering: []
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
        var value = csvArray[i];

        // check if this is an url
        if (value.isUrl() == true) {

          var filename = value.fileFromUrl();

          // check if this is an image by remo
          if (filename.isImage()) {
            console.log("image! ", filename);
            value = '<img src="'+value+'" class="img-responsive img-thumbnail" />';
          }
          else {
            // if this isn't an image, make it a link
            value = '<a href="'+value+'">'+value+'</a>';
          }

        }


        returningObj[columnName] = value;
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

        // // get the original column ordering by converting the splitted csv data values into camel case
        if (count == 0) $scope.csvData.columnOrdering.push(splittedCsvRow[j].camelCase());
      }

      var csvRowObject = $scope.generateRecordRowFromCSVArray(splittedCsvRow);

      // handle row
      if (count == 0){
        $scope.csvData.headers = splittedCsvRow;
        $scope.csvData.headersObject = csvRowObject;
      }
      else {
        //$scope.csvData.records.push(splittedCsvRow);
        $scope.csvData.records.push(csvRowObject);
      }

      count++;
    }
    console.log($scope.csvData);

  }



  // run
  //$sceProvider.enabled(false);
  $scope.generateDataFromTextarea();
});
