import api from "./api";

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || user.userId || null;
  } catch (e) {
    return null;
  }
};

export const chatService = {
  // Get active conversations list
  getConversations: async () => {
    const userId = getUserId();
    if (!userId) return [];
    try {
      const res = await api.get("/chat/conversations", {
        params: { userId }
      });
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch (err) {
      console.warn("Error loading conversations from backend:", err);
      return [];
    }
  },

  // Get messages with a specific user
  getMessages: async (otherUserId) => {
    const userId = getUserId();
    if (!userId || !otherUserId) return [];
    try {
      const res = await api.get(`/chat/messages/${otherUserId}`, {
        params: { userId }
      });
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch (err) {
      console.warn("Error loading messages for contact:", otherUserId, err);
      return [];
    }
  },

  // Send a message to a recipient
  sendMessage: async (recipientId, content, messageType = "TEXT", attachmentUrl = null) => {
    const userId = getUserId();
    const payload = {
      recipientId,
      content,
      messageType,
      attachmentUrl
    };
    try {
      const res = await api.post("/chat/messages", payload, {
        params: userId ? { userId } : {}
      });
      return res.data;
    } catch (err) {
      // Fallback optimistic message creation
      return {
        id: "msg_" + Date.now(),
        senderId: userId,
        senderName: "You",
        senderRole: "USER",
        recipientId,
        content,
        messageType,
        attachmentUrl,
        isRead: false,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Mark conversation as read
  markAsRead: async (otherUserId) => {
    const userId = getUserId();
    try {
      const res = await api.put(`/chat/read/${otherUserId}`, null, {
        params: userId ? { userId } : {}
      });
      return res.data;
    } catch (err) {
      return { message: "Marked as read" };
    }
  },

  // Get total unread count
  getUnreadCount: async () => {
    const userId = getUserId();
    try {
      const res = await api.get("/chat/unread-count", {
        params: userId ? { userId } : {}
      });
      return res.data?.unreadCount || 0;
    } catch (err) {
      return 0;
    }
  }
};

export default chatService;
