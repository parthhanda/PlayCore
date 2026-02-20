import { Link, useLocation } from 'react-router-dom';
import { FaDiscord, FaTwitter, FaGithub, FaPaperPlane, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    return (
        <footer className="bg-black/90 border-t border-white/10 pt-16 pb-8 font-sans text-gray-400">
            <div className="container mx-auto px-4">

                {isHomePage && (
                    <>
                        {/* Newsletter Section */}
                        <div className="bg-gradient-to-r from-primary/10 to-blue-900/10 border border-primary/20 rounded-2xl p-8 md:p-12 mb-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <FaEnvelope className="text-9xl text-primary transform -rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center md:text-left max-w-xl">
                                    <h3 className="text-2xl md:text-3xl font-bold text-white font-display uppercase tracking-wide mb-2">
                                        Join the <span className="text-primary">Inner Circle</span>
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-400">
                                        Subscribe for tournament updates, exclusive drops, and tactical briefings designated for operatives.
                                    </p>
                                </div>

                                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                                    <input
                                        type="email"
                                        placeholder="ENTER EMAIL ADDRESS"
                                        className="bg-black/50 border border-white/10 text-white px-6 py-3 rounded-xl focus:border-primary focus:outline-none w-full md:w-80 text-sm tracking-widest placeholder:text-gray-600"
                                    />
                                    <button className="bg-primary text-black font-bold px-8 py-3 rounded-xl uppercase tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all flex items-center justify-center gap-2">
                                        <FaPaperPlane /> Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Footer Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                            {/* Brand */}
                            <div className="space-y-4">
                                <Link to="/" className="text-3xl font-display font-bold text-white block">
                                    PLAY<span className="text-primary">CORE</span>
                                </Link>
                                <p className="text-sm leading-relaxed max-w-xs">
                                    The next-generation esports ecosystem. Built for competitors, by competitors. Dominate the arena.
                                </p>
                                <div className="flex gap-4 pt-2">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300">
                                        <FaDiscord />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300">
                                        <FaTwitter />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300">
                                        <FaGithub />
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest mb-6 border-l-4 border-primary pl-4">Platform</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><Link to="/" className="hover:text-primary transition-colors">Home Base</Link></li>
                                    <li><Link to="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link></li>
                                    <li><Link to="/squads" className="hover:text-primary transition-colors">Squads</Link></li>
                                    <li><Link to="/directory" className="hover:text-primary transition-colors">Operatives</Link></li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest mb-6 border-l-4 border-secondary pl-4">Support</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
                                    <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Intelligence</Link></li>
                                    <li><a href="#" className="hover:text-secondary transition-colors">System Status</a></li>
                                    <li><a href="#" className="hover:text-secondary transition-colors">Knowledge Base</a></li>
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest mb-6 border-l-4 border-accent pl-4">Legal Protocol</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
                                    <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
                                    <li><a href="#" className="hover:text-accent transition-colors">Code of Conduct</a></li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <span>&copy; {new Date().getFullYear()} PlayCore Systems. All rights reserved.</span>
                        <span className="hidden md:block text-gray-700">|</span>
                        <span>
                            Made with <span className="text-red-500">❤️</span> by{' '}
                            <a
                                href="https://github.com/parthhanda"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-primary transition-colors font-bold"
                            >
                                Parth Handa
                            </a>
                        </span>
                    </div>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            System Operational
                        </span>
                        <span>v1.0.4-beta</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
