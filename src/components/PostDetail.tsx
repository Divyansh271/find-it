import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Tag,
  Palette,
  Share2,
  User as UserIcon,
  Camera,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Post } from '../types/post';
import { getPostById, getPostImageUrl } from '../services/postsService';
import { User } from '../types/auth';
import {
  createConversationRequest,
  getExistingRequestForPost,
  getPostActivity,
  acceptConversationRequest,
  declineConversationRequest,
  PostActivity
} from '../services/conversationsService';
import { Conversation } from '../types/conversation';

interface PostDetailProps {
  postId: string;
  currentUser: User | null;
  onBack: () => void;
  onRequireAuth: (targetUrl: string) => void;
  onNavigateToChat?: (convoId: string) => void;
  onNavigateToDashboard?: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  postId,
  currentUser,
  onBack,
  onRequireAuth,
  onNavigateToChat,
  onNavigateToDashboard,
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Post owner activity state
  const [postActivity, setPostActivity] = useState<PostActivity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [ownerNotice, setOwnerNotice] = useState<string | null>(null);

  // Other user request flow state
  const [existingRequest, setExistingRequest] = useState<Conversation | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestImageFile, setRequestImageFile] = useState<File | null>(null);
  const [requestImagePreview, setRequestImagePreview] = useState<string | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const fetchActivity = async () => {
    try {
      const act = await getPostActivity(postId);
      setPostActivity(act);
    } catch (err) {
      console.warn('Error fetching post activity:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPostAndRequest = async () => {
      setLoading(true);
      try {
        const found = await getPostById(postId);
        if (isMounted) {
          setPost(found);
        }

        if (currentUser && found) {
          const isOwner = currentUser.user_id === found.user_id;
          if (isOwner) {
            setLoadingActivity(true);
            const act = await getPostActivity(postId);
            if (isMounted) {
              setPostActivity(act);
              setLoadingActivity(false);
            }
          } else {
            const req = await getExistingRequestForPost(postId);
            if (isMounted) {
              setExistingRequest(req);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch post or request status', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPostAndRequest();
    return () => {
      isMounted = false;
    };
  }, [postId, currentUser]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRequestImageFile(file);
      setRequestImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setRequestImageFile(null);
    if (requestImagePreview) {
      URL.revokeObjectURL(requestImagePreview);
      setRequestImagePreview(null);
    }
  };

  const handleStartRequest = () => {
    if (!currentUser) {
      onRequireAuth(`/post/${postId}`);
      return;
    }
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth(`/post/${postId}`);
      return;
    }

    if (!requestText.trim() && !requestImageFile) {
      setRequestError('Please provide a message or attach a photo for your request.');
      return;
    }

    setSubmittingRequest(true);
    setRequestError(null);

    try {
      const newConvo = await createConversationRequest(
        postId,
        requestText.trim(),
        requestImageFile
      );
      setExistingRequest(newConvo);
      setRequestSuccess(true);
      setShowRequestForm(false);
    } catch (err: any) {
      console.error('Failed to submit request:', err);
      setRequestError(err?.message || 'Something went wrong submitting your request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Owner action: Accept a request on their post
  const handleOwnerAccept = async (convoId: string) => {
    setActionLoadingId(convoId);
    setOwnerNotice(null);
    try {
      await acceptConversationRequest(convoId);
      setOwnerNotice('Conversation request accepted! You can now chat in real time.');
      await fetchActivity();
    } catch (err: any) {
      console.error('Failed to accept request:', err);
      setOwnerNotice(`Error accepting request: ${err?.message || 'Try again'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Owner action: Decline a request on their post
  const handleOwnerDecline = async (convoId: string) => {
    if (!confirm('Are you sure you want to decline this request? The request will be removed.')) {
      return;
    }
    setActionLoadingId(convoId);
    setOwnerNotice(null);
    try {
      await declineConversationRequest(convoId);
      setOwnerNotice('Request declined.');
      await fetchActivity();
    } catch (err: any) {
      console.error('Failed to decline request:', err);
      setOwnerNotice(`Error: ${err?.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 text-center text-slate-400 text-xs">
        Loading post details...
      </div>
    );
  }

  // 404 / Invalid ID State
  if (!post) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-16 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Post Not Found</h2>
        <p className="text-xs text-slate-500">
          The post with ID <code>{postId}</code> does not exist or has already been resolved.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Feed</span>
        </button>
      </div>
    );
  }

  const isFoundPost = post.type === 'found';
  const isPostOwner = currentUser && currentUser.user_id === post.user_id;

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copied && (
            <span className="text-[11px] text-slate-500">Copied!</span>
          )}
        </div>
      </div>

      {/* Main Post Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header Badge & Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isFoundPost
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {isFoundPost ? 'Found Item Post' : 'Lost Item Report'}
            </span>
            {isPostOwner && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Your Post
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-400 ml-auto">
              {post.post_id}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            {post.title}
          </h1>
        </div>

        {/* Metadata grid */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Creator Display Name (No Email exposed) */}
          <div className="flex items-start gap-2 text-slate-700">
            <UserIcon className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-900">
                {isPostOwner ? 'Created By' : 'Reported By'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-medium text-slate-800">
                  {isPostOwner ? 'You' : post.creator?.display_name || 'Campus Student'}
                </span>
                {typeof post.creator?.trust_score === 'number' && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                    ★ {post.creator.trust_score}
                  </span>
                )}
              </div>
            </div>
          </div>

          {post.location_text && (
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">
                  {isFoundPost ? 'Found Location' : 'Suspected Lost Location'}
                </span>
                <span>{post.location_text}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-900">Reported Date</span>
              <span>
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Attached Photos */}
        {post.images && post.images.length > 0 && post.images.some(Boolean) && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Attached Photos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.images.filter(Boolean).map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={getPostImageUrl(img)}
                    alt={`${post.title} photo ${idx + 1}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h2>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 border border-slate-100 rounded-xl p-4">
            {post.desc_text}
          </p>
        </div>

        {/* Tags (Category & Colour) */}
        {(post.category || post.colour) && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Item Details
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {post.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 font-medium rounded-lg">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  Category: {post.category}
                </span>
              )}
              {post.colour && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 font-medium rounded-lg">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  Colour: {post.colour}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* POST OWNER ACTIVITY & INCOMING REQUESTS PANEL */}
        {/* ------------------------------------------------------------- */}
        {isPostOwner ? (
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Conversation Requests on this Post</span>
                  {postActivity && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {postActivity.totalRequests}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review students reaching out regarding your report. Accept a request to start a live chat.
                </p>
              </div>

              {postActivity && (postActivity.pendingCount > 0 || postActivity.acceptedCount > 0) && (
                <div className="flex items-center gap-2 text-[11px]">
                  {postActivity.pendingCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-full border border-amber-200">
                      {postActivity.pendingCount} Pending
                    </span>
                  )}
                  {postActivity.acceptedCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200">
                      {postActivity.acceptedCount} Active
                    </span>
                  )}
                </div>
              )}
            </div>

            {ownerNotice && (
              <div className="p-3 bg-slate-900 text-white text-xs rounded-xl flex items-center justify-between">
                <span>{ownerNotice}</span>
                <button
                  onClick={() => setOwnerNotice(null)}
                  className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {loadingActivity ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Checking for conversation requests...
              </div>
            ) : !postActivity || postActivity.totalRequests === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <MessageSquare className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  No conversation requests received yet
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  When a student finds your item or claims it, their request, message, and attached photo will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {postActivity.conversations.map((req) => (
                  <div
                    key={req.convo_id}
                    className={`p-4 rounded-xl border transition-all ${
                      req.accepted
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 shadow-2xs'
                    } space-y-3`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {req.requester_profile?.display_name || 'Campus Student'}
                        </span>
                        {typeof req.requester_profile?.trust_score === 'number' && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            ★ {req.requester_profile.trust_score}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            req.accepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.accepted ? 'Chat Active' : 'Pending Request'}
                        </span>
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

                    {req.request_text && (
                      <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-lg border border-slate-100 italic leading-relaxed">
                        "{req.request_text}"
                      </p>
                    )}

                    {req.request_img && (
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Attached Proof Photo
                        </span>
                        <img
                          src={getPostImageUrl(req.request_img)}
                          alt="Proof from student"
                          className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      {req.accepted ? (
                        onNavigateToChat && (
                          <button
                            onClick={() => onNavigateToChat(req.convo_id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open Live Chat</span>
                          </button>
                        )
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === req.convo_id}
                            onClick={() => handleOwnerDecline(req.convo_id)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === req.convo_id}
                            onClick={() => handleOwnerAccept(req.convo_id)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {actionLoadingId === req.convo_id ? 'Accepting...' : 'Accept & Start Chat'}
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* OTHER USER CONVERSATION REQUEST FLOW */
          /* ------------------------------------------------------------- */
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {existingRequest ? (
              existingRequest.accepted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="inline-flex items-center gap-1.5 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Conversation Accepted</span>
                    </div>
                    <p className="text-emerald-700 text-[11px] mt-0.5">
                      Your request was approved. You can now coordinate safe handoff in the chat.
                    </p>
                  </div>
                  {onNavigateToChat && (
                    <button
                      onClick={() => onNavigateToChat(existingRequest.convo_id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      <span>Open Live Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Conversation Request Pending</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      You have requested a conversation. Waiting for{' '}
                      <strong>{post.creator?.display_name || 'the creator'}</strong> to review and accept.
                    </p>
                    {existingRequest.request_text && (
                      <p className="text-[11px] italic text-amber-800/80 mt-1 bg-amber-100/50 p-2 rounded-lg">
                        "{existingRequest.request_text}"
                      </p>
                    )}
                  </div>
                </div>
              )
            ) : showRequestForm ? (
              <form onSubmit={handleSubmitRequest} className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isFoundPost ? 'Claim This Found Item' : 'I Found This Missing Item'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send a message to <strong>{post.creator?.display_name || 'the student'}</strong> with identifying details or attach a photo before chat is enabled.
                  </p>
                </div>

                {requestError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{requestError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message / Identifying Details
                  </label>
                  <textarea
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder={
                      isFoundPost
                        ? 'Describe unique markings, serial numbers, or contents to prove ownership...'
                        : 'Let them know where you found it or where they can meet you on campus...'
                    }
                    rows={3}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attach Photo (Optional proof)
                  </label>
                  {requestImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={requestImagePreview}
                        alt="Request preview"
                        className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {submittingRequest ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {isFoundPost
                    ? 'Is this your missing item?'
                    : "Did you find this student's item?"}
                </div>

                <button
                  onClick={handleStartRequest}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request conversation</span>
                </button>
              </div>
            )}

            {requestSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Request Sent Successfully</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    The creator has received your conversation request and can review your message.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
