// ================================
// SOCIAL SHARING
// Share menu items and generate referral codes
// ================================

/**
 * SocialSharing - Share items to social media and generate referral codes
 */
class SocialSharing {
  constructor() {
    this.baseUrl = window.location.origin;
    this.referralCode = this.loadReferralCode();
    this.attachEventHandlers();
  }

  /**
   * Load or generate referral code
   * @returns {string} Referral code
   */
  loadReferralCode() {
    let code = StorageManager.get(STORAGE_KEYS.REFERRAL_CODE, null);
    if (!code) {
      code = this.generateReferralCode();
      StorageManager.set(STORAGE_KEYS.REFERRAL_CODE, code);
    }
    return code;
  }

  /**
   * Generate unique referral code
   * @returns {string} Referral code
   */
  generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'REF-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Attach event handlers for share buttons
   */
  attachEventHandlers() {
    // Delegate click events for share buttons
    document.addEventListener('click', (e) => {
      const shareBtn = e.target.closest('.share-btn');
      if (shareBtn) {
        e.preventDefault();
        const platform = shareBtn.dataset.platform;
        const itemId = shareBtn.dataset.itemId;
        this.share(platform, itemId);
      }

      // Copy link button
      const copyBtn = e.target.closest('.copy-link-btn');
      if (copyBtn) {
        e.preventDefault();
        const itemId = copyBtn.dataset.itemId;
        this.copyShareLink(itemId);
      }

      // Referral code button
      const referralBtn = e.target.closest('.copy-referral-btn');
      if (referralBtn) {
        e.preventDefault();
        this.copyReferralCode();
      }
    });
  }

  /**
   * Share item to social media platform
   * @param {string} platform - Social platform (facebook, twitter, whatsapp, pinterest)
   * @param {number} itemId - Menu item ID
   */
  share(platform, itemId) {
    const item = this.getItemData(itemId);
    if (!item) return;

    const shareUrl = this.getShareUrl(itemId);
    const text = `Check out ${item.title} from The Patio Time Cafe! Only $${item.price}`;
    const imageUrl = `${this.baseUrl}${item.image}`;

    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;

      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;

      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;

      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(text)}`;
        break;

      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;

      case 'email':
        url = `mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(text + '\n\n' + shareUrl)}`;
        break;

      default:
        console.warn('Unknown platform:', platform);
        return;
    }

    // Open share window
    if (platform === 'email') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer');
    }

    // Track share event (could send to analytics)
    this.trackShare(platform, itemId);
  }

  /**
   * Use Web Share API if available (mobile)
   * @param {number} itemId - Menu item ID
   */
  async nativeShare(itemId) {
    if (!navigator.share) {
      console.warn('Web Share API not supported');
      return false;
    }

    const item = this.getItemData(itemId);
    if (!item) return false;

    const shareUrl = this.getShareUrl(itemId);

    try {
      await navigator.share({
        title: item.title,
        text: `Check out ${item.title} - Only $${item.price}!`,
        url: shareUrl,
      });

      this.trackShare('native', itemId);
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  }

  /**
   * Copy share link to clipboard
   * @param {number} itemId - Menu item ID
   */
  async copyShareLink(itemId) {
    const shareUrl = this.getShareUrl(itemId);

    try {
      await navigator.clipboard.writeText(shareUrl);

      if (window.NotificationSystem) {
        window.NotificationSystem.success('Link copied to clipboard!', {
          duration: TIMINGS.NOTIFICATION_SHORT,
        });
      }

      this.trackShare('copy-link', itemId);
    } catch (error) {
      console.error('Copy failed:', error);

      // Fallback for older browsers
      this.copyToClipboardFallback(shareUrl);
    }
  }

  /**
   * Fallback clipboard copy for older browsers
   * @param {string} text - Text to copy
   */
  copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      if (window.NotificationSystem) {
        window.NotificationSystem.success('Link copied!', {
          duration: TIMINGS.NOTIFICATION_SHORT,
        });
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
    }

    document.body.removeChild(textarea);
  }

  /**
   * Copy referral code to clipboard
   */
  async copyReferralCode() {
    try {
      await navigator.clipboard.writeText(this.referralCode);

      if (window.NotificationSystem) {
        window.NotificationSystem.success(
          `Referral code ${this.referralCode} copied!`,
          { duration: TIMINGS.NOTIFICATION_MEDIUM }
        );
      }
    } catch (error) {
      this.copyToClipboardFallback(this.referralCode);
    }
  }

  /**
   * Get shareable URL for item
   * @param {number} itemId - Menu item ID
   * @returns {string} Share URL
   */
  getShareUrl(itemId) {
    return `${this.baseUrl}/product-detail-page/index.html?id=${itemId}&ref=${this.referralCode}`;
  }

  /**
   * Get item data
   * @param {number} itemId - Item ID
   * @returns {Object|null} Item data
   */
  getItemData(itemId) {
    if (window.menuData) {
      return window.menuData.find((item) => item.id === itemId);
    }
    return null;
  }

  /**
   * Track share event
   * @param {string} platform - Platform name
   * @param {number} itemId - Item ID
   */
  trackShare(platform, itemId) {
    // Could send to analytics service
    console.log('Share tracked:', { platform, itemId, timestamp: Date.now() });

    // Emit event for other components
    EventBus.emit('social:shared', { platform, itemId });
  }

  /**
   * Get referral code
   * @returns {string} Referral code
   */
  getReferralCode() {
    return this.referralCode;
  }

  /**
   * Check if referred from another user
   * @returns {string|null} Referrer code or null
   */
  getReferrerCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  }

  /**
   * Process referral (award points to referrer)
   */
  processReferral() {
    const referrerCode = this.getReferrerCode();
    if (!referrerCode) return;

    // Check if already processed this referral
    const processedReferrals = StorageManager.get('processed_referrals', []);
    if (processedReferrals.includes(referrerCode)) return;

    // Add to processed list
    processedReferrals.push(referrerCode);
    StorageManager.set('processed_referrals', processedReferrals);

    // Show referral notification
    if (window.NotificationSystem) {
      window.NotificationSystem.info(
        'Welcome! You were referred by a friend.',
        { duration: TIMINGS.NOTIFICATION_MEDIUM }
      );
    }

    console.log('Referral processed:', referrerCode);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SocialSharing = new SocialSharing();
    window.SocialSharing.processReferral();
  });
} else {
  window.SocialSharing = new SocialSharing();
  window.SocialSharing.processReferral();
}

console.log('✅ Social Sharing initialized');
