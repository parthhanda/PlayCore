import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaTrophy, FaUsers, FaArrowRight, FaUserAstronaut, FaSatelliteDish } from 'react-icons/fa';
import { getAvatarUrl } from '../utils/avatarUtils';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-white font-sans pt-12 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-16 animate-fade-in-up">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75"></div>
                        <img
                            src={getAvatarUrl(user.avatar)}
                            alt={user.username}
                            className="relative w-32 h-32 rounded-full border-4 border-black object-cover"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter mb-2">
                            Welcome Back, <span className="text-primary">{user.username}</span>
                        </h1>
                        <p className="text-gray-400 uppercase tracking-widest text-sm">System Online. Awaiting Orders.</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="md:ml-auto flex gap-6 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">{user.stats?.elo || 1200}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ELO Rating</div>
                        </div>
                        <div className="w-px bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">{user.stats?.wins || 0}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Victories</div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Squads Module */}
                    <Link to="/squads" className="group bg-black/40 border border-white/10 rounded-3xl p-8 hover:bg-white/5 hover:border-secondary/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaUsers className="text-8xl text-secondary" />
                        </div>
                        <FaUsers className="text-4xl text-secondary mb-6" />
                        <h3 className="text-2xl font-bold font-display uppercase mb-2">Squads</h3>
                        <p className="text-gray-400 text-xs mb-6 h-10">Join a faction or manage your existing team roster.</p>
                        <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                            Access Module <FaArrowRight />
                        </div>
                    </Link>

                    {/* Operatives Module */}
                    <Link to="/players" className="group bg-black/40 border border-white/10 rounded-3xl p-8 hover:bg-white/5 hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaUserAstronaut className="text-8xl text-primary" />
                        </div>
                        <FaUserAstronaut className="text-4xl text-primary mb-6" />
                        <h3 className="text-2xl font-bold font-display uppercase mb-2">Operatives</h3>
                        <p className="text-gray-400 text-xs mb-6 h-10">Search the global player database and connect.</p>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                            Access Module <FaArrowRight />
                        </div>
                    </Link>

                    {/* Tournaments Module */}
                    <Link to="/tournaments" className="group bg-black/40 border border-white/10 rounded-3xl p-8 hover:bg-white/5 hover:border-yellow-500/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaTrophy className="text-8xl text-yellow-500" />
                        </div>
                        <FaTrophy className="text-4xl text-yellow-500 mb-6" />
                        <h3 className="text-2xl font-bold font-display uppercase mb-2">Tournaments</h3>
                        <p className="text-gray-400 text-xs mb-6 h-10">View active brackets and competitive events.</p>
                        <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                            Access Module <FaArrowRight />
                        </div>
                    </Link>

                    {/* Comms Module */}
                    <Link to="/players" className="group bg-black/40 border border-white/10 rounded-3xl p-8 hover:bg-white/5 hover:border-neon-green/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaSatelliteDish className="text-8xl text-neon-green" />
                        </div>
                        <FaSatelliteDish className="text-4xl text-neon-green mb-6" />
                        <h3 className="text-2xl font-bold font-display uppercase mb-2">Comms</h3>
                        <p className="text-gray-400 text-xs mb-6 h-10">Check messages and incoming friend requests.</p>
                        <div className="flex items-center gap-2 text-neon-green font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                            Access Module <FaArrowRight />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
