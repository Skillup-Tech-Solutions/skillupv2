import Cookies from 'js-cookie';

const TOKEN_EXPIRY_DAYS = 7;
const AUTH_KEYS = ['skToken', 'skRefreshToken', 'email', 'role', 'name'];

const getCookieOptions = () => ({
    path: '/',
    sameSite: 'lax' as const, // Lax is more reliable for localhost and cross-tab persistence
    expires: TOKEN_EXPIRY_DAYS,
    ...(window.location.protocol === 'https:' && { secure: true })
});

export const authService = {
    // Store value in both cookie and localStorage
    set(key: string, value: string) {
        Cookies.set(key, value, getCookieOptions());
        localStorage.setItem(key, value);
    },

    // Get value from cookie OR localStorage (dual fallback)
    get(key: string): string | null {
        return Cookies.get(key) || localStorage.getItem(key) || null;
    },

    // Store all auth data after login
    setTokens(data: {
        accessToken: string;
        refreshToken?: string;
        email: string;
        role: string;
        name: string;
    }) {
        this.set('skToken', data.accessToken);
        if (data.refreshToken) {
            this.set('skRefreshToken', data.refreshToken);
        }
        this.set('email', data.email);
        this.set('role', data.role);
        this.set('name', data.name);
    },

    // Clear all auth data (logout)
    clearAuth() {
        AUTH_KEYS.forEach(key => {
            Cookies.remove(key, { path: '/' });
            localStorage.removeItem(key);
        });
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.get('skToken');
    },

    // Get access token
    getToken(): string | null {
        return this.get('skToken');
    },

    // Get refresh token
    getRefreshToken(): string | null {
        return this.get('skRefreshToken');
    },

    // Get user role
    getRole(): string | null {
        return this.get('role');
    },

    // Get user info
    getUserInfo() {
        return {
            email: this.get('email'),
            role: this.get('role'),
            name: this.get('name'),
        };
    }
};
