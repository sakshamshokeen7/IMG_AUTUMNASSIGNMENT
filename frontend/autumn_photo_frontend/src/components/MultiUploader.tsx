import React, { useState, useRef, useEffect } from "react";
import axios from "../services/axiosinstances";

export default function MultiUploader({ onUploaded }: { onUploaded?: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [eventId, setEventId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/events/');
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setEvents(data);
        if (data.length) setEventId(data[0].id);
      } catch (e) {
      }
    })();
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    const list = Array.from(dt.files).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...list]);
  };

  const upload = async () => {
    if (!eventId) {
      setMessage('Please select an event');
      return;
    }
    if (files.length === 0) {
      setMessage('Select files first');
      return;
    }
    setUploading(true);
    setMessage(null);

    const form = new FormData();
    form.append('event_id', String(eventId));
    files.forEach(f => form.append('files', f));

    try {
      const res = await axios.post('/photos/upload/multiple/', form);
      setMessage(res.data.message || 'Uploaded');
      setFiles([]);
      onUploaded && onUploaded();
    } catch (err:any) {
      setMessage(err.response?.data || String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm"
          onDragOver={(e)=>{e.preventDefault(); setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${dragOver ? 'bg-purple-600/20' : 'bg-gray-800/50'}`}>
              <svg className={`w-12 h-12 ${dragOver ? 'text-black-400' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" />
            </div>
            <p className="text-lg font-medium text-gray-300 mb-2">Drag & drop your photos here</p>
            <p className="text-sm text-gray-500 mb-6">or click to browse from your computer</p>

            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e)=>{
                  const list = Array.from(e.target.files || []).filter(f=>f.type.startsWith('image/'));
                  setFiles(prev=>[...prev,...list]);
                }}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-purple-600/30">
                Choose files
              </span>
            </label>

            <p className="text-xs text-gray-500 mt-4">Supported formats: JPG, PNG, GIF, WebP</p>
          </div>
        </div>

        {message && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${message.includes('Uploaded') ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'}`}>
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        <button
          onClick={upload}
          disabled={uploading || !eventId || files.length === 0}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-purple-600/30 transition-all duration-200"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? `${files.length} Photo${files.length>1?'s':''}` : 'Photos'}`}
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-200">Selected Files</h3>
          {files.length > 0 && (<span className="px-3 py-1 rounded-full bg-purple-600/20 text-black-400 text-sm font-medium">{files.length} file{files.length>1?'s':''}</span>)}
        </div>

        {files.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
            {files.map((f, i) => (
              <div key={i} className="group flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-white-500/50 transition-all duration-200">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate mb-1">{f.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{(f.size/1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>{f.type.split('/')[1]?.toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={()=>setFiles(prev=>prev.filter((_, idx)=>idx!==i))} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">Remove</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-gray-800/50 mb-4" />
            <p className="text-gray-400 text-lg font-medium mb-2">No files selected</p>
            <p className="text-gray-500 text-sm">Add photos to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
}
