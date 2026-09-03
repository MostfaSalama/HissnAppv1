const fs = require("fs");
const path = require("path");
const manifestPath = path.join(__dirname, "..", "android", "app", "src", "main", "AndroidManifest.xml");
let m = fs.readFileSync(manifestPath, "utf8");
if (!m.includes("MorningIcon")) {
  const oldAct = `        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>`;
  const newAct = `        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">
        </activity>

        <!-- أيقونة الصباح -->
        <activity-alias
            android:name=".MorningIcon"
            android:targetActivity=".MainActivity"
            android:icon="@mipmap/ic_launcher_morning"
            android:roundIcon="@mipmap/ic_launcher_morning_round"
            android:enabled="false"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity-alias>

        <!-- أيقونة المساء -->
        <activity-alias
            android:name=".EveningIcon"
            android:targetActivity=".MainActivity"
            android:icon="@mipmap/ic_launcher_evening"
            android:roundIcon="@mipmap/ic_launcher_evening_round"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity-alias>`;
  m = m.replace(oldAct, newAct);
  fs.writeFileSync(manifestPath, m, "utf8");
  console.log("manifest patched");
} else {
  console.log("manifest already patched");
}
const mainPath = path.join(__dirname, "..", "android", "app", "src", "main", "java", "com", "hissn", "azkar", "MainActivity.java");
let j = fs.readFileSync(mainPath, "utf8");
if (!j.includes("updateAppIcon")) {
  const newMain = `package com.hissn.azkar;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.util.Calendar;
import java.util.TimeZone;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        updateAppIcon();
    }
    @Override
    public void onResume() {
        super.onResume();
        updateAppIcon();
    }
    private void updateAppIcon() {
        try {
            Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Riyadh"));
            int hour = cal.get(Calendar.HOUR_OF_DAY);
            boolean isMorning = hour >= 5 && hour < 15;
            String morning = getPackageName() + ".MorningIcon";
            String evening = getPackageName() + ".EveningIcon";
            PackageManager pm = getPackageManager();
            if (isMorning) {
                pm.setComponentEnabledSetting(new ComponentName(this, morning), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
                pm.setComponentEnabledSetting(new ComponentName(this, evening), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
            } else {
                pm.setComponentEnabledSetting(new ComponentName(this, evening), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
                pm.setComponentEnabledSetting(new ComponentName(this, morning), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
            }
        } catch (Exception e) {}
    }
}
`;
  fs.writeFileSync(mainPath, newMain, "utf8");
  console.log("MainActivity patched");
} else {
  console.log("MainActivity already patched");
}

// Patch styles.xml to minimize splash (solid bg + tiny icon + fast transition)
const stylesPath = path.join(__dirname, "..", "android", "app", "src", "main", "res", "values", "styles.xml");
if (fs.existsSync(stylesPath)) {
  let s = fs.readFileSync(stylesPath, "utf8");
  if (!s.includes("windowSplashScreenBackground")) {
    const oldTheme = `<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
    </style>`;
    const newTheme = `<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">#141A33</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_stat_hissn</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
        <item name="android:windowBackground">#141A33</item>
    </style>`;
    s = s.replace(oldTheme, newTheme);
    fs.writeFileSync(stylesPath, s, "utf8");
    console.log("styles.xml splash minimized");
  } else {
    console.log("styles.xml already patched");
  }
} else {
  console.log("styles.xml not found");
}
