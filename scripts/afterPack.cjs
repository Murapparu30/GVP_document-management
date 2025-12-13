const { execSync } = require('child_process');
const path = require('path');

exports.default = async function (context) {
    // Only run on macOS
    if (context.electronPlatformName !== 'darwin') {
        return;
    }

    const appPath = path.join(
        context.appOutDir,
        `${context.packager.appInfo.productFilename}.app`
    );

    console.log(`  • cleaning extended attributes  file=${appPath}`);

    try {
        execSync(`xattr -cr "${appPath}"`);
    } catch (error) {
        console.error('  ⨯ Failed to clean attributes:', error.message);
        // Don't fail the build, try to proceed
    }
};
