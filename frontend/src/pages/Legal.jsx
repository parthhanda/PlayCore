import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBalanceScale, FaUserShield, FaCookieBite, FaHandshake, FaScroll } from 'react-icons/fa';

const Legal = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [hash]);

    return (
        <div className="min-h-screen bg-background text-white pt-32 pb-20 relative font-sans">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent/20 rounded-full bg-accent/10 text-accent text-[10px] font-black tracking-[0.4em] uppercase mb-6">
                        <FaScroll className="text-xs" />
                        Compliance Protocol v2.1
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black font-display uppercase tracking-tighter mb-4">
                        Legal <span className="text-accent italic drop-shadow-[0_0_15px_rgba(255,0,255,0.3)]">Archive</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Global directives for all system operatives</p>
                </div>

                {/* Navigation Quicklinks */}
                <div className="flex flex-wrap justify-center gap-4 mb-20">
                    {['privacy', 'terms', 'cookies', 'conduct'].map((item) => (
                        <a
                            key={item}
                            href={`#${item}`}
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
                        >
                            {item.replace('-', ' ')}
                        </a>
                    ))}
                </div>

                <div className="space-y-32">
                    {/* Privacy Policy */}
                    <section id="privacy" className="scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                <FaUserShield className="text-xl" />
                            </div>
                            <h2 className="text-3xl font-black font-display uppercase tracking-wider text-white">Privacy Policy</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-gray-400 font-medium leading-loose space-y-6">
                            <p className="text-sm tracking-wide uppercase font-bold text-accent/80">Last Updated: March 17, 2026</p>
                            <p>PlayCore Systems ("we", "us", or "our") is committed to protecting the privacy and personal datasets of our operatives. This directive outlines how your data is processed, stored, and encrypted within our global network.</p>
                            <h3 className="text-white text-lg font-bold uppercase tracking-widest mt-8">1. Intelligence Collection</h3>
                            <p>We collect system analytics (IP addresses, device metadata), personal identifiers (usernames, encrypted emails), and competitive performance metrics to optimize bracket distribution and reputation tracking.</p>
                            <h3 className="text-white text-lg font-bold uppercase tracking-widest mt-8">2. Data Encryption</h3>
                            <p>All sensitive transmissions are secured using military-grade AES-256 encryption. Your operational data remains siloed and is never traded with external hostiles (third-party advertisers).</p>
                        </div>
                    </section>

                    {/* Terms of Service */}
                    <section id="terms" className="scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <FaBalanceScale className="text-xl" />
                            </div>
                            <h2 className="text-3xl font-black font-display uppercase tracking-wider text-white">Terms of Service</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-gray-400 font-medium leading-loose space-y-6">
                            <p>By initializing a connection to the PlayCore Terminal, you agree to abide by the primary system directives. Unauthorized access or attempt to subvert the tournament logic will result in immediate termination of your operative status.</p>
                            <h3 className="text-white text-lg font-bold uppercase tracking-widest mt-8">Operative Obligations</h3>
                            <p>You must maintain the security of your account credentials. Any breach in your local node is your responsibility. Competitive integrity must be maintained at all times.</p>
                        </div>
                    </section>

                    {/* Cookie Policy */}
                    <section id="cookies" className="scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                                <FaCookieBite className="text-xl" />
                            </div>
                            <h2 className="text-3xl font-black font-display uppercase tracking-wider text-white">Cookie Policy</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-gray-400 font-medium leading-loose space-y-6">
                            <p>We use session-based authentication beacons ("cookies") to maintain persistent connections to our servers. These small data payloads are essential for real-time socket communication and dashboard personalization.</p>
                            <p>Operatives may disable these beacons via their local terminal (browser settings), though this may cause critical system failures in real-time tournament tracking.</p>
                        </div>
                    </section>

                    {/* Code of Conduct */}
                    <section id="conduct" className="scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                                <FaHandshake className="text-xl" />
                            </div>
                            <h2 className="text-3xl font-black font-display uppercase tracking-wider text-white">Code of Conduct</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-gray-400 font-medium leading-loose space-y-6">
                            <p>The PlayCore ecosystem relies on mutual respect and professional competitive conduct. Hostility, toxicity, and unauthorized exploitation are considered protocol violations.</p>
                            <ul className="list-disc pl-6 space-y-4">
                                <li><strong>Zero Tolerance for Harassment</strong>: Any form of discrimination results in permanent blacklisting.</li>
                                <li><strong>Fair Play Only</strong>: Use of unauthorized tactical software (cheats/hacks) is grounds for asset seizure.</li>
                                <li><strong>Channel Integrity</strong>: Maintain professional comms in global and group channels.</li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Footer seal */}
                <div className="mt-32 pt-12 border-t border-white/5 text-center opacity-30">
                    <img src="/logo-placeholder.png" alt="" className="h-8 mx-auto grayscale mb-4" />
                    <p className="text-[10px] font-mono uppercase tracking-[0.5em]">End of Directive</p>
                </div>
            </div>
        </div>
    );
};

export default Legal;
