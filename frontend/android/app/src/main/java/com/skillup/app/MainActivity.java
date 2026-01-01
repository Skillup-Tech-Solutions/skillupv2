package com.skillup.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        
        // Create notification channels for Android 8+ ()
        createNotificationChannels();
    }
    
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager == null) return;
            
            // 1. ALERTS Channel - HIGH Priority (like Swiggy order updates)
            // For: Class reminders, payment alerts, deadlines, live sessions
            NotificationChannel alertsChannel = new NotificationChannel(
                getString(R.string.default_notification_channel_id),
                getString(R.string.default_notification_channel_name),
                NotificationManager.IMPORTANCE_HIGH
            );
            alertsChannel.setDescription(getString(R.string.default_notification_channel_description));
            alertsChannel.enableVibration(true);
            alertsChannel.setVibrationPattern(new long[]{0, 250, 250, 250}); //  vibration
            alertsChannel.setShowBadge(true);
            alertsChannel.enableLights(true);
            alertsChannel.setLightColor(0xFF3b82f6); // Blue
            notificationManager.createNotificationChannel(alertsChannel);
            
            // 2. UPDATES Channel - DEFAULT Priority 
            // For: Course announcements, assignment submissions, grades
            NotificationChannel updatesChannel = new NotificationChannel(
                getString(R.string.updates_channel_id),
                getString(R.string.updates_channel_name),
                NotificationManager.IMPORTANCE_DEFAULT
            );
            updatesChannel.setDescription(getString(R.string.updates_channel_description));
            updatesChannel.enableVibration(true);
            updatesChannel.setShowBadge(true);
            notificationManager.createNotificationChannel(updatesChannel);
            
            // 3. PROMOTIONS Channel - LOW Priority (like Swiggy offers)
            // For: New courses, special offers, marketing
            NotificationChannel promotionsChannel = new NotificationChannel(
                getString(R.string.promotions_channel_id),
                getString(R.string.promotions_channel_name),
                NotificationManager.IMPORTANCE_LOW
            );
            promotionsChannel.setDescription(getString(R.string.promotions_channel_description));
            promotionsChannel.setShowBadge(false); // Don't show badge for promos
            notificationManager.createNotificationChannel(promotionsChannel);
        }
    }
}
