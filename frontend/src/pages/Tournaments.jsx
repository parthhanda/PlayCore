import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaCalendarAlt, FaUsers, FaGamepad, FaArrowRight, FaTimes } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Tournaments = () => {
    const { token, user } = useContext(AuthContext);
    const [tournaments, setTournaments] = useState([]);
    const [enrolledTournaments, setEnrolledTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEnrolledModal, setShowEnrolledModal] = useState(false);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                // Fetch public list (everyone can see this)
                const publicRes = await axios.get('http://localhost:5000/api/tournaments/public');
                setTournaments(publicRes.data);

                // Fetch enrolled list (if authenticated)
                if (token) {
                    const enrolledRes = await axios.get('http://localhost:5000/api/tournaments/enrolled', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setEnrolledTournaments(enrolledRes.data);
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('UNABLE TO ESTABLISH LINK WITH TOURNAMENT NETWORK');
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [token]);

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

                    <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-center gap-4">
                        {user && (
                            <button
                                onClick={() => setShowEnrolledModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-primary/30 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-primary/10 hover:border-primary transition-all duration-300"
                            >
                                <FaGamepad className="text-primary" /> My Enrollments
                                {enrolledTournaments.length > 0 && (
                                    <span className="ml-2 bg-primary text-black text-[10px] px-2 py-0.5 rounded-full font-black">
                                        {enrolledTournaments.length}
                                    </span>
                                )}
                            </button>
                        )}
                        <Link to="/tournaments/create" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-neon-blue hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300 transform hover:-translate-y-1">
                            <FaTrophy /> Host Operation
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-8 text-center font-bold tracking-widest text-sm uppercase border rounded-lg bg-red-500/20 text-red-500 border-red-500/50">
                        {error}
                    </div>
                )}

                {/* All Tournaments Section */}
                <div className="mb-16">
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

                {/* Enrolled Tournaments Modal Overlay */}
                {showEnrolledModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-surface border border-primary/30 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,255,255,0.15)] relative overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40 relative z-10">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                        Enrolled Tournaments
                                    </h2>
                                    <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full">{enrolledTournaments.length}</span>
                                </div>
                                <button
                                    onClick={() => setShowEnrolledModal(false)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-transparent to-black/40">
                                {enrolledTournaments.length === 0 ? (
                                    <div className="text-center py-16">
                                        <FaGamepad className="mx-auto text-5xl text-gray-600 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-400 font-display uppercase tracking-widest">No Active Enrollments</h3>
                                        <p className="text-gray-500 font-mono text-sm mt-2">You have not joined any operations yet.</p>
                                        <button
                                            onClick={() => setShowEnrolledModal(false)}
                                            className="inline-block mt-6 px-6 py-2 border border-primary/50 text-primary hover:bg-primary hover:text-black rounded-lg transition-all text-sm uppercase tracking-widest font-bold"
                                        >
                                            Browse Network
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {enrolledTournaments.map(t => (
                                            <Link
                                                to={`/tournaments/${t._id}`}
                                                key={t._id}
                                                onClick={() => setShowEnrolledModal(false)}
                                                className="group relative bg-black/60 border border-white/10 rounded-xl overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] flex flex-col"
                                            >
                                                <div className="p-5 flex-grow flex flex-col relative z-10">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="text-lg font-black text-white uppercase tracking-wider group-hover:text-primary transition-colors line-clamp-1">{t.title}</h3>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border shrink-0 ml-2
                                                            ${t.status === 'registration' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                                                                t.status === 'in_progress' ? 'text-orange-400 bg-orange-400/10 border-orange-400/30' :
                                                                    'text-primary bg-primary/10 border-primary/30'}`}>
                                                            {t.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 font-mono text-[10px] uppercase tracking-widest mb-4 flex items-center">
                                                        <FaGamepad className="mr-2 text-primary/70" /> {t.game} | {t.type}
                                                    </p>

                                                    <div className="mt-auto space-y-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500 font-mono">STATUS:</span>
                                                            <span className="text-green-400 font-bold tracking-widest">ENROLLED</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500 font-mono">PLAYERS:</span>
                                                            <span className="text-gray-300 font-bold">{t.enrolledPlayers?.length || 0} / {t.maxParticipants}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-neon-blue group-hover:w-full transition-all duration-500"></div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tournaments;
