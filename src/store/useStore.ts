'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  UserProfile,
  DiscoverProfile,
  Chat,
  ChatMessage,
  ChatAttachment,
  Group,
  GroupMessage,
  GroupPost,
  Event,
  Report,
  BlockedUser,
  FriendRequest,
  Match,
} from '@/types';

interface AppState {
  // Current user
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;

  // Discovery
  discoverProfiles: DiscoverProfile[];
  setDiscoverProfiles: (profiles: DiscoverProfile[]) => void;
  savedProfiles: string[];
  saveProfile: (userId: string) => void;
  unsaveProfile: (userId: string) => void;
  passedProfiles: string[];
  passProfile: (userId: string) => void;

  // Friend Requests & Matches
  friendRequests: FriendRequest[];
  sendFriendRequest: (toUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  matches: Match[];

  // Chats
  chats: Chat[];
  chatMessages: Record<string, ChatMessage[]>;
  sendMessage: (
    chatId: string,
    content: string,
    type?: ChatMessage['type'],
    attachments?: ChatAttachment[]
  ) => void;
  sendMessageAs: (
    chatId: string,
    senderId: string,
    content: string,
    type?: ChatMessage['type'],
    attachments?: ChatAttachment[]
  ) => void;
  updateMessageAttachment: (
    chatId: string,
    messageId: string,
    attachmentId: string,
    updates: Partial<ChatAttachment>
  ) => void;
  createChat: (participantIds: string[]) => string;

  // Groups
  groups: Group[];
  groupMessages: Record<string, GroupMessage[]>;
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'members' | 'admins' | 'pinnedPosts'>) => string;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  sendGroupMessage: (groupId: string, content: string) => void;
  addGroupPost: (groupId: string, content: string, isPinned?: boolean) => void;

