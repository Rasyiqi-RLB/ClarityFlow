# Firebase Firestore Indexes

## Required Indexes for ClarityFlow

### 1. AI Insights Collection Index

**Collection**: `ai_insights`

**Fields to Index**:
1. `userId` (Ascending)
2. `type` (Ascending) 
3. `isActive` (Ascending)
4. `createdAt` (Descending)

**How to Create**:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ai-eisenhower-matrix`
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Set the following:
   - **Collection ID**: `ai_insights`
   - **Fields**:
     - Field: `userId`, Order: `Ascending`
     - Field: `type`, Order: `Ascending`
     - Field: `isActive`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
6. Click **Create**

### 2. Daily Insights Collection Index

**Collection**: `daily_insights`

**Fields to Index**:
1. `userId` (Ascending)
2. `date` (Ascending)
3. `createdAt` (Descending)

**How to Create**:

1. In Firebase Console → Firestore Database → Indexes
2. Click **Create Index**
3. Set the following:
   - **Collection ID**: `daily_insights`
   - **Fields**:
     - Field: `userId`, Order: `Ascending`
     - Field: `date`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
4. Click **Create**

## Alternative: Use Firebase CLI

You can also create indexes using Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore in your project
firebase init firestore

# Deploy indexes
firebase deploy --only firestore:indexes
```

Create a `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "ai_insights",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "daily_insights",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Current Workaround

The app currently uses simplified queries to avoid index requirements:

- **Before**: Complex query with multiple `where` clauses and `orderBy`
- **After**: Simple query with only `userId` and `orderBy`, then filter in JavaScript

This ensures the app works immediately without waiting for index creation.

## Performance Notes

- **With Index**: Optimal performance, server-side filtering
- **Without Index**: Slightly slower, client-side filtering, but still functional
- **Recommendation**: Create indexes for production use

## Monitoring

Check index creation status in Firebase Console:
- **Building**: Index is being created (can take several minutes)
- **Enabled**: Index is ready and being used
- **Error**: Index creation failed (check configuration)
