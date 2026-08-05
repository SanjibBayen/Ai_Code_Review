# AI Code Review Backend

This backend provides authentication, project, review, history, and GitHub integration APIs for the AI Code Review application.

## Email OTP Authentication

The backend now supports email-based OTP authentication for:
- User registration verification (`/api/auth/verify-otp`)
- Resending verification OTP (`/api/auth/resend-otp`)
- Password login (`/api/auth/login`)
- Login OTP request (`/api/auth/login-otp`)
- Login OTP verification (`/api/auth/verify-login-otp`)

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password_or_app_password
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/github/callback
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat
```

## DeepSeek AI setup

The review service uses DeepSeek's OpenAI-compatible API. Add `DEEPSEEK_API_KEY` to the backend `.env` file (or keep an existing key under `API_SECRET_KEY`), then restart the backend. `DEEPSEEK_MODEL=deepseek-chat` is the default code-review model.

## GitHub OAuth setup

1. Create an OAuth App in [GitHub Developer Settings](https://github.com/settings/developers).
2. Set its Authorization callback URL to the exact `GITHUB_REDIRECT_URI` above.
3. Copy the client ID and client secret into your backend `.env` file.

Users can then select **Connect GitHub Account** in the application and authorize their own GitHub account. The app requests `read:user` and `repo` so it can list repositories and branches, including private repositories the user has permitted.

## Run

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm run dev
```
