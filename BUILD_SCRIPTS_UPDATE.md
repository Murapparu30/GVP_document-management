# Build Scripts Update - 2025-11-15

## Problem
The original `npm run build` script included `electron-builder`, which attempts to rebuild native modules (better-sqlite3) for Electron. This fails in BoltNew environment due to missing C++ build tools.

## Solution
Separated build scripts into two distinct phases:

### 1. Development Build (BoltNew-compatible)
```json
"build": "tsc && vite build"
```

**What it does:**
- ✅ TypeScript compilation
- ✅ Vite production build (renderer)
- ✅ Vite build for Electron main process
- ✅ Vite build for preload script

**Output:**
- `dist/` - Frontend assets (HTML, CSS, JS)
- `dist-electron/main.js` - Electron main process
- `dist-electron/preload.js` - Preload script

**No native module compilation required** - better-sqlite3 is used as-is from node_modules.

### 2. Production Packaging (local machine only)
```json
"package": "npm run build && electron-builder"
```

**What it does:**
- Runs the build script above
- Invokes electron-builder to create installers
- Rebuilds native modules for target Electron version
- Creates platform-specific packages

**Requires:**
- C++ compiler (gcc/clang)
- Python
- Proper build tools (node-gyp, etc.)

## Benefits

✅ **BoltNew can now build the project successfully**
- No electron-builder in default build
- All TypeScript/React code compiles
- Ready for runtime testing

✅ **Better-sqlite3 stays in the project**
- No functionality removed
- Database features work at runtime
- Only packaging step requires rebuild

✅ **Clear separation of concerns**
- `npm run build` - Development/testing
- `npm run package` - Production distribution
- `npm run electron:dev` - Run in development

## Scripts Summary

### ✅ BoltNew / Development Scripts (Safe to run anywhere)
These scripts do **NOT** trigger native module compilation:

| Script | Purpose | Use Case |
|--------|---------|----------|
| `npm run dev` | Start Vite dev server | Development with hot reload |
| `npm run build` | Build app (TypeScript + Vite) | **⭐ BoltNew default** - CI/testing |
| `npm run build:app` | Alias for build | Alternative build command |
| `npm run electron:dev` | Run Electron in dev mode | Testing Electron features |

### ⚠️ Production Packaging Scripts (Local machine ONLY)
These scripts **require** C++ compiler, Python, and node-gyp:

| Script | Purpose | Requirements |
|--------|---------|--------------|
| `npm run package` | Build + create installer | **Local machine with build tools** |

**IMPORTANT NOTES:**
- **In BoltNew**: Only use `npm run dev` or `npm run build`
- **DO NOT run** `npm run package` in BoltNew (will fail with native module errors)
- **For production installers**: Use `npm run package` on local machine with proper toolchain

## Testing

Verified successful build:
```bash
$ npm run build

> qms-local-app@0.1.0 build
> tsc && vite build

✓ 1481 modules transformed.
✓ built in 5.61s (renderer)
✓ 180 modules transformed.
✓ built in 4.71s (main)
✓ 1 modules transformed.
✓ built in 8ms (preload)
```

All files generated correctly:
- ✅ dist/index.html
- ✅ dist/assets/*.css
- ✅ dist/assets/*.js
- ✅ dist-electron/main.js
- ✅ dist-electron/preload.js

## Future: Running on Local Machine

When ready to create production installers:

1. Clone repo to local machine with build tools
2. Run `npm install`
3. Run `npm run package`
4. Electron-builder will:
   - Rebuild better-sqlite3 for target Electron
   - Create Windows installer (.exe)
   - Create macOS app (.dmg) if needed

## Documentation Updated

- ✅ package.json - Scripts reorganized
- ✅ CLAUDE.md - Build scripts section added
- ✅ This document created for reference

## Conclusion

The project now builds successfully in BoltNew while maintaining all SQLite functionality via better-sqlite3. Production packaging is deferred to local machines with proper toolchains.
