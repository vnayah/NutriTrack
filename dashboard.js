// =====================================
// LOGIN CHECK
// =====================================

const loggedIn = localStorage.getItem("loggedIn");

if (loggedIn !== "true") {
    window.location.href = "index.html";
}


// =====================================
// USER INFORMATION
// =====================================

const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

if (currentUser) {
    document.getElementById("usernameText").textContent =
        "Welcome, " + currentUser.name + "!";
}


// =====================================
// GREETING
// =====================================

const hour = new Date().getHours();

if (hour < 12) {
    document.getElementById("greeting").textContent =
        "Good Morning ☀️";
}
else if (hour < 17) {
    document.getElementById("greeting").textContent =
        "Good Afternoon 🌤️";
}
else if (hour < 21) {
    document.getElementById("greeting").textContent =
        "Good Evening 🌇";
}
else {
    document.getElementById("greeting").textContent =
        "Good Night 🌙";
}


// =====================================
// FOOD VARIABLES
// =====================================

let allFoods = [];

let foodList =
    JSON.parse(localStorage.getItem("todayFood")) || [];

let water =
    Number(localStorage.getItem("water")) || 0;


// =====================================
// LOAD FOOD.JSON
// =====================================

async function loadFoods() {

    try {

        const response = await fetch("food.json");

        if (!response.ok) {
            throw new Error("Food data could not be loaded");
        }

        allFoods = await response.json();

        displayFoods(allFoods);

        document.getElementById("searchMessage").textContent =
            "All foods loaded.";

    }
    catch (error) {

        console.error(error);

        document.getElementById("searchMessage").textContent =
            "Unable to load food data.";

    }
}


// =====================================
// DISPLAY FOOD
// =====================================

function displayFoods(foods) {

    const foodResults =
        document.getElementById("foodResults");

    foodResults.innerHTML = "";


    if (foods.length === 0) {

        foodResults.innerHTML =
            "<p>No food found.</p>";

        return;
    }


    foods.forEach(function(food) {

        const card =
            document.createElement("div");

        card.className = "food-card";


        card.innerHTML = `
            <h3>${food.name}</h3>

            <p>Calories: ${food.calories} kcal</p>

            <p>Protein: ${food.protein} g</p>

            <p>Carbs: ${food.carbs} g</p>

            <p>Fat: ${food.fat} g</p>

            <small>Nutrition values per 100g</small>

            <br><br>

            <button class="add-btn">
                + Add Food
            </button>
        `;


        card
            .querySelector(".add-btn")
            .addEventListener("click", function() {

                addFood(food);

            });


        foodResults.appendChild(card);

    });

}


// =====================================
// SEARCH FOOD
// =====================================

const searchBtn =
    document.getElementById("searchBtn");

const searchInput =
    document.getElementById("foodSearch");


searchBtn.addEventListener(
    "click",
    searchFood
);


searchInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {
            searchFood();
        }

    }
);


function searchFood() {

    const searchText =
        searchInput.value.trim().toLowerCase();


    // Empty search
    if (searchText === "") {

        displayFoods(allFoods);

        document.getElementById("searchMessage")
            .textContent = "Showing all foods.";

        return;
    }


    // Search food
    const filteredFoods =
        allFoods.filter(function(food) {

            return food.name
                .toLowerCase()
                .includes(searchText);

        });


    displayFoods(filteredFoods);


    if (filteredFoods.length === 0) {

        document.getElementById("searchMessage")
            .textContent = "No food found.";

    }
    else {

        document.getElementById("searchMessage")
            .textContent =
            filteredFoods.length +
            " food(s) found.";

    }

}


// =====================================
// ADD FOOD
// =====================================

function addFood(food) {

    foodList.push(food);


    localStorage.setItem(
        "todayFood",
        JSON.stringify(foodList)
    );


    displayTodayFood();

    updateNutrition();

}


// =====================================
// DISPLAY TODAY'S FOOD
// =====================================

