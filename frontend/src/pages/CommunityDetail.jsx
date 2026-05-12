import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CreatePostWidget from '../components/CreatePostWidget';
import PostCard from '../components/PostCard';
import { communityService } from '../api/communityService';
import { postService } from '../api/postService';

function CommunityDetail() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [postsError, setPostsError] = useState('');

  useEffect(() => {
    loadCommunity();
    loadPosts(0, false);
  }, [id]);

  async function loadCommunity() {
    setLoading(true);
    setError('');

    try {
      const response = await communityService.getById(id);
      setCommunity(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Community could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts(nextPage = 0, append = false) {
    append ? setLoadingMorePosts(true) : setLoadingPosts(true);
    setPostsError('');

    try {
      const response = await postService.getCommunityPosts(id, {
        page: nextPage,
        size: 10,
      });

      setPosts((current) => append ? [...current, ...response.content] : response.content);
      setPostsPage(response);
    } catch (err) {
      setPostsError(err.response?.data?.message || 'Community posts could not be loaded.');
    } finally {
      setLoadingPosts(false);
      setLoadingMorePosts(false);
    }
  }

  async function handleJoin() {
    setBusy(true);
    setError('');

    try {
      setCommunity(await communityService.join(id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join community.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    setBusy(true);
    setError('');

    try {
      setCommunity(await communityService.leave(id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not leave community.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-16">Loading community...</div>;
  }

  if (!community) {
    return (
      <section className="space-y-4">
        <Link to="/communities" className="text-sm font-bold text-blue-400 hover:text-blue-300">
          &larr; Back to communities
        </Link>
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-4">
          {error || 'Community not found.'}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <Link to="/communities" className="text-sm font-bold text-blue-400 hover:text-blue-300">
        &larr; Back to communities
      </Link>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      <article className="bg-gray-800/70 border border-gray-700/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{community.name}</h1>
              <p className="text-gray-400 mt-3 whitespace-pre-wrap break-words">
                {community.description || 'No description yet.'}
              </p>
            </div>

            {community.joinedByCurrentUser ? (
              <button
                type="button"
                onClick={handleLeave}
                disabled={busy || community.currentUserRole === 'FOUNDER'}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 disabled:opacity-50 text-sm font-bold transition-all"
              >
                {community.currentUserRole === 'FOUNDER' ? 'Founder' : busy ? 'Leaving...' : 'Leave'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
              >
                {busy ? 'Joining...' : 'Join'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-gray-900/60 border border-gray-700/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Members</p>
              <p className="text-2xl font-black text-white mt-1">{community.memberCount}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Your Role</p>
              <p className="text-2xl font-black text-white mt-1">
                {community.currentUserRole || 'Guest'}
              </p>
            </div>
          </div>
        </div>
      </article>

      <CreatePostWidget
        communityId={id}
        disabled={!community.joinedByCurrentUser}
        onPostCreated={() => loadPosts(0, false)}
      />

      {postsError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-4">
          {postsError}
        </div>
      )}

      {loadingPosts ? (
        <div className="text-gray-400 text-center py-10">Loading community posts...</div>
      ) : (
        <>
          {posts.length === 0 && !postsError && (
            <div className="bg-gray-800/70 border border-gray-700/60 rounded-2xl p-8 text-center">
              <p className="text-gray-300 font-bold">No community posts yet.</p>
              <p className="text-gray-500 text-sm mt-1">Members can start the conversation here.</p>
            </div>
          )}

          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdated={(updatedPost) => {
                  setPosts((current) => current.map((item) => item.id === updatedPost.id ? updatedPost : item));
                }}
                onPostDeleted={(postId) => {
                  setPosts((current) => current.filter((item) => item.id !== postId));
                }}
              />
            ))}
          </div>

          {postsPage && !postsPage.last && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => loadPosts(postsPage.number + 1, true)}
                disabled={loadingMorePosts}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
              >
                {loadingMorePosts ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default CommunityDetail;
