import config from "../Config/Config";
import Cookies from "js-cookie";

/**
 * Checks if a string looks like a raw file path (not a full URL)
 */
const isFilePath = (str: string): boolean => {
    // Raw file paths don't start with http/https and typically have a format like:
    // "deliveries/filename.pdf" or "courses/image.png"
    return !str.startsWith('http://') &&
        !str.startsWith('https://') &&
        !str.startsWith('/api/') &&
        (str.includes('/') || str.match(/\.[a-z0-9]+$/i) !== null);
};

/**
 * Constructs a download URL from a raw file path
 * @param filePath - The file path like "deliveries/filename.pdf"
 * @returns The full download URL
 */
export const buildDownloadUrl = (filePath: string, mode?: 'inline' | 'attachment'): string => {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    let url = `${config.BASE_URL_MAIN}/api/files/download?file=${encodeURIComponent(cleanPath)}`;
    if (mode) {
        url += `&mode=${mode}`;
    }
    return url;
};

/**
 * Normalizes file URLs to use the correct backend URL.
 * Handles:
 * - Legacy URLs with localhost or different domains
 * - Raw file paths like "deliveries/filename.pdf"
 * - Already correct URLs
 * 
 * @param url - The URL or file path to normalize
 * @returns The normalized URL using the current BASE_URL_MAIN
 */
export const normalizeFileUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // If it's a raw file path, build the download URL
    if (isFilePath(url)) {
        return buildDownloadUrl(url);
    }

    // If it's already using the correct base URL, return as-is
    if (url.startsWith(config.BASE_URL_MAIN)) {
        return url;
    }

    // Extract the path from the URL
    // Handle patterns like: http://localhost:5000/api/files/download?file=...
    // or: http://localhost:5000/uploads/...
    try {
        const urlObj = new URL(url);
        const pathWithQuery = urlObj.pathname + urlObj.search;

        // Remove leading slash if BASE_URL_MAIN already has trailing
        const cleanPath = pathWithQuery.startsWith('/') ? pathWithQuery : '/' + pathWithQuery;

        return `${config.BASE_URL_MAIN}${cleanPath}`;
    } catch {
        // If URL parsing fails, it might be a relative path
        // Just prepend the base URL
        const cleanUrl = url.startsWith('/') ? url : '/' + url;
        return `${config.BASE_URL_MAIN}${cleanUrl}`;
    }
};

/**
 * Helper specifically for file download URLs
 * Converts various URL formats to the correct /api/files/download endpoint
 * Also handles raw file paths like "deliveries/filename.pdf"
 */
export const normalizeDownloadUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // If it's already a download URL, just ensure it uses the correct BASE_URL_MAIN
    if (url.includes('/api/files/download')) {
        try {
            // Handle cases where the URL might be relative or use a different base
            if (url.startsWith('http')) {
                const urlObj = new URL(url);
                const fileParam = urlObj.searchParams.get('file');
                if (fileParam) {
                    return `${config.BASE_URL_MAIN}/api/files/download?file=${encodeURIComponent(fileParam)}`;
                }
            } else {
                // If it's a relative path like /api/files/download?file=...
                const match = url.match(/file=([^&]+)/);
                if (match) {
                    return `${config.BASE_URL_MAIN}/api/files/download?file=${decodeURIComponent(match[1])}`;
                }
            }
        } catch {
            const match = url.match(/file=([^&]+)/);
            if (match) {
                return `${config.BASE_URL_MAIN}/api/files/download?file=${match[1]}`;
            }
        }
    }

    // NEW: Explicitly detect B2 URLs and wrap them in the proxy
    if (url.includes('backblazeb2.com')) {
        try {
            const urlObj = new URL(url);
            // B2 URLs: https://f000.backblazeb2.com/file/bucket-name/path/to/file.ext
            // We want to extract everything after the bucket name
            const pathParts = urlObj.pathname.split('/');
            // pathParts[0] is "", pathParts[1] is "file", pathParts[2] is "bucket-name"
            if (pathParts.length > 3 && pathParts[1] === 'file') {
                const b2Path = pathParts.slice(3).join('/');
                return buildDownloadUrl(b2Path);
            }
        } catch (e) {
            console.error('[normalizeDownloadUrl] Failed to parse B2 URL:', url, e);
        }
    }

    // If it's a raw file path (not a URL), build the download URL
    if (isFilePath(url)) {
        return buildDownloadUrl(url);
    }

    // Fall back to general normalization
    return normalizeFileUrl(url);
};

/**
 * Normalizes a URL for inline display (like images)
 * Appends mode=inline to the download proxy URL
 */
export const normalizeInlineUrl = (url: string | null | undefined): string => {
    const normalized = normalizeDownloadUrl(url);
    if (!normalized) return '';
    if (normalized.includes('/api/files/download')) {
        return normalized.includes('?') ? `${normalized}&mode=inline` : `${normalized}?mode=inline`;
    }
    return normalized;
};

/**
 * Opens a file in a new tab by fetching it as a blob first (to bypass ORB/CORS)
 * and then creating a temporary object URL.
 * 
 * @param filePathOrUrl - The file path or URL to open
 */
export const openFileInNewTab = async (filePathOrUrl: string | null | undefined): Promise<void> => {
    if (!filePathOrUrl) return;

    const downloadUrl = normalizeInlineUrl(filePathOrUrl);
    const token = Cookies.get('skToken');

    try {
        const response = await fetch(downloadUrl, {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // Open the blob URL in a new tab
        const newTab = window.open(blobUrl, '_blank');

        if (!newTab) {
            // If pop-up was blocked, try to fall back or inform user
            console.error('Pop-up blocked. Could not open file in new tab.');
            // Fallback: trigger a download instead?
            // window.location.href = blobUrl;
        }

        // Clean up the blob URL eventually
        // We can't revoke it immediately or the new tab might fail to load it
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000); // 10s is usually enough for the browser to load it

    } catch (error) {
        console.error('[openFileInNewTab] Error:', error);
        // Fallback to direct link if fetch fails
        window.open(downloadUrl, '_blank');
    }
};

/**
 * Downloads a file using blob approach - fetches via proxy and downloads locally
 * This ensures the file is downloaded through the authenticated backend proxy
 * 
 * @param filePathOrUrl - The file path or URL to download
 * @param fileName - Optional filename for the downloaded file
 * @param onProgress - Optional progress callback
 * @returns Promise that resolves when download is complete
 */
export const downloadFileAsBlob = async (
    filePathOrUrl: string | null | undefined,
    fileName?: string,
    onProgress?: (percent: number) => void
): Promise<void> => {
    if (!filePathOrUrl) {
        throw new Error('File path is required');
    }

    const downloadUrl = normalizeDownloadUrl(filePathOrUrl);
    const token = Cookies.get('skToken');

    try {
        const response = await fetch(downloadUrl, {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }

        // Get the blob
        const blob = await response.blob();

        // Determine filename
        let finalFileName = fileName;
        if (!finalFileName) {
            // Try to get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    finalFileName = match[1].replace(/['"]/g, '');
                }
            }
            // Fall back to extracting from the path
            if (!finalFileName) {
                const pathParts = filePathOrUrl.split('/');
                finalFileName = pathParts[pathParts.length - 1].split('?')[0];
            }
        }

        // Create blob URL and trigger download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = finalFileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

        if (onProgress) {
            onProgress(100);
        }
    } catch (error) {
        console.error('[downloadFileAsBlob] Download error:', error);
        throw error;
    }
};

export default normalizeFileUrl;
