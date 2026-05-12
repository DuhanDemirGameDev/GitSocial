import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { communityService } from '../api/communityService';

function CommunityList() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCommunities();
  }, []);

  async function loadCommunities() {
    setLoading(true);
    setError('');

    try {
      const response = await communityService.getAll();
      setCommunities(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Communities could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(communityId) {
    setBusyId(communityId);
    setError('');

    try {
      const updated = await communityService.join(communityId);
      setCommunities((current) =>
        current.map((community) => community.id === updated.id ? updated : community)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join community.');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-16">Loading communities...</div>;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Communities</h1>
          <p className="text-sm text-gray-500">Join focused spaces for developers and technologies.</p>
        </div>
        <Link
          to="/communities/new"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all"
        >
          Create
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      {communities.length === 0 && !error && (
        <div className="bg-gray-800/70 border border-gray-700/60 rounded-2xl p-8 text-center">
          <p className="text-gray-300 font-bold">No communities yet.</p>
          <p className="text-gray-500 text-sm mt-1">Create the first one and become its founder.</p>
        </div>
      )}

      <div className="space-y-4">
        {communities.map((community) => (
          <article
            key={community.id}
            className="bg-gray-800/70 border border-gray-700/60 rounded-2xl shadow-xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-white truncate">{community.name}</h2>
                <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                  {community.description || 'No description yet.'}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-4">
                  <span>{community.memberCount} members</span>
                  {community.currentUserRole && <span>{community.currentUserRole}</span>}
                </div>
              </div>

              {community.joinedByCurrentUser ? (
                <button
                  type="button"
                  onClick={() => navigate(`/communities/${community.id}`)}
                  className="px-4 py-2 rounded-xl bg-gray-700/70 border border-gray-600 text-gray-100 hover:bg-gray-700 text-sm font-bold transition-all"
                >
                  Enter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJoin(community.id)}
                  disabled={busyId === community.id}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
                >
                  {busyId === community.id ? 'Joining...' : 'Join'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CommunityList;