  // Events
  events: Event[];
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'rsvps' | 'organizerId'>) => string;
  rsvpEvent: (eventId: string) => void;
  unrsvpEvent: (eventId: string) => void;

  // Safety
  blockedUsers: BlockedUser[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  reports: Report[];
  submitReport: (reportedUserId: string, reason: string, details: string) => void;

  // UI State
  highContrastMode: boolean;
  toggleHighContrast: () => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const useStore = create<AppState>((set, get) => ({
  // Current user
  currentUser: null,
  setCurrentUser: (user) => {
    set({ currentUser: user });
    get().saveToStorage();
  },
  updateCurrentUser: (updates) => {
    const current = get().currentUser;
    if (current) {
      set({ currentUser: { ...current, ...updates } });
      get().saveToStorage();
    }
  },

  // Discovery
  discoverProfiles: [],
  setDiscoverProfiles: (profiles) => set({ discoverProfiles: profiles }),
  savedProfiles: [],
  saveProfile: (userId) => {
    set((state) => ({ savedProfiles: [...state.savedProfiles, userId] }));
    get().saveToStorage();
  },
  unsaveProfile: (userId) => {
    set((state) => ({ savedProfiles: state.savedProfiles.filter((id) => id !== userId) }));
    get().saveToStorage();
  },
  passedProfiles: [],
  passProfile: (userId) => {
    set((state) => ({ passedProfiles: [...state.passedProfiles, userId] }));
    get().saveToStorage();
  },

  // Friend Requests & Matches
  friendRequests: [],
  sendFriendRequest: (toUserId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    const request: FriendRequest = {
      id: uuidv4(),
      fromUserId: currentUser.id,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    // Auto-accept for demo
    const match: Match = {
      id: uuidv4(),
      users: [currentUser.id, toUserId],
      createdAt: new Date().toISOString(),
    };
    const chatId = get().createChat([currentUser.id, toUserId]);
    set((state) => ({
      friendRequests: [...state.friendRequests, { ...request, status: 'accepted' }],
      matches: [...state.matches, match],
    }));
    get().saveToStorage();
    return chatId;
  },
  acceptFriendRequest: (requestId) => {
    set((state) => ({
      friendRequests: state.friendRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' as const } : r
      ),
    }));
    get().saveToStorage();
  },
  rejectFriendRequest: (requestId) => {
    set((state) => ({
      friendRequests: state.friendRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      ),
    }));
    get().saveToStorage();
  },
  matches: [],

  // Chats
  chats: [],
  chatMessages: {},
  sendMessageAs: (chatId, senderId, content, type = 'text', attachments = []) => {
    const message: ChatMessage = {
      id: uuidv4(),
      chatId,
      senderId,
      content,
      type,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [chatId]: [...(state.chatMessages[chatId] || []), message],
      },
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, lastMessage: message } : c
      ),
    }));
    get().saveToStorage();
  },
  sendMessage: (chatId, content, type = 'text', attachments = []) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    get().sendMessageAs(chatId, currentUser.id, content, type, attachments);
  },
  updateMessageAttachment: (chatId, messageId, attachmentId, updates) => {
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [chatId]: (state.chatMessages[chatId] || []).map((msg) => {
          if (msg.id !== messageId || !msg.attachments) return msg;
          return {
            ...msg,
            attachments: msg.attachments.map((att) =>
              att.id === attachmentId ? { ...att, ...updates } : att
            ),
          };
        }),
      },
      chats: state.chats.map((c) => {
        if (c.id !== chatId || !c.lastMessage || c.lastMessage.id !== messageId) return c;
        const last = c.lastMessage;
        if (!last.attachments) return c;
        return {
          ...c,
          lastMessage: {
            ...last,
            attachments: last.attachments.map((att) =>
              att.id === attachmentId ? { ...att, ...updates } : att
            ),
          },
        };
      }),
    }));
    get().saveToStorage();
  },
  createChat: (participantIds) => {
    const existing = get().chats.find(
      (c) =>
        c.participants.length === participantIds.length &&
        participantIds.every((id) => c.participants.includes(id))
    );
    if (existing) return existing.id;
    const chatId = uuidv4();
    const chat: Chat = {
      id: chatId,
      participants: participantIds,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      chats: [...state.chats, chat],
      chatMessages: { ...state.chatMessages, [chatId]: [] },
    }));
    get().saveToStorage();
    return chatId;
  },

  // Groups
  groups: [],
  groupMessages: {},
  createGroup: (groupData) => {
    const currentUser = get().currentUser;
    if (!currentUser) return '';
    const groupId = uuidv4();
    const group: Group = {
      ...groupData,
      id: groupId,
      members: [currentUser.id],
      admins: [currentUser.id],
      pinnedPosts: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      groups: [...state.groups, group],
      groupMessages: { ...state.groupMessages, [groupId]: [] },
    }));
    get().saveToStorage();
    return groupId;
  },
  joinGroup: (groupId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, members: [...g.members, currentUser.id] } : g
      ),
    }));
    get().saveToStorage();
  },
  leaveGroup: (groupId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.filter((id) => id !== currentUser.id) }
          : g
      ),
    }));
    get().saveToStorage();
  },
  sendGroupMessage: (groupId, content) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    const message: GroupMessage = {
      id: uuidv4(),
      groupId,
      senderId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      groupMessages: {
        ...state.groupMessages,
        [groupId]: [...(state.groupMessages[groupId] || []), message],
      },
    }));
    get().saveToStorage();
  },
  addGroupPost: (groupId, content, isPinned = false) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    const post: GroupPost = {
      id: uuidv4(),
      groupId,
      authorId: currentUser.id,
      content,
      isPinned,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, pinnedPosts: isPinned ? [...g.pinnedPosts, post] : g.pinnedPosts }
          : g
      ),
    }));
    get().saveToStorage();
  },

  // Events
  events: [],
  createEvent: (eventData) => {
    const currentUser = get().currentUser;
    if (!currentUser) return '';
    const eventId = uuidv4();
    const event: Event = {
      ...eventData,
      id: eventId,
      organizerId: currentUser.id,
      rsvps: [currentUser.id],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ events: [...state.events, event] }));
    get().saveToStorage();
    return eventId;
  },
  rsvpEvent: (eventId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, rsvps: [...e.rsvps, currentUser.id] } : e
      ),
    }));
    get().saveToStorage();
  },
  unrsvpEvent: (eventId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? { ...e, rsvps: e.rsvps.filter((id) => id !== currentUser.id) }
          : e
      ),
    }));
    get().saveToStorage();
  },

  // Safety
  blockedUsers: [],
  blockUser: (userId) => {
    set((state) => ({
      blockedUsers: [...state.blockedUsers, { userId, blockedAt: new Date().toISOString() }],
    }));
    get().saveToStorage();
  },
  unblockUser: (userId) => {
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((b) => b.userId !== userId),
    }));
    get().saveToStorage();
  },
  reports: [],
  submitReport: (reportedUserId, reason, details) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    const report: Report = {
      id: uuidv4(),
      reporterId: currentUser.id,
      reportedUserId,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ reports: [...state.reports, report] }));
    get().saveToStorage();
  },

  // UI State
  highContrastMode: false,
  toggleHighContrast: () => {
    set((state) => ({ highContrastMode: !state.highContrastMode }));
    get().saveToStorage();
  },

  // Persistence
  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem('nearsign_data');
      if (data) {
        const parsed = JSON.parse(data);
        set({
          currentUser: parsed.currentUser || null,
          discoverProfiles: parsed.discoverProfiles || [],
          savedProfiles: parsed.savedProfiles || [],
          passedProfiles: parsed.passedProfiles || [],
          friendRequests: parsed.friendRequests || [],
          matches: parsed.matches || [],
          chats: parsed.chats || [],
          chatMessages: parsed.chatMessages || {},
          groups: parsed.groups || [],
          groupMessages: parsed.groupMessages || {},
          events: parsed.events || [],
          blockedUsers: parsed.blockedUsers || [],
          reports: parsed.reports || [],
          highContrastMode: parsed.highContrastMode || false,
        });
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  },
  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const state = get();
      const data = {
        currentUser: state.currentUser,
        discoverProfiles: state.discoverProfiles,
        savedProfiles: state.savedProfiles,
        passedProfiles: state.passedProfiles,
        friendRequests: state.friendRequests,
        matches: state.matches,
        chats: state.chats,
        chatMessages: state.chatMessages,
        groups: state.groups,
        groupMessages: state.groupMessages,
        events: state.events,
        blockedUsers: state.blockedUsers,
        reports: state.reports,
        highContrastMode: state.highContrastMode,
      };
      localStorage.setItem('nearsign_data', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  },
}));

export default useStore;
