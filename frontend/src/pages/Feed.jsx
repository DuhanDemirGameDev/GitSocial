import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { postService } from '../api/postService';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeed(0, false);
  }, []);

  async function loadFeed(nextPage = 0, append = false) {
    append ? setLoadingMore(true) : setLoading(true);
    setError('');

    try {
      const response = await postService.getFeed({
        page: nextPage,
        size: 10,
      });

      setPosts((current) => append ? [...current, ...response.content] : response.content);
      setPage(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Feed could not be loaded.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-16">
        Loading feed...
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Feed</h1>
          <p className="text-sm text-gray-500">Latest GitSocial posts and interactions.</p>
        </div>
        <button
          type="button"
          onClick={() => loadFeed(0, false)}
          className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 text-sm font-bold transition-all"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      {posts.length === 0 && !error && (
        <div className="bg-gray-800/70 border border-gray-700/60 rounded-2xl p-8 text-center">
          <p className="text-gray-300 font-bold">No posts yet.</p>
          <p className="text-gray-500 text-sm mt-1">Create a post from the backend/API and it will appear here.</p>
        </div>
      )}

      <div className="space-y-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {page && !page.last && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => loadFeed(page.number + 1, true)}
            disabled={loadingMore}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
}

export default Feed;
