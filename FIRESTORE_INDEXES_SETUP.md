# Firestore Indexes Setup

## Problem
You're seeing this error:
```
FAILED_PRECONDITION: The query requires an index
```

## Solution

Deploy the Firestore indexes using Firebase CLI.

### Step 1: Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase (if not already done)
```bash
firebase init
```
- Select "Firestore" when prompted
- Choose your Firebase project
- Accept default files (firestore.rules, firestore.indexes.json)

### Step 4: Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

This will create all the necessary composite indexes for:
- Enemy check-ins queries (userid + enemy + timestamp)
- Journal entries queries (userId + createdAt)
- Meditation history queries

### Step 5: Wait for Index Creation
- Indexes can take a few minutes to build
- Check status in Firebase Console → Firestore → Indexes
- Once status shows "Enabled", your queries will work

## Alternative: Create Index from Error Link

When you see the error, Firebase provides a direct link to create the index:
1. Copy the URL from the error message
2. Open it in your browser
3. Click "Create Index"
4. Wait for it to build

## Verify Indexes

After deployment, verify in Firebase Console:
1. Go to Firebase Console
2. Select your project
3. Navigate to Firestore Database → Indexes
4. You should see indexes for:
   - `enemyCheckins` collection
   - `journels` collection
   - `meditation` subcollection

## Common Issues

### Issue: "Firebase project not found"
**Solution:** Run `firebase use --add` and select your project

### Issue: "Permission denied"
**Solution:** Ensure you're logged in with the correct Google account that has access to the Firebase project

### Issue: "Index already exists"
**Solution:** This is fine - it means the index was already created

## Quick Command Reference

```bash
# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy indexes and rules
firebase deploy --only firestore

# Check current project
firebase projects:list

# Switch project
firebase use your-project-id
```

---

**Note:** After deploying indexes, your app will work correctly without the "index required" errors.