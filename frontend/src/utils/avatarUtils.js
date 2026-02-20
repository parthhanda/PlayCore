/**
 * Returns a properly formatted absolute URL for an avatar image.
 * Uses a default gamer-style placeholder if no avatar is provided.
 * 
 * @param {string} avatarPath - The relative or absolute path from the database.
 * @returns {string} - The full image URL.
 */
export const getAvatarUrl = (avatarPath) => {
    // Default fallback image (modern gamer style placeholder)
    const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=playcore&backgroundColor=00ffff,000000';

    if (!avatarPath || avatarPath.trim() === '') {
        return defaultAvatar;
    }

    // If it's already an absolute URL (e.g., from an external OAuth provider or previously stored absolute path)
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
    }

    // Assuming backend is running locally on port 5000 in dev
    // In production, you'd use a dynamic base URL from env
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Ensure no double slashes if path already starts with /
    const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;

    return `${baseUrl}${cleanPath}`;
};
