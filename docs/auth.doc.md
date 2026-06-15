# Auth API Documentation

Base URL: `http://localhost:3000/auth`

All endpoints return JSON with the following error shape on failure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "error description",
  "timestamp": "2026-06-10T12:00:00.000Z"
}
```

---

## Register

Creates a new account.

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "isVerified": false,
    "createdAt": "2026-06-10T12:00:00.000Z"
  },
  "message": "Account created successfully",
  "status": 201
}
```

---

## Send Verify Code

Sends a new verification code to the user's email for email verification.

**Endpoint:** `POST /auth/send-verify-code`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response `200`:**

```json
{
  "message": "Verification code sent successfully"
}
```

---

## Verify Email

Verifies the account email with a confirmation code.

**Endpoint:** `POST /auth/verify-email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "isVerified": true
  },
  "message": "Account verified successfully",
  "status": 200
}
```

---

## Login

Authenticates a user and returns an access token. A httpOnly refresh token is set as a cookie (`refreshtoken`).

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response `200`:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs..."
  },
  "message": "Login successful"
}
```

**Cookies set:**

| Name           | Type     | HttpOnly | Secure | SameSite | MaxAge |
|----------------|----------|----------|--------|----------|--------|
| `refreshtoken` | httpOnly | true     | true   | strict   | 7 days |

---

## Refresh Token

Obtains a new access token using the refresh token cookie. The browser **must** send the `refreshtoken` cookie automatically.

**Endpoint:** `POST /auth/refresh`

**Request Body:** none

**Response `200`:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs..."
  },
  "message": "Refresh token successful"
}
```

---

## Logout

Clears the refresh token cookie on the server side.

**Endpoint:** `POST /auth/logout`

**Request Body:** none

**Response `200`:**

```json
{
  "message": "Logout successful"
}
```

---

## Change Password

Changes the account password. Requires the current password.

**Endpoint:** `POST /auth/change-password`

**Request Body:**

```json
{
  "email": "user@example.com",
  "oldPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response `200`:**

```json
{
  "message": "Password changed successfully"
}
```

---

## Send Reset Password Code

Sends a verification code to the user's email for password reset.

**Endpoint:** `POST /auth/send-reset-password-code`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response `200`:**

```json
{
  "message": "Reset password code sent successfully"
}
```

---

## Verify Reset Password

Verifies the reset password code.

**Endpoint:** `POST /auth/verify-reset-password`

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response `200`:**

```json
{
  "message": "Password reset verification successful"
}
```

---

## Reset Password

Resets the password after verification. Requires the reset token obtained from the verification step.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**

```json
{
  "email": "user@example.com",
  "resetToken": "token-from-verification",
  "password": "newPassword789"
}
```

**Response `200`:**

```json
{
  "message": "Password reset successfully"
}
```

---

## Summary

| Endpoint                       | Method | Auth Required | Cookies                    |
|--------------------------------|--------|---------------|----------------------------|
| `/auth/register`               | POST   | No            | —                          |
| `/auth/send-verify-code`       | POST   | No            | —                          |
| `/auth/verify-email`           | POST   | No            | —                          |
| `/auth/login`                  | POST   | No            | Sets `refreshtoken` cookie |
| `/auth/refresh`                | POST   | No            | Reads `refreshtoken`       |
| `/auth/logout`                 | POST   | No            | Clears `refreshtoken`      |
| `/auth/change-password`        | POST   | No            | —                          |
| `/auth/send-reset-password-code` | POST | No            | —                          |
| `/auth/verify-reset-password`  | POST   | No            | —                          |
| `/auth/reset-password`         | POST   | No            | —                          |
