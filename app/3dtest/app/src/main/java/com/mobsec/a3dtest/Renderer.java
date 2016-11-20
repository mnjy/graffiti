package com.mobsec.a3dtest;

import android.app.Application;
import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;
import android.view.MotionEvent;
import android.widget.Toast;

import org.rajawali3d.lights.DirectionalLight;
import org.rajawali3d.materials.Material;
import org.rajawali3d.materials.methods.DiffuseMethod;
import org.rajawali3d.materials.textures.ATexture;
import org.rajawali3d.materials.textures.Texture;
import org.rajawali3d.math.vector.Vector3;
import org.rajawali3d.primitives.Cube;
import org.rajawali3d.primitives.Sphere;
import org.rajawali3d.renderer.RajawaliRenderer;

import java.util.concurrent.ExecutionException;

/**
 * Created by maxfa on 11/16/2016.
 */

public class Renderer extends RajawaliRenderer {
    Bitmap mybmp;
    public Context context;
    private DirectionalLight directionalLight;
    //private Sphere earthSphere;
    private Cube earthSphere;
    public Renderer(Context context) throws ExecutionException, InterruptedException {
        super(context);
        this.context = context;
        setFrameRate(60);
    }
    public void initScene(){
        directionalLight = new DirectionalLight(1f, .2f, -1.0f);
        directionalLight.setColor(1.0f, 1.0f, 1.0f);
        directionalLight.setPower(2);
        getCurrentScene().addLight(directionalLight);
        Material material = new Material();
        material.enableLighting(true);
        material.setDiffuseMethod(new DiffuseMethod.Lambert());
        material.setColor(0);

        Texture earthTexture = new Texture("Earth", R.drawable.earthtruecolor_nasa_big);

        String qr = "http://www.clintonmedbery.com/wp-content/uploads/2015/04/earthtruecolor_nasa_big.jpg"; //is url for now

        mybmp = DownloadImage.get(qr);
        earthTexture.setBitmap(mybmp);
        if (mybmp == null){
            Log.v("Hey", "It's null");
        } else {
            Log.v("hey", "it's not null");
            Log.v("hey", Integer.toString(mybmp.getHeight()));
        }
        try {
            material.addTexture(earthTexture);
        } catch (ATexture.TextureException e) {
            e.printStackTrace();
        }
        //earthSphere = new Sphere(1, 24, 24);
        earthSphere = new Cube(1);
        earthSphere.setMaterial(material);
        getCurrentScene().addChild(earthSphere);
        getCurrentCamera().setZ(4.2f);

        ((MainActivity) context).setQRAndDimensions(qr, mybmp.getWidth(), mybmp.getHeight());
    }
    @Override
    public void onRender(final long elapsedTime, final double deltaTime) {
        super.onRender(elapsedTime, deltaTime);
        earthSphere.rotate(Vector3.Axis.Y, 1.0);
    }

    @Override
    public void onTouchEvent(MotionEvent event){
    }

    public void onOffsetsChanged(float x, float y, float z, float w, int i, int j){
    }
}
