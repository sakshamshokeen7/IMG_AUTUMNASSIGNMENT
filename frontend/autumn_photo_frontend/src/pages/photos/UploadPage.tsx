import React, { useCallback, useEffect, useState } from "react";
import { getEvents } from "../../services/eventservice";
import photoService from "../../services/photoService";

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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Photos</h2>

      <div className="mb-4">
        <label className="block mb-1">Event</label>
        <select
          className="bg-slate-800 p-2 rounded"
          value={selectedEvent ?? ""}
          onChange={(e) => setSelectedEvent(Number(e.target.value))}
        >
          <option value="">Select event</option>
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
        className={`border-2 rounded p-8 mb-4 ${dragOver ? "border-indigo-400 bg-slate-900" : "border-dashed border-slate-600"}`}
      >
        <p className="text-center text-slate-300">Drag & drop photos here, or</p>
        <div className="text-center mt-3">
          <input type="file" multiple accept="image/*" onChange={onFileChange} />
        </div>
      </div>

      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium">Files</h3>
          <ul>
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-4 py-2">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-28 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="text-sm">{f.name}</div>
                  <div className="text-xs text-slate-400">{(f.size / 1024).toFixed(1)} KB</div>
                </div>
                <button className="text-red-400" onClick={() => removeFile(i)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <div className="mb-4 text-sm text-yellow-200">{message}</div>}

      <div>
        <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 bg-indigo-600 rounded">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
