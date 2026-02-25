import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaUsers, FaGamepad, FaCalendarAlt, FaIdCard, FaPhoneAlt, FaFileDownload } from 'react-icons/fa';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Enrollment Form State
    const [enrollmentData, setEnrollmentData] = useState({
        inGameUid: '',
        inGameName: '',
        contactNumber: ''
    });
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollMessage, setEnrollMessage] = useState('');

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                // If not logged in, we only have public access.
                const endpoint = token ? `/api/tournaments/${id}` : '/api/tournaments/public';

                // Since our public endpoint lists all, we'd normally need a public detail endpoint.
                // For this implementation, we require Auth to see the details page.
                if (!token) {
                    navigate('/login');
                    return;
                }

                const { data } = await axios.get(`http://localhost:5000/api/tournaments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTournament(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('FAILED TO SECURE TOURNAMENT INTEL');
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id, token, navigate]);

    const handleEnrollmentChange = (e) => {
        setEnrollmentData({ ...enrollmentData, [e.target.name]: e.target.value });
    };

    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        setEnrollMessage('');
        setEnrollLoading(true);

        try {
            const { data } = await axios.post(`http://localhost:5000/api/tournaments/${id}/enroll`, enrollmentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTournament(data); // Update with new enrollment
            setEnrollMessage('SUCCESSFULLY ENROLLED');
            setEnrollLoading(false);
        } catch (err) {
            console.error(err);
            setEnrollMessage(err.response?.data?.message || 'ENROLLMENT FAILED');
            setEnrollLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            // We need to handle blob response for PDF
            const response = await axios.get(`http://localhost:5000/api/tournaments/${id}/export`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' // CRITICAL for PDF download
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Roster_${tournament.title.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error(e);
            alert("PDF Generation Failed. Connection Terminated.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4 pt-24">
            <h1 className="text-4xl font-black text-red-500 mb-4 font-mono">ERROR 404</h1>
            <p className="text-red-400 font-mono text-sm tracking-widest">{error}</p>
        </div>
    );

    if (!tournament) return null;

    const isHost = tournament.host._id === user?._id;
    const isEnrolled = tournament.enrolledPlayers?.some(p => p.user._id === user?._id);
    const isFull = tournament.enrolledPlayers?.length >= tournament.maxParticipants;
    const canEnroll = tournament.status === 'registration' && !isEnrolled && !isFull && !isHost;

    return (
        <div className="pt-24 pb-12 min-h-screen bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10 max-w-5xl">

                {/* Header Section */}
                <div className="bg-surface/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                {tournament.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-widest">
                                <span className="text-primary flex items-center"><FaGamepad className="mr-2" /> {tournament.game}</span>
                                <span className="text-neon-blue flex items-center"><FaUsers className="mr-2" /> {tournament.type}</span>
                                <span className="text-gray-400 flex items-center"><FaShieldAlt className="mr-2" /> HOST: {tournament.host.username}</span>
                            </div>
                        </div>

                        <div className={`px-6 py-3 rounded-xl border font-black uppercase tracking-widest text-sm text-center
                             ${tournament.status === 'registration' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                tournament.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                                    'bg-primary/10 text-primary border-primary/30'}`}>
                            {tournament.status.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-center">
                            <FaUsers className="mx-auto text-gray-500 mb-2" />
                            <div className="text-2xl font-black text-white">{tournament.enrolledPlayers?.length || 0} / {tournament.maxParticipants}</div>
                            <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Combatants</div>
                        </div>
                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-center">
                            <FaCalendarAlt className="mx-auto text-primary mb-2" />
                            <div className="text-sm font-bold text-white mt-1">{new Date(tournament.startDate).toLocaleDateString()}</div>
                            <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Start Date</div>
                        </div>
                        {tournament.endDate && (
                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-center">
                                <FaCalendarAlt className="mx-auto text-gray-500 mb-2" />
                                <div className="text-sm font-bold text-gray-300 mt-1">{new Date(tournament.endDate).toLocaleDateString()}</div>
                                <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Est. End Date</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Intel & Bracket) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Briefing */}
                        <div className="bg-surface/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl">
                            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-4">Mission Briefing</h2>
                            <p className="text-gray-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                {tournament.description}
                            </p>

                            {tournament.rules && (
                                <>
                                    <h3 className="text-lg font-bold text-primary mt-8 mb-4 uppercase tracking-widest">Rules of Engagement</h3>
                                    <p className="text-gray-400 font-mono text-sm leading-relaxed whitespace-pre-wrap p-4 bg-black/50 rounded-xl border border-white/5">
                                        {tournament.rules}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Bracket Area (Placeholder for now) */}
                        <div className="bg-surface/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl min-h-[300px] flex flex-col">
                            {tournament.status === 'registration' || !tournament.matches || tournament.matches.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-70 py-12">
                                    <FaShieldAlt className="text-6xl text-gray-700 mb-4 opacity-50" />
                                    <h2 className="text-xl font-black text-gray-500 tracking-widest uppercase mb-2">Bracket Network</h2>
                                    <p className="text-gray-600 font-mono text-xs">Awaiting structural generation from Host.</p>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4 flex items-center mb-6">
                                        <FaShieldAlt className="text-primary mr-3" /> Bracket Network
                                    </h2>

                                    <div className="space-y-8">
                                        {Object.entries(
                                            tournament.matches.reduce((acc, match) => {
                                                if (!acc[match.roundNumber]) acc[match.roundNumber] = [];
                                                acc[match.roundNumber].push(match);
                                                return acc;
                                            }, {})
                                        ).sort(([a], [b]) => Number(a) - Number(b)).map(([roundNum, roundMatches]) => (
                                            <div key={roundNum} className="bg-black/40 rounded-xl p-4 border border-white/5">
                                                <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-4 border-b border-white/5 pb-2">
                                                    Round {roundNum}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {roundMatches.map((m, idx) => (
                                                        <div key={m._id} className="bg-surface border border-white/10 p-4 rounded-lg flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
                                                            <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-black/50 border-b border-l border-white/10 rounded-bl text-gray-400">
                                                                Match {idx + 1}
                                                            </div>
                                                            <div className="space-y-2 mt-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-sm font-bold text-white truncate max-w-[150px]">
                                                                        {m.participants && m.participants[0] && m.participants[0].participantId ? m.participants[0].participantId.username : <span className="text-gray-600 font-mono text-xs">TBD / BYE</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-center text-gray-600 font-black italic">VS</div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-sm font-bold text-white truncate max-w-[150px]">
                                                                        {m.participants && m.participants[1] && m.participants[1].participantId ? m.participants[1].participantId.username : <span className="text-gray-600 font-mono text-xs">TBD / BYE</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                                                                <span className={m.status === 'completed' ? 'text-green-500' : 'text-orange-400'}>
                                                                    {m.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Actions & Roster) */}
                    <div className="space-y-8">

                        {/* Action Panel (Enrollment / Host Controls) */}
                        <div className="bg-surface/80 backdrop-blur-md border border-primary/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-neon-blue"></div>

                            {isHost ? (
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4 flex items-center"><FaIdCard className="mr-2 text-primary" /> Host Controls</h3>
                                    <p className="text-gray-400 font-mono text-xs mb-6">You are the commander of this operation.</p>

                                    <button
                                        onClick={handleExport}
                                        className="w-full flex justify-center items-center gap-2 py-3 bg-black hover:bg-white/5 border border-white/20 text-white rounded-xl font-bold text-xs tracking-widest uppercase transition-all mb-4"
                                    >
                                        <FaFileDownload /> Export Roster PDF
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await axios.put(`http://localhost:5000/api/tournaments/${id}/start`, {}, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                setTournament(res.data.tournament);
                                                alert("BRACKET GENERATED SUCCESSFULLY");
                                                window.location.reload();
                                            } catch (e) {
                                                alert(e.response?.data?.message || 'BRACKET GENERATION FAILED');
                                            }
                                        }}
                                        disabled={tournament.status !== 'registration'}
                                        className={`w-full py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all ${tournament.status === 'registration'
                                            ? 'bg-primary text-black hover:bg-neon-blue hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {tournament.status === 'registration' ? 'Generate Bracket' : 'Bracket Locked'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (window.confirm("Are you sure you want to terminate this operation? This will wipe all data and brackets permanently.")) {
                                                try {
                                                    await axios.delete(`http://localhost:5000/api/tournaments/${id}`, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                    alert("OPERATION TERMINATED");
                                                    navigate('/tournaments');
                                                } catch (e) {
                                                    alert(e.response?.data?.message || 'TERMINATION FAILED');
                                                }
                                            }
                                        }}
                                        className="w-full mt-4 py-3 rounded-xl border border-red-500/50 bg-red-500/10 text-red-500 font-bold text-xs tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]"
                                    >
                                        Terminate Operation
                                    </button>
                                </div>
                            ) : isEnrolled ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-green-400 text-2xl">
                                        ✓
                                    </div>
                                    <h3 className="text-lg font-bold text-green-400 uppercase tracking-widest mb-2">Enrolled</h3>
                                    <p className="text-gray-400 font-mono text-xs">
                                        {tournament.status === 'in_progress' ? 'Bracket generated! Awaiting match.' : 'Awaiting bracket generation.'}
                                    </p>
                                </div>
                            ) : canEnroll ? (
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Enrollment Protocol</h3>

                                    {enrollMessage && (
                                        <div className={`p-3 mb-4 text-center font-bold tracking-widest text-[10px] uppercase border rounded ${enrollMessage.includes('FAILED') ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-primary/20 text-primary border-primary/50'}`}>
                                            {enrollMessage}
                                        </div>
                                    )}

                                    <form onSubmit={handleEnrollSubmit} className="space-y-4">
                                        <div>
                                            <div className="relative">
                                                <FaGamepad className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                                                <input
                                                    type="text"
                                                    name="inGameUid"
                                                    value={enrollmentData.inGameUid}
                                                    onChange={handleEnrollmentChange}
                                                    placeholder="In-Game UID"
                                                    required
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                                                <input
                                                    type="text"
                                                    name="inGameName"
                                                    value={enrollmentData.inGameName}
                                                    onChange={handleEnrollmentChange}
                                                    placeholder="In-Game Name (IGN)"
                                                    required
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                                                <input
                                                    type="text"
                                                    name="contactNumber"
                                                    value={enrollmentData.contactNumber}
                                                    onChange={handleEnrollmentChange}
                                                    placeholder="Contact Number (WhatsApp/Discord)"
                                                    required
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={enrollLoading}
                                            className="w-full py-3 mt-2 bg-transparent text-primary hover:bg-primary hover:text-black border border-primary rounded-lg font-black text-xs tracking-widest uppercase transition-all"
                                        >
                                            {enrollLoading ? 'PROCESSING...' : 'CONFIRM ENROLLMENT'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">Registration Closed</h3>
                                    <p className="text-gray-600 font-mono text-xs">This operation is either full or currently in progress.</p>
                                </div>
                            )}
                        </div>

                        {/* Roster Preview */}
                        <div className="bg-surface/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex justify-between items-center">
                                Enrolled Agents
                                <span className="text-primary text-xs">{tournament.enrolledPlayers?.length || 0}</span>
                            </h3>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {tournament.enrolledPlayers && tournament.enrolledPlayers.length > 0 ? (
                                    tournament.enrolledPlayers.map((player, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 bg-black/40 rounded-lg border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 overflow-hidden flex-shrink-0">
                                                <img src={player.user.avatar ? `http://localhost:5000${player.user.avatar}` : 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <div className="text-xs font-bold text-white truncate">{player.user.username}</div>
                                                <div className="text-[10px] text-gray-500 font-mono uppercase truncate">IGN: {player.inGameName}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 font-mono text-xs text-center py-4">No data streams found.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetail;
