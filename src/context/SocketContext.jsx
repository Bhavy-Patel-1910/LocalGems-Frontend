import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // 🔴 If no user, don't connect
    if (!user) return;

    // ✅ Backend URL (Render)
    const SOCKET_URL =
      import.meta.env.VITE_API_URL || 'https://localgems-backend-5.onrender.com';

    // ✅ Connect socket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    // ✅ Send user online event
    socketRef.current.emit('user_online', user._id);

    // ✅ Listen for online users
    socketRef.current.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // ✅ Optional: connection logs (debug)
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // 🔴 Cleanup
    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
