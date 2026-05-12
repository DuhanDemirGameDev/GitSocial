import React, { useState } from 'react';
import { postService } from '../api/postService';

function PostCard({ post }) {
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);
  const [liked, setLiked] = useState(Boolean(post.likedByCurrentUser));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
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
    const content = commentText.trim();

    if (!content) {
      return;
    }

    setSubmittingComment(true);
    setError('');

    try {
      const newComment = await postService.addComment(post.id, content);
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

  return (
    <article className="bg-gray-800/70 border border-gray-700/60 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 border border-gray-700"></div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{authorName}</h2>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>

        {post.content && (
          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>
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
          {liked ? 'Liked' : 'Like'} · {likeCount}
        </button>

        <button
          type="button"
          onClick={toggleComments}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700 transition-all"
        >
          Comments · {commentCount}
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

              return (
                <div key={comment.id} className="bg-gray-900/60 border border-gray-700/60 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-sm font-bold text-gray-200">{commentAuthor}</span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 break-words">{comment.content}</p>
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
