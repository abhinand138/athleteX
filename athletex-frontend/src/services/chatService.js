import api from "./api";

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || "user_1";
  } catch (e) {
    return "user_1";
  }
};

// Default fallback contacts for offline/demo mode
const fallbackConversations = [
  {
    conversationId: "conv_coach_mike",
    otherUserId: "coach_mike",
    otherUserName: "Coach Mike",
    otherUserRole: "COACH",
    otherUserSport: "Track & Field",
    lastMessage: "Great form on your 100m sprint today!",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    isOnline: true
  },
  {
    conversationId: "conv_athlete_alex",
    otherUserId: "athlete_alex",
    otherUserName: "Alex Rivera",
    otherUserRole: "ATHLETE",
    otherUserSport: "Football",
    lastMessage: "Schedule updated for tomorrow's recovery run.",
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    isOnline: true
  }
];

const fallbackMessages = {
  coach_mike: [
    {
      id: "msg_1",
      conversationId: "conv_coach_mike",
      senderId: "coach_mike",
      senderName: "Coach Mike",
      senderRole: "COACH",
      recipientId: "user_1",
      content: "Welcome to AthleteX Chat! How are your legs feeling after yesterday's squat session?",
      messageType: "TEXT",
      isRead: true,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "msg_2",
      conversationId: "conv_coach_mike",
      senderId: "coach_mike",
      senderName: "Coach Mike",
      senderRole: "COACH",
      recipientId: "user_1",
      content: "Great form on your 100m sprint today!",
      messageType: "TEXT",
      isRead: false,
      timestamp: new Date().toISOString()
    }
  ],
  athlete_alex: [
    {
      id: "msg_3",
      conversationId: "conv_athlete_alex",
      senderId: "athlete_alex",
      senderName: "Alex Rivera",
      senderRole: "ATHLETE",
      recipientId: "user_1",
      content: "Schedule updated for tomorrow's recovery run.",
      messageType: "TEXT",
      isRead: true,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

export const chatService = {
  // Get active conversations list
  getConversations: async () => {
    const userId = getUserId();
    try {
      const res = await api.get("/chat/conversations", {
        params: userId ? { userId } : {}
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return fallbackConversations;
    } catch (err) {
      console.warn("Backend API unavailable, using chat fallback data.");
      return fallbackConversations;
    }
  },

  // Get messages with a specific user
  getMessages: async (otherUserId) => {
    const userId = getUserId();
    try {
      const res = await api.get(`/chat/messages/${otherUserId}`, {
        params: userId ? { userId } : {}
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return fallbackMessages[otherUserId] || [
        {
          id: "msg_demo",
          senderId: otherUserId,
          senderName: "Contact",
          content: "Hello! Let's work on our performance goals.",
          timestamp: new Date().toISOString(),
          isRead: true
        }
      ];
    } catch (err) {
      return fallbackMessages[otherUserId] || [
        {
          id: "msg_demo",
          senderId: otherUserId,
          senderName: "Contact",
          content: "Hello! Let's work on our performance goals.",
          timestamp: new Date().toISOString(),
          isRead: true
        }
      ];
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
      return 1;
    }
  }
};

export default chatService;
