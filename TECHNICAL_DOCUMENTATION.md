# Campus Events Hub - Technical Documentation

## Models

### User Model
```python
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    events = db.relationship('Event', backref='organizer', lazy=True)
```

### Event Model
```python
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    club_name = db.Column(db.String(100), nullable=False)
    expected_attendees = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
```

## Routes

### Authentication Routes

#### GET /login
- **Description**: Display login form
- **Template**: `login.html`
- **Access**: Public

#### POST /login
- **Description**: Handle login form submission
- **Methods**: POST
- **Form Fields**: 
  - username
  - password
- **Redirects**: 
  - Success: `/`
  - Failure: `/login`

#### GET /register
- **Description**: Display registration form
- **Template**: `register.html`
- **Access**: Public

#### POST /register
- **Description**: Handle registration form submission
- **Methods**: POST
- **Form Fields**: 
  - username
  - password
  - confirm_password
- **Redirects**: 
  - Success: `/login`
  - Failure: `/register`

#### GET /logout
- **Description**: Log out user
- **Redirects**: `/login`

### Event Routes

#### GET /
- **Description**: Display all events with filtering options
- **Template**: `index.html`
- **Query Parameters**:
  - date (optional)
  - club_name (optional)
- **Access**: Public

#### GET /create
- **Description**: Display event creation form
- **Template**: `create_event.html`
- **Access**: Authenticated users

#### POST /create
- **Description**: Handle event creation
- **Methods**: POST
- **Form Fields**:
  - title
  - description
  - date
  - time
  - location
  - club_name
  - expected_attendees
  - image (optional)
- **Redirects**:
  - Success: `/`
  - Failure: `/create`

#### GET /event/<int:event_id>
- **Description**: Display event details
- **Template**: `view_event.html`
- **Access**: Public

#### GET /event/<int:event_id>/edit
- **Description**: Display event edit form
- **Template**: `edit_event.html`
- **Access**: Event organizer only

#### POST /event/<int:event_id>/edit
- **Description**: Handle event update
- **Methods**: POST
- **Form Fields**: Same as create
- **Redirects**:
  - Success: `/event/<event_id>`
  - Failure: `/event/<event_id>/edit`

#### POST /event/<int:event_id>/delete
- **Description**: Delete event
- **Methods**: POST
- **Redirects**: `/`
- **Access**: Event organizer only

#### GET /my-events
- **Description**: Display user's events
- **Template**: `my_events.html`
- **Access**: Authenticated users

## File Structure

```
static/
├── css/
│   └── styles.css      # Custom styles
├── js/
│   └── main.js         # Main JavaScript file
└── uploads/            # Event images storage

templates/
├── base.html           # Base template with common elements
├── index.html          # Home page with event list
├── login.html          # Login form
├── register.html       # Registration form
├── create_event.html   # Event creation form
├── edit_event.html     # Event edit form
├── view_event.html     # Event details page
└── my_events.html      # User's events page
```

## Database Schema

### User Table
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Event Table
```sql
CREATE TABLE event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    club_name VARCHAR(100) NOT NULL,
    expected_attendees INTEGER NOT NULL,
    image_path VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    organizer_id INTEGER NOT NULL,
    FOREIGN KEY (organizer_id) REFERENCES user (id)
);
```

## Security Measures

1. **Password Security**
   - Passwords are hashed using Werkzeug's security functions
   - Password confirmation required during registration

2. **Authentication**
   - Flask-Login for session management
   - Protected routes using @login_required decorator

3. **File Upload Security**
   - File type validation (images only)
   - Secure filename generation
   - File size limits

4. **Form Security**
   - CSRF protection enabled
   - Input validation and sanitization
   - SQL injection prevention through SQLAlchemy

5. **Access Control**
   - Event editing/deletion restricted to organizers
   - User authentication required for protected actions 