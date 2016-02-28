//Create the GUI form

function doGet2() {
  var app = UiApp.createApplication().setTitle('Form and Calendar Events');
  
  //Create a penel which holds all the form elelemnts
  var panel = app.createVerticalPanel().setId('panel');
  
  //Create the form elelemnts
  var eventDateLabel = app.createLabel('Event Date:');
  var evenDate = app.createDateBox().setId('eventDate');
  var eventTitleLabel = app.createLabel('Event title:');
  var eventTitle = app.createTextBox().setName('eventTitle').setId('eventTitle');
  var eventDeatilLabel = app.createLabel('Event Details:');
  var eventDetail = app.createTextArea()
      .setSize('200', '100').setId('eventDetail').setName('eventDetail');
    var btn = app.createButton('createEvents');
  
  //Create handler which eill execute 'createEvents(e)' on clicking the button
  var handler = app.createServerClickHandler('createEvents');
  handler.addCallbackElement(panel);
  //Add this handler to the button
  btn.addClickHandler(handler);
  
  //Add all the elemnts to the panel 
  panel.add(eventDateLabel)
    .add(evenDate)
    .add(eventTitleLabel)
    .add(eventTitle)
    .add(eventDeatilLabel)
    .add(eventDetail)
    .add(btn);
  //Add this panel to the application
  app.add(panel);
  //return the application
  return app;
}

function createEvents(e){
  
  //Get the active application
  var app = UiApp.getActiveApplication();
  
  try{
    //get the entries;
    var eventDate = e.parameter.eventDate;
    var eventTitle = e.parameter.eventTitle;
    var eventDetails = e.parameter.eventDetail;
    
    //Get the calendar
    var cal = CalendarApp.getCalendarById(Session.getActiveUser().getEmail());
    //var cal = CalendarApp.getCalendarsByName('ppradha3@ncsu.edu')[0];//Change the calendar name
    var eventStartTime = eventDate;
    //End time is calculated by adding an hour in the event start time 
    var eventEndTime = new Date(eventDate.valueOf()+60*60*1000);
    //Create the events
    cal.createEvent(eventTitle, eventStartTime,eventEndTime ,{description:eventDetails});
    
    //Log the entries in a spreadsheet
    /*var ss = SpreadsheetApp.openById('Spreadsheet-Key');//Change the spreadhseet key to yours
    var sheet = ss.getSheets()[0];
    sheet.getRange(sheet.getLastRow()+1, 1, 1, 5).setValues([[new Date(), eventDate,eventTitle, eventDetails, 'Event created']]);*/
    
    //Show the confirmation message
    app.add(app.createLabel('Event created Successfully'));
    //make the form panel invisible
    app.getElementById('panel').setVisible(false);
    return app;
  }
  
  //If an error occurs, show it on the panel
  catch(e){
    app.add(app.createLabel('Error occured: '+e));
    return app;
  }
}

function createEvent(formObject){
  Logger.log(formObject.eventDate);
  Logger.log(formObject.eventTitle);
  Logger.log(formObject.eventDetails);
      var cal = CalendarApp.getCalendarById(Session.getActiveUser().getEmail());
    //var cal = CalendarApp.getCalendarsByName('ppradha3@ncsu.edu')[0];//Change the calendar name
    var eventStartTime = dateToString(formObject.eventDate);
    var eventEndTime = dateToString(formObject.eventDate);
        eventEndTime.setDate(eventEndTime.getDate() + 1);
  Logger.log(eventStartTime);
    //End time is calculated by adding an hour in the event start time 
    //var eventEndTime = new Date(formObject.eventDate.valueOf()+60*60*1000);
  Logger.log(eventEndTime);
    //Create the events
    cal.createEvent(formObject.eventTitle, eventStartTime,eventEndTime ,{description:formObject.eventDetails});
  Logger.log('done');
}