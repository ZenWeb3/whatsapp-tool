import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  LucideMessageCircle as Message,
  CalendarIcon,
  HeartIcon,
  Users,
  Smile,
  Brain,
  Send,
  Spotlight,
  Loader2,
  VenetianMask,
  MessageCircleQuestionMark,
  Laugh,
} from "lucide-react";
import {
  analyzeConnection,
  analyzePersonalities,
  generateFunFacts,
  analyzePatterns,
  customAnalysis,
} from "../utils/analyzeChatWithAI";

const Dashboard = () => {
  const location = useLocation();
  const { stats, messages } = location.state || {};

  const [connectionAnalysis, setConnectionAnalysis] = useState<string>("");
  const [personalityInsights, setPersonalityInsights] = useState<string>("");
  const [funFacts, setFunFacts] = useState<string>("");
  const [patterns, setPatterns] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [customResponse, setCustomResponse] = useState<string>("");

  const [loadingConnection, setLoadingConnection] = useState(true);
  const [loadingPersonality, setLoadingPersonality] = useState(true);
  const [loadingFunFacts, setLoadingFunFacts] = useState(true);
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [loadingCustom, setLoadingCustom] = useState(false);

  if (!stats) {
    return (
      <p className="text-white text-center mt-20">
        No data available. Upload a chat first.
      </p>
    );
  }

  const topTwoSenders = stats.topSenders.slice(0, 5);
  const mainChatParticipant = topTwoSenders[0]?.sender || "Unknown";

  useEffect(() => {
    analyzeConnection(stats, messages)
      .then(setConnectionAnalysis)
      .finally(() => setLoadingConnection(false));

    analyzePersonalities(stats, messages)
      .then(setPersonalityInsights)
      .finally(() => setLoadingPersonality(false));

    generateFunFacts(stats, messages)
      .then(setFunFacts)
      .finally(() => setLoadingFunFacts(false));

    analyzePatterns(stats, messages)
      .then(setPatterns)
      .finally(() => setLoadingPatterns(false));
  }, [stats, messages]);

  const handleCustomAnalysis = async () => {
    if (!customPrompt.trim()) return;

    setLoadingCustom(true);
    try {
      const response = await customAnalysis(customPrompt, stats, messages);
      setCustomResponse(response);
    } catch (err) {
      console.error("Custom analysis error:", err);
      setCustomResponse("Failed to generate analysis. Please try again.");
    } finally {
      setLoadingCustom(false);
    }
  };

  return (
    <main className="bg-[#14011d] border-gray-600/50 min-h-screen flex flex-col font-mono text-white">
      <div className="mx-5 md:mx-10 lg:mx-40 my-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-6">
          <div
            className="flex flex-row gap-2 items-center hover:cursor-pointer"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
            <p className="text-sm md:text-base">Back</p>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg md:text-3xl mb-1 md:mb-2">
              Chat Analysis Result
            </h1>
            <p className="text-gray-400 text-base md:text-lg break-words">
              WhatsApp Chat with {mainChatParticipant}.txt
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6">
          <div className="bg-[#1e0a2c] border border-gray-600/50 p-4 md:p-6 rounded-lg shadow-md flex-1 min-w-[220px] flex flex-col">
            <div className="flex justify-between items-center w-full">
              <p className="text-gray-400 text-sm md:text-base">
                Total Messages
              </p>
              <Message className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="mt-3 md:mt-6">
              <p className="text-xl md:text-3xl font-bold text-white">
                {stats.totalMessages}
              </p>
            </div>
          </div>

          <div className="bg-[#1e0a2c] border border-gray-600/50 p-4 md:p-6 rounded-lg shadow-md flex-1 min-w-[220px] flex flex-col">
            <div className="flex justify-between items-center w-full">
              <p className="text-gray-400 text-sm md:text-base">
                Conversation Started
              </p>
              <CalendarIcon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="mt-3 md:mt-6">
              <p className="text-xl md:text-3xl font-bold text-white">
                {stats.conversationStarted.split(" ")[0]}
              </p>
            </div>
          </div>

          <div className="bg-[#1e0a2c] border border-gray-600/50 p-4 md:p-6 rounded-lg shadow-md flex-1 min-w-[220px] flex flex-col">
            <div className="flex justify-between items-center w-full">
              <p className="text-gray-400 text-sm md:text-base">Total Emojis</p>
              <Smile className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="mt-3 md:mt-6">
              <p className="text-xl md:text-3xl font-bold text-white">
                {stats.totalEmojis}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 md:mt-6 flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="bg-[#1e0a2c] border-gray-600/50 border p-6 rounded-lg flex-[0.8] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              <h1 className="font-bold text-white text-lg">Who Talks More</h1>
            </div>

            {topTwoSenders.map((sender: any) => {
              const percentage = parseFloat(sender.percentage);
              return (
                <div key={sender.sender} className="mb-4">
                  <div className="flex justify-between my-2">
                    <p className="text-gray-300 font-bold mb-1">
                      {sender.sender}
                    </p>
                    <span className="text-sm font-mono">
                      {sender.count} Messages ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-pink-500 h-4 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#1e0a2c] border-gray-600/50 border p-6 rounded-lg flex-[0.37] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <HeartIcon />
              <h1 className="font-bold text-white text-lg">Most Used Emojis</h1>
            </div>
            <div className="flex flex-col flex-wrap gap-3 mt-2">
              {stats.mostUsedEmojis.map((emoji: any) => (
                <div
                  key={emoji.emoji}
                  className="flex justify-between text-base text-gray-400"
                >
                  <span className="text-2xl">{emoji.emoji}</span>
                  <span className="text-sm text-white mt-1">{emoji.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-[#1e0a2c] border border-gray-600/50 p-6 rounded-lg">
          <h1 className="text-white font-bold text-lg mb-4">
            Most Common Words
          </h1>
          <div className="flex flex-wrap gap-3">
            {stats.mostCommonWords.map((w: any) => (
              <span
                key={w.word}
                className="bg-gray-700 text-white text-sm px-3 py-1 rounded-full"
              >
                {w.word} ({w.count})
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6 ">
            AI-Powered Insights
          </h2>

          <div className="bg-[#1e0a2c] border border-gray-600/50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain />
              Connection Analysis
            </h3>
            {loadingConnection ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            ) : (
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {connectionAnalysis}
              </div>
            )}
          </div>

          <div className="bg-[#1e0a2c] border border-gray-600/50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <VenetianMask /> Personality Insights
            </h3>
            {loadingPersonality ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            ) : (
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {personalityInsights}
              </div>
            )}
          </div>

          <div className="bg-[#1e0a2c] border border-gray-600/50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Laugh />
              Fun Facts
            </h3>
            {loadingFunFacts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            ) : (
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {funFacts}
              </div>
            )}
          </div>

          <div className="bg-[#1e0a2c] border border-gray-600/50 p-6 rounded-lg mb-6 ">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Spotlight /> Other Patterns
            </h3>
            {loadingPatterns ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            ) : (
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {patterns}
              </div>
            )}
          </div>

          <div className="bg-[#1e0a2c] border border-gray-600/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircleQuestionMark /> Ask a Custom Question
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Ask anything about this chat and get AI-powered insights!
            </p>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCustomAnalysis()}
                placeholder="e.g., What topics do they talk about most?"
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
                disabled={loadingCustom}
              />
              <button
                onClick={handleCustomAnalysis}
                disabled={loadingCustom || !customPrompt.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  loadingCustom || !customPrompt.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600 text-white"
                }`}
              >
                {loadingCustom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Ask
                  </>
                )}
              </button>
            </div>

            {customResponse && (
              <div className="mt-6 bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {customResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
