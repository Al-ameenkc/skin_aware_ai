PetalSense AI — branded email templates for Supabase Auth

HOW TO USE
1. Open Supabase Dashboard → Authentication → Email Templates.
2. Select "Confirm signup" (and optionally "Magic link", "Reset password") and switch to the custom HTML editor if available.
3. Paste the contents of confirm_signup.html.

SUPABASE VARIABLES
- Go templates use {{ .ConfirmationURL }} for the confirm link.
- If your project shows different placeholders (e.g. {{ .SiteURL }}), replace using the hints in the Supabase template editor.

TIP
- Send a test signup after saving. Some clients strip rounded corners; the table layout keeps it readable everywhere.
