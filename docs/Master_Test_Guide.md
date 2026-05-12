# GitSocial Master Test Guide

Software Test Documentation core content for Task-8 final QA.

## 1. Purpose

This guide defines the manual API test scenarios for GitSocial using Postman. It is based on the SRS, SDD, SPMP, and the current Spring Boot API implementation.

Primary test scope:

| Module | Architectural Unit | Main Functional Coverage |
|---|---|---|
| Module 1 | Authentication & User Management | Register, login, JWT access token, HttpOnly refresh token, forgot/reset password SMTP flow |
| Module 2 | Community Management | Community creation, unique identity, automatic `FOUNDER`, join/leave constraints |
| Module 3 | Post & Media Management | Text posts, Cloudinary media uploads, feed ordering |
| Module 4 | Social Interaction | Like toggle, one-like-per-user constraint, comments, 500-character limit, comment deletion authorization gap |
| Module 5 | Job & Filtering | Job creation required fields, salary/location/work mode filtering with JPA Specification |

## 2. Test Environment

| Item | Value |
|---|---|
| API base URL | `http://localhost:8080` |
| Database | PostgreSQL, database `gitsocial_db` |
| API tool | Postman |
| Backend stack | Spring Boot, Spring Security, JWT, Spring Data JPA |
| External services | Cloudinary for media, SMTP mail provider for password reset |

Postman environment variables:

| Variable | Example |
|---|---|
| `baseUrl` | `http://localhost:8080` |
| `accessToken` | Set from login response |
| `userAEmail` | `architect.qa@gitsocial.test` |
| `userBEmail` | `member.qa@gitsocial.test` |
| `password` | `Secure123` |
| `communityId` | Set from community creation response |
| `postId` | Set from post creation response |
| `commentId` | Set from comment creation response |

Standard protected request header:

```http
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

For `multipart/form-data` requests, let Postman generate the `Content-Type` header automatically.

## 3. Traceability Matrix

| Requirement Area | Covered By |
|---|---|
| `[GitS_Auth_1]`, `[GitS_Auth_2]` password constraints | SC-01, SC-02, SC-03 |
| `[GitS_Auth_4]`, `[GitS_Auth_7]` forgot password email/token | SC-07, SC-08, SC-09 |
| `[GitS_Auth_5]`, `[GitS_Auth_6]`, `[GitS_Auth_8]` JWT and refresh token | SC-04, SC-05, SC-06 |
| `[GitS_Community_1]`, `[GitS_Community_2]`, `[GitS_Community_7]`, `[GitS_Community_8]` community creation and identity | SC-10, SC-11, SC-12 |
| Community join/leave behavior | SC-13, SC-14, SC-15, SC-16 |
| `[GitS_Post_1]`, `[GitS_Post_2]`, `[GitS_Post_4]`, `[GitS_Post_5]`, `[GitS_Post_6]` posts/media/feed | SC-17, SC-18, SC-19, SC-20, SC-21 |
| `[GitS_Social_1]`, `[GitS_Social_2]`, `[GitS_Social_3]`, `[GitS_Social_4]`, `[GitS_Social_6]` likes/comments | SC-22, SC-23, SC-24, SC-25, SC-26, SC-27 |
| `[GitS_Job_1]`, `[GitS_Job_2]`, `[GitS_Job_3]`, `[GitS_Job_4]`, `[GitS_Job_5]` jobs/filtering | SC-28, SC-29, SC-30, SC-31, SC-32 |

Implementation note: the SRS mentions comment edit/delete and post edit/delete, but the current backend exposes no `PUT`, `PATCH`, or `DELETE` endpoints for comments or posts. This guide includes defect-detection scenarios for the comment deletion requirement.

## 4. Module 1: Authentication & User Management

### SC-01: Failed Register - Password Shorter Than 8 Characters

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/register` |
| Headers | `Content-Type: application/json` |
| Expected status | `400 Bad Request` |

Request body:

```json
{
  "firstName": "QA",
  "lastName": "Short",
  "email": "short.password@gitsocial.test",
  "password": "A1short"
}
```

Expected result:

- Response body contains validation error for `password`.
- User is not created.

Database verification:

```sql
SELECT * FROM users WHERE email = 'short.password@gitsocial.test';
-- Expected: 0 rows
```

