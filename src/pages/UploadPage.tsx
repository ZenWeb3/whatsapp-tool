import { useState } from "react";
import FileUploader from "../components/FileUploader";
import { useNavigate } from "react-router-dom";
import { ParseChat } from "../utils/parseChat";
import { getChatStats } from "../utils/getChatStats";
import * as JSZip from "jszip";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileContent(null);
      setError(null);
      return;
    }

    const isTxt = file.name.endsWith(".txt");
    const isZip = file.name.endsWith(".zip");

    if (!isTxt && !isZip) {
      setError("Please upload a .txt or .zip file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File is too large. Please upload a file smaller than 50MB");
      return;
    }

    setSelectedFile(file);
    setError(null);

    try {
      if (isTxt) {
        const reader = new FileReader();
        reader.onload = () => setFileContent(reader.result as string);
        reader.onerror = () => {
          setError("Error reading file. Please try again.");
          setFileContent(null);
        };
        reader.readAsText(file, "UTF-8");
      } else if (isZip) {
        const zip = await JSZip.loadAsync(file);
        const txtFileName = Object.keys(zip.files).find((name) =>
          name.endsWith(".txt")
        );

        if (!txtFileName) {
          setError("No .txt file found inside the zip");
          setFileContent(null);
          return;
        }

        const txtContent = await zip.files[txtFileName].async("string");
        setFileContent(txtContent);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to read the file. Make sure it is valid.");
      setFileContent(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !fileContent) return;

    setLoading(true);
    setError(null);

    try {
      const cleanContent = fileContent
        .replace(/^\uFEFF/, "")
        .replace(/^\u200E/, "");

      await new Promise((resolve) => setTimeout(resolve, 500));

      const messages = ParseChat(cleanContent);

      if (messages.length === 0) {
        setError(
          "No messages found. Make sure you uploaded a WhatsApp chat export in the format: [MM/DD/YY, HH:MM:SS AM/PM] Sender: Message"
        );
        setLoading(false);
        return;
      }

      const stats = getChatStats(messages);

      navigate("/dashboard", {
        state: { stats, messages: messages.slice(0, 100) },
      });
    } catch (err) {
      console.error("Error analyzing chat file:", err);
      setError(
        "Error analyzing chat file. Please make sure it's a valid WhatsApp export."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="text-xl text-white flex justify-center items-center min-h-screen px-4 bg-[#14011d]">
      <div className="flex flex-col gap-6 max-w-xl items-center">
        <h1 className="text-[24px] font-bold md:text-4xl lg:text-[45px] mb-2">
          WhatsApp Chat Analyzer
        </h1>
        <p className="text-center text-gray-300 text-sm md:text-base">
          Upload your exported WhatsApp{" "}
          <span className="font-mono text-green-500">.txt</span> or{" "}
          <span className="font-mono text-green-500">.zip</span> file and we'll
          analyze your conversations
        </p>

        <FileUploader onFileSelect={handleFileSelect} />

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || loading || !!error}
          title={
            !selectedFile
              ? "Upload a file first"
              : error
              ? "Fix the error first"
              : "Analyze WhatsApp chat"
          }
          className={`mt-4 w-3/5 px-6 py-3 rounded-lg font-medium transition shadow-md ${
            selectedFile && !error && !loading
              ? "bg-pink-500 hover:bg-pink-600 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze Chat"
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-4">
            Your file never leaves your device. 100% private.
          </p>
        </div>
      </div>
    </main>
  );
};

export default UploadPage;
