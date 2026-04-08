import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { messagesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './MessagesPage.css';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]           = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [draft, setDraft]                 = useState('');
  const [sending, setSending]             = useState(false);
  const [loading, setLoading]             = useState(true);
  const [msgLoading, setMsgLoading]       = useState(false);

  // Load conversations list
  useEffect(() => {
    messagesAPI.getConversations()
      .then(({ data }) => setConversations(data.data))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  // Load messages when conversation selected
  const loadMessages = useCallback(async (convId) => {
    setMsgLoading(true);
    try {
      const { data } = await messagesAPI.getMessages(convId);
      setMessages(data.data);
      // Sync the active conversation's book data from the server response
      if (data.conversation?.book) {
        setActiveConv(prev => ({ ...prev, book: data.conversation.book }));
      }
    } catch { toast.error('Failed to load messages'); }
    finally { setMsgLoading(false); }
  }, []);

  useEffect(() => {
    if (!conversations.length) return;
    const target = conversationId
      ? conversations.find(c => c._id === conversationId)
      : conversations[0];
    if (target) {
      setActiveConv(target);
      loadMessages(target._id);
      if (!conversationId) navigate(`/messages/${target._id}`, { replace: true });
    }
  }, [conversations, conversationId, loadMessages, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConv = (conv) => {
    setActiveConv(conv);
    loadMessages(conv._id);
    navigate(`/messages/${conv._id}`);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConv) return;
    setSending(true);
    try {
      const recipient = activeConv.participants.find(p => p._id !== user._id);
      const { data } = await messagesAPI.send({ recipientId: recipient._id, content: draft.trim() });
      setMessages(m => [...m, data.data]);
      setDraft('');
      // Update conversation list preview
      setConversations(cs => cs.map(c =>
        c._id === activeConv._id ? { ...c, lastMessage: draft.trim(), lastMessageAt: new Date() } : c
      ));
    } catch (err) { toast.error(err.response?.data?.message || 'Send failed'); }
    finally { setSending(false); }
  };

  const deleteConv = async (convId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await messagesAPI.deleteConversation(convId);
      setConversations(c => c.filter(x => x._id !== convId));
      if (activeConv?._id === convId) {
        setActiveConv(null);
        setMessages([]);
        navigate('/messages');
      }
      toast.success('Conversation deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const getOtherUser = (conv) => conv.participants?.find(p => p._id !== user._id);
  const getAvatarLetter = (name) => name?.[0]?.toUpperCase() || '?';

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="messages-page">
      {/* ── Sidebar ── */}
      <aside className="msg-sidebar">
        <div className="msg-sidebar-header">
          <h2>Messages</h2>
          <span className="msg-count">{conversations.length}</span>
        </div>

        {conversations.length === 0 ? (
          <div className="msg-empty-sidebar">
            <span>💬</span>
            <p>No conversations yet.</p>
            <Link to="/books" className="btn btn-primary btn-sm">Browse Books</Link>
          </div>
        ) : (
          <div className="conv-list">
            {conversations.map(conv => {
              const other = getOtherUser(conv);
              const avatarUrl = other?.avatar ? `http://localhost:5000${other.avatar}` : null;
              const isActive = activeConv?._id === conv._id;
              return (
                <div key={conv._id} className={`conv-item${isActive ? ' active' : ''}`} onClick={() => selectConv(conv)}>
                  <div className="conv-avatar">
                    {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{getAvatarLetter(other?.name)}</span>}
                    <div className="conv-avatar-dot" />
                  </div>
                  <div className="conv-info">
                    <div className="conv-header-row">
                      <span className="conv-name">{other?.name || 'Unknown'}</span>
                      <span className="conv-time">
                        {conv.lastMessageAt && new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month:'short', day:'numeric' })}
                      </span>
                    </div>
                    <p className="conv-preview">
                      {conv.book?.title && <span className="conv-book-tag">📚 {conv.book.title} · </span>}
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  <button className="conv-delete-btn" onClick={(e) => deleteConv(conv._id, e)} title="Delete">✕</button>
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* ── Chat Panel ── */}
      <main className="msg-panel">
        {!activeConv ? (
          <div className="msg-no-conv">
            <div className="msg-no-conv-inner">
              <span className="msg-no-conv-icon">💬</span>
              <h3>Select a conversation</h3>
              <p>Choose from the list on the left to read your messages</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-user">
                {(() => {
                  const other = getOtherUser(activeConv);
                  const avatarUrl = other?.avatar ? `http://localhost:5000${other.avatar}` : null;
                  return (
                    <>
                      <div className="chat-avatar">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{getAvatarLetter(other?.name)}</span>}
                      </div>
                      <div>
                        <p className="chat-user-name">
                          <Link to={`/sellers/${other?._id}`}>{other?.name || 'Unknown'}</Link>
                        </p>
                        {activeConv.book && (
                          <p className="chat-book-ref">
                            Re: <Link to={`/books/${activeConv.book._id}`}>{activeConv.book.title}</Link>
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              {/* Book being discussed - shown prominently for both parties */}
              {activeConv.book && (
                <Link to={`/books/${activeConv.book._id}`} className="chat-header-card">
                  <div className="chat-book-img">
                    {activeConv.book.image 
                      ? <img src={`http://localhost:5000${activeConv.book.image}`} alt={activeConv.book.title} /> 
                      : <span>📖</span>}
                  </div>
                  <div className="chat-book-details">
                    <span className="chat-book-label">Discussing</span>
                    <span className="chat-book-title">{activeConv.book.title}</span>
                    {activeConv.book.price !== null && (
                      <span className="chat-book-price">${activeConv.book.price.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="chat-book-arrow">→</span>
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {msgLoading ? (
                <div className="spinner-overlay"><div className="spinner" /></div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  <span>👋</span>
                  <p>Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                  const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[i-1]?.createdAt).toDateString();
                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <div className="chat-date-divider">
                          <span>{new Date(msg.createdAt).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' })}</span>
                        </div>
                      )}
                      <div className={`msg-bubble-wrap${isMine ? ' mine' : ''}`}>
                        {!isMine && (
                          <div className="msg-sender-avatar">
                            {msg.sender?.avatar
                              ? <img src={`http://localhost:5000${msg.sender.avatar}`} alt="" />
                              : <span>{getAvatarLetter(msg.sender?.name)}</span>}
                          </div>
                        )}
                        <div className="msg-bubble">
                          <p>{msg.content}</p>
                          <span className="msg-time">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <form className="chat-compose" onSubmit={sendMessage}>
              <textarea
                className="chat-input"
                placeholder="Type a message…"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                rows={1}
                disabled={sending}
              />
              <button type="submit" className="btn btn-primary chat-send-btn" disabled={!draft.trim() || sending}>
                {sending ? '…' : '→'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}