const B2 = require("backblaze-b2");
const crypto = require("crypto");
const path = require("path");

const b2 = new B2({
    applicationKeyId: process.env.keyID, // or B2_APPLICATION_KEY_ID
    applicationKey: process.env.applicationKey // or B2_APPLICATION_KEY
});

let authorized = false;

let downloadUrlCache = null;

const authorize = async () => {
    try {
        const response = await b2.authorize();
        authorized = true;
        if (response.data) {
            if (response.data.allowed && response.data.allowed.bucketId) {
                bucketIdCache = response.data.allowed.bucketId;
                console.log("Cached Bucket ID from Auth:", bucketIdCache);
            }
            if (response.data.downloadUrl) {
                downloadUrlCache = response.data.downloadUrl;
                console.log("Cached Download URL from Auth:", downloadUrlCache);
            }
        }
        console.log("Backblaze B2 authorized");
    } catch (err) {
        console.error("Error authorizing Backblaze B2:", err);
        throw err;
    }
};

const getUploadUrl = async () => {
    if (!authorized) await authorize();
    try {
        const response = await b2.getUploadUrl({
            bucketId: await getBucketId()
        });
        return response.data;
    } catch (err) {
        // Retry once if authorization failed
        if (err.response && err.response.status === 401) {
            await authorize();
            const response = await b2.getUploadUrl({
                bucketId: await getBucketId()
            });
            return response.data;
        }
        throw err;
    }
};

let bucketIdCache = null;
const getBucketId = async () => {
    if (bucketIdCache) return bucketIdCache;
    if (!authorized) await authorize();

    // Check cache again after auth
    if (bucketIdCache) return bucketIdCache;

    // If bucket ID is in env, use it (optional optimization)
    // Otherwise find by name
    const bucketName = process.env.B2_BUCKET_NAME; // e.g. "skillup-assets"
    if (!bucketName) {
        throw new Error("B2_BUCKET_NAME is missing in environment variables");
    }

    try {
        // Try `getBucket` first if supported, or listBuckets
        const buckets = await b2.listBuckets();
        const bucket = buckets.data.buckets.find(b => b.bucketName === bucketName);
        if (bucket) {
            bucketIdCache = bucket.bucketId;
            return bucket.bucketId;
        } else {
            // Fallback: maybe the key is restricted and listBuckets returns empty or filtered?
            // If we can't find it, we can't upload.
            // But if we have one bucket in list, and it matches, we are good.
            throw new Error(`Bucket ${bucketName} not found in account or key restricted`);
        }
    } catch (err) {
        console.error("Error getting bucket ID:", err);
        throw err;
    }
};

exports.uploadFile = async (fileBuffer, fileName, folder = "") => {
    try {
        const { uploadUrl, authorizationToken } = await getUploadUrl();

        // Sanitize filename
        const safeName = path.parse(fileName).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const ext = path.extname(fileName);
        const timestamp = Date.now();
        const finalName = folder ? `${folder}/${safeName}-${timestamp}${ext}` : `${safeName}-${timestamp}${ext}`;

        const response = await b2.uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: finalName,
            data: fileBuffer
        });

        const bucketName = process.env.B2_BUCKET_NAME;

        // DYNAMIC SOLUTION: Return only the file path, not a full URL
        // The frontend will construct the full URL using its own BASE_URL config
        // This avoids storing localhost URLs in the database
        return {
            fileId: response.data.fileId,
            fileName: response.data.fileName,  // Full path like "deliveries/filename-123.pdf"
            filePath: finalName,               // Same as fileName but explicitly named
            // Only include full URL if APP_API_URL is configured (for backward compatibility)
            url: process.env.APP_API_URL
                ? `${process.env.APP_API_URL}/api/files/download?file=${finalName}`
                : null,
            b2Url: downloadUrlCache ? `${downloadUrlCache}/file/${bucketName}/${finalName}` : null
        };

    } catch (err) {
        console.error("Upload failed:", err);
        throw err;
    }
};

exports.getSignedUrl = async (fileName) => {
    if (!authorized) await authorize();

    try {
        const bucketId = await getBucketId();
        const bucketName = process.env.B2_BUCKET_NAME;

        // Ensure we are authorizing for the specific file
        const response = await b2.getDownloadAuthorization({
            bucketId: bucketId,
            fileNamePrefix: fileName,
            validDurationInSeconds: 3600 // 1 hour
        });

        const token = response.data.authorizationToken;
        // Construct the URL using the cached download URL and bucket name
        const url = `${downloadUrlCache}/file/${bucketName}/${fileName}?Authorization=${token}`;
        return url;
    } catch (err) {
        console.error("Error generating signed URL:", err);
        throw err;
    }
};

exports.deleteFile = async (fileName) => {
    if (!authorized) await authorize();
    try {
        const bucketId = await getBucketId();

        // B2 delete needs both fileName and fileId
        // First we list to get the fileId
        const response = await b2.listFileNames({
            bucketId: bucketId,
            startFileName: fileName,
            maxFileCount: 1,
            prefix: fileName
        });

        const file = response.data.files.find(f => f.fileName === fileName);
        if (file) {
            await b2.deleteFileVersion({
                fileName: file.fileName,
                fileId: file.fileId
            });
            console.log(`Deleted file from B2: ${fileName}`);
            return true;
        }
        console.warn(`File not found in B2 for deletion: ${fileName}`);
        return false;
    } catch (err) {
        console.error("Error deleting file from B2:", err);
        // Don't throw so the main flow (uploading new file) can continue even if deletion fails
        return false;
    }
};

exports.getB2 = () => b2; // Export instance if needed
