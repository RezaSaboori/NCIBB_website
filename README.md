# NCIBB - Professional User Management System

A comprehensive Django + React user management system with JWT authentication, role-based permissions, and modern dashboard architecture.

## 🚀 Features

### Backend (Django + DRF)
- **JWT Authentication** with automatic token refresh
- **Role-based permissions** (Admin, Manager, User, Guest)
- **Custom User Model** with profiles and verification
- **Credits System** with transaction tracking
- **Project Management** with collaboration features
- **Messaging System** with notifications
- **REST API** with comprehensive endpoints
- **Admin Panel** for user management

### Frontend (React + Material-UI)
- **Responsive Dashboard** with Material-UI components
- **Role-based UI rendering** based on user permissions
- **Real-time data updates** with React hooks
- **Professional admin panel** for user management
- **Credit tracking and transaction history**
- **Project collaboration interface**
- **Inbox messaging system**

## 🛠️ Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- JWT Authentication (djangorestframework-simplejwt)
- PostgreSQL (production) / SQLite (development)
- Celery + Redis (background tasks)
- CORS headers for cross-origin requests

### Frontend
- React 19.1.1
- Vite (build tool)
- Material-UI 7.3.2
- Redux Toolkit 2.9.0
- React Router DOM 7.8.2
- Axios for API calls
- React Hook Form + Yup validation

## 📁 Project Structure

```
NCIBB/
├── backend/
│   ├── authentication/          # User authentication & profiles
│   ├── credits/                 # Credits system & transactions
│   ├── projects/                # Project management
│   ├── messaging/               # User messaging system
│   ├── core/                    # Core utilities & admin stats
│   └── ncibb/                   # Django settings
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   ├── auth/           # Authentication forms
│   │   │   ├── admin/          # Admin components
│   │   │   └── common/         # Shared components
│   │   ├── services/           # API services
│   │   ├── store/              # Redux store
│   │   └── pages/              # Page components
│   └── public/
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 20.19+ or 22.12+. The repository pins Node 22.19.0 in `.nvmrc`.
- PostgreSQL (for production)
- Redis (for background tasks)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NCIBB
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv .venv
   .venv/bin/python -m pip install -r requirements.txt
   
   # Run migrations
   .venv/bin/python manage.py migrate
   
   # Create superuser
   .venv/bin/python manage.py createsuperuser
   
   # Start development server
   .venv/bin/python manage.py runserver
   ```
   Django starts on `127.0.0.1:8317` by default. Keep it running while using Vite. Local `manage.py` commands started with an incompatible Django version retry using `backend/.venv` when it exists.

