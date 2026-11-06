"use strict";
function calculateBMI(person) {
    const height = person.height / 100;
    return Number((person.weight / (height * height)).toFixed(2));
}
const person = {
    weight: 55,
    height: 160
};
console.log("Your BMI is:", calculateBMI(person));
