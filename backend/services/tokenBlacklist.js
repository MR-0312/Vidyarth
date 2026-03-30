/**
 * Token Blacklist Service
 * Manages revoked/blacklisted tokens to prevent their reuse after logout
 * 
 * Note: Using in-memory Set for simplicity. 
 * For production, use Redis or database for persistence across server restarts
 */

class TokenBlacklistService {
  constructor() {
    this.blacklistedTokens = new Set();
    // Optional: Add tokens that will auto-remove after expiration
    this.tokenTimers = new Map();
  }

  /**
   * Add a token to the blacklist
   * @param {string} token - The JWT token to blacklist
   * @param {number} expiresIn - Token expiration time in seconds (optional, for auto-removal)
   */
  addToBlacklist(token, expiresIn = null) {
    this.blacklistedTokens.add(token);
    
    // Auto-remove token from blacklist after expiration
    if (expiresIn) {
      if (this.tokenTimers.has(token)) {
        clearTimeout(this.tokenTimers.get(token));
      }
      
      const timeoutId = setTimeout(() => {
        this.removeFromBlacklist(token);
      }, expiresIn * 1000);
      
      this.tokenTimers.set(token, timeoutId);
    }
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - The JWT token to check
   * @returns {boolean} true if blacklisted, false otherwise
   */
  isBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Remove a token from the blacklist
   * @param {string} token - The JWT token to remove
   */
  removeFromBlacklist(token) {
    this.blacklistedTokens.delete(token);
    
    if (this.tokenTimers.has(token)) {
      clearTimeout(this.tokenTimers.get(token));
      this.tokenTimers.delete(token);
    }
  }

  /**
   * Clear all blacklisted tokens (for testing or cleanup)
   */
  clearBlacklist() {
    this.tokenTimers.forEach(timeoutId => clearTimeout(timeoutId));
    this.tokenTimers.clear();
    this.blacklistedTokens.clear();
  }

  /**
   * Get the count of blacklisted tokens
   * @returns {number} Number of tokens in blacklist
   */
  getBlacklistSize() {
    return this.blacklistedTokens.size;
  }
}

module.exports = new TokenBlacklistService();
