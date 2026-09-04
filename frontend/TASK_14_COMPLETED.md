# Task 14 Completed: Input Validation and Error Handling (Frontend)

## Frontend Validation & Error Handling Summary

### 1. Validation Utilities (`src/utils/validation.js`)

**Email Validation:**
```javascript
validateEmail(email)
// Rules:
// - Required
// - Must contain @
// - Must have domain
// Returns: { valid: boolean, error?: string }
```

**Password Validation:**
```javascript
validatePassword(password)
// Rules:
// - 8-16 characters
// - At least 1 uppercase letter (A-Z)
// - At least 1 special character (!@#$%^&*)
// Returns: { valid: boolean, error?: string }
```

**Name Validation:**
```javascript
validateName(name)
// Rules:
// - 2-60 characters
// Returns: { valid: boolean, error?: string }
```

**Password Match:**
```javascript
validatePasswordsMatch(password, confirmPassword)
// Rules:
// - Passwords must match exactly
// Returns: { valid: boolean, error?: string }
```

**Form-Level Validators:**
```javascript
validateLoginForm(email, password)
validateSignupForm(name, email, password, confirmPassword)
```

### 2. Auth Context Error Handling (`src/context/AuthContext.jsx`)

**Features:**
- `login()` method handles API errors
- `signup()` method handles API errors
- `logout()` method handles errors
- `updatePassword()` method handles errors
- `getProfile()` method handles errors
- Error state: `error` (string)
- `setError()` method for manual errors

**Error Handling Pattern:**
```javascript
const login = async (email, password) => {
  try {
    setError(null);
    const response = await axios.post('/auth/login', { email, password });
    
    if (response.data.success) {
      setUser(response.data.data.user);
      return { success: true, data: response.data.data };
    }
  } catch (err) {
    const message = err.response?.data?.error?.message || 'Login failed';
    setError(message);
    return { success: false, error: message };
  }
};
```

### 3. Form Component Error Handling

**Login Form (`src/pages/Login.jsx`):**
- Email field validation
- Password field validation
- Real-time error clearing
- Form-level error display
- API error display
- Loading state management

**Signup Form (`src/pages/Signup.jsx`):**
- Name field validation
- Email field validation
- Password field validation
- Confirm password validation
- Real-time error clearing
- Form-level error display
- API error display
- Success message with redirect

**Pattern:**
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Clear error when user types
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate
  const validation = validateForm();
  if (!validation.valid) {
    setErrors(...);
    return;
  }
  
  // Submit
  setLoading(true);
  const result = await authMethod();
  
  if (result.success) {
    // Success handling
  } else {
    setApiError(result.error);
  }
  
  setLoading(false);
};
```

### 4. Admin Form Validation

**Admin Stores Form:**
- Store name: 20-60 characters
- Store email: valid format
- Address: max 400 characters
- Owner ID: required

**Admin Users Form:**
- Name: 2-60 characters
- Email: valid format
- Password: strength requirements
- Role: dropdown validation

**Features:**
- Field-level validation
- Real-time error clearing
- Form-level validation before submit
- API error handling
- Success/error message display
- Delete confirmation
- Loading states

### 5. User Store Page Validation

**UserStores Component (`src/pages/UserStores.jsx`):**
- Search input: no validation (any text allowed)
- Sort/Order dropdowns: pre-validated values
- Rating submission: 1-5 validation
- Pagination: validated page numbers

**Rating Validation:**
```javascript
const handleRatingSubmit = async (storeId, rating) => {
  if (!rating || rating < 1 || rating > 5) {
    setRatingError('Rating must be between 1 and 5');
    return;
  }
  
  setRatingLoading(true);
  const result = await userService.submitRating(storeId, rating);
  
  if (result.success) {
    setRatingSuccess('Rating submitted successfully!');
    fetchStores();
  } else {
    setRatingError(result.error);
  }
  
  setRatingLoading(false);
};
```

### 6. API Service Error Handling

**Admin Service (`src/services/adminService.js`):**
```javascript
getDashboard: async () => {
  try {
    const response = await axios.get('/admin/dashboard');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || 'Failed to fetch dashboard'
    };
  }
}
```

**User Service (`src/services/userService.js`):**
- getStores: with pagination/sorting validation
- submitRating: validates rating 1-5
- getProfile: error handling

**Store Owner Service (`src/services/storeOwnerService.js`):**
- getDashboard: error handling
- getRatings: pagination validation
- getStatistics: error handling
- getStore: error handling

**Pattern:**
- Try-catch wrapper
- Extract error message from backend
- Fallback to generic error
- Consistent return format: `{ success, data?, error? }`

### 7. Component-Level Error State

**Pattern:**
```javascript
const [error, setError] = useState('');
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
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
- Separate state for each concern
- Error cleared before new request
- Loading state management
- Retry capability

### 8. Error Display Components

**Error Message Block:**
```javascript
{error && (
  <div style={{
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb'
  }}>
    {error}
  </div>
)}
```

**Success Message Block:**
```javascript
{success && (
  <div style={{
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #c3e6cb'
  }}>
    {success}
  </div>
)}
```

**Loading Component:**
```javascript
{loading && <Loading message="Loading..." />}
```

