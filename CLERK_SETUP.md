# Getting Real Clerk API Keys

## 🎯 Step-by-Step Guide

### Step 1: Create Clerk Account
1. Go to [Clerk.com](https://clerk.com)
2. Click "Sign Up"
3. Create account (use email or OAuth)

### Step 2: Create Application
1. After logging in, you'll see dashboard
2. Click "Create Application"
3. Choose your OAuth providers (Google, GitHub, etc.)
4. Click "Create Application"

### Step 3: Find Your Keys
1. In the Clerk Dashboard, go to **API Keys** section
  - URL: `https://dashboard.clerk.com/last-active?path=api-keys`
2. You'll see two keys:

```
Publishable key:  pk_test_xxxxxxxxxxxxxxxxxxxxx
Secret key:       sk_test_yyyyyyyyyyyyyyyyyyy
```

### Step 4: Add to `.env.local`

Replace the keys in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_yyyyyyyyyyyyyyyyyyy
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step 5: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

Now your app will work with real Clerk authentication!

## 🔐 Key Information

| Key | Starts With | Visibility | Where to Use |
|-----|------------|-----------|-------------|
| **Publishable Key** | `pk_` | Public (safe to expose) | `.env.local` and frontend |
| **Secret Key** | `sk_` | Private (keep secret) | `.env.local` backend only |

## ⚠️ Security Tips

1. **Never commit `.env.local` to git** - Add to `.gitignore`
2. **Keep secret key private** - Only on backend/server
3. **Rotate keys regularly** - In Clerk dashboard if compromised
4. **Use different apps** - Development, staging, production
5. **Don't share keys** - Only share with trusted team members

## ✅ Verify Setup

After restarting your server, you should see:

✅ Landing page loads with animations
✅ "Start Creating" button works
✅ Sign up form appears from Clerk
✅ OAuth providers (Google, GitHub) shown
✅ Email/password auth available

## 🆘 Troubleshooting

### "Invalid Publishable Key"
- Check key starts with `pk_test_`
- Verify full key is copied (no extra spaces)
- Make sure it's in `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` variable

### "Unauthorized Secret Key"
- Check key starts with `sk_test_`
- Ensure only on backend (not in frontend code)
- Verify in `CLERK_SECRET_KEY` variable

### "CORS or Connection Issues"
- Verify keys are correct
- Check Clerk app is published (not draft)
- Clear `.next` cache: `rm -r .next`
- Restart dev server

### "Users not saved"
- Confirm Clerk app is active in dashboard
- Check "Allowed origins" includes `localhost:3000`
- Verify user signed up in Clerk dashboard

## 📚 More Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)
- [Next.js + Clerk Guide](https://clerk.com/docs/quickstarts/nextjs)

## 🎉 Next Steps

Once keys are set up:

1. ✅ Visit `http://localhost:3000`
2. ✅ Click "Start Creating"
3. ✅ Sign up with email or OAuth
4. ✅ Land on dashboard
5. ✅ Create whiteboard
6. ✅ Share with others and draw together!

Happy building! 🚀
