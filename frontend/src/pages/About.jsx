import { FaShieldAlt, FaRocket, FaUsers, FaCode, FaGamepad, FaTrophy } from 'react-icons/fa';

const About = () => {
    return (
        <div className="min-h-screen bg-background text-white pt-32 pb-20 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[10%] right-[5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-8 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                        Accessing Archive: Origin
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black font-display uppercase tracking-tighter mb-8 leading-[0.9]">
                        Beyond the <span className="text-primary italic drop-shadow-[0_0_25px_rgba(0,255,255,0.4)]">Arena</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
                        PlayCore isn't just a platform. It's the hardware-accelerated heartbeat of the next generation of competitive gaming.
                    </p>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-32">
                    <div className="bg-black/40 border border-white/5 p-10 rounded-3xl hover:border-primary/20 transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FaRocket className="text-9xl" />
                        </div>
                        <FaRocket className="text-4xl text-primary mb-6" />
                        <h2 className="text-2xl font-bold font-display uppercase tracking-widest mb-4">The Mission</h2>
                        <p className="text-gray-500 leading-relaxed font-medium">
                            To decentralize high-stakes competition. We provide the infrastructure for every operative to find their squad, sharpen their skills, and claim their throne in the digital pantheon.
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-10 rounded-3xl hover:border-secondary/20 transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FaShieldAlt className="text-9xl" />
                        </div>
                        <FaShieldAlt className="text-4xl text-secondary mb-6" />
                        <h2 className="text-2xl font-bold font-display uppercase tracking-widest mb-4">The Protocol</h2>
                        <p className="text-gray-500 leading-relaxed font-medium">
                            Integrity is our primary directive. Our automated systems ensure absolute fairness, zero-latency coordination, and millisecond-accurate analytics for every tournament listed.
                        </p>
                    </div>
                </div>

                {/* Values / Stats Section */}
                <div className="border-y border-white/5 py-20 mb-32 relative">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                        <div className="space-y-2">
                            <div className="text-4xl md:text-6xl font-black font-display text-white tracking-tighter">100%</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Automated Brackets</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl md:text-6xl font-black font-display text-white tracking-tighter">0.1ms</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Coordination Latency</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl md:text-6xl font-black font-display text-white tracking-tighter">∞</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Competitive Potential</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl md:text-6xl font-black font-display text-white tracking-tighter">Global</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Operative Network</div>
                        </div>
                    </div>
                </div>

                {/* Technology Section */}
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-1 md:p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="bg-background rounded-[2.9rem] p-12 md:p-20 text-center space-y-8">
                        <div className="flex justify-center gap-6 text-gray-700">
                            <FaCode className="text-3xl" />
                            <FaGamepad className="text-3xl" />
                            <FaTrophy className="text-3xl" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight">
                            Engineered for <span className="text-primary underline decoration-secondary decoration-4 underline-offset-8">Dominance</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto leading-loose text-sm uppercase font-bold tracking-widest opacity-80">
                            Building on a stack of cutting-edge technologies, PlayCore delivers a robust, real-time experience that handles thousands of concurrent socket connections without breaking a sweat.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
