# MenuSafe Mobile App Build Guide

This guide explains how to build and submit MenuSafe to the Apple App Store and Google Play Store.

## Prerequisites

### Development Environment
- **macOS** (required for iOS builds)
- **Node.js 18+**
- **pnpm** package manager
- **Xcode 15+** (for iOS)
- **Android Studio** (for Android)

### Accounts Required
- **Apple Developer Account** ($99/year) - https://developer.apple.com
- **Google Play Developer Account** ($25 one-time) - https://play.google.com/console

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Install Capacitor CLI Globally (Optional)

```bash
npm install -g @capacitor/cli
```

### 3. Initialize Native Projects

```bash
# Add iOS platform
pnpm cap:add:ios

# Add Android platform
pnpm cap:add:android
```

## Building for iOS (App Store)

### 1. Build the Web App

```bash
pnpm build:static
```

### 2. Sync with iOS Project

```bash
pnpm cap:sync
```

### 3. Open in Xcode

```bash
pnpm cap:open:ios
```

### 4. Configure in Xcode

1. Select the **MenuSafe** target
2. Go to **Signing & Capabilities**
3. Select your Team (Apple Developer account)
4. Update Bundle Identifier to `app.menusafe.ios`
5. Set Version to `1.0.0` and Build to `1`

### 5. Add App Icons

1. Open `ios/App/App/Assets.xcassets/AppIcon.appiconset`
2. Replace icons with properly sized versions from `/public/icons/icon-1024.jpg`
3. Use a tool like [App Icon Generator](https://appicon.co/) to create all sizes

### 6. Configure Camera Permissions

In `ios/App/App/Info.plist`, ensure these keys exist:

```xml
<key>NSCameraUsageDescription</key>
<string>MenuSafe needs camera access to scan restaurant menus and identify safe dishes for your dietary needs.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>MenuSafe needs photo library access to let you select menu images from your photos.</string>
```

### 7. Archive and Upload

1. Select **Product > Archive**
2. Once archived, click **Distribute App**
3. Choose **App Store Connect**
4. Follow the prompts to upload

### 8. App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Create a new app with Bundle ID `app.menusafe.ios`
3. Fill in metadata from `app-store-metadata.json`
4. Upload screenshots (required sizes in metadata file)
5. Submit for review

## Building for Android (Google Play)

### 1. Build the Web App

```bash
pnpm build:static
```

### 2. Sync with Android Project

```bash
pnpm cap:sync
```

### 3. Open in Android Studio

```bash
pnpm cap:open:android
```

### 4. Configure App

1. Open `android/app/build.gradle`
2. Update `applicationId` to `app.menusafe.android`
3. Set `versionCode` to `1`
4. Set `versionName` to `"1.0.0"`

### 5. Add App Icons

1. Right-click `res` folder > **New > Image Asset**
2. Select your icon from `/public/icons/icon-1024.jpg`
3. Configure adaptive icon with background color `#FAF6F1`

### 6. Create Signed APK/Bundle

1. Go to **Build > Generate Signed Bundle/APK**
2. Choose **Android App Bundle** (recommended for Play Store)
3. Create a new keystore or use existing
4. Build the release bundle

**IMPORTANT:** Keep your keystore file safe! You need it for all future updates.

### 7. Google Play Console

1. Go to https://play.google.com/console
2. Create a new app
3. Fill in store listing from `app-store-metadata.json`
4. Upload screenshots
5. Upload the `.aab` file to Production track
6. Complete content rating questionnaire
7. Set up pricing (Free with in-app purchases)
8. Submit for review

## App Store Assets Checklist

### iOS Screenshots Required
- [ ] 6.5" Display (iPhone 14 Pro Max): 1284 x 2778px
- [ ] 5.5" Display (iPhone 8 Plus): 1242 x 2208px
- [ ] 12.9" Display (iPad Pro): 2048 x 2732px

### Android Screenshots Required
- [ ] Phone: 1080 x 1920px (minimum)
- [ ] 7" Tablet: 1200 x 1920px
- [ ] 10" Tablet: 1920 x 1200px

### Other Assets
- [ ] App Icon (1024x1024 for iOS, 512x512 for Android)
- [ ] Feature Graphic (1024x500 for Android)
- [ ] Privacy Policy URL: https://menusafe.app/privacy
- [ ] Terms of Service URL: https://menusafe.app/terms

## Payment Setup

MenuSafe uses a multi-platform payment approach:
- **Web/PWA**: Lemon Squeezy (merchant of record - handles VAT, taxes, compliance)
- **iOS**: Apple In-App Purchase
- **Android**: Google Play Billing

### Lemon Squeezy Setup (Web Payments)

Lemon Squeezy acts as the merchant of record, so you don't need a business entity.
They handle VAT, taxes, invoicing, and compliance. You receive payouts as an individual.

1. **Create Account**
   - Go to https://www.lemonsqueezy.com
   - Sign up as an individual (no business required)
   - Complete identity verification

2. **Create Subscription Product**
   - Go to Products > Create Product
   - Name: "MenuSafe Pro"
   - Price: €2.90/month (recurring)
   - Copy the Checkout URL

3. **Set Up Webhook**
   - Go to Settings > Webhooks
   - Add webhook URL: `https://your-domain.com/api/webhooks/lemonsqueezy`
   - Select events: `subscription_created`, `subscription_payment_success`, `subscription_cancelled`, `subscription_expired`
   - Copy the signing secret

4. **Environment Variables**
```
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout/buy/xxx
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret
```

### Apple In-App Purchase Setup (iOS)

1. **App Store Connect**
   - Go to your app > In-App Purchases
   - Create Auto-Renewable Subscription
   - Product ID: `menusafe_pro_monthly`
   - Price: €2.99 (closest tier to €2.90)
   - Subscription Group: "MenuSafe Pro"

2. **Add Capacitor Plugin**
   - The app is pre-configured with `@capacitor/in-app-purchases` support
   - Test with StoreKit sandbox before release

### Google Play Billing Setup (Android)

1. **Google Play Console**
   - Go to your app > Monetization > Subscriptions
   - Create subscription
   - Product ID: `menusafe_pro_monthly`
   - Price: €2.90/month
   - Billing period: Monthly

2. **Link Service Account** (for webhook verification)
   - Create service account in Google Cloud Console
   - Grant permissions in Play Console
   - Download JSON key

## Environment Variables

For production builds, ensure these are set:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for webhooks)

# Lemon Squeezy (Web payments)
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=your_checkout_url
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

## Common Issues

### iOS Build Fails
- Ensure you have a valid Apple Developer certificate
- Check that Bundle ID matches your App Store Connect app

### Android Build Fails
- Run `./gradlew clean` in the android folder
- Ensure Android SDK 33+ is installed

### Camera Not Working
- Verify permissions are correctly set in Info.plist (iOS) and AndroidManifest.xml
- Test on real device, not simulator

## Review Timeline

- **Apple App Store**: 24-48 hours typically (can be up to 7 days for first submission)
- **Google Play Store**: Usually within 24 hours

## Post-Launch

After approval:
1. Update `manifest.json` with actual App Store and Play Store URLs
2. Enable app store links in your web app
3. Set up crash reporting (consider Sentry or Firebase Crashlytics)
4. Monitor reviews and respond to user feedback

## Support

For questions about the build process, contact: dev@menusafe.app
