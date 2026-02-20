import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
    FaDiscord,
    FaTwitter,
    FaSteam,
    FaTwitch,
    FaInstagram,
    FaCopy,
    FaPlus,
    FaTrash,
    FaCamera,
    FaGlobe,
    FaGamepad,
    FaEdit,
    FaCheck,
    FaUserCheck,
    FaSatelliteDish,
    FaComment,
    FaTimes
} from 'react-icons/fa';
import profileBgPattern from '../assets/backgrounds/profile-bg.jpg';
import { getAvatarUrl } from '../utils/avatarUtils';

const Profile = () => {
    const { user, token, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        bio: '',
        avatar: '',
        coverImage: '',
        socialLinks: { discord: '', twitter: '', instagram: '', steam: '', twitch: '' },
        gameConnections: []
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [copyStatus, setCopyStatus] = useState(null);

    const [error, setError] = useState(null);

    // Load background image safely
    const bgImage = profileBgPattern || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2670&q=80';

    const fetchProfile = async () => {
        try {
            const usernameToFetch = window.location.pathname.startsWith('/u/')
                ? window.location.pathname.split('/u/')[1]
                : user?.username;

            // If we are on /profile but user is not ready, rely on AuthContext loading. 
            // If AuthContext is done and user is null, ProtectedRoute handles it.
            // But just in case:
            if (!usernameToFetch) {
                if (!window.location.pathname.startsWith('/u/')) {
                    // We are on /profile but no user. 
                    // Wait for user? Or set loading false (and show nothing/redirect)?
                    // Local loading should be sync with fetching data.
                    // If we can't fetch, we stop loading.
                    setLoading(false);
                    return;
                }
            }

            const { data } = await axios.get(`http://localhost:5000/api/users/u/${usernameToFetch}`);
            setProfileData({
                ...data,
                socialLinks: data.socialLinks || { discord: '', twitter: '', instagram: '', steam: '', twitch: '' },
                gameConnections: data.gameConnections || []
            });
            setError(null);
        } catch (error) {
            console.error(error);
            setError('User not found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user || window.location.pathname.startsWith('/u/')) {
            fetchProfile();
        } else {
            // If we are waiting for user, we might keep loading?
            // But if AuthContext finishes and no user, ProtectedRoute acts.
        }
    }, [user, window.location.pathname]);

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const uploadAvatar = async () => {
        if (!imageFile) return null;
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
            setUploading(true);
            const { data } = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setUploading(false);
            return data.image;
        } catch (error) {
            console.error(error);
            setUploading(false);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validate Game Connections
        for (const conn of profileData.gameConnections) {
            if (!conn.game.trim() || !conn.uid.trim()) {
                setMessage('FILL ALL NECESSARY FIELDS');
                return;
            }
        }

        let avatarUrl = profileData.avatar;

        if (imageFile) {
            const uploadedPath = await uploadAvatar();
            if (uploadedPath) avatarUrl = uploadedPath;
        }

        try {
            const { data } = await axios.put('http://localhost:5000/api/users/profile', {
                ...profileData,
                avatar: avatarUrl
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfileData({ ...profileData, ...data });
            if (setUser) setUser(prev => ({ ...prev, ...data }));
            setEditing(false);
            setMessage('SYSTEM UPDATED');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('SYSTEM ERROR');
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopyStatus(id);
        setTimeout(() => setCopyStatus(null), 2000);
    };

    const addGameConnection = () => {
        setProfileData({
            ...profileData,
            gameConnections: [...profileData.gameConnections, { game: '', uid: '' }]
        });
    };

    const updateGameConnection = (index, field, value) => {
        const updated = [...profileData.gameConnections];
        updated[index][field] = value;
        setProfileData({ ...profileData, gameConnections: updated });
    };

    const removeGameConnection = (index) => {
        const updated = profileData.gameConnections.filter((_, i) => i !== index);
        setProfileData({ ...profileData, gameConnections: updated });
    };

    const handleRemoveAvatar = () => {
        setImageFile(null);
        setProfileData({ ...profileData, avatar: '' }); // Clear the avatar path in state
    };

    // Helper to format social links
    const formatLink = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `https://${url}`;
    };

    const isOwnProfile = user?.username === profileData.username;

    // Robust check for friends (handles both array of IDs and array of Objects)
    const isFriend = Array.isArray(user?.friends) && user.friends.some(f => {
        const friendId = typeof f === 'string' ? f : f?._id;
        return friendId === profileData._id;
    });

    const hasSentRequest = Array.isArray(user?.sentRequests) && user.sentRequests.some(r => {
        const toId = typeof r.to === 'string' ? r.to : r.to?._id;
        return toId === profileData._id;
    });

    const hasReceivedRequest = Array.isArray(user?.friendRequests) && user.friendRequests.some(r => {
        const fromId = typeof r.from === 'string' ? r.from : r.from?._id;
        return fromId === profileData._id;
    });

    const handleConnect = async () => {
        try {
            await axios.put(`http://localhost:5000/api/users/request/${profileData._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('REQUEST TRANSMITTED');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'TRANSMISSION FAILED');
        }
    };

    const handleAccept = async () => {
        try {
            await axios.put(`http://localhost:5000/api/users/accept/${profileData._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('CONNECTION ESTABLISHED');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'ERROR');
        }
    };

    const handleRemove = async () => {
        if (!window.confirm('Are you sure you want to sever this connection?')) return;
        try {
            await axios.put(`http://localhost:5000/api/users/remove/${profileData._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('CONNECTION SEVERED');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
            setMessage('ERROR');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary font-bold text-xs animate-pulse">LOAD</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-background flex items-center justify-center text-red-500 font-bold tracking-widest uppercase">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-white font-sans overflow-hidden relative">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none sticky fixed"
                style={{ backgroundImage: `url(${bgImage})` }}
            ></div>

            <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">

                {/* Profile Header */}
                <div className="relative mb-8 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black/40 backdrop-blur-sm">
                    {/* Cover Image */}
                    <div className="h-64 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 z-20 hidden md:flex gap-4">
                            {/* Desktop Actions - Keep existing absolute positioning for md+ */}
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="flex items-center gap-2 px-6 py-2 bg-black/50 hover:bg-primary hover:text-black border border-white/10 rounded-full backdrop-blur-md transition-all duration-300 font-bold text-xs tracking-widest uppercase"
                                >
                                    <FaEdit /> {editing ? 'CLOSE DECK' : 'ACCESS DECK'}
                                </button>
                            ) : (
                                <>
                                    {isFriend ? (
                                        <div className="flex gap-3">
                                            <button className="flex items-center gap-2 px-6 py-2 bg-green-500/20 text-green-500 border border-green-500/50 rounded-full backdrop-blur-md font-bold text-xs tracking-widest uppercase cursor-default">
                                                <FaUserCheck /> LINKED
                                            </button>
                                            <button
                                                onClick={() => window.dispatchEvent(new CustomEvent('open-private-chat', { detail: profileData }))}
                                                className="flex items-center gap-2 px-6 py-2 bg-primary text-black border border-primary rounded-full backdrop-blur-md font-bold text-xs tracking-widest uppercase hover:bg-white transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                                            >
                                                <FaComment /> MESSAGE
                                            </button>
                                            <button onClick={handleRemove} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full backdrop-blur-md font-bold text-xs tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ) : hasReceivedRequest ? (
                                        <button onClick={handleAccept} className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-black border border-orange-500 rounded-full backdrop-blur-md font-bold text-xs tracking-widest uppercase hover:bg-orange-400 transition-all shadow-[0_0_15px_rgba(255,165,0,0.5)] animate-pulse">
                                            <FaCheck /> ACCEPT REQUEST
                                        </button>
                                    ) : hasSentRequest ? (
                                        <button disabled className="flex items-center gap-2 px-6 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/50 rounded-full backdrop-blur-md font-bold text-xs tracking-widest uppercase cursor-not-allowed">
                                            <FaSatelliteDish className="animate-spin" /> SIGNAL SENT
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleConnect}
                                            className="flex items-center gap-2 px-6 py-2 bg-primary/20 text-primary border border-primary/50 rounded-full backdrop-blur-md font-bold text-xs tracking-widest uppercase hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300 transform hover:scale-105"
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                                            <FaPlus /> CONNECT
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Avatar & Info */}
                    <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-20 relative z-10 gap-6">
                        <div className="relative group flex flex-col items-center">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-neon-blue to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                            {/* The Image Preview */}
                            <img
                                src={imageFile ? URL.createObjectURL(imageFile) : getAvatarUrl(profileData.avatar)}
                                alt="Avatar"
                                className={`w-40 h-40 rounded-full border-4 border-black object-cover relative z-10 bg-surface shadow-2xl ${editing ? 'opacity-80' : 'opacity-100'}`}
                            />

                            {editing && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                                    <label className="w-full h-full flex flex-col items-center justify-center rounded-full cursor-pointer bg-black/40 hover:bg-black/60 transition duration-300">
                                        <FaCamera className="text-2xl text-white drop-shadow-md mb-1" />
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-white drop-shadow-md">UPLOAD</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>

                                    {/* Remove Button (Positioned just outside the circle at top right) */}
                                    {(profileData.avatar || imageFile) && (
                                        <button
                                            onClick={handleRemoveAvatar}
                                            className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-black transition z-30 transform hover:scale-110"
                                            title="Remove Avatar"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_2px_10px_rgba(0,255,255,0.5)] leading-none mb-2">
                                {profileData.username}
                            </h1>
                        </div>
                    </div>

                    {/* Mobile Actions - Visible only on small screens, placed BELOW Avatar & Info */}
                    <div className="md:hidden flex flex-col gap-2 p-4 pt-0 bg-transparent">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setEditing(!editing)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black/50 hover:bg-primary hover:text-black border border-white/10 rounded-xl backdrop-blur-md transition-all duration-300 font-bold text-xs tracking-widest uppercase"
                            >
                                <FaEdit /> {editing ? 'CLOSE DECK' : 'ACCESS DECK'}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                {isFriend ? (
                                    <>
                                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-500 border border-green-500/50 rounded-xl font-bold text-xs tracking-widest uppercase">
                                            MESSAGE
                                        </button>
                                        <button onClick={handleRemove} className="px-4 py-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl font-bold text-xs uppercase">
                                            <FaTrash />
                                        </button>
                                    </>
                                ) : hasReceivedRequest ? (
                                    <button onClick={handleAccept} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-black border border-orange-500 rounded-xl font-bold text-xs tracking-widest uppercase">
                                        <FaCheck /> ACCEPT
                                    </button>
                                ) : hasSentRequest ? (
                                    <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/20 text-gray-400 border border-gray-500/50 rounded-xl font-bold text-xs tracking-widest uppercase">
                                        <FaSatelliteDish className="animate-spin" /> SENT
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConnect}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary/20 text-primary border border-primary/50 rounded-xl font-bold text-xs tracking-widest uppercase"
                                    >
                                        <FaPlus /> CONNECT
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <div className={`mx-auto max-w-lg p-4 mb-8 text-center font-bold tracking-widest text-sm uppercase border backdrop-blur-md rounded-lg animation-bounce ${message.includes('ERROR') || message.includes('FILL') || message.includes('FAILED') ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Panel */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Social Uplinks */}
                        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                            <h3 className="text-xs font-bold text-gray-400 tracking-[0.2em] mb-6 flex items-center gap-2 uppercase">
                                <FaGlobe className="text-primary" /> Network Uplinks
                            </h3>

                            {editing ? (
                                <div className="space-y-3">
                                    {['discord', 'twitter', 'instagram', 'steam', 'twitch'].map((platform) => (
                                        <div key={platform} className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-primary transition-colors">
                                                {platform === 'discord' && <FaDiscord />}
                                                {platform === 'twitter' && <FaTwitter />}
                                                {platform === 'instagram' && <FaInstagram />}
                                                {platform === 'steam' && <FaSteam />}
                                                {platform === 'twitch' && <FaTwitch />}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} ${platform === 'twitter' || platform === 'instagram' ? 'URL' : 'ID'}`}
                                                value={profileData.socialLinks[platform]}
                                                onChange={(e) => setProfileData({ ...profileData, socialLinks: { ...profileData.socialLinks, [platform]: e.target.value } })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-white text-xs focus:border-primary focus:bg-primary/5 focus:outline-none transition-all placeholder:text-gray-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {profileData.socialLinks?.discord && (
                                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl text-gray-400 hover:text-[#5865F2] hover:bg-[#5865F2]/20 hover:border-[#5865F2] transition-all hover:scale-110 cursor-pointer" title={profileData.socialLinks.discord}>
                                            <FaDiscord />
                                        </div>
                                    )}
                                    {profileData.socialLinks?.twitter && (
                                        <a href={formatLink(profileData.socialLinks.twitter)} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl text-gray-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2] transition-all hover:scale-110">
                                            <FaTwitter />
                                        </a>
                                    )}
                                    {profileData.socialLinks?.instagram && (
                                        <a href={formatLink(profileData.socialLinks.instagram)} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl text-gray-400 hover:text-[#E1306C] hover:bg-[#E1306C]/20 hover:border-[#E1306C] transition-all hover:scale-110">
                                            <FaInstagram />
                                        </a>
                                    )}
                                    {profileData.socialLinks?.steam && (
                                        <a href={`https://steamcommunity.com/id/${profileData.socialLinks.steam}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl text-gray-400 hover:text-white hover:bg-white/20 hover:border-white transition-all hover:scale-110">
                                            <FaSteam />
                                        </a>
                                    )}
                                    {profileData.socialLinks?.twitch && (
                                        <a href={`https://twitch.tv/${profileData.socialLinks.twitch}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl text-gray-400 hover:text-[#9146FF] hover:bg-[#9146FF]/20 hover:border-[#9146FF] transition-all hover:scale-110">
                                            <FaTwitch />
                                        </a>
                                    )}
                                    {Object.values(profileData.socialLinks).every(v => !v) && (
                                        <p className="text-gray-600 text-[10px] uppercase tracking-widest text-center py-4 w-full border border-dashed border-white/5 rounded-lg">No Signals Found</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stats - Compact */}
                        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xs font-bold text-gray-400 tracking-[0.2em] mb-4 uppercase">Statistics</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-primary/50 transition duration-300 group">
                                    <div className="text-2xl font-black text-white group-hover:text-primary transition">0</div>
                                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Wins</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-secondary/50 transition duration-300 group">
                                    <div className="text-2xl font-black text-white group-hover:text-secondary transition">1.5K</div>
                                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Elo</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* BIO */}
                        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                            <h3 className="text-xs font-bold text-gray-400 tracking-[0.2em] mb-4 uppercase">BIO</h3>
                            {editing ? (
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-primary focus:bg-primary/5 focus:outline-none transition leading-relaxed text-sm resize-none"
                                    placeholder="Enter your bio..."
                                ></textarea>
                            ) : (
                                <p className="text-gray-300 leading-relaxed text-sm lg:text-base font-light tracking-wide whitespace-pre-wrap">
                                    {profileData.bio || "No bio data available."}
                                </p>
                            )}
                        </div>

                        {/* Game Connect */}
                        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase flex items-center gap-2">
                                    <FaGamepad className="text-accent" /> Game Protocol
                                </h3>
                                {editing && (
                                    <button
                                        onClick={addGameConnection}
                                        className="text-accent text-[10px] font-bold flex items-center gap-1 hover:text-white transition uppercase tracking-widest border border-accent/30 px-3 py-1 rounded bg-accent/10 hover:bg-accent hover:border-accent"
                                    >
                                        <FaPlus /> Add Game
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editing ? (
                                    profileData.gameConnections.map((conn, idx) => (
                                        <div key={idx} className="bg-black/40 p-3 rounded-lg border border-white/10 relative group hover:border-red-500/50 transition-colors">
                                            <button
                                                onClick={() => removeGameConnection(idx)}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTrash />
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Game Name"
                                                value={conn.game}
                                                onChange={(e) => updateGameConnection(idx, 'game', e.target.value)}
                                                className={`w-full bg-transparent border-b border-white/10 p-2 text-xs text-primary font-bold mb-1 focus:border-primary focus:outline-none placeholder:text-gray-600 ${!conn.game.trim() && message.includes('FILL') ? 'border-red-500 placeholder:text-red-500/50' : ''}`}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Game ID / UID"
                                                value={conn.uid}
                                                onChange={(e) => updateGameConnection(idx, 'uid', e.target.value)}
                                                className={`w-full bg-transparent border-b border-white/10 p-2 text-xs text-white focus:border-primary focus:outline-none placeholder:text-gray-600 ${!conn.uid.trim() && message.includes('FILL') ? 'border-red-500 placeholder:text-red-500/50' : ''}`}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    profileData.gameConnections.length > 0 ? (
                                        profileData.gameConnections.map((conn, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl hover:border-accent/50 hover:bg-accent/5 transition duration-300 group">
                                                <div>
                                                    <div className="text-[9px] text-accent font-bold tracking-[0.2em] uppercase mb-1">{conn.game}</div>
                                                    <div className="text-white font-bold text-sm tracking-wide">{conn.uid}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(conn.uid, idx)}
                                                    className={`p-2 rounded-lg border transition-all duration-300 ${copyStatus === idx ? 'bg-green-500 border-green-500 text-black' : 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white'}`}
                                                >
                                                    <FaCopy />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-2 text-center text-gray-600 text-xs italic py-8 border border-dashed border-white/5 rounded-xl">No games linked.</p>
                                    )
                                )}
                            </div>
                        </div>

                        {editing && (
                            <div className="flex justify-end pt-4 animate-fade-in-up">
                                <button
                                    onClick={handleSubmit}
                                    disabled={uploading}
                                    className="bg-primary text-black font-black py-4 px-8 rounded-xl text-sm tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] hover:scale-[1.02] transition-all duration-300 uppercase w-full md:w-auto"
                                >
                                    {uploading ? 'PROCESSING...' : 'SAVE CONFIGURATION'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
