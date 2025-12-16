# Local Testing Guide for js-bao-wss-client

This guide shows you how to test your npm package locally before publishing, using `npm pack` to simulate the exact experience users will have when installing from npm.

## 🚀 Quick Start

```bash
# 1. Build and pack the library
cd src/client
npm run build
npm pack

# 2. Create a test project
cd ../../../
mkdir test-my-package && cd test-my-package
npm init -y

# 3. Install the local package
npm install ../js-bao-wss/src/client/js-bao-wss-client-1.0.0.tgz

# 4. Test it!
echo 'import { JsBaoClient } from "js-bao-wss-client"; console.log("✅ Works!");' > test.js
sed -i '' 's/"type": "commonjs"/"type": "module"/' package.json
node test.js
```

## 📦 Complete Testing Workflow

### Step 1: Build and Package

```bash
# Navigate to client directory
cd src/client

# Build both ESM and UMD outputs
npm run build

# Create a .tgz package (same as npm publish would create)
npm pack
```

This creates `js-bao-wss-client-1.0.0.tgz` containing exactly what would be published to npm.

### Step 2: Create Test Projects

#### Option A: Simple Test Project

```bash
# Create outside your main project
cd ../../../
mkdir test-simple && cd test-simple
npm init -y

# Make it ESM
sed -i '' 's/"type": "commonjs"/"type": "module"/' package.json

# Install your package
npm install ../js-bao-wss/src/client/js-bao-wss-client-1.0.0.tgz
```

#### Option B: TypeScript Test Project

```bash
mkdir test-typescript && cd test-typescript
npm init -y
npm install -D typescript @types/node
npm install ../js-bao-wss/src/client/js-bao-wss-client-1.0.0.tgz
```

## 🧪 Test Scenarios

### Basic ESM Import Test

```javascript
// test-basic.js
import { JsBaoClient } from 'js-bao-wss-client';

console.log('✅ Import successful');

const client = new JsBaoClient({
  apiUrl: 'https://your-api.example.com',
  wsUrl: 'wss://your-ws.example.com',
  appId: 'your-app-id'
});

console.log('✅ Client created');
console.log('📋 Available APIs:', Object.keys(client));
```

### TypeScript Integration Test

```typescript
// test-typescript.ts
import { JsBaoClient, type DocumentInfo } from 'js-bao-wss-client';

const client = new JsBaoClient({
  apiUrl: 'https://api.example.com',
  wsUrl: 'wss://ws.example.com',
  appId: 'test-app',
  token: 'your-jwt-token'
});

async function testTyping() {
  try {
    const docs: DocumentInfo[] = await client.documents.list();
    console.log('✅ TypeScript types working');
  } catch (error) {
    console.log('Expected error (no server):', error.message);
  }
}
```

### Browser/UMD Test

```html
<!-- test-browser.html -->
<!DOCTYPE html>
<html>
<head><title>Browser Test</title></head>
<body>
    <h1>js-bao-wss-client Browser Test</h1>
    <div id="output"></div>
    
    <!-- Dependencies (normally from CDN) -->
    <script>
        window.Y = { encodeStateAsUpdate: () => new Uint8Array() };
        window.lib0 = { Observable: class Observable {} };
        window.ulid = { ulid: () => 'test-id' };
    </script>
    
    <!-- Your package's UMD build -->
    <script src="node_modules/js-bao-wss-client/dist/browser.umd.js"></script>
    
    <script>
        const client = new JsBaoWSSClient.JsBaoClient({
            apiUrl: 'https://api.example.com',
            wsUrl: 'wss://ws.example.com',
            appId: 'browser-test'
        });
        document.getElementById('output').innerHTML = '✅ UMD build works!';
    </script>
</body>
</html>
```

## 🔄 Development Workflow

### Testing After Changes

```bash
# 1. Make your changes to JsBaoClient.ts
# 2. Rebuild and repack
npm run build
npm pack

# 3. Update test project
cd ../../../test-simple
npm uninstall js-bao-wss-client
npm install ../js-bao-wss/src/client/js-bao-wss-client-1.0.0.tgz

# 4. Re-run tests
node test-basic.js
```

## 🎯 Quick Test Checklist

```bash
# Complete test in 5 minutes:

# 1. Build & pack
cd src/client && npm run build && npm pack

# 2. Create test project  
cd ../../../ && mkdir quick-test && cd quick-test
npm init -y && sed -i '' 's/"type": "commonjs"/"type": "module"/' package.json

# 3. Install & test
npm install ../js-bao-wss/src/client/js-bao-wss-client-1.0.0.tgz ws
echo 'import {JsBaoClient} from "js-bao-wss-client"; console.log("✅", typeof JsBaoClient);' > test.js
node test.js

# 4. Cleanup
cd .. && rm -rf quick-test
```

## 🐛 Common Issues & Solutions

### "Cannot find package 'ws'" in Node.js

```bash
# Install ws dependency in your test project
npm install ws
```

The client detects Node.js vs browser automatically, but needs `ws` for WebSocket support in Node.

### "ERR_PACKAGE_PATH_NOT_EXPORTED"

This happens when trying to use CommonJS require() with an ESM-first package:

```javascript
// ❌ Won't work (CommonJS)
const { JsBaoClient } = require('js-bao-wss-client');

// ✅ Use dynamic import instead
const { JsBaoClient } = await import('js-bao-wss-client');

// ✅ Or convert to ESM
// Add "type": "module" to package.json and use import
```

## 🚀 Ready to Publish?

Once all local tests pass:

```bash
# Final check
npm run build
npm pack
npm publish --dry-run  # See what would be published

# Actually publish (when ready)
npm publish
```

Now you have a complete testing workflow! 🎉
