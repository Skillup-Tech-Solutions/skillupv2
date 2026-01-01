package com.skillup.app;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.RingtoneManager;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

/**
 * Custom FCM Service to provide JioMart-style "Premium" notifications.
 * Features:
 * 1. App Logo as Large Icon (Thumbnail) even when product image is present.
 * 2. BigPictureStyle support for rich expanded view.
 * 3. Fallback to standard handling if no image is present.
 */
public class MessagingService extends FirebaseMessagingService {
    private static final String TAG = "MessagingService";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains data payload
        Map<String, String> data = remoteMessage.getData();
        String title = null;
        String body = null;
        String imageUrl = null;

        // Extract from Notification block first (standard FCM)
        if (remoteMessage.getNotification() != null) {
            title = remoteMessage.getNotification().getTitle();
            body = remoteMessage.getNotification().getBody();
            if (remoteMessage.getNotification().getImageUrl() != null) {
                imageUrl = remoteMessage.getNotification().getImageUrl().toString();
            }
        }

        // Override or supplement from Data block
        if (data.containsKey("title")) title = data.get("title");
        if (data.containsKey("body")) body = data.get("body");
        if (data.containsKey("image")) imageUrl = data.get("image");
        if (data.containsKey("imageUrl")) imageUrl = data.get("imageUrl");

        if (title != null && body != null) {
            sendNotification(title, body, imageUrl, data);
        }
    }

    private void sendNotification(String title, String body, String imageUrl, Map<String, String> data) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // Pass all data to intent for JS handling
        for (Map.Entry<String, String> entry : data.entrySet()) {
            intent.putExtra(entry.getKey(), entry.getValue());
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_ONE_SHOT);

        String channelId = data.get("channel_id");
        if (channelId == null) {
            channelId = getString(R.string.default_notification_channel_id);
        }

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, channelId)
                        .setSmallIcon(R.drawable.ic_notification)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setAutoCancel(true)
                        .setSound(defaultSoundUri)
                        .setContentIntent(pendingIntent)
                        .setPriority(NotificationCompat.PRIORITY_HIGH);

        // --- PREMIUM UI: Set App Logo as Large Icon (Thumbnail) ---
        // This ensures the SkillUp brand remains visible even with product images
        Bitmap logoBitmap = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);
        if (logoBitmap != null) {
            notificationBuilder.setLargeIcon(getResizedBitmapWithPadding(logoBitmap, 128));
        }

        // --- PREMIUM UI: Handle Big Image (Expanded View) ---
        if (imageUrl != null) {
            Bitmap bigPicture = getBitmapFromUrl(imageUrl);
            if (bigPicture != null) {
                notificationBuilder.setStyle(new NotificationCompat.BigPictureStyle()
                        .bigPicture(bigPicture)
                        .setBigContentTitle(title)
                        .setSummaryText(body)
                        // .bigLargeIcon(null) // Ensures the logo stays or hides in expanded view depending on OS
                );
            }
        }

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        notificationManager.notify((int) System.currentTimeMillis() /* ID of notification */, notificationBuilder.build());
    }

    private Bitmap getBitmapFromUrl(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (Exception e) {
            Log.e(TAG, "Error downloading image: " + e.getMessage());
            return null;
        }
    }

    /**
     * Adds padding to a bitmap to make it look "floating" and premium in notifications.
     */
    private Bitmap getResizedBitmapWithPadding(Bitmap bitmap, int size) {
        Bitmap output = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        android.graphics.Canvas canvas = new android.graphics.Canvas(output);
        
        // Add ~15% padding
        int padding = (int) (size * 0.15);
        int targetSize = size - (padding * 2);
        
        Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, targetSize, targetSize, true);
        canvas.drawBitmap(scaledBitmap, padding, padding, null);
        
        return output;
    }

    @Override
    public void onNewToken(@NonNull String token) {
        Log.d(TAG, "Refreshed token: " + token);
        // Token handling is usually managed by the Plugin, but we log it for debug
    }
}
