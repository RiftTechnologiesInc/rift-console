# Rift Console

Internal admin UI for visualizing Salesforce data via the Rift backend integration system. Provides real-time visibility into clients, integrations, and system activity synced from Salesforce.

## Architecture

```
Salesforce Org
    ↓ OAuth + Webhooks
[rift-integrations] Backend API
    ↓ Stores tokens & queries Salesforce
Supabase (salesforce_tenants, salesforce_clients)
    ↑ Frontend queries backend API
[rift-console] Next.js UI (this repo)
```

## Features

- 🔐 Secure authentication via Supabase
- 🔗 OAuth flow to connect Salesforce orgs
- 📊 Dashboard with live client counts and metrics
- 🧑‍💼 Client portfolio synced from Salesforce
- 📋 Activity log and audit trail
- 🏢 Multi-tenant support (multiple Salesforce orgs)
- ⚡ Real-time data from Salesforce via backend API

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Fastify API ([rift-integrations](https://github.com/RiftTechnologiesInc/rift-integrations))
- **Database:** Supabase
- **CRM:** Salesforce (via OAuth + REST API)

## Prerequisites

1. **Backend API** - Clone and set up [rift-integrations](https://github.com/RiftTechnologiesInc/rift-integrations)
2. **Supabase Account** - Project with database tables
3. **Node.js 18+** - For running Next.js
4. **Ngrok** - For OAuth callback URL (development)
5. **Salesforce Connected App** - OAuth credentials

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:3001
```

### 3. Start Backend API

In your `rift-integrations` directory:

```bash
# Terminal 1: Start backend on port 3001
npm run api:dev

# Terminal 2: Start ngrok tunnel
ngrok http 3001
```

### 4. Start Frontend

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Connect Salesforce

1. Log in with Supabase credentials
2. Click **"Connect Salesforce"** in sidebar
3. Enter a unique tenant ID (e.g., `acme-financial`)
4. Complete OAuth flow
5. View your Salesforce data in the dashboard!

## Detailed Setup

### Database Setup

The backend creates these tables:
- `salesforce_tenants` - OAuth tokens per org
- `salesforce_clients` - Synced Salesforce accounts
- `salesforce_service_requests` - Synced cases

### Create Admin User

In Supabase Authentication:
1. Go to **Authentication** → **Users**
2. Add user: `admin@riftira.com` / `password123`

### Backend Configuration

See [rift-integrations README](https://github.com/RiftTechnologiesInc/rift-integrations#readme) for:
- Creating Salesforce Connected App
- Setting up OAuth credentials
- Configuring webhooks
- Encryption keys

## How It Works

### OAuth Connection Flow

1. User clicks "Connect Salesforce" → enters tenant ID
2. Frontend redirects to `backend_url/oauth/salesforce/start?tenantId=X`
3. Backend redirects to Salesforce for authorization
4. User logs in to Salesforce and approves
5. Salesforce redirects to ngrok URL → backend callback
6. Backend exchanges code for tokens → stores encrypted in Supabase
7. Connection complete! ✅

### Data Flow

```
Frontend (localhost:3000)
    ↓ HTTP GET /clients
    ↓ Headers: x-api-key, x-tenant-id
Backend API (localhost:3001)
    ↓ Loads OAuth tokens from Supabase
    ↓ Queries Salesforce REST API
Salesforce
    ↓ Returns account data
Backend
    ↓ Transforms & returns JSON
Frontend
    ↓ Displays in UI
```

### Multi-Tenant Architecture

Each Salesforce org is a "tenant":
- Identified by unique `tenant_id` (UUID or slug)
- Has own OAuth credentials in `salesforce_tenants`
- Data filtered by `tenant_id` in all queries
- API calls include `x-tenant-id` header

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Authentication |
| `/dashboard` | Metrics (client count, last sync) |
| `/clients` | List of Salesforce accounts (live) |
| `/clients/[id]` | Account detail view |
| `/connect-salesforce` | Initiate OAuth flow |
| `/integrations` | Connected Salesforce orgs |
| `/advisors` | Placeholder |
| `/activity` | Activity log |
| `/workflows` | Coming soon |
| `/settings` | Coming soon |

## Project Structure

```
rift-console/
├── app/
│   ├── (protected)/
│   │   ├── dashboard/          # Live metrics
│   │   ├── clients/            # Salesforce accounts
│   │   ├── connect-salesforce/ # OAuth initiation
│   │   ├── integrations/
│   │   └── layout.tsx          # Protected layout
│   ├── login/
│   └── page.tsx                # Redirects to dashboard
├── components/
│   ├── Sidebar.tsx
│   ├── Card.tsx
│   └── ...
└── lib/
    ├── supabase.ts
    ├── auth.ts
    └── utils.ts
```

## Development

### Running Tests

```bash
npm run type-check
```

### Building for Production

```bash
npm run build
npm start
```

### API Authentication

The frontend uses API key authentication:
```typescript
headers: {
  'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
  'x-tenant-id': currentTenantId
}
```

## Troubleshooting

### CORS Errors

**Symptom:** "Access to fetch blocked by CORS policy"

**Solution:** Backend has CORS enabled for `localhost:3000`. Ensure:
1. Backend is running on port 3001
2. `@fastify/cors` v9.x installed (compatible with Fastify 4.x)
3. Restart backend after code changes

### "No clients found"

**Symptom:** Dashboard shows 0 clients but data exists

**Solution:**
1. Check backend is running: `curl http://127.0.0.1:3001/health`
2. Verify OAuth completed: Check `salesforce_tenants` table
3. Ensure `tenant_id` in code matches connected tenant
4. Query backend directly: `curl http://127.0.0.1:3001/clients -H "x-tenant-id: YOUR_ID"`

### OAuth Callback Fails

**Symptom:** Redirects to error page after Salesforce login

**Solution:**
1. Verify ngrok is running on port 3001
2. Check backend `.env`: `SALESFORCE_OAUTH_REDIRECT_URI` matches ngrok URL
3. Ensure Salesforce Connected App callback URL matches
4. Check backend logs for errors

### Port Already in Use

**Symptom:** `EADDRINUSE: address already in use 127.0.0.1:3001`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill //F //PID <process_id>

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key
NEXT_PUBLIC_BACKEND_URL=           # Backend API URL (default: http://127.0.0.1:3001)
```

### Backend (rift-integrations/.env)

See backend repo for full configuration including:
- Salesforce OAuth credentials
- Encryption keys
- Supabase service role key

## Security

- ✅ OAuth tokens encrypted with AES-256-GCM
- ✅ API key authentication required
- ✅ CORS restricted to localhost:3000
- ✅ Supabase RLS policies
- ✅ HTTPS for OAuth (via ngrok in dev)

## Deployment

For production:
1. Use real domain instead of ngrok
2. Move API key to backend-only
3. Implement JWT auth between frontend/backend
4. Set up SSL/TLS certificates
5. Configure environment-specific CORS origins

## Future Enhancements

- [ ] Tenant selector (switch between orgs in UI)
- [ ] Store `tenant_id` in localStorage/session
- [ ] Service requests view (Salesforce Cases)
- [ ] Real-time sync status indicators
- [ ] Webhook activity visualization
- [ ] User management & permissions
- [ ] Settings for sync schedules

## Related Repositories

- **Backend:** [rift-integrations](https://github.com/RiftTechnologiesInc/rift-integrations)
- **Supabase:** [supabase.com](https://supabase.com)

## License

Internal use only.

## Support

For issues or questions, please contact the Rift development team.
