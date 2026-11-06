document.addEventListener("DOMContentLoaded", () => {
    let currentUser;

    try {
        currentUser = JSON.parse(
            localStorage.getItem("currentUser") || "null"
        );
    } catch {
        currentUser = null;
    }

    if (
        localStorage.getItem("loggedIn") !== "true" ||
        !currentUser?.email
    ) {
        window.location.href = "index.html";
        return;
    }

    const userId = encodeURIComponent(
        currentUser.email.trim().toLowerCase()
    );

    const profileKey = `nutritrack_${userId}_profile`;

    const form = document.getElementById("profileForm");
    const message = document.getElementById("profileMessage");
    const bmiValue = document.getElementById("bmiValue");
    const bmiCategory = document.getElementById("bmiCategory");
    const nameInput = document.getElementById("profileNameInput");

    function readProfile() {
        try {
            return JSON.parse(localStorage.getItem(profileKey) || "{}");
        } catch {
            return {};
        }
    }

    const profile = readProfile();

    // Fill the form with previously saved profile details.
    [
        "age",
        "weight",
        "height",
        "activity",
        "goal",
        "foodPreference",
        "allergies"
    ].forEach(id => {
        const element = document.getElementById(id);

        if (element && profile[id] !== undefined) {
            element.value = profile[id];
        }
    });

    if (nameInput) {
        nameInput.value = profile.name || currentUser.name || "";
    }

    function updateBMI() {
        const weight = Number(
            document.getElementById("weight")?.value
        );

        const height = Number(
            document.getElementById("height")?.value
        );

        if (
            !Number.isFinite(weight) ||
            !Number.isFinite(height) ||
            weight <= 0 ||
            height <= 0
        ) {
            if (bmiValue) bmiValue.textContent = "--";

            if (bmiCategory) {
                bmiCategory.textContent =
                    "Enter valid weight and height";
            }

            return;
        }

        const bmi = weight / ((height / 100) ** 2);

        if (bmiValue) {
            bmiValue.textContent = bmi.toFixed(2);
        }

        let category = "Obesity range";

        if (bmi < 18.5) {
            category = "Underweight";
        } else if (bmi < 25) {
            category = "Normal weight";
        } else if (bmi < 30) {
            category = "Overweight";
        }

        if (bmiCategory) {
            bmiCategory.textContent = category;
        }
    }

    form?.addEventListener("submit", event => {
        event.preventDefault();

        const name = nameInput?.value.trim() || "";
        const age = Number(
            document.getElementById("age")?.value
        );
        const weight = Number(
            document.getElementById("weight")?.value
        );
        const height = Number(
            document.getElementById("height")?.value
        );
        const goal =
            document.getElementById("goal")?.value || "";
        const foodPreference =
            document.getElementById("foodPreference")?.value || "";

        if (
            !name ||
            !Number.isFinite(age) || age <= 0 ||
            !Number.isFinite(weight) || weight <= 0 ||
            !Number.isFinite(height) || height <= 0
        ) {
            if (message) {
                message.textContent =
                    "Please enter a valid name, age, weight and height.";
                message.style.color = "red";
            }

            return;
        }

        if (!["lose", "gain"].includes(goal)) {
            if (message) {
                message.textContent =
                    "Please select Weight Loss or Weight Gain.";
                message.style.color = "red";
            }

            return;
        }

        if (!["veg", "non-veg", "both"].includes(foodPreference)) {
            if (message) {
                message.textContent =
                    "Please select Veg, Non-Veg or Both.";
                message.style.color = "red";
            }

            return;
        }

        const savedProfile = {
            name,
            age,
            weight,
            height,
            activity:
                document.getElementById("activity")?.value.trim() || "",
            goal,
            foodPreference,
            allergies:
                document.getElementById("allergies")?.value.trim() || "",
            profileCompleted: true
        };

        try {
            localStorage.setItem(
                profileKey,
                JSON.stringify(savedProfile)
            );

            currentUser.name = name;

            localStorage.setItem(
                "currentUser",
                JSON.stringify(currentUser)
            );

            if (message) {
                message.textContent =
                    "Profile saved successfully! Your dashboard recommendations are ready.";
                message.style.color = "green";
            }

            updateBMI();
        } catch (error) {
            console.error("Unable to save profile:", error);

            if (message) {
                message.textContent =
                    "Unable to save profile. Please try again.";
                message.style.color = "red";
            }
        }
    });

    document.getElementById("weight")?.addEventListener(
        "input",
        updateBMI
    );

    document.getElementById("height")?.addEventListener(
        "input",
        updateBMI
    );

    updateBMI();
});