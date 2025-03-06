// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTFEgn-LQRAMa8f_9AC5NzNde_QK8sszw",
  authDomain: "calculator-7c3e6.firebaseapp.com",
  databaseURL: "https://calculator-7c3e6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "calculator-7c3e6",
  storageBucket: "calculator-7c3e6.firebasestorage.app",
  messagingSenderId: "854091420495",
  appId: "1:854091420495:web:821fcab0cf14759f662b3a",
  measurementId: "G-9MKNKESHFM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Register function
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const secretPassword = document.getElementById("secretpassword").value;
  const department = document.getElementById("department").value;
  const full_name = document.getElementById("staffname").value;
  const staffid = document.getElementById("staffid").value;
  const title = document.getElementById("title").value;

  if (!validate_email(email) || !validate_password(password)) {
    alert("Invalid email or password");
    return;
  }

  if (!validate_field(department) || !validate_field(full_name) || !validate_field(staffid) || !validate_field(title)) {
    alert("Invalid field");
    return;
  }

  // Get secret password from database first
  database.ref('adminSettings/secretPassword').once('value')
    .then((snapshot) => {
      const correctSecret = snapshot.val() || "unisel123"; // Changed default password
      
      if (secretPassword !== correctSecret) {
        alert("Invalid secret password");
        return;
      }

      // Continue with registration if secret password matches
      return auth.createUserWithEmailAndPassword(email, password);
    })
    .then((userCredential) => {
      if (userCredential) {
        const user = userCredential.user;
        const database_ref = database.ref();
        const user_data = {
          email: email,
          full_name: full_name,
          department: department,
          staffid: staffid,
          title: title,
          last_login: Date.now()
        };

        database_ref.child('users/' + user.uid).set(user_data);
        alert("Successfully Registered");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

// Replace the login functions with these improved versions
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validate_email(email) || !validate_password(password)) {
        alert('Email or Password incorrect!!');
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check both users and students collections
        const [userSnapshot, studentSnapshot] = await Promise.all([
            database.ref('users/' + user.uid).once('value'),
            database.ref('students/' + user.uid).once('value')
        ]);

        const userData = userSnapshot.val();
        const studentData = studentSnapshot.val();

        if (userData) {
            // User is a lecturer
            await database.ref('users/' + user.uid).update({
                last_login: Date.now()
            });
            alert('Successfully logged in as lecturer!');
            window.location.href = 'homepagelec.html';
        } else if (studentData) {
            // User is a student
            await database.ref('students/' + user.uid).update({
                last_login: Date.now()
            });
            alert('Successfully logged in as student!');
            window.location.href = 'homepagestd.html';
        } else {
            await auth.signOut();
            alert('Account not found. Please check your credentials.');
            return;
        }
    } catch (error) {
        console.error("Login error:", error);
        alert(error.message);
    }
}

async function loginadmin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validate_email(email) || !validate_password(password)) {
        alert('Email or Password incorrect!!');
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if user exists in 'users' collection and has admin role
        const userSnapshot = await database.ref('users/' + user.uid).once('value');
        const userData = userSnapshot.val();

        if (userData && userData.role === 'admin') {
            await database.ref('users/' + user.uid).update({
                last_login: Date.now()
            });
            alert('Successfully logged in!');
            window.location.href = 'homepageadmin.html';
        } else {
            await auth.signOut();
            alert('Access denied. This is not an admin account.');
            return;
        }
    } catch (error) {
        console.error("Login error:", error);
        alert(error.message);
    }
}

// Validation functions
function validate_email(email) {
  const expression = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return expression.test(email);
}

function validate_password(password) {
  return password.length >= 6;
}

function validate_field(field) {
  return field && field.trim().length > 0;
}

function logout() {
    auth.signOut().then(() => {
        alert('Successfully logged out!');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Error during logout: ' + error.message);
    });
}

function logbutton(){
  window.location.href = 'login.html';
}
function logbuttonstd(){
  window.location.href = 'stdlogin.html';
}

function addnewstd(){
  window.location.href = 'addstd.html';
}

function resetPassword() {
  const email = document.getElementById("email").value;
  const message = document.getElementById("message");

  if (!email) {
      message.style.color = "red";
      message.textContent = "Please enter a valid email.";
      return;
  }

  firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
          message.style.color = "green";
          message.textContent = "Password reset email sent! Check your inbox.";
      })
      .catch((error) => {
          message.style.color = "red";
          message.textContent = error.message;
      });
}

function resetPasswordstd() {
  const email = document.getElementById("email").value;
  const message = document.getElementById("message");

  if (!email) {
      message.style.color = "red";
      message.textContent = "Please enter a valid email.";
      return;
  }

  firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
          message.style.color = "green";
          message.textContent = "Password reset email sent! Check your inbox.";
      })
      .catch((error) => {
          message.style.color = "red";
          message.textContent = error.message;
      });
}
function logoutstd() {
    auth.signOut().then(() => {
        alert('Successfully logged out!');
        window.location.href = 'stdlogin.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Error during logout: ' + error.message);
    });
}

function logoutadmin() {
    auth.signOut().then(() => {
        alert('Successfully logged out!');
        window.location.href = 'adminlogin.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Error during logout: ' + error.message);
    });
}

