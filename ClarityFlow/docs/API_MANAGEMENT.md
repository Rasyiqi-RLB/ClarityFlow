# API Management Documentation

## Overview
ClarityFlow API Management provides secure API key management, rate limiting, and access control for your application.

## Features
- ✅ API Key Creation & Management
- ✅ Permission-based Access Control
- ✅ Rate Limiting
- ✅ Usage Tracking
- ✅ Environment-specific Keys
- ✅ Security Logging

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# API Management
ENABLE_API_MANAGEMENT=true
API_BASE_URL=https://your-api-domain.com
API_KEY_PREFIX=sk_
DEFAULT_RATE_LIMIT=1000
PRODUCTION_RATE_LIMIT=5000
API_KEY_EXPIRY_DAYS=365
MAX_API_KEYS_PER_USER=10

# Security
MAX_LOGIN_ATTEMPTS=5
SESSION_TIMEOUT=3600
PASSWORD_MIN_LENGTH=8
ENABLE_2FA=false
```

## API Key Management

### Creating API Keys

```typescript
import { systemManagementService } from '../services/systemManagementService';

// Create a new API key
const apiKey = await systemManagementService.createAPIKey(
  'My App Key',           // name
  'production',           // environment
  ['read', 'write']       // permissions
);

console.log('New API Key:', apiKey.key);
```

### Available Permissions
- `read` - Read access to resources
- `write` - Create and update resources
- `delete` - Delete resources
- `admin` - Full administrative access

### Environment Types
- `development` - For development and testing
- `staging` - For staging environment
- `production` - For production use

## API Middleware Usage

### Basic Request Validation

```typescript
import { apiMiddleware } from '../services/apiMiddleware';

// Validate API request
const request = {
  apiKey: 'sk_your_api_key_here',
  endpoint: '/api/tasks',
  method: 'GET' as const,
  userAgent: 'MyApp/1.0',
  ipAddress: '192.168.1.1',
  timestamp: new Date()
};

const response = await apiMiddleware.processRequest(request, 'read');

if (response.success) {
  console.log('Request authorized');
  console.log('Rate limit remaining:', response.rateLimit?.remaining);
} else {
  console.error('Request denied:', response.error);
}
```

### Rate Limiting

```typescript
// Check rate limit status
const rateLimitInfo = apiMiddleware.getRateLimitStatus('sk_your_api_key', 1000);

if (rateLimitInfo.blocked) {
  console.log(`Rate limit exceeded. Reset at: ${rateLimitInfo.resetTime}`);
} else {
  console.log(`Requests remaining: ${rateLimitInfo.remaining}`);
}
```

## API Key Operations

### Validate API Key

```typescript
const validation = await systemManagementService.validateAPIKey('sk_your_api_key');

if (validation.valid) {
  console.log('Key is valid');
  console.log('Permissions:', validation.keyData?.permissions);
} else {
  console.log('Invalid key:', validation.error);
}
```

### Update API Key Usage

```typescript
// Update usage statistics
await systemManagementService.updateAPIKeyUsage('key_id_here');
```

### Revoke API Key

```typescript
// Revoke an API key
await systemManagementService.revokeAPIKey('key_id_here');
```

### Delete API Key

```typescript
// Permanently delete an API key
await systemManagementService.deleteAPIKey('key_id_here');
```

## Security Features

### API Key Format Validation

```typescript
import { isValidAPIKeyFormat } from '../config/env';

if (isValidAPIKeyFormat('sk_abc123...')) {
  console.log('Valid API key format');
}
```

### Rate Limit Configuration

```typescript
import { getRateLimit } from '../config/env';

// Get rate limit for environment
const limit = getRateLimit('production'); // Returns 5000
const devLimit = getRateLimit('development'); // Returns 1000
```

## Error Handling

### Common Error Codes

- `401` - Invalid or expired API key
- `403` - Insufficient permissions
- `429` - Rate limit exceeded
- `500` - Internal server error

### Error Response Format

```typescript
interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTime: Date;
  };
}
```

## Best Practices

### 1. API Key Security
- Never expose API keys in client-side code
- Store keys securely in environment variables
- Rotate keys regularly
- Use environment-specific keys

### 2. Permission Management
- Follow principle of least privilege
- Use specific permissions instead of `admin`
- Review permissions regularly

### 3. Rate Limiting
- Set appropriate limits for your use case
- Monitor usage patterns
- Implement exponential backoff for retries

### 4. Monitoring
- Log all API key operations
- Monitor for suspicious activity
- Set up alerts for rate limit violations

## UI Components

### SecurityManagement Component
The `SecurityManagement` component provides a complete UI for:
- Viewing API keys
- Creating new keys with permissions
- Copying keys to clipboard
- Revoking/deleting keys
- Monitoring usage statistics

```tsx
import { SecurityManagement } from '../components/SecurityManagement';

// Use in your app
<SecurityManagement />
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check if key is active
   - Verify permissions
   - Check expiration date

2. **Rate Limit Issues**
   - Check current usage
   - Verify rate limit settings
   - Wait for reset time

3. **Permission Denied**
   - Verify required permissions
   - Check if key has admin access
   - Review permission configuration

### Debug Mode

Enable debug logging:

```typescript
// Enable detailed logging
loggingService.setLevel('debug');
```

## Migration Guide

If upgrading from a previous version:

1. Update environment configuration
2. Run database migrations (if any)
3. Update API key format
4. Test all integrations

## Support

For issues or questions:
- Check the logs in `loggingService`
- Review security logs in the UI
- Contact your system administrator