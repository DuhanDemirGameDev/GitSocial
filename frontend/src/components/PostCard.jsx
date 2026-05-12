import React, { useState } from 'react';
import { authService } from '../api/authService';
import { postService } from '../api/postService';

function Avatar({ user, size = 'md' }) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'GitSocial User';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'GS';
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (user?.profilePictureUrl) {
    return (
      <img
        src={user.profilePictureUrl}
        alt=""
        className={`${sizeClass} rounded-full object-cover border border-gray-700 bg-gray-900`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 border border-gray-700 flex items-center justify-center font-black text-white`}>
      {initials}
    </div>
  );
}

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;
  const isPostAuthor = currentUserId === post.author?.id;

  const [content, setContent] = useState(post.content ?? '');
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);
  const [liked, setLiked] = useState(Boolean(post.likedByCurrentUser));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content ?? '');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState('');

  const authorName = [post.author?.firstName, post.author?.lastName]
    .filter(Boolean)
    .join(' ') || 'GitSocial User';

  const formattedDate = post.createdAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(post.createdAt))
    : '';

  async function handleLike() {
    setError('');

    try {
      const response = await postService.toggleLike(post.id);
      setLikeCount(response.likeCount);
      setLiked(response.likedByCurrentUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Like action failed.');
    }
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    const nextContent = editText.trim();

    if (!nextContent) {
      return;
    }

    setSavingEdit(true);
    setError('');

    try {
      const updatedPost = await postService.updatePost(post.id, nextContent);
      setContent(updatedPost.content ?? '');
      setEditText(updatedPost.content ?? '');
      setEditing(false);
      onPostUpdated?.(updatedPost);
    } catch (err) {
      setError(err.response?.data?.message || 'Post could not be updated.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeletePost() {
    const confirmed = window.confirm('Delete this post?');

    if (!confirmed) {
      return;
    }

    setDeletingPost(true);
    setError('');

    try {
      await postService.deletePost(post.id);
      setRemoved(true);
      onPostDeleted?.(post.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Post could not be deleted.');
    } finally {
      setDeletingPost(false);
    }
  }

  async function loadComments(nextPage = 0, append = false) {
    setLoadingComments(true);
    setError('');

    try {
      const response = await postService.getComments(post.id, {
        page: nextPage,
        size: 10,
      });

      setComments((current) => append ? [...current, ...response.content] : response.content);
      setCommentsPage(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Comments could not be loaded.');
    } finally {
      setLoadingComments(false);
    }
  }

  async function toggleComments() {
    const nextOpen = !commentsOpen;
    setCommentsOpen(nextOpen);

    if (nextOpen && comments.length === 0) {
      await loadComments(0, false);
    }
  }

  async function handleSubmitComment(event) {
    event.preventDefault();
    const nextContent = commentText.trim();

    if (!nextContent) {
      return;
    }

    setSubmittingComment(true);
    setError('');

    try {
      const newComment = await postService.addComment(post.id, nextContent);
      setComments((current) => [...current, newComment]);
      setCommentCount((current) => current + 1);
      setCommentText('');
      setCommentsOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Comment could not be sent.');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleCommentLike(commentId) {
    setError('');

    try {
      const response = await postService.toggleCommentLike(post.id, commentId);
      setComments((current) => current.map((comment) => (
        comment.id === commentId
          ? {
              ...comment,
              likeCount: response.likeCount,
              likedByCurrentUser: response.likedByCurrentUser,
            }
          : comment
      )));
    } catch (err) {
      setError(err.response?.data?.message || 'Comment like action failed.');
    }
  }

  async function handleDeleteComment(commentId) {
    setError('');

    try {
      await postService.deleteComment(post.id, commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      setCommentCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(err.response?.data?.message || 'Comment could not be deleted.');
    }
  }

  if (removed) {
    return null;
  }

  return (
    <article className="bg-gray-800/70 border border-gray-700/60 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar user={post.author} />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{authorName}</h2>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>

          {isPostAuthor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditText(content);
                  setEditing((current) => !current);
                }}
                disabled={savingEdit || deletingPost}
                className="px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 disabled:opacity-50 text-xs font-bold transition-all"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 disabled:opacity-50 text-xs font-bold transition-all"
              >
                {deletingPost ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              maxLength={1000}
              className="w-full min-h-24 resize-y rounded-xl bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={savingEdit || !editText.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
            >
              {savingEdit ? 'Saving...' : 'Save'}
            </button>
          </form>
        ) : (
          content && (
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          )
        )}
      </div>

      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt=""
          className="w-full max-h-[520px] object-cover border-y border-gray-700/60"
        />
      )}

      <div className="px-5 py-3 flex items-center gap-3 border-t border-gray-700/60">
        <button
          type="button"
          onClick={handleLike}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            liked
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700'
          }`}
        >
          {liked ? 'Liked' : 'Like'} - {likeCount}
        </button>

        <button
          type="button"
          onClick={toggleComments}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 transition-all"
        >
          Comments - {commentCount}
        </button>
      </div>

      {error && (
        <div className="mx-5 mb-4 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      {commentsOpen && (
        <div className="px-5 pb-5 border-t border-gray-700/60">
          <form onSubmit={handleSubmitComment} className="flex gap-2 py-4">
            <input
              type="text"
              maxLength={500}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 rounded-xl bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
            >
              Send
            </button>
          </form>

          <div className="space-y-3">
            {comments.map((comment) => {
              const commentAuthor = [comment.author?.firstName, comment.author?.lastName]
                .filter(Boolean)
                .join(' ') || 'GitSocial User';
              const canDeleteComment = currentUserId === comment.author?.id || isPostAuthor;

              return (
                <div key={comment.id} className="bg-gray-900/60 border border-gray-700/60 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar user={comment.author} size="sm" />
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-gray-200 truncate">{commentAuthor}</span>
                        <span className="block text-xs text-gray-500">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>

                    {canDeleteComment && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs font-bold transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 break-words">{comment.content}</p>

                  <button
                    type="button"
                    onClick={() => handleCommentLike(comment.id)}
                    className={`mt-3 text-xs font-bold transition-all ${
                      comment.likedByCurrentUser ? 'text-blue-300' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {comment.likedByCurrentUser ? 'Liked' : 'Like'} - {comment.likeCount ?? 0}
                  </button>
                </div>
              );
            })}
          </div>

          {loadingComments && (
            <p className="text-sm text-gray-500 py-3">Loading comments...</p>
          )}

          {commentsPage && !commentsPage.last && (
            <button
              type="button"
              onClick={() => loadComments(commentsPage.number + 1, true)}
              disabled={loadingComments}
              className="mt-4 text-sm font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              Load more comments
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default PostCard;
