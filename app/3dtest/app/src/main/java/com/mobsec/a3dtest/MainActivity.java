package com.mobsec.a3dtest;

import android.app.ActionBar;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.graphics.PointF;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.dlazaro66.qrcodereaderview.QRCodeReaderView;

import org.rajawali3d.surface.IRajawaliSurface;
import org.rajawali3d.surface.RajawaliSurfaceView;

import java.util.concurrent.ExecutionException;

import static android.view.View.GONE;
import static android.view.View.VISIBLE;

public class MainActivity extends AppCompatActivity implements QRCodeReaderView.OnQRCodeReadListener {
    Renderer renderer;
    private WebView mWebView;
    private String webViewUrl = "http://18.189.15.154:3000";
    private QRCodeReaderView mView;

    private enum VIEW_STATE {
        QR_SCANNER,
        AR_OBJECT_RENDER,
        WEB_VIEW;
    }

    private VIEW_STATE currentViewState;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //MAIN VIEW
        mView = (QRCodeReaderView) findViewById(R.id.qrCodeReaderView);
        mView.setOnQRCodeReadListener(this);
        mView.setQRDecodingEnabled(true);
        mView.setBackCamera();

        //WEB VIEW
        mWebView = (WebView) findViewById(R.id.webView);


        //CURRENT VIEW
        switchToView(VIEW_STATE.QR_SCANNER);
    }

    @Override
    protected void onResume() {
        super.onResume();
        mView.startCamera();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mView.stopCamera();
    }

    //defaults
    private String qr;
    private int width = 256;
    private int height = 256;

    // Called when a QR is decoded
    // "text" : the text encoded in QR
    // "points" : points where QR control points are placed in View
    @Override
    public void onQRCodeRead(String text, PointF[] points) {
        qr = text;
        switchToView(VIEW_STATE.AR_OBJECT_RENDER);
    }

    RajawaliSurfaceView surface;

    public void createARObject(){

        //download  image every time, in case it needs to be refreshed
        String url = DownloadImage.qrToUrl(qr); //(if null, opens the image "null.png"). this is useful for testing
        Bitmap bmp = DownloadImage.get(url);
        if (bmp != null) {
            width = bmp.getWidth();
            height = bmp.getHeight();
        } else {
            Toast.makeText(this, "A blank canvas!", Toast.LENGTH_SHORT).show();
        }

        //Render the object
        surface = new RajawaliSurfaceView(this);
        try {
            renderer = new Renderer(this, bmp);
            surface.setSurfaceRenderer(renderer);
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        surface.getHolder().setFormat(PixelFormat.TRANSPARENT);
        surface.setZOrderOnTop(true);
        surface.setTransparent(true);
        surface.setFrameRate(60.0);
        surface.setRenderMode(IRajawaliSurface.RENDERMODE_WHEN_DIRTY);
        surface.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startDrawing();
                destroyARObject();
            }
        });

        addContentView(surface, new ActionBar.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT));
    }

    public void destroyARObject(){
        if (surface != null) {
            ((ViewGroup) surface.getParent()).removeView(surface);
            surface = null;
        }

    }

    public void startDrawing(){
        switchToView(VIEW_STATE.WEB_VIEW);
        mWebView.getSettings().setJavaScriptEnabled(true);
        mWebView.getSettings().setDomStorageEnabled(true);
        mWebView.getSettings().setLoadWithOverviewMode(true);
        mWebView.getSettings().setUseWideViewPort(true);
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return false;
            }
        });
        mWebView.loadUrl(webViewUrl+"/draw/"+qr+"/"+width+"/"+height);
    }

    public void stopDrawing(){
        switchToView(VIEW_STATE.AR_OBJECT_RENDER);
    }

    @Override
    public void onBackPressed(){
        if (currentViewState == VIEW_STATE.WEB_VIEW){
            stopDrawing();
        } else if (currentViewState == VIEW_STATE.AR_OBJECT_RENDER) {
            destroyARObject();
            switchToView(VIEW_STATE.QR_SCANNER);
        } else {
            super.onBackPressed();
        }
    }

    private void switchToView(VIEW_STATE view){
        switch (view){
            case QR_SCANNER:
                mView.setVisibility(VISIBLE);
                mView.setQRDecodingEnabled(true);
                mWebView.setVisibility(GONE);
                currentViewState = VIEW_STATE.QR_SCANNER;
                break;
            case AR_OBJECT_RENDER:
                mView.setVisibility(VISIBLE);
                mView.setQRDecodingEnabled(false);
                mWebView.setVisibility(GONE);
                createARObject();
                currentViewState = VIEW_STATE.AR_OBJECT_RENDER;
                break;
            case WEB_VIEW:
                mView.setVisibility(GONE);
                mWebView.setVisibility(VISIBLE);
                destroyARObject();
                currentViewState = VIEW_STATE.WEB_VIEW;
        }
    }

}
