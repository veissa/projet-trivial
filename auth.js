document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // Simulation d'authentification
    if(email === 'test@mail.com' && password === '1234') {
        alert('Connexion réussie !');
        window.location.href = 'events.html';
    } else {
        alert('Email ou mot de passe incorrect');
    }
});
// Gestion du lien d'inscription (affichage d'une alerte pour la démo)
document.getElementById('showRegister').onclick = function(e) {
    e.preventDefault();
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
};
document.getElementById('showLogin').onclick = function(e) {
    e.preventDefault();
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
};

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const niveau = document.getElementById('niveau').value;
    const filiere = document.getElementById('filiere').value;
    // alert(`Inscription réussie !\nNom: ${nom}\nPrénom: ${prenom}\nNiveau: ${niveau}\nFilière: ${filiere}`);
    window.location.href = 'events.html';
}); 