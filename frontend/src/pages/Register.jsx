import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import loginBg from '../assets/backgrounds/login-bg.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const validatePassword = (pwd) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasLowerCase = /[a-z]/.test(pwd);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

        if (pwd.length < minLength) return "Password must be at least 8 characters long.";
        if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
        if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
        if (!hasSpecialChar) return "Password must contain at least one special character.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        try {
            await register({ username, email, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${loginBg})` }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up">
                <h2 className="text-3xl font-black text-center text-primary mb-8 tracking-[0.2em] font-display uppercase drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
                    New Operative
                </h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center font-bold tracking-wider uppercase">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-primary text-xs font-bold tracking-[0.2em] mb-2 uppercase">Codename (Username)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:bg-primary/5 transition-all text-sm tracking-wide"
                            placeholder="ENTER CODENAME"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-primary text-xs font-bold tracking-[0.2em] mb-2 uppercase">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:bg-primary/5 transition-all text-sm tracking-wide"
                            placeholder="OPERATIVE@PLAYCORE.COM"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-primary text-xs font-bold tracking-[0.2em] mb-2 uppercase">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pr-10 text-white focus:border-primary focus:outline-none focus:bg-primary/5 transition-all text-sm tracking-wide"
                                placeholder="CREATE ACCESS CODE"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 tracking-wider uppercase">
                            Min 8 chars, 1 Upper, 1 Lower, 1 Special
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-black font-black py-4 rounded-xl text-sm tracking-[0.2em] uppercase hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        Register Protocol
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400 text-xs tracking-widest uppercase">
                    Already Active?{' '}
                    <Link to="/login" className="text-primary hover:text-white hover:underline transition-colors font-bold">
                        Access System
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
