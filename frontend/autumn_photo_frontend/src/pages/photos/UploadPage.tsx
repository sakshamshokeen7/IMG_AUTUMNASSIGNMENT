import React, { useCallback, useEffect, useState } from "react";
import { getEvents } from "../../services/eventservice";
import photoService from "../../services/photoService";
import { Upload, X, Image, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEvents();
        setEvents(data.events || data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const onDrop = useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
    setDragOver(false);
    const dropped = Array.from(ev.dataTransfer.files || []);
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const onFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(ev.target.files)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedEvent) return setMessage("Please select an event");
    if (files.length === 0) return setMessage("Please add files to upload");

    setUploading(true);
    setMessage(null);
    try {
      const res = await photoService.uploadMultiplePhotos(selectedEvent, files);
      setMessage(`Uploaded ${res.uploaded_count} photos`);
      setFiles([]);
    } catch (e: any) {
      console.error(e);
      setMessage(e?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
    
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 px-6 md:px-10 lg:px-16 py-8 md:py-10 max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Upload Photos
            </h2>
            <p className="text-gray-400 mt-1">Upload event photos to your gallery</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
         
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Event
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={selectedEvent ?? ""}
                onChange={(e) => setSelectedEvent(Number(e.target.value))}
              >
                <option value="">Choose an event...</option>
                {events.map((ev: any) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`relative p-12 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                dragOver
                  ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                  : "border-gray-700 bg-gray-900/30 hover:border-gray-600"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${
                  dragOver ? "bg-purple-600/20" : "bg-gray-800/50"
                }`}>
                  <Upload className={`w-12 h-12 transition-colors duration-300 ${
                    dragOver ? "text-purple-400" : "text-gray-400"
                  }`} />
                </div>
                
                <p className="text-lg font-medium text-gray-300 mb-2">
                  Drag & drop your photos here
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  or click to browse from your computer
                </p>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-purple-600/30">
                    <Image className="w-5 h-5" />
                    Browse Files
                  </span>
                </label>

                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </div>

           
            {message && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                message.includes("Uploaded")
                  ? "bg-green-500/10 border-green-500/50 text-green-400"
                  : "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
              }`}>
                {message.includes("Uploaded") ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedEvent || files.length === 0}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-purple-600/30 transition-all duration-200 group"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                  <span>Upload {files.length > 0 ? `${files.length} Photo${files.length > 1 ? 's' : ''}` : 'Photos'}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-200">
                Selected Files
              </h3>
              {files.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-sm font-medium">
                  {files.length} file{files.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {files.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200"
                  >
                  
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                  
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate mb-1">
                        {f.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{(f.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{f.type.split('/')[1]?.toUpperCase()}</span>
                      </div>
                    </div>

                   
                    <button
                      onClick={() => removeFile(i)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-gray-800/50 mb-4">
                  <Image className="w-12 h-12 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg font-medium mb-2">No files selected</p>
                <p className="text-gray-500 text-sm">
                  Add photos to see them here
                </p>
              </div>
            )}
          </div>
        </div>

        
        {files.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm text-center">
              <p className="text-2xl font-bold text-purple-400">{files.length}</p>
              <p className="text-sm text-gray-400 mt-1">Total Files</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm text-center">
              <p className="text-2xl font-bold text-indigo-400">
                {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-400 mt-1">Total Size</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm text-center">
              <p className="text-2xl font-bold text-green-400">
                {selectedEvent ? "Ready" : "Pending"}
              </p>
              <p className="text-sm text-gray-400 mt-1">Upload Status</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}