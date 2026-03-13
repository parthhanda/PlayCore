import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaNewspaper, FaComments, FaTrophy, FaShieldAlt, FaTrash, FaUserShield, FaSearch, FaFlag, FaExclamationTriangle, FaEnvelope, FaChartBar, FaSatelliteDish, FaPaperPlane } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const AdminPanel = () => {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [reportedPosts, setReportedPosts] = useState([]);
    const [reportedComments, setReportedComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [broadcast, setBroadcast] = useState({ message: '', link: '' });
    const [sending, setSending] = useState(false);

    const API = 'http://localhost:5000/api/admin';
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!user || !user.roles?.includes('admin')) {
            navigate('/dashboard');
            return;
        }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${API}/stats`, { headers });
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (search = '') => {
        try {
            const { data } = await axios.get(`${API}/users?search=${search}`, { headers });
            setUsers(data.users);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReportedPosts = async () => {
        try {
            const { data } = await axios.get(`${API}/posts/reported`, { headers });
            setReportedPosts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReportedComments = async () => {
        try {
            const { data } = await axios.get(`${API}/comments/reported`, { headers });
            setReportedComments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'users') fetchUsers();
        if (tab === 'content') {
            fetchReportedPosts();
            fetchReportedComments();
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`⚠️ PERMANENTLY DELETE user "${username}" and ALL their data? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/users/${userId}`, { headers });
            setUsers(users.filter(u => u._id !== userId));
            fetchStats();
            alert(`User "${username}" and all associated data have been purged.`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleToggleRole = async (userId) => {
        try {
            const { data } = await axios.put(`${API}/users/${userId}/role`, {}, { headers });
            setUsers(users.map(u => u._id === userId ? { ...u, roles: data.roles } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle role');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post and all its comments?')) return;
        try {
            await axios.delete(`${API}/posts/${postId}`, { headers });
            setReportedPosts(reportedPosts.filter(p => p._id !== postId));
            fetchStats();
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await axios.delete(`${API}/comments/${commentId}`, { headers });
            setReportedComments(reportedComments.filter(c => c._id !== commentId));
            fetchStats();
        } catch (err) {
            alert('Failed to delete comment');
        }
    };

    const handleUserSearch = (e) => {
        e.preventDefault();
        fetchUsers(userSearch);
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcast.message) return;
        setSending(true);
        try {
            await axios.post(`${API}/broadcast`, broadcast, { headers });
            alert('BROADCAST TRANSMITTED TO ALL ACTIVE OPERATIVES');
            setBroadcast({ message: '', link: '' });
        } catch (err) {
            console.error(err);
            alert('TRANSMISSION FAILURE: Check network status');
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-red-500 font-display tracking-[0.5em] animate-pulse">INITIALIZING MCP...</div>
        </div>
    );

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="text-xl" />
                </div>
                <div>
                    <div className="text-3xl font-black font-display">{value}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FaChartBar },
        { id: 'users', label: 'Users', icon: FaUsers },
        { id: 'content', label: 'Reports', icon: FaFlag },
    ];

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 pb-20 font-sans selection:bg-red-500 selection:text-black">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_rgba(255,0,0,0.8)] animate-pulse"></div>
                        <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em]">Admin Access • Clearance Level MAX</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter">
                        Master <span className="text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">Control</span> Panel
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm uppercase tracking-wider">Full administrative authority over the PlayCore platform</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-10 border-b border-white/10 pb-4">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                activeTab === tab.id
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.2)]'
                                    : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <tab.icon /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <StatCard icon={FaUsers} label="Total Users" value={stats.totalUsers} color="bg-blue-500/20 text-blue-400" />
                            <StatCard icon={FaNewspaper} label="Total Posts" value={stats.totalPosts} color="bg-green-500/20 text-green-400" />
                            <StatCard icon={FaComments} label="Total Comments" value={stats.totalComments} color="bg-purple-500/20 text-purple-400" />
                            <StatCard icon={FaTrophy} label="Tournaments" value={stats.totalTournaments} color="bg-yellow-500/20 text-yellow-400" />
                            <StatCard icon={FaShieldAlt} label="Squads" value={stats.totalSquads} color="bg-cyan-500/20 text-cyan-400" />
                            <StatCard icon={FaEnvelope} label="Messages (24h)" value={stats.totalMessages} color="bg-pink-500/20 text-pink-400" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 border border-red-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaFlag className="text-red-500" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-red-400">Reported Content</span>
                                </div>
                                <div className="flex gap-8">
                                    <div>
                                        <div className="text-3xl font-black font-display text-red-400">{stats.reportedPosts}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Posts</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-black font-display text-red-400">{stats.reportedComments}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Comments</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/40 border border-yellow-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaUserShield className="text-yellow-500" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">Admin Users</span>
                                </div>
                                <div className="text-3xl font-black font-display text-yellow-400">{stats.adminUsers}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">With elevated privileges</div>
                            </div>
                        </div>

                        {/* Broadcast System Section */}
                        <div className="mt-12 bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                                    <FaSatelliteDish className="text-primary text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">Global Broadcast System</h3>
                                    <p className="text-xs text-gray-400">Real-time tactical alerts for all site users</p>
                                </div>
                            </div>

                            <form onSubmit={handleBroadcast} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Transmission Payload</label>
                                        <textarea
                                            value={broadcast.message}
                                            onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:border-primary/50 focus:outline-none h-40 resize-none placeholder:text-gray-800 font-mono text-sm leading-relaxed"
                                            placeholder="ENTER BROADCAST MESSAGE..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Optional Link Path</label>
                                        <input
                                            type="text"
                                            value={broadcast.link}
                                            onChange={(e) => setBroadcast({ ...broadcast, link: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary/50 focus:outline-none placeholder:text-gray-800 font-mono text-sm"
                                            placeholder="e.g. /tournaments/current"
                                        />
                                        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                            <p className="text-[10px] text-primary/80 leading-relaxed">
                                                <span className="font-bold uppercase tracking-widest block mb-1">Warning:</span>
                                                Global broadcasts override standard notification priority and trigger immediate socket events for all connected operatives.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={sending || !broadcast.message}
                                        className="mt-6 w-full h-16 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] disabled:opacity-30 disabled:hover:shadow-none transition-all duration-500 flex items-center justify-center gap-4 group"
                                    >
                                        {sending ? (
                                            <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                                                Initiate Global Broadcast
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="animate-fade-in-up">
                        <form onSubmit={handleUserSearch} className="mb-8 flex gap-3">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search by username, email, or gamertag..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all text-sm"
                                />
                            </div>
                            <button type="submit" className="bg-red-500/20 text-red-400 border border-red-500/50 px-6 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-red-500/30 transition-colors">
                                Search
                            </button>
                        </form>

                        <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                <div className="col-span-1">Avatar</div>
                                <div className="col-span-3">Username</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-2">Role</div>
                                <div className="col-span-1">Joined</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>
                            {users.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">No users found. Try searching above.</div>
                            ) : (
                                users.map(u => (
                                    <div key={u._id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                                        <div className="col-span-1">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 overflow-hidden">
                                                <img src={u.avatar ? `http://localhost:5000${u.avatar}` : 'https://api.dicebear.com/7.x/bottts/svg'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <div className="col-span-3 font-bold text-sm truncate">{u.username}</div>
                                        <div className="col-span-3 text-gray-400 text-xs truncate">{u.email}</div>
                                        <div className="col-span-2">
                                            {u.roles?.includes('admin') ? (
                                                <span className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider">Admin</span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-1 rounded bg-gray-500/20 text-gray-400 border border-gray-500/30 font-bold uppercase tracking-wider">User</span>
                                            )}
                                        </div>
                                        <div className="col-span-1 text-[10px] text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</div>
                                        <div className="col-span-2 flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleToggleRole(u._id)}
                                                className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                                                title={u.roles?.includes('admin') ? 'Demote to User' : 'Promote to Admin'}
                                            >
                                                <FaUserShield className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u._id, u.username)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                                                title="Permanently delete user"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Content Moderation Tab */}
                {activeTab === 'content' && (
                    <div className="animate-fade-in-up space-y-10">
                        {/* Reported Posts */}
                        <div>
                            <h3 className="text-xl font-black font-display uppercase tracking-widest text-red-400 mb-6 flex items-center gap-3">
                                <FaExclamationTriangle /> Reported Posts ({reportedPosts.length})
                            </h3>
                            {reportedPosts.length === 0 ? (
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center text-gray-500 text-sm">No reported posts. All clear.</div>
                            ) : (
                                <div className="space-y-4">
                                    {reportedPosts.map(post => (
                                        <div key={post._id} className="bg-black/40 border border-red-500/20 rounded-2xl p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white mb-1">{post.title}</h4>
                                                    <p className="text-xs text-gray-500 mb-3">by {post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}</p>
                                                    <div className="space-y-2">
                                                        {post.reports?.map((r, i) => (
                                                            <div key={i} className="text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-300">
                                                                <span className="font-bold text-red-400">{r.user?.username || 'Unknown'}</span>: {r.reason}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePost(post._id)}
                                                    className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors shrink-0"
                                                >
                                                    <FaTrash /> Delete Post
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reported Comments */}
                        <div>
                            <h3 className="text-xl font-black font-display uppercase tracking-widest text-red-400 mb-6 flex items-center gap-3">
                                <FaExclamationTriangle /> Reported Comments ({reportedComments.length})
                            </h3>
                            {reportedComments.length === 0 ? (
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center text-gray-500 text-sm">No reported comments. All clear.</div>
                            ) : (
                                <div className="space-y-4">
                                    {reportedComments.map(comment => (
                                        <div key={comment._id} className="bg-black/40 border border-red-500/20 rounded-2xl p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm text-white mb-1">"{comment.content}"</p>
                                                    <p className="text-xs text-gray-500 mb-3">by {comment.author?.username} on post "{comment.post?.title}" • {new Date(comment.createdAt).toLocaleDateString()}</p>
                                                    <div className="space-y-2">
                                                        {comment.reports?.map((r, i) => (
                                                            <div key={i} className="text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-300">
                                                                <span className="font-bold text-red-400">{r.user?.username || 'Unknown'}</span>: {r.reason}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors shrink-0"
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
