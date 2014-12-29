#Map Quest. An assigment for Try-Catch.us
by Daniel Almeida: danielf.almeida@gmail.com

##Overview


##Pre-requisites
- bower
- angular.js
- angular-sanitize
- bootstrap
- jquery
- asyncjs

first install bower (note: node.js needs to be already installed):

`npm install -g bower`

Then, inside the source folder, you can install the needed packages:

`bower install angular`

`bower install angular-sanitize`

`bower install bootstrap`

`bower install async`


## How sorting works

It's possible to sort by any column. The column currently used for sorting
is defined in `$scope.optionsForm.sortFild`. The steps for sorting are as
follows:

- generate a primary array composed of a sub-array per record of the kind: `[<index in original data>, <value of field in record>]`
- this array is sorted by a user-defined sorting function that converts the lower case of the second value of the sub-arrays.
- the first column of the primary array is used as the sorting order of all the records.
