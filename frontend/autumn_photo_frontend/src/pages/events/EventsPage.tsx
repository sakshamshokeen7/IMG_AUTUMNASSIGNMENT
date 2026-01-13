import { useEffect, useState, type SetStateAction } from "react";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";
import PhotoModal from "../../components/PhotoModal";
import { getMediaUrl } from "../../utils/media";
import { Search, ArrowLeft, Grid3x3, Columns, Images, Calendar, Users, Sparkles } from "lucide-react";

interface Event {
  cover_upload: string;
  id: number;
  name: string;
  description: string;
  cover_photo?: string;
  coordinators?: Array<any>;
}

interface Photo {
  thumbnail_file: string;
  id: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [view, setView] = useState("grid");
  const [openPhotoId, setOpenPhotoId] = useState<number | null>(null);
  const [openPhotoUrl, setOpenPhotoUrl] = useState<string>("");


  const fetchEvents = async (query = "") => {
    try {
      const res = await axios.get(`/events/?search=${query}`);
      setEvents(res.data);
    } catch (e) {
      console.log(e);
    }
  };

 const fetchPhotos = async (id:any) => {
  try {
    const res = await axios.get(`/events/${id}/photos/`);
    console.log("Photos -> ", res.data.photos);
    setPhotos(res.data.photos || []);
  } catch (e) {
    console.error('Failed to fetch photos for event', id, e);
    setPhotos([]);
  }
};



  useEffect(() => {
    fetchEvents(); 
  }, []);

  const handleSelectEvent = (ev: SetStateAction<Event | null>) => {
    setSelectedEvent(ev);
    if (ev && typeof ev === "object" && "id" in ev) {
      fetchPhotos(ev.id);
    }
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Navbar />
      <div className="relative z-10 px-6 md:px-10 lg:px-16 py-8 md:py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-dark-600 to-black-600 shadow-lg shadow-white-600/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Events
            </h1>
            <p className="text-gray-400 mt-1">Discover and explore upcoming events</p>
          </div>
        </div>
        <div className="max-w-2xl mb-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              onKeyDown={(e) => e.key === "Enter" && fetchEvents(search)}
              type="text"
              placeholder="Search events by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
            />
            <button
              onClick={() => fetchEvents(search)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-lg bg-green-600 transition-all duration-200 font-semibold shadow-lg"
            >
              Search
            </button>
          </div>
        </div>
        {!selectedEvent && (
          <div>
            {events.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => handleSelectEvent(ev)}
                    className="group cursor-pointer rounded-2xl border border-gray-800 hover:border-white-500/50 transition-all duration-300 bg-gray-900/50 backdrop-blur-sm overflow-hidden hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden h-52">
                      <img
                        src={getMediaUrl(ev.cover) || "/placeholder_event.jpg"}
                        alt={ev.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium">
                        <Users className="w-3.5 h-3.5" />
                        <span>{ev.coordinators?.length || 0}</span>
                      </div>

                     
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white-600/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Upcoming</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-white-400 transition-colors line-clamp-1">
                        {ev.name}
                      </h2>
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                      
                      <div className="mt-4 flex items-center text-sm text-white-400 font-medium">
                        <span>View photos</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 text-xl">No events found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}

       
        {selectedEvent && (
          <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
              <div>
                <button
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-white-300 transition-colors mb-3 group"
                  onClick={() => {
                    setSelectedEvent(null);
                    setPhotos([]);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back to events</span>
                </button>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {selectedEvent.name}
                </h2>
                <p className="text-gray-400 mt-2">{photos.length} photos available</p>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <button
                  onClick={() => setView("grid")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    view === "grid"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setView("masonry")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    view === "masonry"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span className="hidden sm:inline">Masonry</span>
                </button>
                <button
                  onClick={() => setView("carousel")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    view === "carousel"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Images className="w-4 h-4" />
                  <span className="hidden sm:inline">Carousel</span>
                </button>
              </div>
            </div>
            {photos.length > 0 ? (
              <>
                {view === "grid" && (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                        className="group relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/20 cursor-pointer"
                      >
                        <img src={getMediaUrl(p.thumbnail_file)}
                          alt="Event photo"
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                )}

                {view === "masonry" && (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-6">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                        className="group relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/20 cursor-pointer mb-6 break-inside-avoid"
                      >
                        <img
                          src={getMediaUrl(p.thumbnail_file)}
                          alt="Event photo"
                          className="w-full group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                )}

                {view === "carousel" && (
                  <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                      {photos.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                          className="group relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/20 flex-shrink-0 snap-center"
                        >
                          <img
                            src={getMediaUrl(p.thumbnail_file)}
                            alt="Event photo"
                            className="h-80 w-auto object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {openPhotoId && (
                  <PhotoModal
                    photoId={openPhotoId}
                    photoUrl={openPhotoUrl}
                    onClose={() => { setOpenPhotoId(null); setOpenPhotoUrl(""); }}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
                  <Images className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 text-xl">No photos found</p>
                <p className="text-gray-500 text-sm mt-2">Photos will appear here once uploaded</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}