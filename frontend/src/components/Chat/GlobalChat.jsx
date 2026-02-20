import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
    FaCommentAlt, FaPaperPlane, FaTimes,
    FaUserFriends,
    FaGlobe,
    FaExpand,
    FaMinus,
    FaArrowLeft,
    FaLock
} from 'react-icons/fa';
import { getAvatarUrl } from '../../utils/avatarUtils';

const ChatWidget = () => {
    const { socket, onlineUsers } = useSocket();
    const { user } = useAuth();

    // UI State
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeTab, setActiveTab] = useState('global'); // 'global' or 'friends'
    const [activePrivateChat, setActivePrivateChat] = useState(null); // userData object if chatting privately

    // Data State
    const [globalMessage, setGlobalMessage] = useState('');
    const [privateMessage, setPrivateMessage] = useState('');
    const [globalMessages, setGlobalMessages] = useState([]);
    const [privateMessages, setPrivateMessages] = useState({}); // { friendId: [msgs] }
    const [friends, setFriends] = useState([]);

    const messagesEndRef = useRef(null);

    // Fetch Friends on load
    useEffect(() => {
        if (user && isOpen && activeTab === 'friends') {
            fetchFriends();
        }
    }, [user, isOpen, activeTab]);

    const fetchFriends = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/users/friends/list');
            setFriends(data);
        } catch (err) {
            console.error("Failed to fetch friends", err);
        }
    };

    const [typingUsers, setTypingUsers] = useState({}); // { roomId: username }
    const timeoutRef = useRef(null);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (data) => {
            setGlobalMessages((prev) => [...prev, data]);
        });

        socket.on('receive_private_message', (data) => {
            // data: { roomId, sender, message, time, senderId }
            const otherId = data.senderId === user._id ? data.receiverId : data.senderId;

            // Mark as unseen if chat not open? (Implementation for later: Badges)

            setPrivateMessages(prev => ({
                ...prev,
                [otherId]: [...(prev[otherId] || []), data]
            }));
        });

        socket.on('display_typing', ({ user, roomId }) => {
            setTypingUsers(prev => ({ ...prev, [roomId]: user }));
        });

        socket.on('hide_typing', ({ roomId }) => {
            setTypingUsers(prev => {
                const newState = { ...prev };
                delete newState[roomId];
                return newState;
            });
        });

        socket.on('chat_history', ({ roomId, messages }) => {
            if (messages && messages.length > 0) {
                const [id1, id2] = roomId.split('_');
                const otherId = id1 === user._id ? id2 : id1;

                setPrivateMessages(prev => ({
                    ...prev,
                    [otherId]: messages
                }));
            }
        });

        // Join global room
        socket.emit('join_room', 'global');

        return () => {
            socket.off('receive_message');
            socket.off('receive_private_message');
            socket.off('display_typing');
            socket.off('hide_typing');
            socket.off('chat_history');
        };
    }, [socket, user]);

    // Listen for external open chat requests (from Profile)
    useEffect(() => {
        const handleOpenChat = (event) => {
            const friend = event.detail;
            setIsOpen(true);
            setIsMinimized(false);
            setActiveTab('friends');
            startPrivateChat(friend);
        };

        window.addEventListener('open-private-chat', handleOpenChat);
        return () => window.removeEventListener('open-private-chat', handleOpenChat);
    }, [socket, user]);


    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [globalMessages, privateMessages, activePrivateChat, isOpen, typingUsers]);

    const handleTyping = (roomId) => {
        if (!socket) return;
        socket.emit('typing', { roomId, user: user.username });

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { roomId });
        }, 2000);
    };

    const sendGlobalMessage = (e) => {
        e.preventDefault();
        if (globalMessage.trim() && socket) {
            const msgData = {
                room: 'global',
                author: user.username,
                avatar: user.avatar,
                message: globalMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            socket.emit('send_message', msgData);
            setGlobalMessage('');
        }
    };

    const sendPrivateMsg = (e) => {
        e.preventDefault();
        if (privateMessage.trim() && socket && activePrivateChat) {
            const roomId = [user._id, activePrivateChat._id].sort().join('_');

            const msgData = {
                roomId,
                sender: user.username,
                senderId: user._id,
                receiverId: activePrivateChat._id,
                avatar: user.avatar,
                message: privateMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            socket.emit('send_private_message', msgData);
            socket.emit('stop_typing', { roomId });
            setPrivateMessage('');
        }
    };

    const startPrivateChat = (friend) => {
        setActivePrivateChat(friend);
        const roomId = [user._id, friend._id].sort().join('_');
        socket.emit('join_private_chat', { roomId });
    };

    if (!user) return null;

    const currentPrivateRoomId = activePrivateChat ? [user._id, activePrivateChat._id].sort().join('_') : null;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-primary text-black p-4 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:scale-110 transition-transform z-50 animate-bounce"
            >
                <FaCommentAlt className="text-xl" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-black/90 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col ${isMinimized ? 'h-16' : 'h-[500px]'}`}>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 rounded-t-2xl cursor-pointer" onClick={() => !isMinimized && setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h3 className="font-display font-bold text-white tracking-widest uppercase text-sm">
                        {activePrivateChat ? activePrivateChat.username : 'Comms System'}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="text-gray-400 hover:text-white p-1"
                    >
                        {isMinimized ? <FaExpand /> : <FaMinus />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-red-500 p-1"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <>
                    {/* Navigation Tabs (only if not in private chat) */}
                    {!activePrivateChat && (
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('global')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'global' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-white'}`}
                            >
                                <FaGlobe /> Global
                            </button>
                            <button
                                onClick={() => setActiveTab('friends')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'friends' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-white'}`}
                            >
                                <FaUserFriends /> Friends
                            </button>
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">

                        {/* GLOBAL CHAT */}
                        {activeTab === 'global' && !activePrivateChat && (
                            <>
                                {globalMessages.map((msg, index) => (
                                    <div key={index} className={`flex gap-3 ${msg.author === user.username ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 border border-white/10 overflow-hidden">
                                            <img src={getAvatarUrl(msg.avatar)} alt={msg.author} className="w-full h-full object-cover bg-black" />
                                        </div>
                                        <div className={`flex flex-col max-w-[75%] ${msg.author === user.username ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.author === user.username ? 'text-primary' : 'text-secondary'}`}>
                                                    {msg.author}
                                                </span>
                                                <span className="text-[10px] text-gray-600">{msg.time}</span>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl text-sm ${msg.author === user.username ? 'bg-primary/20 text-primary border border-primary/20 rounded-tr-none' : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* FRIENDS LIST */}
                        {activeTab === 'friends' && !activePrivateChat && (
                            <div className="space-y-2">
                                {friends.length === 0 && (
                                    <div className="text-center text-gray-500 text-xs mt-10">No operatives in network.</div>
                                )}
                                {friends.map((friend) => (
                                    <div
                                        key={friend._id}
                                        onClick={() => startPrivateChat(friend)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 hover:border-primary/30 group"
                                    >
                                        <div className="relative">
                                            <img
                                                src={getAvatarUrl(friend.avatar)}
                                                alt={friend.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${onlineUsers.includes(friend._id) ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{friend.username}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                                                {onlineUsers.includes(friend._id) ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PRIVATE CHAT */}
                        {activePrivateChat && (
                            <div className="flex flex-col h-full">
                                <button
                                    onClick={() => setActivePrivateChat(null)}
                                    className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2"
                                >
                                    <FaArrowLeft /> Return to Network
                                </button>

                                <div className="space-y-4">
                                    <div className="text-center my-4">
                                        <p className="text-[10px] text-green-500/70 border border-green-500/30 bg-green-500/10 px-3 py-1 rounded inline-block uppercase tracking-widest font-mono">
                                            <FaLock className="inline-block mr-1 mb-0.5" />
                                            Secure Channel: Encrypted & Auto-Deleted (24h)
                                        </p>
                                    </div>

                                    {(privateMessages[activePrivateChat._id] || []).map((msg, index) => (
                                        <div key={index} className={`flex gap-3 ${msg.sender === user.username ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 border border-white/10 overflow-hidden">
                                                <img
                                                    src={msg.sender === user.username ? getAvatarUrl(user.avatar) : getAvatarUrl(activePrivateChat.avatar)}
                                                    alt={msg.sender}
                                                    className="w-full h-full object-cover bg-black"
                                                />
                                            </div>
                                            <div className={`flex flex-col max-w-[75%] ${msg.sender === user.username ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.sender === user.username ? 'text-primary' : 'text-secondary'}`}>
                                                        {msg.sender}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600">{msg.time}</span>
                                                </div>
                                                <div className={`px-4 py-2 rounded-2xl text-sm ${msg.sender === user.username ? 'bg-primary/20 text-primary border border-primary/20 rounded-tr-none' : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none'}`}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Typing Indicator */}
                        {typingUsers[currentPrivateRoomId] && typingUsers[currentPrivateRoomId] !== user.username && (
                            <div className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center italic">
                                    {typingUsers[currentPrivateRoomId]} is transmitting...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={activePrivateChat ? sendPrivateMsg : sendGlobalMessage} className="p-4 border-t border-white/10 bg-black/40 rounded-b-2xl">
                        {(activeTab === 'global' || activePrivateChat) ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={activePrivateChat ? privateMessage : globalMessage}
                                    onChange={(e) => {
                                        if (activePrivateChat) {
                                            setPrivateMessage(e.target.value);
                                            handleTyping([user._id, activePrivateChat._id].sort().join('_'));
                                        } else {
                                            setGlobalMessage(e.target.value);
                                        }
                                    }}
                                    placeholder={activePrivateChat ? `Message ${activePrivateChat.username}...` : "TRANSMIT GLOBAL MESSAGE..."}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600 tracking-wide"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary text-black p-3 rounded-xl hover:bg-white transition-colors"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-xs text-gray-500 uppercase tracking-widest">
                                Select an operative to initialize comms.
                            </div>
                        )}
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatWidget;
