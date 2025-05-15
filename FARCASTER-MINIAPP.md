# Storerunner Farcaster MiniApp Setup

This document provides instructions for deploying Storerunner as a Farcaster MiniApp.

## Prerequisites

1. A Farcaster account
2. A domain where you'll host the app
3. A Next.js deployment (Vercel, Netlify, etc.)

## Deployment Steps

### 1. Generate a proper `farcaster.json` file

The app includes a placeholder `farcaster.json` file at `/public/.well-known/farcaster.json`. 
You need to replace it with a properly signed one.

1. Go to the [Farcaster JSON Tool](https://warpcast.com/~/developers/new) in Warpcast
2. Fill in your app's information:
   - Domain: `storerunner.xyz` (without `https://` or paths)
   - Name: "Storerunner"
   - Description: "Order from your favorite ecommerce platforms directly onchain without having to move any funds."
   - Home URL: "https://storerunner.xyz"
   - Icon URL: "https://storerunner.xyz/icons/storerunner-icon.png"
   - Image URL (optional): URL to an image representing your app
   - Splash Image URL (optional): URL to an image shown during app loading
   - Splash Background Color (optional): A hex color code (e.g., "#f3f4f6")
   - Webhook URL: "https://storerunner.xyz/api/farcaster/webhook"

3. Sign the message with your Farcaster account
4. Copy the generated JSON output
5. Replace the contents of `/public/.well-known/farcaster.json` with the signed JSON

### 2. Create/Update Images

Ensure all the referenced images exist and are properly sized:

1. App Icon: 512x512px PNG with the Storerunner logo
2. Splash Image: 1200x630px PNG or JPG showing the app loading screen
3. Sharing Image: 1200x630px PNG or JPG optimized for sharing in feeds

Place these images in your `/public` directory at the paths referenced in your `farcaster.json` file.

### 3. Configure Environment Variables

Add any required environment variables for API integrations:

```
# Farcaster MiniApp Configuration
NEXT_PUBLIC_APP_URL=https://storerunner.xyz
NEYNAR_API_KEY=your_neynar_api_key # Only needed if using Neynar for verification
```

### 4. Deploy to Production

Deploy your app to your hosting provider:

```bash
# Build and deploy
npm run build
npm run start

# Or using your hosting provider's CLI
vercel --prod
```

### 5. Verify Deployment

1. Check that your `.well-known/farcaster.json` file is accessible at:
   ```
   https://storerunner.xyz/.well-known/farcaster.json
   ```

2. Validate that your API endpoints work:
   ```
   https://storerunner.xyz/api/farcaster/status
   ```

3. Use the [MiniApp Debug Tool](https://warpcast.com/~/developers/mini-apps/debug) to preview your app

### 6. Install and Test as a User

1. Open Warpcast on your mobile device
2. Navigate to your app's URL or search for it in the app store
3. Install the app and test all functionalities:
   - Wallet connection
   - Core app features
   - Notifications (if implemented)
   - Sharing to Farcaster

## Troubleshooting

### Common Issues

1. **JSON format errors**: Ensure your `farcaster.json` file is valid JSON and follows the [Farcaster schema](https://docs.farcaster.xyz/mini-apps/farcaster-json)

2. **Domain mismatch**: The domain in your `farcaster.json` must exactly match where the file is hosted

3. **API errors**: Check server logs for issues with your webhook handlers

4. **Image loading issues**: Verify all image URLs are accessible and correctly sized

### Debugging Tools

- **MiniApp Status API**: Visit `/api/farcaster/status` to check the status of your MiniApp configuration
- **Warpcast Debug Tool**: Use the [MiniApp Debug Tool](https://warpcast.com/~/developers/mini-apps/debug)
- **Browser Network Tab**: Inspect network requests to identify issues

## Additional Resources

- [Farcaster MiniApp Documentation](https://miniapps.farcaster.xyz/)
- [Farcaster Discord](https://discord.gg/farcaster)
- [Neynar Documentation](https://docs.neynar.com/) (if using Neynar for notifications) 