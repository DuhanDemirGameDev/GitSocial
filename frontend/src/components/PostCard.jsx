import React, { useState } from 'react';
import { authService } from '../api/authService';
import { postService } from '../api/postService';
// YENİ: Profesyonel ikonlarımızı projeye dahil ediyoruz
import { Star, MessageSquare, Edit3, Trash2, Send } from 'lucide-react';

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
    <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 border border-gray-700 flex items-center justify-center font-black text-white shadow-inner`}>
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
      setError(err.response?.data?.message || 'Action failed.');
    }
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    const nextContent = editText.trim();
    if (!nextContent) return;

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
    if (!confirmed) return;

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
      const response = await postService.getComments(post.id, { page: nextPage, size: 10 });
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
    if (!nextContent) return;

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
          ? { ...comment, likeCount: response.likeCount, likedByCurrentUser: response.likedByCurrentUser }
          : comment
      )));
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
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

  if (removed) return null;

  return (
    <article className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden hover:border-gray-600/50 transition-colors duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar user={post.author} />
            <div className="min-w-0 cursor-pointer group">
              <h2 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors truncate">{authorName}</h2>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>

          {/* DÜZENLE VE SİL BUTONLARI ŞIK İKONLARA DÖNÜŞTÜ */}
          {isPostAuthor && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditText(content);
                  setEditing((current) => !current);
                }}
                disabled={savingEdit || deletingPost}
                className="p-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                title="Edit Post"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
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
              className="w-full min-h-24 resize-y rounded-xl bg-gray-900/80 border border-gray-700 text-gray-100 placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-700 text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit || !editText.trim()}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          content && (
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words text-[15px]">
              {content}
            </p>
          )
        )}
      </div>

      {post.mediaUrl && (
        <div className="w-full overflow-hidden border-y border-gray-700/50 bg-gray-900/50">
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="w-full max-h-[520px] object-contain"
          />
        </div>
      )}

      {/* YENİ NESİL AKSİYON BUTONLARI (KAPSÜL TASARIM) */}
      <div className="px-5 py-3 flex items-center gap-4 border-t border-gray-700/50">
        
        {/* YILDIZ (STAR) BUTONU */}
        <button
          type="button"
          onClick={handleLike}
          className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
            liked
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
              : 'bg-gray-800/50 text-gray-400 border border-transparent hover:bg-gray-700/60 hover:text-gray-200'
          }`}
        >
          <Star className={`w-4 h-4 transition-all duration-300 ${liked ? 'fill-amber-400' : 'group-hover:scale-110'}`} />
          <span>{likeCount} {likeCount === 1 ? 'Star' : 'Stars'}</span>
        </button>

        {/* YORUM BUTONU */}
        <button
          type="button"
          onClick={toggleComments}
          className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gray-800/50 text-gray-400 border border-transparent hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300"
        >
          <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
        </button>
      </div>

      {error && (
        <div className="mx-5 mb-4 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      {commentsOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-700/50 bg-gray-900/20">
          <form onSubmit={handleSubmitComment} className="flex gap-3 py-4 relative">
            <input
              type="text"
              maxLength={500}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              className="flex-1 pl-4 pr-12 py-2.5 rounded-full bg-gray-900/80 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all text-sm"
            />
            {/* YORUM GÖNDERME BUTONU OK İKONUNA DÖNÜŞTÜ */}
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-4 mt-2">
            {comments.map((comment) => {
              const commentAuthor = [comment.author?.firstName, comment.author?.lastName]
                .filter(Boolean)
                .join(' ') || 'GitSocial User';
              const canDeleteComment = currentUserId === comment.author?.id || isPostAuthor;

              return (
                <div key={comment.id} className="group relative bg-gray-800/40 border border-gray-700/40 rounded-2xl p-4 hover:border-gray-600/50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0 cursor-pointer">
                      <Avatar user={comment.author} size="sm" />
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-gray-200 hover:text-blue-400 transition-colors truncate">{commentAuthor}</span>
                        <span className="block text-[11px] text-gray-500">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>

                    {canDeleteComment && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[13px] text-gray-300 break-words pl-10 pr-2">{comment.content}</p>

                  {/* YORUM YILDIZLAMA BUTONU */}
                  <div className="pl-10 mt-2">
                    <button
                      type="button"
                      onClick={() => handleCommentLike(comment.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold transition-all ${
                        comment.likedByCurrentUser 
                          ? 'text-amber-400' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${comment.likedByCurrentUser ? 'fill-amber-400' : ''}`} />
                      {comment.likeCount ?? 0} {comment.likeCount === 1 ? 'Star' : 'Stars'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {loadingComments && (
            <div className="flex justify-center py-4">
              <span className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></span>
            </div>
          )}

          {commentsPage && !commentsPage.last && (
            <button
              type="button"
              onClick={() => loadComments(commentsPage.number + 1, true)}
              disabled={loadingComments}
              className="w-full mt-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-200 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all disabled:opacity-50"
            >
              Daha fazla yorum yükle
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default PostCard;