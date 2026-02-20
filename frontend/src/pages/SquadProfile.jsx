import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaShieldAlt, FaTrophy, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const SquadProfile = () => {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [squad, setSquad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSquad();
    }, [id]);

    const fetchSquad = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/squads/${id}`);
            setSquad(data);
        } catch (err) {
            setError('Squad not found');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) return navigate('/login');
        if (user.squad) return alert('You are already in a squad. Leave it first.');

        setActionLoading(true);
        try {
            await axios.post(`http://localhost:5000/api/squads/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave this squad?')) return;

        setActionLoading(true);
        try {
            await axios.post('http://localhost:5000/api/squads/leave', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to leave');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-secondary font-display tracking-[0.5em] animate-pulse">LOADING SQUAD DATA...</div>
        </div>
    );

    if (error || !squad) return (
        <div className="min-h-screen bg-background flex items-center justify-center text-red-500 font-bold tracking-widest uppercase">
            {error || 'SQUAD NOT FOUND'}
        </div>
    );

    const isMember = user?.squad === squad._id;

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 pb-12 font-sans selection:bg-secondary selection:text-black">
            <div className="max-w-6xl mx-auto">

                {/* Header Card */}
                <div className="relative bg-black/40 border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden mb-8 group">
                    <div className="absolute inset-0 bg-secondary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <FaShieldAlt className="text-9xl text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Logo/Ticker */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-black rounded-2xl border-2 border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.15)] group-hover:border-secondary transition-colors">
                            {squad.logo ? (
                                <img src={squad.logo} alt={squad.ticker} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <span className="text-5xl font-black text-secondary font-display">{squad.ticker}</span>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter text-white mb-2">
                                {squad.name}
                            </h1>
                            <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed mb-6">
                                {squad.description || 'Verified Tactical Squad.'}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                                    <FaTrophy className="text-yellow-500" />
                                    <span className="font-bold">{squad.stats?.wins || 0}</span> <span className="text-xs text-gray-500 uppercase tracking-wider">Wins</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                                    <span className="text-secondary font-bold">ELO</span>
                                    <span className="font-bold">{squad.stats?.elo || 1200}</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Captain</span>
                                    <Link to={`/u/${squad.captain.username}`} className="font-bold hover:text-secondary transition">{squad.captain.username}</Link>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            {isMember ? (
                                <button
                                    onClick={handleLeave}
                                    disabled={actionLoading}
                                    className="w-full py-4 rounded-xl bg-red-600/20 text-red-500 border border-red-500/50 font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <FaSignOutAlt /> Leave Squad
                                </button>
                            ) : user ? (
                                <button
                                    onClick={handleJoin}
                                    disabled={actionLoading || user.squad}
                                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${user.squad ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-secondary text-black hover:bg-white shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:scale-105'}`}
                                >
                                    {user.squad ? 'ALREADY IN SQUAD' : <><FaPlus /> JOIN SQUAD</>}
                                </button>
                            ) : (
                                <button onClick={() => navigate('/login')} className="w-full py-4 rounded-xl bg-secondary text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition">
                                    Login to Join
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Roster */}
                <h2 className="text-2xl font-bold font-display uppercase tracking-wide mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-secondary rounded-full"></span> Active Roster
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {squad.members.map((member) => (
                        <Link
                            to={`/u/${member.username}`}
                            key={member._id}
                            className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 hover:border-secondary/30 transition-all group"
                        >
                            <img
                                src={member.avatar ? `http://localhost:5000${member.avatar}` : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                                alt={member.username}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-900"
                            />
                            <div>
                                <div className="font-bold text-white group-hover:text-secondary transition flex items-center gap-2">
                                    {member.username}
                                    {member._id === squad.captain._id && <FaShieldAlt className="text-yellow-500 text-xs" title="Captain" />}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">ELO: {member.elo || 1000}</div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default SquadProfile;
