#!/usr/bin/env node

/**
 * Version Sync Script
 * 
 * Syncs the version from package.json to:
 * - Android build.gradle (versionCode and versionName)
 * - iOS Info.plist (when implemented)
 * - Frontend version.ts constant
 * 
 * Version Code Calculation:
 * MAJOR * 10000 + MINOR * 100 + PATCH
 * Example: 1.2.3 -> 10203
 */

const fs = require('fs');
const path = require('path');

// Paths
const packageJsonPath = path.join(__dirname, '../package.json');
const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
const versionTsPath = path.join(__dirname, '../src/utils/version.ts');

/**
 * Calculate Android versionCode from semantic version
 */
function calculateVersionCode(version) {
    const parts = version.split('.').map(Number);
    const major = parts[0] || 0;
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;
    return major * 10000 + minor * 100 + patch;
}

/**
 * Get current date in YYYY-MM-DD format
 */
const { execSync } = require('child_process');

/**
 * Get current git commit hash (short)
 */
function getGitHash() {
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
        return 'unknown';
    }
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Read package.json and extract version
 */
function getPackageVersion() {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
}

/**
 * Update Android build.gradle with new version
 */
function updateBuildGradle(version, versionCode) {
    if (!fs.existsSync(buildGradlePath)) {
        console.log('⚠️  build.gradle not found, skipping Android sync');
        return false;
    }

    let content = fs.readFileSync(buildGradlePath, 'utf8');

    // Update versionCode
    content = content.replace(
        /versionCode\s+\d+/,
        `versionCode ${versionCode}`
    );

    // Update versionName
    content = content.replace(
        /versionName\s+"[^"]+"/,
        `versionName "${version}"`
    );

    fs.writeFileSync(buildGradlePath, content, 'utf8');
    console.log(`✅ Updated build.gradle: versionCode=${versionCode}, versionName="${version}"`);
    return true;
}

/**
 * Update version.ts with new version constant
 */
function updateVersionTs(version, versionCode, buildDate, gitHash, env) {
    if (!fs.existsSync(versionTsPath)) {
        console.log('⚠️  version.ts not found, skipping frontend sync');
        return false;
    }

    let content = fs.readFileSync(versionTsPath, 'utf8');

    // Update APP_VERSION constant
    content = content.replace(
        /const APP_VERSION = '[^']+'/,
        `const APP_VERSION = '${version}'`
    );

    // Update BUILD_NUMBER constant
    content = content.replace(
        /const BUILD_NUMBER = \d+/,
        `const BUILD_NUMBER = ${versionCode}`
    );

    // Update BUILD_DATE constant
    content = content.replace(
        /const BUILD_DATE = '[^']+'/,
        `const BUILD_DATE = '${buildDate}'`
    );

    // Update GIT_COMMIT constant
    content = content.replace(
        /const GIT_COMMIT = '[^']+'/,
        `const GIT_COMMIT = '${gitHash}'`
    );

    // Update ENV constant
    content = content.replace(
        /const ENV = '[^']+'/,
        `const ENV = '${env}'`
    );

    fs.writeFileSync(versionTsPath, content, 'utf8');
    console.log(`✅ Updated version.ts: version=${version}, code=${versionCode}, date=${buildDate}, hash=${gitHash}, env=${env}`);
    return true;
}

/**
 * Main sync function
 */
function syncVersions() {
    console.log('🔄 Syncing app version (Production Mode)...\n');

    const version = getPackageVersion();
    const versionCode = calculateVersionCode(version);
    const buildDate = getCurrentDate();
    const gitHash = getGitHash();
    const env = process.env.NODE_ENV || 'production';

    console.log(`📦 Package: ${version}`);
    console.log(`🔢 Code:    ${versionCode} (Semantic Encoding)`);
    console.log(`📅 Date:    ${buildDate}`);
    console.log(`🌿 Git:     ${gitHash}`);
    console.log(`🌍 Env:     ${env}\n`);

    let success = true;

    // Update Android
    try {
        updateBuildGradle(version, versionCode);
    } catch (error) {
        console.error('❌ Failed to update build.gradle:', error.message);
        success = false;
    }

    // Update frontend
    try {
        updateVersionTs(version, versionCode, buildDate, gitHash, env);
    } catch (error) {
        console.error('❌ Failed to update version.ts:', error.message);
        success = false;
    }

    console.log('\n' + (success ? '✅ Production version sync complete!' : '⚠️  Version sync completed with warnings'));

    return success;
}

// Run if called directly
if (require.main === module) {
    const success = syncVersions();
    process.exit(success ? 0 : 1);
}

module.exports = { syncVersions, calculateVersionCode };
