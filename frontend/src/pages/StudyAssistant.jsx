import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  MessageSquare,
  BookOpen,
  PlusCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import {
  sendTutorMessage,
  fetchChatHistory,
  fetchAllChatSessions
} from '../api/chatApi';
import { fetchNotes } from '../api/notesApi';
import toast from 'react-hot-toast';

const StudyAssistant = () => {
  // Conversational message states
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! I am your **StudyFlow AI Tutor**. How can I help you today? \n\nYou can ask me to explain concepts, build mnemonics, or solve doubts. Select a reference note summary from the dropdown above to start a **context-aware Q&A session**!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Session states
  const [sessionId, setSessionId] = useState(null);
  const [sessionsList, setSessionsList] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Note RAG Context
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processing]);

  // Load chat sessions and saved notes list on mount
  useEffect(() => {
    loadSessions();
    loadNotes();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetchAllChatSessions();
      if (res && res.sessions) {
        setSessionsList(res.sessions);
      }
    } catch (err) {
      console.error('Failed to load chat history list:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadNotes = async () => {
    try {
      const res = await fetchNotes();
      if (res && res.notes) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error('Failed to load notes for chat context:', err);
    }
  };

  const handleSelectSession = async (sId) => {
    setSessionId(sId);
    setProcessing(true);
    try {
      const res = await fetchChatHistory(sId);
      if (res && res.messages) {
        setMessages(res.messages);
        if (res.session && res.session.relatedNote) {
          setSelectedNoteId(res.session.relatedNote);
        } else {
          setSelectedNoteId('');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load conversation history logs');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartNewChat = () => {
    setSessionId(null);
    setSelectedNoteId('');
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content: "Hello! I am your **StudyFlow AI Tutor**. How can I help you today? \n\nYou can ask me to explain concepts, build mnemonics, or solve doubts. Select a reference note summary from the dropdown above to start a **context-aware Q&A session**!"
      }
    ]);
    toast.success('Started a new chat session');
  };

  const handleSendMessage = async (e, customText = '') => {
    e?.preventDefault();

    if (processing) return;

    const queryText = (customText || inputText).trim();

    if (queryText.length > 1000) {
      return toast.error('Message too long');
    }

    if (!queryText) return;

    // Optimistically append user message
    const userMsg = {
      _id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setProcessing(true);

    try {
      const res = await sendTutorMessage(queryText, sessionId, selectedNoteId || null);
      if (res && res.success) {
        setMessages(res.session.messages);
        
        // If this was a new session, lock the session ID
        if (!sessionId) {
          setSessionId(res.session._id);
        }
        
        // Refresh sidebar sessions history
        await loadSessions();
        toast.success('AI Tutor answered!');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Tutor connection failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const promptChips = [
    { label: 'Explain simply', text: 'Explain the concept of "Recursion" in simple terms with an everyday analogy.' },
    { label: 'Create mnemonic', text: 'Generate a mnemonic to remember the OSI model layers.' },
    { label: 'Show code example', text: 'Show a clean JavaScript implementation of Quick Sort with comments.' },
  ];

  return (
    <div className="h-[calc(100vh-10rem)] grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
      
      {/* 1. Left Sidebar: Chat Sessions History & suggestion chips (Span 1) */}
      <div className="hidden lg:flex lg:flex-col space-y-4">
        
        {/* New Chat trigger */}
        <button
          onClick={handleStartNewChat}
          className="w-full py-3 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary/90 hover:to-brandSecondary/90 text-white font-bold rounded-xl transition text-xs flex items-center justify-center space-x-2 shadow-glowPrimary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Chat Session</span>
        </button>

        {/* Sessions list */}
        <div className="glass-panel p-4 flex-1 flex flex-col min-h-0">
          <h4 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Tutor Sessions</h4>
          
          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {loadingSessions ? (
              <div className="text-center text-xs text-textSecondary py-4">Loading history...</div>
            ) : sessionsList.length > 0 ? (
              sessionsList.map((sess) => {
                const isActive = sessionId === sess._id;
                return (
                  <button
                    key={sess._id}
                    onClick={() => handleSelectSession(sess._id)}
                    className={`w-full p-3 text-left border rounded-xl transition duration-200 flex items-center space-x-2.5 truncate
                      ${
                        isActive
                          ? 'bg-brandPrimary/10 border-brandPrimary text-white shadow-sm font-semibold'
                          : 'bg-white/5 border-white/5 hover:border-brandPrimary/20 text-textSecondary hover:text-white'
                      }
                    `}
                  >
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brandPrimary' : ''}`} />
                    <span className="text-xs truncate flex-1">{sess.title}</span>
                  </button>
                );
              })
            ) : (
              <div className="text-center text-[10px] text-textSecondary py-10 italic">
                No past sessions logged.
              </div>
            )}
          </div>

          {/* Quick chip rules */}
          <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
            <h5 className="text-[9px] uppercase font-bold tracking-widest text-textSecondary">Suggestions:</h5>
            <div className="space-y-1">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleSendMessage(e, chip.text)}
                  className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-textSecondary hover:text-white transition truncate border border-white/5"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 2. Main Chat Room (Span 3) */}
      <div className="lg:col-span-3 glass-panel flex flex-col justify-between overflow-hidden relative">
        
        {/* Note Selector Context Bar */}
        <div className="p-3.5 border-b border-darkBorder bg-darkBg/40 flex flex-col xs:flex-row xs:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-brandPrimary" />
            <h4 className="text-xs font-bold text-textPrimary">AI Tutor Contextual Reference</h4>
          </div>
          
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            disabled={processing || !!sessionId} // Lock note selector if continuing an existing chat session
            className="px-2.5 py-1.5 bg-darkBg border border-white/10 rounded-xl text-xs focus:border-brandPrimary outline-none text-textPrimary max-w-[240px] truncate"
          >
            <option value="">No reference note (General doubts mode)</option>
            {notes.map((note) => {
              let title = 'Lecture Notes';
              const match = note.summary.match(/#+\s+(.*)/);
              if (match && match[1]) title = match[1].trim();
              return (
                <option key={note._id} value={note._id}>
                  Context: {title}
                </option>
              );
            })}
          </select>
        </div>

        {/* Chat message logs */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-5 py-4 border rounded-2xl text-xs sm:text-sm leading-relaxed space-y-3
                  ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-brandPrimary/20 to-brandSecondary/10 border-brandPrimary/30 rounded-tr-none text-textPrimary'
                      : 'bg-white/5 border-white/10 rounded-tl-none text-textSecondary'
                  }
                `}
              >
                <ReactMarkdown
                  components={{
                    h3: ({ children }) => <h3 className="text-sm font-bold text-textPrimary border-b border-white/5 pb-1 mt-3">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-xs font-bold text-textPrimary mt-3">{children}</h4>,
                    p: ({ children }) => <p className="text-xs sm:text-sm">{children}</p>,
                    li: ({ children }) => <li className="text-xs sm:text-sm list-disc ml-5 mt-1">{children}</li>,
                    strong: ({ children }) => <strong className="text-brandPrimary font-bold">{children}</strong>,
                    code: ({ children }) => <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-xs text-brandSecondary">{children}</code>
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {/* Typing animation */}
          {processing && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-2">
                <span className="text-xs text-textSecondary font-semibold">Tutor is thinking</span>
                <div className="typing-indicator flex items-center">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-darkBorder bg-darkBg/60">
          <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center space-x-2 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedNoteId ? "Ask tutor questions about this document..." : "Ask AI Tutor doubts (e.g. 'Explain quick sort')..."}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm focus:border-brandPrimary outline-none text-textPrimary placeholder-textSecondary/30 transition"
            />

            <button
              type="submit"
              disabled={processing || !inputText.trim()}
              className="p-3 bg-brandPrimary hover:bg-brandPrimary/90 disabled:opacity-50 text-white rounded-xl transition flex items-center justify-center shadow-glowPrimary"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default StudyAssistant;
