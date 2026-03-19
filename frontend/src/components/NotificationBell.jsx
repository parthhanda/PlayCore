import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaTimes, FaCheck, FaCheckDouble } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getAvatarUrl } from '../utils/avatarUtils';

const NotificationBell = () => {
    const { user, token } = useContext(AuthContext);
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch unread count on mount
    useEffect(() => {
        if (!user || !token) return;
        fetchUnreadCount();
    }, [user, token]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => socket.off('new_notification');
    }, [socket]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/unread-count`, { headers });
            setUnreadCount(data.count);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications?limit=15`, { headers });
            setNotifications(data.notifications);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        if (!isOpen) fetchNotifications();
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.read) {
            try {
                await axios.put(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/${notif._id}/read`, {}, { headers });
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) { /* ignore */ }
        }
        if (notif.link) navigate(notif.link);
        setIsOpen(false);
    };

    const markAllRead = async () => {
        try {
            await axios.put(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/read-all`, {}, { headers });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) { /* ignore */ }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-400 hover:text-primary transition-colors"
            >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,0,0,0.5)] animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-80 md:w-96 bg-black/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Notifications</span>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] text-primary hover:text-white transition-colors flex items-center gap-1 font-bold uppercase tracking-wider">
                                    <FaCheckDouble /> All Read
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <FaTimes className="text-xs" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto scrollbar-thin">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500 text-xs uppercase tracking-widest animate-pulse">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-xs uppercase tracking-widest">No notifications yet</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${!notif.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 overflow-hidden shrink-0 mt-0.5">
                                        <img src={notif.sender ? getAvatarUrl(notif.sender.avatar) : 'https://api.dicebear.com/7.x/bottts/svg'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-relaxed ${notif.read ? 'text-gray-500' : 'text-gray-200'}`}>
                                            {notif.message}
                                        </p>
                                        <span className="text-[10px] text-gray-600">{getTimeAgo(notif.createdAt)}</span>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