### SC-02: Failed Register - Password Missing Uppercase Letter

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/register` |
| Headers | `Content-Type: application/json` |
| Expected status | `400 Bad Request` |

Request body:

```json
{
  "firstName": "QA",
  "lastName": "Lower",
  "email": "lower.password@gitsocial.test",
  "password": "secure123"
}
```

Expected result:

- Response body contains validation error for `password`.
- User is not created.

Database verification:

```sql
SELECT * FROM users WHERE email = 'lower.password@gitsocial.test';
-- Expected: 0 rows
```

### SC-03: Successful Register - Valid Password Constraints

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/register` |
| Headers | `Content-Type: application/json` |
| Expected status | `201 Created` |

Request body:

```json
{
  "firstName": "Software",
  "lastName": "Architect",
  "email": "{{userAEmail}}",
  "password": "{{password}}"
}
```

Expected result:

- Response contains `id`, `firstName`, `lastName`, `email`.
- Response must not expose the password.
- User role is `USER`.

Database verification:

```sql
SELECT user_id, email, first_name, last_name, role, password
FROM users
WHERE email = 'architect.qa@gitsocial.test';
-- Expected: 1 row, role = 'USER', password is BCrypt hash and not 'Secure123'
```

### SC-04: Successful Login - JWT Access Token and HttpOnly Refresh Token

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/login` |
| Headers | `Content-Type: application/json` |
| Expected status | `200 OK` |

Request body:

```json
{
  "email": "{{userAEmail}}",
  "password": "{{password}}"
}
```

Expected result:

- Response body contains an access token.
- `Set-Cookie` response header contains `refreshToken=...`.
- Cookie flags include `HttpOnly`, `Secure`, `SameSite=None`, `Path=/auth`.
- Save the access token to `{{accessToken}}`.

Database verification:

```sql
SELECT rt.refresh_token_id, rt.user_id, rt.token_hash, rt.revoked, rt.expires_at
FROM refresh_tokens rt
JOIN users u ON u.user_id = rt.user_id
WHERE u.email = 'architect.qa@gitsocial.test'
ORDER BY rt.created_at DESC;
-- Expected: latest row exists, revoked = false, token_hash stores a hash rather than the raw cookie value
```

### SC-05: Failed Login - Wrong Password Does Not Lock Account

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/login` |
| Headers | `Content-Type: application/json` |
| Expected status | `401 Unauthorized` |

Request body:

```json
{
  "email": "{{userAEmail}}",
  "password": "WrongPassword123"
}
```

Expected result:

- Login is rejected.
- No account lock is applied.
- A later login using `{{password}}` still succeeds.

Database verification:

```sql
SELECT email, role FROM users WHERE email = 'architect.qa@gitsocial.test';
-- Expected: user still exists and can authenticate with correct password
```

### SC-06: Failed Protected Request - Missing or Invalid Access Token

| Field | Value |
|---|---|
| Method & URL | `GET {{baseUrl}}/communities` |
| Headers | No `Authorization` header, or `Authorization: Bearer invalid.token.value` |
| Expected status | `401 Unauthorized` or security rejection response |

Request body:

```json
{}
```

Expected result:

- Protected resource is not returned.
- Tester records the response body and verifies that unauthorized access is blocked.

Database verification:

```sql
SELECT COUNT(*) FROM communities;
-- Expected: read-only test, no database mutation
```

### SC-07: Successful Forgot Password - SMTP Flow and Token Generation

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/forgot-password` |
| Headers | `Content-Type: application/json` |
| Expected status | `200 OK` |

Request body:

```json
{
  "email": "{{userAEmail}}"
}
```

Expected result:

- Response confirms that reset link was sent.
- SMTP provider receives one reset email.
- Email body contains reset token or reset URL containing the token.
- Request is processed within the configured timeout target.

Database verification:

```sql
SELECT prt.id, prt.token, prt.user_id, prt.expiry_date
FROM password_reset_tokens prt
JOIN users u ON u.user_id = prt.user_id
WHERE u.email = 'architect.qa@gitsocial.test'
ORDER BY prt.expiry_date DESC;
-- Expected: one latest token exists, token is non-empty, expiry_date is in the future
```

### SC-08: Successful Reset Password - Valid Token

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/reset-password` |
| Headers | `Content-Type: application/json` |
| Expected status | `200 OK` |

Request body:

