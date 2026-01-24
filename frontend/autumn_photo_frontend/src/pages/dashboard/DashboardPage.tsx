import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosinstances";
import Navbar from "../../app/Navbar";

export default function Dashboard() {
  const role = useSelector((s: any) => s.auth.role);
  const email = useSelector((s: any) => s.auth.email);
  const navigate = useNavigate();
  
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDatetime, setEditStartDatetime] = useState("");
  const [editEndDatetime, setEditEndDatetime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editCover, setEditCover] = useState<File | null>(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/events/");
      // Filter events where user is coordinator
      const allEvents = Array.isArray(res.data) ? res.data : res.data.results || [];
      setMyEvents(allEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setEditName(event.name || "");
    setEditDescription(event.description || "");
    setEditStartDatetime(event.start_datetime || "");
    setEditEndDatetime(event.end_datetime || "");
    setEditLocation(event.location || "");
    setEditIsPublic(event.is_public !== false);
    setEditCover(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEvent(null);
    setError("");
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", editName);
      form.append("description", editDescription);
      if (editStartDatetime) form.append("start_datetime", editStartDatetime);
      if (editEndDatetime) form.append("end_datetime", editEndDatetime);
      form.append("location", editLocation);
      form.append("is_public", editIsPublic ? "true" : "false");
      if (editCover) form.append("cover_upload", editCover);

      await axios.patch(`/events/${editingEvent.id}/`, form);
      setLoading(false);
      closeEditModal();
      await fetchMyEvents();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data || String(err));
    }
  };

  if (role === "ADMIN") {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <Navbar />
        <div className="px-6 md:px-10 lg:px-16 py-8">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-400">You are an admin. Please use the Admin Panel to manage events.</p>
        </div>
      </div>
    );
  }

  if (role !== "EVENT_COORDINATOR") {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <Navbar />
        <div className="px-6 md:px-10 lg:px-16 py-8">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-400">Welcome, {email}!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Navbar />
      <div className="px-6 md:px-10 lg:px-16 py-8 md:py-10">
        <h1 className="text-3xl font-bold mb-6">Event Coordinator Dashboard</h1>

        <div className="mb-8 p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">My Events</h2>
          {loading ? (
            <div className="text-gray-400">Loading events...</div>
          ) : (
            <div className="space-y-3">
              {myEvents.length === 0 && (
                <div className="text-gray-400 text-center py-8">
                  No events assigned to you yet.
                </div>
              )}
              {myEvents.map((ev: any) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{ev.name}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {ev.start_datetime} — {ev.end_datetime}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{ev.location}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/events`)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(ev)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Event</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-white text-3xl leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={submitEdit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 rounded bg-red-900/50 border border-red-700 text-red-200">
                    {JSON.stringify(error)}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Event Name</label>
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editStartDatetime}
                      onChange={(e) => setEditStartDatetime(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editEndDatetime}
                      onChange={(e) => setEditEndDatetime(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cover Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditCover(e.target.files?.[0] || null)}
                    className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to keep current cover</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editPublic"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="editPublic" className="text-sm font-medium cursor-pointer">
                    Public Event
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Updating..." : "Update Event"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
