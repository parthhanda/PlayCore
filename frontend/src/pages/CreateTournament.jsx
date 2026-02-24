import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaTrophy, FaGamepad, FaUsers, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';

const CreateTournament = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        game: '',
        rules: '',
        type: 'solo',
        maxParticipants: 16,
        startDate: '',
        endDate: ''
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            return setMessage('END DATE CANNOT PRECEDE START DATE');
        }

        try {
            setLoading(true);
            const { data } = await axios.post('http://localhost:5000/api/tournaments', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoading(false);
            setMessage('TOURNAMENT INITIALIZED');
            setTimeout(() => navigate(`/tournaments/${data._id}`), 1500);
        } catch (error) {
            console.error(error);
            setLoading(false);
            setMessage(error.response?.data?.message || 'INITIALIZATION FAILED');
        }
    };

    return (
        <div className="pt-24 pb-12 min-h-screen bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>

            <div className="container mx-auto px-4 max-w-3xl relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-blue to-white tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                        Host Tournament
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm tracking-wide">
                        ESTABLISH A NEW COMBAT PROTOCOL
                    </p>
                </div>

                <div className="bg-surface/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl pointer-events-none"></div>

                    {message && (
                        <div className={`p-4 mb-6 text-center font-bold tracking-widest text-sm uppercase border rounded-lg ${message.includes('FAILED') || message.includes('CANNOT') ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-primary/20 text-primary border-primary/50'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Title & Game */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Operation Name</label>
                                <div className="relative">
                                    <FaTrophy className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                                        placeholder="Tournament Title"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Target Interface (Game)</label>
                                <div className="relative">
                                    <FaGamepad className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        name="game"
                                        value={formData.game}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                                        placeholder="e.g., Valorant"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Mission Briefing (Description)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] h-32 resize-none"
                                placeholder="Details about this tournament..."
                                required
                            />
                        </div>

                        {/* Rules */}
                        <div>
                            <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Rules of Engagement <span className="text-gray-500 text-[10px]">(Optional)</span></label>
                            <div className="relative">
                                <FaShieldAlt className="absolute left-4 top-4 text-gray-500" />
                                <textarea
                                    name="rules"
                                    value={formData.rules}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] h-24 resize-none"
                                    placeholder="Match rules, bans, etc."
                                />
                            </div>
                        </div>

                        {/* Format & Size */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10">
                            <div>
                                <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Format</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 appearance-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                                >
                                    <option value="solo">Solo Queue (1v1)</option>
                                    <option value="squad">Squads (Team vs Team)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Bracket Size</label>
                                <div className="relative">
                                    <FaUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <select
                                        name="maxParticipants"
                                        value={formData.maxParticipants}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 appearance-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                                    >
                                        <option value={4}>4 Combatants</option>
                                        <option value={8}>8 Combatants</option>
                                        <option value={16}>16 Combatants</option>
                                        <option value={32}>32 Combatants</option>
                                        <option value={64}>64 Combatants</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Start Time (Local)</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-primary font-mono text-xs tracking-widest uppercase mb-2">Estimated End Time</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 mt-8 rounded-xl font-black text-sm tracking-[0.3em] transition-all duration-300 uppercase ${loading
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10'
                                    : 'bg-transparent text-primary hover:bg-primary hover:text-black border border-primary hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] relative overflow-hidden group'
                                }`}
                        >
                            {loading ? 'INITIALIZING...' : 'INITIALIZE PROTOCOL'}
                            {!loading && (
                                <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-[-1]"></div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTournament;
