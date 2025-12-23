import config from "../Config/Config";

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
export const buildDownloadUrl = (filePath: string): string => {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `${config.BASE_URL_MAIN}/api/files/download?file=${encodeURIComponent(cleanPath)}`;
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

    // If it's a raw file path, build the download URL directly
    if (isFilePath(url)) {
        return buildDownloadUrl(url);
    }

    // If it contains the download endpoint, normalize it
    if (url.includes('/api/files/download')) {
        try {
            const urlObj = new URL(url);
            const fileParam = urlObj.searchParams.get('file');
            if (fileParam) {
                return `${config.BASE_URL_MAIN}/api/files/download?file=${encodeURIComponent(fileParam)}`;
            }
        } catch {
            // Extract file param manually if URL parsing fails
            const match = url.match(/file=([^&]+)/);
            if (match) {
                return `${config.BASE_URL_MAIN}/api/files/download?file=${match[1]}`;
            }
        }
    }

    // Fall back to general normalization
    return normalizeFileUrl(url);
};

export default normalizeFileUrl;

