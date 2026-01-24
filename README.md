# Autumn Photo - Event Photography Management Platform

A comprehensive web application for managing event photography with AI-powered photo tagging, real-time notifications, and role-based access control.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Feature Implementation Details](#feature-implementation-details)
- [User Roles & Permissions](#user-roles--permissions)
- [Contributing](#contributing)

---

## 🎯 Overview

Autumn Photo is a full-stack event photography management platform designed for the Information Management Group (IMG). The platform enables seamless event creation, photo uploads, AI-powered tagging, person identification, and collaborative photo management with role-based permissions.

**Live Demo**: [https://mail.google.com/mail/u/0/#search/img?projector=1](https://mail.google.com/mail/u/0/#search/img?projector=1)

---

## ✨ Features

### Core Features

- **🎭 Event Management**: Create, edit, and manage events with cover photos, dates, and locations
- **📸 Photo Upload & Management**: Bulk photo uploads with automatic thumbnail and display generation
- **🤖 AI-Powered Tagging**: Automatic photo categorization using AI tags
- **👤 Person Recognition**: Tag people in photos with manual tagging support
- **🔍 Advanced Search**: Search photos by AI tags, tagged users, or event information
- **🔐 OAuth2 Authentication**: Integrated with Omniport (Channeli) for secure authentication
- **🔔 Real-time Notifications**: WebSocket-based notifications for photo uploads and tagging
- **🎨 Responsive UI**: Modern, gradient-based design with dark theme

### Role-Based Features

- **Admin Panel**: Complete CRUD operations for users and events
- **Event Coordinator Dashboard**: Edit and manage assigned events
- **Photographer Portal**: Upload and manage event photos
- **Public Gallery**: Browse public events and photos

---

## 🛠 Technology Stack

### Backend

- **Framework**: Django 6.0
- **API**: Django REST Framework (DRF)
- **Authentication**:
  - djangorestframework-simplejwt (JWT tokens)
  - Omniport OAuth2 integration
- **WebSockets**: Django Channels with Redis
- **Async Tasks**: Celery with Redis broker
- **Database**: SQLite (development), PostgreSQL-ready
- **Image Processing**: Pillow (thumbnails, watermarks, EXIF data)
- **CORS**: django-cors-headers

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Routing**: React Router v6

### Infrastructure

- **Cache & Message Broker**: Redis
- **Task Queue**: Celery
- **WebSocket Layer**: Channels with Redis channel layer

---

## 🏗 Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Vite + TS)   │
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────────────────────┐
│      Django Backend             │
│  ┌──────────────────────────┐  │
│  │   REST API (DRF)         │  │
│  ├──────────────────────────┤  │
│  │   WebSocket (Channels)   │  │
│  ├──────────────────────────┤  │
│  │   Celery Tasks           │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    │  Redis  │  (Cache + Message Broker)
    └─────────┘
```

### Application Modules

**Backend Apps**:

- `accounts`: User management, authentication, OAuth integration
- `events`: Event CRUD operations, coordinator management
- `photos`: Photo uploads, tagging, search functionality
- `notifications`: Real-time WebSocket notifications
- `adminpanel`: Admin-specific views and permissions
- `dashboard`: User dashboards and analytics

---

## 📦 Prerequisites

### System Requirements

- Python 3.10+
- Node.js 18+
- Redis Server
- Git

### Python Dependencies (See `requirements.txt`)

```
Django==6.0
djangorestframework
djangorestframework-simplejwt
django-cors-headers
channels
channels-redis
daphne
celery
redis
Pillow
requests
```

### Node Dependencies (See `frontend/autumn_photo_frontend/package.json`)

```
react
react-redux
@reduxjs/toolkit
axios
react-router-dom
tailwindcss
lucide-react
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd django
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
python -m venv myenv
myenv\Scripts\activate  # Windows
# or
source myenv/bin/activate  # Linux/Mac
```

#### Install Dependencies

```bash
cd autumn_photo_backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create `.env` file in `autumn_photo_backend/`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Omniport OAuth Settings
OMNIPORT_BASE_URL=https://channeli.in
OMNIPORT_CLIENT_ID=your-client-id
OMNIPORT_CLIENT_SECRET=your-client-secret
OMNIPORT_REDIRECT_URI=http://localhost:5173/auth/callback

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

#### Run Migrations

```bash
python manage.py migrate
```

#### Create Superuser

```bash
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
cd ../frontend/autumn_photo_frontend
npm install
```

#### Configure API Base URL

Update `src/services/axiosinstances.ts` if needed:

```typescript
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});
```

### 4. Redis Setup

#### Windows

Download and run Redis from [Redis Windows Release](https://github.com/microsoftarchive/redis/releases)

```bash
redis-server.exe
```

#### Linux/Mac

```bash
redis-server
```

---

## 🎮 Running the Application

### Start All Services (4 Terminals Required)

#### Terminal 1: Django Server

```bash
cd autumn_photo_backend
python manage.py runserver
```

Server runs on: `http://localhost:8000`

#### Terminal 2: Celery Worker

```bash
cd autumn_photo_backend
celery -A autumn_photo worker --loglevel=info --pool=solo
```

#### Terminal 3: Redis Server

```bash
redis-server.exe  # Windows
# or
redis-server  # Linux/Mac
```

#### Terminal 4: Frontend Dev Server

```bash
cd frontend/autumn_photo_frontend
npm run dev
```

App runs on: `http://localhost:5173`

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin
- **WebSocket**: ws://localhost:8000/ws/notifications/

---

## 📁 Project Structure

```
django/
├── autumn_photo_backend/          # Django Backend
│   ├── manage.py
│   ├── db.sqlite3
│   ├── requirements.txt
│   ├── autumn_photo/              # Main settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── wsgi.py
│   ├── accounts/                  # User & Auth
│   │   ├── models.py              # Custom User model
│   │   ├── views.py               # OAuth callbacks
│   │   ├── serializers.py
│   │   └── auth_backend.py
│   ├── events/                    # Event Management
│   │   ├── models.py              # Event model
│   │   ├── views.py               # CRUD APIs
│   │   ├── serializers.py
│   │   └── permissions.py
│   ├── photos/                    # Photo Management
│   │   ├── models.py              # Photo, PersonTag models
│   │   ├── views.py               # Upload, search APIs
│   │   ├── tasks.py               # Celery tasks
│   │   └── utils.py               # Image processing
│   ├── notifications/             # WebSocket Notifications
│   │   ├── consumers.py
│   │   ├── routing.py
│   │   └── models.py
│   ├── adminpanel/                # Admin Features
│   └── dashboard/                 # User Dashboards
├── frontend/
│   └── autumn_photo_frontend/     # React Frontend
│       ├── src/
│       │   ├── app/               # Redux store
│       │   ├── components/        # Reusable components
│       │   ├── pages/             # Page components
│       │   │   ├── events/        # Events & Photos
│       │   │   ├── admin/         # Admin Panel
│       │   │   └── dashboard/     # Dashboards
│       │   ├── services/          # API clients
│       │   └── utils/             # Helpers
│       ├── package.json
│       └── vite.config.ts
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login/` - Login with credentials
- `POST /api/auth/register/` - Register new user
- `GET /api/auth/omniport/` - OAuth redirect URL
- `POST /api/auth/omniport/callback/` - OAuth callback
- `POST /api/auth/refresh/` - Refresh JWT token

### Events

- `GET /api/events/` - List events (with search)
- `POST /api/events/` - Create event (Admin/Coordinator)
- `GET /api/events/:id/` - Event details
- `PATCH /api/events/:id/` - Update event
- `DELETE /api/events/:id/` - Delete event (Admin only)
- `GET /api/events/:id/photos/` - Event photos

### Photos

- `POST /api/events/:id/upload/` - Upload photos
- `GET /api/photos/search/` - Search photos by tags/people
- `POST /api/photos/:id/tag/` - Tag person in photo
- `DELETE /api/photos/:id/tag/:tagId/` - Remove tag

### Admin Panel

- `GET /api/adminpanel/users/` - List all users
- `PATCH /api/adminpanel/users/:id/` - Update user role
- `DELETE /api/adminpanel/users/:id/` - Delete user

### Notifications

- `WebSocket /ws/notifications/` - Real-time notifications

---

## 🔧 Feature Implementation Details

### 1. Omniport OAuth2 Authentication

**Implementation**: [accounts/views.py](autumn_photo_backend/accounts/views.py)

```python
class OmniportCallbackAPIView(APIView):
    def post(self, request):
        # Exchange authorization code for access token
        token_response = requests.post(
            f"{settings.OMNIPORT_BASE_URL}/open_auth/token/",
            auth=HTTPBasicAuth(client_id, client_secret),
            data={'grant_type': 'authorization_code', 'code': code}
        )

        # Fetch user data from Omniport
        user_data = requests.get(
            f"{settings.OMNIPORT_BASE_URL}/open_auth/get_user_data/",
            headers={'Authorization': f'Bearer {access_token}'}
        )

        # Create or update user
        user, created = User.objects.get_or_create(email=email)
```

**Key Challenges**:

- OAuth endpoint URLs differed from documentation (`/open_auth/token/` vs `/oauth/token/`)
- Token exchange required `HTTPBasicAuth` instead of form data
- User data fields were camelCase (`contactInformation.emailAddress`)
- Cross-origin session cookies needed `SESSION_COOKIE_SAMESITE="None"`

### 2. Photo Search with AI Tags

**Implementation**: [photos/views.py](autumn_photo_backend/photos/views.py)

```python
class PhotoSearchAPIView(APIView):
    def get(self, request):
        q = request.GET.get('q', '').strip()
        if len(q) < 2:
            return Response({'photos': []})

        # Search in AI tags (JSONField), person tags, and event info
        photos = Photo.objects.filter(
            Q(tags__icontains=q) |  # AI tags
            Q(person_tags__tagged_user__email__icontains=q) |  # Tagged user
            Q(person_tags__tagged_user__full_name__icontains=q) |
            Q(event__name__icontains=q) |  # Event name
            Q(event__description__icontains=q)
        ).distinct()
```

**Key Challenges**:

- SQLite doesn't support `__icontains` on JSONField directly
- Solution: Cast JSONField to string for substring search
- Added 2-character minimum to avoid overly broad matches

### 3. Event Edit Permissions

**Implementation**: [events/permissions.py](autumn_photo_backend/events/permissions.py)

```python
class ISADMIN_OR_COORDINATOR(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        if request.user.role == 'EVENT_COORDINATOR':
            return obj.coordinators.filter(id=request.user.id).exists()
        return False
```

**Frontend Logic**: [EventsPage.tsx](frontend/autumn_photo_frontend/src/pages/events/EventsPage.tsx)

- Admins see edit options only in Admin Panel
- Event coordinators see edit buttons on their event cards
- Coordinators can only edit events they're assigned to

### 4. Real-time Notifications

**Implementation**: [notifications/consumers.py](autumn_photo_backend/notifications/consumers.py)

```python
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user_id = self.scope['user'].id
        await self.channel_layer.group_add(f"user_{user_id}", self.channel_name)

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event['data']))
```

**Trigger**: Photo uploads, tagging events automatically send notifications

### 5. Image Processing Pipeline

**Implementation**: [photos/tasks.py](autumn_photo_backend/photos/tasks.py)

```python
@shared_task
def process_photo(photo_id):
    photo = Photo.objects.get(id=photo_id)

    # Generate thumbnail (300x300)
    thumbnail = create_thumbnail(photo.original_file, size=(300, 300))

    # Generate display image (1920x1080)
    display = create_display(photo.original_file, size=(1920, 1080))

    # Extract EXIF data
    exif = extract_exif(photo.original_file)

    # AI tagging (placeholder for ML integration)
    tags = generate_ai_tags(photo.original_file)
```

---

## 👥 User Roles & Permissions

| Role                  | Permissions                                        |
| --------------------- | -------------------------------------------------- |
| **ADMIN**             | Full access: manage users, all events, all photos  |
| **EVENT_COORDINATOR** | Create events, edit assigned events, upload photos |
| **PHOTOGRAPHER**      | Upload photos to assigned events                   |
| **IMG_MEMBER**        | View all events, view all photos                   |
| **PUBLIC**            | View public events only                            |

---

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- CORS configured for cross-origin requests
- Session cookie security (`SameSite=None`, `Secure`)
- Permission classes on all API endpoints
- File upload validation (image types only)

---

## 🎨 UI/UX Features

- **Gradient Design**: Modern purple/green gradient theme
- **Dark Mode**: Eye-friendly dark background
- **Responsive**: Mobile, tablet, and desktop support
- **Animations**: Smooth transitions and hover effects
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Modals**: Elegant popups for forms and photo viewing

---

## 🧪 Testing

### Run Backend Tests

```bash
cd autumn_photo_backend
python manage.py test
```

### Run Frontend Tests

```bash
cd frontend/autumn_photo_frontend
npm test
```

---

## 📝 Environment Variables

### Backend `.env`

```env
SECRET_KEY=
DEBUG=
ALLOWED_HOSTS=
OMNIPORT_BASE_URL=
OMNIPORT_CLIENT_ID=
OMNIPORT_CLIENT_SECRET=
OMNIPORT_REDIRECT_URI=
REDIS_HOST=
REDIS_PORT=
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for the Information Management Group (IMG).

---

## 👨‍💻 Developer

Developed as part of the IMG Autumn Assignment 2025/26

**Contact**: [Your Email/GitHub]

---

## 🙏 Acknowledgments

- Information Management Group (IMG)
- Omniport team for OAuth integration
- Django & React communities

---

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [Channels Documentation](https://channels.readthedocs.io/)
