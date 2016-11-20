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
    String qr;
    private DirectionalLight directionalLight;
    public Cube earthSphere;
    public Material material;

    public Renderer(Context context, Bitmap bmp) throws ExecutionException, InterruptedException {
        super(context);
        this.context = context;
        mybmp = bmp;
        setFrameRate(60);
    }

    public void initScene(){
        directionalLight = new DirectionalLight(1f, .2f, -1.0f);
        directionalLight.setColor(1.0f, 1.0f, 1.0f);
        directionalLight.setPower(2);
        getCurrentScene().addLight(directionalLight);

        material = new Material();
        material.enableLighting(true);
        material.setDiffuseMethod(new DiffuseMethod.Lambert());
        material.setColor(0);

        Texture earthTexture = new Texture("Earth", R.drawable.earthtruecolor_nasa_big);
        earthTexture.setBitmap(mybmp);
        if (mybmp == null){
            Log.d("Renderer", "Bitmap is null, rendering plain black cube");
        }
        try {
            material.addTexture(earthTexture);
        } catch (ATexture.TextureException e) {
            e.printStackTrace();
        }

        earthSphere = new Cube(1);
        earthSphere.setMaterial(material);

        getCurrentScene().addChild(earthSphere);
        getCurrentCamera().setZ(4.2f);
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