```json
{
  "token": "PASTE_TOKEN_FROM_EMAIL_OR_DATABASE",
  "newPassword": "NewSecure123"
}
```

Expected result:

- Password is updated.
- Login with old password fails.
- Login with `NewSecure123` succeeds.
- Used reset token is removed or invalidated.

Database verification:

```sql
SELECT password
FROM users
WHERE email = 'architect.qa@gitsocial.test';
-- Expected: password hash changed and is not the plaintext new password

SELECT *
FROM password_reset_tokens
WHERE token = 'PASTE_TOKEN_FROM_EMAIL_OR_DATABASE';
-- Expected: 0 rows after successful reset
```

### SC-09: Failed Reset Password - Invalid or Weak New Password

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/auth/reset-password` |
| Headers | `Content-Type: application/json` |
| Expected status | `400 Bad Request` |

Request body:

```json
{
  "token": "invalid-token-value",
  "newPassword": "weak"
}
```

Expected result:

- Request is rejected.
- Password remains unchanged.

Database verification:

```sql
SELECT password
FROM users
WHERE email = 'architect.qa@gitsocial.test';
-- Expected: unchanged from the previous valid password hash
```

## 5. Module 2: Community Management

### SC-10: Successful Community Creation - Unique ID and Founder Assignment

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/communities` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `201 Created` |

Request body:

```json
{
  "name": "Java Backend Guild QA",
  "description": "Community for backend engineers testing GitSocial."
}
```

Expected result:

- Response contains generated `id`.
- Response has `memberCount = 1`.
- Response has `joined = true`.
- Response has `role = "FOUNDER"`.
- Save `id` as `{{communityId}}`.

Database verification:

```sql
SELECT community_id, name, description
FROM communities
WHERE name = 'Java Backend Guild QA';
-- Expected: 1 row with non-null UUID community_id

SELECT cm.role
FROM community_members cm
JOIN communities c ON c.community_id = cm.community_id
JOIN users u ON u.user_id = cm.user_id
WHERE c.name = 'Java Backend Guild QA'
  AND u.email = 'architect.qa@gitsocial.test';
-- Expected: FOUNDER
```

### SC-11: Failed Community Creation - Duplicate Name

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/communities` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `409 Conflict` |

Request body:

```json
{
  "name": "Java Backend Guild QA",
  "description": "Duplicate community should not be accepted."
}
```

Expected result:

- API rejects the duplicate community.
- Error message states that a community with this name already exists.

Database verification:

```sql
SELECT COUNT(*)
FROM communities
WHERE LOWER(name) = LOWER('Java Backend Guild QA');
-- Expected: 1
```

### SC-12: Failed Community Creation - Blank Name

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/communities` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `400 Bad Request` |

Request body:

```json
{
  "name": "",
  "description": "Name is required."
}
```

Expected result:

- Validation error for `name`.
- No community is inserted.

Database verification:

```sql
SELECT COUNT(*) FROM communities WHERE name = '';
-- Expected: 0
```

### SC-13: Successful Join - New Member

Prerequisite: create or login as a second user and set `{{accessToken}}` to User B's token.

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/communities/{{communityId}}/join` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- Response has `joined = true`.
- Response has `role = "MEMBER"`.
- Member count increases by 1.

Database verification:

```sql
SELECT cm.role
FROM community_members cm
JOIN users u ON u.user_id = cm.user_id
WHERE cm.community_id = 'PASTE_COMMUNITY_UUID'
  AND u.email = 'member.qa@gitsocial.test';
-- Expected: MEMBER
```

### SC-14: Idempotent Join - Already a Member

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/communities/{{communityId}}/join` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- API does not create a duplicate membership.
- Response still has `joined = true`.

Database verification:

```sql
SELECT COUNT(*)
FROM community_members cm
JOIN users u ON u.user_id = cm.user_id
WHERE cm.community_id = 'PASTE_COMMUNITY_UUID'
  AND u.email = 'member.qa@gitsocial.test';
-- Expected: 1
```

### SC-15: Failed Leave - Founder Cannot Leave

Prerequisite: set `{{accessToken}}` back to User A founder token.

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/communities/{{communityId}}/leave` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `400 Bad Request` |

Request body:

```json
{}
```

Expected result:

- API rejects leave operation.
- Error message states that founder cannot leave.

Database verification:

```sql
SELECT cm.role
FROM community_members cm
JOIN users u ON u.user_id = cm.user_id
WHERE cm.community_id = 'PASTE_COMMUNITY_UUID'
  AND u.email = 'architect.qa@gitsocial.test';
