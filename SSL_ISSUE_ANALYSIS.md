# SSL Certificate Issue Analysis & Solution

## Current Problem

The backend container is consistently failing to connect to AWS RDS with the error:

```
Error: self-signed certificate in certificate chain
code: 'HANDSHAKE_SSL_ERROR'
```

Despite multiple attempts to disable SSL, MySQL2 is still attempting SSL connections and failing certificate verification.

## Root Cause Analysis

### 1. **Multiple SSL Configuration Layers**

The project has accumulated multiple SSL-related configurations from different attempts:

#### **Dockerfile Level**

- ✅ **RESOLVED**: Certificate download commented out in `backend/Dockerfile`
- ✅ **RESOLVED**: Certificate file `rds-ca-2019-root.pem` no longer being downloaded

#### **Docker Compose Level**

- ✅ **RESOLVED**: SSL environment variables commented out in `docker-compose.yml`
- ❌ **ISSUE**: Certificate volume mount still active: `./certs:/etc/ssl/certs:ro`
- ❌ **ISSUE**: Certificate download service still running

#### **Application Level**

- ❌ **ISSUE**: Database configuration has complex SSL logic with fallbacks
- ❌ **ISSUE**: MySQL2 automatically detects SSL certificates and enables SSL

### 2. **MySQL2 Auto-SSL Detection**

MySQL2 automatically enables SSL when it detects:

- SSL certificates in the system
- SSL-related environment variables
- SSL configuration in connection options

### 3. **Certificate Volume Mount**

The volume mount `./certs:/etc/ssl/certs:ro` is still active, providing certificates to the container even when SSL is "disabled" in the application.

## Identified Bloat & Leftover Code

### 1. **Certificate Download Service**

- **File**: `docker-compose.yml` and `docker-compose.dev.yml`
- **Issue**: Still downloading certificates even when SSL is disabled
- **Impact**: Unnecessary complexity and resource usage

### 2. **Complex SSL Configuration Logic**

- **File**: `backend/src/config/database.js`
- **Issue**: 80+ lines of commented SSL logic with multiple fallback paths
- **Impact**: Code bloat and confusion

### 3. **Certificate Volume Mounts**

- **File**: `docker-compose.yml` and `docker-compose.dev.yml`
- **Issue**: Mounting certificates when SSL is disabled
- **Impact**: MySQL2 detects certificates and auto-enables SSL

### 4. **SSL Environment Variables**

- **File**: `docker-compose.dev.yml` (still active)
- **Issue**: SSL variables still set in development environment
- **Impact**: Conflicting configuration

### 5. **SSL Documentation**

- **Files**: `SSL_CERTIFICATE_SETUP.md`, `compass_artifact_wf-*.md`
- **Issue**: Outdated documentation for current SSL-disabled approach
- **Impact**: Confusion about current state

## Clean Solution: SSL Disabled Connection

### Step 1: Remove Certificate Download Service

```yaml
# Remove from docker-compose.yml and docker-compose.dev.yml
# cert-downloader service - completely remove
```

### Step 2: Remove Certificate Volume Mounts

```yaml
# Remove from backend services
volumes:
  # Remove this line:
  # - ./certs:/etc/ssl/certs:ro
```

### Step 3: Simplify Database Configuration

```javascript
// backend/src/config/database.js - Clean version
const mysql = require('mysql2/promise');
const { getConfig } = require('./environment');

const config = getConfig();

const dbConfig = {
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Explicitly disable SSL
  ssl: false,
  // Connection timeouts
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

console.log('Database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: 'disabled',
});

const pool = mysql.createPool(dbConfig);

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = { pool, connectDB };
```

### Step 4: Remove SSL Environment Variables

```yaml
# Remove from docker-compose.dev.yml
environment:
  # Remove these lines:
  # - DB_SSL_CA=/etc/ssl/certs/global-bundle.pem
  # - DB_SSL_MODE=VERIFY_IDENTITY
```

### Step 5: Clean Up Dependencies

```yaml
# Remove cert-downloader dependency
depends_on:
  # Remove this line:
  # - cert-downloader
```

## Implementation Plan

### Phase 1: Immediate SSL Disable (Current Priority)

1. ✅ Remove certificate download from Dockerfile
2. ✅ Simplify database configuration
3. 🔄 Remove certificate volume mounts
4. 🔄 Remove certificate download service
5. 🔄 Remove SSL environment variables

### Phase 2: Future SSL Implementation (When Needed)

1. Implement proper SSL with certificate management
2. Use AWS RDS certificate bundle
3. Configure VERIFY_IDENTITY mode
4. Add SSL environment variables back

## Testing Strategy

### 1. **Basic Connection Test**

```bash
# Test without any SSL configuration
docker compose up backend
```

### 2. **Database Verification**

```bash
# Check if connection works
docker compose logs backend
```

### 3. **SSL Status Verification**

```bash
# Verify SSL is actually disabled
docker compose exec backend node -e "
const mysql = require('mysql2/promise');
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false
});
console.log('SSL disabled connection test');
"
```

## Security Considerations

### Current Approach (SSL Disabled)

- **Risk**: Data transmitted in plain text
- **Mitigation**: Use VPC with private subnets
- **Acceptable for**: Development and testing

### Future Approach (SSL Enabled)

- **Risk**: Certificate management complexity
- **Mitigation**: Proper certificate rotation
- **Required for**: Production environments

## Files to Clean Up

### High Priority

1. `docker-compose.yml` - Remove cert-downloader and volume mounts
2. `docker-compose.dev.yml` - Remove SSL environment variables
3. `backend/src/config/database.js` - Simplify to basic configuration

### Medium Priority

4. `SSL_CERTIFICATE_SETUP.md` - Update for current approach
5. `backend/download-rds-ca.sh` - Remove or archive
6. `certs/` directory - Remove or archive

### Low Priority

7. `compass_artifact_wf-*.md` - Archive for future reference
8. Infrastructure SSL configurations - Keep for future use

## Expected Outcome

After implementing the clean solution:

- ✅ Backend connects to RDS without SSL errors
- ✅ No certificate management complexity
- ✅ Simplified configuration
- ✅ Faster container startup
- ✅ Reduced resource usage

## Next Steps

1. **Immediate**: Implement Phase 1 changes
2. **Test**: Verify connection works
3. **Document**: Update documentation
4. **Future**: Implement SSL when needed for production

This approach provides a clean, working solution while maintaining the ability to add SSL back when required for production security.
