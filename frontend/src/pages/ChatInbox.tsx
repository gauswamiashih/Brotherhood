import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ChatInbox: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch all inbox conversations
  const fetchConversations = async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch active conversation message logs
  const fetchMessages = async () => {
    if (!activeContact) return;
    try {
      const res = await api.get(`/messages/history/${activeContact.id}`);
      setMessages(res.data || []);
      
      // Reset unread count locally and call read endpoint
      await api.put(`/messages/read/${activeContact.id}`);
      
      // Update conversations list silently to evict unread badge
      fetchConversations(true);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Refresh conversations list every 8 seconds
    const interval = setInterval(() => fetchConversations(true), 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active conversation logs on contact switch
  useEffect(() => {
    if (activeContact) {
      fetchMessages();
    }
  }, [activeContact]);

  // Poll active chat log every 4s
  useEffect(() => {
    if (!activeContact) return;
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [activeContact]);

  // Scroll chat messages list to bottom
  useEffect(() => {
    const el = document.getElementById('inbox-chat-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || sending) return;

    setSending(true);
    try {
      const res = await api.post('/messages', {
        receiverId: activeContact.id,
        content: newMessage.trim()
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      fetchConversations(true); // Update left-side list
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-[85vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border border-t-2 border-luxury-gold border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Opening Inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif text-white tracking-wide uppercase">Couture Inbox</h1>
        <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">Consultations and Custom Sizing Queries</p>
      </div>

      <div className="flex-grow glass-panel rounded-2xl border border-luxury-border flex overflow-hidden min-h-[500px] h-[65vh] bg-[#090214] bg-opacity-95">
        
        {/* Left side Panel: Conversations lists */}
        <div className={`w-full md:w-1/3 border-r border-luxury-border border-opacity-35 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-luxury-border border-opacity-25 shrink-0 bg-luxury-purpleDeep bg-opacity-25">
            <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Conversations</span>
          </div>

          <div className="flex-grow overflow-y-auto divide-y divide-luxury-border divide-opacity-15">
            {conversations.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-xs px-4">
                No active stylist consults yet. Message a boutique from their profile page to start chatting.
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeContact?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveContact(c)}
                    className={`w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-luxury-purpleDeep hover:bg-opacity-20 ${
                      isActive ? 'bg-luxury-purpleDeep bg-opacity-30 border-l-2 border-luxury-gold' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-full border border-luxury-border bg-luxury-black flex items-center justify-center text-xs font-bold text-luxury-gold overflow-hidden shrink-0">
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          c.name.substring(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                        <p className="text-[10.5px] text-gray-500 truncate mt-0.5 font-light">
                          {c.last_message || 'Start chatting...'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[8px] text-gray-500 font-light block">
                        {c.last_message_time ? new Date(c.last_message_time).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit'
                        }) : ''}
                      </span>
                      {c.unread_count > 0 && (
                        <span className="inline-block px-1.5 py-0.5 rounded-full bg-luxury-gold text-black text-[9px] font-extrabold mt-1">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right side Panel: Active conversation window */}
        <div className={`w-full md:w-2/3 flex flex-col bg-luxury-black bg-opacity-20 ${!activeContact ? 'hidden md:flex justify-center items-center' : 'flex'}`}>
          {!activeContact ? (
            <div className="text-center space-y-3 p-6 text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-700 mx-auto opacity-70 animate-pulse" />
              <h3 className="font-serif text-white font-bold text-sm tracking-wider">No Stylist Selected</h3>
              <p className="text-xs font-light max-w-xs mx-auto">Pick a boutique owner or client conversation from the sidebar inbox directory to view messages.</p>
            </div>
          ) : (
            <>
              {/* Active conversation Header */}
              <div className="p-4 border-b border-luxury-border border-opacity-35 bg-luxury-purpleDeep bg-opacity-20 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setActiveContact(null)}
                    className="md:hidden p-1.5 border border-luxury-border border-opacity-40 rounded-full text-gray-400 mr-1 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-full border border-luxury-gold bg-luxury-black overflow-hidden flex items-center justify-center font-bold text-xs text-luxury-gold">
                    {activeContact.avatar_url ? (
                      <img src={activeContact.avatar_url} alt={activeContact.name} className="w-full h-full object-cover" />
                    ) : (
                      activeContact.name.substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">{activeContact.name}</h4>
                    <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
                      {activeContact.role === 'owner' ? 'Boutique Stylist' : 'Marketplace Buyer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message History list */}
              <div 
                id="inbox-chat-scroll"
                className="flex-grow p-6 overflow-y-auto space-y-4"
              >
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-luxury-gold text-black rounded-tr-none font-medium shadow-goldGlow' 
                            : 'bg-luxury-purpleDeep text-gray-200 border border-luxury-border border-opacity-30 rounded-tl-none font-light'
                        }`}
                      >
                        <div>{msg.content}</div>
                        <div className={`text-[8.5px] text-right mt-1.5 opacity-65 ${isMe ? 'text-black' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-luxury-border border-opacity-35 bg-luxury-purpleDeep bg-opacity-15 flex gap-3 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type your design coordinates, custom fits, or styling consult..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="luxury-input py-2 px-4 text-xs flex-grow"
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-luxury-gold hover:bg-opacity-90 text-black text-xs font-bold uppercase px-6 py-2 rounded-lg shadow-goldGlow transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
