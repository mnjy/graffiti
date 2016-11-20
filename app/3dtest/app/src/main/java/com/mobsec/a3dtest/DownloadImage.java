package com.mobsec.a3dtest;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.StrictMode;
import android.util.Log;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;

/**
 * Usage: Bitmap img = DownloadImage.get(url);
 */

public class DownloadImage {

    private static String MAIN_URL = "18.189.15.154:3000/image/";
    private static String IMG_FORMAT = ".png";

    public static Bitmap get(String url) {
        StrictMode.setThreadPolicy(StrictMode.ThreadPolicy.LAX);

        Bitmap img = null;
        try {
            InputStream in = new java.net.URL(url).openStream();
            img = BitmapFactory.decodeStream(in);
            in.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return img;
    }

    public static String qrToUrl(String qr) {
        String url = MAIN_URL + qr + IMG_FORMAT;
        return url;
    }
}