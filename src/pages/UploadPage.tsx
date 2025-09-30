import { useState } from "react";
import FileUploader from "../components/FileUploader";
import { useNavigate } from "react-router-dom";
import { ParseChat } from "../utils/parseChat";
import { getChatStats } from "../utils/getChatStats";
import * as JSZip from "jszip"; // use default import
import toast from "react-hot-toast";

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
      toast.error("❌ Invalid file format. Upload .txt or .zip");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File is too large. Please upload a file smaller than 50MB");
      toast.error("❌ File too large (max 50MB)");
      return;
    }

    setSelectedFile(file);
    setError(null);

    try {
      if (isTxt) {
        const reader = new FileReader();
        reader.onload = () => {
          setFileContent(reader.result as string);
          toast.success(` File uploaded successfully!`, { id: "upload" });
        };
        reader.onerror = () => {
          setError("Error reading file. Please try again.");
          toast.error(" Failed to read file", { id: "read-error" });
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
          toast.error(" No .txt file found in ZIP", { id: "no-txt" });
          setFileContent(null);
          return;
        }

        const txtContent = await zip.files[txtFileName].async("string");
        setFileContent(txtContent);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to read the file. Make sure it is valid.");
      toast.error(" Failed to read file", { id: "catch-error" });
      setFileContent(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !fileContent) return;

    setLoading(true);
    setError(null);

    try {
      const cleanContent = fileContent
        .replace(/^\uFEFF/g, "")
        .replace(/^\u200E/g, "")
        .replace(/^\u200F/g, "");

      await new Promise((resolve) => setTimeout(resolve, 500));

      const messages = ParseChat(cleanContent);

      if (messages.length === 0) {
        setError(
          "No messages found. Please make sure you exported your WhatsApp chat correctly."
        );
        toast.error("❌ No messages found in chat file");
        setLoading(false);
        return;
      }

      const stats = getChatStats(messages);

      toast.success("✅ Chat analyzed successfully!");
      navigate("/dashboard", {
        state: { stats, messages: messages.slice(0, 100) },
      });
    } catch (err) {
      console.error("Error analyzing chat file:", err);
      setError("Error analyzing chat file. Please make sure it's valid.");
      toast.error("❌ Error analyzing chat file");
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
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg max-w-md">
            <p className="text-red-200 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || loading || !!error}
          className={`mt-4 w-3/5 px-6 py-3 rounded-lg font-medium transition shadow-md ${
            selectedFile && !error && !loading
              ? "bg-pink-500 hover:bg-pink-600 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze Chat"}
        </button>
      </div>
    </main>
  );
};

export default UploadPage;
