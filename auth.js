const USERS_KEY = "nutritionUsers";
const LEGACY_USER_KEY = "nutritionUser";
const CURRENT_USER_KEY = "currentUser";
const LOGGED_IN_KEY = "loggedIn";

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRegisteredUsers() {
    try {
        const storedUsers = localStorage.getItem(USERS_KEY);

        if (storedUsers !== null) {
            const parsedUsers = JSON.parse(storedUsers);
            return Array.isArray(parsedUsers) ? parsedUsers : [];
        }

        // Migrate the old single-account format when necessary.
        const legacyValue = localStorage.getItem(LEGACY_USER_KEY);

        if (legacyValue) {
            const legacyUser = JSON.parse(legacyValue);

            if (
                legacyUser &&
                legacyUser.email &&
                legacyUser.password
            ) {
                const migratedUser = {
                    name: String(legacyUser.name || "").trim(),
                    email: normalizeEmail(legacyUser.email),
                    password: String(legacyUser.password)
                };

                localStorage.setItem(
                    USERS_KEY,
                    JSON.stringify([migratedUser])
                );

                return [migratedUser];
            }
        }

        return [];
    } catch (error) {
        console.error("Unable to read registered users:", error);
        return [];
    }
}

function saveRegisteredUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    try {
        if (localStorage.getItem(LOGGED_IN_KEY) !== "true") {
            return null;
        }

        const user = JSON.parse(
            localStorage.getItem(CURRENT_USER_KEY) || "null"
        );

        if (!user || !user.email) {
            return null;
        }

        const email = normalizeEmail(user.email);
        const registeredUsers = getRegisteredUsers();

        const accountExists = registeredUsers.some(
            registeredUser =>
                normalizeEmail(registeredUser.email) === email
        );

        if (!accountExists) {
            return null;
        }

        return {
            name: String(user.name || ""),
            email: email
        };
    } catch (error) {
        console.error("Unable to read current user:", error);
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(LOGGED_IN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
}

function logout() {
    clearSession();
    window.location.replace("index.html");
}

function protectPage() {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const protectedPages = [
        "dashboard.html",
        "profile.html",
        "contact.html"
    ];

    if (!protectedPages.includes(currentPage)) {
        return;
    }

    if (!getCurrentUser()) {
        clearSession();
        window.location.replace("index.html");
    }
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
    }
}

function clearError(element) {
    showError(element, "");
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const errorElement = document.getElementById("loginError");

        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;

        clearError(errorElement);

        if (!email || !password) {
            showError(errorElement, "Please fill in all fields.");
            return;
        }

        if (!isValidEmail(email)) {
            showError(errorElement, "Please enter a valid email address.");
            return;
        }

        const users = getRegisteredUsers();

        const matchedUser = users.find(
            user =>
                normalizeEmail(user.email) === email &&
                user.password === password
        );

        if (!matchedUser) {
            showError(
                errorElement,
                "Incorrect email or password. Please try again."
            );
            return;
        }

        // Only public account details are saved in the current session.
        const sessionUser = {
            name: String(matchedUser.name || ""),
            email: normalizeEmail(matchedUser.email)
        };

        try {
            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(sessionUser)
            );

            localStorage.setItem(LOGGED_IN_KEY, "true");

            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Unable to save login session:", error);
            showError(
                errorElement,
                "Unable to log in. Please check your browser storage."
            );
        }
    });
}

// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("signupName");
        const emailInput = document.getElementById("signupEmail");
        const passwordInput = document.getElementById("signupPassword");
        const confirmInput = document.getElementById("confirmPassword");
        const errorElement = document.getElementById("signupError");

        const name = nameInput.value.trim();
        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;

        clearError(errorElement);

        if (!name || !email || !password || !confirmPassword) {
            showError(errorElement, "Please fill in all fields.");
            return;
        }

        if (name.length > 100) {
            showError(
                errorElement,
                "Name must be 100 characters or fewer."
            );
            return;
        }

        if (!isValidEmail(email)) {
            showError(errorElement, "Please enter a valid email address.");
            return;
        }

        if (email.length > 254) {
            showError(errorElement, "Email address is too long.");
            return;
        }

        if (password.length < 6) {
            showError(
                errorElement,
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            showError(errorElement, "Passwords do not match.");
            return;
        }

        let users;

        try {
            users = getRegisteredUsers();
        } catch (error) {
            showError(
                errorElement,
                "Unable to read accounts from browser storage."
            );
            return;
        }

        const accountExists = users.some(
            user => normalizeEmail(user.email) === email
        );

        if (accountExists) {
            showError(
                errorElement,
                "An account with this email already exists. Please log in."
            );
            return;
        }

        users.push({
            name: name,
            email: email,
            password: password
        });

        try {
            saveRegisteredUsers(users);

            alert("Signup successful! Please log in.");

            window.location.href = "index.html";
        } catch (error) {
            console.error("Unable to save account:", error);
            showError(
                errorElement,
                "Unable to create your account. Please check browser storage."
            );
        }
    });
}

// Shared logout button on protected pages.
const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

// Protect dashboard, profile, and contact pages.
protectPage();
