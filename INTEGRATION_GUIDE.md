# Ruralize Frontend-Backend Integration Documentation

## ✅ Completed Integration Tasks

### 1. **FeedTabs Component** ✅
**File:** `app/components/feed/FeedTabs.tsx`

**Changes:**
- Replaced mock `samplePosts` data with real API calls via `getGeneralFeed()` and `getFriendsFeed()`
- Added `useEffect` hook to load posts when tab changes
- Added loading state with `FeedSkeleton` component
- Added error handling with error messages displayed to user
- Updated `FeedPostCard` to work with `PostResponse` structure from API
- Added date formatting utility for API timestamps
- Integrated callback `onPostCreated` to refresh feed after new posts

**Features:**
- Posts load from `/feed/` endpoint (general feed)
- Posts load from `/feed/friends/{user_id}` endpoint (friends feed)
- Tab switching properly reloads appropriate feed
- Error states displayed to user
- Loading skeleton shown while fetching

---

### 2. **PostComposer Component** ✅
**File:** `app/components/feed/PostComposer.tsx`

**Changes:**
- Connected to `createPost()` API endpoint
- Added user authentication check via `useAuth()` hook
- Added loading state for publish button
- Added success/error toast notifications
- Integrated image upload to post (via `image_url` field)
- Clears form after successful post creation
- Calls `onPostCreated` callback to refresh feed

**Features:**
- Creates posts via `POST /posts/` with `user_id` parameter
- Automatically injects current user ID
- Image preview support before publishing
- Real-time feedback with toast notifications
- Form clears on success for immediate reposting

---

### 3. **Register Page** ✅
**File:** `app/cadastro/page.tsx`

**Status:** Already integrated with `registerUser()` from `auth.api.ts`
- Connects to `POST /auth/register` endpoint
- Handles both student and teacher roles
- Stores registration and course for students
- Redirects to login on success

---

## 📋 Service Layer (Already Production-Ready)

### API Services in `app/services/api/`

#### 1. **client.ts** - Axios Configuration
- Base URL: `https://rural-backend.vercel.app`
- Automatic JWT token injection in headers
- Session expiration handling
- 401 error handling (clears session)

#### 2. **auth.api.ts** - Authentication
```typescript
registerUser(payload: UserCreate): Promise<AuthResponse>
loginUser(payload: UserLogin): Promise<AuthResponse>
```

#### 3. **feed.api.ts** - Feed Management
```typescript
getGeneralFeed(userId?: string): Promise<PostResponse[]>
getFriendsFeed(userId: string): Promise<PostResponse[]>
```

#### 4. **posts.api.ts** - Post Operations
```typescript
getPosts(): Promise<PostResponse[]>
getPost(postId: string): Promise<PostResponse>
createPost(userId: string, payload: PostCreate): Promise<CreatedResponse>
updatePost(postId: string, payload: PostUpdate): Promise<MessageResponse>
deletePost(postId: string, userId: string): Promise<MessageResponse>
likePost(postId: string, userId: string): Promise<MessageResponse>
removeLike(postId: string, userId: string): Promise<MessageResponse>
addComment(postId: string, payload: CommentCreate): Promise<MessageResponse>
removeComment(postId: string, commentIndex: number, userId: string): Promise<MessageResponse>
```

#### 5. **profile.api.ts** - Profile Management
```typescript
getProfileByUser(userId: string): Promise<ProfileResponse>
updateProfile(userId: string, payload: ProfileUpdate): Promise<MessageResponse>
getAllProfiles(): Promise<UserProfileResponse[]>
searchProfilesByName(name: string): Promise<UserProfileResponse[]>
searchProfilesByCourse(course: string): Promise<UserProfileResponse[]>
searchProfilesByDepartment(department: string): Promise<UserProfileResponse[]>
searchProfilesByRole(role: UserRole): Promise<UserProfileResponse[]>
searchProfilesByTags(tags: string[]): Promise<UserProfileResponse[]>
```

---

## 🔧 Authentication & Session Management

