import { useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

const MAX_UPLOAD_SIZE_MB = 5;
const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ReceiptUploadPanel = ({ onUpload, isUploading }) => {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP receipt images are allowed");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      toast.error(`Receipt image must be less than ${MAX_UPLOAD_SIZE_MB} MB`);
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    try {
      await onUpload(selectedFile);

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const fileSizeMb = selectedFile
    ? (selectedFile.size / 1024 / 1024).toFixed(2)
    : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            AI receipt scanner
          </span>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Scan Receipts
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Upload receipt images, let AI extract transaction details, then
            review the draft before using it.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-6 text-center transition hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <ImagePlus size={28} className="text-emerald-700" />
            <span className="mt-3 text-sm font-semibold text-slate-900">
              Choose receipt image
            </span>
            <span className="mt-1 text-xs text-slate-500">
              Use form field name receipt on backend
            </span>
          </button>

          {selectedFile && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {fileSizeMb} MB
              </p>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <UploadCloud size={17} />
                )}
                {isUploading ? "Uploading..." : "Upload and parse"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
