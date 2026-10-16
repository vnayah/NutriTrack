"use strict";
function calculateBMI(person) {
    const heightInMeters = person.height / 100;
    const bmi = person.weight / (heightInMeters * heightInMeters);
    return Number(bmi.toFixed(2));
}
// Example
const person = {
    weight: 55,
    height: 160
};
console.log("Your BMI is:", calculateBMI(person));
