package com.skillup.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import java.util.concurrent.Executors;

/**
 * MainActivity with startup performance optimizations.
 * 
 * Optimizations applied:
 * 1. Notification channels deferred to background thread
 * 2. First frame measurement for performance tracking (debug only)
 * 
 * View traces with: adb logcat -s StartupTracing:*
 */
public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "StartupTracing";
    private long activityCreateStart;
    private boolean isDebug;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        activityCreateStart = SystemClock.elapsedRealtime();
        
        // Check if we're in debug build at runtime (doesn't require generated BuildConfig)
        isDebug = (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE));
        
        long sinceProcessStart = SkillUpApplication.getTimeSinceProcessStart();
        if (isDebug) {
            Log.i(TAG, "[Activity] onCreate started at +" + sinceProcessStart + "ms from process start");
        }
        
        // --- SPLASH SCREEN (must be before super.onCreate) ---
        long splashStart = SystemClock.elapsedRealtime();
        SplashScreen.installSplashScreen(this);
        long splashDuration = SystemClock.elapsedRealtime() - splashStart;
        if (isDebug) {
            Log.i(TAG, "[Activity] SplashScreen.install took: " + splashDuration + "ms");
        }
        
        // --- SUPER.ONCREATE (Capacitor/WebView - this is the bottleneck) ---
        long superStart = SystemClock.elapsedRealtime();
        super.onCreate(savedInstanceState);
        long superDuration = SystemClock.elapsedRealtime() - superStart;
        if (isDebug) {
            Log.i(TAG, "[Activity] super.onCreate (Capacitor init) took: " + superDuration + "ms");
        }
        
        // --- DEFER NOTIFICATION CHANNELS TO BACKGROUND ---
        // This removes ~50-100ms from the critical path
        deferNotificationChannelsToBackground();
        
        // --- MEASURE FIRST FRAME (only in debug) ---
        if (isDebug) {
            measureFirstFrame();
        }
        
        // Total onCreate time (now faster without notification channels)
        if (isDebug) {
            long onCreateTotal = SystemClock.elapsedRealtime() - activityCreateStart;
            Log.i(TAG, "[Activity] onCreate TOTAL: " + onCreateTotal + "ms");
            Log.i(TAG, "[Activity] Time from process start to onCreate end: " + 
                  SkillUpApplication.getTimeSinceProcessStart() + "ms");
        }
    }
    
    @Override
    public void onResume() {
        super.onResume();
        if (isDebug) {
            Log.i(TAG, "[Activity] onResume at +" + SkillUpApplication.getTimeSinceProcessStart() + "ms");
        }
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        // Stop any ongoing foreground service notification (meeting in progress)
        // This ensures the notification is cleared when the app is killed by Android
        try {
            stopService(new Intent(this, io.capawesome.capacitorjs.plugins.foregroundservice.ForegroundService.class));
            if (isDebug) {
                Log.i(TAG, "[Activity] onDestroy - foreground service stopped");
            }
        } catch (Exception e) {
            if (isDebug) {
                Log.w(TAG, "[Activity] onDestroy - failed to stop foreground service: " + e.getMessage());
            }
        }
    }
    
    /**
     * Defer notification channel creation to background thread.
     * Channels only need to exist before sending a notification, not at startup.
     */
    private void deferNotificationChannelsToBackground() {
        final boolean debug = isDebug;
        Executors.newSingleThreadExecutor().execute(() -> {
            long start = SystemClock.elapsedRealtime();
            createNotificationChannels();
            if (debug) {
                long duration = SystemClock.elapsedRealtime() - start;
                Log.i(TAG, "[Background] Notification channels created in: " + duration + "ms");
            }
        });
    }
    
    /**
     * Measure time to first frame rendered (debug builds only)
     */
    private void measureFirstFrame() {
        final View decorView = getWindow().getDecorView();
        decorView.getViewTreeObserver().addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
            @Override
            public boolean onPreDraw() {
                decorView.getViewTreeObserver().removeOnPreDrawListener(this);
                long firstFrameTime = SkillUpApplication.getTimeSinceProcessStart();
                Log.i(TAG, "=== FIRST FRAME at +" + firstFrameTime + "ms ===");
                Log.i(TAG, "[Performance Summary]");
                Log.i(TAG, "  Process start → Application.onCreate: " + 
                      (SkillUpApplication.getApplicationCreateTime() - SkillUpApplication.getProcessStartTime()) + "ms");
                Log.i(TAG, "  Application.onCreate duration: " + 
                      (SkillUpApplication.getApplicationOnCreateEndTime() - SkillUpApplication.getApplicationCreateTime()) + "ms");
                Log.i(TAG, "  Activity.onCreate duration: " + 
                      (SystemClock.elapsedRealtime() - activityCreateStart) + "ms");
                Log.i(TAG, "  TOTAL COLD START: " + firstFrameTime + "ms");
                return true;
            }
        });
    }
    
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager == null) return;
            
            // 1. ALERTS Channel - HIGH Priority
            NotificationChannel alertsChannel = new NotificationChannel(
                getString(R.string.default_notification_channel_id),
                getString(R.string.default_notification_channel_name),
                NotificationManager.IMPORTANCE_HIGH
            );
            alertsChannel.setDescription(getString(R.string.default_notification_channel_description));
            alertsChannel.enableVibration(true);
            alertsChannel.setVibrationPattern(new long[]{0, 250, 250, 250});
            alertsChannel.setShowBadge(true);
            alertsChannel.enableLights(true);
            alertsChannel.setLightColor(0xFF3b82f6);
            notificationManager.createNotificationChannel(alertsChannel);
            
            // 2. UPDATES Channel - DEFAULT Priority
            NotificationChannel updatesChannel = new NotificationChannel(
                getString(R.string.updates_channel_id),
                getString(R.string.updates_channel_name),
                NotificationManager.IMPORTANCE_DEFAULT
            );
            updatesChannel.setDescription(getString(R.string.updates_channel_description));
            updatesChannel.enableVibration(true);
            updatesChannel.setShowBadge(true);
            notificationManager.createNotificationChannel(updatesChannel);
            
            // 3. PROMOTIONS Channel - LOW Priority
            NotificationChannel promotionsChannel = new NotificationChannel(
                getString(R.string.promotions_channel_id),
                getString(R.string.promotions_channel_name),
                NotificationManager.IMPORTANCE_LOW
            );
            promotionsChannel.setDescription(getString(R.string.promotions_channel_description));
            promotionsChannel.setShowBadge(false);
            notificationManager.createNotificationChannel(promotionsChannel);
        }
    }
}
