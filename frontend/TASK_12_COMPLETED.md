# Task 12 Completed: Build Normal User Store List and Rating Pages

## What Has Been Implemented

### 1. User Service (`src/services/userService.js`)

**API Methods:**
```javascript
userService.getStores(params)        // Get stores with pagination/sorting/filtering
userService.submitRating(storeId, rating)  // Submit/update rating for store
userService.getProfile()             // Get user profile
```

**Features:**
- All methods return `{ success: boolean, data?: object, error?: string }`
- Axios integration with base URL and credentials
- Error handling with user-friendly messages
- Consistent API response format

### 2. User Stores Page (`src/pages/UserStores.jsx`)

**Main Features:**

**Search & Filter Section:**
- Search input (by name or address)
- Sort By dropdown (Name, Rating, Newest)
- Order dropdown (Ascending, Descending)
- Filters persist with pagination
- Instant filter updates

**Stores Grid Display:**
- Card-based layout (responsive)
- Minimum 350px card width
- Store information displayed:
  - Store name
  - Email address
  - Physical address
  - Average rating (yellow #ffc107)
  - Total number of ratings
  - User's current rating (if rated)

**Rating System:**
- 5-star rating interface
- Visual star selection (★)
- Star buttons change color when selected
- Submit button for each store
- Loading state during submission
- Success message after submission
- Auto-refresh after rating submission

**User Experience:**
- Loading state on initial load
- Error messages with red background
- Success messages with green background
- "No stores found" message when empty
- Responsive card layout
- Pagination for large store lists

**API Integration:**
```
GET /auth/stores?page=1&limit=10&search=&sortBy=name&sortOrder=asc
Response: { stores: [], pagination: { page, limit, total, pages } }

POST /auth/stores/:storeId/ratings
Body: { rating: 1-5 }
Response: { rating: { id, storeId, rating, createdAt, updatedAt } }
```

### 3. Updated Dashboard (`src/pages/Dashboard.jsx`)

**Features:**
- Role-aware navigation
- Links to specific pages:
  - **Admin**: "Go to Admin Dashboard" → /admin
  - **User**: "Browse Stores" → /stores
  - **Store Owner**: "Go to Store Owner Dashboard" → /store-owner
- Styled buttons matching role colors

**User Experience:**
- Quick navigation from dashboard
- Clear call-to-action buttons
- Role-specific guidance

### 4. Routing Updates

**New Routes Added:**
```
/stores                    → UserStores (USER role required)
```

**Route Protection:**
- UserStores uses ProtectedRoute with requiredRole="USER"
- Redirect to /unauthorized if insufficient role
- Redirect to /login if not authenticated

### 5. Store Display Information

**Each Store Card Shows:**
- Store Name (heading)
- Email address (gray text)
- Physical address (gray text)
- Average rating in large yellow text
- Number of ratings received
- User's current rating (green badge if rated)
- Star rating interface
- Submit button

**Visual Hierarchy:**
- Name most prominent (large, bold)
- Contact info secondary (smaller, gray)
- Rating stats in highlighted box
- User rating action area at bottom

### 6. Rating Submission Flow

**Star Selection:**
```
1. User hovers/clicks star (1-5)
2. Selected stars highlight in yellow
3. Click submit button
4. Rating sent to backend
5. Success message displayed
6. Store list refreshes
7. User's rating now shown on card
```

**Submit Process:**
```
1. User clicks star (1-5)
2. User clicks "Submit Rating"
3. Validate rating (1-5)
4. Show loading state
5. POST /auth/stores/:storeId/ratings
6. On success:
   - Show "Rating submitted successfully!"
   - Refresh store list
   - Clear success message
7. On failure:
   - Show error message
   - Keep rating selected
```

### 7. Search & Filter Implementation

**Search:**
- Real-time text input
- Search by store name or address
- Partial matching
- Case-insensitive

**Sort Options:**
- By Name (A-Z)
- By Rating (high to low or vice versa)
- By Newest (most recent first)

**Order:**
- Ascending
- Descending

**Behavior:**
- Filter changes reset to page 1
- Filters persist while paginating
- Immediate API call on filter change

### 8. Pagination

**Features:**
- Shows current page number
- Links to all available pages
- Active page highlighted in blue
- Default 10 stores per page
- Only shows if more than 1 page
- Centered pagination buttons

### 9. State Management

**Stores State:**
```javascript
{
  stores: [],                    // Array of store objects
  pagination: {                  // Pagination info
    page: number
    limit: number
    total: number
    pages: number
  }
  loading: boolean               // Initial load state
  error: string                  // List error
  filters: {                     // Filter options
    search: string
    sortBy: string
    sortOrder: string
  }
  ratingForm: {                  // Rating submission
    storeId: string|null
    rating: 1-5
  }
  ratingError: string           // Rating submission error
  ratingSuccess: string         // Rating success message
  ratingLoading: boolean        // Rating submission state
}
```

### 10. Store Object Structure

```javascript
{
  id: string
  name: string
  email: string
  address: string
  averageRating: number|null     // Average rating (null if no ratings)
  totalRatings: number           // Count of ratings
  userRating: number|null        // User's rating on this store (null if not rated)
}
```

### 11. Error Handling

**Error Scenarios:**
1. Network error loading stores → "Failed to fetch stores"
2. Invalid rating (< 1 or > 5) → "Rating must be between 1 and 5"
3. API error on rating → Display backend error message
4. No stores match filters → "No stores found"

**Error Display:**
- Red (#f8d7da) background
- Dark red (#721c24) text
- Below all stores
- Dismissible via retry/refresh

### 12. Success Feedback

**Rating Submission Success:**
- Green (#d4edda) background
- Green (#155724) text
- Message: "Rating submitted successfully!"
- Auto-clears after 1 second
- List refreshes with updated data

### 13. Responsive Design

**Breakpoints:**
- Desktop: 3+ columns (350px min per card)
- Tablet: 2 columns
- Mobile: 1 column
- Filters stack on mobile

**Card Responsiveness:**
- Flexible grid layout
- Cards grow/shrink to fit
- All content visible on mobile
- Touch-friendly star buttons

### 14. Accessibility Features

✓ Form labels for all inputs
✓ Clear button states
✓ Error messages linked to actions
✓ Color contrast meets standards
✓ Keyboard navigation support
✓ Semantic HTML structure

### 15. Styling

**Color Scheme:**
- Primary: #007bff (blue)
- Success: #28a745 (green)
- Warning: #ffc107 (yellow - ratings)
- Error: #dc3545 (red)
- Background: #f8f9fa (light gray)
- Text: #333 (dark)
- Secondary: #666 (gray)

**Typography:**
- Headers: Bold, larger sizes
- Body: Regular weight
- Labels: Medium weight
- Help text: Smaller, gray

### 16. Filter Examples

**Search:**
```
"coffee" → Finds "Coffee Shop" and "Coffee House"
"main street" → Finds stores on Main Street
```

**Sort:**
```
Sort by: Name, Order: asc → A to Z
Sort by: Rating, Order: desc → Highest rated first
Sort by: Newest, Order: desc → Most recent first
```

### 17. Rating Examples

**User Interaction:**
```
1. Browse stores → See all stores with ratings
2. Click star 4 in card
3. See 4 stars highlighted
4. Click "Submit Rating"
5. See "Rating submitted successfully!"
6. See card updated with user's rating
7. Star 4 now shown as "Your rating: ⭐ 4"
```

## How User Stores Work

### Initial Load
```
1. User navigates to /stores
2. ProtectedRoute checks: USER role?
   - No → Redirect to /unauthorized
   - Yes → Load UserStores
3. Component mounts
4. Fetch stores (page 1, default sort)
5. Show loading spinner
6. Display stores grid
```

### Filter Flow
```
1. User enters search text
2. Debounce timer (optional, not implemented)
3. Reset pagination to page 1
4. Fetch stores with new filters
5. Update stores display
6. Show pagination
```

### Rating Submission
```
1. User clicks star (e.g., 4)
2. ratingForm updates: { storeId: "...", rating: 4 }
3. Stars highlight to rating level
4. User clicks "Submit Rating"
5. Validate rating (1-5)
6. Show loading state
7. POST /auth/stores/:id/ratings { rating: 4 }
8. Backend upserts rating (creates or updates)
9. Response includes updated rating
10. Show success message
11. Refresh store list
12. User's rating now visible on card
```

### Pagination
```
1. Stores loaded with pagination info
2. If pages > 1, show page buttons
3. User clicks page 2
4. Reset to new page
5. Fetch stores with new page number
6. Maintain filters and sort
7. Update display
```

## API Endpoints Used

### Stores List
```
GET /auth/stores?page=1&limit=10&sortBy=name&sortOrder=asc&search=
Response: {
  success: true,
  data: {
    stores: [
      {
        id, name, email, address,
        averageRating, totalRatings, userRating
      }
    ],
    pagination: { page, limit, total, pages }
  }
}
```

### Submit Rating
```
POST /auth/stores/:storeId/ratings
Body: { rating: 4 }
Response: {
  success: true,
  data: {
    rating: {
      id, storeId, userId, rating, createdAt, updatedAt
    }
  }
}
```

## Testing User Pages

### Test Store Browsing
```
1. Login as regular user
2. Go to /dashboard
3. Click "Browse Stores"
4. Should see store cards in grid
5. Each card shows store info
6. Average rating visible
7. Submit button present
```

### Test Search
```
1. Type in search box
2. Results filter immediately
3. Page 1 resets
4. Relevant stores shown
5. Empty results show "No stores found"
```

### Test Filtering
```
1. Change sort dropdown
2. Stores reorder immediately
3. Change order dropdown
4. Reorder direction changes
5. Combination filters work
```

### Test Rating
```
1. Click star (e.g., 3)
2. See 3 stars highlighted
3. Click "Submit Rating"
4. Loading state shows
5. Success message appears
6. Store card refreshes
7. User's rating shown
```

## Completeness Checklist

✓ User stores list page created
✓ Store cards display with all info
✓ Search functionality working
✓ Sort/filter working
✓ Pagination implemented
✓ 5-star rating interface
✓ Rating submission with validation
✓ Success/error messages
✓ Loading states
✓ Responsive design
✓ Pagination working
✓ Auto-refresh after rating
✓ User role protection

## Ready for Next Tasks

User store pages complete with:
- ✓ Store browsing with search/filter/sort
- ✓ Pagination for large store lists
- ✓ 5-star rating interface
- ✓ Rating submission (upsert)
- ✓ Success/error handling
- ✓ Responsive design
- ✓ Role-based access control

Next: Task 13 - Build Store Owner Dashboard
