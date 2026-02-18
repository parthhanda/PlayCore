import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Tournaments', path: '/tournaments' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="bg-surface border-b border-white/10 p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-display font-bold text-white hover-glow-blue z-50 relative">
                    PLAY<span className="text-primary">CORE</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white text-2xl z-50 relative focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {/* Public Links */}
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-gray-300 hover:text-primary hover:drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] transition-all duration-300 font-display tracking-wide uppercase text-sm"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Dashboard Link (User only) */}
                    {user && (
                        <Link
                            to="/dashboard"
                            className="text-gray-300 hover:text-secondary hover:drop-shadow-[0_0_5px_rgba(255,0,255,0.8)] transition-all duration-300 font-display tracking-wide uppercase text-sm"
                        >
                            Dashboard
                        </Link>
                    )}

                    {user ? (
                        <>
                            <div className="h-6 w-px bg-white/10 mx-2"></div>
                            <Link to={`/u/${user.username}`} className="text-neon-green font-medium hover:text-white transition flex items-center gap-3 group">
                                <div className="text-right hidden lg:block">
                                    <div className="text-xs text-gray-400 group-hover:text-primary transition uppercase tracking-wider">Operative</div>
                                    <div className="font-bold leading-none">{user.username}</div>
                                </div>
                                {user.avatar ? (
                                    <img src={`http://localhost:5000${user.avatar}`} alt="" className="w-10 h-10 rounded-full border border-neon-green object-cover group-hover:shadow-[0_0_15px_rgba(0,255,0,0.5)] transition-all" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full border border-neon-green bg-black flex items-center justify-center font-bold text-neon-green">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </Link>

                            <button
                                onClick={logout}
                                className="ml-4 text-xs font-bold text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-all uppercase tracking-wider"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="h-6 w-px bg-white/10 mx-2"></div>
                            <Link to="/login" className="text-gray-300 hover:text-primary transition-all duration-300 font-display tracking-wide uppercase text-sm">Login</Link>
                            <Link
                                to="/register"
                                className="bg-primary text-black font-bold py-2 px-6 rounded hover:bg-neon-blue transition duration-300 shadow-[0_0_10px_rgba(0,255,255,0.5)] uppercase text-sm tracking-wider"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Overlay Menu */}
                <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            onClick={() => setIsMenuOpen(false)}
                            to={link.path}
                            className="text-2xl text-gray-300 hover:text-primary font-display uppercase tracking-[0.2em]"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="w-16 h-1 bg-white/10 rounded-full my-4"></div>

                    {user ? (
                        <>
                            <Link onClick={() => setIsMenuOpen(false)} to={`/u/${user.username}`} className="text-xl text-neon-green font-bold flex items-center gap-3 border border-white/10 p-4 rounded-xl bg-white/5">
                                {user.avatar && <img src={`http://localhost:5000${user.avatar}`} alt="" className="w-12 h-12 rounded-full border border-neon-green object-cover" />}
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Logged in as</div>
                                    <div>{user.username}</div>
                                </div>
                            </Link>
                            <button
                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                className="text-xl text-red-500 font-bold uppercase tracking-widest mt-4"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-6 items-center w-full px-12">
                            <Link onClick={() => setIsMenuOpen(false)} to="/login" className="text-xl text-white hover:text-primary uppercase tracking-widest">Login</Link>
                            <Link
                                onClick={() => setIsMenuOpen(false)}
                                to="/register"
                                className="bg-primary text-black font-bold py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] uppercase tracking-widest w-full text-center"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
