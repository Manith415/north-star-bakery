"use strict";

// These products match the categories and price ranges on the existing site.
const products = [
  { id: "signature-loaf", name: "Signature Loaf", category: "breads", price: "$8 per loaf", description: "Our featured loaf for sandwiches and sharing." },
  { id: "morning-pastries", name: "Morning Pastries", category: "pastries", price: "$3–$6 each", description: "Ask about today's cookies, muffins, and pastries." },
  { id: "celebration-cake", name: "Celebration Cake", category: "cakes", price: "$25–$45", description: "Plan a sweet addition to a birthday or gathering." }
];
const categories = ["all", "breads", "pastries", "cakes"];
const storageKey = "northStarBakery.preferences.v1";
let favoriteIds = [];
let selectedCategory = "all";

// Check stored data instead of trusting an old or damaged storage entry.
function normalizePreferences(data) {
  const source = data && typeof data === "object" ? data : {};
  const ids = Array.isArray(source.favoriteIds) ? source.favoriteIds : [];
  const validIds = [];
  ids.forEach(id => {
    if (products.some(product => product.id === id) && !validIds.includes(id)) validIds.push(id);
  });
  return {
    favoriteIds: validIds,
    selectedCategory: categories.includes(source.selectedCategory) ? source.selectedCategory : "all"
  };
}

function showStorageWarning() {
  const message = document.getElementById("storage-message");
  if (message) {
    message.textContent = "Your browser cannot save these choices right now. You can still use this page, but your changes may not stay after you leave.";
  }
}

function loadPreferences() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const preferences = normalizePreferences(raw ? JSON.parse(raw) : null);
    favoriteIds = preferences.favoriteIds;
    selectedCategory = preferences.selectedCategory;
  } catch (error) {
    favoriteIds = [];
    selectedCategory = "all";
    showStorageWarning();
  }
}

function savePreferences() {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ favoriteIds, selectedCategory }));
  } catch (error) {
    showStorageWarning();
  }
}

function getFavoriteProducts() {
  return products.filter(product => favoriteIds.includes(product.id));
}

function renderFavorites() {
  const list = document.getElementById("favorite-list");
  if (!list) return;
  list.replaceChildren();
  const favorites = getFavoriteProducts();
  const count = document.getElementById("favorite-count");
  if (count) count.textContent = String(favorites.length);
  document.getElementById("favorites-empty").hidden = favorites.length > 0;

  favorites.forEach(product => {
    const item = document.createElement("li");
    item.textContent = `${product.name} — ${product.price}`;
    list.append(item);
  });
  const clearButton = document.getElementById("clear-favorites");
  if (clearButton) clearButton.disabled = favorites.length === 0;
  const addButton = document.getElementById("use-favorites");
  if (addButton) addButton.disabled = favorites.length === 0;
}

function renderProducts() {
  const list = document.getElementById("favorite-products");
  if (!list) return;
  list.replaceChildren();
  const visibleProducts = products.filter(product => selectedCategory === "all" || product.category === selectedCategory);
  visibleProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "favorite-product";
    const heading = document.createElement("h3");
    heading.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = product.description;
    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = product.price;
    const button = document.createElement("button");
    button.type = "button";
    const saved = favoriteIds.includes(product.id);
    button.textContent = saved ? "Remove favorite" : "Save favorite";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} favorites`);
    button.dataset.productId = product.id;
    button.addEventListener("click", () => toggleFavorite(product.id));
    card.append(heading, description, price, button);
    list.append(card);
  });
  document.getElementById("filter-result").textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "item" : "items"} shown.`;
}

function toggleFavorite(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  const wasSaved = favoriteIds.includes(id);
  if (wasSaved) favoriteIds = favoriteIds.filter(savedId => savedId !== id);
  else favoriteIds.push(id);
  savePreferences();
  renderProducts();
  renderFavorites();
  document.getElementById("feature-message").textContent = `${product.name} ${wasSaved ? "removed from" : "added to"} your favorites.`;
  // Rendering replaces buttons, so restore keyboard focus to the same item.
  const replacement = document.querySelector(`[data-product-id="${id}"]`);
  if (replacement) replacement.focus();
}

function initializeProducts() {
  const filter = document.getElementById("category-filter");
  if (!filter) return;
  document.getElementById("favorites-controls").hidden = false;
  filter.value = selectedCategory;
  filter.addEventListener("change", () => {
    selectedCategory = categories.includes(filter.value) ? filter.value : "all";
    savePreferences();
    renderProducts();
    document.getElementById("feature-message").textContent = "Category updated. Changing categories does not remove your favorites.";
  });
  document.getElementById("clear-favorites").addEventListener("click", () => {
    favoriteIds = [];
    savePreferences();
    renderProducts();
    renderFavorites();
    document.getElementById("feature-message").textContent = "All favorites cleared.";
    filter.focus();
  });
  renderProducts();
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10));
}

