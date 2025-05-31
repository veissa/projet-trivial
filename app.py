from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///events.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

db = SQLAlchemy(app)

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    is_organizer = db.Column(db.Boolean, default=False)
    events = db.relationship('Event', backref='organizer', lazy=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    club_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    expected_attendees = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Helper function to check if user is authenticated
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Routes
@app.route('/')
def index():
    date_filter = request.args.get('date')
    club_filter = request.args.get('club_name')
    category_filter = request.args.get('category')
    
    query = Event.query
    
    if date_filter:
        try:
            filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
            query = query.filter(Event.date == filter_date)
        except ValueError:
            pass
    
    if club_filter:
        query = query.filter(Event.club_name == club_filter)
    
    if category_filter:
        query = query.filter(Event.category == category_filter)
    
    # Get unique categories for filter dropdown
    categories = db.session.query(Event.category).distinct().all()
    categories = [cat[0] for cat in categories]
    
    events = query.order_by(Event.date.asc()).all()
    return render_template('index.html', events=events, categories=categories)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            flash('Logged in successfully!', 'success')
            return redirect(url_for('index'))
        
        flash('Invalid username or password', 'error')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return redirect(url_for('register'))
        
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            is_organizer=request.form.get('is_organizer', False)
        )
        
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        flash('Registration successful!', 'success')
        return redirect(url_for('index'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Logged out successfully', 'success')
    return redirect(url_for('index'))

@app.route('/events/create', methods=['GET', 'POST'])
@login_required
def create_event():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        time = datetime.strptime(request.form['time'], '%H:%M').time()
        location = request.form['location']
        club_name = request.form['club_name']
        category = request.form['category']
        expected_attendees = int(request.form['expected_attendees'])
        
        image_path = None
        if 'image' in request.files:
            image = request.files['image']
            if image and image.filename:
                if allowed_file(image.filename):
                    filename = secure_filename(image.filename)
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    filename = f"{timestamp}_{filename}"
                    image_path = os.path.join('uploads', filename)
                    image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                else:
                    flash('Invalid file type. Please upload an image.', 'error')
                    return redirect(url_for('create_event'))
        
        event = Event(
            title=title,
            description=description,
            date=date,
            time=time,
            location=location,
            club_name=club_name,
            category=category,
            expected_attendees=expected_attendees,
            image_path=image_path,
            organizer_id=session['user_id']
        )
        
        db.session.add(event)
        db.session.commit()
        
        flash('Event created successfully!', 'success')
        return redirect(url_for('index'))
    
    return render_template('create_event.html')

@app.route('/events/<int:event_id>')
def view_event(event_id):
    event = Event.query.get_or_404(event_id)
    return render_template('view_event.html', event=event)

@app.route('/events/<int:event_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    if event.organizer_id != session['user_id']:
        flash('You are not authorized to edit this event', 'error')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        event.title = request.form['title']
        event.description = request.form['description']
        event.date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        event.time = datetime.strptime(request.form['time'], '%H:%M').time()
        event.location = request.form['location']
        event.club_name = request.form['club_name']
        event.category = request.form['category']
        event.expected_attendees = int(request.form['expected_attendees'])
        
        if 'image' in request.files:
            image = request.files['image']
            if image and image.filename:
                if allowed_file(image.filename):
                    # Delete old image if exists
                    if event.image_path:
                        old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                                    os.path.basename(event.image_path))
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    
                    filename = secure_filename(image.filename)
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    filename = f"{timestamp}_{filename}"
                    event.image_path = os.path.join('uploads', filename)
                    image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                else:
                    flash('Invalid file type. Please upload an image.', 'error')
                    return redirect(url_for('edit_event', event_id=event_id))
        
        db.session.commit()
        flash('Event updated successfully!', 'success')
        return redirect(url_for('view_event', event_id=event.id))
    
    return render_template('edit_event.html', event=event)

@app.route('/events/<int:event_id>/delete', methods=['POST'])
@login_required
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    if event.organizer_id != session['user_id']:
        flash('You are not authorized to delete this event', 'error')
        return redirect(url_for('index'))
    
    # Delete event image if exists
    if event.image_path:
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], 
                                os.path.basename(event.image_path))
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.session.delete(event)
    db.session.commit()
    
    flash('Event deleted successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/my-events')
@login_required
def my_events():
    events = Event.query.filter_by(organizer_id=session['user_id']).order_by(Event.date.asc()).all()
    return render_template('my_events.html', events=events)

if __name__ == '__main__':
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Check if we need to add the category column
        try:
            # Try to query the category column
            db.session.query(Event.category).first()
        except Exception:
            # If the column doesn't exist, we'll need to recreate the database
            db.session.close()
            db.drop_all()
            db.create_all()
            
    app.run(debug=True) 