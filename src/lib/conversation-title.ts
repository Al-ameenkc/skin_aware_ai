/** Short label from the user's first message (first five words) for history lists */
export function conversationTitleFromMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "Chat";
  const words = trimmed.split(/\s+/).filter(Boolean);
  const slice = words.slice(0, 5);
  return slice.join(" ") || "Chat";
}
