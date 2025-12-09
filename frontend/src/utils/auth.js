const TOKEN_KEY = 'ai_mock_token';
const USER_KEY = 'ai_mock_user';

/**
 * Check if the user is currently authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
};

/**
 * Get the authentication token
 * @returns {string | null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set the authentication token
 * @param {string} token 
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get the stored user profile data
 * @returns {object | null}
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing user data", e);
    return null;
  }
};

/**
 * Store the user profile data
 * @param {object} user 
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove the stored user data
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Helper to clear all auth data (Logout)
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

/**
 * Helper to get standard Authorization headers
 * Usage: headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};