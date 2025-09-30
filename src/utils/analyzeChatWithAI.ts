import { genAI } from "./geminiClient";
import type { ChatStats } from "./getChatStats";
import type { ChatMessage } from "./parseChat";

function generateChatContext(stats: ChatStats, messages?: ChatMessage[]): string {
  let context = `WhatsApp Chat Statistics:

Total Messages: ${stats.totalMessages}
Duration: ${stats.conversationStarted}

Top Participants:
${stats.topSenders.slice(0, 5).map((s, i) => 
  `${i + 1}. ${s.sender}: ${s.count} messages (${s.percentage})`
).join('\n')}

Emojis Used:
Total: ${stats.totalEmojis}
Most used: ${stats.mostUsedEmojis.map(e => `${e.emoji} (${e.count})`).join(', ')}

Common Words:
${stats.mostCommonWords.map(w => `${w.word} (${w.count})`).join(', ')}
`;

  if (messages && messages.length > 0) {
    context += `\n\nSample Messages (first 20):
${messages.slice(0, 20).map(m => 
  `[${m.timeStamp}] ${m.sender}: ${m.message.substring(0, 100)}${m.message.length > 100 ? '...' : ''}`
).join('\n')}`;
  }

  return context;
}

export async function analyzeConnection(stats: ChatStats, messages?: ChatMessage[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const context = generateChatContext(stats, messages);
    const prompt = `${context}

You're a perceptive friend analyzing this WhatsApp chat. Write in a warm, conversational tone that feels genuine and insightful.

CRITICAL RULES:
- Never assume gender. Use names or "they/them"
- Only discuss what the actual data shows
- No bullet points, asterisks, or numbered lists
- Write in flowing paragraphs like natural speech

Analyze their connection:
1. Rate the relationship strength (1-10) based on message frequency, balance, and emoji usage
2. Describe who's driving the conversation - is it balanced or one-sided?
3. What's the emotional vibe? Look at emoji patterns and word choices
4. What does the communication style reveal about their dynamic?

Write 2 engaging paragraphs that feel like insider observations, not a formal analysis. Be specific, use examples from the data, and make it interesting to read.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Failed to analyze connection.";
  }
}

export async function analyzePersonalities(stats: ChatStats, messages?: ChatMessage[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const context = generateChatContext(stats, messages);
    const topParticipants = stats.topSenders.slice(0, 3);
    
    const prompt = `${context}

You're describing ${topParticipants.map(s => s.sender).join(' and ')} to someone who's never met them. Write like you're giving the inside scoop to a friend.

CRITICAL RULES:
- Never assume gender. Use names or "they/them"
- Base everything on actual messaging patterns
- No bullet points, asterisks, or lists
- Write naturally, like casual conversation

For each person, discuss:
- Their texting style (frequent vs sparse, long vs short messages)
- Emoji personality (which ones they gravitate to and what that suggests)
- Communication patterns (initiator vs responder, expressive vs reserved)
- What their word choices reveal about them

Make it vivid and specific. Reference actual numbers from the data. Write 2 paragraphs that capture their unique communication fingerprints.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Failed to analyze personalities.";
  }
}

export async function generateFunFacts(stats: ChatStats, messages?: ChatMessage[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const context = generateChatContext(stats, messages);
    const prompt = `${context}

You've just analyzed this chat and found some genuinely interesting patterns. Share 3 top observations that would make someone go "wait, really?" or "that's actually fascinating."

CRITICAL RULES:
- Never assume gender. Use names or "they/them"
- Every fact must be supported by actual data
- No numbering, bullets, or asterisks
- Write each as its own short, punchy paragraph
- Separate with blank lines

What makes a good observation:
- Surprising contrasts (e.g., "Despite X, they actually Y")
- Specific numbers that tell a story
- Emoji patterns that reveal something unexpected
- Word frequencies that hint at topics or dynamics
- Message distribution that shows unique patterns

Make each fact conversational but informative. Think "wow that's interesting" not "here's a data point." Be specific with numbers and examples.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Failed to generate fun facts.";
  }
}

export async function analyzePatterns(stats: ChatStats, messages?: ChatMessage[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const context = generateChatContext(stats, messages);
    const prompt = `${context}

You're spotting the underlying patterns in how these people communicate. Think like a detective finding clues in the data.

CRITICAL RULES:
- Never assume gender. Use names or "they/them"
- Focus on verifiable patterns in the data
- No lists, bullets, or formal structure
- Write in natural, flowing paragraphs

Look for:
- Dominant conversation themes (what are those common words really telling us?)
- Communication rhythms (who initiates, who responds, what's the balance?)
- Emotional patterns (emoji usage evolution, sentiment shifts)
- Unique habits or quirks visible in their messaging style
- What the message distribution reveals about their dynamic

Give 3 meaty insights in conversational paragraphs. Connect the dots between different data points. Make it feel like you're revealing something non-obvious about how they interact.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Failed to analyze patterns.";
  }
}

export async function customAnalysis(
  userPrompt: string, 
  stats: ChatStats, 
  messages?: ChatMessage[]
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const context = generateChatContext(stats, messages);
    const prompt = `${context}

USER QUESTION: ${userPrompt}

Answer this question directly using only the chat data provided. Write naturally like you're texting back a friend.

RULES:
- Never assume gender
- Only reference actual data
- No lists or formal structure
- Be specific with numbers and examples when relevant
- If the data doesn't clearly answer the question, say so honestly

Give a clear, conversational answer that addresses exactly what they asked.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Failed to generate analysis.";
  }
}