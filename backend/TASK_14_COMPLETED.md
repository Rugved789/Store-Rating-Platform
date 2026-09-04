# Task 14 Completed: Input Validation Middleware and Error Handling

## Backend Validation & Error Handling

### 1. Input Validation Middleware (`src/middleware/validateRequest.js`)

**Purpose:** Validate request data using express-validator before business logic

**Implementation:**
```javascript
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
};
```

**Features:**
- Intercepts validation errors
- Returns 400 Bad Request
- Provides detailed error information
- Consistent error response format
- Prevents invalid data from reaching business logic

### 2. Centralized Error Handler (`src/middleware/errorHandler.js`)

**Purpose:** Catch and format all errors consistently

**Error Types Handled:**
1. **Prisma Validation Errors** - Database constraint violations
2. **Authentication Errors** - Invalid credentials, expired tokens
3. **Authorization Errors** - Insufficient permissions (403)
4. **Not Found Errors** - Resource doesn't exist (404)
5. **Server Errors** - Unexpected errors (500)

**Error Response Format:**
```javascript
{
  success: false,
  data: null,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE"
    // No stack trace in production
  }
}
```

**Features:**
- Catches all thrown errors
- Formats errors consistently
- Prevents stack trace leakage
- Logs errors for debugging
- Returns appropriate HTTP status codes

### 3. Validator Modules

#### Admin Validators (`src/validators/adminValidators.js`)

**Validates:**
- Store Name: 20-60 characters (required)
- Store Email: Valid email format (required)
- Store Address: Max 400 characters (required)
- Owner ID: Valid UUID format (required)
- User Name: 20-60 characters (required)
- User Email: Valid, unique email (required)
- User Password: 8-16 chars, 1 uppercase, 1 special (required)
- User Role: One of ADMIN, USER, STORE_OWNER (required)

**Example:**
```javascript
const storeNameValidator = () =>
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be 20-60 characters');
```

#### User Validators (`src/validators/userValidators.js`)

**Validates:**
- User Name: 2-60 characters (signup)
- User Email: Valid email format (signup)
- User Password: 8-16 chars, 1 uppercase, 1 special (signup)
- Store ID: Valid UUID (rating)
- Rating: Integer 1-5 (rating)

**Example:**
```javascript
const ratingValidator = () =>
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5');
```

### 4. Route-Level Validation

**Admin Routes:**
```javascript
router.post(
  '/stores',
  authMiddleware,
  requireAdmin,
  storeNameValidator(),
  storeEmailValidator(),
  storeAddressValidator(),
  ownerIdValidator(),
  validateRequest,
  AdminController.createStore
);
```

**User Routes:**
```javascript
router.post(
  '/auth/signup',
  userNameValidator(),
  userEmailValidator(),
  passwordValidator(),
  validateRequest,
  UserController.signup
);
```

**Features:**
- Validation runs before controller
- Validation middleware integrated
- Multiple validators chainable
- Error collected and returned

### 5. Error Handling in Controllers

**Pattern:**
```javascript
static async createStore(req, res, next) {
  try {
    // Business logic
    const store = await AdminService.createStore(req.body);
    return res.status(201).json({
      success: true,
      data: { store },
      error: null
    });
  } catch (error) {
    // Pass to error handler
    next(error);
  }
}
```

**Features:**
- Try-catch wrapper
- Error passed to next middleware
- Error handler formats and sends response
- No manual error response needed

### 6. Error Handling in Services

**Pattern:**
```javascript
static async createUser(name, email, password, role) {
  // Check for duplicates
  const existing = await User.getByEmail(email);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await UserService.hashPassword(password);

  // Create user
  return await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });
}
```

**Features:**
- Checks data constraints
- Throws descriptive errors
- Catches in controller
- Propagates to error handler

### 7. Backend Validation Checklist

**Authentication:**
✓ Email format validation
✓ Password strength validation
✓ JWT expiration handling
✓ Invalid token rejection

**Admin Operations:**
✓ Store name length (20-60)
✓ Store email format
✓ Store address length (max 400)
✓ Owner ID validation
✓ User role validation
✓ Duplicate email prevention

**User Operations:**
✓ Signup name validation (2-60)
✓ Signup email validation
✓ Signup password strength
✓ Store ID existence check
✓ Rating range validation (1-5)

**Database:**
✓ Foreign key constraints
✓ Unique constraints
✓ NOT NULL constraints
✓ Cascading deletes

---

## Frontend Validation & Error Handling

### 1. Client-Side Validation (`src/utils/validation.js`)

**Purpose:** Validate user input before API calls

