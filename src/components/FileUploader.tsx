import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File | null, content?: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any) => {
      if (fileRejections.length > 0) {
        setError("Only .txt and .zip files are allowed");
        return;
      }

      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        setError(null);
        onFileSelect(uploadedFile);
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          onFileSelect(uploadedFile, text);
        };
        reader.onerror = () => {
          setError("Error reading file");
        };
        reader.readAsText(uploadedFile);
      }
    },
    [onFileSelect]
  );

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    onFileSelect(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"] , "application/zip": [".zip"]},
    multiple: false,
  });

  return (
<div
  {...getRootProps()}
  role="button"
  tabIndex={0}
  aria-label="Upload WhatsApp chat file"
  className={`flex font-mono flex-col items-center justify-center gap-4 border-2 border-dashed rounded-xl cursor-pointer transition transform
    w-full max-w-sm sm:max-w-md md:w-[350px] md:h-[300px] h-[220px] sm:h-[250px] p-4 sm:p-6 text-center
    ${
      isDragActive
        ? "scale-105 border-pink-400 bg-pink-50/10"
        : file
        ? "border-green-400 bg-green-50/10"
        : "border-[#EC4186] hover:border-pink-400 hover:bg-pink-50/5"
    }`}
>
  <input {...getInputProps()} />

  {file ? (
    <CheckCircle className="w-12 h-12 text-green-400" />
  ) : (
    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-pink-400" />
  )}

  {file ? (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center gap-2 bg-green-900/30 px-3 py-1 rounded-lg w-full justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-sm text-green-300 truncate max-w-[120px] sm:max-w-[200px]">
            {file.name}
          </span>
          <span className="text-xs text-gray-400 shrink-0">
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
        <button
          onClick={removeFile}
          className="text-xs text-red-400 hover:underline shrink-0 ml-2"
        >
          Remove
        </button>
      </div>
      <p className="text-xs text-gray-400">File uploaded successfully</p>
    </div>
  ) : isDragActive ? (
    <p className="text-pink-400 font-medium text-sm sm:text-base">
      Drop your file here…
    </p>
  ) : (
    <p className="text-gray-300 text-xs sm:text-sm">
      Drag & drop your{" "}
      <span className="font-mono text-green-400">.txt</span> file <br />
      or <span className="text-pink-400 font-medium">click to browse</span>
    </p>
  )}

  {error && <p className="text-xs text-red-400">{error}</p>}
</div>

  );
};

export default FileUploader;