function displayTodayFood() {

    const container =
        document.getElementById("todayFood");

    container.innerHTML = "";


    if (foodList.length === 0) {

        container.innerHTML = `
            <p class="empty-text">
                No food added yet.
            </p>
        `;

        return;
    }


    foodList.forEach(function(food, index) {

        const item =
            document.createElement("div");

        item.className = "food-item";


        item.innerHTML = `
            <div>

                <strong>${food.name}</strong>

                <br>

                <small>
                    ${food.calories} kcal |
                    ${food.protein}g protein |
                    ${food.carbs}g carbs
                </small>

            </div>

            <button class="remove-btn">
                Remove
            </button>
        `;


        item
            .querySelector(".remove-btn")
            .addEventListener("click", function() {

                removeFood(index);

            });


        container.appendChild(item);

    });

}


// =====================================
// REMOVE FOOD
// =====================================

function removeFood(index) {

    foodList.splice(index, 1);


    localStorage.setItem(
        "todayFood",
        JSON.stringify(foodList)
    );


    displayTodayFood();

    updateNutrition();

}


// =====================================
// CLEAR ALL FOOD
// =====================================

document
    .getElementById("clearFoodBtn")
    .addEventListener("click", function() {

        foodList = [];


        localStorage.setItem(
            "todayFood",
            JSON.stringify(foodList)
        );


        displayTodayFood();

        updateNutrition();

    });


// =====================================
// WATER TRACKER
// =====================================

const waterButtons =
    document.querySelectorAll(".water-btn");


waterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const amount =
            Number(button.dataset.water);


        water += amount;


        localStorage.setItem(
            "water",
            water
        );


        updateNutrition();

    });

});


// =====================================
// RESET WATER
// =====================================

document
    .getElementById("resetWater")
    .addEventListener("click", function() {

        water = 0;


        localStorage.setItem(
            "water",
            water
        );


        updateNutrition();

    });


// =====================================
// UPDATE NUTRITION
// =====================================

function updateNutrition() {

    let calories = 0;

    let protein = 0;

    let carbs = 0;


    // Calculate totals

    foodList.forEach(function(food) {

        calories += Number(food.calories);

        protein += Number(food.protein);

        carbs += Number(food.carbs);

    });


    // =================================
    // DISPLAY TOTALS
    // =================================

    document.getElementById("calorieValue")
        .textContent = calories.toFixed(0);


    document.getElementById("proteinValue")
        .textContent = protein.toFixed(1);


    document.getElementById("carbsValue")
        .textContent = carbs.toFixed(1);


    document.getElementById("waterValue")
        .textContent = water;


    // =================================
    // NUTRITION SCORE
    // =================================

    // Calories = 30 points
    const calorieScore =
        Math.min(
            (calories / 2000) * 30,
            30
        );


    // Protein = 25 points
    const proteinScore =
        Math.min(
            (protein / 60) * 25,
            25
        );


    // Carbs = 20 points
    const carbsScore =
        Math.min(
            (carbs / 250) * 20,
            20
        );


    // Water = 25 points
    const waterScore =
        Math.min(
            (water / 2000) * 25,
            25
        );


    // Total = 100
    const score =
        Math.round(
            calorieScore +
            proteinScore +
            carbsScore +
            waterScore
        );


    // Display score

    document.getElementById("nutritionScore")
        .textContent = score;


    // =================================
    // SCORE MESSAGE
    // =================================

    const scoreMessage =
        document.getElementById("scoreMessage");


    if (score === 0) {

        scoreMessage.textContent =
            "Start adding your food and water.";

    }
    else if (score < 50) {

        scoreMessage.textContent =
            "Keep tracking your nutrition.";

    }
    else if (score < 80) {

        scoreMessage.textContent =
            "Good progress! Keep going.";

    }
    else {

        scoreMessage.textContent =
            "Great! You are tracking well today.";

    }

}


// =====================================
// LOGOUT
// =====================================

document
    .getElementById("logoutBtn")
    .addEventListener("click", function() {

        localStorage.removeItem("loggedIn");

        localStorage.removeItem("currentUser");

        window.location.href =
            "index.html";

    });


// =====================================
// START PROJECT
// =====================================

loadFoods();

displayTodayFood();

updateNutrition();