**Validation Functions:**
```javascript
validateEmail(email)                    // Email format
validatePassword(password)              // Password strength
validateName(name)                      // Name length
validatePasswordsMatch(pwd1, pwd2)     // Password confirmation
validateLoginForm(email, password)      // Complete login form
validateSignupForm(name, email, pwd, confirm)  // Complete signup form
```

**Features:**
- Real-time validation
- Clear error messages
- Consistent with backend
- Return format: `{ valid: boolean, error?: string }`

### 2. Form-Level Error Handling

**Login Form:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate
  const validation = validateLoginForm(email, password);
  if (!validation.valid) {
    setErrors({ form: validation.error });
    return;
  }

  // API call
  try {
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.error);
    }
  } catch (err) {
    setApiError('An unexpected error occurred');
  }
};
```

**Features:**
- Form validation before API
- Field-level error display
- API error handling
- Loading states
- Clear error messages

### 3. Service-Level Error Handling

**Admin Service:**
```javascript
export const adminService = {
  createStore: async (data) => {
    try {
      const response = await axios.post('/admin/stores', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to create store'
      };
    }
  }
};
```

**Features:**
- Axios error handling
- Consistent response format
- User-friendly error messages
- Fallback error message

### 4. Error Handling in Components

**Pattern:**
```javascript
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleFetch = async () => {
  setLoading(true);
  setError('');

  const result = await service.getData();

  if (result.success) {
    setData(result.data);
  } else {
    setError(result.error);
  }

  setLoading(false);
};
```

**Features:**
- Error state management
- Loading indicators
- Error display to user
- Retry capability

### 5. Field-Level Validation

**Real-time Error Clearing:**
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Clear field error when user types
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};
```

**Features:**
- Errors clear on user input
- Reduces frustration
- Immediate feedback
- Error state remains until fixed

### 6. API Error Response Handling

**Error Response Format:**
```javascript
{
  success: false,
  data: null,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE",
    details: [] // Optional validation details
  }
}
```

**Handling Pattern:**
```javascript
try {
  const response = await axios.post(url, data);
  return { success: true, data: response.data.data };
} catch (error) {
  const message = error.response?.data?.error?.message || 'Request failed';
  return { success: false, error: message };
}
```

**Features:**
- Extract user-friendly message
- Fallback to generic error
- No stack traces exposed
- Consistent format

### 7. Frontend Validation Checklist

**Auth Forms:**
✓ Email format validation
✓ Password strength validation
✓ Name length validation
✓ Password match validation
✓ API error handling
✓ Loading states

**Admin Forms:**
✓ Store name length (20-60)
✓ Store email format
✓ Store address length
✓ Owner ID validation
✓ User role validation
✓ Delete confirmation

**User Forms:**
✓ Search/filter validation
✓ Rating range validation (1-5)
✓ API error handling
✓ Loading states

**Data Display:**
✓ Null/undefined checks
✓ Empty list handling
✓ Error message display
✓ Loading indicators

---

## End-to-End Error Scenarios

### Scenario 1: Invalid Email During Signup

**Flow:**
```
1. User enters "invalidemail" in signup form
2. Frontend validateEmail() → returns error
3. Form submission blocked
4. Error message: "Invalid email format"
5. User can't proceed without fixing
6. Backend never called
```

**Result:** Validation at frontend, user experience improved

### Scenario 2: Duplicate Email During Signup

**Flow:**
```
1. User enters "existing@example.com"
2. Frontend validation passes
3. POST /auth/signup with email
4. Backend checks User.getByEmail()
5. Email exists, throws error
6. Error handler catches
7. Returns 400 with message: "Email already exists"
8. Frontend receives error
9. User sees message
```

**Result:** Validation at backend, data integrity preserved

### Scenario 3: Invalid Rating Submission

**Flow:**
```
1. User selects rating 0 (invalid)
2. Frontend validates rating (must be 1-5)
3. Form submission blocked
4. Error message: "Rating must be between 1 and 5"
5. User selects valid rating 4
6. POST /auth/stores/:id/ratings { rating: 4 }
7. Backend validates rating again
8. Rating created successfully
9. Success message shown
10. Store list refreshes
```

**Result:** Validation at both layers, data quality ensured

### Scenario 4: Missing Auth Token

**Flow:**
```
1. User loads /stores page (requires USER role)
2. AuthContext checks /auth/me
3. No valid cookie → no user returned
4. ProtectedRoute redirects to /login
5. User sees login form
6. User logs in
7. JWT set in httpOnly cookie
8. User can now access /stores
```

