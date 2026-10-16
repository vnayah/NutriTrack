// EmailJS initialization

emailjs.init({
    publicKey: "wCNQYOVIOjxSk6yAV"
});


const contactForm =
    document.getElementById("contactForm");


contactForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const name =
        document.getElementById("contactName").value.trim();

    const email =
        document.getElementById("contactEmail").value.trim();

    const message =
        document.getElementById("contactMessage").value.trim();

    const error =
        document.getElementById("contactError");

    const status =
        document.getElementById("emailStatus");

    //Clear previous message
    error.textContent = "";
    status.textContent = "";


    // FORM VALIDATION

    if (name === "" || email === "" || message === "") {

        error.textContent =
            "Please fill all fields.";

        return;
    }


    if (!email.includes("@")) {

        error.textContent =
            "Please enter a valid email.";

        return;
    }


    status.textContent =
        "Sending message...";


    // EMAILJS

    emailjs.sendForm(
        "service_h1zm66m",
        "template_jr8ffw4",
        contactForm
    )
    .then(function() {

        status.textContent =
            "Message sent successfully! ✅";

        contactForm.reset();

    })
    .catch(function(error) {

        console.error(error);

        status.textContent =
            "Failed to send message.";

    });

});
    const logoutBtn =document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener("click", function() {

        localStorage.removeItem("loggedIn");

        localStorage.removeItem("currentUser");

        window.location.href = "index.html";

    });

}  