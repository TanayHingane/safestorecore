import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, Sparkles, MessageSquare, Tag } from 'lucide-react';
import { useFileSystem } from '../contexts/FileSystemContext';
import { formatSize } from '../utils';
import { chatWithFile } from '../services/gemini';

export const FileDetailSidebar: React.FC = () => {
  const { selectedFile, setSelectedFile, analyzingFileId } = useFileSystem();
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat when file changes
    setChatHistory([]);
  }, [selectedFile?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  if (!selectedFile) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    const response = await chatWithFile(selectedFile, userMsg, []);
    
    setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
    setIsChatLoading(false);
  };

  const isAnalyzing = analyzingFileId === selectedFile.id;

  return (
    <div className="w-96 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-20 absolute right-0 top-0 bottom-0 md:relative">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" />
            File Intelligence
        </h3>
        <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Header Info */}
        <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                {selectedFile.type === 'image' ? (
                    <img 
                        src={selectedFile.blob ? URL.createObjectURL(selectedFile.blob) : ''} 
                        className="w-full h-full object-cover rounded-2xl" 
                        alt="preview"
                    />
                ) : (
                    <FileText size={40} className="text-slate-400" />
                )}
            </div>
            <h2 className="font-semibold text-slate-900 truncate px-2" title={selectedFile.name}>{selectedFile.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{formatSize(selectedFile.size)} • {new Date(selectedFile.createdAt).toLocaleDateString()}</p>
        </div>

        {/* AI Summary Section */}
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles size={12} /> AI Analysis
            </h4>
            {isAnalyzing ? (
                <div className="flex items-center gap-2 text-indigo-600 text-sm">
                    <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                    Analyzing content...
                </div>
            ) : selectedFile.summary ? (
                <div>
                    <p className="text-sm text-indigo-900 leading-relaxed">{selectedFile.summary}</p>
                    {selectedFile.tags && selectedFile.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {selectedFile.tags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-1 bg-white text-indigo-600 rounded-md font-medium border border-indigo-100 shadow-sm flex items-center gap-1">
                                    <Tag size={10} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-sm text-indigo-400 italic">No analysis available.</p>
            )}
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col min-h-[300px]">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare size={12} /> Ask Gemini
            </h4>
            
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 overflow-y-auto max-h-[400px] mb-3 space-y-3">
                {chatHistory.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8">
                        Ask questions like "Summarize this" or "What does this code do?"
                    </div>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                     <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                             <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef}></div>
            </div>

            <form onSubmit={handleSendMessage} className="relative">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this file..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                />
                <button 
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Sparkles size={16} />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
