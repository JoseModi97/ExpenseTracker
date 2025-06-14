// Simple authentication using static arrays and localStorage
var currentUser;

function login(email, password) {
  var user = users.find(function(u) { return u.email === email && u.password === password; });
  if (user) {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    window.location.href = 'index.html';
  } else {
    alert('Invalid credentials');
  }
}

function signup(firstName, lastName, email, password) {
  var exists = users.some(function(u){ return u.email === email; });
  if (exists) {
    alert('User already exists');
    return;
  }
  users.push({ email: email, password: password, firstName: firstName, lastName: lastName, orgId: 1, role: 'Employee' });
  alert('Account created. Please login.');
  window.location.href = 'login.html';
}

function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}

function requireAuth() {
  var info = localStorage.getItem('loggedInUser');
  if (!info) {
    window.location.href = 'login.html';
  } else {
    currentUser = JSON.parse(info);
  }
}
