//BMI Calculator
interface Person {
    weight: number;
    height: number;
}

function calculateBMI(person: Person): number {
    const heightInMeters = person.height / 100;

    const bmi = person.weight / (heightInMeters * heightInMeters);

    return Number(bmi.toFixed(2));
}

// Example
const person: Person = {
    weight: 55,
    height: 160
};

console.log("Your BMI is:", calculateBMI(person));