### AuthProvider (`app/components/auth/AuthProvider.tsx`)
- Manages global auth state via Context API
- Handles login/logout
- Auto-refreshes session on app load
- Listens to localStorage changes for cross-tab sync
- Automatically clears expired sessions

### Usage:
```typescript
const { user, isAuthenticated, login, logout, token } = useAuth();
```

---

## 🎯 Remaining Integration Tasks (Lower Priority)

### Tasks for Later Phases:

1. **Post Interactions** (Like/Comment)
   - Wire `likePost()`, `removeLike()`, `addComment()`, `removeComment()` to PostCard
   - Add UI components for interactions
   - Update post after interaction (optimistic updates)

2. **User Search & Profiles**
   - Create search page using profile search endpoints
   - Display user profiles with search filters (course, role, tags)
   - Allow users to visit other user profiles

3. **Profile Editing**
   - Create edit profile page
   - Use `updateProfile()` to save changes
   - Upload new profile/cover photos

4. **Post Details Page**
   - Create detailed post view
   - Show all comments
   - Allow editing/deleting own posts

---

## 📝 API Endpoint Mapping

| Feature | Endpoint | Status |
|---------|----------|--------|
| Register | `POST /auth/register` | ✅ Integrated |
| Login | `POST /auth/login` | ✅ Integrated |
| Get Feed | `GET /feed/` | ✅ Integrated |
| Get Friends Feed | `GET /feed/friends/{id}` | ✅ Integrated |
| Create Post | `POST /posts/` | ✅ Integrated |
| Get Posts | `GET /posts/` | ⏳ Available |
| Like Post | `POST /posts/{id}/like` | ⏳ Available |
| Comment | `POST /posts/{id}/comment` | ⏳ Available |
| Get Profile | `GET /profiles/user/{id}` | ⏳ Available |
| Update Profile | `PUT /profiles/user/{id}` | ⏳ Available |
| Search Profiles | `GET /profiles/search/*` | ⏳ Available |

---

## 🚀 Key Implementation Details

### Error Handling Pattern
```typescript
try {
  const data = await apiFunction();
  // Use data
} catch (err) {
  const message = err instanceof Error ? err.message : "Default error";
  // Handle error (show toast, set state, etc)
}
```

### Loading States
All components using API calls include:
- `loading` state to show skeleton/spinner
- `error` state to display error messages
- Disable buttons while loading

### Token Management
- JWT token automatically added to all requests via axios interceptor
- Token stored in `localStorage` with key `ruralize.session`
- Automatic logout on token expiration
- Manual logout clears localStorage and cookies

### User Context
Current user accessed via `useAuth()` hook:
```typescript
const { user, isAuthenticated, token } = useAuth();
// user.id is passed to API calls that need user_id
```

---

## ✨ Testing Checklist

- [x] Feed loads posts from API
- [x] Can create posts with text and images
- [x] Posts refresh after creation
- [x] Register page connects to auth API
- [x] Login page connects to auth API
- [ ] Like/comment interactions work
- [ ] Profile pages load real data
- [ ] Search functionality works
- [ ] Error messages display correctly
- [ ] Loading states show during API calls

---

## 📚 Code Examples

### Load Feed in Component
```typescript
import { getGeneralFeed } from "@/app/services/api/feed.api";
import { useAuth } from "../auth/AuthProvider";

export function MyComponent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (user?.id) {
      getGeneralFeed(user.id)
        .then(setPosts)
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  return <div>{/* render posts */}</div>;
}
```

### Create Post
```typescript
import { createPost } from "@/app/services/api/posts.api";
import { useAuth } from "../auth/AuthProvider";

async function publishPost(content: string) {
  const { user } = useAuth();
  if (!user?.id) throw new Error("Not authenticated");

  await createPost(user.id, {
    content,
    sustainable_action: "general",
  });
}
```

---

## 🔗 Links & Resources

- **Backend API**: https://rural-backend.vercel.app/
- **API Documentation**: See backend repository
- **Project Structure**: `/app/services/api/` for all service files

---

**Last Updated:** 2026-05-31
**Integration Status:** Phase 1 Complete (Core features working)
