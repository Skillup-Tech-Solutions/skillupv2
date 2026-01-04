package com.skillup.app;

import android.app.Application;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;

/**
 * Custom Application class for startup performance tracing.
 * 
 * To view traces, run: adb logcat -s SkillUp:* StartupTracing:*
 * 
 * Key metrics to watch:
 * - Application.onCreate: Should be < 100ms
 * - Activity.onCreate: Should be < 500ms  
 * - First frame rendered: Should be < 1000ms from tap
 */
public class SkillUpApplication extends Application {
    
    private static final String TAG = "StartupTracing";
    
    // Store process start time for total cold start measurement
    private static long processStartTime = 0;
    private static long applicationCreateTime = 0;
    private static long applicationOnCreateEndTime = 0;
    
    // Static block runs when class is loaded (very early in process)
    static {
        processStartTime = SystemClock.elapsedRealtime();
        Log.i(TAG, "=== COLD START BEGIN ===");
        Log.i(TAG, "[Process] Class loading started at: " + processStartTime + "ms (system uptime)");
    }
    
    @Override
    public void onCreate() {
        applicationCreateTime = SystemClock.elapsedRealtime();
        long classLoadDuration = applicationCreateTime - processStartTime;
        Log.i(TAG, "[Application] onCreate started - Class load took: " + classLoadDuration + "ms");
        
        super.onCreate();
        
        applicationOnCreateEndTime = SystemClock.elapsedRealtime();
        long onCreateDuration = applicationOnCreateEndTime - applicationCreateTime;
        Log.i(TAG, "[Application] onCreate completed in: " + onCreateDuration + "ms");
        
        // Log device info for context
        Log.i(TAG, "[Device] SDK: " + Build.VERSION.SDK_INT + 
              ", Device: " + Build.MANUFACTURER + " " + Build.MODEL);
    }
    
    /**
     * Called from MainActivity to log activity timing
     */
    public static long getProcessStartTime() {
        return processStartTime;
    }
    
    public static long getApplicationCreateTime() {
        return applicationCreateTime;
    }
    
    public static long getApplicationOnCreateEndTime() {
        return applicationOnCreateEndTime;
    }
    
    /**
     * Call this when you want to measure time since app process started
     */
    public static long getTimeSinceProcessStart() {
        return SystemClock.elapsedRealtime() - processStartTime;
    }
    
    /**
     * Log a startup milestone with timing
     */
    public static void logMilestone(String milestone) {
        long elapsed = getTimeSinceProcessStart();
        Log.i(TAG, "[Milestone] " + milestone + " at +" + elapsed + "ms");
    }
}
