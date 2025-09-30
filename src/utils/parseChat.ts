export interface ChatMessage {
  timeStamp: string;
  sender: string;
  message: string;
  emojis?: string[] | null;
}

export const ParseChat = (text: string): ChatMessage[] => {
  const lines = text.split("\n");
  const messages: ChatMessage[] = [];

  const regexPatterns = [
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}:\d{2}\s+[APM]{2})\]\s+([^:]+?):\s*(.*)$/,

    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}:\d{2}\s+[apm]{2})\]\s+([^:]+?):\s*(.*)$/i,

    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}\s+[APM]{2})\]\s+([^:]+?):\s*(.*)$/i,

    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}:\d{2})\]\s+([^:]+?):\s*(.*)$/,

    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2})\]\s+([^:]+?):\s*(.*)$/,

    /^\[(\d{4}-\d{1,2}-\d{1,2}),\s+(\d{1,2}:\d{2}:\d{2})\]\s+([^:]+?):\s*(.*)$/,

    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}\s+[APM]{2})\s+-\s+([^:]+?):\s*(.*)$/i,

    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2})\s+-\s+([^:]+?):\s*(.*)$/,

    /^\[(\d{1,2}\.\d{1,2}\.\d{2,4}),\s+(\d{1,2}:\d{2}:\d{2})\]\s+([^:]+?):\s*(.*)$/,

    /^\[(\d{1,2}\.\d{1,2}\.\d{2,4}),\s+(\d{1,2}:\d{2})\]\s+([^:]+?):\s*(.*)$/,
  ];

  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

  const systemMessages = [
    "‎Voice call",
    "‎image omitted",
    "‎Messages and calls",
    "‎video omitted",
    "‎audio omitted",
    "‎sticker omitted",
    "‎document omitted",
    "‎location:",
    "‎Contact card omitted",
    "‎GIF omitted",
    "‎This message was deleted",
    "‎You deleted this message",
    "Missed voice call",
    "Missed video call",
    "‎security code changed",
    "‎end-to-end encrypted",
    "created group",
    "added",
    "left",
    "removed",
    "changed the subject",
    "changed this group's icon",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
      .trim()
      .replace(/^\u200E/g, "")
      .replace(/^\u200F/g, "")
      .replace(/^\uFEFF/g, "");

    if (!line) continue;

    let match = null;
    let matchedPattern = false;

    for (const pattern of regexPatterns) {
      match = line.match(pattern);
      if (match) {
        matchedPattern = true;
        break;
      }
    }

    if (matchedPattern && match) {
      const [, date, time, sender, message] = match;

      if (message && sender) {
        const isSystemMessage = systemMessages.some((sysMsg) =>
          message.includes(sysMsg)
        );

        if (isSystemMessage) {
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
      if (messages.length > 0 && line) {
        const startsWithDate = regexPatterns.some((pattern) => {
          const dateCheck = line.match(pattern);
          return dateCheck !== null;
        });

        if (!startsWithDate) {
          messages[messages.length - 1].message += "\n" + line;

          const updatedEmojis =
            messages[messages.length - 1].message.match(emojiRegex) || [];
          messages[messages.length - 1].emojis = updatedEmojis;
        }
      }
    }
  }

  return messages;
};
