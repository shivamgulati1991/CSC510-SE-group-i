function doGet() {
  //return HtmlService.createHtmlOutputFromFile('index')
  return HtmlService.createTemplateFromFile('index')
  .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


function generateEvents(){

var mycal = "sgulati2@ncsu.edu";
var cal = CalendarApp.getCalendarById(Session.getActiveUser().getEmail());
 
// Explanation of how the search section works (as it is NOT quite like most things Google) as part of the getEvents function:
//    {search: 'word1'}              Search for events with word1
//    {search: '-word1'}             Search for events without word1
//    {search: 'word1 word2'}        Search for events with word2 ONLY
//    {search: 'word1-word2'}        Search for events with ????
//    {search: 'word1 -word2'}       Search for events without word2
//    {search: 'word1+word2'}        Search for events with word1 AND word2
//    {search: 'word1+-word2'}       Search for events with word1 AND without word2
  
var events = cal.getEvents(new Date("January 13, 2016 00:00:00 EST"), new Date("January 18, 2016 23:59:59 EST"), {search: '-project123'});
//var events = cal.getEvents(new Date(startDate), new Date(endDate), {search: '-project123'});

var sheet = SpreadsheetApp.getActiveSheet();
// Uncomment this next line if you want to always clear the spreadsheet content before running - Note people could have added extra columns on the data though that would be lost
 sheet.clearContents();  

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

/*function testMail(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responses = ss.getActiveSheet();
  
  var lastRow = responses.getLastRow();
  var values = responses.getRange("A"+2+":N"+(lastRow)).getValues();
  var headers = responses.getRange("A1:AK6").getValues();
  var message = composeMessage(headers,values);
  var messageHTML = composeHtmlMsg(headers,values);
  Logger.log(messageHTML);
  MailApp.sendEmail("sgulati2@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
 // MailApp.sendEmail("ppradha3@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
 // MailApp.sendEmail("ngarg@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
 // MailApp.sendEmail("sjain7@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
}

function composeMessage(headers,values){
  var message = 'Your event details :\n'
  for(var c=0;c<values[0].length;++c){
    message+='\n'+headers[0][c]+' : '+values[0][c]
  }
  return message;
}*/
function submitDates(startDate,endDate) {
  Logger.log(JSON.stringify(arguments));
  // To send error messages, throw an exception.
  // e.g. if (invalid) throw new error("Invalid date")
}
function sendReport() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responses = ss.getActiveSheet();
  var lastRow = responses.getLastRow();
  //var data = responses.getRange('A2:F6').getValues();
  var data = responses.getRange("A"+2+":F"+(lastRow)).getValues();
  var body = 'Your event details :<br><br><table style="background-color:lightgrey;border-collapse:collapse;" border = 1 cellpadding = 5><th>Calendar Address</th><th>Title</th><th>Description</th><th>Location</th><th>Start Time</th><th>End Time</th><tr>'
  for( var row in data ) {
    body += '<tr>';
    for( var col in data[row] ) {
      body += '<td>'+data[row][col] + '</td>\t';
    }
    body += '</tr>\n';
  }
  MailApp.sendEmail("sgulati2@ncsu.edu", 'Subject', body,{'htmlBody':body});
}


/*function composeHtmlMsg(headers,values){
  var message = 'Your event details :<br><br><table style="background-color:lightgrey;border-collapse:collapse;" border = 1 cellpadding = 5><th>data</th><th>Values</th><tr>'
  for(var c=0;c<values[0].length;++c){
    message+='<tr><td>'+headers[0][c]+'</td><td>'+values[0][c]+'</td></tr>'
  }
  return message+'</table>';
}*/


function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('Dialog')
      .addItem('Open', 'openDialog')
      .addToUi();
}

function openDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Index')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Dialog title');
}