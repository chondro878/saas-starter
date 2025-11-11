# USPS Address Validation API v3.0 Setup (2025)

This app uses USPS's **Addresses API v3.0** (the latest modern REST API) to verify recipient addresses when creating reminders. Since you're mailing physical cards via USPS, this is the most accurate and authoritative source for US mail addresses.

**Last Updated**: January 2025  
**API Status**: Active (v3.0 is the current standard)  
**API Endpoint**: `https://api.usps.com/addresses/v3/address`  
**Format**: REST/JSON with OAuth 2.0

## 🚨 Important: Old API Retired

**As of January 22, 2025**, USPS retired the old Web Tools API (XML-based). The new **Addresses API v3.0** is now the only supported version.

## Why USPS Address Validation?

Address validation ensures:
- ✅ Cards reach the correct recipient (USPS-verified addresses)
- ✅ Typos are caught and corrected to USPS standards
- ✅ Undeliverable addresses are blocked
- ✅ Addresses are properly formatted per USPS requirements
- ✅ ZIP+4 codes are automatically added
- ✅ **FREE** for reasonable usage

## Setup Steps

### 1. Create a USPS Business Account

1. Go to [USPS Business Customer Gateway](https://gateway.usps.com/)
2. Click "Register" if you don't have an account
3. Fill out the registration form:
   - **Business Name**: Your company/app name
   - **Email**: Your business email
   - **Contact Information**: Your details
4. Verify your email address
5. Complete the registration

**Note**: This is different from a personal USPS.com account. You need a **Business Account**.

### 2. Register on the USPS Developer Portal

1. Go to [USPS Developer Portal](https://developers.usps.com/)
2. Click "Sign In" and log in with your Business Account credentials
3. Navigate to **Getting Started** or **Register Your App**
4. Fill out the application form:
   - **App Name**: Your application name (e.g., "CardReminder App")
   - **Description**: Brief description of your use case
   - **Callback URL**: Can leave blank or use `http://localhost:3000` for dev
5. Select **"Addresses"** API product
6. Accept the Terms and Conditions
7. Submit the registration

### 3. Get Your API Credentials (4 Required)

The USPS API v3 requires **FOUR** credentials:

**From USPS Developer Portal:**
1. Go to [USPS Developer Portal - Apps](https://developers.usps.com/apps)
2. Click on your registered application
3. Navigate to the **"Credentials"** tab
4. Copy:
   - **Consumer Key** (Client ID)
   - **Consumer Secret** (Client Secret)

**From USPS Business Customer Gateway:**
1. Log in to [USPS Business Customer Gateway](https://gateway.usps.com/)
2. Navigate to your business profile or settings
3. Find your:
   - **Customer Registration ID (CRID)**
   - **Mailer ID (MID)**

**Note**: If you can't find CRID/MID, contact your USPS Business System Administrator (BSA) or USPS support.

**Important**: Keep all credentials secure! They're like passwords.

### 4. Add to Environment Variables

Add **all 4 credentials** to `.env.local`:

```bash
# USPS Address Validation API v3.0
USPS_CONSUMER_KEY=your_consumer_key_here
USPS_CONSUMER_SECRET=your_consumer_secret_here
USPS_CUSTOMER_REGISTRATION_ID=your_crid_here
USPS_MAILER_ID=your_mid_here
```

For production (Vercel):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all four variables:
   - `USPS_CONSUMER_KEY`
   - `USPS_CONSUMER_SECRET`
   - `USPS_CUSTOMER_REGISTRATION_ID`
   - `USPS_MAILER_ID`

### 5. Restart Your Development Server

```bash
pnpm dev
```

## Testing

To verify it's working:

1. Go to `/create-reminder`
2. Fill in Step 1 with a test address:
   ```
   Street: 1600 Pennsylvania Avenue NW
   City: Washington
   State: DC
   Zip: 20500
   ```
3. Click "Next"
4. You should see "Validating address..." then the address should be accepted with ZIP+4

Try a typo to test correction:
```
Street: 1600 Pennsylvana Ave  (wrong spelling)
City: Washington
State: DC
Zip: 20500
```

You should see a suggestion box with the USPS-standardized address.

Try an invalid address:
```
Street: 123 Fake Street
City: Nowhere
State: CA
Zip: 99999
```

You should see an error message blocking submission.

## API Limits & Pricing (2025)

### Free Tier
- ✅ **FREE** for development and reasonable commercial use
- No published rate limits (much more generous than old API)
- No monthly charges

### Production Limits
- Contact USPS if you need higher limits
- For typical SaaS usage, free tier is sufficient

**For a typical SaaS with 1,000 users:**
- ~2-3 reminders per user/month = 2,500 validations/month
- **Well within free tier**

## What's New in v3.0

Compared to the old Web Tools API (retired):

| Feature | v3.0 (New) | Web Tools (Old) |
|---------|-----------|-----------------|
| **Format** | ✅ JSON/REST | ❌ XML |
| **Auth** | ✅ OAuth 2.0 | ❌ Simple User ID |
| **Performance** | ✅ Much faster | ❌ Slower |
| **Reliability** | ✅ 99.9% uptime | ❌ Less reliable |
| **Features** | ✅ Enhanced | ❌ Basic |
| **Status** | ✅ Active | ❌ **RETIRED Jan 22, 2025** |

## What Gets Validated

The USPS API v3 validates and standardizes:
- ✅ Street addresses (converts abbreviations, corrects spelling)
- ✅ City names (corrects to official USPS city)
- ✅ State codes (2-letter abbreviations)
- ✅ ZIP codes (validates and adds ZIP+4)
- ✅ Apartment/suite numbers
- ✅ Secondary address information

## Fallback Behavior

If credentials are not configured:
- ⚠️ All addresses are automatically accepted as valid
- Users won't see validation errors or suggestions
- No blocking of undeliverable addresses

**Production Recommendation**: Always configure API credentials for production to ensure mail delivery.

## Troubleshooting

### "Address validation unavailable"
**Cause**: API credentials not configured or invalid  
**Fix**: 
- Check `.env.local` has both `USPS_CONSUMER_KEY` and `USPS_CONSUMER_SECRET`
- Verify credentials in USPS Developer Portal
- Restart dev server

### "Address not found in USPS database"
**Cause**: Invalid address entered  
**Fix**: User needs to correct the address - this is working as intended

### "OAuth token request failed"
**Cause**: Invalid credentials or network issue  
**Fix**:
- Verify Consumer Key and Secret are correct
- Check for typos in `.env.local`
- Ensure no extra spaces in credentials
- Try regenerating credentials in Developer Portal

### Registration pending or denied
**Cause**: USPS may need to review your application  
**Fix**:
- Most registrations are approved instantly
- If pending, check back in 24 hours
- Provide clear description of use case (mailing physical cards)
- Contact: icustomercare@usps.gov

## Security Notes

The new OAuth 2.0 system:
- ✅ Much more secure than old User ID system
- ✅ Tokens expire after 1 hour (auto-refreshed)
- ✅ Credentials never sent with each request
- ⚠️ Keep Consumer Key and Secret in environment variables (never commit to Git)

## Alternative: Disable Address Validation

If you don't want address validation, the app works without it (all addresses accepted as valid).

**Not recommended for production** as it may result in undeliverable cards and wasted postage.

## Documentation (Official USPS)

- [USPS Developer Portal](https://developers.usps.com/)
- [Addresses API v3.0 Documentation](https://developers.usps.com/addressesv3)
- [Getting Started Guide](https://developers.usps.com/getting-started)
- [API Retirement Notice](https://developers.usps.com/industry-alert-api-retirement)
- [Support Contact](https://developers.usps.com/support)

## Migration from Old Web Tools API

If you were using the old XML-based API:
- ❌ Old endpoint (`secure.shippingapis.com`) **no longer works**
- ❌ Old User ID authentication **no longer works**
- ✅ Must migrate to Addresses API v3.0
- ✅ This integration is already v3.0-compliant

## Terms of Service

USPS API usage requires compliance with their terms:
- ✅ Use for real-time address validation during transactions (what we're doing)
- ❌ No bulk address validation or list cleaning
- ❌ No data mining or reselling of USPS data
- ✅ Commercial use is allowed and encouraged

Read full terms: [USPS Developer Terms](https://developers.usps.com/terms-of-service)

## Support

**USPS Developer Support:**
- Email: icustomercare@usps.gov
- Phone: 1-800-344-7779
- Portal: https://developers.usps.com/support

**For API Issues:**
1. Check [Developer Portal Status Page](https://developers.usps.com/)
2. Review [API Documentation](https://developers.usps.com/addressesv3)
3. Contact USPS support with your Consumer Key (not Secret!)