### 9. Protected Route Error Handling

**ProtectedRoute (`src/components/ProtectedRoute.jsx`):**
- Shows loading spinner during auth check
- Redirects to /login if not authenticated
- Redirects to /unauthorized if wrong role
- Handles loading state gracefully

**Error Scenarios Handled:**
1. Not authenticated → Redirect to /login
2. Wrong role → Redirect to /unauthorized
3. Loading → Show spinner
4. Valid access → Render component

### 10. Validation & Error Handling Checklist

**Forms:**
✓ Login form validation
✓ Signup form validation
✓ Admin store form validation
✓ Admin user form validation
✓ Real-time error clearing
✓ Field-level error messages
✓ Form-level error messages
✓ API error handling
✓ Success message display
✓ Loading state display

**Routing:**
✓ Auth protection working
✓ Role-based access control
✓ Redirect on unauthorized
✓ Loading during auth check

**Data Display:**
✓ Error state management
✓ Loading state management
✓ Success state management
✓ Retry capability
✓ Empty state handling
✓ Error messages display

**Validation Rules:**
✓ Email format validation
✓ Password strength validation
✓ Name length validation
✓ Rating range validation (1-5)
✓ Store name length (20-60)
✓ Address length (max 400)

### 11. Error Message Examples

**Email Error:**
```
"Invalid email format"
```

**Password Error:**
```
"Password must contain at least 1 uppercase letter"
"Password must contain at least 1 special character"
"Password must be 8-16 characters"
```

**Name Error:**
```
"Name must be at least 2 characters"
"Name must be at most 60 characters"
```

**Rating Error:**
```
"Rating must be between 1 and 5"
```

**API Error:**
```
"Failed to fetch stores"
"Failed to create store"
"Invalid email or password"
```

### 12. User Experience Features

**Real-Time Feedback:**
- Errors show/clear instantly
- Validation happens on change
- Loading indicators
- Success messages
- Retry buttons

**Clear Error Messages:**
- Non-technical language
- Specific to problem
- Actionable (what to fix)
- No stack traces

**Graceful Degradation:**
- Network errors handled
- API errors recovered
- Retry capability
- Form data preserved

### 13. Accessibility Features

✓ Error messages linked to fields
✓ Clear button states (disabled during loading)
✓ Color contrast in error messages
✓ Semantic HTML
✓ Keyboard navigation
✓ Focus states

### 14. Validation Examples

**Valid Inputs:**
```
Email: user@example.com
Password: SecurePass1!
Name: John Doe
Rating: 4
Store Name: My Great Store Here
```

**Invalid Inputs:**
```
Email: notanemail (no @)
Email: @domain.com (no prefix)
Password: short (too short)
Password: NoSpecial1 (no special char)
Password: nosuppercase1! (no uppercase)
Name: Jo (too short)
Name: <very long name...> (max 60)
Rating: 0 (below 1)
Rating: 6 (above 5)
```

### 15. Testing Validation

**Manual Testing:**
```
1. Go to /login
2. Try empty fields → See "Email is required"
3. Try invalid email → See "Invalid email format"
4. Try valid email, no password → See "Password is required"
5. Try valid email, wrong password → See backend error
6. Try valid credentials → Login succeeds

1. Go to /signup
2. Try weak password → See specific requirement error
3. Try non-matching passwords → See "Passwords do not match"
4. Try all valid → Signup succeeds, redirect to login
```

---

## Complete Validation Flow

### Signup Flow:
```
User fills form
    ↓
User clicks "Sign Up"
    ↓
Frontend validates:
- Name 2-60 chars? 
- Valid email?
- Password 8-16, 1 upper, 1 special?
- Passwords match?
    ↓
If invalid → Show field errors, stop
    ↓
If valid → POST /auth/signup
    ↓
Backend validates:
- Name 2-60 chars?
- Valid email?
- Email unique?
- Password strength?
    ↓
If invalid → Return error
    ↓
If valid → Hash password, create user
    ↓
Frontend shows success message
    ↓
Redirect to /login after 2 seconds
```

### Rating Flow:
```
User clicks rating star
    ↓
Rating number updates (1-5)
    ↓
User clicks "Submit Rating"
    ↓
Frontend validates: 1-5?
    ↓
If invalid → Show error
    ↓
If valid → POST /auth/stores/:id/ratings
    ↓
Backend validates: 1-5?
    ↓
If invalid → Return error
    ↓
If valid → Create/update rating
    ↓
Frontend shows success
    ↓
Refresh store list
```

---

## Completeness Checklist

✓ All input fields validated
✓ Error messages user-friendly
✓ Frontend validation working
✓ Backend validation working
✓ API error handling
✓ Form error states
✓ Field error states
✓ Loading states
✓ Success states
✓ Retry capability
✓ No sensitive data exposed
✓ Graceful error handling
✓ Responsive error display
✓ Accessible error messages

## Ready for Next Tasks

Frontend validation complete:
- ✓ All forms validated
- ✓ All API errors handled
- ✓ User-friendly error messages
- ✓ Consistent error display
- ✓ Real-time feedback
- ✓ Retry capability

Next: Task 15 - Set Up Seed Script and Environment Configuration
