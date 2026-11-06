
"use strict";

// Original EmailJS configuration — unchanged
const EMAILJS_PUBLIC_KEY = "wCNQYOVIOjxSk6yAV";
const EMAILJS_SERVICE_ID = "service_h1zm66m";
const EMAILJS_TEMPLATE_ID = "template_jr8ffw4";

const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactMessage = document.getElementById("contactMessage");
const contactError = document.getElementById("contactError");
const emailStatus = document.getElementById("emailStatus");
const contactSubmitBtn = document.getElementById("contactSubmitBtn");

let emailJsInitialized = false;

function initializeEmailJS() {
    if (emailJsInitialized) {
        return true;
    }

    if (typeof emailjs === "undefined") {
        return false;
    }

    try {
        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY
        });

        emailJsInitialized = true;
        return true;
    } catch (error) {
        console.error("EmailJS initialization failed:", error);
        return false;
    }
}

function showContactError(message) {
    if (contactError) {
        contactError.textContent = message;
    }
}

function showEmailStatus(message) {
    if (emailStatus) {
        emailStatus.textContent = message;
    }
}

if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        showContactError("");
        showEmailStatus("");

        const name = contactName.value.trim();
        const email = contactEmail.value.trim();
        const message = contactMessage.value.trim();

        if (!name || !email || !message) {
            showContactError("Please fill in all fields.");
            return;
        }

        if (name.length > 100) {
            showContactError("Name must be 100 characters or fewer.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showContactError("Please enter a valid email address.");
            return;
        }

        if (email.length > 254) {
            showContactError("Email address is too long.");
            return;
        }

        if (message.length > 3000) {
            showContactError("Message must be 3000 characters or fewer.");
            return;
        }

        if (!initializeEmailJS()) {
            showContactError(
                "Email service is unavailable. Please refresh and try again."
            );
            return;
        }

        if (contactSubmitBtn) {
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.textContent = "Sending...";
        }

        showEmailStatus("Sending message...");

        try {
            await emailjs.sendForm(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                contactForm
            );

            showEmailStatus("Message sent successfully! ✅");
            contactForm.reset();
        } catch (error) {
            console.error("Email sending failed:", error);

            showEmailStatus("");
            showContactError(
                "Failed to send message. Please try again."
            );
        } finally {
            if (contactSubmitBtn) {
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.textContent = "Send Message";
            }
        }
    });
}
