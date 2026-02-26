import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaUsers } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Squads = () => {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [squads, setSquads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', ticker: '', description: '', logo: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSquads();
    }, []);

    const fetchSquads = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/squads');
            setSquads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5000/api/squads', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            // navigate to new squad
            navigate(`/squads/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create squad');
        }
    };

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 font-sans selection:bg-primary selection:text-black">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            Active <span className="text-secondary drop-shadow-[0_0_20px_rgba(255,0,255,0.8)]">Squads</span>
                        </h1>
                        <p className="text-gray-400 mt-2 tracking-wide text-sm uppercase">Join a faction. Dominate the arena.</p>
                    </div>

                    {user && !user.squad && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-secondary text-black font-black py-3 px-8 rounded-xl text-lg tracking-[0.2em] shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:shadow-[0_0_40px_rgba(255,0,255,0.6)] hover:scale-105 transition-all duration-300 uppercase flex items-center gap-3"
                        >
                            <FaPlus /> Initialize Squad
                        </button>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center text-secondary font-display tracking-[0.5em] animate-pulse mt-20">SCANNING SECTOR...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {squads.map((squad) => (
                            <Link
                                to={`/squads/${squad._id}`}
                                key={squad._id}
                                className="group relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-secondary/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,255,0.15)] flex flex-col"
                            >
                                <div className="h-24 bg-gradient-to-r from-gray-900 to-black relative">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                    <div className="absolute -bottom-6 left-6 w-16 h-16 bg-black rounded-xl border border-white/10 flex items-center justify-center shadow-xl group-hover:border-secondary transition-colors">
                                        {squad.logo ? (
                                            <img src={squad.logo} alt={squad.ticker} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <span className="text-2xl font-black text-secondary font-display">{squad.ticker}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-8 px-6 pb-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold font-display uppercase tracking-wide text-white group-hover:text-secondary transition-colors truncate pr-2">
                                            {squad.name}
                                        </h3>
                                    </div>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 h-8">{squad.description || 'No description established.'}</p>

                                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
                                            <FaUsers className="text-secondary" /> {squad.members?.length || 0} Operatives
                                        </div>
                                        <div className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-gray-300">
                                            ELO: {squad.stats?.elo}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && squads.length === 0 && (
                    <div className="text-center text-gray-500 font-display tracking-widest mt-20">NO ACTIVE SQUADS DETECTED</div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(255,0,255,0.2)]">
                            <h2 className="text-2xl font-black font-display text-white mb-6 uppercase tracking-tighter">Initialize Squad</h2>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-500 p-3 rounded-lg text-xs font-bold uppercase mb-4 text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Squad Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-secondary focus:outline-none transition"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        maxLength={30}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ticker (3-4 Chars)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-secondary focus:outline-none transition uppercase"
                                        value={formData.ticker}
                                        onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                                        maxLength={4}
                                        minLength={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-secondary focus:outline-none transition resize-none h-24"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        maxLength={150}
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-xs uppercase hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-secondary text-black font-bold text-xs uppercase hover:bg-white transition shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Squads;
