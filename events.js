// DOM Elements
const eventsGrid = document.getElementById('eventsGrid');
const categoryFilter = document.getElementById('categoryFilter');
const dateFilter = document.getElementById('dateFilter');
const createEventModal = document.getElementById('createEventModal');
const becomeOrganizerModal = document.getElementById('becomeOrganizerModal');
const participateModal = document.getElementById('participateModal');
const createEventForm = document.getElementById('createEventForm');
const becomeOrganizerForm = document.getElementById('becomeOrganizerForm');
const participateForm = document.getElementById('participateForm');
const createEventLink = document.getElementById('createEventLink');
const becomeOrganizerLink = document.getElementById('becomeOrganizerLink');
const logoutLink = document.getElementById('logoutLink');
const locationSelect = document.getElementById('location');

// Club images configuration with Unsplash random images
const CLUB_IMAGES = {
    'CIT': 'https://yt3.googleusercontent.com/ytc/AIdro_l76ubha-KqaHYPdiyekdfOtNfv6svYI7Bl9rgcItShmEa7=s900-c-k-c0x00ffffff-no-rj',
    'CAS': 'https://www.inpt.ac.ma/sites/default/files/DocSite/Clubs/Club%20Affaires%20Sociales%20INPT.jpg',
    'ENACTUS': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQDUvFn-nPprMJSvyullV3a5UcXWgKUq90Ww&s',
    'CESE': 'https://www.inpt.ac.ma/sites/default/files/DocSite/Clubs/CESE%20INPT.jpg',
    'Sports': 'https://img.freepik.com/vecteurs-libre/concept-equipement-sport_1284-13034.jpg?semt=ais_hybrid&w=740',
    'Mosque': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0R-aJNA1lLbeRbuq2p-Bp8Kldg-sKtoxV4A&s'
};

// Default image if club image is not found
const DEFAULT_IMAGE = 'https://picsum.photos/800/450?random=7';

// Location configuration
const LOCATIONS = {
    CLASSROOMS: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06'],
    ROOMS_B: ['B100', 'B101', 'B102', 'B200', 'B201', 'B202'],
    AMPHITHEATERS: ['E1', 'E2', 'E3', 'Zlafa']
};

// Location capacities
const LOCATION_CAPACITIES = {
    'CC01': 30, 'CC02': 30, 'CC03': 30, 'CC04': 30, 'CC05': 30, 'CC06': 30,
    'B100': 50, 'B101': 50, 'B102': 50, 'B200': 50, 'B201': 50, 'B202': 50,
    'E1': 100, 'E2': 100, 'E3': 100, 'Zlafa': 300
};

// Stockage local des événements
let events = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    setupEventListeners();
    setupLocationValidation();
});

function setupEventListeners() {
    // Filter listeners
    categoryFilter.addEventListener('change', loadEvents);
    dateFilter.addEventListener('change', loadEvents);

    // Modal triggers
    createEventLink.addEventListener('click', () => showModal(createEventModal));
    becomeOrganizerLink.addEventListener('click', () => showModal(becomeOrganizerModal));

    // Form submissions
    createEventForm.addEventListener('submit', handleCreateEvent);
    becomeOrganizerForm.addEventListener('submit', handleBecomeOrganizer);
    participateForm.addEventListener('submit', handleParticipate);

    // Logout
    logoutLink.addEventListener('click', handleLogout);

    // Location validation
    locationSelect.addEventListener('change', validateLocationCapacity);
}

function setupLocationValidation() {
    const expectedAttendeesInput = document.getElementById('expected_attendees');
    expectedAttendeesInput.addEventListener('input', validateLocationCapacity);
}

function validateLocationCapacity() {
    const location = locationSelect.value;
    const expectedAttendees = document.getElementById('expected_attendees').value;
    const submitButton = createEventForm.querySelector('button[type="submit"]');
    
    if (location && expectedAttendees) {
        const capacity = LOCATION_CAPACITIES[location];
        if (parseInt(expectedAttendees) > capacity) {
            showError(`La capacité maximale pour ${location} est de ${capacity} personnes`);
            submitButton.disabled = true;
            return false;
        }
    }
    submitButton.disabled = false;
    return true;
}