-- Expected: FOUNDER still exists
```

### SC-16: Successful Leave - Regular Member

Prerequisite: set `{{accessToken}}` to User B member token.

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/communities/{{communityId}}/leave` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- Response has `joined = false`.
- User B membership is removed.

Database verification:

```sql
SELECT COUNT(*)
FROM community_members cm
JOIN users u ON u.user_id = cm.user_id
WHERE cm.community_id = 'PASTE_COMMUNITY_UUID'
  AND u.email = 'member.qa@gitsocial.test';
-- Expected: 0
```

### SC-16A: Community Feed - Paginated Community Posts

Prerequisite: at least one post exists with `community_id = {{communityId}}`.

| Field | Value |
|---|---|
| Method & URL | `GET {{baseUrl}}/communities/{{communityId}}/posts?page=0&size=10` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- Response is a paged result.
- Every returned post has `communityId = {{communityId}}`.
- Results are ordered by `popularityScore` descending, then `createdAt` descending.
- Requests for a non-existing community ID return `404 Not Found`.

Database verification:

```sql
SELECT post_id, content, community_id, popularity_score, created_at
FROM posts
WHERE community_id = 'PASTE_COMMUNITY_UUID'
ORDER BY popularity_score DESC, created_at DESC
LIMIT 10;
-- Expected: rows match GET /communities/{{communityId}}/posts response content and order
```

## 6. Module 3: Post & Media Management

### SC-17: Successful Text-Only Post Creation

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Body type | `form-data` |
| Expected status | `201 Created` |

Request body:

| Key | Type | Value |
|---|---|---|
| `content` | Text | `Text-only QA post for GitSocial feed ordering.` |

Expected result:

- Response contains `id`, `content`, `createdAt`, `author`.
- `mediaUrl` is `null`.
- `popularityScore` is based on content length.
- Save `id` as `{{postId}}`.

Database verification:

```sql
SELECT post_id, content, media_url, popularity_score, author_id
FROM posts
WHERE content = 'Text-only QA post for GitSocial feed ordering.';
-- Expected: 1 row, media_url is null
```

### SC-18: Successful Media Post Creation - Cloudinary Upload

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Body type | `form-data` |
| Expected status | `201 Created` |

Request body:

| Key | Type | Value |
|---|---|---|
| `content` | Text | `Media upload QA post.` |
| `media` | File | Select a `.jpg` or `.png` under 5 MB |

Expected result:

- Response contains non-null `mediaUrl`.
- `mediaUrl` points to Cloudinary.
- Cloudinary dashboard shows uploaded media under configured folder.
- `popularityScore` is higher than a comparable text-only post because media adds score.

Database verification:

```sql
SELECT post_id, content, media_url, popularity_score
FROM posts
WHERE content = 'Media upload QA post.';
-- Expected: media_url is non-null and popularity_score >= 1.0
```

### SC-18A: Successful Community Post Creation - Member Only

Prerequisite: authenticated user has joined `{{communityId}}`.

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Body type | `form-data` |
| Expected status | `201 Created` |

Request body:

| Key | Type | Value |
|---|---|---|
| `content` | Text | `Community-linked QA post.` |
| `communityId` | Text | `{{communityId}}` |

Expected result:

- Response contains generated `id`.
- Response has `communityId = {{communityId}}`.
- Response includes the community name in `communityName`.
- Post appears in `GET {{baseUrl}}/communities/{{communityId}}/posts`.
- Save `id` as `{{postId}}`.

Database verification:

```sql
SELECT post_id, content, community_id
FROM posts
WHERE content = 'Community-linked QA post.';
-- Expected: 1 row with community_id = PASTE_COMMUNITY_UUID
```

### SC-18B: Failed Community Post Creation - Non-Member

Prerequisite: authenticated user is not a member of `{{communityId}}`.

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Body type | `form-data` |
| Expected status | `403 Forbidden` |

Request body:

| Key | Type | Value |
|---|---|---|
| `content` | Text | `Unauthorized community post attempt.` |
| `communityId` | Text | `{{communityId}}` |

Expected result:

- API rejects the request.
- Error message states that the user does not have permission.
- No post is inserted for this content.

