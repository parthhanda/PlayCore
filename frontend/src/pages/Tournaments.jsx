import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaCalendarAlt, FaUsers, FaGamepad } from 'react-icons/fa';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                // Fetch public list (everyone can see this)
                const { data } = await axios.get('http://localhost:5000/api/tournaments/public');
                setTournaments(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('UNABLE TO ESTABLISH LINK WITH TOURNAMENT NETWORK');
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'registration': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'in_progress': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
            case 'completed': return 'text-primary bg-primary/10 border-primary/30';
            default: return 'text-red-400 bg-red-400/10 border-red-400/30';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="pt-24 pb-12 min-h-screen bg-background relative overflow-hidden">
            {/* Background Map Graphic (Abstract grid) */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-7xl">

                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                            Active Operations
                        </h1>
                        <p className="text-primary font-mono text-sm tracking-widest">GLOBAL TOURNAMENT NETWORK</p>
                    </div>

                    <Link to="/tournaments/create" className="mt-6 md:mt-0 flex items-center gap-2 px-6 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-neon-blue hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300 transform hover:-translate-y-1">
                        <FaTrophy /> Host Operation
                    </Link>
                </div>

                {error && (
                    <div className="p-4 mb-8 text-center font-bold tracking-widest text-sm uppercase border rounded-lg bg-red-500/20 text-red-500 border-red-500/50">
                        {error}
                    </div>
                )}

                {tournaments.length === 0 && !error ? (
                    <div className="text-center py-20 bg-surface/50 backdrop-blur-sm border border-white/5 rounded-2xl">
                        <FaGamepad className="mx-auto text-6xl text-gray-700 mb-4" />
                        <h3 className="text-2xl font-black text-gray-500 tracking-widest uppercase">No Active Operations</h3>
                        <p className="text-gray-600 font-mono mt-2">The grid is currently silent. Host an operation to begin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {tournaments.map((t) => (
                            <Link to={`/tournaments/${t._id}`} key={t._id} className="group relative bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] flex flex-col h-full transform hover:-translate-y-2">
                                {/* Auto-generated Pattern Background for header */}
                                <div className="h-32 relative bg-gradient-to-br from-gray-900 to-black overflow-hidden flex-shrink-0">
                                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiPjwvcmVjdD4KPC9zdmc+')] mix-blend-overlay"></div>
                                    <div className={`absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest border ${getStatusColor(t.status)}`}>
                                        {t.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col relative z-10 bg-gradient-to-b from-transparent to-black/80">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1 group-hover:text-primary transition-colors line-clamp-2">{t.title}</h2>
                                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-6 flex items-center">
                                        <FaGamepad className="mr-2" /> {t.game}
                                    </p>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-mono text-xs">HOST:</span>
                                            <span className="text-gray-300 font-bold tracking-wider">{t.host?.username || 'SYSTEM'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-mono text-xs">ENROLLMENT:</span>
                                            <div className="flex items-center text-primary font-bold">
                                                <FaUsers className="mr-2" /> {t.enrolledPlayers?.length || 0} / {t.maxParticipants}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-3 border-t border-white/5">
                                            <span className="text-gray-500 font-mono text-xs">START (LOCAL):</span>
                                            <div className="flex items-center text-gray-300 text-xs">
                                                <FaCalendarAlt className="mr-2 text-gray-500" />
                                                {new Date(t.startDate).toLocaleDateString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Glow Line */}
                                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-neon-blue group-hover:w-full transition-all duration-500"></div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tournaments;