3. **Frontend Setup** (in a second terminal, from the repository root)
   ```bash
   # Select the version in .nvmrc with your Node version manager.
   nvm use
   cd frontend
   
   # Install dependencies
   npm ci
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Backend API: http://localhost:8317/api/
   - Frontend: http://localhost:5173
   - Admin Panel: http://localhost:8317/admin/

### Docker Setup

1. **Using Docker Compose**
   ```bash
   # Start all services
   docker-compose up --build
   
   # Run migrations
   docker-compose exec backend python manage.py migrate
   
   # Create superuser
   docker-compose exec backend python manage.py createsuperuser
   ```

2. **Access the application**
   - Backend API: http://localhost:8317/api/
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:8317/admin/

## 🔐 Authentication

### Default Admin Account
- **Username**: admin
- **Email**: admin@ncibb.com
- **Password**: (set during superuser creation)

### User Roles
- **Admin**: Full system access, user management
- **Manager**: Project management, user oversight
- **User**: Standard user access
- **Guest**: Limited access

## 📚 API Endpoints

### Accounts and access

Use a Bearer access token for these endpoints unless marked public. List endpoints with pagination return `count`, `results`, `next`, and `previous`. A missing or expired session returns `401`. A disallowed operation returns `403`, and a conversation outside the caller’s audience returns `404`.

| Method and path | Request and result |
| --- | --- |
| `POST /api/auth/register/`, `POST /api/auth/login/` | Public. Existing registration or login credentials return the user and access and refresh tokens. Registration always gives base-user access. |
| `GET/PATCH /api/auth/profile/me/` | Get the signed-in user and their roles, effective capabilities, and active group memberships. PATCH accepts editable account and profile fields and returns the complete profile. |
| `POST /api/auth/email-verification/` | Request a link for the current address. Returns `204`; repeat requests can return `429`. |
| `POST /api/auth/email-verification/confirm/` | Public. Accepts `token` and returns `204` on confirmation. Invalid or expired links return `400`. |
| `GET /api/auth/users/`, `GET /api/auth/users/{id}/` | Platform admin. Search by name, username, or email and filter by `role` and `is_active`. Detail includes a wallet summary. |
| `PATCH /api/auth/users/{id}/access/` | Platform admin. Send `roles` as an array of platform role IDs, `is_active` as a boolean, or both. Returns the updated account. |
| `GET /api/auth/users/{id}/{projects,conversations,credits,audit}/` | Platform admin. Paginated related data. `GET /api/auth/users/{id}/conversations/{thread_id}/` returns messages and records the review. |
| `GET/POST /api/auth/roles/`, `PATCH /api/auth/roles/{id}/` | Platform admin. Create with `code`, `label`, `scope`, and `capabilities`. Only custom role labels and capabilities can be edited. Get assignable codes from `GET /api/auth/role-capabilities/`. |
| `GET/POST /api/auth/groups/`, `PATCH /api/auth/groups/{id}/` | List the caller’s active groups or all groups for a platform admin. Only platform admins write `name` and optional `parent`. |
| `GET /api/auth/groups/{id}/members/`, `PUT /api/auth/groups/{id}/members/{user_id}/` | Platform and group admins can list members in scope. Platform admins set group role IDs and `active`. |
| `PATCH /api/auth/groups/{id}/spending/{membership_id}/` | Platform or group admin in scope. Set `can_spend`; returns the updated membership. |
| `GET/POST /api/auth/groups/{id}/mentors/`, `DELETE /api/auth/groups/{id}/mentors/{link_id}/` | Platform admin. POST connects `professor` and `student` membership IDs in the same group. DELETE returns `204`. |
| `GET /api/auth/research-groups/` | Requires the registered research-groups capability. Returns the caller’s memberships and assigned contacts. |

### Beat Coin

| Method and path | Request and result |
| --- | --- |
| `GET /api/credits/` | Personal wallet with decimal-string balances, next Persian calendar reset, job price, and approved shared wallets. |
| `GET /api/credits/transactions/` | Paginated personal ledger. |
| `POST /api/auth/users/{id}/credits/` | Platform admin. A signed decimal-string `amount`, `reason`, and UUID `request_id` adjust permanent credits. Returns the ledger entry. Reuse a request ID when retrying the same adjustment. |
| `GET/POST /api/auth/groups/{id}/wallet/` | Platform and group admins in scope can read the shared balance and ledger. Platform admins can post adjustments with the same format. |
| `POST /api/credits/add/` | Legacy positive adjustment. Accepts the same reason and request ID plus `user_id`. |
| `POST /api/credits/spend/` | Returns `403` with `job_required`. Managed jobs spend through the server ledger. |

Insufficient funds, conflicting adjustment retries, and balance limits return `409`. The Datasaz worker integration uses `credits.services.reserve_job(job_id, user, group=...)` before queueing work and `finish_job(job_id, succeeded=..., reason=...)` at terminal state. Use a stable job ID across retries and wrap reservation and the persisted job transition in the same database transaction. Once the runner exists, dispatch after the reservation commits, then record a failed enqueue through the same release path.

### Messaging

| Method and path | Request and result |
| --- | --- |
| `GET /api/messaging/destinations/` | Returns permitted destinations and optional recipient and group IDs. Filter with `search`. |
| `GET/POST /api/messaging/threads/` | List the caller’s inbox, optionally filtered by `route`. Compose with `kind`, `subject`, `content`, and the required `recipient` and `group` for the selected destination. |
| `GET /api/messaging/threads/{id}/`, `GET/POST /api/messaging/threads/{id}/messages/` | Thread metadata or paginated messages, newest first. POST accepts `content` and returns the new message. |
| `POST /api/messaging/threads/{id}/read/` | Mark through the supplied message ID in `through`. Returns `204`. |
| `POST /api/messaging/threads/{id}/forward/` | Compose fields plus `message_ids`. Copies between one and ten selected messages into a new permitted conversation. |
| `POST /api/messaging/send/` or `POST /api/messaging/messages/` | Legacy recipient-ID send using the same routing rules. Returns the new thread. |

### Projects

The `/api/projects/` collection supports GET and POST. Use GET, PATCH, and DELETE on `/api/projects/{id}/`. The profile uses the owner-scoped `/api/datasaz/projects/` list for Datasaz projects.

## Production configuration and rollout

Set `NCIBB_ENV=production`, a private `SECRET_KEY`, comma-separated `ALLOWED_HOSTS`, `PUBLIC_SITE_URL`, and `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` in the service environment. Use a dedicated PostgreSQL database and database user. The Compose database uses PostgreSQL 16 for new development databases. For an existing older PostgreSQL volume, restore a backup into the upgraded instance. Set `TRUST_HTTPS_PROXY=1` only behind a proxy that strips and sets `X-Forwarded-Proto`. Serve the Vite build and media through that proxy, and route `/api/` and `/admin/` to Django. Configure SMTP using `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, and `DEFAULT_FROM_EMAIL`. Set `CACHE_URL` to a shared Redis instance in multi-worker deployments so rate limits have shared state.

| Server setting | Example value |
| --- | --- |
| `BEAT_COIN_PLATFORM_ALLOWANCES` | `{"user":{"starter":"5","monthly":"10"},"student":{"monthly":"20"}}` |
| `BEAT_COIN_GROUP_ALLOWANCES` | `{"42":{"student":{"starter":"3","monthly":"5"}}}` |
| `BEAT_COIN_EMAIL_REWARD` | `2.00` |
| `BEAT_COIN_JOB_PRICE` | `0` while Datasaz processing is a placeholder. Configure one positive fixed price when connecting the real worker. |

Back up the source database and rehearse the migration with a staging copy. Run `python manage.py migrate` and `python manage.py check --deploy` before serving production traffic. Verify the administrator roster and reconcile account, balance, project, and conversation counts. Active Django superusers provide initial administrator access. Use `python manage.py bootstrap_platform_admin --email <verified-account>` for each confirmed administrator who needs access. If the deployment previously used the default signing secret, provision a new secret and have users sign in again.

Schedule `python manage.py rollover_beat_coin` hourly. Wallet reads and new job reservations also reconcile overdue credits. Purchases require a future checkout integration.

## 🧪 Testing

### Backend Tests
```bash
python manage.py test authentication.tests.test_profile apps.user_management.tests credits
```

### Frontend production build
```bash
cd frontend
npm run build
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Django, React, and Material-UI**