Database verification:

```sql
SELECT COUNT(*)
FROM posts
WHERE content = 'Unauthorized community post attempt.';
-- Expected: 0
```

### SC-19: Failed Post Creation - Empty Text and No Media

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Body type | `form-data` with no fields, or `content` = spaces |
| Expected status | `400 Bad Request` |

Request body:

| Key | Type | Value |
|---|---|---|
| `content` | Text | `   ` |

Expected result:

- API rejects the request.
- Error message states that a post must include text, media, or both.

Database verification:

```sql
SELECT COUNT(*) FROM posts WHERE content IS NULL AND media_url IS NULL;
-- Expected: 0
```

### SC-20: Failed Post Creation - Content Exceeds 1000 Characters

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Body type | `form-data` |
| Expected status | `400 Bad Request` |

Request body:

| Key | Type | Value |
|---|---|---|
| `content` | Text | Paste 1001 characters |

Expected result:

- Validation rejects content longer than 1000 characters.
- No post is inserted.

Database verification:

```sql
SELECT COUNT(*) FROM posts WHERE LENGTH(content) > 1000;
-- Expected: 0
```

### SC-21: Feed Ordering - Popularity Score Before Chronological Order

| Field | Value |
|---|---|
| Method & URL | `GET {{baseUrl}}/posts/feed?page=0&size=20` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- Response is a paged result.
- Items are ordered by `popularityScore` descending.
- For equal popularity scores, newer `createdAt` appears first.

Database verification:

```sql
SELECT post_id, content, popularity_score, created_at
FROM posts
ORDER BY popularity_score DESC, created_at DESC
LIMIT 20;
-- Expected: order matches GET /posts/feed response order
```

### SC-21A: Successful Post Edit - Author Only

Prerequisite: `{{postId}}` belongs to the authenticated user.

| Field | Value |
|---|---|
| Method & URL | `PUT {{baseUrl}}/posts/{{postId}}` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `200 OK` |

Request body:

```json
{
  "content": "Edited QA post content."
}
```

Expected result:

- Response contains the same `id`.
- Response `content` is updated.
- `author.id` is unchanged.
- A different authenticated user receives `403 Forbidden` for the same request.

Database verification:

```sql
SELECT post_id, content
FROM posts
WHERE post_id = 'PASTE_POST_UUID';
-- Expected: content = 'Edited QA post content.'
```

### SC-21B: Successful Post Delete - Author Only

Prerequisite: create a disposable post owned by the authenticated user and save its ID as `{{postId}}`.

| Field | Value |
|---|---|
| Method & URL | `DELETE {{baseUrl}}/posts/{{postId}}` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `204 No Content` |

Request body:

```json
{}
```

Expected result:

- Post is deleted.
- Related post likes and comments are deleted through cascade behavior.
- A different authenticated user receives `403 Forbidden`.

Database verification:

```sql
SELECT COUNT(*) FROM posts WHERE post_id = 'PASTE_POST_UUID';
-- Expected: 0

SELECT COUNT(*) FROM post_likes WHERE post_id = 'PASTE_POST_UUID';
-- Expected: 0

SELECT COUNT(*) FROM post_comments WHERE post_id = 'PASTE_POST_UUID';
-- Expected: 0
```

## 7. Module 4: Social Interaction

### SC-22: Successful Like - First Toggle Creates Like

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts/{{postId}}/likes` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- Response has `likedByCurrentUser = true`.
- `likeCount` increases by 1.

Database verification:

```sql
SELECT COUNT(*)
FROM post_likes pl
JOIN users u ON u.user_id = pl.user_id
WHERE pl.post_id = 'PASTE_POST_UUID'
  AND u.email = 'architect.qa@gitsocial.test';
-- Expected: 1
```

### SC-23: Successful Unlike - Second Toggle Removes Like

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts/{{postId}}/likes` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- Response has `likedByCurrentUser = false`.
- `likeCount` decreases by 1.

Database verification:

```sql
SELECT COUNT(*)
FROM post_likes pl
JOIN users u ON u.user_id = pl.user_id
WHERE pl.post_id = 'PASTE_POST_UUID'
  AND u.email = 'architect.qa@gitsocial.test';
-- Expected: 0
```

