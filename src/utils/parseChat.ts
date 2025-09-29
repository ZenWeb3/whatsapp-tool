export interface ChatMessage {
  timeStamp: string;
  sender: string;
  message: string;
  emojis?: string[] | null;
}

export const ParseChat = (text: string): ChatMessage[] => {
  const lines = text.split("\n");
  const messages: ChatMessage[] = [];

  const messageRegex =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}:\d{2}\s+[APM]{2})\]\s+([^:]+?):\s*(.*)$/;

  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().replace(/^\u200E/, "");
    if (!line) continue;

    const match = line.match(messageRegex);
    if (match) {
      const [, date, time, sender, message] = match;

      if (message && sender) {
        if (
          message.includes("‎Voice call") ||
          message.includes("‎image omitted") ||
          message.includes("‎Messages and calls") ||
          message.includes("‎video omitted") ||
          message.includes("‎audio omitted") ||
          message.includes("‎sticker omitted") ||
          message.includes("‎document omitted") ||
          message.includes("‎location:") ||
          message.includes("‎Contact card omitted")
        ) {
          continue;
        }

        const emojis = message.match(emojiRegex) || [];
        messages.push({
          timeStamp: `${date} ${time}`,
          sender: sender.trim(),
          message: message.trim(),
          emojis,
        });
      }
    } else {
      if (
        messages.length > 0 &&
        line &&
        !line.match(/^\[\d{1,2}\/\d{1,2}\/\d{2,4}/)
      ) {
        messages[messages.length - 1].message += "\n" + line;

        const updatedEmojis =
          messages[messages.length - 1].message.match(emojiRegex) || [];
        messages[messages.length - 1].emojis = updatedEmojis;
      }
    }
  }

  return messages;
};
