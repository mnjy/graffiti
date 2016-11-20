package com.mobsec.a3dtest;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.StrictMode;
import android.util.Log;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;

/**
 * Usage: Bitmap img = DownloadImage.get(url);
 */

public class DownloadImage {

    private static String MAIN_URL = "http://18.189.15.154:3000/images/";
    private static String IMG_FORMAT = ".png";

    public static Bitmap get(String url) {
        StrictMode.setThreadPolicy(StrictMode.ThreadPolicy.LAX);

        Bitmap img = null;
        try {
            InputStream in = new java.net.URL(url).openStream();
            img = BitmapFactory.decodeStream(in);
            in.close();
        } catch (FileNotFoundException e) {
            Log.d("DownloadImage", "Image not yet in database, will create it.");
        } catch (IOException e) {
            e.printStackTrace();
        }

        return img;
    }

    public static String qrToUrl(String qr) {
        String url = MAIN_URL + qr + IMG_FORMAT;
        return url;
    }
}