// Pure validation logic keeps the checks readable and easy to test.
function getValidationErrors(values, today = todayString()) {
  const errors = {};
  const name = values["customer-name"].trim();
  const email = values.email.trim();
  const details = values.details.trim();
  const pickup = values["pickup-date"];
  if (name.length < 2 || name.length > 60) errors["customer-name"] = "Enter your name using 2 to 60 characters.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address, such as name@example.com.";
  if (!["preorder", "question"].includes(values["request-type"])) errors["request-type"] = "Choose Preorder or General question.";
  if (values["request-type"] === "preorder" && !pickup) {
    errors["pickup-date"] = "Choose a pickup date for your preorder.";
  } else if (pickup) {
    if (!isRealDate(pickup) || pickup < today) errors["pickup-date"] = "Choose today or a future pickup date.";
    else if (new Date(`${pickup}T12:00:00`).getDay() === 1) errors["pickup-date"] = "The bakery is closed on Mondays. Choose another day.";
  }
  if (details.length < 10 || details.length > 500) errors.details = "Enter 10 to 500 characters about your items or question.";
  if (values.allergies.trim().length > 300) errors.allergies = "Keep allergy notes to 300 characters or fewer.";
  return errors;
}

const formFieldIds = ["customer-name", "email", "request-type", "pickup-date", "details", "allergies"];

function readFormValues() {
  const values = {};
  formFieldIds.forEach(id => { values[id] = document.getElementById(id).value; });
  return values;
}

function showFieldError(id, message) {
  const field = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  error.textContent = message || "";
  error.hidden = !message;
  field.setAttribute("aria-invalid", String(Boolean(message)));
}

function updateValidationSummary(errors) {
  const count = Object.keys(errors).length;
  document.getElementById("form-errors").textContent = count ? `Please correct ${count} ${count === 1 ? "field" : "fields"} below. Your entries have been kept.` : "";
}

function useFavoritesInRequest(existingText) {
  const additions = getFavoriteProducts().map(product => product.name).filter(name => !existingText.includes(name));
  if (additions.length === 0) return existingText;
  return `${existingText.trim()}${existingText.trim() ? "\n" : ""}I am interested in: ${additions.join(", ")}.`;
}

function initializeForm() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  document.getElementById("contact-favorites").hidden = false;
  // Native HTML validation remains the fallback when JavaScript is disabled.
  form.noValidate = true;
  const pickup = document.getElementById("pickup-date");
  pickup.min = todayString();
  let validationAttempted = false;

  form.addEventListener("submit", event => {
    // This course demonstration never sends requests or changes the page URL.
    event.preventDefault();
    validationAttempted = true;
    const errors = getValidationErrors(readFormValues());
    formFieldIds.forEach(id => showFieldError(id, errors[id]));
    updateValidationSummary(errors);
    const firstInvalid = formFieldIds.find(id => errors[id]);
    const status = document.getElementById("form-status");
    status.textContent = "";
    if (firstInvalid) {
      document.getElementById(firstInvalid).focus();
      return;
    }
    status.textContent = "Your request passes all checks. This practice form does not send requests or place orders.";
    status.focus();
  });

  function checkEditedFields() {
    document.getElementById("form-status").textContent = "";
    if (!validationAttempted) return;
    const errors = getValidationErrors(readFormValues());
    formFieldIds.forEach(id => showFieldError(id, errors[id]));
    updateValidationSummary(errors);
  }
  form.addEventListener("input", checkEditedFields);
  form.addEventListener("change", checkEditedFields);
  document.getElementById("request-type").addEventListener("change", event => {
    pickup.required = event.target.value === "preorder";
  });
  pickup.required = document.getElementById("request-type").value === "preorder";
  document.getElementById("use-favorites").addEventListener("click", () => {
    const details = document.getElementById("details");
    details.value = useFavoritesInRequest(details.value);
    document.getElementById("request-type").value = "preorder";
    pickup.required = true;
    checkEditedFields();
    document.getElementById("favorites-message").textContent = "Your saved items are in the request details. Add quantities and a pickup date before checking your request.";
    details.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPreferences();
  initializeProducts();
  renderFavorites();
  initializeForm();
});