### SC-24: Like Unique Constraint - One Like Per User Per Post

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts/{{postId}}/likes` twice with same user |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | First `200 OK`, second `200 OK` as unlike |

Request body:

```json
{}
```

Expected result:

- API uses toggle logic instead of duplicate insert.
- Database never contains two likes for the same `(post_id, user_id)`.

Database verification:

```sql
SELECT post_id, user_id, COUNT(*)
FROM post_likes
GROUP BY post_id, user_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

### SC-25: Successful Comment Creation

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts/{{postId}}/comments` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `201 Created` |

Request body:

```json
{
  "content": "This is a valid QA comment."
}
```

Expected result:

- Response contains `id`, `content`, `createdAt`, `author`.
- Save `id` as `{{commentId}}`.

Database verification:

```sql
SELECT comment_id, post_id, user_id, content
FROM post_comments
WHERE content = 'This is a valid QA comment.';
-- Expected: 1 row
```

### SC-26: Failed Comment Creation - 500 Character Limit

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts/{{postId}}/comments` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `400 Bad Request` |

Request body:

```json
{
  "content": "PASTE_501_CHARACTERS_HERE"
}
```

Expected result:

- Validation rejects comment content longer than 500 characters.
- No comment is inserted.

Database verification:

```sql
SELECT COUNT(*) FROM post_comments WHERE LENGTH(content) > 500;
-- Expected: 0
```

### SC-27: Successful Comment Delete - Comment Author

| Field | Value |
|---|---|
| Method & URL | `DELETE {{baseUrl}}/posts/{{postId}}/comments/{{commentId}}` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `204 No Content` |

Request body:

```json
{}
```

Expected result:

- Comment author can delete their own comment.
- Comment no longer appears in `GET {{baseUrl}}/posts/{{postId}}/comments`.

Database verification:

```sql
SELECT *
FROM post_comments
WHERE comment_id = 'PASTE_COMMENT_UUID';
-- Expected: 0 rows
```

### SC-27A: Successful Comment Delete - Post Owner Moderation

Prerequisite: User B comments on a post owned by User A. Set `{{accessToken}}` to User A's token.

| Field | Value |
|---|---|
| Method & URL | `DELETE {{baseUrl}}/posts/{{postId}}/comments/{{commentId}}` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `204 No Content` |

Request body:

```json
{}
```

Expected result:

- Post owner can delete another user's comment under their own post.
- Comment is removed.

Database verification:

```sql
SELECT COUNT(*)
FROM post_comments
WHERE comment_id = 'PASTE_COMMENT_UUID';
-- Expected: 0
```

### SC-27B: Failed Comment Delete - Unrelated User

Prerequisite: User C is neither the comment author nor the post author. Set `{{accessToken}}` to User C's token.

| Field | Value |
|---|---|
| Method & URL | `DELETE {{baseUrl}}/posts/{{postId}}/comments/{{commentId}}` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `403 Forbidden` |

Request body:

```json
{}
```

Expected result:

- API rejects the delete request.
- Comment remains in the database.

Database verification:

```sql
SELECT COUNT(*)
FROM post_comments
WHERE comment_id = 'PASTE_COMMENT_UUID';
-- Expected: 1
```

### SC-27C: Comment Like Toggle

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/posts/{{postId}}/comments/{{commentId}}/likes` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | First request: `200 OK`; second request: `200 OK` |

Request body:

```json
{}
```

Expected result:

- First request creates a comment like and returns `likedByCurrentUser = true`.
- Second request removes the comment like and returns `likedByCurrentUser = false`.
- `likeCount` reflects the current number of likes.

Database verification:

```sql
SELECT COUNT(*)
FROM comment_likes
WHERE comment_id = 'PASTE_COMMENT_UUID'
  AND user_id = 'PASTE_USER_UUID';
-- Expected after first toggle: 1
-- Expected after second toggle: 0
```

## 8. Module 5: Job & Filtering

### SC-28: Successful Job Creation - Required Fields Present

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/jobs` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `201 Created` |

Request body:

```json
{
  "title": "Backend Developer QA",
  "salaryRange": 75000,
  "location": "Istanbul",
  "workMode": "HYBRID"
}
```

Expected result:

- Response contains generated `id`.
- Response contains `title`, `salaryRange`, `location`, `workMode`, `createdAt`, `createdBy`.

Database verification:

