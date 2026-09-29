import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { User } from '../types/auth';
import { Post } from '../types/post';
import { getUserPosts } from '../services/postsService';
import { supabase } from '../services/supabaseClient';

interface ProfilePageProps {
  currentUser: User;
  onNavigateToPost: (postId: string) => void;
  onNavigateToDashboard: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onNavigateToPost,
  onNavigateToDashboard,
}) => {
  const [profile, setProfile] = useState<{
    display_name: string;
    trust_score: number;
    created_at?: string;
  }>({
    display_name: currentUser.display_name,
    trust_score: currentUser.trust_score || 0,
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser.display_name);
  const [savingName, setSavingName] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfileAndPosts = async () => {
      setLoading(true);
      try {
        // Fetch fresh profile from profiles table
        const { data: prof } = await supabase
          .from('profiles')
          .select('display_name, trust_score, created_at')
          .eq('user_id', currentUser.user_id)
          .maybeSingle();

        if (prof && isMounted) {
          setProfile({
            display_name: prof.display_name,
            trust_score: prof.trust_score ?? 0,
            created_at: prof.created_at,
          });
          setNewName(prof.display_name);
        }

        const userPosts = await getUserPosts(currentUser.user_id);
        if (isMounted) {
          setPosts(userPosts);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileAndPosts();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim().length < 2 || newName.trim().length > 50) {
      setStatusMsg('Display name must be between 2 and 50 characters.');
      return;
    }

    setSavingName(true);
    setStatusMsg(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: newName.trim() })
        .eq('user_id', currentUser.user_id);

      if (error) {
        throw error;
      }

      setProfile((prev) => ({ ...prev, display_name: newName.trim() }));
      setEditingName(false);
      setStatusMsg('Display name updated successfully.');
    } catch (err: any) {
      console.error('Error updating profile display name:', err);
      setStatusMsg(`Could not update name: ${err?.message}`);
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-bold text-2xl flex items-center justify-center shadow-xs shrink-0">
              {profile.display_name.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {editingName ? (
                  <form onSubmit={handleSaveDisplayName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={savingName}
                      className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      {savingName ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(false);
                        setNewName(profile.display_name);
                      }}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h1 className="text-xl font-bold text-slate-900">
                      {profile.display_name}
                    </h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit display name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Student Identity
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Member of university campus community
              </p>
            </div>
          </div>

          {/* Reputation / Trust Score Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <span className="text-xs font-medium text-slate-500">
              Campus Trust Score
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {profile.trust_score}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Increments on confirmed item return
            </span>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Trust & Reputation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold">
            <Award className="w-4 h-4" />
            <span>Successful Returns</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">
            {profile.trust_score}
          </p>
          <p className="text-slate-500 text-[11px]">
            Items verified as safely returned to owner
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <Layers className="w-4 h-4" />
            <span>Active Campus Posts</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">
            {posts.length}
          </p>
          <p className="text-slate-500 text-[11px]">
            Reports created to help fellow students
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Campus Standing</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">
            {profile.trust_score >= 3 ? 'Trusted Hero' : profile.trust_score >= 1 ? 'Good Samaritan' : 'New Member'}
          </p>
          <p className="text-slate-500 text-[11px]">
            Community recognition score
          </p>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Your Campus Reports
          </h2>
          <button
            onClick={onNavigateToDashboard}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer inline-flex items-center gap-1"
          >
            <span>Manage in Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {posts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            You have not created any reports yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {posts.map((post) => (
              <div
                key={post.post_id}
                onClick={() => onNavigateToPost(post.post_id)}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full uppercase ${
                      post.type === 'found'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {post.type}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {post.desc_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
