document.addEventListener("DOMContentLoaded", () => {
    // 1. Verify login
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

    // 2. User-specific storage keys
    const userId = encodeURIComponent(
        currentUser.email.trim().toLowerCase()
    );

    const profileKey = `nutritrack_${userId}_profile`;
    const foodKey = `nutritrack_${userId}_todayFood`;
    const waterKey = `nutritrack_${userId}_water`;

    function readStorage(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Unable to save data:", error);
        }
    }

    let profile = readStorage(profileKey, {});
    let todayFood = readStorage(foodKey, []);
    let water = Number(readStorage(waterKey, 0));
    let foods = [];

    if (!profile || typeof profile !== "object") profile = {};
    if (!Array.isArray(todayFood)) todayFood = [];
    if (!Number.isFinite(water) || water < 0) water = 0;

    // 3. HTML elements
    const foodSearch = document.getElementById("foodSearch");
    const searchBtn = document.getElementById("searchBtn");
    const searchMessage = document.getElementById("searchMessage");
    const foodResults = document.getElementById("foodResults");
    const todayFoodContainer = document.getElementById("todayFood");

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function makeElement(tag, text, className = "") {
        const element = document.createElement(tag);
        element.textContent = text;

        if (className) element.className = className;

        return element;
    }

    function formatNumber(value) {
        return Number(value.toFixed(1)).toString();
    }

    // 4. Support common food.json property names
    function foodValue(food, type) {
        const aliases = {
            calories: ["calories", "calorie", "kcal"],
            protein: ["protein"],
            carbs: ["carbs", "carbohydrates", "carbohydrate"],
            fat: ["fat"]
        };

        for (const key of aliases[type] || [type]) {
            const value = Number(food?.[key]);

            if (
                food?.[key] !== undefined &&
                food?.[key] !== null &&
                food?.[key] !== "" &&
                Number.isFinite(value)
            ) {
                return Math.max(0, value);
            }
        }

        return 0;
    }

    function itemGrams(item) {
        const grams = Number(item.grams ?? item.quantity ?? 100);
        return Number.isFinite(grams) && grams > 0 ? grams : 100;
    }

    function totalNutrition(type) {
        return todayFood.reduce((sum, item) => {
            return sum + foodValue(item, type) * itemGrams(item) / 100;
        }, 0);
    }

    // 5. Profile and greeting
    function getProfile() {
        const saved = readStorage(profileKey, {});
        return saved && typeof saved === "object" ? saved : {};
    }

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = "Good Night";

        if (hour < 12) greeting = "Good Morning";
        else if (hour < 17) greeting = "Good Afternoon";
        else if (hour < 21) greeting = "Good Evening";

        setText("greeting", `${greeting} 👋`);

        profile = getProfile();

        const name = profile.name || currentUser.name || "User";
        setText("usernameText", `Welcome, ${name}!`);
    }

    // 6. Summary and nutrition score
    function updateSummary() {
        setText("calorieValue", `${formatNumber(totalNutrition("calories"))} kcal`);
        setText("proteinValue", `${formatNumber(totalNutrition("protein"))} g`);
        setText("carbsValue", `${formatNumber(totalNutrition("carbs"))} g`);
        setText("waterValue", `${water} ml`);
        setText("waterValueDisplay", `${water} ml`);

        updateNutritionScore();
    }

    function updateNutritionScore() {
        const calorieScore = Math.min(totalNutrition("calories") / 2000, 1) * 30;
        const proteinScore = Math.min(totalNutrition("protein") / 60, 1) * 25;
        const carbsScore = Math.min(totalNutrition("carbs") / 250, 1) * 20;
        const waterScore = Math.min(water / 2000, 1) * 25;

        const score = Math.round(
            calorieScore + proteinScore + carbsScore + waterScore
        );

        setText("nutritionScore", score);

        let message = "Start adding your food and water.";

        if (score >= 80) message = "Great! You are tracking well today.";
        else if (score >= 50) message = "Good progress! Keep going.";
        else if (score > 0) message = "Keep tracking your nutrition.";

        setText("scoreMessage", message);
    }

    // 7. Food cards
    function createFoodCard(food, added = false, index = -1) {
        const card = document.createElement("article");
        card.className = "food-card";

        card.appendChild(makeElement("h3", food.name || "Unnamed food"));

        const grams = added ? itemGrams(food) : 100;

        card.appendChild(makeElement(
            "p",
            added ? `Amount: ${grams} g` : "Nutrition per 100 g"
        ));

        card.appendChild(makeElement(
            "p",
            `Calories: ${formatNumber(foodValue(food, "calories") * grams / 100)} kcal`
        ));

        card.appendChild(makeElement(
            "p",
            `Protein: ${formatNumber(foodValue(food, "protein") * grams / 100)} g`
        ));

        card.appendChild(makeElement(
            "p",
            `Carbs: ${formatNumber(foodValue(food, "carbs") * grams / 100)} g`
        ));

        card.appendChild(makeElement(
            "p",
            `Fat: ${formatNumber(foodValue(food, "fat") * grams / 100)} g`
        ));

        const button = document.createElement("button");
        button.type = "button";

        if (added) {
            button.className = "remove-btn";
            button.textContent = "Remove";
            button.addEventListener("click", () => removeFood(index));
        } else {
            button.className = "add-btn";
            button.textContent = "+ Add Food";
            button.addEventListener("click", () => addFood(food));
        }

        card.appendChild(button);
        return card;
    }

    // 8. Search works while typing, on click and Enter
    function searchFoods() {
        if (!foodResults) return;

        foodResults.replaceChildren();

        if (!foods.length) {
            setText("searchMessage", "Food data is not loaded yet.");
            return;
        }

        const query = (foodSearch?.value || "").trim().toLowerCase();

        const matches = foods.filter(food =>
            String(food.name || "").toLowerCase().includes(query)
        );

        if (!matches.length) {
            setText("searchMessage", "No food found. Try another name.");
            return;
        }

        setText("searchMessage", `${matches.length} food(s) found.`);

        matches.forEach(food => {
            foodResults.appendChild(createFoodCard(food));
        });
    }

    foodSearch?.addEventListener("input", searchFoods);
    searchBtn?.addEventListener("click", searchFoods);

    foodSearch?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchFoods();
        }
    });

    // 9. Add, remove and clear foods
    function addFood(food) {
        todayFood.push({
            id: food.id ?? food.name,
            name: food.name,
            calories: foodValue(food, "calories"),
            protein: foodValue(food, "protein"),
            carbs: foodValue(food, "carbs"),
            fat: foodValue(food, "fat"),
            grams: 100
        });

        writeStorage(foodKey, todayFood);
        renderTodayFood();
        updateSummary();
        updateSuggestions();
    }

    function removeFood(index) {
        if (index < 0 || index >= todayFood.length) return;

        todayFood.splice(index, 1);
        writeStorage(foodKey, todayFood);

        renderTodayFood();
        updateSummary();
        updateSuggestions();
    }

    function renderTodayFood() {
        if (!todayFoodContainer) return;

        todayFoodContainer.replaceChildren();

        if (!todayFood.length) {
            todayFoodContainer.appendChild(
                makeElement("p", "No food added yet.")
            );
            return;
        }

        todayFood.forEach((food, index) => {
            todayFoodContainer.appendChild(
                createFoodCard(food, true, index)
            );
        });
    }

    document.getElementById("clearFoodBtn")?.addEventListener("click", () => {
        todayFood = [];
        writeStorage(foodKey, todayFood);
        renderTodayFood();
        updateSummary();
        updateSuggestions();
    });

    // 10. Water tracker
    document.querySelectorAll(".water-btn").forEach(button => {
        button.addEventListener("click", () => {
            const amount = Number(button.dataset.water);

            if (!Number.isFinite(amount) || amount <= 0) return;

            water += amount;
            writeStorage(waterKey, water);
            updateSummary();
            updateSuggestions();
        });
    });

    document.getElementById("resetWater")?.addEventListener("click", () => {
        water = 0;
        writeStorage(waterKey, water);
        updateSummary();
        updateSuggestions();
    });

    // 11. Personalized nutrition analysis
    function updateSuggestions() {
        profile = getProfile();

        const limitBox = document.getElementById("foodsToLimit");
        const allergyBox = document.getElementById("allergyFoods");
        const considerBox = document.getElementById("foodsToConsider");
        const intakeBox = document.getElementById("dailyIntakeAnalysis");

        [limitBox, allergyBox, considerBox, intakeBox].forEach(box => {
            box?.replaceChildren();
        });

        const weight = Number(profile.weight);
        const height = Number(profile.height);
        const age = Number(profile.age);
        const goal = String(profile.goal || "").trim().toLowerCase();
        const preference = String(profile.foodPreference || "").trim().toLowerCase();

        const allergyText = Array.isArray(profile.allergies)
            ? profile.allergies.join(", ")
            : String(profile.allergies || "");

        const allergies = allergyText
            .toLowerCase()
            .split(/[,;\n]+/)
            .map(value => value.trim())
            .filter(Boolean);

        function showMessage(box, message) {
            if (box) box.appendChild(makeElement("p", message));
        }

        // Recommendations appear only after the profile is saved.
        const validProfile =
            profile.profileCompleted === true &&
            Number.isFinite(weight) && weight > 0 &&
            Number.isFinite(height) && height > 0 &&
            Number.isFinite(age) && age > 0 &&
            ["lose", "gain"].includes(goal) &&
            ["veg", "non-veg", "both"].includes(preference);

        if (!validProfile) {
            const message =
                "Complete and save your My Profile details to see personalized recommendations.";

            showMessage(limitBox, message);
            showMessage(considerBox, message);
            showMessage(allergyBox, message);
            showMessage(intakeBox, message);

            setText(
                "personalizedSummary",
                "Enter your weight, height, goal, food preference and any allergies in My Profile, then press Save."
            );
            setText(
                "weightAnalysis",
                "Your BMI and personalized analysis will appear after you save your profile."
            );
            return;
        }

        const bmi = weight / ((height / 100) ** 2);
        let category = "Obesity range";

        if (bmi < 18.5) category = "Underweight";
        else if (bmi < 25) category = "Normal weight";
        else if (bmi < 30) category = "Overweight";

        let goalMessage = goal === "lose"
            ? "Your selected goal is weight loss. Aim for balanced meals and sustainable habits."
            : "Your selected goal is weight gain. Balanced meals and adequate energy intake may help.";

        if (age < 18) {
            goalMessage += " BMI for people under 18 needs age-specific interpretation.";
        }

        setText(
            "weightAnalysis",
            `Weight: ${weight} kg | Height: ${height} cm | BMI: ${bmi.toFixed(1)} (${category}). ${goalMessage}`
        );

        setText(
            "personalizedSummary",
            `Recommendations use your saved ${goal === "lose" ? "Weight Loss" : "Weight Gain"} goal, ${preference === "veg" ? "Veg" : preference === "non-veg" ? "Non-Veg" : "Both"} preference, allergy entries and today's logged foods.`
        );

        function addList(box, list, emptyMessage) {
            if (!box) return;

            if (!list.length) {
                showMessage(box, emptyMessage);
                return;
            }

            list.forEach(food => {
                box.appendChild(makeElement(
                    "p",
                    `${food.name} — ${formatNumber(foodValue(food, "calories"))} kcal, ` +
                    `${formatNumber(foodValue(food, "protein"))} g protein per 100 g`
                ));
            });
        }

        function matchesAllergy(food) {
            const name = String(food.name || "").toLowerCase();
            return allergies.some(allergy => name.includes(allergy));
        }

        // Food-name matching is only a basic guide for allergies.
        const allergyMatches = foods.filter(matchesAllergy);

        addList(
            allergyBox,
            allergyMatches,
            allergies.length
                ? "No food names matched your allergy terms. Always check ingredient labels and cross-contamination warnings."
                : "No allergies entered. If you have allergies, add them in My Profile."
        );

        // Filter foods according to Veg / Non-Veg / Both.
        const nonVegPattern =
            /\b(chicken|fish|meat|beef|pork|mutton|lamb|prawn|shrimp|crab|lobster|seafood|turkey|duck|sausage|bacon)\b/i;

        const suitableFoods = foods.filter(food => {
            const name = String(food.name || "").toLowerCase();

            if (matchesAllergy(food)) return false;

            if (preference === "veg" && nonVegPattern.test(name)) return false;

            // Non-veg users can also eat vegetables, grains and fruit.
            return true;
        });

        const foodsEaten = new Set(
            todayFood.map(item => String(item.name || "").toLowerCase())
        );

        let considered = suitableFoods.filter(food =>
            !foodsEaten.has(String(food.name || "").toLowerCase())
        );

        if (goal === "lose") {
            considered.sort((a, b) =>
                foodValue(a, "calories") - foodValue(b, "calories")
            );
        } else {
            considered.sort((a, b) =>
                foodValue(b, "protein") - foodValue(a, "protein")
            );
        }

        addList(
            considerBox,
            considered.slice(0, 5),
            "No suitable suggestions found in your current food dataset."
        );

        // General foods-to-limit screening; not a medical prescription.
        const limitFoods = suitableFoods.filter(food => {
            const name = String(food.name || "").toLowerCase();
            const calories = foodValue(food, "calories");
            const fat = foodValue(food, "fat");

            if (goal === "lose") {
                return calories >= 250 ||
                    fat >= 15 ||
                    /\b(fried|chips|soda|soft drink|cake|pastry|candy|sweets)\b/.test(name);
            }

            return fat >= 20 ||
                calories >= 450 ||
                /\b(soda|soft drink|candy)\b/.test(name);
        });

        addList(
            limitBox,
            limitFoods.slice(0, 5),
            "No foods matched these general limit criteria. Portion size and preparation also matter."
        );

        // Reference values only; individual nutrition needs vary.
        const calorieTarget = goal === "lose" ? 1800 : 2200;

        const targets = [
            ["Calories", totalNutrition("calories"), calorieTarget, "kcal"],
            ["Protein", totalNutrition("protein"), goal === "gain" ? 75 : 60, "g"],
            ["Carbohydrates", totalNutrition("carbs"), 250, "g"],
            ["Water", water, 2000, "ml"]
        ];

        if (intakeBox) {
            targets.forEach(([label, consumed, target, unit]) => {
                const percent = Math.round((consumed / target) * 100);

                let message =
                    `${formatNumber(Math.max(0, target - consumed))} ${unit} below the reference target.`;

                if (consumed > target) {
                    message =
                        `${formatNumber(consumed - target)} ${unit} above the reference target.`;
                }

                intakeBox.appendChild(makeElement(
                    "p",
                    `${label}: ${formatNumber(consumed)} / ${target} ${unit} (${percent}%). ${message}`
                ));
            });

            intakeBox.appendChild(makeElement(
                "p",
                `Fat consumed: ${formatNumber(totalNutrition("fat"))} g. Targets are general references, not medical advice.`
            ));
        }
    }

    // 12. Load the original food dataset
    async function loadFoods() {
        try {
            const response = await fetch("food.json");

            if (!response.ok) {
                throw new Error(`Food data request failed: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("food.json must contain an array of foods.");
            }

            foods = data.filter(food =>
                food &&
                typeof food.name === "string" &&
                food.name.trim() !== ""
            );

            searchFoods();
            updateSuggestions();
        } catch (error) {
            console.error("Food loading error:", error);

            setText(
                "searchMessage",
                "Unable to load food data. Check food.json and run using VS Code Live Server."
            );

            updateSuggestions();
        }
    }

    // Refresh recommendations if profile changes in another browser tab.
    window.addEventListener("storage", event => {
        if (event.key === profileKey) {
            profile = getProfile();
            updateGreeting();
            updateSuggestions();
        }
    });

    // Initialize
    updateGreeting();
    renderTodayFood();
    updateSummary();
    updateSuggestions();
    loadFoods();
});