import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import heroBg from '../assets/hero-bg.jpg';
import { FaGamepad, FaTrophy, FaUsers, FaArrowRight, FaPlay, FaMicrochip } from 'react-icons/fa';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [xp, setXp] = useState(0);
    const [loading, setLoading] = useState(true);

    // Simulated Loading Sequence
    useEffect(() => {
        const timer = setInterval(() => {
            setXp((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => setLoading(false), 500);
                    return 100;
                }
                return prev + 5;
            });
        }, 50);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center font-display text-primary">
                <div className="w-64 h-2 bg-gray-900 rounded-full mb-4 overflow-hidden border border-white/20">
                    <div
                        className="h-full bg-primary shadow-[0_0_15px_rgba(0,255,255,0.8)] transition-all duration-75"
                        style={{ width: `${xp}%` }}
                    ></div>
                </div>
                <div className="text-xl tracking-[0.5em] animate-pulse">INITIALIZING SYSTEM... {xp}%</div>
            </div>
        );
    }

    return (
        <div className="bg-background text-white min-h-screen font-sans selection:bg-primary selection:text-black overflow-x-hidden">

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none"
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-full bg-primary/10 backdrop-blur-md text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4 animate-bounce">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgb(0,255,255)]"></span>
                        System Online v1.0
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase font-display drop-shadow-[0_0_25px_rgba(0,255,255,0.5)] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                        Dominate the <span className="text-primary drop-shadow-[0_0_30px_rgba(0,255,255,0.8)]">Arena</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-gray-300 font-light max-w-2xl mx-auto tracking-wide leading-relaxed">
                        The ultimate esports ecosystem. Compete in tournaments, build your squad, and climb the global leaderboards.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
                        {user ? (
                            <Link
                                to="/tournaments"
                                className="group relative px-8 py-4 bg-primary text-black font-black text-lg tracking-[0.2em] clip-path-polygon hover:bg-white hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300 uppercase flex items-center justify-center gap-3"
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                            >
                                <FaPlay className="text-sm" /> Enter Protocol
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="group relative px-8 py-4 bg-primary text-black font-black text-lg tracking-[0.2em] hover:bg-white hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300 uppercase flex items-center justify-center gap-3"
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                            >
                                <FaMicrochip className="text-sm" /> Initialize Mission
                            </Link>
                        )}
                        <Link
                            to="/tournaments"
                            className="group px-8 py-4 border border-white/20 bg-black/40 backdrop-blur-md text-white font-bold text-lg tracking-[0.2em] hover:border-primary hover:text-primary transition-all duration-300 uppercase flex items-center justify-center gap-3"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                        >
                            Explore Bracket <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Holographic Footer HUD */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent flex justify-around items-end pb-6 px-4 md:px-20 font-display text-xs tracking-[0.3em] text-gray-500 uppercase pointer-events-none">
                    <div className="hidden md:flex flex-col items-center">
                        <span className="text-primary font-bold animate-pulse">Server Status</span>
                        <span>Orbit-1 [Active]</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-primary font-bold">{Math.floor(Math.random() * 5000) + 1000}</span>
                        <span>Agents Online</span>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                        <span className="text-primary font-bold">Latency</span>
                        <span>12ms</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-white font-display mb-4 uppercase tracking-tighter">
                            Tactical <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-blue">Modules</span>
                        </h2>
                        <div className="h-1 w-24 bg-primary mx-auto rounded-full shadow-[0_0_10px_rgba(0,255,255,0.8)]"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Module 1 */}
                        <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-primary/50 transition-all duration-500">
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="bg-black/80 backdrop-blur-xl h-full p-8 rounded-xl border border-white/5 relative overflow-hidden group-hover:border-primary/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FaTrophy className="text-9xl text-white transform rotate-12" />
                                </div>
                                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                                    <FaTrophy className="text-3xl text-primary drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                                </div>
                                <h3 className="text-2xl font-bold font-display text-white mb-2 uppercase tracking-wide group-hover:text-primary transition-colors">
                                    Tournaments
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm mb-6">
                                    Automated bracket generation and real-time match tracking. Compete for glory and high-tier rewards.
                                </p>
                                <a href="#" className="text-primary text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Access Module <FaArrowRight />
                                </a>
                            </div>
                        </div>

                        {/* Module 2 */}
                        <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-secondary/50 transition-all duration-500">
                            <div className="absolute inset-0 bg-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="bg-black/80 backdrop-blur-xl h-full p-8 rounded-xl border border-white/5 relative overflow-hidden group-hover:border-secondary/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FaUsers className="text-9xl text-white transform -rotate-12" />
                                </div>
                                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-6 border border-secondary/20 group-hover:scale-110 transition-transform duration-300">
                                    <FaUsers className="text-3xl text-secondary drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
                                </div>
                                <h3 className="text-2xl font-bold font-display text-white mb-2 uppercase tracking-wide group-hover:text-secondary transition-colors">
                                    Squad Systems
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm mb-6">
                                    Form alliances. Recruit operatives. Manage your team roster and challenge rival squads for dominance.
                                </p>
                                <a href="#" className="text-secondary text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Access Module <FaArrowRight />
                                </a>
                            </div>
                        </div>

                        {/* Module 3 */}
                        <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-accent/50 transition-all duration-500">
                            <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="bg-black/80 backdrop-blur-xl h-full p-8 rounded-xl border border-white/5 relative overflow-hidden group-hover:border-accent/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FaGamepad className="text-9xl text-white transform rotate-6" />
                                </div>
                                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-6 border border-accent/20 group-hover:scale-110 transition-transform duration-300">
                                    <FaGamepad className="text-3xl text-accent drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
                                </div>
                                <h3 className="text-2xl font-bold font-display text-white mb-2 uppercase tracking-wide group-hover:text-accent transition-colors">
                                    Global Hub
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm mb-6">
                                    Connect with millions of gamers. Share stats, stream highlights, and build your legacy in the archive.
                                </p>
                                <a href="#" className="text-accent text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Access Module <FaArrowRight />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
