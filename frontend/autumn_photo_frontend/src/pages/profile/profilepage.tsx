import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";

const tryGet = async (urls: string[]) => {
    for (const u of urls) {
        try {
            const res = await axios.get(u);
            return res.data;
        } catch (e: any) {
            if (!e.response || e.response.status !== 404) {
                console.error(e);
            }
        }
    }
    return null;
};

const ProfilePage = () => {
    const email = useSelector((s: any) => s.auth.email);
    const [username, setUsername] = useState<string | null>(null);
    const [liked, setLiked] = useState<any[]>([]);
    const [favs, setFavs] = useState<any[]>([]);
    const [tagged, setTagged] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const likedData = await tryGet([
                "/photos/my/likes/",
                "/photos/likes/",
                "/photos/user/likes/",
            ]);
            setLiked(likedData?.photos || likedData || []);

            const favData = await tryGet([
                "/photos/my/favourites/",
                "/photos/favourites/",
                "/photos/user/favourites/",
            ]);
            setFavs(favData?.photos || favData || []);

            const taggedData = await tryGet([
                "/photos/my/tagged/",
                "/photos/tagged/",
                "/photos/user/tagged/",
            ]);
            setTagged(taggedData?.photos || taggedData || []);
            
            try {
                const res = await axios.get('/accounts/me/');
                const data = res.data;
                if (data?.username) setUsername(data.username);
                else if (data?.full_name) setUsername(data.full_name);
            } catch (e) {
                
                const maybeFull = localStorage.getItem("full_name") || null;
                if (maybeFull) setUsername(maybeFull);
                else if (email) setUsername(email.split("@")[0]);
            }
        })();
    }, []);

    return (
        <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
            <Navbar />
            <div className="px-6 md:px-10 lg:px-16 py-8 md:py-10">
                <h1 className="text-3xl font-bold mb-4">Profile</h1>
                <div className="mb-6 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                    <div className="text-lg">Username: <span className="text-gray-300">{username || 'Unknown'}</span></div>
                    <div className="text-lg mt-2">Email: <span className="text-gray-300">{email || 'Unknown'}</span></div>
                </div>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Liked Photos</h2>
                    {liked.length ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {liked.map((p: any) => (
                                <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="thumb" className="w-full h-36 object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No liked photos (or endpoint not available).</div>
                    )}
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Favourites</h2>
                    {favs.length ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {favs.map((p: any) => (
                                <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="thumb" className="w-full h-36 object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No favourites (or endpoint not available).</div>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Tagged In</h2>
                    {tagged.length ? (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tagged.map((p: any) => (
                                <img key={p.id} src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="thumb" className="w-full h-36 object-cover rounded" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">No tags (or endpoint not available).</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;