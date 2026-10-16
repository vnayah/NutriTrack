// SIGNUP

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const error = document.getElementById("signupError");

        error.textContent = "";

        // Validation

        if (name === "" || email === "" || password === "") {
            error.textContent = "Please fill all fields.";
            return;
        }

        if (password.length < 6) {
            error.textContent =
                "Password must contain at least 6 characters.";
            return;
        }

        if (password !== confirmPassword) {
            error.textContent = "Passwords do not match.";
            return;
        }

        // Check existing user

        const existingUser = localStorage.getItem("nutritionUser");

        if (existingUser) {

            const user = JSON.parse(existingUser);

            if (user.email === email) {
                error.textContent = "Email already registered.";
                return;
            }
        }

        // Save user

        const user = {
            name: name,
            email: email,
            password: password
        };

        localStorage.setItem(
            "nutritionUser",
            JSON.stringify(user)
        );

        alert("Signup successful!");

        window.location.href = "index.html";

    });
}


// LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const error =
            document.getElementById("loginError");

        error.textContent = "";

        if (email === "" || password === "") {
            error.textContent = "Please enter email and password.";
            return;
        }

        const savedUser =
            localStorage.getItem("nutritionUser");

        if (!savedUser) {
            error.textContent =
                "No account found. Please signup first.";
            return;
        }

        const user = JSON.parse(savedUser);

        if (
            email === user.email &&
            password === user.password
        ) {

            localStorage.setItem(
                "loggedIn",
                "true"
            );

            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );

            window.location.href = "dashboard.html";

        } else {

            error.textContent =
                "Invalid email or password.";

        }

    });
}


// LOGOUT

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function() {

        localStorage.removeItem("loggedIn");
        localStorage.removeItem("currentUser");

        window.location.href = "index.html";

    });

}