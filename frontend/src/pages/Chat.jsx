import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Send, Loader2, MessageSquare, MoreVertical, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
    }
  }, [activeContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/chat/contacts');
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/messages/${userId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    try {
      const res = await api.post('/chat/messages', {
        receiverId: activeContact.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loadingContacts) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <Loader2 className="h-10 w-10 text-[#b026ff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-5rem)]">
      <div className="flex h-full gap-6">
        {/* Contacts Sidebar */}
        <Card variant="glass" className="w-1/3 flex flex-col p-4 h-full">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="text-[#00f0ff]" /> Encrypted Comms
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#b026ff] transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {contacts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-4">No active connections yet.</p>
            ) : (
              contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeContact?.id === contact.id 
                      ? 'bg-[#b026ff]/20 border border-[#b026ff]/30' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                      <div className="w-full h-full bg-[#0B0E14] rounded-full flex items-center justify-center overflow-hidden">
                        {contact.avatarUrl ? (
                           <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-xs">{contact.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#141822] rounded-full ${contact.status === 'ONLINE' ? 'bg-green-500' : 'bg-slate-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-sm truncate">{contact.name}</h4>
                    <p className="text-xs text-slate-400 truncate">Tap to open channel</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card variant="glass" className="w-2/3 flex flex-col p-0 overflow-hidden h-full">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0d111a]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                    <div className="w-full h-full bg-[#0B0E14] rounded-full flex items-center justify-center overflow-hidden">
                      {activeContact.avatarUrl ? (
                         <img src={activeContact.avatarUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-xs">{activeContact.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold">{activeContact.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#00f0ff]" /> Secured Channel
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white p-2">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 text-[#00f0ff] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p>Connection established. Say hello.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn 
                            ? 'bg-gradient-to-br from-[#b026ff] to-purple-700 text-white rounded-br-none shadow-[0_0_15px_rgba(176,38,255,0.2)]' 
                            : 'bg-[#1a1f2e] text-slate-200 rounded-bl-none border border-white/5'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <span className="text-[10px] opacity-60 mt-1 block text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-[#0d111a]/80">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Transmit message..."
                    className="flex-1 bg-[#141822] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#b026ff] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#b026ff] hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl px-4 py-2 flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(176,38,255,0.5)]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Zap className="w-16 h-16 mb-6 text-[#00f0ff] opacity-20" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">Nexus Communication Protocol</h3>
              <p className="max-w-xs text-center text-sm">
                Select a node from the network panel to initiate a secure data transfer channel.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
