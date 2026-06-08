# 🚀 Quick Start Guide - Ruralize Frontend Integration

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

All required packages (axios, next, react, etc.) are already in `package.json`.

### 2. Start Development Server
```bash
npm run build
npm run dev
```

Visit `http://localhost:3000`

### 3. Test the Integration

#### ✅ Test 1: Register New User
1. Navigate to `http://localhost:3000/cadastro`
2. Fill in form with student details
3. Click "Criar minha conta"
4. Should redirect to login
5. Check: API called `POST /auth/register`

#### ✅ Test 2: Login
1. Navigate to `http://localhost:3000/login`
2. Use registered email/password
3. Click "Entrar"
4. Should redirect to `/feed`
5. Check: API called `POST /auth/login`, token stored

#### ✅ Test 3: View Feed
1. After login, on `/feed`
2. Wait 2-3 seconds for posts to load
3. Should see posts loading spinner → posts
4. Check: API called `GET /feed/`

#### ✅ Test 4: Create Post
1. On `/feed`, in PostComposer area
2. Type a message
3. (Optional) Upload image
4. Click "Publicar"
5. Should see success message
6. Post appears in feed
7. Check: API called `POST /posts/` with user_id

---

## Troubleshooting

### Issue: "Bearer token not found in requests"
**Solution:** Check that localStorage has `ruralize.session` key with token. See browser DevTools → Application → Local Storage.

### Issue: "Posts not loading (spinner stuck)"
**Solution:** 
1. Check browser console for errors
2. Verify backend URL: `https://rural-backend.vercel.app/`
3. Check network tab for failed requests
4. Verify user is authenticated (useAuth().isAuthenticated === true)

### Issue: "401 Unauthorized error"
**Solution:**
1. Token expired or invalid
2. Session cleared automatically
3. User should login again
4. Check localStorage is enabled

### Issue: "Can't create posts"
**Solution:**
1. Ensure user is logged in (useAuth().user exists)
2. Check user.id is being passed to createPost()
3. Form validation: Must have content
4. Check network tab for request details

---

## Architecture Overview

```
app/
├── services/api/
│   ├── client.ts           ← Axios config with JWT
│   ├── auth.api.ts         ← Login/Register
│   ├── feed.api.ts         ← Get feed posts
│   ├── posts.api.ts        ← Post CRUD + like + comment
│   └── profile.api.ts      ← Profile endpoints
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx ← Global auth state
│   │   └── RequireAuth.tsx  ← Auth guard
│   ├── feed/
│   │   ├── FeedTabs.tsx     ← Main feed (API integrated)
│   │   ├── PostComposer.tsx ← Create posts (API integrated)
│   │   └── FeedSkeleton.tsx ← Loading state
│   └── ...
├── pages/
│   ├── login/page.tsx
│   ├── cadastro/page.tsx    ← Register (API integrated)
│   ├── feed/page.tsx        ← Main feed
│   └── ...
```

---

## Key API Endpoints Used

### Currently Active ✅
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /feed/` - Get general feed
- `GET /feed/friends/{id}` - Get friends feed
- `POST /posts/` - Create post

### Ready to Use ⏳
- `POST /posts/{id}/like` - Like post
- `POST /posts/{id}/comment` - Comment on post
- `GET /profiles/user/{id}` - Get user profile
- `GET /profiles/search/by-name` - Search users
- See `INTEGRATION_GUIDE.md` for all endpoints

---

## Environment & Configuration

### Base URL
- **Development**: `https://rural-backend.vercel.app/`
- **Set in**: `app/services/api/client.ts` (line 3)

### Authentication
- **Method**: JWT (Bearer token)
- **Stored in**: localStorage with key `ruralize.session`
- **Auto-injected**: Via axios interceptor in `client.ts`

### Session Expiration
- **Duration**: 24 hours
- **Auto-logout**: On expiration
- **Manual logout**: Via useAuth().logout()

---

## Common Code Patterns

### Pattern 1: Load Data from API
```typescript
import { getGeneralFeed } from "@/app/services/api/feed.api";

export function MyComponent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGeneralFeed()
      .then(setPosts)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;
  return <div>{/* render posts */}</div>;
}
```

### Pattern 2: Create Data via API
```typescript
import { createPost } from "@/app/services/api/posts.api";
import { useAuth } from "@/app/components/auth/AuthProvider";

export function CreatePostButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!user?.id) return;

    setLoading(true);
    try {
      await createPost(user.id, { content: "...", sustainable_action: "..." });
      // Success - refresh feed
    } catch (err) {
      console.error(err);
      // Show error
    } finally {
      setLoading(false);
    }
  }

  return <button onClick={handleClick}>Criar</button>;
}
```

### Pattern 3: Get Current User
```typescript
import { useAuth } from "@/app/components/auth/AuthProvider";

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <div>Não autenticado</div>;

  return (
    <div>
      Olá, {user?.name}!
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

## Browser DevTools Tips

### Check Token Storage
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Find key: `ruralize.session`
4. Should contain: `{ token: "...", user: {...}, expiresAt: ... }`

### Monitor API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: XHR / Fetch
4. Watch requests to `rural-backend.vercel.app`

### Check Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors or warnings
4. Check service worker errors

---

## Useful npm Commands

```bash
# Development
npm run dev           # Start dev server with hot reload

# Production
npm run build         # Create production build
npm start            # Run production build

# Code Quality
npm run lint         # Run ESLint
npm run build && npm run lint  # Build + lint check

# Debugging
# Add console.log() anywhere in code
# Changes auto-reflect with npm run dev
```

---

## Next Steps After Setup

1. ✅ Verify feed loads posts
2. ✅ Test creating a new post
3. ✅ Check localStorage has session token
4. 👉 Implement post interactions (like/comment)
5. 👉 Add user search functionality
6. 👉 Create profile pages

See `SESSION_SUMMARY.md` for full integration status.

---

## Need Help?

1. Check the **INTEGRATION_GUIDE.md** for complete API reference
2. See **EXAMPLE_POST_INTERACTIONS.tsx** for code examples
3. Review **SESSION_SUMMARY.md** for overview
4. Check **CLAUDE.md** for original project info

---

**Ready to go!** 🚀
Start with `npm run dev` and test the features listed above.
