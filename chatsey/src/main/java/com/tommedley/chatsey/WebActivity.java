package com.tommedley.chatsey;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class WebActivity extends Activity {

    private static final boolean DEBUG = False;

    private static final String USER_AGENT_STRING = "Chatsey";
    private static final String TAG = "WebActivity";
    private WebView mWebView;

    private static final String URL_ROOT = (DEBUG) ? "http://tommedley.com/files/" : "https://github.com/fredley/chatsey/raw/master/remote/";
    private static final String DEVICE_MOBILE = "mobile";
    private static final String DEVICE_TABLET = "tablet";

    public String device() {
        return (this.getResources().getConfiguration().screenLayout
                & Configuration.SCREENLAYOUT_SIZE_MASK)
                >= Configuration.SCREENLAYOUT_SIZE_LARGE ? DEVICE_TABLET : DEVICE_MOBILE;
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
                    "var script = document.createElement('script');" +
                    "script.type = 'text/javascript';" +
                    "script.src = '" + URL_ROOT + device() + ".js';" +
                    "var link = document.createElement('link');" +
                    "link.rel = 'stylesheet';" +
                    "link.href = '" + URL_ROOT + device() + ".css';";
                    js += "parent.appendChild(link);" +
                    "parent.appendChild(script);" +
                    "})()";
            view.loadUrl(js);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (Uri.parse(url).getHost().equals("chat.stackexchange.com") ||
                    Uri.parse(url).getHost().equals("chat.stackoverflow.com") ||
                    Uri.parse(url).getHost().equals("stackexchange.com") ||
                    Uri.parse(url).getHost().endsWith("google.com") ||
                    Uri.parse(url).getHost().endsWith("google.co.uk")) {
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
