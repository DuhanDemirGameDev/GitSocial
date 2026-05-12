import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { communityService } from '../api/communityService';

function CreateCommunity() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const community = await communityService.create({
        name,
        description,
      });
      navigate(`/communities/${community.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Community could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <Link to="/communities" className="text-sm font-bold text-blue-400 hover:text-blue-300">
          &larr; Back to communities
        </Link>
        <h1 className="text-2xl font-black text-white tracking-tight mt-3">Create Community</h1>
        <p className="text-sm text-gray-500">Start a focused space for a technology, team, or topic.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800/70 border border-gray-700/60 rounded-2xl shadow-xl p-5 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Name</label>
          <input
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="react-developers"
            className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
          <textarea
            maxLength={1000}
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What is this community about?"
            className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
        >
          {isSubmitting ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </section>
  );
}

export default CreateCommunity;
