import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaUserAstronaut, FaGamepad, FaWifi, FaUserFriends, FaSatelliteDish, FaCheck, FaTimes, FaGlobe } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Directory = () => {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('global'); // global, allies, comms
    const [requests, setRequests] = useState([]);

    // Fetch Users
    useEffect(() => {
        if (activeTab === 'global') {
            fetchUsers();
        } else if ((activeTab === 'allies' || activeTab === 'comms') && user) {
            fetchMyRequests();
        }
    }, [search, activeTab, user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/users?search=${search}`);
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(data.friendRequests || []);
            // Also update users list for Allies tab if needed, but we filter from 'users' state currently.
            // If we want 'Allies' to show full details, we should probably use the populated friends from getMe
            // instead of filtering the global list (which relies on 'users' being populated).
            // Let's rely on 'users' state for now, but strictly speaking, filtering 'users' only works if 
            // the allies are in the current search results/pagination.
            // BETTER: If activeTab is allies, setUsers(data.friends).
            if (activeTab === 'allies') {
                setUsers(data.friends || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get formatted list based on tab
    const getDisplayUsers = () => {
        if (activeTab === 'allies') {
            if (!user?.friends) return [];
            return users.filter(u => user.friends.some(f => {
                const friendId = typeof f === 'string' ? f : f?._id;
                return friendId === u._id;
            }));
        }
        return users;
    };

    const handleCardClick = (e, targetUsername) => {
        if (!user) {
            e.preventDefault();
            navigate('/login');
        }
    };

    const handleAccept = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/users/accept/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDecline = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/users/decline/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 pb-12 font-sans selection:bg-primary selection:text-black">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        Operative <span className="text-primary drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">Database</span>
                    </h1>

                    {/* Tabs */}
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all duration-300 border ${activeTab === 'global' ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,255,0.5)]' : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/50'}`}
                        >
                            <FaGlobe /> Global
                        </button>
                        {user && (
                            <>
                                <button
                                    onClick={() => setActiveTab('allies')}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all duration-300 border ${activeTab === 'allies' ? 'bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.5)]' : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/50'}`}
                                >
                                    <FaUserFriends /> Allies
                                </button>
                                <button
                                    onClick={() => setActiveTab('comms')}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase transition-all duration-300 border ${activeTab === 'comms' ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.5)]' : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/50'}`}
                                >
                                    <FaSatelliteDish /> Comms
                                    {user.friendRequests?.length > 0 && (
                                        <span className="bg-red-600 text-white text-[9px] px-1.5 rounded-full animate-pulse">{user.friendRequests.length}</span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Search Bar - Hide on Comms */}
                {activeTab !== 'comms' && (
                    <div className="max-w-2xl mx-auto mb-16 relative group">
                        <div className="relative flex items-center bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-6 py-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-primary/50 transition-colors">
                            <FaSearch className="text-gray-400 mr-4 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={activeTab === 'allies' ? "SEARCH ALLIES..." : "SCAN FOR OPERATIVE ID..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-white w-full font-display tracking-wider placeholder-gray-600 uppercase"
                            />
                            {loading && <FaWifi className="text-primary animate-ping" />}
                        </div>
                    </div>
                )}

                {/* Comms Tab Content */}
                {activeTab === 'comms' && (
                    <div className="max-w-3xl mx-auto">
                        {loading ? (
                            <div className="text-center text-primary font-display tracking-[0.5em] animate-pulse">ESTABLISHING UPLINK...</div>
                        ) : requests.length > 0 ? (
                            <div className="space-y-4">
                                {requests.map((req, idx) => (
                                    <div key={idx} className="bg-black/40 border border-orange-500/30 rounded-xl p-6 flex items-center justify-between hover:border-orange-500/80 transition-all shadow-[0_0_20px_rgba(255,165,0,0.1)]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center border border-white/10">
                                                <FaSatelliteDish className="text-orange-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold font-display uppercase tracking-wide">Incoming Transmission</h3>
                                                <p className="text-gray-500 text-xs tracking-wider">Operative: {req.from?.username || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleAccept(req.from._id)} className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-green-400 transition flex items-center gap-2">
                                                <FaCheck /> Accept
                                            </button>
                                            <button onClick={() => handleDecline(req.from._id)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-red-500 transition flex items-center gap-2">
                                                <FaTimes /> Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 font-display tracking-widest mt-20">NO INCOMING TRANSMISSIONS</div>
                        )}
                    </div>
                )}

                {/* Grid (Global/Allies) */}
                {activeTab !== 'comms' && (
                    <>
                        {loading && users.length === 0 ? (
                            <div className="text-center text-primary font-display tracking-[0.5em] animate-pulse">SCANNING NETWORK...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {getDisplayUsers().map((u) => (
                                    <Link
                                        to={`/u/${u.username}`}
                                        key={u._id}
                                        onClick={(e) => handleCardClick(e, u.username)}
                                        className="group relative bg-black/40 border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]"
                                    >
                                        {/* Holographic Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                        <div className="p-6 flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-lg bg-gray-900 overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                                                    {u.avatar ? (
                                                        <img src={`http://localhost:5000${u.avatar}`} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:text-primary transition-colors">
                                                            <FaUserAstronaut className="text-2xl" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${user?.friends?.some(f => (typeof f === 'string' ? f : f?._id) === u._id) ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold font-display uppercase tracking-wide truncate group-hover:text-primary transition-colors text-lg">
                                                    {u.username}
                                                </h3>
                                                <p className="text-gray-500 text-[10px] truncate uppercase tracking-wider">
                                                    Status: {user?.friends?.some(f => (typeof f === 'string' ? f : f?._id) === u._id) ? 'ALLY' : 'UNKNOWN'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom Bar */}
                                        <div className="bg-white/5 px-6 py-2 flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <span>:: ACCESS PROTOCOL</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!loading && getDisplayUsers().length === 0 && (
                            <div className="text-center text-gray-500 font-display tracking-widest mt-20">NO OPERATIVES FOUND</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Directory;
