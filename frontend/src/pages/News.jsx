import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUser, FaEye, FaArrowUp, FaPen } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const News = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts`);
            setPosts(data.posts);
        } catch (error) {
            console.error('Error fetching intel:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-secondary font-display tracking-[0.5em] animate-pulse">DECRYPTING INTEL...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 font-sans selection:bg-primary selection:text-black">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            Community <span className="text-primary drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">Feed</span>
                        </h1>
                        <p className="text-gray-400 mt-2 tracking-wide text-sm uppercase">Open discussions, updates, and community posts.</p>
                    </div>
                    {user && (
                        <Link to="/admin/news/create" className="bg-primary text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                            <FaPen /> Draft Intel
                        </Link>
                    )}
                </div>

                {/* Grid */}
                {posts.length === 0 ? (
                    <div className="text-center text-gray-500 font-display tracking-widest mt-20">NO INTEL DETECTED</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link 
                                to={`/news/${post.slug}`} 
                                key={post._id}
                                className="group bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] hover:-translate-y-2 flex flex-col"
                            >
                                {/* Cover Image */}
                                <div className="h-48 bg-gray-900 relative overflow-hidden">
                                    {post.coverImage ? (
                                        <img 
                                            src={`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.coverImage}`} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                                    
                                    {/* Tag */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="absolute top-4 left-4 bg-primary text-black text-[10px] font-black uppercase px-2 py-1 rounded tracking-wider shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                                            {post.tags[0]}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h2 className="text-xl font-bold font-display uppercase tracking-wide text-white group-hover:text-primary transition-colors mb-4 line-clamp-2">
                                        {post.title}
                                    </h2>
                                    
                                    {/* Fallback preview by removing HTML tags from content */}
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-6" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' }}></p>
                                    
                                    <div className="mt-auto flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-primary/70" /> {post.author.username}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5"><FaCalendarAlt /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><FaEye /> {post.views}</span>
                                            <span className="flex items-center gap-1.5 text-green-400"><FaArrowUp /> {post.upvotes?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
