/**
 * Formats duration in second to human-readable string
 * @param seconds
 * @returns
 */

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    if (remainingSeconds > 0) {
      return `${hours}s ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${hours}`;
    }
  } else {
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${minutes}`;
    }
  }
}

/**
 * Formats data string form sanity into readable string
 * @param dateString
 * @returns
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
};
