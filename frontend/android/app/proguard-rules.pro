# ProGuard Rules for SkillUp Production Build
# ============================================

# ============================================
# GENERAL ANDROID RULES
# ============================================

# Keep line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable

# Hide original source file names in stack traces
-renamesourcefileattribute SourceFile

# Keep annotations
-keepattributes *Annotation*

# Keep generic signatures (needed for type resolution)
-keepattributes Signature

# Keep exception information
-keepattributes Exceptions

# ============================================
# WEBVIEW & JAVASCRIPT INTERFACE
# ============================================

# Keep JavaScript interface methods (critical for Capacitor)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Don't warn about WebView
-dontwarn android.webkit.**

# ============================================
# CAPACITOR FRAMEWORK
# ============================================

# Keep all Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-dontwarn com.getcapacitor.**

# Keep Capacitor plugins
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    public *;
}

# Keep plugin method annotations
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
}

# Keep bridge classes
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.Plugin { *; }
-keep class com.getcapacitor.PluginCall { *; }
-keep class com.getcapacitor.JSObject { *; }
-keep class com.getcapacitor.JSArray { *; }

# ============================================
# FIREBASE / FCM
# ============================================

# Firebase Messaging
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep FirebaseMessagingService implementations
-keep class * extends com.google.firebase.messaging.FirebaseMessagingService {
    public *;
}

# Firebase Analytics
-keep class com.google.firebase.analytics.** { *; }

# Firebase Crashlytics
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# ============================================
# GSON (JSON Parsing)
# ============================================

# Keep Gson serialized classes
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# ============================================
# OKHTTP & RETROFIT (if used)
# ============================================

-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# ============================================
# CORDOVA PLUGINS (Capacitor compatibility)
# ============================================

-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# ============================================
# ANDROID COMPONENTS
# ============================================

# Keep Activities, Services, Receivers, and Providers
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# Keep custom Application class
-keep class com.skillup.app.** { *; }

# Keep View constructors
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# ============================================
# KOTLIN (if any native Kotlin code)
# ============================================

-dontwarn kotlin.**
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# ============================================
# SERIALIZATION
# ============================================

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Parcelable
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# ============================================
# ENUMS
# ============================================

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ============================================
# NATIVE METHODS
# ============================================

-keepclasseswithmembernames class * {
    native <methods>;
}

# ============================================
# R8 FULL MODE COMPATIBILITY
# ============================================

# Keep class members accessed via reflection
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Prevent removal of methods called from JS
-keepclassmembers class * {
    @org.xwalk.core.JavascriptInterface <methods>;
}

# ============================================
# SUPPRESS WARNINGS
# ============================================

-dontwarn java.lang.invoke.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
