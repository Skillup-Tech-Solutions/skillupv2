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
