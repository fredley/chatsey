package com.tommedley.chatsey;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class WebActivity extends Activity {

    private static final boolean DEBUG = false;

    private static final String USER_AGENT_STRING = "Chatsey";
    private static final String TAG = "WebActivity";
    private WebView mWebView;

    private static final String URL_ROOT = "http://chatsey.s3-website-eu-west-1.amazonaws.com/remote/";
    private static final String DEVICE_MOBILE = "mobile";
    private static final String DEVICE_TABLET = "tablet";

    private static final String THEME_DARK = "dark";
    private static final String THEME_DEFAULT = "default";

    private boolean inChat = false;

    public String device() {
        return (this.getResources().getConfiguration().screenLayout
                & Configuration.SCREENLAYOUT_SIZE_MASK)
                >= Configuration.SCREENLAYOUT_SIZE_LARGE ? DEVICE_TABLET : DEVICE_MOBILE;
    }

    private class ChatseyAppInterface {
        @JavascriptInterface
        public void setInChat(boolean to) {
            inChat = to;
        }
        @JavascriptInterface
        public void setTheme(String theme) {
            SharedPreferences settings = getSharedPreferences("Chatsey", 0);
            SharedPreferences.Editor editor = settings.edit();
            editor.putString("theme", theme);
            editor.commit();
        }
        @JavascriptInterface
        public void setDeviceMobile(boolean isMobile) {
            final String device = (isMobile) ? "mobile" : "tablet";
            WebActivity.this.runOnUiThread(new Runnable() {
                public void run() {
                    SharedPreferences settings = getSharedPreferences("Chatsey", 0);
                    String theme = settings.getString("theme", THEME_DEFAULT);
                    String js = "javascript:(function() {" +
                            "var parent = document.getElementsByTagName('head').item(0);" +
                            "var livequery = document.createElement('script');" +
                            "livequery.type = 'text/javascript';" +
                            "livequery.src = '" + URL_ROOT + "livequery.js';" +
                            "var script = document.createElement('script');" +
                            "script.type = 'text/javascript';" +
                            "script.src = '" + URL_ROOT + device + ".js';" +
                            "var link = document.createElement('link');" +
                            "link.rel = 'stylesheet';" +
                            "link.href = '" + URL_ROOT + device + ".css';" +
                            "var theme = document.createElement('link');" +
                            "theme.rel = 'stylesheet';" +
                            "theme.href = '" + URL_ROOT + "themes.css';" +
                            "parent.appendChild(livequery);" +
                            "parent.appendChild(script);" +
                            "parent.appendChild(link);" +
                            "parent.appendChild(theme);";
                            if(!theme.equals(THEME_DEFAULT)){
                                js += "var themeload = document.createElement('script');" +
                                "themeload.type = 'text/javascript';" +
                                "themeload.innerHTML = '$(document).ready(function(){" +
                                "setTheme('" + theme + "');" +
                                "});';" +
                                "parent.appendChild(themeload);";
                            }
                            js += "})()";
                    mWebView.loadUrl(js);
                }
            });
        }
    }

    private class ChatWebChromeClient extends WebChromeClient {
        @Override
        public boolean onJsConfirm(WebView view, String url, String message, final JsResult result){
            new AlertDialog.Builder(WebActivity.this)
                .setTitle("Are you sure?")
                .setMessage(message)
                .setPositiveButton("Yes",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                result.confirm();
                            }
                        })
                .setNegativeButton("No",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                result.cancel();
                            }
                        })
                .create()
                .show();
            return true;
        }
    }

    private class ChatWebViewClient extends WebViewClient {

        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl){
            Log.d(TAG, "Error loading page: " + description);
            view.stopLoading();
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            String js = "javascript:(function() {" +
                    "var parent = document.getElementsByTagName('head').item(0);" +
                    "var initjs = document.createElement('script');" +
                    "initjs.type = 'text/javascript';" +
                    "initjs.src = '" + URL_ROOT + "init.js';" +
                    "parent.appendChild(initjs);" +
                    "})()";
            view.loadUrl(js);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (!inChat ||
                Uri.parse(url).getHost().equals("chat.stackexchange.com") ||
                Uri.parse(url).getHost().equals("chat.stackoverflow.com")) {
                return false;
            }else{
                Log.i(TAG,"Allowed URL: " + url);
            }
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
            return true;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_web);
        mWebView = (WebView) findViewById(R.id.webview);
        mWebView.setWebViewClient(new ChatWebViewClient());
        mWebView.addJavascriptInterface(new ChatseyAppInterface(), "Android");
        mWebView.setWebChromeClient(new ChatWebChromeClient());
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            mWebView.setWebContentsDebuggingEnabled(true);
        }
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        if(device() == DEVICE_TABLET)
            webSettings.setUserAgentString(USER_AGENT_STRING);
        mWebView.loadUrl("http://chat.stackexchange.com/");
    }

    @Override
    public void onResume() {
        super.onResume();
        mWebView.reload();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

}
