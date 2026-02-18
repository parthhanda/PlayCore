import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000', {
                query: { userId: user._id },
                transports: ['websocket']
            });

            setSocket(newSocket);

            newSocket.on('online_users', (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.off('online_users');
                newSocket.close();
            }
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
