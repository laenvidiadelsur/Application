/**
 * Format distance in meters to a human-readable string
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      const kilometers = meters / 1000;
      return `${kilometers.toFixed(1)} km`;
    }
  };
  
  /**
   * Format time in seconds to a human-readable string
   * @param seconds Time in seconds
   * @returns Formatted time string
   */
  export const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds} sec` : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hr${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`;
    }
  };