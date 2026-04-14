import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Search, ArrowLeft, Circle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isOwn ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-dark-700 text-gray-100 rounded-bl-sm'
      }`}>
        {msg.message}
        <div className={`text-[10px] mt-1 ${isOwn ? 'text-orange-200' : 'text-gray-500'}`}>
          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          {isOwn && msg.seen && <span className="ml-1">✓✓</span>}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { userId: chatPartnerId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversations
  useEffect(() => {
    const loadConvs = async () => {
      try {
        const { data } = await api.get('/messages');
        setConversations(data.data.conversations);
      } catch {}
      setLoading(false);
    };
    loadConvs();
  }, []);

  // Auto-open conversation from URL param
  useEffect(() => {
    if (chatPartnerId && conversations.length > 0) {
      const conv = conversations.find((c) => c.user?._id === chatPartnerId);
      if (conv) setActiveUser(conv.user);
      else loadUserAndOpen(chatPartnerId);
    } else if (chatPartnerId) {
      loadUserAndOpen(chatPartnerId);
    }
  }, [chatPartnerId, conversations]);

  const loadUserAndOpen = async (uid) => {
    try {
      // Try to get messages first (may be empty for new conversation)
      const { data: convData } = await api.get(`/messages/${uid}`);
      setMessages(convData.data.messages);

      // Try to find user info from talent profiles or existing messages
      const msgs = convData.data.messages;
      if (msgs.length > 0) {
        // Extract partner info from messages
        const partnerMsg = msgs.find(m =>
          (m.senderId?._id || m.senderId) !== user._id &&
          (m.senderId?._id || m.senderId) !== user._id.toString()
        ) || msgs[0];
        const partnerId = (partnerMsg.senderId?._id || partnerMsg.senderId)?.toString() === user._id.toString()
          ? (partnerMsg.receiverId?._id || partnerMsg.receiverId)
          : (partnerMsg.senderId?._id || partnerMsg.senderId);
        // Find in conversations or set placeholder
        const existing = conversations.find(c => c.user?._id === uid);
        setActiveUser(existing?.user || { _id: uid, name: 'User' });
      } else {
        // New conversation — try finding from conversations list or use placeholder
        const existing = conversations.find(c => c.user?._id === uid);
        if (existing) {
          setActiveUser(existing.user);
        } else {
          // Fetch talent profile to get user info
          try {
            const { data: talentData } = await api.get(`/talent/search?limit=100`);
            const match = talentData.data.profiles.find(p => p.userId?._id === uid || p.userId === uid);
            if (match?.userId) {
              setActiveUser({ _id: uid, name: match.userId.name || 'Talent', profilePicUrl: match.userId.profilePicUrl, role: 'talent' });
            } else {
              setActiveUser({ _id: uid, name: 'User', role: 'talent' });
            }
          } catch {
            setActiveUser({ _id: uid, name: 'User' });
          }
        }
      }
    } catch {
      setActiveUser({ _id: uid, name: 'User' });
    }
  };

  // Load messages when active user changes
  useEffect(() => {
    if (!activeUser) return;
    const loadMsgs = async () => {
      try {
        const { data } = await api.get(`/messages/${activeUser._id}`);
        setMessages(data.data.messages);
      } catch {}
    };
    loadMsgs();
  }, [activeUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg) => {
      if (msg.senderId === activeUser?._id || msg.receiverId === activeUser?._id) {
        setMessages((prev) => [...prev, msg]);
      }
      // Refresh conversations list
      api.get('/messages').then(({ data }) => setConversations(data.data.conversations));
    });
    socket.on('typing', ({ from }) => { if (from === activeUser?._id) setTyping(true); });
    socket.on('stop_typing', () => setTyping(false));
    return () => { socket.off('new_message'); socket.off('typing'); socket.off('stop_typing'); };
  }, [socket, activeUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeUser) return;
    const text = newMsg.trim();
    setNewMsg('');
    setSending(true);
    try {
      const { data } = await api.post('/messages', { receiverId: activeUser._id, message: text });
      setMessages((prev) => [...prev, data.data.message]);
    } catch {
      toast.error('Failed to send message');
      setNewMsg(text);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    if (socket && activeUser) {
      socket.emit('typing', { to: activeUser._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socket.emit('stop_typing', { to: activeUser._id }), 1500);
    }
  };

  const openConversation = (conv) => {
    setActiveUser(conv.user);
    navigate(`/chat/${conv.user._id}`, { replace: true });
  };

  const filteredConvs = conversations.filter((c) =>
    c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isOnline = (uid) => onlineUsers?.includes(uid);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16 h-screen max-h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`${activeUser ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 border-r border-dark-600 bg-dark-800`}>
          <div className="p-4 border-b border-dark-600">
            <h2 className="font-bold text-white text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search conversations..." className="input-field pl-9 py-2 text-sm" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-dark-700 animate-pulse" />)}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <p>No conversations yet.</p>
                <p className="mt-1">Start chatting from a talent profile.</p>
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <button key={conv.user?._id} onClick={() => openConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-dark-700 transition-colors border-b border-dark-600/50 text-left ${activeUser?._id === conv.user?._id ? 'bg-dark-700' : ''}`}>
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                      {conv.user?.name?.[0]?.toUpperCase()}
                    </div>
                    {isOnline(conv.user?._id) && (
                      <Circle size={10} className="absolute bottom-0 right-0 text-green-400 fill-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white text-sm truncate">{conv.user?.name}</p>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 bg-brand-500 rounded-full text-white text-xs flex items-center justify-center shrink-0">{conv.unread}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage?.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${activeUser ? 'flex' : 'hidden sm:flex'} flex-col flex-1 min-w-0`}>
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="opacity-20" />
                </div>
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">or start a new one from a talent profile</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-dark-600 bg-dark-800">
                <button onClick={() => { setActiveUser(null); navigate('/chat'); }} className="sm:hidden btn-ghost p-2">
                  <ArrowLeft size={18} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                    {activeUser.name?.[0]?.toUpperCase()}
                  </div>
                  {isOnline(activeUser._id) && (
                    <Circle size={10} className="absolute bottom-0 right-0 text-green-400 fill-green-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{activeUser.name}</p>
                  <p className="text-xs text-gray-500">
                    {isOnline(activeUser._id) ? <span className="text-green-400">● Online</span> : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    <p>No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble key={msg._id} msg={msg} isOwn={msg.senderId === user._id || msg.senderId?._id === user._id} />
                    ))}
                    {typing && (
                      <div className="flex justify-start mb-3">
                        <div className="bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex gap-3 p-4 border-t border-dark-600 bg-dark-800">
                <input
                  type="text"
                  value={newMsg}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="input-field flex-1 h-11"
                  autoFocus
                />
                <button type="submit" disabled={!newMsg.trim() || sending} className="btn-primary w-11 h-11 p-0 rounded-xl">
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