// Modal functions
function showModal(modal) {
    modal.style.display = 'block';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

// Event loading and display
function loadEvents() {
    const category = categoryFilter.value;
    const date = dateFilter.value;
    
    let filteredEvents = [...events];
    
    if (category) {
        filteredEvents = filteredEvents.filter(event => event.club_name === category);
    }
    
    if (date) {
        filteredEvents = filteredEvents.filter(event => event.date === date);
    }
    
    displayEvents(filteredEvents);
}

function displayEvents(eventsToDisplay) {
    eventsGrid.innerHTML = '';
    
    if (eventsToDisplay.length === 0) {
        eventsGrid.innerHTML = '<p class="no-events">Aucun événement disponible</p>';
        return;
    }
    
    eventsToDisplay.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const locationType = getLocationType(event.location);
    const capacity = LOCATION_CAPACITIES[event.location];
    const isCreatedEvent = event.isCreated || event.isNew;
    
    // Obtenir l'image du club
    const clubImage = CLUB_IMAGES[event.club_name] || DEFAULT_IMAGE;
    
    card.innerHTML = `
        <div class="event-image-container">
            <img src="${clubImage}" alt="${event.club_name}" class="event-image" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
            <div class="event-club-badge">${event.club_name}</div>
        </div>
        <div class="event-content">
            <h3 class="event-title">${event.title}</h3>
            <div class="event-details">
                <p><strong>Date:</strong> ${formatDate(event.date)}</p>
                <p><strong>Heure:</strong> ${event.time}</p>
                <p><strong>Lieu:</strong> ${event.location} (${locationType})</p>
                <p><strong>Capacité:</strong> ${capacity} personnes</p>
                <p><strong>Organisateur:</strong> ${event.club_name}</p>
                <p><strong>Participants attendus:</strong> ${event.expected_attendees}</p>
            </div>
            <div class="event-actions">
                ${isCreatedEvent 
                    ? `<button class="delete-btn" onclick="handleDeleteEvent('${event.id}')">Supprimer</button>`
                    : `<button class="primary-btn" onclick="handleParticipateClick('${event.id}')">Participer</button>`
                }
            </div>
        </div>
    `;
    
    return card;
}

function getLocationType(location) {
    if (LOCATIONS.CLASSROOMS.includes(location)) return 'Salle de classe';
    if (LOCATIONS.ROOMS_B.includes(location)) return 'Salle B';
    if (LOCATIONS.AMPHITHEATERS.includes(location)) return 'Amphithéâtre';
    return 'Lieu non spécifié';
}

// Form handlers
function handleCreateEvent(e) {
    e.preventDefault();
    
    if (!validateLocationCapacity()) {
        return;
    }
    
    const formData = new FormData(createEventForm);
    const eventData = Object.fromEntries(formData.entries());
    
    // Générer un ID unique pour le nouvel événement
    const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        isNew: true,
        isCreated: true // Marquer comme événement créé
    };
    
    // Ajouter le nouvel événement à la liste
    events.unshift(newEvent);
    
    // Fermer la modal et réinitialiser le formulaire
    hideModal(createEventModal);
    createEventForm.reset();
    
    // Ajouter le nouvel événement à la grille
    const eventCard = createEventCard(newEvent);
    eventsGrid.insertBefore(eventCard, eventsGrid.firstChild);
    
    showSuccess('Événement créé avec succès');
}

async function handleBecomeOrganizer(e) {
    e.preventDefault();
    hideModal(becomeOrganizerModal);
    becomeOrganizerLink.style.display = 'none';
    createEventLink.style.display = 'block';
    showSuccess('Vous êtes maintenant organisateur');
}

async function handleParticipate(e) {
    e.preventDefault();
    const eventId = participateForm.querySelector('input[name="eventId"]').value;
    hideModal(participateModal);
    showSuccess('Participation confirmée');
}

function handleParticipateClick(eventId) {
    participateForm.querySelector('input[name="eventId"]').value = eventId;
    showModal(participateModal);
}

function handleLogout(e) {
    e.preventDefault();
    window.location.href = '/login.html';
}

// Ajouter la fonction de suppression d'événement
function handleDeleteEvent(eventId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        // Supprimer l'événement de la liste
        events = events.filter(event => event.id !== eventId);
        // Recharger les événements
        loadEvents();
        showSuccess('Événement supprimé avec succès');
    }
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(message);
} 