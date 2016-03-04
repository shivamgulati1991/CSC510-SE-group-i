package com.example.calendarquickstart;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.widget.CalendarView;
import android.widget.TextView;

import org.w3c.dom.Text;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

public class Calendar extends AppCompatActivity {

    //events from google calendar. seperated by \n
    private String googleEvents = "";

    private CalendarView mCalendarView;

    //view where event shows up
    private TextView mEventInfo;

    //Date->Event description (date is in format yyyy-mm-dd)
    private HashMap<String,String> mEventMap;
    private static final long buffer = 86400000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.content_calendar);

        Intent startIntent = getIntent();
        if(startIntent!=null){
            googleEvents = startIntent.getStringExtra(MainActivity.EVENT_INFO_BUNDLE);
        }
        mCalendarView = (CalendarView) findViewById(R.id.calendar_view);
        mEventInfo = (TextView) findViewById(R.id.event_info);
        Log.i("Nishtha1", "Date: " + mCalendarView.getDate());
        new EventInfoParser().execute(googleEvents);
        mCalendarView.setOnDateChangeListener(new CalendarView.OnDateChangeListener() {
            @Override
            public void onSelectedDayChange(CalendarView view, int year, int month, int dayOfMonth) {
                //month index is starting from 0...no idea why
                int actualMonth = month+1;
                String dateNow = year+"-"+(actualMonth>9?actualMonth+"":"0"+actualMonth)+
                        "-"+(dayOfMonth>9?dayOfMonth+"":"0"+dayOfMonth);
                Log.i("Nishtha1","selected:"+dateNow+"  "+mEventMap.containsKey(dateNow));
                if(mEventMap.containsKey(dateNow)){
                    mEventInfo.setText(mEventMap.get(dateNow));
                }
                else{
                    mEventInfo.setText("No Events");
                }

            }
        });

    }

    private long millisTime(Date d){
        Date d2 = new Date(1970,1,1);
        return Math.abs(d.getTime() - d2.getTime());
    }

    class EventInfoParser extends AsyncTask<String, Void, HashMap<String,String>>{

        @Override
        protected HashMap<String, String> doInBackground(String... params) {
            String[] events = params[0].split("\n");
            HashMap<String,String> map = new HashMap<>();
            for(String event : events){
                String[] comp = event.split("-----");
                //Log.i("Nistha1",""+comp[0]);
                String date = comp[1].replace("(","").split("T")[0];
                //String[] dateSplit = date.split("-");
                //Date d1 = new Date(Integer.parseInt(dateSplit[0]),Integer.parseInt(dateSplit[1]),Integer.parseInt(dateSplit[2]));
                //long time = millisTime(d1);
                String desc = comp[0];
                Log.i("Nishtha1","time:"+date+" desc:"+desc);
                if(map.containsKey(date)){
                    desc += "\n"+map.get(date);
                }
                map.put(date,desc);
            }
            return map;
        }

        @Override
        protected void onPostExecute(HashMap<String, String> longStringHashMap) {
            super.onPostExecute(longStringHashMap);
            mEventMap = longStringHashMap;
        }
    }

}
