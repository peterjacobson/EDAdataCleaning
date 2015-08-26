function updateSheets() {
  
  // ensure no duplicate names in DATA sheets!!! >> merge (concat) duplicate name rows?
  // delete all extra rows on sheets to update
  // create a 'changeLogs' sheet
  // give the 'changeLogs' sheet 50,000 rows
  
  sheetsToUpdate = ['Marketing / App Data']//, 'Students', 'Student Leads']
  for (var i = 0; i < sheetsToUpdate.length; i++) {
    SpreadsheetApp.getUi().alert('PROCESS:  ' + sheetsToUpdate[i] + '\nIN SPREADSHEET:  ' + SpreadsheetApp.getActiveSpreadsheet().getName());
    scrapeDataInto(sheetsToUpdate[i]);
  }
}

function scrapeDataInto(sheetName) {
  var currentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var currentSheetData = currentSheet.getDataRange().getValues();

  var dataSourceFirstDataRow = 3 - 1;
  var referenceToDataSourceSheet = 3 - 1
  var referenceToDataSourceColumnRow = 4 - 1;
  var titleRow = 5 - 1;
  var sheetFirstDataRow = 6 - 1;
  var numColumns = currentSheetData[titleRow].length;
  
  var countChanges = 0;
  var changeLog = [['sheetUpdated', 'column', 'row', 'replaced value', 'new value']];
  
  // loop through columns
  for (var col = 1; col < numColumns; col++) { 
    
    // if reference exists
    var dataSourceColumn = parseInt(currentSheetData[referenceToDataSourceColumnRow][col]) - 1;
    if (dataSourceColumn) {
      
      // set dataSource
      var dataSourceSheetName = currentSheetData[referenceToDataSourceSheet][col] == '' ? 'DATA' : currentSheetData[referenceToDataSourceSheet][col];
      var dataSourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSourceSheetName);
      var dataSourceData = dataSourceSheet.getDataRange().getValues();
      var dataSourceRotated = dataSourceData[0].map(function(col, i) { 
        return dataSourceData.map(function(row) { 
          return row[i]; 
        })
      });
      
      //process rows
      for (var row = sheetFirstDataRow; row < currentSheetData.length; row++) {
        var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('changeLogs');
        logSheet.getRange(2,6).setValue(col);
        logSheet.getRange(2,7).setValue(row);
        
        // if name found in other sheet
        var name = currentSheetData[row][0];
        var nameIndexInSource = dataSourceRotated[0].indexOf(name);
        if (nameIndexInSource != -1) {
          
          // if data found for the person in the lookup column
          var dataForName = dataSourceData[nameIndexInSource][dataSourceColumn];
          if (dataForName) {
            
            countChanges++;
            var sheetRow = row + 1;
            var sheetCol = col + 1;
            var oldValue = currentSheet.getRange(row + 1, col + 1).getValue();
            logChangesToSheet(countChanges, [sheetName, sheetCol, sheetRow, oldValue, dataForName]);
            
            currentSheet.getRange(sheetRow, sheetCol).setValue(dataForName);
          }
        }
      }
    }
  }
}

function logChangesToSheet(changeNum, changeLog) {
  var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('changeLogs');
  logSheet.getRange(changeNum + 1,1,1, changeLog.length).setValues([changeLog]);
}

