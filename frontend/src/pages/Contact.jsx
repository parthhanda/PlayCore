import { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaDiscord, FaTwitter, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaShieldAlt, FaSatelliteDish, FaCheck } from 'react-icons/fa';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [responseMessage, setResponseMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post('http://localhost:5000/api/contact', formData);
            setStatus('success');
            setResponseMessage('TRANSMISSION SUCCESSFUL. OUR INTELLIGENCE TEAM WILL CONTACT YOU SOON.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setResponseMessage('TRANSMISSION FAILED. PLEASE CHECK YOUR UPLINK AND TRY AGAIN.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white pt-32 pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-4 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(0,255,255,0.8)]"></span>
                        Communications Hub
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-black font-display uppercase tracking-tighter leading-tight">
                        Contact <span className="text-primary italic drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] block sm:inline">Intelligence</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-[10px] md:text-base tracking-wide uppercase font-bold opacity-70 px-4">
                        Establish a secure channel with the PlayCore High Command for tactical inquiries and support.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                    {/* Left Column: Info Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Location Card */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <FaMapMarkerAlt className="text-xl" />
                            </div>
                            <h3 className="text-lg font-bold font-display uppercase tracking-widest text-white mb-2">Central Node</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                Silicon Valley HQ<br />
                                Palo Alto, CA 94301<br />
                                United States
                            </p>
                            <div className="h-px w-full bg-white/5"></div>
                        </div>

                        {/* Social Relay */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-8 hover:border-secondary/30 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                                <FaSatelliteDish className="text-xl" />
                            </div>
                            <h3 className="text-lg font-bold font-display uppercase tracking-widest text-white mb-4">Social Relay</h3>
                            <div className="space-y-4">
                                <a href="#" className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors">
                                    <FaDiscord className="text-xl" />
                                    <span className="text-xs font-bold tracking-widest uppercase">Discord / PlayCore</span>
                                </a>
                                <a href="#" className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors">
                                    <FaTwitter className="text-xl" />
                                    <span className="text-xs font-bold tracking-widest uppercase">Twitter / @PlayCoreGG</span>
                                </a>
                                <a href="#" className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors">
                                    <FaGlobe className="text-xl" />
                                    <span className="text-xs font-bold tracking-widest uppercase">Network Portal</span>
                                </a>
                            </div>
                        </div>

                        {/* Secure Channel */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-8 hover:border-accent/30 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                                <FaShieldAlt className="text-xl" />
                            </div>
                            <h3 className="text-lg font-bold font-display uppercase tracking-widest text-white mb-2">Secure Channel</h3>
                            <p className="text-gray-500 text-sm mb-4">General Inquiries / Support</p>
                            <a href="mailto:playcore.noreply@gmail.com" className="text-accent text-xs font-black tracking-widest uppercase hover:underline">
                                playcore.noreply@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <FaEnvelope className="text-[200px]" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-widest text-white mb-2">Initiate <span className="text-primary">Primary Query</span></h2>
                                <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest font-bold">Fields marked with * are required for authentication.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Operative Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="ENTER FULL NAME"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-all placeholder:text-gray-700 text-sm tracking-widest font-bold uppercase"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Uplink Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="EMAIL@DOMAIN.COM"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-all placeholder:text-gray-700 text-sm tracking-widest font-bold uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Transmission Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="SCAN FOR SUBJECT..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-all placeholder:text-gray-700 text-sm tracking-widest font-bold uppercase"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Secure Message Payload *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="ENTER MESSAGE CONTENT..."
                                            rows="5"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-all placeholder:text-gray-700 text-sm tracking-widest font-bold uppercase resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.5em] uppercase flex items-center justify-center gap-3 transition-all duration-300 ${
                                            status === 'success' ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.4)]' :
                                            status === 'error' ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]' :
                                            'bg-primary text-black hover:bg-white hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]'
                                        }`}
                                    >
                                        {status === 'loading' ? (
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        ) : status === 'success' ? (
                                            <><FaCheck /> Transmission Success</>
                                        ) : (
                                            <><FaPaperPlane /> Broadcast Transmission</>
                                        )}
                                    </button>

                                    {responseMessage && (
                                        <div className={`text-center text-[10px] font-black tracking-widest uppercase mt-4 animate-bounce ${
                                            status === 'success' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {responseMessage}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
