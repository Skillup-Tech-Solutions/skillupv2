import config from "../Config/Config";

/**
 * Normalizes file URLs to use the correct backend URL.
 * Handles legacy URLs that may contain localhost or different domains.
 * 
 * @param url - The URL to normalize (can be full URL or relative path)
 * @returns The normalized URL using the current BASE_URL_MAIN
 */
export const normalizeFileUrl = (url: string | null | undefined): string => {
    if (!url) return '';

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
 */
export const normalizeDownloadUrl = (url: string | null | undefined): string => {
    if (!url) return '';

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
