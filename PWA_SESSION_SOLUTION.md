# PWA Session Persistence Solution

## Problem Summary
The PWA was requesting login periodically instead of maintaining persistent sessions like a native app.

## Root Causes Identified

1. **Service Worker Cache Interference**: Authentication pages were being cached with `StaleWhileRevalidate` strategy
2. **Cookie Security Settings**: Default Laravel session cookies weren't optimized for PWA cross-origin contexts
3. **Session Lifetime**: Default 7-day session was too short for PWA usage patterns
4. **Persistent Token Logic**: Only triggered with "remember me" checkbox, not automatically for PWA users

## Implemented Solutions

### 1. Service Worker Configuration Updates
**File**: `/vite.config.ts`
- Excluded authentication routes from service worker caching
- Changed page caching strategy from `StaleWhileRevalidate` to `NetworkFirst` for authenticated pages
- Added `/logout` and `/password` routes to navigation fallback deny list

### 2. Session Configuration Enhancement
**File**: `/config/session.php`
- Extended session lifetime to 30 days (43200 minutes)
- Changed `same_site` to `none` for PWA cross-origin compatibility
- Maintained database driver for better persistence

### 3. Enhanced Persistent Authentication Middleware
**File**: `/app/Http/Middleware/PersistentAuth.php`
- Added PWA detection logic
- Auto-creates persistent tokens for PWA users (90-day expiry)
- More aggressive session refresh (7 days before expiry)
- Tracks user agent, IP address, and PWA status for security

### 4. Login Controller Updates
**File**: `/app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- Automatically creates persistent tokens for PWA users
- Added PWA detection in login flow
- Enhanced logout to properly clean up tokens

### 5. Frontend PWA Detection
**File**: `/resources/js/app.tsx`
- Implemented client-side PWA detection
- Adds `X-Requested-With: PWA` header to all requests
- Sets PWA indicator cookie for server-side detection

### 6. Database Schema Updates
**Migration**: `2025_09_14_173057_update_persistent_tokens_for_pwa.php`
- Added tracking fields: `user_agent`, `ip_address`, `is_pwa`
- Added performance indexes for token lookups

## Configuration Requirements

### Environment Variables (.env)
```env
# PWA Session Configuration
SESSION_LIFETIME=43200        # 30 days
SESSION_SAME_SITE=none        # Required for PWA
SESSION_SECURE_COOKIE=true    # Required for production
SESSION_DRIVER=database       # Better persistence than file driver
```

### Apply Database Changes
```bash
php artisan migrate
```

### Clear Caches
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Rebuild Frontend
```bash
npm run build
```

## How It Works

1. **PWA Detection**: The system detects PWA requests through:
   - Display mode media queries
   - User agent analysis
   - Custom headers and cookies
   - Referer header inspection

2. **Automatic Token Creation**: When a PWA user logs in:
   - A 90-day persistent token is automatically created
   - Token is stored in database with tracking metadata
   - Secure cookie is set with proper PWA-compatible settings

3. **Session Restoration**: On subsequent requests:
   - Middleware checks for persistent token
   - Validates token hasn't expired
   - Automatically logs user in if valid
   - Refreshes token expiry when used

4. **Security Features**:
   - Tokens are hashed before storage
   - IP address and user agent tracking
   - Automatic token refresh before expiry
   - Complete token revocation on logout

## Testing the Solution

1. **Install PWA**:
   - Open the app in mobile browser
   - Use "Add to Home Screen" or "Install App" option

2. **Login Once**:
   - Login with credentials
   - System automatically creates persistent token

3. **Test Persistence**:
   - Close the PWA completely
   - Wait several hours/days
   - Reopen PWA - should remain logged in

4. **Monitor Sessions**:
   ```sql
   SELECT * FROM persistent_tokens WHERE user_id = ?;
   SELECT * FROM sessions WHERE user_id = ?;
   ```

## Troubleshooting

### Session Still Expiring
1. Check cookie settings in browser DevTools
2. Verify HTTPS is enabled (required for secure cookies)
3. Check service worker registration in Application tab
4. Review Laravel logs for authentication errors

### PWA Not Detected
1. Check browser's display mode: `window.matchMedia('(display-mode: standalone)').matches`
2. Verify PWA manifest is properly configured
3. Check network requests for `X-Requested-With: PWA` header

### Token Not Created
1. Verify migration ran successfully
2. Check database for persistent_tokens table
3. Review middleware execution order in `bootstrap/app.php`

## Security Considerations

1. **HTTPS Required**: Secure cookies only work over HTTPS
2. **Token Rotation**: Tokens auto-refresh to prevent hijacking
3. **Device Tracking**: IP and user agent help detect suspicious activity
4. **Logout Cleanup**: All tokens revoked on explicit logout

## Future Enhancements

1. **Device Management UI**: Allow users to view/revoke active sessions
2. **Push Notifications**: Re-authenticate for sensitive operations
3. **Biometric Authentication**: Integrate with WebAuthn for passwordless login
4. **Token Rotation**: Implement rolling token refresh on each use