```sql
SELECT job_id, title, salary_range, location, work_mode, created_by
FROM jobs
WHERE title = 'Backend Developer QA';
-- Expected: 1 row, salary_range = 75000, work_mode = HYBRID
```

### SC-29: Failed Job Creation - Missing Salary

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/jobs` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `400 Bad Request` |

Request body:

```json
{
  "title": "Missing Salary QA",
  "location": "Istanbul",
  "workMode": "REMOTE"
}
```

Expected result:

- Validation rejects missing `salaryRange`.
- Job is not created.

Database verification:

```sql
SELECT COUNT(*) FROM jobs WHERE title = 'Missing Salary QA';
-- Expected: 0
```

### SC-30: Failed Job Creation - Invalid Work Mode

| Field | Value |
|---|---|
| Method & URL | `POST {{baseUrl}}/jobs` |
| Headers | `Authorization: Bearer {{accessToken}}`, `Content-Type: application/json` |
| Expected status | `400 Bad Request` |

Request body:

```json
{
  "title": "Invalid Work Mode QA",
  "salaryRange": 65000,
  "location": "Ankara",
  "workMode": "FLEXIBLE"
}
```

Expected result:

- API rejects invalid work mode.
- Accepted values are `REMOTE`, `HYBRID`, `ONSITE`.

Database verification:

```sql
SELECT COUNT(*) FROM jobs WHERE title = 'Invalid Work Mode QA';
-- Expected: 0
```

### SC-31: Job Filtering - Salary Range and Location

Prerequisite: create at least three jobs with different salaries and locations.

| Field | Value |
|---|---|
| Method & URL | `GET {{baseUrl}}/jobs/filter?minSalary=60000&maxSalary=90000&location=istanbul&page=0&size=20` |
| Headers | No authorization required by controller, but use `Authorization: Bearer {{accessToken}}` because all non-auth paths are protected by Spring Security |
| Expected status | `200 OK` |

Request body:

```json
{}
```

Expected result:

- Response only includes jobs with `salaryRange >= 60000`.
- Response only includes jobs with `salaryRange <= 90000`.
- Response only includes locations containing `istanbul`, case-insensitive.
- Results are sorted by `createdAt` descending.

Database verification:

```sql
SELECT job_id, title, salary_range, location, created_at
FROM jobs
WHERE salary_range >= 60000
  AND salary_range <= 90000
  AND LOWER(location) LIKE '%istanbul%'
ORDER BY created_at DESC;
-- Expected: rows match GET /jobs/filter response content and order
```

### SC-32: Job Filtering - Invalid Salary Range

| Field | Value |
|---|---|
| Method & URL | `GET {{baseUrl}}/jobs/filter?minSalary=100000&maxSalary=50000` |
| Headers | `Authorization: Bearer {{accessToken}}` |
| Expected status | `400 Bad Request` |

Request body:

```json
{}
```

Expected result:

- API rejects invalid filter where minimum salary is greater than maximum salary.
- Error message states that minimum salary cannot be greater than maximum salary.

Database verification:

```sql
SELECT COUNT(*) FROM jobs;
-- Expected: read-only test, no database mutation
```

## 9. General Regression Checks

Run these checks after the module tests:

| Check | Expected Result |
|---|---|
| Every protected endpoint without `Authorization` | Request is rejected with unauthorized response |
| Every create endpoint with valid token | User identity is resolved from JWT, not from request body |
| User passwords in database | BCrypt hashes only, no plaintext |
| Refresh tokens in database | Stored as hashes, not raw cookie values |
| Postman cookie jar after login | `refreshToken` exists and is HttpOnly |
| Cloudinary upload failure or timeout | API returns an error and does not create a broken post record |
| Pagination limits | `/posts/feed` and `/jobs/filter` clamp size to maximum 20; comments clamp to maximum 50 |

## 10. QA Defects to Record if Reproduced

| ID | Defect |
|---|---|
| DEF-01 | Reserved - comment deletion requirement implemented after Task-6 enhancement. |
| DEF-02 | Reserved - post edit/delete requirement implemented after Task-5 enhancement. |
| DEF-03 | SRS describes same-name community behavior inconsistently with current implementation; current API enforces unique community name and generated UUID. |
| DEF-04 | SMTP forgotten-password test depends on valid mail environment variables; if mail is not configured, expected result becomes `502 Bad Gateway` from email delivery failure. |

