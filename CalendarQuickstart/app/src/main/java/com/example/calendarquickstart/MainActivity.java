package com.example.calendarquickstart; /**
 * Created by nisthagarg on 2/27/16.
 */


import com.facebook.CallbackManager;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.login.widget.LoginButton;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.api.client.extensions.android.http.AndroidHttp;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.googleapis.extensions.android.gms.auth.GooglePlayServicesAvailabilityIOException;
import com.google.api.client.googleapis.extensions.android.gms.auth.UserRecoverableAuthIOException;
//import org.firebirdsql.jdbc.FBConnection;


import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.ExponentialBackOff;

import com.google.api.services.calendar.CalendarScopes;
import com.google.api.client.util.DateTime;

import com.google.api.services.calendar.model.*;

import com.facebook.FacebookSdk;

import android.accounts.AccountManager;
import android.app.Activity;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.TextUtils;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

//import FBSDKLoginKit;

import net.smartam.leeloo.client.OAuthClient;
import net.smartam.leeloo.client.URLConnectionClient;
import net.smartam.leeloo.client.request.OAuthClientRequest;
import net.smartam.leeloo.client.response.OAuthAccessTokenResponse;
import net.smartam.leeloo.common.exception.OAuthProblemException;
import net.smartam.leeloo.common.exception.OAuthSystemException;
import net.smartam.leeloo.common.message.types.GrantType;

