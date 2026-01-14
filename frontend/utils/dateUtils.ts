/**
 * Utility functions for formatting dates and times
 */

/**
 * Format a timestamp for chat display
 * - Today: Show time (e.g., "12:23 PM")
 * - Yesterday: Show "Yesterday"
 * - This week: Show day name (e.g., "Monday")
 * - Older: Show date (e.g., "Jan 12" or "12/01/24")
 */
export const formatChatTime = (timestamp: number): string => {
  const now = new Date();
  const messageDate = new Date(timestamp);

  // Reset time part for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const messageDateOnly = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  // Today - show time
  if (messageDateOnly.getTime() === today.getTime()) {
    return formatTime(messageDate);
  }

  // Yesterday
  if (messageDateOnly.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Within the last week - show day name
  if (messageDateOnly > oneWeekAgo) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[messageDate.getDay()];
  }

  // Older - show date
  return formatDate(messageDate);
};

/**
 * Format time as "12:23 PM"
 */
export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};

/**
 * Format date as "Jan 12" for same year, "Jan 12, 24" for different year
 */
export const formatDate = (date: Date): string => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  if (year === currentYear) {
    return `${month} ${day}`;
  }
  return `${month} ${day}, ${year.toString().slice(-2)}`;
};

/**
 * Get display text for message type with emoji
 */
export const getMessageTypeDisplay = (
  messageType: string | undefined,
  lastMessage: string
): string => {
  switch (messageType) {
    case "image":
      return "📷 Photo";
    case "video":
      return "🎥 Video";
    case "audio":
      return "🎵 Audio";
    case "file":
      return "📎 File";
    default:
      return lastMessage;
  }
};
