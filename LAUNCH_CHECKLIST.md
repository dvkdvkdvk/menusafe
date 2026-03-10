# MenuSafe Launch Checklist

## Current Status

### Completed
- [x] App functionality (scan, restaurants, settings, history)
- [x] Supabase database integration
- [x] User authentication
- [x] Lemon Squeezy product created (€2.90/month)
- [x] Environment variables configured
- [x] PWA manifest and service worker
- [x] Privacy Policy page
- [x] Terms of Service page
- [x] App icons generated
- [x] Capacitor configuration

---

## STEP 1: Configure Lemon Squeezy Webhook (5 minutes)

This connects your payment system so users automatically get Pro access.

1. Go to: https://app.lemonsqueezy.com/settings/webhooks
2. Click "Add Webhook"
3. Configure:
   - **URL**: `https://menusafe.vercel.app/api/webhooks/lemonsqueezy`
   - **Events**: Select these 4 events:
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
4. Click "Save"
5. **Copy the Signing Secret** - verify it matches your `LEMONSQUEEZY_WEBHOOK_SECRET` env var

---

## STEP 2: Test Payment Flow (5 minutes)

1. Go to your app: https://menusafe.vercel.app/pricing
2. Create a test account (or use existing)
3. Click "Subscribe now" on Pro plan
4. Complete checkout with Lemon Squeezy test card: `4242 4242 4242 4242`
5. Verify you're redirected back and see "Activating Pro features..."
6. Check your profile shows "Pro" subscription

---

## STEP 3: Create Demo Account for App Review (5 minutes)

Apple/Google reviewers need a test account to review your app.

1. Go to: https://menusafe.vercel.app/auth/sign-up
2. Create account:
   - Email: `reviewer@menusafe.app`
   - Password: `ReviewerDemo2026!`
3. Set some dietary restrictions (gluten, dairy)
4. Do a test scan so there's content

---

## STEP 4: Deploy to Custom Domain (Optional, 10 minutes)

For professional app store listings:

1. Buy domain: `menusafe.app` (or similar)
2. In Vercel: Settings > Domains > Add
3. Update all URLs in `app-store-metadata.json`:
   - Privacy Policy: `https://menusafe.app/privacy`
   - Terms: `https://menusafe.app/terms`
   - Support: `https://menusafe.app/contact`

---

## STEP 5: Create App Store Screenshots (30 minutes)

### Tools
- Use your deployed app on mobile
- Screenshot tool: https://screenshots.pro or https://mockuphone.com

### Required Screenshots (5 per device size)

**Screenshot 1: Hero/Scan**
- Show the scan page with camera ready
- Caption: "Scan any menu instantly"

**Screenshot 2: Results**  
- Show scan results with Safe/Caution/Avoid items
- Caption: "See safety ratings for every dish"

**Screenshot 3: Settings**
- Show dietary restrictions selection
- Caption: "Personalize for 25+ restrictions"

**Screenshot 4: Restaurants**
- Show saved restaurants with safety scores
- Caption: "Build your safe restaurant guide"

**Screenshot 5: Dashboard**
- Show scan history
- Caption: "Track all your scans"

### Sizes Needed
- iPhone: 1284 x 2778px (6.5")
- iPhone: 1242 x 2208px (5.5")  
- iPad: 2048 x 2732px
- Android: 1080 x 1920px

---

## STEP 6: Create Developer Accounts (15 minutes each)

### Apple Developer Program
1. Go to: https://developer.apple.com/programs/
2. Enroll as **Individual** ($99/year)
3. Use your personal name and address
4. Wait for approval (usually instant with credit card)

### Google Play Console
1. Go to: https://play.google.com/console
2. Create developer account ($25 one-time)
3. Register as **Individual**
4. Complete identity verification

---

## STEP 7: Build iOS App (Requires Mac)

### Prerequisites
- macOS with Xcode 15+
- Apple Developer account approved

### Steps
```bash
# Clone your repo
git clone https://github.com/your-username/menusafe.git
cd menusafe

# Install dependencies
pnpm install

# Add iOS platform
npx cap add ios

# Build and sync
pnpm build
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### In Xcode
1. Select your Team in Signing & Capabilities
2. Set Bundle ID: `app.menusafe.ios`
3. Add app icons to Assets.xcassets
4. Product > Archive
5. Distribute to App Store Connect

---

## STEP 8: Build Android App

### Prerequisites
- Android Studio installed
- Google Play Console account

### Steps
```bash
# Add Android platform
npx cap add android

# Build and sync
pnpm build
npx cap sync android

# Open in Android Studio
npx cap open android
```

### In Android Studio
1. Update applicationId in build.gradle: `app.menusafe.android`
2. Add app icons via Image Asset wizard
3. Build > Generate Signed Bundle
4. Create keystore (SAVE THIS FILE!)
5. Upload .aab to Play Console

---

## STEP 9: Submit to App Stores

### Apple App Store Connect
1. Go to: https://appstoreconnect.apple.com
2. My Apps > + > New App
3. Fill in:
   - Name: MenuSafe - Allergy Menu Scanner
   - Bundle ID: app.menusafe.ios
   - SKU: menusafe-ios-001
4. Complete all sections:
   - App Information (copy from app-store-metadata.json)
   - Pricing: Free
   - In-App Purchases: Add subscription
   - Screenshots (upload all sizes)
   - Review Notes (include demo account)
5. Submit for Review

### Google Play Console
1. Create new app
2. Fill store listing (copy from app-store-metadata.json)
3. Upload screenshots
4. Complete:
   - Content rating questionnaire
   - Data safety form
   - Target audience
5. Create release in Production track
6. Upload .aab file
7. Submit for review

---

## STEP 10: Set Up In-App Purchases (For Native Apps)

### Apple (App Store Connect)
1. Go to your app > In-App Purchases
2. Create > Auto-Renewable Subscription
3. Reference Name: MenuSafe Pro Monthly
4. Product ID: `menusafe_pro_monthly`
5. Create Subscription Group: "MenuSafe Pro"
6. Add pricing: €2.99/month (closest tier)

### Google (Play Console)
1. Go to Monetization > Subscriptions
2. Create subscription
3. Product ID: `menusafe_pro_monthly`
4. Set price: €2.90/month
5. Billing period: 1 month

---

## Post-Launch

- [ ] Monitor crash reports
- [ ] Respond to reviews within 24 hours
- [ ] Set up analytics (consider Vercel Analytics)
- [ ] Plan first update based on feedback
- [ ] Update app store screenshots if UI changes

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Lemon Squeezy Dashboard | https://app.lemonsqueezy.com |
| Apple Developer | https://developer.apple.com |
| App Store Connect | https://appstoreconnect.apple.com |
| Google Play Console | https://play.google.com/console |
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard |

---

## Support Contacts

- Lemon Squeezy: help@lemonsqueezy.com
- Apple Developer: https://developer.apple.com/contact/
- Google Play: https://support.google.com/googleplay/android-developer/
