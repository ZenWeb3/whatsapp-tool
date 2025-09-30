import type { ChatMessage } from "./parseChat";

interface SenderStat {
  sender: string;
  count: number;
  percentage: string;
}

interface CountItem {
  emoji?: string;
  word?: string;
  count: number;
}

export interface ChatStats {
  totalMessages: number;
  conversationStarted: string;
  totalEmojis: number;
  topSenders: SenderStat[];
  mostUsedEmojis: CountItem[];
  mostCommonWords: CountItem[];
}

export const getChatStats = (messages: ChatMessage[]): ChatStats => {
  const totalMessages = messages.length;
  const conversationStarted = messages[0]?.timeStamp || "";

  let totalEmojis = 0;
  const emojiCount: Record<string, number> = {};
  const senderCount: Record<string, number> = {};
  const wordCount: Record<string, number> = {};

  const stopWords = new Set([
    "the",
    "and",
    "you",
    "are",
    "but",
    "with",
    "this",
    "that",
    "for",
    "was",
    "have",
    "has",
    "from",
    "not",
    "can",
    "will",
    "would",
    "could",
    "should",
    "just",
    "like",
    "know",
    "get",
    "got",
    "now",
    "one",
    "way",
    "all",
    "any",
    "may",
    "say",
    "she",
    "her",
    "him",
    "his",
    "how",
    "its",
    "our",
    "out",
    "day",
    "use",
    "man",
    "new",
    "see",
    "two",
    "who",
    "boy",
    "did",
    "don",
    "let",
    "put",
    "too",
    "old",
    "why",
    "yes",
    "yet",
    "come",
    "omitted",
    "sticker",
    "image",
    "video",
    "audio",
    "message",
    "what",
    "call",
    "missed",
    "voice",
    "haha",
    "hehe",
    "lol",
    "okay",
    "yeah",
    "yep",
    "nah",
    "hmm",
    "ohh",
    "ahh",
    "wow",
    "hey",
    "bye",
    "thanks",
  ]);

  for (const msg of messages) {
    senderCount[msg.sender] = (senderCount[msg.sender] || 0) + 1;

    if (msg.emojis && msg.emojis.length > 0) {
      for (const emoji of msg.emojis) {
        emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
        totalEmojis++;
      }
    }

    const words = msg.message
      .toLowerCase()

      .replace(/https?:\/\/[^\s]+/g, "")

      .replace(/[\+]?[\d\s\-\(\)]{10,}/g, "")

      .replace(/[^a-zA-Z0-9\s]/g, " ")

      .split(/\s+/)
      .filter((word) => {
        return (
          word.length > 2 &&
          !stopWords.has(word) &&
          !word.match(/^\d+$/) &&
          word.length < 20
        );
      });

    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }

  const topSenders: SenderStat[] = Object.entries(senderCount)
    .map(([sender, count]) => ({
      sender,
      count,
      percentage: ((count / totalMessages) * 100).toFixed(1) + "%",
    }))
    .sort((a, b) => b.count - a.count);

  const mostUsedEmojis: CountItem[] = Object.entries(emojiCount)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const mostCommonWords: CountItem[] = Object.entries(wordCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalMessages,
    conversationStarted,
    totalEmojis,
    topSenders,
    mostUsedEmojis,
    mostCommonWords,
  };
};
