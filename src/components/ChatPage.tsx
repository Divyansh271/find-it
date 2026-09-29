import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User as UserIcon,
  ShieldCheck,
  Award,
  Trash2,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { User } from '../types/auth';
import { Conversation, Message } from '../types/conversation';
import {
  getConversationById,
  endConversation,
  resolveConversation
} from '../services/conversationsService';
import {
  getMessages,
  sendMessage,
  subscribeToMessages
} from '../services/messagesService';
import { getPostImageUrl } from '../services/storageService';

interface ChatPageProps {
  convoId: string;
  currentUser: User;
  onBack: () => void;
  onNavigateToPost: (postId: string) => void;
  onNavigateToDashboard: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  convoId,
  currentUser,
  onBack,
  onNavigateToPost,
  onNavigateToDashboard,
}) => {
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('CONNECTING');

  // Resolution modals / states
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolvedSuccess, setResolvedSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initial Load & Realtime Subscription
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step A: Load conversation
        const c = await getConversationById(convoId);
        if (!isMounted) return;

        if (!c) {
          setError('Conversation not found or you are not a participant.');
          setLoading(false);
          return;
        }

        if (!c.accepted) {
          setError('This conversation has not been accepted yet.');
          setLoading(false);
          return;
        }

        setConvo(c);

        // Step B: Load existing messages chronologically
        const history = await getMessages(convoId);
        if (!isMounted) return;
        setMessages(history);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load chat data:', err);
        setError(err?.message || 'Error loading conversation.');
        setLoading(false);
      }
    };

    loadData();

    // Step C: Establish Realtime subscription for Postgres Changes
    const unsubscribe = subscribeToMessages(
      convoId,
      (newMsg) => {
        if (!isMounted) return;
        setMessages((prev) => {
          // Deduplicate by message id
          if (prev.some((m) => m.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      },
      (status) => {
        if (!isMounted) return;
        setRealtimeStatus(status);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [convoId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageFile) return;

    setSending(true);
    setError(null);

    const textToSend = inputText;
    const fileToSend = imageFile;

    // Clear input optimistically
    setInputText('');
    handleClearImage();

    try {
      const sent = await sendMessage(convoId, textToSend, fileToSend);
      // Append if realtime hasn't already delivered it
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err?.message || 'Failed to send message. Please try again.');
      setInputText(textToSend); // Restore on error
    } finally {
      setSending(false);
    }
  };

  // Owner Operation: End Chat (Not resolved)
  const handleEndChat = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await endConversation(convoId);
      onNavigateToDashboard();
    } catch (err: any) {
      console.error('Failed to end conversation:', err);
      setError(err?.message || 'Failed to end conversation.');
      setActionLoading(false);
      setShowEndConfirm(false);
    }
  };

  // Owner Operation: Resolve & Returned (Atomic function: trust score +1 & post deleted)
  const handleResolveHandover = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await resolveConversation(convoId);
      setResolvedSuccess(true);
      setShowResolveConfirm(false);
    } catch (err: any) {
      console.error('Failed to resolve conversation:', err);
      setError(err?.message || 'Failed to resolve handover.');
      setActionLoading(false);
      setShowResolveConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-16 text-center text-slate-400 text-xs">
        Connecting to secure chat room...
      </div>
    );
  }

  if (error && !convo) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Chat Unavailable</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (resolvedSuccess) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Item Successfully Returned!</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The finder has received <strong>+1 Trust Score</strong> on their campus profile. The post and chat room have been safely resolved and closed.
        </p>
        <button
          onClick={onNavigateToDashboard}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!convo) return null;

  const isOwner = currentUser.user_id === convo.owner_id;
  const isFinder = currentUser.user_id === convo.finder_id;

  // The other user's profile
  const otherDisplayName = isOwner
    ? convo.finder_profile?.display_name || 'Student Finder'
    : convo.owner_profile?.display_name || 'Student Owner';

  const otherTrustScore = isOwner
    ? convo.finder_profile?.trust_score
    : convo.owner_profile?.trust_score;

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-80px)]">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {otherDisplayName}
              </h2>
              {typeof otherTrustScore === 'number' && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  ★ {otherTrustScore}
                </span>
              )}
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {isOwner ? 'Finder' : 'Item Owner'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>Item: <strong>{convo.post?.title || 'Campus Post'}</strong></span>
              {convo.post?.location_text && (
                <span className="hidden sm:inline text-slate-400">• {convo.post.location_text}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls for Owner */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEndConfirm(true)}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="End conversation without resolving"
            >
              End Chat
            </button>
            <button
              onClick={() => setShowResolveConfirm(true)}
              className="px-3 py-1.5 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Item Returned</span>
              <span className="sm:hidden">Returned</span>
            </button>
          </div>
        )}
      </div>

      {/* Owner Confirmation Modal: Resolve Handover */}
      {showResolveConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Item Returned?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Confirming return will atomically:
                <br />1. Grant <strong>+1 Trust Score</strong> to {otherDisplayName}.
                <br />2. Safely resolve and delete this post.
                <br />3. Close this chat room.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowResolveConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleResolveHandover}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Processing...' : 'Confirm Return (+1 Trust)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Confirmation Modal: End Chat (Not resolved) */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                End Conversation?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                If this item was not returned, closing this conversation will remove the chat room. Your original post will remain active on the feed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowEndConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleEndChat}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Closing...' : 'End Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs overflow-y-auto space-y-4 flex flex-col">
        {/* Request Details Banner (Origin of chat) */}
        {convo.request_text && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 self-center max-w-md w-full">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Initial Request Message
            </span>
            <p className="text-slate-700 italic">
              "{convo.request_text}"
            </p>
            {convo.request_img && (
              <div className="pt-1.5">
                <img
                  src={getPostImageUrl(convo.request_img)}
                  alt="Request attachment"
                  className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <p className="text-xs font-medium text-slate-700">
              Conversation Accepted & Encrypted
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Coordinate a safe public place on campus to return the item (e.g. Campus Library or Union desk).
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.user_id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-2xs space-y-1.5 ${
                    isMe
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Sender Name if received */}
                  {!isMe && (
                    <div className="text-[10px] font-bold text-indigo-600">
                      {msg.sender_profile?.display_name || otherDisplayName}
                    </div>
                  )}

                  {/* Attached Message Image */}
                  {msg.msg_img && (
                    <div className="rounded-lg overflow-hidden border border-white/10 my-1">
                      <img
                        src={getPostImageUrl(msg.msg_img)}
                        alt="Chat attachment"
                        className="w-full max-h-60 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Text */}
                  {msg.msg_text && (
                    <p className="leading-relaxed whitespace-pre-line">
                      {msg.msg_text}
                    </p>
                  )}

                  <div
                    className={`text-[9px] font-mono text-right ${
                      isMe ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="mt-3 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs space-y-2 shrink-0">
        {imagePreview && (
          <div className="flex items-center gap-2 px-2 pt-1">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Selected preview"
                className="w-14 h-14 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs"
              >
                ×
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {imageFile?.name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Photo attach button */}
          <label className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0">
            <Camera className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={sending || (!inputText.trim() && !imageFile)}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
