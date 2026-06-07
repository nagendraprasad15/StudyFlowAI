import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  FileText,
  Upload,
  Copy,
  Sparkles,
  Trash2,
  Eye,
  CheckCircle,
  FolderOpen,
  CornerDownRight,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  summarizeNotes,
  fetchNotes,
  deleteNote
} from '../api/notesApi';
import toast from 'react-hot-toast';

const NotesSummarizer = () => {
  // AI summarization outputs state
  const [activeSummary, setActiveSummary] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  
  // UI Panel inputs state
  const [rawText, setRawText] = useState('');
  const [fileAttached, setFileAttached] = useState(null);
  
  // Loaders & visual states
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [flippedFlashcards, setFlippedFlashcards] = useState({});

  // Fetch saved summaries on mount
  useEffect(() => {
    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {
    try {
      setLoadingHistory(true);
      const result = await fetchNotes();
      if (result && result.notes) {
        setSavedNotes(result.notes);
        // Set the most recent note as active if none is selected

        // if (result.notes.length > 0 && !activeSummary) {
        //   setActiveSummary(result.notes[0]);
        // }

      }
    } catch (err) {
      console.error('Error fetching summaries:', err.message);
      toast.error('Could not load saved notes from server');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.startsWith('text/')) {
        return toast.error('Only PDF or Text files are supported');
      }
      setFileAttached(file);
      toast.success(`Attached file: ${file.name}`);
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!rawText.trim() && !fileAttached) {
      return toast.error('Please input some text or upload a document first');
    }

    setSummarizing(true);
    const toastId = toast.loading('AI is reading, extracting, and summarizing content...');

    try {
      let payload;
      if (fileAttached) {
        payload = new FormData();
        payload.append('file', fileAttached);
      } else {
        payload = rawText;
      }

      const response = await summarizeNotes(payload);
      if (response && response.note) {
        setActiveSummary(response.note);
        toast.success('Summary generated successfully!', { id: toastId });
        
        // Clear inputs
        setRawText('');
        setFileAttached(null);
        setActiveTab('summary');
        setFlippedFlashcards({});
        
        // Reload saved notes history
        await loadSavedNotes();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to generate summary';
      toast.error(msg, { id: toastId });
    } finally {
      setSummarizing(false);
    }
  };

  const handleSelectNote = (note) => {
    setActiveSummary(note);
    setActiveTab('summary');
    setFlippedFlashcards({});
  };

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation(); // Avoid selecting the note as active on delete click
    const originalList = [...savedNotes];
    
    // Optimistic Update
    setSavedNotes(prev => prev.filter(n => n._id !== noteId));
    if (activeSummary && activeSummary._id === noteId) {
      setActiveSummary(null);
    }

    try {
      await deleteNote(noteId);
      toast.success('Summary deleted successfully');
      loadSavedNotes();
    } catch (err) {
      console.error(err);
      setSavedNotes(originalList);
      toast.error('Failed to delete summary');
    }
  };

  const copyToClipboard = () => {
    if (!activeSummary) return;
    navigator.clipboard.writeText(activeSummary.summary);
    toast.success('Summary copied to clipboard!');
  };

  const toggleFlashcardFlip = (idx) => {
    setFlippedFlashcards(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 3-Column Grid Layout: Upload, Output Display, Saved History List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMN 1: Upload / Input Form (Span 4) */}
        <div className="lg:col-span-4 glass-panel p-6 h-fit space-y-6">
          <h3 className="font-bold text-textPrimary text-base flex items-center space-x-1.5 border-b border-white/5 pb-3">
            <Sparkles className="w-4.5 h-4.5 text-brandAccent" />
            <span>Condense Study Material</span>
          </h3>

          <form onSubmit={handleSummarize} className="space-y-4">
            
            {/* File upload drag-drop container */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Upload File (PDF / Text)
              </label>
              
              <div className="border border-dashed border-white/10 hover:border-brandAccent/40 bg-white/5 rounded-2xl p-6 text-center cursor-pointer relative group transition-all duration-300">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-8 h-8 text-textSecondary group-hover:text-brandAccent group-hover:scale-105 transition" />
                  <p className="text-xs font-semibold text-textPrimary truncate max-w-[200px]">
                    {fileAttached ? fileAttached.name : 'Drag & Drop or Browse'}
                  </p>
                  <p className="text-[10px] text-textSecondary">PDF or TXT up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Paste text block */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Or Paste Lecture Text
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your raw notes, lecture outlines, or syllabus segments here..."
                rows="6"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs focus:border-brandAccent outline-none text-textPrimary placeholder-textSecondary/30 transition resize-none"
              ></textarea>
            </div>

            {/* Generate Trigger Button */}
            <button
              type="submit"
              disabled={summarizing}
              className="w-full py-3 bg-gradient-to-r from-brandAccent to-emerald-500 hover:from-brandAccent/90 hover:to-emerald-500/90 text-white font-bold rounded-xl transition duration-300 shadow-glowSecondary flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>{summarizing ? 'Summarizing content...' : 'Summarize Notes'}</span>
            </button>
          </form>
        </div>

        {/* COLUMN 2: Summary Outputs Tab Container (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          {activeSummary && (
            rawText.trim() ||
            fileAttached ||
            savedNotes.length > 0
          ) ? (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Toolbar */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2.5 rounded-2xl">
                <div className="flex space-x-1">
                  {['summary', 'flashcards'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                        ${
                          activeTab === tab
                            ? 'bg-brandAccent text-white shadow-glowSecondary'
                            : 'text-textSecondary hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {tab === 'summary' ? 'Summary' : 'Flashcards'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={copyToClipboard}
                  className="p-2 border border-white/10 hover:border-brandAccent hover:text-brandAccent bg-white/5 rounded-xl text-xs font-semibold transition"
                  title="Copy Summary Markdown"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Output Canvas */}
              <div className="glass-panel p-6 min-h-[400px]">
                
                {activeTab === 'summary' ? (
                  /* Summary markdown parser view */
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4 text-textSecondary">
                    <ReactMarkdown
                      components={{
                        h3: ({ children }) => <h3 className="text-sm font-bold text-textPrimary border-b border-white/5 pb-1 mt-4">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-xs font-bold text-textPrimary mt-3">{children}</h4>,
                        p: ({ children }) => <p className="text-xs sm:text-sm">{children}</p>,
                        li: ({ children }) => <li className="text-xs sm:text-sm list-disc ml-5 mt-1">{children}</li>,
                        strong: ({ children }) => <strong className="text-brandAccent font-bold">{children}</strong>,
                        code: ({ children }) => <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[11px] text-brandSecondary">{children}</code>
                      }}
                    >
                      {activeSummary.summary}
                    </ReactMarkdown>
                  </div>
                ) : (
                  /* Flashcards flips views */
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest border-b border-white/5 pb-2">Active Recall Cards</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {activeSummary.flashcards && activeSummary.flashcards.length > 0 ? (
                        activeSummary.flashcards.map((card, idx) => {
                          const isFlipped = flippedFlashcards[idx];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleFlashcardFlip(idx)}
                              className="h-32 cursor-pointer perspective relative group"
                            >
                              <div
                                className={`w-full h-full duration-500 transform-style absolute transition-transform rounded-xl border flex flex-col justify-between p-4
                                  ${
                                    isFlipped
                                      ? 'rotate-y-180 bg-brandAccent/15 border-brandAccent/30'
                                      : 'bg-white/5 border-white/10 hover:border-brandAccent/30 hover:bg-white/10'
                                  }
                                `}
                              >
                                {!isFlipped ? (
                                  <div className="h-full flex flex-col justify-between">
                                    <div>
                                      <span className="text-[9px] uppercase font-black text-brandAccent tracking-widest">Question {idx + 1}</span>
                                      <p className="text-xs font-bold text-textPrimary mt-1.5 leading-relaxed">{card.question}</p>
                                    </div>
                                    <div className="flex items-center text-[10px] text-textSecondary font-semibold space-x-1.5 self-end">
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Reveal Answer</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex flex-col justify-between rotate-y-180">
                                    <div>
                                      <span className="text-[9px] uppercase font-black text-brandAccent tracking-widest">Answer</span>
                                      <p className="text-xs font-bold text-white mt-1.5 leading-relaxed">{card.answer}</p>
                                    </div>
                                    <div className="flex items-center text-[10px] text-brandAccent font-bold space-x-1.5 self-end">
                                      <CheckCircle className="w-3.5 h-3.5 text-brandAccent" />
                                      <span>Flipped</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-xs text-textSecondary italic py-8">
                          No flashcards generated for this summary.
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center text-textSecondary italic flex items-center justify-center min-h-[400px]">
              No active summaries. paste text or upload a document to get started.
            </div>
          )}
        </div>

        {/* COLUMN 3: Saved Notes History List (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Saved Notes</h3>
          
          <div className="glass-panel p-4 h-[440px] overflow-y-auto space-y-2">
            {loadingHistory ? (
              <div className="text-center text-xs text-textSecondary py-10">Loading notes history...</div>
            ) : savedNotes.length > 0 ? (
              savedNotes.map((note) => {
                const isActive = activeSummary && activeSummary._id === note._id;
                // Parse filename from summary title or default
                let noteTitle = 'Lecture Summary';
                const headingMatch = note.summary.match(/#+\s+(.*)/);
                if (headingMatch && headingMatch[1]) {
                  noteTitle = headingMatch[1].trim();
                }

                return (
                  <div
                    key={note._id}
                    onClick={() => handleSelectNote(note)}
                    className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer group transition-all duration-200
                      ${
                        isActive
                          ? 'bg-brandAccent/10 border-brandAccent text-white shadow-sm font-semibold'
                          : 'bg-white/5 border-white/5 hover:border-brandAccent/20 text-textSecondary hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2.5 truncate max-w-[80%]">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brandAccent' : ''}`} />
                      <span className="text-xs truncate">{noteTitle}</span>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteNote(e, note._id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-brandAlert/10 hover:text-brandAlert text-textSecondary transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-textSecondary text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-textSecondary/30 stroke-[1.5]" />
                <p className="text-[10px] font-semibold text-textPrimary">History is empty</p>
                <p className="text-[9px]">Generated summaries will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotesSummarizer;
