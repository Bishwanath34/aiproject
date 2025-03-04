document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");

    // Sign Up Form Inputs
    const signupForm = document.getElementById("signup-form");
    const signupName = document.getElementById("signup-name");
    const signupEmail = document.getElementById("signup-email");
    const signupPassword = document.getElementById("signup-password");

    // Login Form Inputs
    const loginForm = document.getElementById("login-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");

    // Toggle between Sign Up & Sign In
    registerBtn.addEventListener("click", () => {
        container.classList.add("active");
    });

    loginBtn.addEventListener("click", () => {
        container.classList.remove("active");
    });

    // Handle Sign Up
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = signupName.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value.trim();

        if (!name || !email || !password) {
            alert("All fields are required for sign up.");
            return;
        }

        // Save user data to local storage (simulating a database)
        const user = { name, email, password };
        localStorage.setItem("user", JSON.stringify(user));

        alert("Registration successful! You can now log in.");
        container.classList.remove("active"); // Switch to login form
    });

    // Handle Login
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        // Retrieve user data from local storage
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedUser && storedUser.email === email && storedUser.password === password) {
            alert("Login successful!");
            window.location.href = "after_login.html"; // Redirect on success
        } else {
            alert("Invalid email or password. Please try again.");
        }
    });
});
