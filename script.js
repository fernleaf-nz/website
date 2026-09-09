import { contact } from "./config.js";
const button = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
function closeMenu(restore = false) {
  nav.classList.remove("open");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "Open navigation");
  if (restore) button.focus();
}
button.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
matchMedia("(min-width:1101px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
for (const node of document.querySelectorAll("[data-contact]")) {
  const key = node.dataset.contact,
    value = contact[key];
  if (!value) continue;
  node.textContent = value;
  if (key === "email" || key === "phone") {
    const link = document.createElement("a");
    link.textContent = value;
    link.href = (key === "email" ? "mailto:" : "tel:") + value;
    node.replaceChildren(link);
  }
}
const form = document.querySelector("#enquiry"),
  status = document.querySelector("#form-status"),
  download = document.querySelector("#download");
const fields = [...form.querySelectorAll("input,select,textarea")];
function validate(field) {
  let message = "";
  if (field.required && !field.value.trim())
    message =
      "Please enter " +
      (field.name === "interest"
        ? "an area of interest."
        : `your ${field.name}.`);
  else if (field.type === "email" && field.validity.typeMismatch)
    message = "Enter a valid email address.";
  else if (field.name === "message" && field.value.trim().length < 20)
    message = "Please add at least 20 characters.";
  field.setAttribute("aria-invalid", String(Boolean(message)));
  document.getElementById(field.id + "-error").textContent = message;
  return !message;
}
fields.forEach((field) => {
  field.addEventListener("blur", () => validate(field));
  field.addEventListener("input", () => {
    download.hidden = true;
    if (field.getAttribute("aria-invalid") === "true") validate(field);
  });
});
let enquiry = "";
if (contact.endpoint)
  document.querySelector("#form-note").textContent =
    "Tell us about your business and the opportunity you would like to explore.";
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  download.hidden = true;
  const valid = fields.map(validate).every(Boolean);
  if (!valid) {
    status.textContent = "Please check the highlighted fields.";
    fields
      .find((field) => field.getAttribute("aria-invalid") === "true")
      .focus();
    return;
  }
  const payload = Object.fromEntries(new FormData(form));
  enquiry = Object.entries(payload)
    .map(([key, value]) => `${key}: ${value.trim()}`)
    .join("\n\n");
  if (!contact.endpoint) {
    status.textContent =
      "Your enquiry is ready, but has not been sent. Online delivery is not configured. Download a copy to keep for later.";
    download.hidden = false;
    return;
  }
  const submit = form.querySelector("[type=submit]");
  submit.disabled = true;
  submit.textContent = "Sending…";
  status.textContent = "Sending your enquiry…";
  try {
    const response = await fetch(contact.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Delivery failed");
    status.textContent = "Thank you. Your enquiry has been submitted.";
    form.reset();
    fields.forEach((field) => field.removeAttribute("aria-invalid"));
  } catch {
    status.textContent =
      "We could not confirm delivery. Please try again later, or download your enquiry.";
    download.hidden = false;
  } finally {
    submit.disabled = false;
    submit.textContent = "Submit Enquiry ↗";
  }
});
download.addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([enquiry], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "fernleaf-enquiry.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
