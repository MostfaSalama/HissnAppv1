const fs = require('fs');
const path = require('path');

// يطبّق إصلاحات الأندرويد على منصة جديدة (بعد cap add):
// 1) قفل WebView لمنع التمرير المرن خارج حدود الشاشة
// 2) التأكد من عدم وجود أيقونات ديناميكية (aliases) في المانيفست

const root = path.join(__dirname, '..');

const MAIN_ACTIVITY = `package com.hissn.azkar;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        lockWebView();
    }

    private void lockWebView() {
        try {
            WebView wv = bridge != null ? bridge.getWebView() : null;
            if (wv != null) {
                wv.setOverScrollMode(View.OVER_SCROLL_NEVER);
                wv.setVerticalScrollBarEnabled(false);
                wv.setHorizontalScrollBarEnabled(false);
            }
        } catch (Exception e) {
            // ignore
        }
    }
}
`;

const mainActivityPath = path.join(root, 'android', 'app', 'src', 'main', 'java', 'com', 'hissn', 'azkar', 'MainActivity.java');
if (fs.existsSync(mainActivityPath)) {
  fs.writeFileSync(mainActivityPath, MAIN_ACTIVITY.replace(/\n/g, '\r\n'), 'utf8');
  console.log('MainActivity patched (lockWebView)');
} else {
  console.error('MainActivity.java not found — run npx cap add android first');
  process.exit(1);
}

// إزالة أي activity-alias إن وُجدت (نظام الأيقونة الموحدة)
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let m = fs.readFileSync(manifestPath, 'utf8');
  const before = m;
  m = m.replace(/<!--.*?-->/gs, '');
  m = m.replace(/<activity-alias[\s\S]*?<\/activity-alias>/g, '');
  if (m !== before) {
    fs.writeFileSync(manifestPath, m, 'utf8');
    console.log('AndroidManifest cleaned (aliases removed)');
  } else {
    console.log('AndroidManifest already clean');
  }
}

// إصلاح styles.xml — إزالة أيقونة الـ splash واستبدالها بالـ drawable
const stylesPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml');
if (fs.existsSync(stylesPath)) {
  let s = fs.readFileSync(stylesPath, 'utf8');
  const before = s;
  // أزل أيقونة splash إن وُجدت (على أندرويد 12+ تُظهر خلفية موحدة فقط،
  // ثم يتولّى الويب عرض شاشة البداية الكاملة عبر splash-web.png)
  s = s.replace(/<item name="windowSplashScreenAnimatedIcon">[^<]*<\/item>/g,
    '<item name="windowSplashScreenAnimatedIcon">@null</item>');
  s = s.replace(/<item name="android:windowSplashScreenAnimatedIcon">[^<]*<\/item>/g,
    '<item name="android:windowSplashScreenAnimatedIcon">@null</item>');
  // اجعل الخلفية تستخدم drawable/splash بدل اللون الأسود (للأجهزة الأقدم من أندرويد 12)
  s = s.replace(/<item name="android:background">#[0-9a-fA-F]+<\/item>/g,
    '<item name="android:background">@drawable/splash</item>');
  // لون خلفية شاشة البداية الموحّدة على أندرويد 12+ — يطابق خلفية splash-web لانتقال سلس
  const SPLASH_BG = 'windowSplashScreenBackground';
  const launchStyle = /<style name="AppTheme\.NoActionBarLaunch"[^>]*>[\s\S]*?<\/style>/;
  const launchMatch = s.match(launchStyle);
  if (launchMatch) {
    let block = launchMatch[0];
    if (!block.includes(SPLASH_BG)) {
      block = block.replace('</style>', `  <item name="${SPLASH_BG}">#141A33</item>\n    </style>`);
    } else {
      block = block.replace(new RegExp('(<item name="' + SPLASH_BG + '">)[^<]*(</item>)', 'g'), '$1#141A33$2');
    }
    s = s.replace(launchMatch[0], block);
  }
  if (s !== before) {
    fs.writeFileSync(stylesPath, s, 'utf8');
    console.log('styles.xml patched (splash icon removed, drawable set)');
  } else {
    console.log('styles.xml already clean');
  }
}
