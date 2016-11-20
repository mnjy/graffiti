package com.mobsec.a3dtest;

import android.app.ActionBar;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.hardware.Camera;
import android.os.StrictMode;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.rajawali3d.surface.IRajawaliSurface;
import org.rajawali3d.surface.RajawaliSurfaceView;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

import static android.view.View.GONE;

public class MainActivity extends AppCompatActivity implements SurfaceHolder.Callback {
    private SurfaceView mView;
    private SurfaceHolder mHolder;
    private Camera mCamera;
    Renderer renderer;
    RajawaliSurfaceView surface;
    WebView mWebView;
    private String webViewUrl = "http://aadah.me";
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        surface = new RajawaliSurfaceView(this);
        surface.getHolder().setFormat(PixelFormat.TRANSPARENT);
        surface.setZOrderOnTop(true);
        surface.setFrameRate(60.0);
        surface.setRenderMode(IRajawaliSurface.RENDERMODE_WHEN_DIRTY);
        surface.setTransparent(true);
        mCamera = getCameraInstance();
        mView = (SurfaceView) findViewById(R.id.surfaceView);
        mHolder = mView.getHolder();
        mHolder.addCallback(this);
        mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
        mWebView = (WebView) findViewById(R.id.webView);

        surface.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mView.setVisibility(GONE);
                surface.setVisibility(GONE);
                mWebView.setVisibility(View.VISIBLE);
                startDrawing();
            }
        });

        // Add mSurface to your root view
        addContentView(surface, new ActionBar.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT));

        try {
            renderer = new Renderer(this);
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        surface.setSurfaceRenderer(renderer);
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

    private String qr;
    private int width;
    private int height;

    public void setQRAndDimensions(String _qr, int _width, int _height){
        qr = _qr;
        width = _width;
        height = _height;
    }

    public void startDrawing(){
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
        mWebView.setVisibility(GONE);
        mView.setVisibility(View.VISIBLE);
        surface.setVisibility(View.VISIBLE);
        //TODO refresh image on surface
    }
}
