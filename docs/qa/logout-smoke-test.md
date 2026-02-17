# Manual QA: Logout Smoke Test

**User Story:** #32 Logout
**Branch:** U.S.-32-logout
**Tester:** Saud Alsaif
**Date:** 2026-02-17

---

## Pre-conditions
- App is running locally (`npm start`)
- A valid user account exists in the database
- User is logged in

---

## Test Cases

### TC-01: Logout button is visible in navbar when logged in
- **Steps:** Log in → observe navbar
- **Expected:** User's full name appears in top-right dropdown with a "Logout" option
- **Result:** PASS

### TC-02: Logout uses POST (CSRF protection)
- **Steps:** Inspect the logout button in DevTools → check form method
- **Expected:** Form method is `POST`, not a plain `<a>` link
- **Result:** PASS

### TC-03: Logout destroys session
- **Steps:** Click Logout → open DevTools → Application → Cookies
- **Expected:** `connect.sid` cookie is cleared
- **Result:** PASS

### TC-04: Logout redirects to login page with success message
- **Steps:** Click Logout
- **Expected:** Redirected to `/login?loggedOut=1` with green banner "You have been logged out successfully."
- **Result:** PASS

### TC-05: Accessing protected route after logout redirects to login
- **Steps:** Log out → manually navigate to `/dashboard`
- **Expected:** Redirected to `/login` with flash message "You must log in first"
- **Result:** PASS

### TC-06: Logout button is not visible when logged out
- **Steps:** Visit `/login` without a session
- **Expected:** Navbar shows Login and Register links only, no user dropdown
- **Result:** PASS

---

## Result: PASS
