package com.mobsec.a3dtest;

import android.app.ActionBar;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.graphics.PointF;
import android.hardware.Camera;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.dlazaro66.qrcodereaderview.QRCodeReaderView;

import org.rajawali3d.surface.IRajawaliSurface;
import org.rajawali3d.surface.RajawaliSurfaceView;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

import static android.view.View.GONE;
import static android.view.View.VISIBLE;

public class MainActivity extends AppCompatActivity implements SurfaceHolder.Callback, QRCodeReaderView.OnQRCodeReadListener {
    private SurfaceView mView;
    private SurfaceHolder mHolder;
    private Camera mCamera;
    Renderer renderer;
    private WebView mWebView;
    private String webViewUrl = "http://aadah.me";
    private QRCodeReaderView mQRView;

    private enum VIEW_STATE {
        QR_SCANNER,
        SURFACE,
        WEB_VIEW;
    }

    private VIEW_STATE currentViewState;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //QR VIEW
        mQRView = (QRCodeReaderView) findViewById(R.id.qrCodeReaderView);
        mQRView.setOnQRCodeReadListener(this);
        mQRView.setQRDecodingEnabled(true);
        mQRView.setBackCamera();

        //SURFACE VIEW - Background
        mCamera = getCameraInstance();
        mView = (SurfaceView) findViewById(R.id.surfaceView);
        mHolder = mView.getHolder();
        mHolder.addCallback(this);
        mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);

        //WEB VIEW
        mWebView = (WebView) findViewById(R.id.webView);


        //CURRENT VIEW
        switchToView(VIEW_STATE.SURFACE);
    }

    @Override
    public void surfaceCreated(SurfaceHolder surfaceHolder) {
        // The Surface has been created, now tell the camera where to draw the preview.
        try {
            mCamera.setPreviewDisplay(surfaceHolder);
            mCamera.startPreview();
        } catch (IOException e) {
            Log.d("CameraView", "Error setting camera preview: " + e.getMessage());
        }
    }

    @Override
    public void surfaceChanged(SurfaceHolder surfaceHolder, int i, int i2, int i3) {

        if (mHolder.getSurface() == null){
            return;
        }

        try {
            mCamera.stopPreview();
        } catch (Exception e){

        }
        try {
            mCamera.setPreviewDisplay(mHolder);
            mCamera.startPreview();

        } catch (Exception e){
            Log.d("CameraView", "Error starting camera preview: " + e.getMessage());
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder surfaceHolder) {

    }

    private boolean checkCameraHardware(Context context) {
        if (context.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA)){
            return true;
        } else {
            return false;
        }
    }

    public static Camera getCameraInstance(){
        Camera c = null;
        try {
            c = Camera.open();
        }
        catch (Exception e){
        }
        return c;
    }

    @Override
    protected void onResume() {
        super.onResume();
        mQRView.startCamera();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mQRView.stopCamera();
    }

    private String qr;
    private int width;
    private int height;

    // Called when a QR is decoded
    // "text" : the text encoded in QR
    // "points" : points where QR control points are placed in View
    @Override
    public void onQRCodeRead(String text, PointF[] points) {
        qr = text;
        switchToView(VIEW_STATE.SURFACE);
    }

    RajawaliSurfaceView surface;

    public void createARObject(){

        //download  image every time, in case it needs to be refreshed
        String url = DownloadImage.qrToUrl(qr);
        url = "http://www.pagetutor.com/image_compression/bee.bmp"; //TODO temp take this out
        Bitmap bmp = DownloadImage.get(url);
        width = bmp.getWidth();
        height = bmp.getHeight();

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
        ((ViewGroup) surface.getParent()).removeView(surface);
    }

    public void startDrawing(){
        switchToView(VIEW_STATE.WEB_VIEW);
        mWebView.getSettings().setJavaScriptEnabled(false);
        mWebView.getSettings().setDomStorageEnabled(true);
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return false;
            }
        });
        mWebView.loadUrl(webViewUrl);
        mWebView.loadUrl("javascript:receiveQrAndDimensions('" + qr + "' , " + width + " , " + height + ")");
    }

    public void stopDrawing(){
        switchToView(VIEW_STATE.SURFACE);
    }

    @Override
    public void onBackPressed(){
        if (currentViewState == VIEW_STATE.WEB_VIEW){
            stopDrawing();
        } else if (currentViewState == VIEW_STATE.SURFACE) {
            destroyARObject();
            switchToView(VIEW_STATE.QR_SCANNER);
        } else {
            super.onBackPressed();
        }
    }

    private void switchToView(VIEW_STATE view){
        switch (view){
            case QR_SCANNER:
                mQRView.setVisibility(VISIBLE);
                mView.setVisibility(GONE);
                mWebView.setVisibility(GONE);
                currentViewState = VIEW_STATE.QR_SCANNER;
                break;
            case SURFACE:
                mQRView.setVisibility(GONE);
                mView.setVisibility(VISIBLE);
                mWebView.setVisibility(GONE);
                createARObject();
                currentViewState = VIEW_STATE.SURFACE;
                break;
            case WEB_VIEW:
                mQRView.setVisibility(GONE);
                mView.setVisibility(GONE);
                mWebView.setVisibility(VISIBLE);
                currentViewState = VIEW_STATE.WEB_VIEW;
        }
    }

}
