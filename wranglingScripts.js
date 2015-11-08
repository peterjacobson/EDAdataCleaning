function updateSheets() {
  
  // ensure no duplicate names in DATA sheets!!! >> merge (concat) duplicate name rows?
  // delete all extra rows on sheets to update
  // create a 'changeLogs' sheet
  // give the 'changeLogs' sheet 50,000 rows
  var ui = SpreadsheetApp.getUi();
  
  sheetsToUpdate = ['Marketing / App Data', 'Students', 'Student Leads']
  
  var sheetNum = ui.prompt("Select sheet index\n [0='Marketing / App Data', 1='Students', 2='Student Leads']").getResponseText()

  var continueScript = ui.alert('PROCESS:  ' + sheetsToUpdate[sheetNum] + '\nIN SPREADSHEET:  ' + SpreadsheetApp.getActiveSpreadsheet().getName(), ui.ButtonSet.YES_NO);
  Logger.log(continueScript);
  Logger.log(ui.button.NO)
  if (continueScript == ui.Button.NO) { return }
  scrapeDataInto(sheetsToUpdate[sheetNum]);
//  }
}


function scrapeDataInto(sheetName) {
  var ui = DocumentApp.getUi();
  var logCountNum = parseInt(ui.prompt("Enter Count number").getResponseText())
  var logColNum = parseInt(ui.prompt("Enter current column number").getResponseText())
  var logRowNum = parseInt(ui.prompt("Enter current row number").getResponseText())
  var currentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var currentSheetData = currentSheet.getDataRange().getValues();

  var dataSourceFirstDataRow = 3 - 1;
  var referenceToDataSourceSheet = 3 - 1
  var referenceToDataSourceColumnRow = 4 - 1;
  var titleRow = 5 - 1;
  var sheetFirstDataRow = 6 - 1;
  var numColumns = currentSheetData[titleRow].length;
  
  var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('changeLogs');
  logSheet.getRange(1,6,1,3).setValues([['col', 'row', 'totalchanges']])
  var countChanges = logCountNum;
  var changeLog = [['sheetUpdated', 'column', 'row', 'replaced value', 'new value']];
  
  // loop through columns
  for (var col = logColNum + 1; col < numColumns; col++) { 
    
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
      for (var row = logRowNum + 1; row < currentSheetData.length; row++) {
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
            logSheet.getRange(2,8).setValue(countChanges);
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

