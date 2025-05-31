# Campus Events Hub

A centralized platform for managing and discovering campus events, built with Flask and SQLite.

## Features

- View all upcoming campus events
- Filter events by date and club name
- Detailed event pages with images
- User authentication (sign up, log in)
- Event organizers can post, edit, and delete their own events
- Image upload support for events
- Responsive design for all devices

## Technical Stack

- **Frontend**: HTML, CSS (Bootstrap 5), JavaScript
- **Backend**: Python with Flask
- **Database**: SQLite
- **Authentication**: Flask-Login with password hashing
- **File Storage**: Local file system for images

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd campus-events-hub
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python app.py
```

5. Create required directories:
```bash
mkdir -p instance
mkdir -p static/uploads
```

6. Run the application:
```bash
python app.py
```

7. Visit `http://localhost:5000` in your browser

## Project Structure

```
campus-events-hub/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── static/            # Static files
│   ├── css/          # CSS files
│   ├── js/           # JavaScript files
│   └── uploads/      # Uploaded event images
├── templates/         # HTML templates
│   ├── base.html     # Base template
│   ├── index.html    # Home page
│   ├── login.html    # Login page
│   ├── register.html # Registration page
│   ├── create_event.html  # Create event form
│   ├── edit_event.html    # Edit event form
│   ├── view_event.html    # Event details page
│   └── my_events.html     # User's events page
└── instance/         # Instance-specific files
    └── events.db     # SQLite database
```

## Database Schema

### User Table
- id (Primary Key)
- username
- password_hash
- created_at

### Event Table
- id (Primary Key)
- title
- description
- date
- time
- location
- club_name
- expected_attendees
- image_path
- created_at
- organizer_id (Foreign Key to User)

## Security Features

- Password hashing using Werkzeug
- CSRF protection
- Secure file upload handling
- Session management
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 