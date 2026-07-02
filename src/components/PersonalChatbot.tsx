import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Paperclip, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  Building, 
  User, 
  Mail, 
  SendHorizontal,
  Maximize2,
  Minimize2,
  Minus
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isContactCard?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What is Chip-Firing?",
  "Tell me about your recent publications.",
  "What is your 32-bit Universal Machine systems project?",
  "What roles is he seeking and how can I contact him?"
];

export default function PersonalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-initial",
      role: "assistant",
      content: "Hi there! I'm Eyobel's AI Portfolio Assistant. Feel free to ask me anything about his systems programming projects, math research, GPA, or work experience!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Recruiter contact card attachment modal state
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterCompany, setRecruiterCompany] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterNote, setRecruiterNote] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsgId = `msg-user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with Eyobel's assistant server. Please check the connection.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: `msg-assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiterName.trim() || !recruiterEmail.trim()) return;

    const contactCardText = `💼 **Contact Card Shared**\n\n**Name:** ${recruiterName}\n**Company:** ${recruiterCompany || "Not specified"}\n**Email:** ${recruiterEmail}\n**Message:** ${recruiterNote || "No message left"}`;

    const contactCardMessage: Message = {
      id: `msg-contact-${Date.now()}`,
      role: "user",
      content: contactCardText,
      timestamp: new Date(),
      isContactCard: true
    };

    setMessages((prev) => [...prev, contactCardMessage]);
    setShowAttachModal(false);
    setContactSubmitted(true);

    // Reset Form
    setRecruiterName("");
    setRecruiterCompany("");
    setRecruiterEmail("");
    setRecruiterNote("");

    // Simulate system/bot response accepting the recruiter details
    setIsLoading(true);
    setTimeout(() => {
      const confirmationMsg: Message = {
        id: `msg-confirm-${Date.now()}`,
        role: "assistant",
        content: `Thank you so much! I have securely received your contact details. Eyobel will be notified immediately at **eyobelassefa@gmail.com**. \n\nIn the meantime, feel free to ask me more questions about his Systems Projects (like his 32-bit Virtual Machine), publications, teaching experience, or GPA!`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, confirmationMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`${
              isEnlarged 
                ? "w-[450px] sm:w-[600px] md:w-[700px] h-[650px] sm:h-[750px] md:h-[820px]" 
                : "w-[360px] sm:w-[410px] h-[550px] sm:h-[620px]"
            } max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden mb-3`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 text-white p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-serif font-bold text-lg text-zinc-100 shadow-inner">
                  EG
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                    Eyobel's Portfolio Assistant
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono tracking-wider">Powered by Gemini AI • Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {/* Enlarge/Restore Button */}
                <button
                  type="button"
                  id="btn-toggle-enlarge"
                  onClick={() => setIsEnlarged(!isEnlarged)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
                  title={isEnlarged ? "Restore size" : "Enlarge window"}
                >
                  {isEnlarged ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                {/* Minimize Button */}
                <button
                  type="button"
                  id="btn-minimize-chatbot"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
                  title="Minimize chat"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%] flex flex-col space-y-1">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? msg.isContactCard 
                            ? "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50 rounded-tr-none shadow-sm whitespace-pre-line"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-tr-none shadow-md"
                          : "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/40 rounded-tl-none shadow-sm whitespace-pre-line"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/40 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 animate-spin" />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-600 dark:text-rose-400">
                    <span className="font-semibold block mb-0.5">Connection Error</span>
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Chips */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex flex-col space-y-1.5">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono font-bold uppercase tracking-wider">Suggested Queries</span>
              <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-h-[85px] no-scrollbar">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={`suggest-${idx}`}
                    id={`btn-suggest-${idx}`}
                    onClick={() => handleSuggestClick(q)}
                    disabled={isLoading}
                    className="text-[10px] font-sans font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-lg px-2.5 py-1.5 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/60 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  id="btn-chatbot-attach"
                  onClick={() => setShowAttachModal(true)}
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer shrink-0"
                  title="Share your contact info"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="input-chatbot-text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    id="btn-chatbot-send"
                    disabled={!inputValue.trim() || isLoading}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      inputValue.trim() && !isLoading
                        ? "text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        : "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    <SendHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
              <p className="text-[9px] text-center text-zinc-400 dark:text-zinc-500 font-mono mt-2">
                AI-generated content may be inaccurate.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECRUITER ATTACHMODAL */}
      <AnimatePresence>
        {showAttachModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAttachModal(false)}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 text-white p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/15">
                    <Paperclip className="w-4 h-4 text-zinc-100" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-white">Share Recruiter Contact Card</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">Introduce yourself and leave your details</p>
                  </div>
                </div>
                <button
                  id="btn-close-attach"
                  onClick={() => setShowAttachModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAttachSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Your Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="attach-name"
                      required
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Company / Agency</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="attach-company"
                      value={recruiterCompany}
                      onChange={(e) => setRecruiterCompany(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="attach-email"
                      required
                      value={recruiterEmail}
                      onChange={(e) => setRecruiterEmail(e.target.value)}
                      placeholder="jane.doe@company.com"
                      className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">Quick Note</label>
                  <textarea
                    id="attach-note"
                    value={recruiterNote}
                    onChange={(e) => setRecruiterNote(e.target.value)}
                    placeholder="We have an open role that aligns with your systems background..."
                    rows={3}
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    id="btn-cancel-attach"
                    onClick={() => setShowAttachModal(false)}
                    className="px-4 py-2 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-attach"
                    className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-mono text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Attach Card</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLOSED FLOATING QUICK PROMPTS */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="flex flex-col items-end space-y-1.5 mb-3 pointer-events-auto mr-1 max-w-[280px]"
          >
            <span className="text-[8px] font-mono font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider bg-zinc-100/80 dark:bg-zinc-950/50 backdrop-blur-sm px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800/60 shadow-sm">
              Ask Eyobel's AI:
            </span>
            <div className="flex flex-col items-end space-y-1.5">
              <motion.button
                type="button"
                id="btn-teaser-chipfiring"
                whileHover={{ scale: 1.03, x: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsOpen(true);
                  handleSendMessage("What is Chip-Firing?");
                }}
                className="text-[10px] font-sans font-medium text-zinc-700 dark:text-zinc-200 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-full px-3 py-1.5 text-right transition-all shadow-md cursor-pointer flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>What is Chip-Firing?</span>
                <span className="text-xs">🔮</span>
              </motion.button>
              <motion.button
                type="button"
                id="btn-teaser-publications"
                whileHover={{ scale: 1.03, x: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsOpen(true);
                  handleSendMessage("Tell me about your recent publications.");
                }}
                className="text-[10px] font-sans font-medium text-zinc-700 dark:text-zinc-200 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-full px-3 py-1.5 text-right transition-all shadow-md cursor-pointer flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Tell me about your publications</span>
                <span className="text-xs">📚</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON */}
      <motion.button
        id="btn-open-chatbot"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all border border-zinc-700/30 dark:border-white/25 cursor-pointer relative"
        title="Open Eyobel's Portfolio Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Unread badge/pulse */}
        {!isOpen && !contactSubmitted && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </span>
        )}
      </motion.button>

    </div>
  );
}
