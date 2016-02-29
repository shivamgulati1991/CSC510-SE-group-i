function doGet() {
  //return HtmlService.createHtmlOutputFromFile('index')
  return HtmlService.createTemplateFromFile('index')
  .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function dateToString(dateString) {
  var dateArray = dateString.split("/");
  var year = dateArray[2];
  var month = dateArray[0];
  var day = dateArray[1];
  var date = new Date(year, month - 1, day);
  return date;
}

function generateEvents(formObject){
var mycal = "sgulati2@ncsu.edu";
var cal = CalendarApp.getCalendarById(Session.getActiveUser().getEmail());
 
//var events = cal.getEvents(new Date("January 13, 2016 00:00:00 EST"), new Date("January 15, 2016 23:59:59 EST"));
var startDate = Utilities.formatDate(dateToString(formObject.startDate), "EST", "MMMM dd',' yyyy hh:mm:ss z");
  var endDate = Utilities.formatDate(dateToString(formObject.endDate), "EST", "MMMM dd',' yyyy hh:mm:ss z");
  Logger.log(startDate);
  Logger.log(endDate);
  var events = cal.getEvents(new Date(startDate),new Date(endDate), {search: formObject.keyword});
 
 var sheet = SpreadsheetApp.openById('1fOKAKmTAYQFP8ESFPAUtFerhXdaOrX4BToxt_Tk5Jss').getActiveSheet();
// Uncomment this next line if you want to always clear the spreadsheet content before running - Note people could have added extra columns on the data though that would be lost
 sheet.clearContents();  

// Create a header record on the current spreadsheet in cells A1:N1 - Match the number of entries in the "header=" to the last parameter
// of the getRange entry below
var header = [["Calendar Address", "Title", "Description", "Location", "Start Time", "End Time", "Calculated Duration", "Visibility", "Date Created", "Last Updated", "MyStatus", "Created By", "All Day Event", "Recurring Event"]]
var range = sheet.getRange(1,1,1,14);
range.setValues(header);
  
// Loop through all calendar events 
for (var i=0;i<events.length;i++) {
  var row=i+2;
  var myformula_placeholder = '';
  // Matching the "header=" entry above, this is the detailed row entry "details=", and must match the number of entries of the GetRange entry below
  var details=[[mycal,events[i].getTitle(), events[i].getDescription(), events[i].getLocation(), events[i].getStartTime(), events[i].getEndTime(), myformula_placeholder, ('' + events[i].getVisibility()), events[i].getDateCreated(), events[i].getLastUpdated(), events[i].getMyStatus(), events[i].getCreators(), events[i].isAllDayEvent(), events[i].isRecurringEvent()]];
  var range=sheet.getRange(row,1,1,14);
  range.setValues(details);
  var cell=sheet.getRange(row,7);
  cell.setFormula('=(HOUR(F' +row+ ')+(MINUTE(F' +row+ ')/60))-(HOUR(E' +row+ ')+(MINUTE(E' +row+ ')/60))');
  cell.setNumberFormat('.00');  
}
  sendReport();
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
  MailApp.sendEmail("ppradha3@ncsu.edu",'test html', message,{'htmlBody':messageHTML});
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

function submitDates(formObject) {
  Logger.log(formObject.startDate);
  Logger.log(formObject.endDate);
  Logger.log('hey there');
}

function generateDailyReport(formObject){
var mycal = Session.getActiveUser().getEmail();
var cal = CalendarApp.getCalendarById(Session.getActiveUser().getEmail());
  var currDate=new Date();
  var nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);
 
  var events = cal.getEvents(currDate,nextDate);
 
 var sheet = SpreadsheetApp.openById('1fOKAKmTAYQFP8ESFPAUtFerhXdaOrX4BToxt_Tk5Jss').getActiveSheet();
//clear sheet
 sheet.clearContents();  

//create header for excel sheet
//get data range below
var header = [["Calendar Address", "Title", "Description", "Location", "Start Time", "End Time", "Calculated Duration", "Visibility", "Date Created", "Last Updated", "MyStatus", "Created By", "All Day Event", "Recurring Event"]]
var range = sheet.getRange(1,1,1,14);
range.setValues(header);
  
//loop on calendar events and get them in excel
for (var i=0;i<events.length;i++) {
  var row=i+2;
  var myformula_placeholder = '';
 
  var details=[[mycal,events[i].getTitle(), events[i].getDescription(), events[i].getLocation(), events[i].getStartTime(), events[i].getEndTime(), myformula_placeholder, ('' + events[i].getVisibility()), events[i].getDateCreated(), events[i].getLastUpdated(), events[i].getMyStatus(), events[i].getCreators(), events[i].isAllDayEvent(), events[i].isRecurringEvent()]];
  var range=sheet.getRange(row,1,1,14);
  range.setValues(details);
  // Writing formulas from scripts requires that you write the formulas separate from non-formulas
  // Write the formula out for this specific row in column 7 to match the position of the field myformula_placeholder from above: foumula over columns F-E for time calc
  var cell=sheet.getRange(row,7);
  cell.setFormula('=(HOUR(F' +row+ ')+(MINUTE(F' +row+ ')/60))-(HOUR(E' +row+ ')+(MINUTE(E' +row+ ')/60))');
  cell.setNumberFormat('.00');  
}
  //send the extracted report to user's email
  sendReport();
}


function sendReport() {
  
  var responses = SpreadsheetApp.openById('1fOKAKmTAYQFP8ESFPAUtFerhXdaOrX4BToxt_Tk5Jss').getActiveSheet();
  //var ss = SpreadsheetApp.getActiveSpreadsheet();
  //var responses = ss.getActiveSheet();
  var lastRow = responses.getLastRow();
  
  //var data = responses.getRange('A2:F6').getValues();
  var data = responses.getRange("A"+2+":F"+(lastRow)).getValues();
  var body = 'Hi,<br/><h3>Event details you requested</h3> :<br><br><table style="background-color:cream;border-collapse:collapse;" border = 1 cellpadding = 5><th>Calendar</th><th>Title</th><th>Description</th><th>Location</th><th>Start Time</th><th>End Time</th><tr>'
  for( var row in data ) {
    body += '<tr>';
    for( var col in data[row] ) {
      body += '<td>'+data[row][col] + '</td>\t';
    }
    body += '</tr>\n';
  }
  //send email to user
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Appointments', body,{'htmlBody':body});
}

function createTimeDrivenTriggers(formObject) {
  // Trigger every 6 hours.
  var interval = formObject.groupInterval;
  if(interval=='Minute'){
      Logger.log('Trigger created Minute');
  ScriptApp.newTrigger('generateDailyReport')
      .timeBased()
      .everyMinutes(formObject.minuteInterval)
      .create();
  }
  else if(interval=='Hour'){
  Logger.log('Trigger created Hour');
  ScriptApp.newTrigger('generateDailyReport')
      .timeBased()
      .everyHours(formObject.hourInterval)
      .create();
  }
}

function deleteTrigger() {
  //delete all triggers
 var triggers = ScriptApp.getProjectTriggers();
 for (var i = 0; i < triggers.length; i++) {
   ScriptApp.deleteTrigger(triggers[i]);
 } 
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

function listActivity() {
  var optionalArgs = {
    source: 'drive.google.com',
    'drive.ancestorId': 'root',
    pageSize: 10
  };
  var response = AppsActivity.Activities.list(optionalArgs);
  var activities = response.activities;
  if (activities && activities.length > 0) {
    Logger.log('Recent activity:');
    for (i = 0; i < activities.length; i++) {
      var activity = activities[i];
      var event = activity.combinedEvent;
      var user = event.user;
      var target = event.target;
      if (user == null || target == null) {
        continue;
      } else {
        var time = new Date(Number(event.eventTimeMillis));
        Logger.log('%s: %s, %s, %s (%s)', time, user.name,
              event.primaryEventType, target.name, target.mimeType);
      }
    }
  } else {
    Logger.log('No recent activity');
  }
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Subject', Logger.getLog());
}

function getUsersActivity() {
  var fileId = '1fOKAKmTAYQFP8ESFPAUtFerhXdaOrX4BToxt_Tk5Jss';

  var pageToken;
  var users = {};
  do {
    var result = AppsActivity.Activities.list({
      'drive.fileId': fileId,
      'source': 'drive.google.com',
      'pageToken': pageToken
    });
    var activities = result.activities;
    for (var i = 0; i < activities.length; i++) {
      var events = activities[i].singleEvents;
      for (var j = 0; j < events.length; j++) {
        var event = events[j];
        users[event.user.name] = true;
      }
    }
    pageToken = result.nextPageToken;
  } while (pageToken);
  Logger.log(Object.keys(users));
}
function testUrl(){
 var response = UrlFetchApp.fetch("https://www.facebook.com/ical/u.php?uid=651889283&key=AQC0MIPvXoumQhcM/");
 Logger.log(response.getContentText());
}

function getEmail(){
  var email = Session.getActiveUser().getEmail();
  Logger.log(CalendarApp.getAllCalendars());
  return email;
}

function subscribeCalendar(formObject){
 
var calendar = CalendarApp.subscribeToCalendar(
  formObject.calendarID,
     { color: CalendarApp.Color.BLUE });
 Logger.log('Subscribed to the calendar "%s".', calendar.getName());
}