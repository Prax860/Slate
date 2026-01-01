/**
 * Whiteboard Sharing Utilities
 * 
 * Provides helper functions for sharing whiteboards via email and generating share links
 */

interface ShareOptions {
  boardId: string;
  boardName: string;
  userId: string;
  senderEmail?: string;
  recipientEmail?: string;
}

/**
 * Generate a shareable URL for a whiteboard with a share code
 * @param shareCode The generated share code
 * @returns The full shareable URL
 */
export const generateShareUrl = (shareCode: string): string => {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard?joinCode=${shareCode}`;
};

/**
 * Generate an email template for sharing a whiteboard
 * @param options Share options including board details and recipient info
 * @returns Object with email subject and body
 */
export const generateEmailTemplate = (options: Omit<ShareOptions, 'userId'> & { shareCode: string }) => {
  const shareUrl = generateShareUrl(options.shareCode);
  
  return {
    subject: `Join my whiteboard: ${options.boardName}`,
    body: `I'd like to invite you to collaborate on my whiteboard!

Board Name: ${options.boardName}

Click the link below to join:
${shareUrl}

This link expires in 5 minutes. If it expires, ask the board owner to generate a new share code.

Happy collaborating! 🎨`,
  };
};

/**
 * Copy a share URL to clipboard
 * @param shareCode The share code
 * @returns Promise that resolves when copy is complete
 */
export const copyShareUrlToClipboard = async (shareCode: string): Promise<void> => {
  const url = generateShareUrl(shareCode);
  await navigator.clipboard.writeText(url);
};

/**
 * Open email client with share template
 * @param options Share options including board details
 * @param shareCode The generated share code
 */
export const shareViaEmailClient = (
  options: Omit<ShareOptions, 'userId'>,
  shareCode: string
): void => {
  const template = generateEmailTemplate({ ...options, shareCode });
  const mailtoLink = `mailto:?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
  window.location.href = mailtoLink;
};

/**
 * Share to clipboard and show toast message (can be integrated with a toast library)
 * @param shareCode The share code
 * @param onSuccess Callback when copy is successful
 * @param onError Callback if copy fails
 */
export const shareToClipboard = async (
  shareCode: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> => {
  try {
    await copyShareUrlToClipboard(shareCode);
    onSuccess?.();
  } catch (error) {
    onError?.(error as Error);
  }
};

/**
 * Validate a share code format (6 uppercase characters)
 * @param code The code to validate
 * @returns True if code format is valid
 */
export const isValidShareCodeFormat = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};
