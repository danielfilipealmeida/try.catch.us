
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


/**
 *
 */
String.prototype.crop = function(len) {
  var val = this;
  if (this.length>len) {
      val = val.substring(0,len)+"...";
  }
  return val;
}

var mapQuestApp = angular.module('mapQuestApp', ['ngSanitize']);

mapQuestApp.controller('MapQuestCtrl', function($scope, $sce) {

  $scope.pageData = {
      title: "Map Quest"
  };

  /* csv Data */
  $scope.csvData = {
    headers: [],
    headersObject: {},
    records: [],
    sortedRecords: [],
    filtering : [],
    columnOrdering: [],
  };

  /* map data */
  $scope.map = null;
  $scope.mapOptions = {
    center: new google.maps.LatLng(37.457674,-122.163452),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  $scope.markersArray = [];
  $scope.defaultMapLabelOptions = {
    boxStyle: {
      boxShadow: "1px 1px 5px #888888",
      background: "white",
      textAlign: "center",
      fontSize: "8pt",
      width: "70px",
      opacity: 1.0
    },
    disableAutoPan: true,
    pixelOffset: new google.maps.Size(-35, -60),
    closeBoxURL: "",
    pane: "floatPane",
    enableEventPropagation: true
  };
  $scope.labelsArray = [];

  /* options form */
  $scope.optionsForm = {
    labelField: "companyName",
    sortField: "founder",
    sortOrder: 1,
    locationType: 0,
    latitudeField: "garageLatitude",
    longitudeField: "garageLongitude",
    locationDescriptionField:"city"
  }

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

        // get the original column ordering by converting the splitted csv data values into camel case
        if (count == 0) $scope.csvData.columnOrdering.push(splittedCsvRow[j].camelCase());
      }

      var csvRowObject;

      // handle row
      if (count == 0) {
        $scope.csvData.headers = splittedCsvRow;
        csvRowObject = $scope.generateRecordRowFromCSVArray(splittedCsvRow);
        $scope.csvData.headersObject = csvRowObject;
      }
      else {
        csvRowObject = $scope.generateRecordRowFromCSVArray(splittedCsvRow);
        $scope.csvData.records.push(csvRowObject);
      }

      count++;
    }

  }



  /**
   * Calculate the sort order.
   * Uses a multi-dimensional sort to extract the order of indexes of each row
   */
  $scope.filterRecords = function() {
    // creates an array with all the values of the sort column
    var filteringColumnData = [];
    var count = 0;
    $scope.csvData.records.forEach(function(record) {
      var sortElement = [count, record[$scope.optionsForm.sortField]]
      filteringColumnData.push(sortElement);
      count++
    });

    // calculate sorting order
    var sortResult = filteringColumnData.sort(function(a, b) {
      // uses the lower case of the second field to sort
      var x = a[1].toLowerCase();
      var y = b[1].toLowerCase();

      return (x < y ? -1 : x > y ? 1 : 0) * $scope.optionsForm.sortOrder;
    });


    // takes out the sorting order from the first columb of the primary array
    $scope.csvData.columnOrdering=[];
    sortResult.forEach(function(sortResultRecord) {
      $scope.csvData.columnOrdering.push(sortResultRecord[0]);
    });

    // now sort!!
    $scope.csvData.sortedRecords = [];
    $scope.csvData.columnOrdering.forEach(function(index) {
      $scope.csvData.sortedRecords.push($scope.csvData.records[index]);
    });
  }



  /**
   * Initializes the the map
   */
   $scope.initMap = function() {
    $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
   }



   /**
    * Clear all the markers
    */
   $scope.clearMarkers = function() {

     // clear markers
     for(var i in  $scope.markersArray) {
       var marker =  $scope.markersArray[i];
       marker.setMap(null);
     }

     // clear labels
     for(var i in  $scope.labelsArray) {
        $scope.labelsArray[i].close();
     }

   }


   /**
    * Get the selected records and update the map
    */
   $scope.setMarkers = function() {

     function placeMarker(markerOptions, title) {
       var marker = new google.maps.Marker(markerOptions);
       marker.setMap($scope.map);
       $scope.markersArray.push(marker);

       // setup label
       var labelOption = $scope.defaultMapLabelOptions;
       labelOption.content = title.crop(10);
       labelOption.position = marker.getPosition();
       var label = new InfoBox(labelOption)
       label.open($scope.map);
       $scope.labelsArray.push(label);
     }



     // generate an array with the id's of the selected rows on the list
     var visibleIds = [];
     $('#dataTable tbody tr td input:checked').each(function() {
       var recordId = this.getAttribute("recordId");
       visibleIds.push(recordId);
     });


/*
     for(var i in $scope.csvData.records) {
       var currentRecord =  $scope.csvData.records[i];
       // check if this record is visible
       if (visibleIds.indexOf(currentRecord.id)>-1) {
  */

    async.each($scope.csvData.records, function(currentRecord, topCallback){

         var title = "";
         var markerOptions =  {};
         async.series({
           setSomeData: function(callback) {
             title = currentRecord[$scope.optionsForm.labelField];
             markerOptions = {
               title: title
             };
             callback();
           },
           setTheMarker: function(callback) {
             if ($scope.optionsForm.locationType == 0) {
               markerOptions.position = new google.maps.LatLng(currentRecord[$scope.optionsForm.latitudeField], currentRecord[$scope.optionsForm.longitudeField]);
               placeMarker(markerOptions,title);
               callback();
             }
             else {


               var geocoder = new google.maps.Geocoder();
               geocoder.geocode({'address': currentRecord[$scope.optionsForm.locationDescriptionField]}, function(results, status) {
                 if (status == google.maps.GeocoderStatus.OK) {
                   markerOptions.position = results[0].geometry.location;
                   placeMarker(markerOptions,title);
                   callback();
                 }
                 else callback();
               });
             }
           }
         }, function(err, results) {
           topCallback();
         } );
    })

/*
       }
     }
*/

   }


   /**
    * Destroy and recreate map data
    */
   $scope.updateMap = function() {
     $scope.clearMarkers();
     $scope.setMarkers();
   }



   /***********************************************************************/
   /* EVENTS                                                              */
   /***********************************************************************/


   /**
    * Handles the events of checkbox clicks (selection/unselection)
    */
   $scope.handleCheckboxClick = function() {
     $scope.updateMap();
   }

   /**
    * Callback to be executed when a change is made at the Label combo
    * This is used to set which column is used for markers label on the map
    */
   $scope.handleLabelsComboChange = function() {
     var selectedLabelIndex = $('#labelsCombo').find(":selected").val();
     $scope.optionsForm.labelField = $scope.csvData.headers[selectedLabelIndex].camelCase();

     $scope.updateMap();
   }


   /**
    * Callback to set the sorting field and sorting order
    */
   $scope.handleOrderComboChange = function() {
     var selectedLabelIndex = $('#sortFieldCombo').find(":selected").val();
     $scope.optionsForm.sortField = $scope.csvData.headers[selectedLabelIndex].camelCase();
     $scope.optionsForm.sortOrder = $('#sortOrderCombo').find(":selected").val();
     $scope.filterRecords();
   }


   /**
    * Callback used to handle all combos related to the location of the markers on the map
    */
   $scope.handleLocationSettingsChange = function() {
     var locationType = $('#locationTypeCombo').find(":selected").val();
     $scope.optionsForm.locationType = locationType;

     // handle geo location
     if (locationType==0) {
       $('#latitudeComboFG').show();
       $('#longitudeComboFG').show();
       $('#LocationDescriptionComboFG').hide();
       $scope.optionsForm.latitudeField = $scope.csvData.headers[$('#latitudeCombo').find(":selected").val()].camelCase();
       $scope.optionsForm.longitudeField = $scope.csvData.headers[$('#longitudeCombo').find(":selected").val()].camelCase();
     }
     else {
       // handle location string in any field
       $('#latitudeComboFG').hide();
       $('#longitudeComboFG').hide();
       $('#LocationDescriptionComboFG').show();
       $scope.optionsForm.locationDescriptionField = $scope.csvData.headers[$('#LocationDescriptionCombo').find(":selected").val()].camelCase();
     }

     $scope.updateMap();
   }



   // run
   $scope.generateDataFromTextarea();
   $scope.filterRecords();
   $scope.initMap();

   // code to run after the page is loaded
   angular.element(document).ready(function () {
     //$scope.handleLocationSettingsChange();
     $scope.setMarkers();
   });

});
