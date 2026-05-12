import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { communityService } from '../api/communityService';

function CommunityDetail() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCommunity();
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

          <div className="mt-6 bg-gray-900/50 border border-gray-700/60 rounded-xl p-4">
            <p className="text-sm text-gray-400">
              Community-specific posts will be connected here in a later iteration. For now, this page verifies creation, membership, role assignment, and member counts.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default CommunityDetail;
