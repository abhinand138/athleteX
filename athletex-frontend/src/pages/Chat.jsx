import { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaSearch,
  FaUser,
  FaUserGraduate,
  FaCheck,
  FaCheckDouble,
  FaPaperclip,
  FaSmile,
  FaSync,
  FaComments,
  FaInfoCircle,
  FaDumbbell,
  FaLink,
  FaExternalLinkAlt
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import chatService from "../services/chatService";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Chat() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  const messagesEndRef = useRef(null);

  // Quick message templates
  const quickTemplates = currentUser.role === "COACH"
    ? [
        "Great work in today's session!",
        "Please update your wellness check-in.",
        "Check your new training schedule."
      ]
    : [
        "Ready for today's training!",
        "Just completed my workout session.",
        "Could you review my latest stats?"
      ];

  // Fetch conversation contacts
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data || []);

      // Auto select first contact if none selected
      if (!selectedContact && data && data.length > 0) {
        setSelectedContact(data[0]);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      if (!silent) toast.error("Failed to load chat contacts.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch messages for selected contact
  const fetchMessages = async (contactId, silent = false) => {
    if (!contactId) return;
    try {
      const data = await chatService.getMessages(contactId);
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (!silent) toast.error("Failed to load messages.");
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // When selected contact changes
  useEffect(() => {
    if (selectedContact?.otherUserId) {
      fetchMessages(selectedContact.otherUserId);
      try {
        const res = chatService.markAsRead(selectedContact.otherUserId);
        if (res && typeof res.catch === "function") {
          res.catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    }
  }, [selectedContact]);

  // Real-time background polling every 3.5s (disabled in test env)
  useEffect(() => {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") return;
    const interval = setInterval(() => {
      fetchConversations(true);
      if (selectedContact?.otherUserId) {
        fetchMessages(selectedContact.otherUserId, true);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedContact]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !attachmentUrl) return;
    if (!selectedContact?.otherUserId) {
      toast.error("Please select a recipient to message.");
      return;
    }

    try {
      setSending(true);
      const newMsg = await chatService.sendMessage(
        selectedContact.otherUserId,
        inputText.trim(),
        attachmentUrl ? "MEDIA" : "TEXT",
        attachmentUrl || null
      );

      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
      setAttachmentUrl("");
      setShowAttachmentModal(false);

      // Refresh contact list to update last message
      fetchConversations(true);
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.otherUserSport?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 p-2 md:p-4">
        
        {/* ================= LEFT SIDEBAR: CONTACTS ================= */}
        <div className="w-full md:w-80 lg:w-96 bg-brand-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-peach/10 text-brand-peach">
                <FaComments className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Messages</h2>
                <p className="text-xs text-gray-400">Athlete & Coach Hub</p>
              </div>
            </div>
            <button
              onClick={() => fetchConversations()}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="Refresh contacts"
            >
              <FaSync className={`text-sm ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <FaSearch className="absolute left-4 top-3.5 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach/50 transition"
              />
            </div>
          </div>

          {/* Contacts Roster */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loading && conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm animate-pulse">
                Loading contacts...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <p className="font-semibold text-gray-300">No contacts found</p>
                <p className="text-xs mt-1">Connect with coaches or athletes to start chatting.</p>
              </div>
            ) : (
              filteredConversations.map((contact) => {
                const isSelected = selectedContact?.otherUserId === contact.otherUserId;
                const isCoach = contact.otherUserRole === "COACH";

                return (
                  <div
                    key={contact.otherUserId}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 flex items-start gap-3.5 cursor-pointer transition relative group ${
                      isSelected
                        ? "bg-brand-peach/10 border-l-4 border-brand-peach"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                        isCoach
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 border border-purple-400/30"
                          : "bg-gradient-to-br from-brand-peach to-orange-500 text-black border border-orange-300/30"
                      }`}>
                        {contact.otherUserName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-brand-dark rounded-full shadow-sm" />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-white truncate">
                          {contact.otherUserName}
                        </h4>
                        {contact.lastMessageTime && (
                          <span className="text-[11px] text-gray-400 font-medium">
                            {formatTime(contact.lastMessageTime)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider ${
                          isCoach ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {contact.otherUserRole}
                        </span>
                        {contact.otherUserSport && (
                          <span className="text-[11px] text-gray-400 truncate">
                            • {contact.otherUserSport}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 truncate font-normal">
                        {contact.lastMessage}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {contact.unreadCount > 0 && (
                      <span className="bg-brand-peach text-black font-extrabold text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(238,155,116,0.5)]">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT MAIN PANEL: ACTIVE CHAT ================= */}
        <div className="flex-1 bg-brand-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white ${
                    selectedContact.otherUserRole === "COACH"
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                      : "bg-gradient-to-br from-brand-peach to-orange-500 text-black"
                  }`}>
                    {selectedContact.otherUserName?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {selectedContact.otherUserName}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        selectedContact.otherUserRole === "COACH"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}>
                        {selectedContact.otherUserRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span className="text-emerald-400 font-medium">Active Now</span>
                      {selectedContact.otherUserSport && (
                        <>
                          <span>•</span>
                          <span>{selectedContact.otherUserSport}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  {selectedContact.otherUserRole === "COACH" ? (
                    <Link
                      to="/coaches"
                      className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition border border-white/10"
                    >
                      <FaUserGraduate /> Coach Hub
                    </Link>
                  ) : (
                    <Link
                      to={`/coach/athletes/${selectedContact.otherUserId}`}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition border border-white/10"
                    >
                      <FaUser /> View Profile
                    </Link>
                  )}
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-brand-peach/10 flex items-center justify-center text-brand-peach text-2xl mb-3 shadow-[0_0_20px_rgba(238,155,116,0.2)]">
                      <FaComments />
                    </div>
                    <h4 className="text-lg font-bold text-white">Start the Conversation</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      Send a message to {selectedContact.otherUserName} to discuss training plans, performance stats, or feedback.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                      >
                        {/* Sender header name if group/first */}
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[11px] font-semibold text-gray-400">
                            {isMe ? "You" : msg.senderName}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>

                        {/* Speech Bubble */}
                        <div
                          className={`max-w-[85%] md:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-lg relative group ${
                            isMe
                              ? "bg-gradient-to-r from-brand-peach to-orange-500 text-black font-medium rounded-tr-none"
                              : "bg-white/10 text-white backdrop-blur-md border border-white/10 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                          {/* Attachment Link if present */}
                          {msg.attachmentUrl && (
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-2.5 flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition ${
                                isMe
                                  ? "bg-black/20 text-black hover:bg-black/30"
                                  : "bg-brand-peach/20 text-brand-peach hover:bg-brand-peach/30 border border-brand-peach/30"
                              }`}
                            >
                              <FaLink /> View Shared Attachment
                              <FaExternalLinkAlt className="text-[10px] ml-auto" />
                            </a>
                          )}

                          {/* Status footer for sent messages */}
                          {isMe && (
                            <div className="flex justify-end mt-1 text-[10px] text-black/70">
                              {msg.isRead ? (
                                <FaCheckDouble className="text-black/90" title="Read" />
                              ) : (
                                <FaCheck title="Sent" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Template Chips */}
              <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                  Quick Reply:
                </span>
                {quickTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(tmpl)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-brand-peach/50 transition flex-shrink-0"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              {/* Attachment Preview Modal */}
              {showAttachmentModal && (
                <div className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-3">
                  <FaPaperclip className="text-brand-peach text-sm" />
                  <input
                    type="url"
                    placeholder="Paste URL (e.g. video proof link, training sheet)"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach"
                  />
                  <button
                    onClick={() => setShowAttachmentModal(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAttachmentModal(!showAttachmentModal)}
                  className={`p-3 rounded-xl transition ${
                    attachmentUrl
                      ? "bg-brand-peach text-black font-bold"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  title="Attach link"
                >
                  <FaPaperclip />
                </button>

                <input
                  type="text"
                  placeholder={`Write a message to ${selectedContact.otherUserName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach/60 transition"
                />

                <button
                  type="submit"
                  disabled={sending || (!inputText.trim() && !attachmentUrl)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(238,155,116,0.4)] disabled:opacity-50 transition"
                >
                  <span>Send</span>
                  <FaPaperPlane className="text-xs" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 text-3xl mb-4">
                <FaComments />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Chat Selected</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Select a contact from the roster on the left to start sending messages and coordinating workouts.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
