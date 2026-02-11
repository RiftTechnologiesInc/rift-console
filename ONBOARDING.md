# New Client Onboarding Guide

Simple steps to onboard a new firm to Rift.

---

## Step 1: Create Supabase User

In your Supabase dashboard:

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter:
   - Email: `contact@firm-name.com`
   - Password: Generate a secure password
4. Click **Create user**
5. Send credentials to the firm contact

---

## Step 2: Firm Logs Into Rift Console

The firm user:

1. Opens **http://localhost:3000** (or your production URL)
2. Logs in with the credentials you provided
3. Gets redirected to the Dashboard

---

## Step 3: Connect Salesforce

The firm user:

1. Clicks **"Connect Salesforce"** in the sidebar
2. Enters a unique **Tenant ID** (e.g., `acme-financial`)
   - This can be their firm slug or any unique identifier
   - This links their Rift account to their Salesforce org
3. Clicks **"Connect Salesforce"**
4. Gets redirected to Salesforce login
5. Logs into **their own Salesforce account**
6. Approves the OAuth connection
7. Gets redirected back to Rift Console

---

## Step 4: View Salesforce Data

After OAuth completes:

- Dashboard shows live client counts from Salesforce
- Clients page displays all Salesforce accounts
- Integrations page shows "Salesforce - Active"
- Data syncs automatically via backend API

---

## What Happens Behind the Scenes

1. **Supabase Auth**: User credentials stored in Supabase Authentication
2. **OAuth Flow**: When user connects Salesforce:
   - Backend redirects to Salesforce
   - User authorizes access to their Salesforce org
   - Salesforce returns OAuth tokens
   - Backend encrypts and stores tokens in `salesforce_tenants` table
3. **Data Display**:
   - Frontend queries backend API
   - Backend uses stored OAuth tokens to query Salesforce
   - Live Salesforce data displayed in Rift Console

---

## Multi-Tenant Architecture

Each firm is isolated:
- Unique `tenant_id` links Supabase user → Salesforce org
- OAuth tokens are encrypted per tenant
- Data queries are filtered by `tenant_id`
- No firm can see another firm's data

---

## Summary Checklist

- [ ] Create Supabase user for firm contact
- [ ] Send login credentials to firm
- [ ] Firm logs into Rift Console
- [ ] Firm clicks "Connect Salesforce"
- [ ] Firm enters unique tenant ID
- [ ] Firm authorizes Salesforce OAuth
- [ ] Firm sees their Salesforce data in Rift

---

**That's it!** Each new firm follows these same steps to get onboarded.
