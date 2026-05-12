import React, { useRef, useState } from 'react';
import { postService } from '../api/postService';

function CreatePostWidget({ communityId, disabled = false, onPostCreated }) {
  const fileInputRef = useRef(null);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasContent = content.trim().length > 0;
  const hasMedia = Boolean(media);
  const hasMediaUrl = mediaUrl.trim().length > 0;
  const canSubmit = !disabled && !submitting && (hasContent || hasMedia || hasMediaUrl);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] ?? null;
    setMedia(selectedFile);

    if (selectedFile) {
      setMediaUrl('');
      setShowUrlInput(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const post = await postService.createPost({
        content,
        media,
        mediaUrl,
        communityId,
      });

      setContent('');
      setMedia(null);
      setMediaUrl('');
      setShowUrlInput(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onPostCreated?.(post);
    } catch (err) {
      setError(err.response?.data?.message || 'Post could not be created.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/70 border border-gray-700/60 rounded-2xl shadow-xl p-5 space-y-4">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={1000}
        disabled={disabled || submitting}
        placeholder={disabled ? 'Join this community to post.' : 'Share something with GitSocial...'}
        className="w-full min-h-28 resize-y rounded-xl bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-60"
      />

      {showUrlInput && (
        <input
          type="url"
          value={mediaUrl}
          onChange={(event) => {
            setMediaUrl(event.target.value);
            if (event.target.value.trim()) {
              setMedia(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
          disabled={disabled || submitting}
          placeholder="https://example.com/image.png"
          className="w-full rounded-xl bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 px-4 py-2.5 focus:outline-none focus:border-blue-500 disabled:opacity-60"
        />
      )}

      {media && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-900/60 border border-gray-700/60 px-4 py-2">
          <span className="text-sm text-gray-300 truncate">{media.name}</span>
          <button
            type="button"
            onClick={() => {
              setMedia(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="text-sm font-bold text-red-300 hover:text-red-200"
          >
            Remove
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || submitting}
            className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 disabled:opacity-50 text-sm font-bold transition-all"
          >
            Attach image
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput((current) => !current)}
            disabled={disabled || submitting}
            className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 disabled:opacity-50 text-sm font-bold transition-all"
          >
            Image URL
          </button>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}

export default CreatePostWidget;
