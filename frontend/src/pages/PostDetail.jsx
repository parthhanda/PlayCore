import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUser, FaEye, FaArrowLeft, FaTrash, FaArrowUp, FaFlag, FaComment, FaPaperPlane } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const PostDetail = () => {
    const { slug } = useParams();
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [localUpvotes, setLocalUpvotes] = useState(0);
    const [hasUpvoted, setHasUpvoted] = useState(false);

    useEffect(() => {
        fetchPostAndComments();
    }, [slug]);

    const fetchPostAndComments = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts/${slug}`);
            setPost(data);
            setLocalUpvotes(data.upvotes?.length || 0);

            // Fetch comments
            const commentsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments/${data._id}`);
            setComments(commentsRes.data);
        } catch (err) {
            setError('Intel report not found or classified.');
        } finally {
            setLoading(false);
        }
    };

    // Update hasUpvoted state when user loads or data arrives
    useEffect(() => {
        if (post && user) {
            setHasUpvoted(post.upvotes?.includes(user._id));
        }
    }, [post, user]);

    const handleUpvotePost = async () => {
        if (!user) return alert('Must be logged in to upvote');
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts/${post._id}/upvote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocalUpvotes(data.length);
            setHasUpvoted(data.includes(user._id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleReportPost = async () => {
        if (!user) return alert('Must be logged in to report');
        const reason = prompt('Reason for reporting this post:');
        if (!reason) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts/${post._id}/report`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Post reported to admins.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to report');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;
        setSubmittingComment(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments/${post._id}`, { content: newComment }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments([data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error(err);
            alert('Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleUpvoteComment = async (commentId) => {
        if (!user) return alert('Must be logged in to upvote');
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments/item/${commentId}/upvote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(comments.map(c => c._id === commentId ? { ...c, upvotes: data } : c));
        } catch (err) {
            console.error(err);
        }
    };

    const handleReportComment = async (commentId) => {
        if (!user) return alert('Must be logged in to report');
        const reason = prompt('Reason for reporting this comment:');
        if (!reason) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments/item/${commentId}/report`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Comment reported.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to report');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments/item/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('WARNING: Are you sure you want to completely erase this intel record?')) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts/${post._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/news');
        } catch (err) {
            alert('Failed to delete report.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-primary font-display tracking-[0.5em] animate-pulse">DECRYPTING INTEL...</div>
        </div>
    );

    if (error || !post) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center">
            <div className="text-red-500 font-bold tracking-widest uppercase mb-6 text-2xl font-display">{error || 'ERROR CODE 404: INTEL NOT FOUND'}</div>
            <Link to="/news" className="text-primary hover:text-white uppercase tracking-[0.2em] font-bold text-sm transition-colors flex items-center gap-2">
                <FaArrowLeft /> Return to Archive
            </Link>
        </div>
    );

    // Determines if viewing user is the author or admin
    const isAdmin = user && user.roles && user.roles.includes('admin');
    const isAuthor = user && post && (post.author._id === user._id || post.author === user._id);

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 pb-20 font-sans selection:bg-primary selection:text-black">
            <div className="max-w-4xl mx-auto">
                <Link to="/news" className="inline-flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors mb-8 animate-fade-in-up">
                    <FaArrowLeft /> Return to Archive
                </Link>

                <article className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {/* Header */}
                    <div className="mb-12 border-b border-white/10 pb-10">
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-2 mb-6 flex-wrap">
                                {post.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-black uppercase bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded tracking-widest shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display uppercase tracking-tight leading-tight text-white mb-8 border-l-4 border-primary pl-6 py-2 pb-4 shadow-[inset_0_0_0_0_rgba(0,255,255,0)] group-hover:shadow-[inset_20px_0_20px_-20px_rgba(0,255,255,0.5)] transition-all">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 font-bold uppercase tracking-widest bg-black/40 border border-white/5 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <Link to={`/u/${post.author.username}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 overflow-hidden">
                                    <img src={post.author.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.author.avatar}` : 'https://api.dicebear.com/7.x/bottts/svg'} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <span>{post.author.username}</span>
                            </Link>
                            <span className="hidden md:inline text-gray-700">|</span>
                            <span className="flex items-center gap-2"><FaCalendarAlt className="text-primary/70 mb-0.5" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className="hidden md:inline text-gray-700">|</span>
                            <span className="flex items-center gap-2"><FaEye className="text-primary/70 mb-0.5" /> {post.views} Views</span>
                            
                            <button onClick={handleUpvotePost} className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${hasUpvoted ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}>
                                <FaArrowUp /> {localUpvotes} Upvote
                            </button>
                            
                            <button onClick={handleReportPost} className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 hover:bg-yellow-400/10 transition-colors">
                                <FaFlag /> Report
                            </button>
                            
                            {(isAdmin || isAuthor) && (
                                <button onClick={handleDelete} className="ml-auto flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded">
                                    <FaTrash /> PURGE
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cover Image */}
                    {post.coverImage && (
                        <div className="w-full h-64 md:h-[400px] lg:h-[500px] mb-12 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative">
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${post.coverImage}`} alt={post.title} className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none"></div>
                        </div>
                    )}

                    {/* Content Body (Rendered HTML from React-Quill) */}
                    <div className="prose prose-invert prose-lg max-w-none 
                                    prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide
                                    prose-a:text-primary hover:prose-a:text-primary/80 hover:prose-a:drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]
                                    prose-img:rounded-xl prose-img:shadow-[0_0_20px_rgba(0,0,0,0.5)] prose-img:border prose-img:border-white/10
                                    prose-code:text-secondary prose-code:bg-secondary/10 prose-code:px-1.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                                    prose-blockquote:border-l-primary prose-blockquote:bg-black/40 prose-blockquote:text-gray-300 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                                    prose-li:marker:text-primary">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                </article>

                {/* Comment Section */}
                <div className="mt-16 border-t border-white/10 pt-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-2xl font-black font-display uppercase tracking-widest text-white mb-8 flex items-center gap-3">
                        <FaComment className="text-primary" /> Community Comms <span className="text-gray-500 text-sm">({comments.length})</span>
                    </h3>

                    {/* New Comment Input */}
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="mb-12 relative">
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Transmit a message to the community..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 min-h-[120px] text-white focus:outline-none focus:border-primary focus:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all resize-y pb-16"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={submittingComment}
                                className="absolute bottom-4 right-4 bg-primary text-black px-6 py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaPaperPlane /> {submittingComment ? 'Sending...' : 'Transmit'}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-12 p-6 bg-black/40 border border-white/10 rounded-xl text-center">
                            <p className="text-gray-400 mb-4 font-display tracking-widest uppercase">Encryption Required</p>
                            <Link to="/login" className="inline-block bg-primary text-black px-6 py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-white transition-colors">
                                Login to Comment
                            </Link>
                        </div>
                    )}

                    {/* Comment List */}
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8 font-display tracking-widest uppercase">No communications detected yet. Be the first.</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment._id} className="bg-black/40 border border-white/5 p-5 rounded-2xl flex gap-4 group hover:border-white/10 transition-colors">
                                    <Link to={`/u/${comment.author.username}`} className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 overflow-hidden">
                                            <img src={comment.author.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${comment.author.avatar}` : 'https://api.dicebear.com/7.x/bottts/svg'} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Link to={`/u/${comment.author.username}`} className="font-bold text-white hover:text-primary transition-colors">
                                                    {comment.author.username}
                                                </Link>
                                                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {(isAdmin || (user && user._id === comment.author._id)) && (
                                                <button onClick={() => handleDeleteComment(comment._id)} className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed mb-4">{comment.content}</p>
                                        <div className="flex items-center gap-4 border-t border-white/5 pt-3">
                                            <button 
                                                onClick={() => handleUpvoteComment(comment._id)} 
                                                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${(user && comment.upvotes?.includes(user._id)) ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                <FaArrowUp /> {comment.upvotes?.length || 0}
                                            </button>
                                            <button 
                                                onClick={() => handleReportComment(comment._id)}
                                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 font-bold uppercase tracking-wider transition-colors"
                                            >
                                                <FaFlag /> Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