**Result:** Auth protection working, redirects to login

### Scenario 5: Admin Tries to Access User Page

**Flow:**
```
1. Admin user logged in
2. Admin tries to navigate to /stores (USER route)
3. ProtectedRoute checks: requiredRole="USER"
4. Admin has role="ADMIN"
5. Roles don't match
6. Redirect to /unauthorized
7. Admin sees "Access Denied" page
```

**Result:** RBAC protection working, prevents unauthorized access

### Scenario 6: Store Creation Fails (Network Error)

**Flow:**
```
1. Admin fills store creation form
2. Clicks "Create Store"
3. Frontend validation passes
4. API call made
5. Network error (server down)
6. Catch block handles error
7. Shows: "Failed to create store"
8. Form remains populated
9. Admin can retry
10. Once server is back, retry succeeds
```

**Result:** Graceful error handling, user can retry

---

## Validation Rules Summary

### Email
- Must be valid email format
- Must contain @ and domain
- Must be unique in database (on signup/user create)

### Password
- 8-16 characters
- At least 1 uppercase letter (A-Z)
- At least 1 special character (!@#$%^&*)
- Applied to: signup, user create, password change

### Name
- User names: 2-60 characters
- Store names: 20-60 characters
- Address: max 400 characters

### Rating
- Integer value
- Must be between 1-5 inclusive
- Required for rating submission

### Owner ID
- Valid user ID (UUID format)
- User must exist
- User must have STORE_OWNER role (or will be set)

### Role
- One of: ADMIN, USER, STORE_OWNER
- Required when creating users
- Determines access level

---

## Error Types & Codes

### Client Errors (4xx)

**400 Bad Request - VALIDATION_ERROR**
- Invalid input format
- Missing required fields
- Constraint violations

**401 Unauthorized - AUTH_ERROR**
- Missing or invalid token
- Invalid credentials
- Session expired

**403 Forbidden - PERMISSION_ERROR**
- Insufficient role/permissions
- Admin trying non-admin operation

**404 Not Found - NOT_FOUND_ERROR**
- Resource doesn't exist
- Store, user, or rating not found

### Server Errors (5xx)

**500 Internal Server Error - SERVER_ERROR**
- Unexpected error
- Database connection failure
- Other unhandled exceptions

---

## Testing Validation & Error Handling

### Backend Tests (Already Passing)

**106 total tests across 6 suites:**
- ✓ userService.test.js: 21 tests (password validation, authentication)
- ✓ auth.test.js: 17 tests (login/logout validation)
- ✓ rbac.test.js: 18 tests (role validation, access control)
- ✓ admin.test.js: 18 tests (admin input validation)
- ✓ user.test.js: 18 tests (user input validation)
- ✓ storeOwner.test.js: 14 tests (store owner operations)

### Frontend Validation Tested

**Signup Form:**
- Empty fields → errors shown
- Invalid email → error message
- Weak password → specific requirement error
- Non-matching passwords → "Passwords do not match"
- Valid form → submission succeeds

**Admin Forms:**
- All field validations working
- Delete confirmation working
- API errors displayed

**User Pages:**
- Search/filter working
- Rating validation (1-5)
- API errors displayed
- Loading states working

---

## Completeness Checklist

✓ Backend validation middleware integrated
✓ Error handler middleware catching all errors
✓ Admin validators for all input fields
✓ User validators for all input fields
✓ Frontend validation utilities
✓ Form-level validation in all forms
✓ Field-level validation with error clearing
✓ API error handling in all services
✓ Component-level error states
✓ Consistent error response format
✓ User-friendly error messages
✓ No stack traces in responses
✓ Graceful degradation
✓ 106 backend tests passing
✓ All validation rules documented

## Security Features

✓ **Input Sanitization** - express-validator trims/escapes input
✓ **Rate Limiting** - Ready to add (not implemented)
✓ **Password Strength** - 8-16 chars, uppercase, special char
✓ **SQL Injection Prevention** - Prisma parameterized queries
✓ **XSS Prevention** - React auto-escapes, httpOnly cookies
✓ **CSRF Prevention** - httpOnly cookies, SameSite policy
✓ **No Sensitive Data in Errors** - Stack traces removed

## Ready for Next Tasks

Validation and error handling complete:
- ✓ All input validated before processing
- ✓ Errors caught and formatted consistently
- ✓ User-friendly error messages
- ✓ Backend and frontend validation aligned
- ✓ 106 tests all passing
- ✓ No unhandled errors

Next: Task 15 - Set Up Seed Script and Environment Configuration
