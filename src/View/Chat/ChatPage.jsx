import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import GroupChatPage from "./GroupChatPage";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import EmojiPicker from 'emoji-picker-react';
import {
  resolveAuthUserId,
  appRoute,
  getStoredAuthUser,
  mergeStoredAuthUser,
  authJsonHeaders,
  canUseMemberFeatures,
  getGuestProfile,
} from "../../utils/auth";
import StickersBar from "./Componets/StickersBar";
import {
  createGroup as createGroupModule,
  createRenderGroupChatItem,
  createRenderUserChatItem,
  createRenderHostChatItem,
  renderDirectMessagesWithDates,
  matchesPeopleFilter,
  formatCompactCount,
  normalizeSex,
  normalizeCategory,
} from "./Componets/chatModules";
import { API_BASE, getApiOrigin } from "../../config/api";
import { PlanDpRing } from "../User/Componets/PlanCrown";
import { setActiveChatPeer } from "../../utils/chatNotifications";

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const myUserId = resolveAuthUserId();
  const [user, setUser] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);
  const [isNewDm, setIsNewDm] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const handleEditMessage = (msg) => {
    setText(
      msg.message ||
      msg.text ||
      msg.content ||
      ""
    );
    setEditingMessageId(msg._id);
  };
  const [dmStarted, setDmStarted] = useState({});

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [myId, setMyId] = useState("");
  const [text, setText] = useState("");
  const [lastConversations, setLastConversations] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [messageStats, setMessageStats] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [peopleFilter, setPeopleFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [headerChatMenuOpen, setHeaderChatMenuOpen] = useState(false);
  const headerChatMenuRef = useRef(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState([]);
  const [pendingSelectGroupId, setPendingSelectGroupId] = useState(null);

  const [newDmModal, setNewDmModal] = useState(null);
  const [newDmConfirmLoading, setNewDmConfirmLoading] = useState(false);

  const [blockUnblockLoading, setBlockUnblockLoading] = useState(false); // New state for block/unblock
  const [blockedUsers, setBlockedUsers] = useState([]); // Keep local blocked users
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [potentialMembers, setPotentialMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const messagesEndRef = useRef(null);

  const openAddMembersModal = async () => {
    try {
      setLoadingMembers(true);

      const res = await axios.get(
        `${API_BASE_URL}/chat/potential-members`,
        {
          params: {
            groupId: selectedGroup._id,
            myId
          },
          headers: authJsonHeaders(),
        }
      );

      setPotentialMembers(res.data.users || []);
      setSelectedMembers([]);
      setShowAddMembersModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const addMembersToGroup = async () => {
    try {
      if (!selectedMembers.length) return;

      const res = await axios.post(
        `${API_BASE_URL}/chat/add-group-members`,
        {
          groupId: selectedGroup._id,
          userIdsToAdd: selectedMembers,
        },
        {
          headers: authJsonHeaders(),
        }
      );

      alert("Members added successfully");

      setShowAddMembersModal(false);

      if (res.data.group) {
        setSelectedGroup(res.data.group);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add members");
    }
  };

  // Simple image slider component using gallery images
  const ChatBackgroundSlider = ({ images = [], interval = 5000 }) => {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
      if (!images.length) return;
      const id = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, interval);
      return () => clearInterval(id);
    }, [images, interval]);
    if (!images || !images.length) return null;
    return (
      <div
        className="cp-chat-bg-slider"
        style={{
          position: "absolute",
          zIndex: 0,
          inset: 0,
          width: "100%",
          height: "100%",
          background: `url(${images[current]}) center center/cover no-repeat`,
          opacity: 1,
          transition: "background-image 0.8s ease",
          pointerEvents: "none",
        }}
      />
    );
  };

  const API_BASE_URL = API_BASE;

  const [profileMode, setProfileMode] = useState(
    () => getStoredAuthUser()?.profileMode || "user",
  );
  const [hostApproved, setHostApproved] = useState(
    () =>
      Boolean(getStoredAuthUser()?.hostApproved) ||
      getStoredAuthUser()?.profileMode === "host"
  );
  const [planActive, setPlanActive] = useState(
    () => Boolean(getStoredAuthUser()?.isActive)
  );
  const isHostProfile = profileMode === "host";

  const otherUsers = users.filter((u) => String(u?._id) !== String(myId));
  const filteredOtherUsers = otherUsers.filter((u) =>
    matchesPeopleFilter(u, peopleFilter)
  );
  const API_ORIGIN = getApiOrigin(API_BASE_URL);

  const maleCount = otherUsers.filter((u) => normalizeSex(u?.sex) === "male").length;
  const femaleCount = otherUsers.filter((u) => normalizeSex(u?.sex) === "female").length;
  const xlCount = otherUsers.filter((u) => normalizeCategory(u?.category) === "XL").length;
  const xxlCount = otherUsers.filter((u) => normalizeCategory(u?.category) === "XXL").length;
  const xxxlCount = otherUsers.filter((u) => normalizeCategory(u?.category) === "XXXL").length;
  const hostCount = otherUsers.filter((u) => u?.profileMode === "host").length;
  const chatsCount = otherUsers.filter((u) => dmStarted[u._id] === true).length;

  // ---- Sort users according to last chat activity at the top ----

  // Returns a sorted array of the given users by last message time (newest at top)
  const sortUsersByLastMessage = (userArray, lastConvosObj) => {
    return [...userArray].sort((a, b) => {
      const lca = lastConvosObj[a._id]?.updatedAt;
      const lcb = lastConvosObj[b._id]?.updatedAt;
      // Both have last message, sort descending
      if (lca && lcb) {
        return new Date(lcb) - new Date(lca);
      }
      if (lca) return -1;
      if (lcb) return 1;
      return String(a.name || "").localeCompare(b.name || "");
    });
  };

  const sortedOtherUsers = sortUsersByLastMessage(filteredOtherUsers, lastConversations);

  const sortedForHost = sortUsersByLastMessage(
    filteredOtherUsers,
    lastConversations
  );

  const sortedForStartedChats = sortUsersByLastMessage(
    filteredOtherUsers.filter((user) => dmStarted[user._id] === true),
    lastConversations
  );


  // Fetch authenticated user and extract gallery for slider
  useEffect(() => {
    if (!canUseMemberFeatures()) {
      const guest = getGuestProfile();
      if (guest) {
        setUser({
          name: guest.name || "Guest",
          nickname: guest.name || "guest",
          totalEarned: 0,
        });
      }
      return;
    }
    axios
      .get(`${API_BASE_URL}/auth/user/me`, { headers: authJsonHeaders() })
      .then((res) => {
        const u = res.data?.user || null;
        setUser(u);
        setBlockedUsers(u?.blockedUsers || []);
        const galleryArr = Array.isArray(u?.gallery) ? u.gallery : [];
        setGallery(galleryArr);
        if (u?.profileMode) {
          setProfileMode(u.profileMode);
        }
        const approved =
          Boolean(u?.hostApproved) ||
          u?.profileMode === "host" ||
          Boolean(u?.isActive);
        setHostApproved(approved);
        setPlanActive(Boolean(u?.isActive));
        mergeStoredAuthUser({
          profileMode: u?.profileMode || "user",
          hostApproved: approved,
          isActive: Boolean(u?.isActive),
          plan: u?.plan || "",
          name: u?.name,
          email: u?.email,
        });
      })
      .catch((err) => {
        toast(
          err?.response?.data?.message || "Could not fetch profile."
        );
      });
  }, []);

  // Load users and myId
  useEffect(() => {
    const authId = resolveAuthUserId();
    if (!authId) {
      axios
        .get(`${API_BASE_URL}/chat/users`)
        .then((res) => {
          const list = Array.isArray(res.data?.data) ? res.data.data : [];
          setUsers(list.filter((u) => u && u.isDisabled !== true));
          setMyId("");
        })
        .catch(() => {
          setUsers([]);
          setMyId("");
        });
      return;
    }
    axios
      .get(`${API_BASE_URL}/chat/users-not-blocked-me?myId=${authId}`, { headers: authJsonHeaders() })
      .then((res) => {
        if (res.data && res.data.success === false && res.data.message === "myId required") {
          toast("Auth error: user id required. Please log in again.");
          setUsers([]);
          setMyId("");
          return;
        }
        setUsers(res.data.data);
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        const found =
          authId && list.find((u) => String(u?._id) === String(authId));
        const resolvedId = found?._id || authId || list?.[0]?._id || "";
        setMyId(resolvedId);
        if (found?.profileMode) {
          setProfileMode(found.profileMode);
          mergeStoredAuthUser({ profileMode: found.profileMode });
        }
      })
      .catch((err) => {
        toast(err?.response?.data?.message || "Could not fetch users.");
        setUsers([]);
        setMyId("");
      });
  }, []);

  // --- Fetch Selected User as before ---
  useEffect(() => {
    const fetchSelectedUser = async () => {
      if (!location.state?.selectedUser) return;
      const userId = location.state.selectedUser;
      const clickedUser = users.find(u => String(u._id) === String(userId));
      if (clickedUser) {
        setSelectedUser(clickedUser);
      }
      if (!canUseMemberFeatures()) {
        setIsNewDm({ isNewDm: true });
        return;
      }
      try {
        const myid = location.state.userId;
        const { data } = await axios.get(`${API_BASE_URL}/chat/dm-preview/${myid}/${userId}`);
        setIsNewDm(data);
      } catch (err) {
        toast('Failed');
      }
    };

    if (users.length) {
      fetchSelectedUser();
    }
  }, [location.state, users]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const peer = params.get("peer");
    if (!peer || !users.length) return;
    const found = users.find((u) => String(u._id) === String(peer));
    if (found) {
      setSelectedUser(found);
      setDmStarted((prev) => ({ ...prev, [found._id]: true }));
    }
  }, [location.search, users]);

  useEffect(() => {
    setActiveChatPeer(selectedUser?._id || "");
    return () => setActiveChatPeer("");
  }, [selectedUser?._id]);

  // --- Fetch dmStarted as before ---
  useEffect(() => {
    if (!myId || users.length === 0) return;
    const fetchDm = async () => {
      const result = {};
      await Promise.all(
        users.map(async (user) => {
          if (String(user._id) === String(myId)) {
            return;
          }
          try {
            const { data } = await axios.get(`${API_BASE_URL}/chat/dm-preview/${myId}/${user._id}`);
            result[user._id] = !data.isNewDm;
          } catch { result[user._id] = false; }
        })
      );
      setDmStarted(result);
    };
    fetchDm();
  }, [users, myId]);

  // --- Reset group/tab as before ---
  useEffect(() => {
    if (!isHostProfile) {
      setSelectedGroup(null);
      setActiveTab((t) => (t === "groups" ? "chats" : t));
    }
  }, [isHostProfile]);

  // --- Switch profile mode as before ---
  const switchProfileMode = async (mode) => {
    if (!myUserId) {
      toast("Sign in required");
      return;
    }
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/auth/user/profile-mode`,
        { profileMode: mode },
        { headers: authJsonHeaders() },
      );
      const u = res.data?.user;
      const next = u?.profileMode || mode;
      const approved = Boolean(u?.hostApproved) || next === "host";
      setProfileMode(next);
      setHostApproved(approved);
      mergeStoredAuthUser({ profileMode: next, hostApproved: approved });
      setUsers((prev) =>
        prev.map((x) =>
          String(x._id) === String(myUserId)
            ? { ...x, profileMode: next }
            : x
        )
      );
      toast(next === "host" ? "Switched to host profile" : "Switched to user profile");
    } catch (e) {
      if (e.response?.status === 403 || e.response?.data?.code === "NO_ACTIVE_PLAN") {
        toast(
          e.response?.data?.message ||
            "You do not have any active plan. Activate a plan to become a host."
        );
        navigate(appRoute("plans"));
        return;
      }
      toast(e.response?.data?.message || "Could not switch profile");
    }
  };

  const handleBecomeOrSwitchHost = async () => {
    setMenuOpen(false);
    if (!myUserId) {
      toast("Sign in required");
      return;
    }
    if (planActive || hostApproved) {
      switchProfileMode("host");
      return;
    }
    toast("You do not have any active plan. Activate a plan to become a host.");
    navigate(appRoute("plans"));
  };

  // --- Fetch unread counts as before ---
  const fetchUnreadCounts = useCallback(async () => {
    if (!myId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/unread-counts/${myId}`);
      setUnreadCounts(res.data?.counts || {});
      setTotalUnread(res.data?.totalUnread || 0);
    } catch {
      setUnreadCounts({});
      setTotalUnread(0);
    }
  }, [myId]);

  // --- Fetch message stats as before ---
  const fetchMessageStats = useCallback(async (peerId) => {
    if (!myId || !peerId) {
      setMessageStats(null);
      return;
    }
    try {
      const res = await axios.get(
        `${API_BASE_URL}/chat/messages/stats/${myId}/${peerId}`,
      );
      setMessageStats(res.data || null);
    } catch {
      setMessageStats(null);
    }
  }, [myId]);

  // --- Mark messages read as before ---
  const markMessagesRead = useCallback(async (peerId) => {
    if (!myId || !peerId) return;
    try {
      await axios.put(`${API_BASE_URL}/chat/messages/read`, {
        userId: myId,
        senderId: peerId,
      });
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === String(peerId)
            ? { ...m, isRead: true, readAt: m.readAt || new Date().toISOString() }
            : m,
        ),
      );
      setUnreadCounts((prev) => {
        const next = { ...prev };
        delete next[String(peerId)];
        return next;
      });
      setLastConversations((prev) => ({
        ...prev,
        [peerId]: { ...(prev[peerId] || {}), unreadCount: 0 },
      }));
    } catch {
      // ignore
    }
  }, [myId]);

  // --- Fetch conversations & unread counts as before ---
  useEffect(() => {
    if (!myId || users.length === 0) return;

    const fetchConvos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/conversations/${myId}`);
        const convos = Array.isArray(res.data) ? res.data : [];
        const resultObj = {};

        for (const convo of convos) {
          if (convo.isGroup) continue;
          const peer = (convo.participants || []).find(
            (p) => String(p._id || p) !== String(myId),
          );
          const peerId = peer?._id || peer;
          if (!peerId) continue;

          resultObj[String(peerId)] = {
            lastMessage: convo.lastMessage,
            type: convo.lastMessageType,
            updatedAt: convo.lastMessageTime || convo.updatedAt,
            unreadCount: convo.unreadCount || 0,
          };
        }

        setLastConversations(resultObj);
      } catch {
        setLastConversations({});
      }
    };

    fetchConvos();
    fetchUnreadCounts();
  }, [myId, users, fetchUnreadCounts]);

  // --- Fetch messages for selected user, POLL for updates every 2s ---
  const fetchMessages = useCallback(async () => {
    if (!selectedUser || !myId) return;
    const peerId = selectedUser._id;
    const res = await axios.get(
      `${API_BASE_URL}/chat/messages/${myId}/${peerId}`,
    );
    setMessages(res.data);
    await markMessagesRead(peerId);
    await fetchMessageStats(peerId);
    await fetchUnreadCounts();
  }, [myId, selectedUser, markMessagesRead, fetchMessageStats, fetchUnreadCounts]);

  // Immediate fetch + polling for new messages without refresh
  useEffect(() => {
    let interval;
    const run = () => {
      fetchMessages();
    };
    if (selectedUser && myId) {
      run();
      interval = setInterval(run, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchMessages, selectedUser, myId]);

  useEffect(() => {
    const onOpenPeer = (e) => {
      const peerId = e.detail?.peerId;
      if (!peerId || !users.length) return;
      const found = users.find((u) => String(u._id) === String(peerId));
      if (found) {
        setSelectedUser(found);
        setSelectedGroup(null);
        setDmStarted((prev) => ({ ...prev, [found._id]: true }));
      }
    };
    const onIncoming = (e) => {
      const payload = e.detail || {};
      fetchUnreadCounts();
      if (
        selectedUser &&
        String(payload.senderId) === String(selectedUser._id) &&
        !payload.groupId
      ) {
        fetchMessages();
      }
    };
    window.addEventListener("open-chat-peer", onOpenPeer);
    window.addEventListener("chat-new-message", onIncoming);
    return () => {
      window.removeEventListener("open-chat-peer", onOpenPeer);
      window.removeEventListener("chat-new-message", onIncoming);
    };
  }, [users, selectedUser, fetchUnreadCounts, fetchMessages]);

  const fetchGroups = useCallback(async () => {
    try {
      if (!myId) {
        setGroups([]);
        return;
      }
      const res = await axios.get(
        `${API_BASE_URL}/chat/groups`,
        { headers: authJsonHeaders() }
      );
      setGroups(res.data?.groups || res.data || []);
    } catch (err) {
      console.error("Failed to fetch groups", err);
      setGroups([]);
    }
  }, [myId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (!pendingSelectGroupId) return;
    const match = groups.find(
      (g) => (g?._id || g?.id) === pendingSelectGroupId,
    );
    if (match) {
      setSelectedGroup(match);
      setPendingSelectGroupId(null);
    }
  }, [pendingSelectGroupId, groups]);

  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!headerChatMenuOpen) return;
    const onMouseDown = (e) => {
      if (headerChatMenuRef.current && !headerChatMenuRef.current.contains(e.target)) {
        setHeaderChatMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [headerChatMenuOpen]);

  const handleDeleteChat = async () => {
    const peerId = selectedUser?._id;
    if (!myId || !peerId) {
      toast("Select a chat first");
      return;
    }
    setHeaderChatMenuOpen(false);

    const result = await Swal.fire({
      title: "Are you sure you want to delete Chat History?",
      text: " Chat history and its messages will delete permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#4b4563",
      background: "#1a1233",
      color: "#fff",
      heightAuto: false,
      allowOutsideClick: false,
      target: document.body,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/chat/conversation/${peerId}`, {
        headers: authJsonHeaders(),
      });
      setMessages([]);
      setSelectedUser(null);
      setLastConversations((prev) => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
      setUnreadCounts((prev) => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
      setDmStarted((prev) => ({ ...prev, [peerId]: true }));
      setIsNewDm({ isNewDm: false });
      toast("Chat deleted");
    } catch (err) {
      toast(err.response?.data?.message || "Could not delete chat");
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser]);

  const [selectedFile, setSelectedFile] = useState(null);

  const updateMessage = async () => {
    if (!text.trim() || !editingMessageId) return;

    try {
      await axios.patch(`${API_BASE_URL}/chat/edit-message`, {
        messageId: editingMessageId,
        newMessage: text,
        userId: myId,
      });

      setText("");
      setEditingMessageId(null);

      fetchMessages();
      toast.success("Message updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update message");
    }
  };
  // Send message
  const sendMessage = async () => {
    // edit mode
    if (editingMessageId) {
      return updateMessage();
    }

    try {
      let uploadedFile = null;

      if (selectedFile) {
        uploadedFile = await uploadFile(selectedFile);
      }

      if (!text.trim() && !uploadedFile) return;

      await axios.post(`${API_BASE_URL}/chat/send-message`, {
        senderId: myId,
        receiverId: selectedUser._id,

        message: text || "",

        type: uploadedFile ? "file" : "text",

        file: uploadedFile,
      });

      setText("");
      setSelectedFile(null);

      fetchMessages();
    } catch (err) {
      toast(err.response?.data?.message || "Error");
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const res = await axios.post(
      `${API_BASE_URL}/chat/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.file;
  };

  // Send sticker as message
  const sendSticker = async (sticker) => {
    if (!sticker || !selectedUser || !myId) return;
    if (
      selectedUser &&
      blockedUsers &&
      blockedUsers.includes(selectedUser._id)
    ) {
      toast("You cannot send a sticker to a blocked user!");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/chat/send-message`, {
        senderId: myId,
        receiverId: selectedUser._id,
        message: sticker.imageUrl,
        type: "sticker",
        sticker: {
          name: sticker.name,
          slug: sticker.slug,
          cost: sticker.cost,
          imageUrl: sticker.imageUrl,
        },
        cost: sticker.cost,
      });
      fetchMessages();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to send sticker");
    }
  };

  const createGroup = async () =>
    createGroupModule({
      apiBaseUrl: API_BASE_URL,
      groupName,
      myId,
      groupMemberIds,
      setGroupModalOpen,
      setGroupName,
      setGroupMemberIds,
      setMenuOpen,
      setSelectedUser,
      setSelectedGroup,
      setPendingSelectGroupId,
      fetchGroups,
      toast,
    });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  const isChatSelected = Boolean(selectedUser || selectedGroup);
  const mobileStage = isMobile ? (isChatSelected ? "chat" : "list") : "split";

  const handleMobileBack = useCallback(() => {
    setSelectedUser(null);
    setSelectedGroup(null);
    setShowEmojiPicker(false);
    setMobileInfoOpen(false);
    setNewDmModal(null);
  }, []);

  const openDm = () => {
    if (!canUseMemberFeatures()) return;
    if (!selectedUser) return;
    setNewDmModal({
      user: selectedUser,
      newDmCost: isNewDm.newDmCost,
      walletBalance: isNewDm.walletBalance,
    });
  };

  const handleSelectUser = useCallback(
    async (user) => {
      if (myId && String(user?._id) === String(myId)) return;
      setSelectedGroup(null);
      if (isMobile) setMobileInfoOpen(false);

      if (!canUseMemberFeatures()) {
        setSelectedUser(user);
        setIsNewDm({ isNewDm: true });
        return;
      }

      if (!myId) {
        toast("Sign in required");
        return;
      }

      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/chat/dm-preview/${myId}/${user._id}`,
        );

        if (data) {
          setSelectedUser(user);
          setIsNewDm(data);
          return;
        }
      } catch (e) {
        toast(e.response?.data?.message || "Could not open chat");
      }
    },
    [myId, isMobile]
  );

  const confirmNewDm = useCallback(async () => {
    if (!newDmModal?.user || !myId) return;
    const peer = newDmModal.user;
    if (
      (Number(newDmModal.walletBalance) || 0) <
      (Number(newDmModal.newDmCost) || 0)
    ) {
      toast("Insufficient coin balance. Top up your wallet first.");
      return;
    }
    setNewDmConfirmLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/chat/start-dm`, {
        userId: myId,
        peerId: peer._id,
      });
      setSelectedUser(peer);
      setNewDmModal(null);
      const deducted = data.deducted ?? newDmModal.newDmCost;
      if (!data.alreadyStarted && deducted) {
        toast(`${deducted} coins deducted. You can message ${peer.name || "this user"} now.`);
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Could not start chat";
      toast(msg);
      const wb = e.response?.data?.walletBalance;
      if (typeof wb === "number") {
        setNewDmModal((prev) => (prev ? { ...prev, walletBalance: wb } : prev));
      }
    } finally {
      setNewDmConfirmLoading(false);
    }
  }, [newDmModal, myId]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(Boolean(mq.matches));
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeEventListener("remove", update);
    };
  }, []);

  const renderHostChatItem = createRenderHostChatItem({
    myId,
    selectedUser,
    lastConversations,
    unreadCounts,
    onSelectUser: handleSelectUser,
  });

  const renderUserChatItem = createRenderUserChatItem({
    myId,
    selectedUser,
    lastConversations,
    unreadCounts,
    onSelectUser: handleSelectUser,
  });

  const renderGroupChatItem = createRenderGroupChatItem({
    selectedGroup,
    setSelectedGroup: (g) => {
      setSelectedGroup(g);
      if (isMobile) setMobileInfoOpen(false);
    },
    setSelectedUser,
  });

  // ---- Block/Unblock Logic ----
  const blockUser = async (userId) => {
    if (!userId) return;
    setBlockUnblockLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/auth/user/block`,
        { targetUserId: userId },
        { headers: authJsonHeaders() }
      );
      setBlockedUsers((prev) => [...prev, userId]);
      toast("User blocked");
    } catch (err) {
      toast(err.response?.data?.message || "Could not block user");
    } finally {
      setBlockUnblockLoading(false);
    }
  };

  const unblockUser = async (userId) => {
    if (!userId) return;
    setBlockUnblockLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/auth/user/unblock`,
        { targetUserId: userId },
        { headers: authJsonHeaders() }
      );
      setBlockedUsers((prev) => prev.filter((id) => id !== userId));
      toast("User unblocked");
    } catch (err) {
      toast(err.response?.data?.message || "Could not unblock user");
    } finally {
      setBlockUnblockLoading(false);
    }
  };

  // For debugging - safe to leave
  // console.log(selectedGroup);

  const follow = async (selected) => {
    try {
      let fol = await axios.post(
        `${API_BASE_URL}/auth/user/toggleFollow`,
        { targetUserId: selected },
        { headers: authJsonHeaders() }
      );
      if (fol?.data?.success) {
        toast(fol?.data?.message);
      }
    } catch (err) {
      toast(err.response?.data?.message || "Error");
    }
  };

  // ---- Begin: GALLERY BACKGROUND LOGIC ----
  // Determine chat background gallery
  let chatGallery = gallery;
  if (selectedUser && selectedUser.gallery && selectedUser.gallery.length > 0) {
    chatGallery = selectedUser.gallery;
  }
  // ---- End: GALLERY BACKGROUND LOGIC ----

  return (
    <div
      className={[
        "chat-page",
        isMobile ? "cp-mobile" : "",
        mobileStage === "list" ? "cp-show-list" : "",
        mobileStage === "chat" ? "cp-show-chat" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ position: "relative" }}
    >
      {/* Inject chat window background slider */}

      {/* LEFT: USERS */}
      <div className="sidebar cp-discover">
        <div className="cp-discover-profile">
          <PlanDpRing plan={user?.plan} className="cp-disc-avatar cp-disc-avatar-lg">
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="profile" />
              : (user?.name?.charAt(0)?.toUpperCase() || "?")
            }
          </PlanDpRing>
          <div className="cp-discover-profile-grid">
            <div className="cp-discover-profile-left">
              <h2 className="cp-discover-name">
                <span className="cp-discover-name-text">
                {(() => {
  const name = user?.nickname || user?.name || "You";
  return name.length > 5 ? `${name.slice(0, 5)}...` : name;
})()}                </span>
                {isHostProfile ? <span className="cp-disc-host">HOST</span> : null}
                {totalUnread > 0 && (
                  <span className="cp-sidebar-unread-total" title="Total unread messages">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </h2>
              <div className="cp-discover-coins">
                <img src="/images/icon2.png" alt="" className="cp-disc-coin" />
                <span>{formatCompactCount(user?.totalEarned)} Earned</span>
              </div>
            </div>
            <div className="cp-discover-profile-right">
              <div className="cp-discover-profile-right-row">
              <span className="cp-discover-online">
  <i className="bi bi-circle-fill" aria-hidden="true" />
  Online
</span>
                <div ref={menuRef} className="menu-wrapper cp-discover-menu">
                  <button onClick={() => setMenuOpen((v) => !v)} className="menu-btn">
                    ⋮
                  </button>
                  {menuOpen && (
                    <div className="menu-dropdown">
                      {isHostProfile ? (
                        <>
                          <button
                            className="menu-item"
                            onClick={() => {
                              setMenuOpen(false);
                              setGroupModalOpen(true);
                            }}
                          >
                            Create Group
                          </button>
                          <button
                            className="menu-item"
                            onClick={async () => {
                              setMenuOpen(false);
                              if (!myUserId) {
                                toast("Sign in to go live");
                                return;
                              }
                              try {
                                const res = await axios.post(
                                  `${API_BASE_URL}/chat/live/start`,
                                  {
                                    userId: myUserId,
                                    title: "",
                                  }
                                );
                                const sid = res.data?.session?._id;
                                if (sid) {
                                  navigate(appRoute(`live/${sid}`));
                                } else {
                                  toast("Could not start live");
                                }
                              } catch (e) {
                                toast(
                                  e.response?.data?.message || "Could not start live"
                                );
                              }
                            }}
                          >
                            Start live chat
                          </button>
                        </>
                      ) : (
                        <button
                          className="menu-item"
                          onClick={handleBecomeOrSwitchHost}
                        >
                          {planActive || hostApproved
                            ? "Switch to host profile"
                            : "Become a host"}
                        </button>
                      )}
                      <button
                        className="menu-item"
                        onClick={() => {
                          setMenuOpen(false);
                          if (!myUserId) {
                            toast("Sign in required");
                            return;
                          }
                          navigate(appRoute("live"));
                        }}
                      >
                        Browse live chats
                      </button>
                      {isHostProfile && (
                        <button
                          className="menu-item"
                          onClick={() => {
                            setMenuOpen(false);
                            switchProfileMode("user");
                          }}
                        >
                          Switch to user profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span className="cp-discover-vibes">Good Vibes Only</span>
            </div>
          </div>
        </div>

        <div className="chat-list-wrapper" data-guest-ok="true">
          <div className="cp-discover-chips">
            {[
              { id: "all", label: "All", count: otherUsers.length, icon: "bi-grid-fill" },
              { id: "male", label: "Male", count: maleCount, icon: "bi-gender-male" },
              { id: "female", label: "Female", count: femaleCount, icon: "bi-gender-female" },
              { id: "xl", label: "XL", count: xlCount },
              { id: "xxl", label: "XXL", count: xxlCount },
              { id: "xxxl", label: "XXXL", count: xxxlCount },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={`cp-disc-chip${peopleFilter === chip.id ? " active" : ""}`}
                onClick={() => {
                  setPeopleFilter(chip.id);
                  if (chip.id === "all") setActiveTab("all");
                }}
              >
                {chip.icon ? <i className={`bi ${chip.icon}`} aria-hidden="true" /> : null}
                {chip.label}
                <b>{chip.count}</b>
              </button>
            ))}
          </div>

          <div className="cp-discover-tabs">
            <button
              type="button"
              className={`cp-disc-tab${activeTab === "host" ? " active" : ""}`}
              onClick={() => setActiveTab("host")}
            >
              <i className="bi bi-broadcast" aria-hidden="true" />
              Host
              <b>{hostCount}</b>
            </button>
            <button
              type="button"
              className={`cp-disc-tab${activeTab === "chats" ? " active" : ""}`}
              onClick={() => setActiveTab("chats")}
            >
              <i className="bi bi-chat-dots-fill" aria-hidden="true" />
              Chats
              <b>{chatsCount}</b>
            </button>
            <a href={appRoute("live")} className="cp-disc-tab">
              <i className="bi bi-camera-video-fill" aria-hidden="true" />
              Live
            </a>
            {isHostProfile && (
              <button
                type="button"
                className={`cp-disc-tab${activeTab === "groups" ? " active" : ""}`}
                onClick={() => setActiveTab("groups")}
              >
                Groups
              </button>
            )}
          </div>

          {/* CHAT LISTS */}
          {activeTab === "all" && (
            <div className="chat-box">
              <div className="chat-list">
                {sortedOtherUsers.map(renderUserChatItem)}
              </div>
              {/* {isHostProfile && groups.map(renderGroupChatItem)} */}
            </div>
          )}
          {activeTab === "host" && (
            <div className="chat-box">
              <div className="chat-list">
                {sortedForHost.map(renderHostChatItem)}
              </div>
            </div>
          )}
          {activeTab === "chats" && (
            <div className="chat-box">
              <div className="chat-list">
                {sortedForStartedChats.map(renderUserChatItem)}
              </div>
            </div>
          )}
          {isHostProfile && activeTab === "groups" && (
            <div className="chat-box">
              {sortedForHost.map(renderHostChatItem)}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: CHAT */}
      <div className="chat-window" style={{ position: "relative", zIndex: 1 /* above background images*/ }}>
        {/* The chat-messages etc will be above slider due to z-index */}
        {selectedUser && !isNewDm.isNewDm ? (
          <>
            <ChatBackgroundSlider images={chatGallery} interval={5000} />

            <div className="chat-header" data-guest-ok="true" role={isMobile ? "button" : undefined}>
              {isMobile && (
                <button
                  type="button"
                  className="cp-chat-back"
                  data-guest-ok="true"
                  aria-label="Back"
                  onClick={handleMobileBack}
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
              )}
              <PlanDpRing plan={selectedUser?.plan} className="chat-avatar">
                {selectedUser?.profilePhoto
                  ? <img src={selectedUser.profilePhoto} />
                  : (selectedUser?.name?.[0]?.toUpperCase()) || "U"
                }
              </PlanDpRing>
              <button
                type="button"
                className="cp-chat-header-hit"
                data-guest-ok="true"
                onClick={() => {
                  if (!isMobile) return;
                  setMobileInfoOpen(true);
                }}
              >
                <div className="chat-username">
                  {selectedUser.nickname || selectedUser.name}
                  {(selectedUser?.profileMode === "host") && (
                    <span className="cp-host-badge">Host</span>
                  )}
                </div>
                <div className="chat-status">
                  {Math.random() > 0.5 ? (
                    <span className="online">online</span>
                  ) : (
                    <span className="offline">last seen recently</span>
                  )}
                </div>
                
                {/* {messageStats && (
                  <div className="cp-chat-msg-stats">
                    <span className="cp-stat-unread">
                      {messageStats.receivedUnread} unread from them
                    </span>
                    <span className="cp-stat-read">
                      {messageStats.sentRead} read · {messageStats.sentUnread} unread by them
                    </span>
                  </div>
                )} */}
              </button>
              <div
                ref={headerChatMenuRef}
                className="cp-chat-header-menu"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="cp-chat-header-more"
                  aria-label="Chat options"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHeaderChatMenuOpen((v) => !v);
                  }}
                >
                  ⋮
                </button>
                {headerChatMenuOpen && (
                  <div className="menu-dropdown cp-chat-header-dropdown">
                    <button
                      type="button"
                      className="menu-item"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteChat();
                      }}
                    >
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            </div>



            <div className="chat-messages">
              <div className="messages-body">
              {messages.length === 0 ? (
                <div className="empty-chat">No messages yet. Say hello!</div>
              ) : (
                <>
                  {renderDirectMessagesWithDates({
                    msgs: messages,
                    myId,
                    assetBaseUrl: API_ORIGIN,
                    onEdit: handleEditMessage,

                  })}
                  <div ref={messagesEndRef}></div>
                </>
              )}
              </div>
            </div>

            <StickersBar apiBaseUrl={API_BASE_URL} onSelectSticker={sendSticker} />

            {/* If user is blocked, show a note and disable input */}
            {blockedUsers && selectedUser && blockedUsers.includes(selectedUser._id) ? (
              <div className="chat-blocked-msg">
                <span>
                  <i className="bi bi-exclamation-octagon text-danger" /> You have blocked this user. Unblock to start chatting.
                </span>
              </div>
            ) : (
              <div className="chat-input cp-chat-input-row">
                {/* Emoji Picker popover, now placed just above the emoji icon button */}
                {showEmojiPicker && (
                  <div className="cp-emoji-popover">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setText((prev) => prev + (emojiData.emoji || ""));
                        setShowEmojiPicker(false);
                      }}
                      theme="dark"
                      width={340}
                    />
                  </div>
                )}

                {selectedFile && (
                  <div className="selected-file-preview">
                    <span>{selectedFile.name}</span>

                    <button
                      onClick={() => setSelectedFile(null)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  aria-label="Emoji"
                  className="cp-emoji-btn"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                >
                  <span role="img" aria-label="emoji">
                    😊
                  </span>
                </button>
                <label className="cp-attachment-btn" style={{ cursor: "pointer", marginRight: 8 }}>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                  />
                  <i
                    className="bi bi-paperclip"
                    style={{ fontSize: 22, verticalAlign: "middle" }}
                    title="Attach file"
                  />
                </label>


                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    editingMessageId
                      ? "Edit your message..."
                      : "Type a message"
                  }
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="cp-chat-text-input"
                />

                <button onClick={sendMessage} className="cp-send-btn">
                  <i
                    className={`bi ${editingMessageId
                      ? "bi-check-lg"
                      : "bi-send-fill"
                      }`}
                  ></i>
                </button>
                {editingMessageId && (
                  <div
                  >


                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setEditingMessageId(null);
                        setText("");
                      }}
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : selectedGroup ? (
          <GroupChatPage
            group={selectedGroup}
            groupId={selectedGroup?._id || selectedGroup?.id}
            myId={myId}
            onBack={isMobile ? handleMobileBack : undefined}
            onOpenInfo={
              isMobile
                ? () => {
                  setMobileInfoOpen(true);
                }
                : undefined
            }
          />
        ) : (
          <>
            <div className="chat-header" data-guest-ok="true" role={isMobile ? "button" : undefined}>
              {isMobile && (
                <button
                  type="button"
                  className="cp-chat-back"
                  data-guest-ok="true"
                  aria-label="Back"
                  onClick={handleMobileBack}
                >
                 <i class="bi bi-chevron-left"></i>
                </button>
              )}

              <PlanDpRing plan={selectedUser?.plan} className="chat-avatar">
                {selectedUser?.profilePhoto ? (
                  <img src={selectedUser.profilePhoto} alt={selectedUser?.name || "User"} />
                ) : (
                  selectedUser?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </PlanDpRing>

              <button
                type="button"
                className="cp-chat-header-hit"
                data-guest-ok="true"
                onClick={() => {
                  if (isMobile) {
                    setMobileInfoOpen(true);
                  }
                }}
              >
                <div className="chat-username">
                  {selectedUser?.name || "Unknown User"}
                  {(selectedUser?.profileMode === "host") && (
                    <span className="cp-host-badge">Host</span>
                  )}
                </div>

                <div className="chat-status">
                  {selectedUser?.isOnline ? (
                    <span className="online">Online</span>
                  ) : (
                    <span className="offline">
                      {selectedUser?.lastSeen || "Last seen recently"}
                    </span>
                  )}
                </div>
              </button>
            </div>
            <div className="empty-state cp-chat-empty-state">
              <div className="cp-chat-empty-icon">💬</div>
              <div className="cp-chat-empty-text">
                {isHostProfile
                  ? "Interested? Check out my profile and send me a DM now."
                  : "Select a user for one-to-one chat (groups & going live are for host profile)"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Everything below here is as before - not altered for background */}
      <div className="details-panel">
        {selectedUser ? (
          <>
            <h3 className="details-title">Contact Info</h3>
            <PlanDpRing plan={selectedUser?.plan} className="big-avatar">
              {selectedUser.profilePhoto ? (
                <img src={selectedUser.profilePhoto} alt={selectedUser.name} />
              ) : (
                <span>
                  {(selectedUser.name?.[0] || "U").toUpperCase() || "U"}
                </span>
              )}
            </PlanDpRing>
            <div className="details-name">
              @{selectedUser.nickname || "chatprox_user"}
              {selectedUser.profileMode === "host" ? (
                <span className="cp-host-badge">Host</span>
              ) : null}
            </div>
            <p className="details-desc">
              {selectedUser.about ||
                "Passionate AI explorer using ChatProX for smart conversations and productivity."}
            </p>
            {/* USER STATS */}
            <div className="details-stats">
              <div className="details-stat-box">
                <h4>
                  {Number(selectedUser?.followers?.length || 0).toLocaleString()}
                </h4>
                <span>Followers</span>
              </div>
              <div className="details-stat-box">
                <h4>
                  {Math.max(0, Number(selectedUser.totalEarned || 0)).toLocaleString()}
                </h4>
                <span>Earned</span>
              </div>
            </div>

            {/* Block/unblock button here also (for details) */}
            {selectedUser && String(selectedUser._id) !== String(myId) && (
              <button
                className={`ghost-btn mt-3 w-100 ${blockedUsers && blockedUsers.includes(selectedUser._id) ? "ghost-btn-blocked" : "ghost-btn-block"}`}
                disabled={blockUnblockLoading}
                onClick={() => {
                  if (blockedUsers && blockedUsers.includes(selectedUser._id)) {
                    unblockUser(selectedUser._id);
                  } else {
                    blockUser(selectedUser._id);
                  }
                }}
              >
                <i className={`bi ${blockedUsers && blockedUsers.includes(selectedUser._id) ? "bi-unlock" : "bi-lock"}`}></i>
                {blockedUsers && blockedUsers.includes(selectedUser._id) ? " Unblock" : " Block"}
              </button>
            )}

            <button
              onClick={() => follow(selectedUser._id)}
              className="ghost-btn mt-3 w-100"
            >
              <i className={`bi ${selectedUser?.followers?.includes(myId) ? 'bi-dash-circle-fill' : 'bi-plus-circle-fill'}`}></i>
              {selectedUser?.followers?.includes(myId) ? " Unfollow" : " Follow"}
            </button>
            {!isNewDm?.isNewDm ? <button className="ghost-btn mt-3 w-100" hidden> DM </button> :
              <button onClick={openDm} className="ghost-btn mt-3 w-100" data-guest-lock="true"> DM</button>
            }
            {/* GALLERY */}
            <div className="details-gallery">
              <div className="details-gallery-head">
                <h4>Gallery</h4>
              </div>
              <div className="details-gallery-grid">
                {(selectedUser.gallery && selectedUser.gallery.length > 0) ? (
                  selectedUser.gallery.map((img, index) => (
                    <div className="details-gallery-item" key={index}>
                      <img src={img} alt={`gallery-${index}`} />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="gallery-item dummy">
                      <img src="http://apichatprox.mnbsoft.co.in/uploads/1778759586794-1000241082.jpg" />
                    </div>
                    <div className="gallery-item dummy">
                      <img src="http://apichatprox.mnbsoft.co.in/uploads/1778759586794-1000241082.jpg" />
                    </div>
                    <div className="gallery-item dummy">
                      <img src="http://apichatprox.mnbsoft.co.in/uploads/1778759586794-1000241082.jpg" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : selectedGroup ? (
          <>
            <h3 className="details-title">Group Info</h3>
            <div className="cp-group-info-avatar">
              {(selectedGroup?.name?.slice(0, 1)?.toUpperCase() || "G")}
            </div>
            <button
              className="ghost-btn mt-3 w-100"
              onClick={openAddMembersModal}
            >
              <i className="bi bi-person-plus-fill"></i>
              Add Members
            </button>
            <div className="cp-group-info-name">{selectedGroup?.name || "Untitled group"}</div>
            <div className="cp-group-info-meta">
              {Array.isArray(selectedGroup?.members)
                ? `Members: ${selectedGroup.members.length}`
                : "Group chat members preview unavailable."}
            </div>
          </>
        ) : (
          <div>
            {isHostProfile
              ? "Select a user or group to see details."
              : "Select a user to see details."}
          </div>
        )}
      </div>
      {
        showAddMembersModal && (
          <div className="cp-modal-overlay">
            <div className="cp-modal">

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Add Members</h4>

                <button
                  onClick={() => setShowAddMembersModal(false)}
                  className="btn btn-sm btn-danger"
                >
                  ✕
                </button>
              </div>

              {loadingMembers ? (
                <div>Loading...</div>
              ) : potentialMembers.length === 0 ? (
                <div>No users available.</div>
              ) : (
                <>
                  <div
                    style={{
                      maxHeight: "350px",
                      overflowY: "auto",
                    }}
                  >
                    {potentialMembers.map((user) => (
                      <label
                        key={user._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers((prev) => [
                                ...prev,
                                user._id,
                              ]);
                            } else {
                              setSelectedMembers((prev) =>
                                prev.filter(
                                  (id) => id !== user._id
                                )
                              );
                            }
                          }}
                        />

                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt=""
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: "#444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {user.name?.[0]}
                          </div>
                        )}

                        <div>
                          <div>{user.name}</div>
                          <small>
                            @{user.nickname || "user"}
                          </small>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    className="ghost-btn mt-3 w-100"
                    onClick={addMembersToGroup}
                    disabled={!selectedMembers.length}
                  >
                    Add Selected Members
                  </button>
                </>
              )}
            </div>
          </div>
        )
      }

      {/* mobile details modal */}
      {isMobile && mobileInfoOpen && (
        <div
          className="cp-chat-info-overlay"
          data-guest-ok="true"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileInfoOpen(false);
          }}
        >
          <div className="cp-chat-info-sheet">
            <div className="cp-chat-info-top">
              <div className="cp-chat-info-title">
                {selectedUser
                  ? "Contact info"
                  : selectedGroup
                    ? "Group info"
                    : "Info"}
              </div>
              <button
                type="button"
                className="cp-chat-info-close"
                aria-label="Close"
                onClick={() => setMobileInfoOpen(false)}
              >
                ✕
              </button>
            </div>
            {selectedUser ? (
              <>
                <div className="cp-chat-info-avatar">
                  {selectedUser.profilePhoto ? (
                    <img src={selectedUser.profilePhoto} alt={selectedUser.name} />
                  ) : (
                    selectedUser.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div className="cp-chat-info-name">
                  @{selectedUser.nickname || "chatprox_user"}
                </div>
                <div className="cp-chat-info-desc">
                  {selectedUser?.about ||
                    selectedUser?.bio ||
                    selectedUser?.description ||
                    "Passionate AI explorer using ChatProX for smart conversations and productivity."}
                </div>
                {/* STATS */}
                <div className="cp-chat-info-stats">
                  <div className="cp-chat-stat-box">
                    <h4>
                      {Number(selectedUser?.followers?.length || 0).toLocaleString()}
                    </h4>
                    <span>Followers</span>
                  </div>
                  <div className="cp-chat-stat-box">
                    <h4>
                      ₹{Number(selectedUser.totalEarned || 0).toLocaleString()}
                    </h4>
                    <span>Earned</span>
                  </div>
                </div>
                {/* Block/Unblock button - mobile (info modal) */}
                {selectedUser && String(selectedUser._id) !== String(myId) && (
                  <button
                    className={`ghost-btn mt-3 w-100 ${blockedUsers && blockedUsers.includes(selectedUser._id) ? "ghost-btn-blocked" : "ghost-btn-block"}`}
                    disabled={blockUnblockLoading}
                    onClick={() => {
                      if (blockedUsers && blockedUsers.includes(selectedUser._id)) {
                        unblockUser(selectedUser._id);
                      } else {
                        blockUser(selectedUser._id);
                      }
                    }}
                  >
                    <i className={`bi ${blockedUsers && blockedUsers.includes(selectedUser._id)
                      ? "bi-unlock"
                      : "bi-lock"
                      }`}></i>
                    {blockedUsers && blockedUsers.includes(selectedUser._id)
                      ? " Unblock"
                      : " Block"}
                  </button>
                )}
                <button
                  onClick={() => follow(selectedUser._id)}
                  className="ghost-btn mt-3 w-100"
                >
                  <i className="bi bi-plus-circle-fill"></i> Follow
                </button>
                {!isNewDm?.isNewDm ? <button className="ghost-btn mt-3 w-100" hidden> DM </button> :
                  <button onClick={openDm} className="ghost-btn mt-3 w-100" data-guest-lock="true"> DM</button>
                }
                {/* GALLERY */}
                <div className="cp-chat-info-section mt-2">
                  Gallery
                </div>
                <div className="cp-chat-info-media-grid">
                  {(selectedUser.gallery &&
                    selectedUser.gallery.length > 0) ? (
                    selectedUser.gallery.map((img, index) => (
                      <div
                        key={index}
                        className="cp-chat-info-media-box"
                      >
                        <img
                          src={img}
                          alt={`gallery-${index}`}
                        />
                      </div>
                    ))
                  ) : (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="cp-chat-info-media-box dummy"
                      >
                        <img src="http://apichatprox.mnbsoft.co.in/uploads/1778759586794-1000241082.jpg" />
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : selectedGroup ? (
              <>
                <div className="cp-chat-info-avatar">
                  {(selectedGroup?.name?.slice(0, 1)?.toUpperCase() || "G")}
                </div>
                <div className="cp-chat-info-name">
                  {selectedGroup?.name || "Untitled group"}
                </div>
                <div className="cp-chat-info-desc">
                  {selectedGroup?.description ||
                    `Members: ${Array.isArray(selectedGroup?.members)
                      ? selectedGroup.members.length
                      : "—"
                    }`}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* new dm modal */}
      {newDmModal && (
        <div
          className="cp-modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !newDmConfirmLoading) {
              setNewDmModal(null);
            }
          }}
        >
          <div className="cp-modal cp-modal--new-dm">
            <div className="cp-modal-header">
              <h3 className="cp-modal-title">New direct message</h3>
              <button
                type="button"
                disabled={newDmConfirmLoading}
                onClick={() => setNewDmModal(null)}
                className="cp-modal-close"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="cp-modal-grid">
              <p className="cp-new-dm-alert" role="alert">
                Starting a new chat with{" "}
                <strong>{newDmModal.user?.name || "this user"}</strong> costs{" "}
                <strong>{newDmModal.newDmCost} coins</strong>. This amount is
                deducted when you confirm. Your balance:{" "}
                <strong>
                  {Number(newDmModal.walletBalance || 0).toLocaleString()} 🪙
                </strong>
                .
              </p>
              {(Number(newDmModal.walletBalance) || 0) <
                (Number(newDmModal.newDmCost) || 0) ? (
                <p className="cp-new-dm-insufficient">
                  You do not have enough coins. Add coins in your wallet, then try
                  again.
                </p>
              ) : null}
              <div className="cp-modal-actions">
                <button
                  type="button"
                  disabled={newDmConfirmLoading}
                  onClick={() => setNewDmModal(null)}
                  className="cp-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    newDmConfirmLoading ||
                    (Number(newDmModal.walletBalance) || 0) <
                    (Number(newDmModal.newDmCost) || 0)
                  }
                  onClick={confirmNewDm}
                  className="cp-modal-create"
                >
                  {newDmConfirmLoading ? "Please wait…" : "Confirm & pay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {groupModalOpen && (
        <div className="cp-modal-overlay" role="dialog" aria-modal="true">
          <div className="cp-modal">
            <div className="cp-modal-header">
              <h3 className="cp-modal-title">Create Group</h3>
              <button
                onClick={() => setGroupModalOpen(false)}
                className="cp-modal-close"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="cp-modal-grid">
              <label className="cp-modal-label">
                Group name
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Friends"
                  className="cp-modal-input"
                />
              </label>
              <div>
                <div className="cp-modal-section-title">Select members</div>
                <div className="cp-modal-members-grid">
                  {users
                    .filter((u) => (myId ? u._id !== myId : true) && dmStarted[u._id] === true)
                    .map((u) => {
                      const isChecked = groupMemberIds.includes(u._id);
                      return (
                        <label
                          key={u._id}
                          className={`cp-modal-member-option${isChecked ? " checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setGroupMemberIds((prev) => {
                                if (checked) return [...prev, u._id];
                                return prev.filter((id) => id !== u._id);
                              });
                            }}
                            className="cp-modal-member-checkbox"
                          />
                          <span className="cp-modal-member-name">{u.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
              <div className="cp-modal-actions">
                <button
                  onClick={() => setGroupModalOpen(false)}
                  className="cp-modal-cancel"
                >
                  Cancel
                </button>
                <button onClick={createGroup} className="cp-modal-create">
                  Create & Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}