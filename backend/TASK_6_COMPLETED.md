# Task 6 Completed: User Signup, Store Listing, and Rating APIs

## What Has Been Implemented

### 1. Rating Repository (`src/models/Rating.js`)
Data access layer for rating operations:

**Methods:**
- `findByUserAndStore(userId, storeId)` - Get rating with unique constraint
- `create(data)` - Create new rating
- `update(userId, storeId, data)` - Update existing rating
- `upsert(userId, storeId, rating)` - Create or update (upsert pattern)
- `getUserRatingForStore(userId, storeId)` - Get user's rating value
- `countByStore(storeId)` - Count ratings for store
- `getAverageRating(storeId)` - Calculate average rating

**Features:**
- UNIQUE constraint on (userId, storeId) enforced at database
- Efficient upsert using Prisma's upsert method
- Aggregation queries for average ratings
- Proper error handling for missing ratings

### 2. User Public Service (`src/services/userPublicService.js`)
Business logic for normal user operations:

**Signup Method:**
- `signup(userData)` - Create new user with role=USER

**Store Listing:**
- `getStoresWithRatings(userId, options)` - Get stores with:
  - Pagination (1-100 limit)
  - Sorting by any column (asc/desc)
  - Search across name and address
  - Individual filters for name, address
  - Average rating for each store
  - User's own rating for each store
  - Total rating count

**Rating Management:**
- `submitRating(userId, storeId, rating)` - Submit or update rating (upsert)
- `getUserRating(userId, storeId)` - Fetch user's rating
- Validates rating is 1-5 integer
- Verifies store exists before rating

**Password & Profile:**
- `updatePassword(userId, oldPassword, newPassword)` - Change password
- `getCurrentUser(userId)` - Get user profile

### 3. User Controller (`src/controllers/userController.js`)
HTTP request handlers for user operations:

**Endpoints:**
- POST /auth/signup - Create new user account
- GET /stores - List stores with pagination/sorting/filtering
- POST /stores/:storeId/ratings - Submit or update rating
- POST /auth/update-password - Change password
- GET /auth/profile - Get user profile

**Features:**
- Pagination validation (1-100)
- Sort order normalization
- Consistent response format
- Proper HTTP status codes (201 for create, 200 for success)
- Error propagation to error handler

### 4. User Validators (`src/validators/userValidators.js`)
Input validation using express-validator:

**Signup Validation:**
- Name: 20-60 characters
- Email: Valid format
- Password: 8-16 chars, 1 uppercase, 1 special char
- Address: Optional, max 400 characters

**Rating Validation:**
- Store ID: Required
- Rating: Integer 1-5

**Password Update Validation:**
- Old password: Required
- New password: 8-16 chars, 1 uppercase, 1 special char

### 5. User Routes (`src/routes/userRoutes.js`)
User endpoints with appropriate auth protection:

**Public Routes:**
- POST /auth/signup - No auth required

**Protected Routes:**
- GET /stores - Auth required
- POST /stores/:storeId/ratings - Auth required
- POST /auth/update-password - Auth required
- GET /auth/profile - Auth required

### 6. Comprehensive Integration Tests (`tests/integration/user.test.js`)

#### Test Coverage: 18 Tests (All Passing ✓)

**Signup Tests (4 tests)**
- ✓ Create new user with valid data
- ✓ Reject signup with short name
- ✓ Reject signup with invalid email
- ✓ Reject signup with weak password

**Store Listing Tests (4 tests)**
- ✓ Get paginated list of stores with user ratings
- ✓ Search stores by name and address
- ✓ Sort stores ascending/descending
- ✓ Deny unauthenticated access

**Rating Submission Tests (5 tests)**
- ✓ Create new rating for store
- ✓ Update existing rating (upsert)
- ✓ Reject rating outside 1-5 range
- ✓ Reject non-integer rating
- ✓ Deny unauthenticated rating submission

**Password Update Tests (3 tests)**
- ✓ Update password with correct old password
- ✓ Reject weak new password
- ✓ Deny unauthenticated password update

