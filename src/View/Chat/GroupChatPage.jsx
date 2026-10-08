import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import EmojiPicker from 'emoji-picker-react';
import { toast } from "react-toastify";
import { renderGroupMessagesWithDates } from "./Componets/chatModules";
import StickersBar from "./Componets/StickersBar";
import { API_BASE, getApiOrigin } from "../../config/api";
import { setActiveChatGroup } from "../../utils/chatNotifications";

const API_BASE_URL = API_BASE;

export default function GroupChatPage({ group, groupId, myId, onBack, onOpenInfo }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchGroupMessages = useCallback(async () => {
    if (!groupId || !myId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/chat/group-messages/${groupId}`
      );
      setMessages(res.data?.messages || res.data || []);
    } catch (err) {
      console.error("Failed to fetch group messages", err);
      setMessages([]);
    }
  }, [groupId, myId]);

  useEffect(() => {
    fetchGroupMessages();
  }, [fetchGroupMessages]);

  useEffect(() => {
    setActiveChatGroup(groupId || "");
    return () => setActiveChatGroup("");
  }, [groupId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendGroupMessage = async () => {
    if (!text.trim()) return;
    if (!groupId || !myId) return;
    try {
      await axios.post(`${API_BASE_URL}/chat/send-message`, {
        senderId: myId,
        groupId,
        message: text,
        type: "text",
      });

      setText("");
      fetchGroupMessages();
    } catch (err) {
      toast(err.response?.data?.message || "Error sending group message");
    }
  };

  const sendStickerToGroup = async (sticker) => {
    if (!sticker || !groupId || !myId) return;
    try {
      await axios.post(`${API_BASE_URL}/chat/send-message`, {
        senderId: myId,
        groupId,
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
      fetchGroupMessages();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to send sticker");
    }
  };

  return (
    <>
      {/* WhatsApp like header with group name */}
      <div
        className="cp-groupchat-header"
      >
        {typeof onBack === "function" && (
          <button
            type="button"
            className="cp-chat-back cp-chat-back--group"
            aria-label="Back"
            onClick={onBack}
          >
            <i class="bi bi-chevron-left"></i>
          </button>
        )}
        <button
          type="button"
          className="cp-groupchat-header-hit"
          onClick={() => {
            if (typeof onOpenInfo === "function") onOpenInfo();
          }}
        >
          <div className="cp-groupchat-avatar-wrap">
          <div
            className="cp-groupchat-avatar"
          >
            {(group?.name?.[0] || "G").toUpperCase()}
          </div>
          </div>
          <div>
          <div
            className="cp-groupchat-title"
          >
            {group?.name || "Group chat"}
          </div>
          <div
            className="cp-groupchat-subtitle"
          >
            {Array.isArray(group?.members) ? `Members: ${group.members.length}` : "Group chat"}
          </div>
          </div>
        </button>
      </div>

      {/* Messages */}
      <div
        className="cp-groupchat-messages"
      >
        {messages.length === 0 ? (
          <div
            className="cp-groupchat-empty"
          >
            No messages yet in this group.
          </div>
        ) : (
          <>
            {renderGroupMessagesWithDates({
              msgs: messages,
              myId,
              assetBaseUrl: getApiOrigin(API_BASE_URL),
            })}
            {/* dummy for scrollbottom */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <StickersBar apiBaseUrl={API_BASE_URL} onSelectSticker={sendStickerToGroup} />

      {/* Input */}
      <div
        className="cp-groupchat-input-row"
      >
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
               <button
                type="button"
                aria-label="Emoji"
                className="cp-emoji-btn"
                onClick={() => setShowEmojiPicker((v) => !v)}
              >
                {/* Emoji Icon */}
                <span role="img" aria-label="emoji">😊</span>
              </button>
              
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="cp-groupchat-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendGroupMessage();
          }}
        />
                      
        <button
          onClick={sendGroupMessage}
          className="cp-groupchat-send"
        >
        <i class="bi bi-send-fill"></i>
        </button>
      </div>
    </>
  );
}
