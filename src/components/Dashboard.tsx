import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  X,
  User as UserIcon,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Tag,
  Palette,
  MapPin,
  Calendar,
  Layers,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FolderKanban
} from 'lucide-react';
import { User } from '../types/auth';
import { Conversation } from '../types/conversation';
import { Post } from '../types/post';
import {
  getIncomingRequests,
  getOutgoingRequests,
  getActiveConversations,
  acceptConversationRequest,
  declineConversationRequest,
  getPostsActivitiesBatch,
  PostActivity
} from '../services/conversationsService';
import { getUserPosts, deletePost } from '../services/postsService';
import { getPostImageUrl } from '../services/storageService';

interface DashboardProps {
  currentUser: User;
  initialTab?: 'incoming' | 'active' | 'outgoing' | 'my-posts';
  onNavigateToChat: (convoId: string) => void;
  onNavigateToPost: (postId: string) => void;
  onCreatePost: (type: 'lost' | 'found') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  initialTab = 'incoming',
  onNavigateToChat,
  onNavigateToPost,
  onCreatePost,
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'active' | 'outgoing' | 'my-posts'>(initialTab);

  const [incomingRequests, setIncomingRequests] = useState<Conversation[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Conversation[]>([]);
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postActivities, setPostActivities] = useState<Record<string, PostActivity>>({});

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inc, out, active, posts] = await Promise.all([
        getIncomingRequests(),
        getOutgoingRequests(),
        getActiveConversations(),
        getUserPosts(currentUser.user_id),
      ]);
      setIncomingRequests(inc);
      setOutgoingRequests(out);
      setActiveConversations(active);
      setMyPosts(posts);

      // Batch load real conversation activity counts for each post
      const postIds = posts.map((p) => p.post_id);
      if (postIds.length > 0) {
        const activities = await getPostsActivitiesBatch(postIds);
        setPostActivities(activities);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [currentUser]);

  const handleAccept = async (convoId: string) => {
    setActionLoadingId(convoId);
    setNotice(null);
    try {
      await acceptConversationRequest(convoId);
      setNotice('Request accepted! The live chat room is now active.');
      await loadAll();
    } catch (err: any) {
      console.error('Failed to accept request:', err);
      setNotice(`Error accepting request: ${err?.message || 'Try again'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (convoId: string) => {
    if (!confirm('Are you sure you want to decline this request? The request will be removed.')) {
      return;
    }
    setActionLoadingId(convoId);
    setNotice(null);
    try {
      await declineConversationRequest(convoId);
      setNotice('Request declined.');
      await loadAll();
    } catch (err: any) {
      console.error('Failed to decline request:', err);
      setNotice(`Error: ${err?.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      setMyPosts((prev) => prev.filter((p) => p.post_id !== postId));
      setNotice('Post removed successfully.');
    } catch (err: any) {
      alert(`Could not delete post: ${err?.message}`);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading requests and conversations...
        </div>
      );
    }

    /* ------------------------------------------------------------- */
    /* TAB 1: INCOMING REQUESTS (Requests I Received)                */
    /* ------------------------------------------------------------- */
    if (activeTab === 'incoming') {
      if (incomingRequests.length === 0) {
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Pending Incoming Requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When another student reaches out regarding an item you posted, their request with identifying message and photo will appear here.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {incomingRequests.map((req) => (
            <div
              key={req.convo_id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Request on your {req.post?.type === 'lost' ? 'Lost Report' : 'Found Post'}
                  </span>
                  <h3
                    onClick={() => req.post && onNavigateToPost(req.post.post_id)}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    {req.post?.title || 'Campus Post'}
                  </h3>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(req.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Requester Info */}
              <div className="flex items-center gap-2 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-800">
                  {req.requester_profile?.display_name || 'Campus Student'}
                </span>
                {typeof req.requester_profile?.trust_score === 'number' && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    ★ {req.requester_profile.trust_score}
                  </span>
                )}
              </div>

              {/* Message & Image preview */}
              {req.request_text && (
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{req.request_text}"
                </p>
              )}

              {req.request_img && (
                <div>
                  <img
                    src={getPostImageUrl(req.request_img)}
                    alt="Attachment from requester"
                    className="w-28 h-28 object-cover rounded-xl border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Actions: Accept or Decline */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleDecline(req.convo_id)}
                  disabled={actionLoadingId === req.convo_id}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAccept(req.convo_id)}
                  disabled={actionLoadingId === req.convo_id}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{actionLoadingId === req.convo_id ? 'Accepting...' : 'Accept & Start Chat'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    /* ------------------------------------------------------------- */
    /* TAB 2: ACTIVE CHATS (Accepted Conversations)                  */
    /* ------------------------------------------------------------- */
    if (activeTab === 'active') {
      if (activeConversations.length === 0) {
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Active Chat Rooms</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once a conversation request is accepted, your chat room will appear here so you can coordinate recovery.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {activeConversations.map((c) => {
            const isOwner = currentUser.user_id === c.owner_id;
            const otherName = isOwner
              ? c.finder_profile?.display_name || 'Student Finder'
              : c.owner_profile?.display_name || 'Student Owner';

            const otherTrust = isOwner
              ? c.finder_profile?.trust_score
              : c.owner_profile?.trust_score;

            return (
              <div
                key={c.convo_id}
                onClick={() => onNavigateToChat(c.convo_id)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {otherName}
                    </span>
                    {typeof otherTrust === 'number' && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ★ {otherTrust}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      {isOwner ? 'Finder' : 'Item Owner'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    Item: <strong>{c.post?.title || 'Campus Report'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                  <span>Open Live Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    /* ------------------------------------------------------------- */
    /* TAB 3: OUTGOING REQUESTS (Requests I Sent)                    */
    /* ------------------------------------------------------------- */
    if (activeTab === 'outgoing') {
      if (outgoingRequests.length === 0) {
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Outgoing Requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you submit a conversation request on another student's post, you can track its acceptance status here.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {outgoingRequests.map((req) => (
            <div
              key={req.convo_id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h3
                  onClick={() => req.post && onNavigateToPost(req.post.post_id)}
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                >
                  {req.post?.title || 'Campus Post'}
                </h3>
                {req.request_text && (
                  <p className="text-xs text-slate-600 italic mt-0.5">
                    "{req.request_text}"
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {req.accepted ? (
                  <button
                    onClick={() => onNavigateToChat(req.convo_id)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Waiting for response</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    /* ------------------------------------------------------------- */
    /* TAB 4: MY POSTS (Posts Created By Me + Real Activity Summary) */
    /* ------------------------------------------------------------- */
    if (myPosts.length === 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">You haven't posted any items yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a Lost report or Found post to help recover items across campus.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={() => onCreatePost('lost')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
            >
              + Lost Report
            </button>
            <button
              onClick={() => onCreatePost('found')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
            >
              + Found Item
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {myPosts.map((post) => {
          const act = postActivities[post.post_id] || {
            totalRequests: 0,
            pendingCount: 0,
            acceptedCount: 0,
            conversations: [],
          };

          return (
            <div
              key={post.post_id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs space-y-3 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header type badge & date */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      post.type === 'found'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {post.type === 'found' ? 'Found Post' : 'Lost Report'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Optional Image Thumbnail */}
                {post.images && post.images.length > 0 && post.images[0] && (
                  <div className="mb-2 rounded-lg overflow-hidden bg-slate-100 max-h-32">
                    <img
                      src={getPostImageUrl(post.images[0])}
                      alt={post.title}
                      className="w-full h-28 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {post.desc_text}
                </p>

                {/* REAL POST ACTIVITY SUMMARY (No hardcoded counts, derived from conversations) */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {act.totalRequests === 0 ? (
                    <span className="text-slate-400 font-medium">
                      0 conversation requests
                    </span>
                  ) : (
                    <>
                      {act.pendingCount > 0 && (
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                          {act.pendingCount} pending {act.pendingCount === 1 ? 'request' : 'requests'}
                        </span>
                      )}
                      {act.acceptedCount > 0 && (
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                          {act.acceptedCount} active {act.acceptedCount === 1 ? 'chat' : 'chats'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => onNavigateToPost(post.post_id)}
                  className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View Post & Requests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePost(post.post_id)}
                  className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage your posts, incoming interaction requests, and live chat rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCreatePost('lost')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
          >
            + Lost Post
          </button>
          <button
            onClick={() => onCreatePost('found')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
          >
            + Found Post
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-slate-900 text-white text-xs rounded-xl flex items-center justify-between shadow-xs">
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer ml-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {/* Tab 1: Incoming Requests */}
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'incoming'
              ? 'bg-white border-t border-x border-slate-200 text-slate-900 -mb-[1px]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Incoming Requests</span>
          {incomingRequests.length > 0 && (
            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {incomingRequests.length}
            </span>
          )}
        </button>

        {/* Tab 2: My Posts */}
        <button
          onClick={() => setActiveTab('my-posts')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'my-posts'
              ? 'bg-white border-t border-x border-slate-200 text-slate-900 -mb-[1px]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>My Posts</span>
          <span className="text-[10px] text-slate-400 font-mono">({myPosts.length})</span>
        </button>

        {/* Tab 3: Active Chats */}
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'active'
              ? 'bg-white border-t border-x border-slate-200 text-slate-900 -mb-[1px]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Active Chats</span>
          {activeConversations.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeConversations.length}
            </span>
          )}
        </button>

        {/* Tab 4: Outgoing Requests */}
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'outgoing'
              ? 'bg-white border-t border-x border-slate-200 text-slate-900 -mb-[1px]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>My Requests Sent</span>
          {outgoingRequests.length > 0 && (
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {outgoingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {renderTabContent()}
    </div>
  );
};
