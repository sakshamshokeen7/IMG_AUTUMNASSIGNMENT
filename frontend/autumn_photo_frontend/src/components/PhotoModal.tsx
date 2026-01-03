import React, { useEffect, useState } from "react";
import axios from "../services/axiosinstances";
import { Heart, Star, Download, Share2, X } from "lucide-react";

interface Props {
  photoId: number;
  photoUrl: string;
  onClose: () => void;
}

const PhotoModal: React.FC<Props> = ({ photoId, photoUrl, onClose }) => {
  const [detail, setDetail] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [favourited, setFavourited] = useState(false);
  const [tagUser, setTagUser] = useState("");

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/photos/${photoId}/`);
      const norm = (s: string | null | undefined) => {
        if (!s) return s;
        return s.startsWith("http") ? s : `http://127.0.0.1:8000${s}`;
      };
      const data = res.data;
      if (data?.original_file) data.original_file = norm(data.original_file);
      setDetail(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/photos/${photoId}/comments/`);
      setComments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchComments();
  }, [photoId]);

  const toggleLike = async () => {
    try {
      const res = await axios.post(`/photos/${photoId}/like/`);
      setLiked(res.data.liked ?? !liked);
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavourite = async () => {
    try {
      const res = await axios.post(`/photos/${photoId}/favourite/`);
      setFavourited(res.data.favourited ?? !favourited);
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`/photos/${photoId}/comments/add/`, { text: newComment });
      setNewComment("");
      fetchComments();
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const tagPerson = async () => {
    if (!tagUser.trim()) return;
    try {
      await axios.post(`/photos/${photoId}/tag/`, { tagged_user: tagUser });
      setTagUser("");
    } catch (e) {
      console.error(e);
    }
  };

  const downloadOriginal = async () => {
    try {
      const norm = (s: string | null | undefined) => {
        if (!s) return s;
        return s.startsWith("http") ? s : `http://127.0.0.1:8000${s}`;
      };
      const url = norm(detail?.original_file || photoUrl);
      const link = document.createElement("a");
      link.href = url || "";
      link.download = `photo_${photoId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
    }
  };

  const shareLink = async () => {
    try {
      const shareUrl = window.location.origin + `/photos/${photoId}`;
      await navigator.clipboard.writeText(shareUrl);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-900 text-white rounded-xl max-w-4xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-800">
          <div className="font-semibold">Photo</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800">
            <X />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:flex-1 bg-black flex items-center justify-center">
            <img src={detail?.original_file || photoUrl} alt="photo" className="max-h-[70vh] object-contain" />
          </div>

          <div className="w-full md:w-96 p-4 border-l border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={toggleLike} className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded">
                <Heart className="w-4 h-4" />
                <span>{detail?.likes_count ?? 0}</span>
              </button>

              <button onClick={toggleFavourite} className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded">
                <Star className="w-4 h-4" />
                <span>{detail?.favourites_count ?? 0}</span>
              </button>

              <button onClick={downloadOriginal} className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button onClick={shareLink} className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            <div className="mb-4">
              <div className="font-medium mb-2">Tag someone</div>
              <div className="flex gap-2">
                <input value={tagUser} onChange={(e)=>setTagUser(e.target.value)} placeholder="username or id" className="flex-1 p-2 bg-gray-800 rounded" />
                <button onClick={tagPerson} className="px-3 py-2 bg-purple-600 rounded">Tag</button>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Comments</div>
              <div className="max-h-40 overflow-y-auto mb-2 space-y-2">
                {comments.length ? comments.map((c)=> (
                  <div key={c.id} className="p-2 bg-gray-800 rounded text-sm">
                    <div className="font-semibold text-xs">{c.user_name}</div>
                    <div>{c.text}</div>
                  </div>
                )) : <div className="text-gray-400 text-sm">No comments yet</div>}
              </div>

              <div className="flex gap-2">
                <input value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="Add a comment" className="flex-1 p-2 bg-gray-800 rounded" />
                <button onClick={addComment} className="px-3 py-2 bg-indigo-600 rounded">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