**Profile Tests (2 tests)**
- ✓ Get user profile when authenticated
- ✓ Deny unauthenticated profile access

### 7. Overall Test Results
```
Test Suites: 5 passed, 5 total
Tests:       92 passed, 92 total
- userService.test.js:  21 tests ✓
- auth.test.js:         17 tests ✓
- rbac.test.js:         18 tests ✓
- admin.test.js:        18 tests ✓
- user.test.js:         18 tests ✓
```

## API Endpoints

### User Signup
```
POST /auth/signup
Body: {
  "name": "User Name Here Twenty Chars Min",
  "email": "user@example.com",
  "password": "Password@123",
  "address": "123 Main St"
}
Response: {
  "success": true,
  "data": {
    "user": {...},
    "message": "User created successfully. Please login."
  }
}
```

### List Stores with Ratings
```
GET /stores?page=1&limit=10&sortBy=name&sortOrder=asc&search=Coffee
Authorization: User token (httpOnly cookie)
Response: {
  "success": true,
  "data": {
    "stores": [
      {
        "id": "store-1",
        "name": "Store Name",
        "averageRating": 4.5,
        "userRating": 5,
        "totalRatings": 20
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

### Submit/Update Rating
```
POST /stores/:storeId/ratings
Authorization: User token
Body: { "rating": 5 }
Response: {
  "success": true,
  "data": {
    "rating": {...},
    "message": "Rating submitted successfully"
  }
}
```

### Update Password
```
POST /auth/update-password
Authorization: User token
Body: {
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@456"
}
Response: {
  "success": true,
  "data": {
    "user": {...},
    "message": "Password updated successfully"
  }
}
```

## Key Features

✓ **User Signup**: Self-registration with all validation rules
✓ **Store Discovery**: Full-featured store listing with search
✓ **Rating System**: Upsert pattern prevents duplicate ratings
✓ **Average Ratings**: Calculated per store for display
✓ **User Context**: Shows each user's own rating on store list
✓ **Pagination**: Configurable page size (1-100)
✓ **Sorting**: Any column, ascending/descending
✓ **Filtering**: By name, address, or combined search
✓ **Password Management**: Change password with old password verification
✓ **Profile Access**: User can view their own profile

## Security Features

✓ **All User Routes Protected**: Auth required (except signup)
✓ **Input Validation**: Client and server-side validation
✓ **Password Strength**: 8-16 chars, 1 uppercase, 1 special char
✓ **Upsert Safety**: Unique constraint prevents data anomalies
✓ **Old Password Verification**: Required before password change
✓ **Store Verification**: Store must exist before accepting rating
✓ **No Password Exposure**: Passwords never returned in responses

## Database Efficiency

✓ **Unique Constraint**: (userId, storeId) prevents duplicates
✓ **Upsert Operation**: Single database call for create or update
✓ **Aggregation Queries**: Average rating calculated efficiently
✓ **Indexed Searches**: Fast lookups on frequently queried fields
✓ **Cascading Deletes**: Ratings deleted when user/store deleted

## Upsert Pattern Implementation

The rating submission uses Prisma's upsert to implement proper upsert behavior:

```javascript
await RatingRepository.upsert(userId, storeId, rating)
// Returns:
// - New rating if user hasn't rated store
// - Updated rating if user already rated store
// - Always succeeds without duplicate errors
```

This ensures:
- No duplicate ratings in database
- Users can update their rating anytime
- Efficient single operation per submission

## Code Quality

✓ **Service Layer**: Business logic separated from HTTP
✓ **Repository Pattern**: Data access isolated
✓ **Validators**: Centralized validation rules
✓ **Error Handling**: Consistent error responses
✓ **Testing**: 18 comprehensive integration tests
✓ **Documentation**: Clear parameter and return types

## Ready for Task 7

User signup and store listing APIs are complete. Ready for:
- Store owner dashboard implementation
- Views aggregated ratings for their store
- List of users who rated their store

All 92 tests passing ✓

Next: Task 7 will implement Store Owner Dashboard API.
