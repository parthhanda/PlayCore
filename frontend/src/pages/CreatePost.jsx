import { useState, useRef, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaSave, FaPaperPlane } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const CreatePost = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const quillRef = useRef(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Protect from non-logged in users
    if (!user) {
        navigate('/login');
        return null;
    }

    const handleCoverImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 10MB Check on Frontend
        if (file.size > 10 * 1024 * 1024) {
            setError('Cover image exceeds 10MB limit');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/upload/gridfs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setCoverImage(data.image);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            // 10MB Check on Frontend
            if (file.size > 10 * 1024 * 1024) {
                setError('Embedded image exceeds 10MB limit');
                return;
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                const { data } = await axios.post('http://localhost:5000/api/upload/gridfs', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });

                // Insert the returned image URL directly into the editor
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', `http://localhost:5000${data.image}`);
                quill.setSelection(range.index + 1);
            } catch (err) {
                console.error('Image upload failed', err);
                setError('Failed to upload image into editor');
            }
        };
    };

    // React-Quill modules configuration - must be memoized or kept outside component to prevent focus loss on typing
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'video'],
                ['clean'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['code-block']
            ],
            handlers: {
                // Intercept image drops/clicks to use our custom GridFS backend
                image: imageHandler
            }
        }
    }), []); // empty dependency array means it runs once

    const formats = useMemo(() => [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'color', 'background', 'align', 'code-block'
    ], []);

    const handleSubmit = async (e, publishedStatus = false) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !content.trim()) {
            setError('Title and Content are required');
            return;
        }

        try {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
            
            await axios.post('http://localhost:5000/api/posts', {
                title,
                content,
                tags: tagsArray,
                coverImage,
                published: publishedStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/news');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create post');
        }
    };

    return (
        <div className="min-h-screen bg-background text-white pt-24 px-4 pb-20 selection:bg-primary selection:text-black">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-neon-blue drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                        Draft <span className="text-white">Intel</span> Report
                    </h1>
                    <p className="text-gray-400 mt-2 tracking-wide text-xs uppercase font-bold">Secure Publishing Console</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 uppercase text-sm font-bold animate-pulse">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Editor Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                            <input
                                type="text"
                                placeholder="REPORT TITLE..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 pb-4 text-3xl font-display font-bold text-white uppercase focus:outline-none focus:border-primary transition-colors placeholder:text-gray-700 mb-8"
                            />
                            
                            <div className="quill-container bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                {/* Our custom CSS to force React-Quill to match the dark theme */}
                                <style>{`
                                    .ql-toolbar { background-color: rgba(255, 255, 255, 0.05); border: none !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; filter: invert(0.8) hue-rotate(180deg); }
                                    .ql-container { border: none !important; min-height: 400px; font-family: 'Inter', sans-serif; font-size: 16px; }
                                    .ql-editor { color: #e2e8f0; }
                                    .ql-editor p { margin-bottom: 1em; }
                                `}</style>
                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Execute text protocols here..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Metadata */}
                    <div className="space-y-6">
                        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                            <h3 className="text-lg font-bold font-display uppercase tracking-widest text-primary mb-4 border-b border-white/10 pb-2">Transmission Data</h3>
                            
                            {/* Cover Image */}
                            <div className="mb-6">
                                <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Cover Image (Max 10MB)</label>
                                <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 aspect-video flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                    {coverImage ? (
                                        <img src={`http://localhost:5000${coverImage}`} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-600 font-bold uppercase text-xs">No Signal</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold uppercase tracking-widest">{uploading ? 'UPLOADING...' : 'GATHER INTEL'}</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={handleCoverImageUpload}
                                        accept="image/*"
                                        disabled={uploading}
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mb-8">
                                <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="ESPORTS, UPDATE, PATCH..."
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={(e) => handleSubmit(e, true)}
                                    className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all flex items-center justify-center gap-2"
                                >
                                    <FaPaperPlane /> Transmit To Community
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