import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends Activity {
    CallbackManager callbackManager;
    private static final int MEET_UP_REQ_CODE = 122;
    private static final String MEETUP_ACCOUNT_TOKEN = "meetup_accName";
    GoogleAccountCredential mCredential;
    private TextView mOutputText;
    ProgressDialog mProgress;

    private final String TAG = getClass().getName();

    public static final String EVENT_INFO_BUNDLE = "Gevent_info";
    public static final String EVENT_INFO_BUNDLE2 = "FBevent_info";
    public static final String EVENT_INFO_BUNDLE3 = "meetupevent_info";

    static final int REQUEST_ACCOUNT_PICKER = 1000;
    static final int REQUEST_AUTHORIZATION = 1001;
    static final int REQUEST_GOOGLE_PLAY_SERVICES = 1002;
    private static final String PREF_ACCOUNT_NAME = "accountName";

    public static final String AUTH_URL = "https://secure.meetup.com/oauth2/authorize";
    public static final String TOKEN_URL = "https://secure.meetup.com/oauth2/access";

    //     Consumer
    //public static final String REDIRECT_URI_SCHEME = "oauthresponse";
    //public static final String REDIRECT_URI_HOST = "com.yourpackage.app";
    //public static final String REDIRECT_URI_HOST_APP = "yourapp";
    //public static final String REDIRECT_URI = REDIRECT_URI_SCHEME + "://" + REDIRECT_URI_HOST + "/";

    private static final String[] SCOPES = { CalendarScopes.CALENDAR_READONLY };
    private Button mGbutton;
    private Button mFbButton;
    private Button mMeetButton;
    private String googleEvents ="";
    private String facebookEvents = "";
    private String meetupEvents = "";
    private Button mShowCal;

    private Context _context;
    /**
     * Create the main activity.
     * @param savedInstanceState previously saved instance data.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FacebookSdk.sdkInitialize(getApplicationContext());
        callbackManager = CallbackManager.Factory.create();


//        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
//                LinearLayout.LayoutParams.MATCH_PARENT,
//                LinearLayout.LayoutParams.MATCH_PARENT);
//        activityLayout.setLayoutParams(lp);
//        activityLayout.setOrientation(LinearLayout.VERTICAL);
//        activityLayout.setPadding(16, 16, 16, 16);

//        ViewGroup.LayoutParams tlp = new ViewGroup.LayoutParams(
//                ViewGroup.LayoutParams.WRAP_CONTENT,
//                ViewGroup.LayoutParams.WRAP_CONTENT);


        setContentView(R.layout.activity_main);
        mOutputText = (TextView) findViewById(R.id.progress);
//        mOutputText.setLayoutParams(tlp);
//        mOutputText.setPadding(16, 16, 16, 16);
//        mOutputText.setVerticalScrollBarEnabled(true);
//        mOutputText.setMovementMethod(new ScrollingMovementMethod());
//        activityLayout.addView(mOutputText);

        mProgress = new ProgressDialog(this);
        mProgress.setMessage("Please wait while we fetch your events.");
        mGbutton = (Button) findViewById(R.id.google_button);
        mFbButton = (Button) findViewById(R.id.login_button);
        mMeetButton = (Button) findViewById(R.id.meetup_button);
        mShowCal = (Button) findViewById(R.id.showCalendar);


        // Initialize credentials and service object.
        SharedPreferences settings = getPreferences(Context.MODE_PRIVATE);
        mCredential = GoogleAccountCredential.usingOAuth2(
                getApplicationContext(), Arrays.asList(SCOPES))
                .setBackOff(new ExponentialBackOff())
                .setSelectedAccountName(settings.getString(PREF_ACCOUNT_NAME, null));

        mGbutton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                initGoogleCalendar();
            }
        });

        mFbButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                initFBCalendar();
            }
        });
        Log.i("Nishtha", "onCreate");
        mShowCal.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showCalendarActivity();
            }
        });

        mMeetButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                initMeetupCalendar();
            }
        });
    }



    private void initGoogleCalendar(){
        if (isGooglePlayServicesAvailable()) {
            Log.i("Nishtha","isGooglePlayServicesAvailable");
            refreshResults();
        } else {
            mOutputText.setText("Google Play Services required: " +
                    "after installing, close and relaunch this app.");
        }
    }

    private void initFBCalendar(){

//        //add fetching events from FB calandar code here
//        FBConnection fbConnection = new FBConnection();

    }

    private void initMeetupCalendar(){
        Intent initMeetup = new Intent(this,MeetupAuthActivity.class);
        startActivityForResult(initMeetup,MEET_UP_REQ_CODE);
    }

    /**
     * Called whenever this activity is pushed to the foreground, such as after
     * a call to onCreate().
     */
    @Override
    protected void onResume() {
        super.onResume();
        //AppEventsLogger.activateApp(this);
        Log.i("Nishtha","onResume");
//        if (isGooglePlayServicesAvailable()) {
//            Log.i("Nishtha","isGooglePlayServicesAvailable");
//            refreshResults();
//        } else {
//            mOutputText.setText("Google Play Services required: " +
//                    "after installing, close and relaunch this app.");
//        }
//        if(!("".equals(getSharedPreferences(PREF_ACCOUNT_NAME,MODE_PRIVATE).getString(PREF_ACCOUNT_NAME,"")))){
//            Log.i("Nishtha",""+PREF_ACCOUNT_NAME+" "+getSharedPreferences(PREF_ACCOUNT_NAME,MODE_PRIVATE).getString(PREF_ACCOUNT_NAME,""));
////            Intent i = new Intent(getApplicationContext(), com.example.calendarquickstart.Calendar.class);
////            startActivity(i);
//        }
    }

    void showCalendarActivity() {
        Intent i = new Intent(getApplicationContext(), com.example.calendarquickstart.Calendar.class);
        i.putExtra(EVENT_INFO_BUNDLE, googleEvents);
        i.putExtra(EVENT_INFO_BUNDLE2,facebookEvents);
        i.putExtra(EVENT_INFO_BUNDLE3, meetupEvents);
        i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(i);
//        finish();
    }

    /**
     * Called when an activity launched here (specifically, AccountPicker
     * and authorization) exits, giving you the requestCode you started it with,
     * the resultCode it returned, and any additional data from it.
     * @param requestCode code indicating which activity result is incoming.
     * @param resultCode code indicating the result of the incoming
     *     activity result.
     * @param data Intent (containing result data) returned by incoming
     *     activity result.
     */
    @Override
    protected void onActivityResult(
            int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch(requestCode) {
            case REQUEST_GOOGLE_PLAY_SERVICES:
                if (resultCode != RESULT_OK) {
                    isGooglePlayServicesAvailable();
                }
                break;
            case REQUEST_ACCOUNT_PICKER:
                if (resultCode == RESULT_OK && data != null &&
                        data.getExtras() != null) {
                    String accountName =
                            data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
                    if (accountName != null) {
                        mCredential.setSelectedAccountName(accountName);
                        SharedPreferences settings =
                                getPreferences(Context.MODE_PRIVATE);
                        SharedPreferences.Editor editor = settings.edit();
                        editor.putString(PREF_ACCOUNT_NAME, accountName);
                        editor.apply();
                    }
                } else if (resultCode == RESULT_CANCELED) {
                    mOutputText.setText("Account unspecified.");
                }
                break;
            case REQUEST_AUTHORIZATION:
                if (resultCode != RESULT_OK) {
                    chooseAccount();
                }
                break;
            case MEET_UP_REQ_CODE:
                if (resultCode == RESULT_OK) {
                    String accessToken = data.getStringExtra(MeetupAuthActivity.MEETUP_TOKEN);
                    SharedPreferences settings =
                            getPreferences(Context.MODE_PRIVATE);
                    SharedPreferences.Editor editor = settings.edit();
                    editor.putString(MEETUP_ACCOUNT_TOKEN, accessToken);
                    editor.apply();
                    Log.i("MainAct","accesstoken:"+accessToken);
                }
        }

        super.onActivityResult(requestCode, resultCode, data);
    }

    /**
     * Attempt to get a set of data from the Google Calendar API to display. If the
     * email address isn't known yet, then call chooseAccount() method so the
     * user can pick an account.
     */
    private void refreshResults() {
        Log.i("Nishtha", "refreshResults");
        if (mCredential.getSelectedAccountName() == null) {
            Log.i("Nishtha","refreshResults if");
            chooseAccount();
        }
        else {
            if (isDeviceOnline()) {
                Log.i("Nishtha", "refreshResults else if");
                new MakeRequestTask(mCredential).execute();
            } else {
                Log.i("Nishtha", "refreshResults else else");
                mOutputText.setText("No network connection available.");
            }
        }
    }

    /**
     * Starts an activity in Google Play Services so the user can pick an
     * account.
     */
    private void chooseAccount() {
        startActivityForResult(
                mCredential.newChooseAccountIntent(), REQUEST_ACCOUNT_PICKER);
    }

    /**
     * Checks whether the device currently has a network connection.
     * @return true if the device has a network connection, false otherwise.
     */
    private boolean isDeviceOnline() {
        ConnectivityManager connMgr =
                (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();
        return (networkInfo != null && networkInfo.isConnected());
    }

    /**
     * Check that Google Play services APK is installed and up to date. Will
     * launch an error dialog for the user to update Google Play Services if
     * possible.
     * @return true if Google Play Services is available and up to
     *     date on this device; false otherwise.
     */
    private boolean isGooglePlayServicesAvailable() {
        final int connectionStatusCode =
                GooglePlayServicesUtil.isGooglePlayServicesAvailable(this);
        Log.i("Nishtha", "isGooglePlayServicesAvailable");
        if (GooglePlayServicesUtil.isUserRecoverableError(connectionStatusCode)) {
            showGooglePlayServicesAvailabilityErrorDialog(connectionStatusCode);
            Log.i("Nishtha", "isGooglePlayServicesAvailable if");
            return false;
        } else if (connectionStatusCode != ConnectionResult.SUCCESS ) {
            Log.i("Nishtha","isGooglePlayServicesAvailable else");
            return false;
        }
        return true;
    }

    /**
     * Display an error dialog showing that Google Play Services is missing
     * or out of date.
     * @param connectionStatusCode code describing the presence (or lack of)
     *     Google Play Services on this device.
     */
    void showGooglePlayServicesAvailabilityErrorDialog(
            final int connectionStatusCode) {
        Dialog dialog = GooglePlayServicesUtil.getErrorDialog(
                connectionStatusCode,
                MainActivity.this,
                REQUEST_GOOGLE_PLAY_SERVICES);
        dialog.show();
    }

    /**
     * An asynchronous task that handles the Google Calendar API call.
     * Placing the API calls in their own task ensures the UI stays responsive.
     */
    private class MakeRequestTask extends AsyncTask<Void, Void, List<String>> {
        private com.google.api.services.calendar.Calendar mService = null;
        private Exception mLastError = null;

        public MakeRequestTask(GoogleAccountCredential credential) {
            Log.i("Nishtha","MakeRequestTask");
            HttpTransport transport = AndroidHttp.newCompatibleTransport();
            JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();
            mService = new com.google.api.services.calendar.Calendar.Builder(
                    transport, jsonFactory, credential)
                    .setApplicationName("Google Calendar API Android Quickstart")
                    .build();
        }

        /**
         * Background task to call Google Calendar API.
         * @param params no parameters needed for this task.
         */
        @Override
        protected List<String> doInBackground(Void... params) {
            try {
                Log.i("Nishtha","doInBackground");
                return getDataFromApi();
            } catch (Exception e) {
                mLastError = e;
                cancel(true);
                return null;
            }
        }

        /**
         * Fetch a list of the next 10 events from the primary calendar.
         * @return List of Strings describing returned events.
         * @throws IOException
         */
        private List<String> getDataFromApi() throws IOException {
            // List the next 10 events from the primary calendar.
            Log.i("Nishtha","getDataFromApi");
            DateTime now = new DateTime(System.currentTimeMillis());
            List<String> eventStrings = new ArrayList<String>();
            Events events = mService.events().list("primary")
                    .setMaxResults(10)
                    .setTimeMin(now)
                    .setOrderBy("startTime")
                    .setSingleEvents(true)
                    .execute();
            List<Event> items = events.getItems();
            Log.i("Nishtha","items.size: "+items.size());
            for (Event event : items) {
                Log.i("Nishtha","events loop");
                DateTime start = event.getStart().getDateTime();
                if (start == null) {
                    // All-day events don't have start times, so just use
                    // the start date.
                    start = event.getStart().getDate();
                }
                eventStrings.add(
                        String.format("%s-----(%s)", event.getSummary(), start));
            }
            return eventStrings;
        }


        @Override
        protected void onPreExecute() {
            mOutputText.setText("");
            mProgress.show();
        }

        @Override
        protected void onPostExecute(List<String> output) {
            Log.i("Nishtha","onPostExecute");
            mProgress.dismiss();
            if (output == null || output.size() == 0) {
                mOutputText.setText("No results returned.");
            } else {
                //output.add(0, "Data retrieved using the Google Calendar API:");
                mOutputText.setText("Fetched google results");
                googleEvents = TextUtils.join("\n", output);

//                facebookEvents = ""; //add results from FB calander here


            }
        }

        @Override
        protected void onCancelled() {
            mProgress.hide();
            if (mLastError != null) {
                if (mLastError instanceof GooglePlayServicesAvailabilityIOException) {
                    showGooglePlayServicesAvailabilityErrorDialog(
                            ((GooglePlayServicesAvailabilityIOException) mLastError)
                                    .getConnectionStatusCode());
                } else if (mLastError instanceof UserRecoverableAuthIOException) {
                    startActivityForResult(
                            ((UserRecoverableAuthIOException) mLastError).getIntent(),
                            MainActivity.REQUEST_AUTHORIZATION);
                } else {
                    mOutputText.setText("The following error occurred:\n"
                            + mLastError.getMessage());
                }
            } else {
                mOutputText.setText("Request cancelled.");
            }
        }
    }




}