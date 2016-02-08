function generateEvents(){

var mycal = "sgulati2@ncsu.edu";
var cal = CalendarApp.getCalendarById(mycal);

// Optional variations on getEvents
// var events = cal.getEvents(new Date("January 3, 2014 00:00:00 CST"), new Date("January 14, 2014 23:59:59 CST"));
// var events = cal.getEvents(new Date("January 3, 2014 00:00:00 CST"), new Date("January 14, 2014 23:59:59 CST"), {search: 'word1'});
// 
// Explanation of how the search section works (as it is NOT quite like most things Google) as part of the getEvents function:
//    {search: 'word1'}              Search for events with word1
//    {search: '-word1'}             Search for events without word1
//    {search: 'word1 word2'}        Search for events with word2 ONLY
//    {search: 'word1-word2'}        Search for events with ????
//    {search: 'word1 -word2'}       Search for events without word2
//    {search: 'word1+word2'}        Search for events with word1 AND word2
//    {search: 'word1+-word2'}       Search for events with word1 AND without word2
//
var events = cal.getEvents(new Date("January 12, 2016 00:00:00 CST"), new Date("January 18, 2016 23:59:59 CST"), {search: '-project123'});


var sheet = SpreadsheetApp.getActiveSheet();
// Uncomment this next line if you want to always clear the spreadsheet content before running - Note people could have added extra columns on the data though that would be lost
// sheet.clearContents();  

// Create a header record on the current spreadsheet in cells A1:N1 - Match the number of entries in the "header=" to the last parameter
// of the getRange entry below
var header = [["Calendar Address", "Title", "Description", "Location", "Start Time", "End Time", "Calculated Duration", "Visibility", "Date Created", "Last Updated", "MyStatus", "Created By", "All Day Event", "Recurring Event"]]
var range = sheet.getRange(1,1,1,14);
range.setValues(header);

  
// Loop through all calendar events found and write them out starting on calulated ROW 2 (i+2)
for (var i=0;i<events.length;i++) {
var row=i+2;
var myformula_placeholder = '';
// Matching the "header=" entry above, this is the detailed row entry "details=", and must match the number of entries of the GetRange entry below
// NOTE: I've had problems with the getVisibility for some older events not having a value, so I've had do add in some NULL text to make sure it does not error
var details=[[mycal,events[i].getTitle(), events[i].getDescription(), events[i].getLocation(), events[i].getStartTime(), events[i].getEndTime(), myformula_placeholder, ('' + events[i].getVisibility()), events[i].getDateCreated(), events[i].getLastUpdated(), events[i].getMyStatus(), events[i].getCreators(), events[i].isAllDayEvent(), events[i].isRecurringEvent()]];
var range=sheet.getRange(row,1,1,14);
range.setValues(details);

// Writing formulas from scripts requires that you write the formulas separate from non-formulas
// Write the formula out for this specific row in column 7 to match the position of the field myformula_placeholder from above: foumula over columns F-E for time calc
var cell=sheet.getRange(row,7);
cell.setFormula('=(HOUR(F' +row+ ')+(MINUTE(F' +row+ ')/60))-(HOUR(E' +row+ ')+(MINUTE(E' +row+ ')/60))');
cell.setNumberFormat('.00');

}
}

function sendEmails() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var startRow = 2;  // First row of data to process
  var numRows = 6;   // Number of rows to process
  // Fetch the range of cells A2:B3
  var dataRange = sheet.getRange(startRow, 1, numRows, 7)
  // Fetch values for each row in the Range.
  var data = dataRange.getValues();
  for (i in data) {
    var row = data[i];
    var emailAddress = row[0];  // First column
    var message = row[1];       // Second column
    var subject = "Sending emails from a Spreadsheet";
    MailApp.sendEmail("sgulati2@ncsu.edu", subject, message);
  }
}
function testMail(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responses = ss.getActiveSheet();
  var lastRow = responses.getLastRow();
  var values = responses.getRange("A"+(lastRow)+":M"+(lastRow)).getValues();
  var headers = responses.getRange("A1:AK6").getValues();
  var message = composeMessage(headers,values);
  var messageHTML = composeHtmlMsg(headers,values);
  Logger.log(messageHTML);
  MailApp.sendEmail("sgulati2@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
  MailApp.sendEmail("ppradha3@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
  MailApp.sendEmail("ngarg@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
  MailApp.sendEmail("sjain7@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
}

function composeMessage(headers,values){
  var message = 'Your event details :\n'
  for(var c=0;c<values[0].length;++c){
    message+='\n'+headers[0][c]+' : '+values[0][c]
  }
  return message;
}


function composeHtmlMsg(headers,values){
  var message = 'Your event details :<br><br><table style="background-color:grey;border-collapse:collapse;" border = 1 cellpadding = 5><th>data</th><th>Values</th><tr>'
  for(var c=0;c<values[0].length;++c){
    message+='<tr><td>'+headers[0][c]+'</td><td>'+values[0][c]+'</td></tr>'
  }
  return message+'</table>';
}
