const body = document.body;
const openSidebarButton = document.querySelector(".sidebar-open");
const closeSidebarButton = document.querySelector(".sidebar-close");
const sidebarBackdrop = document.querySelector(".sidebar-backdrop");
const mobileBrandButton = document.querySelector(".mobile-brand");
const navButtons = document.querySelectorAll("[data-view]");
const panels = document.querySelectorAll("[data-panel]");
const promptButtons = document.querySelectorAll("[data-prompt]");
const chatScroll = document.querySelector(".chat-scroll");
const composer = document.querySelector(".composer");
const composerInput = composer?.querySelector("textarea");
const composerButton = composer?.querySelector("button");
const contactForm = document.querySelector(".contact-form");
const contactSubmitButton = contactForm?.querySelector(".contact-submit");
const contactStatus = contactForm?.querySelector(".contact-form-status");
const startupCards = Array.from(document.querySelectorAll(".startup-card"));
const startupShowcase = document.querySelector(".startup-showcase");
const dotsWrap = document.querySelector(".carousel-dots");
const prevButton = document.querySelector(".carousel-arrow.prev");
const nextButton = document.querySelector(".carousel-arrow.next");
const themeToggle = document.querySelector(".theme-toggle");
const themeStorageKey = "shaleen-portfolio-theme";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const promptViews = {
  about: "about",
  standout: "standout",
  startups: "startups",
  tech: "tech",
  contact: "contact",
  proud: "proud",
};

function getSavedTheme() {
  try {
    return localStorage.getItem(themeStorageKey);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Keep the toggle working even if storage is unavailable.
  }
}

function applyTheme(theme) {
  const activeTheme = theme === "dark" ? "dark" : "light";
  body.dataset.theme = activeTheme;
  document.documentElement.style.colorScheme = activeTheme;
  themeToggle?.setAttribute("aria-pressed", String(activeTheme === "dark"));
  themeToggle?.setAttribute(
    "aria-label",
    activeTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
  );
}

function openSidebar() {
  body.classList.add("sidebar-visible");
}

function closeSidebar() {
  body.classList.remove("sidebar-visible");
}

function showPanel(panelName) {
  panels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.panel === panelName);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === panelName);
  });

  if (chatScroll) chatScroll.scrollTop = 0;

  if (panelName === "startups") {
    startStartupMotion();
  } else {
    stopStartupMotion();
  }

  closeSidebar();
}

function selectPrompt(promptName) {
  showPanel(promptViews[promptName] || "welcome");
}

openSidebarButton?.addEventListener("click", openSidebar);
closeSidebarButton?.addEventListener("click", closeSidebar);
sidebarBackdrop?.addEventListener("click", closeSidebar);
mobileBrandButton?.addEventListener("click", () => showPanel("welcome"));
themeToggle?.addEventListener("click", () => {
  const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  saveTheme(nextTheme);
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => showPanel(button.dataset.view));
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => selectPrompt(button.dataset.prompt));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSidebar();
});

let currentCard = 0;
let startupTimer;

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  startupCards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show startup ${index + 1}`);
    dot.addEventListener("click", () => {
      showStartup(index);
      restartStartupMotion();
    });
    dotsWrap.appendChild(dot);
  });
}

function showStartup(index) {
  if (!startupCards.length) return;
  currentCard = (index + startupCards.length) % startupCards.length;
  startupCards.forEach((card, cardIndex) => {
    const forwardOffset = (cardIndex - currentCard + startupCards.length) % startupCards.length;
    const isCurrent = forwardOffset === 0;
    const isNext = forwardOffset === 1;
    const isPrev = forwardOffset === startupCards.length - 1;

    card.classList.toggle("is-current", isCurrent);
    card.classList.toggle("is-next", isNext);
    card.classList.toggle("is-prev", isPrev);
    card.classList.toggle("is-away", !isCurrent && !isNext && !isPrev);
    card.setAttribute("aria-hidden", String(!isCurrent));
  });
  dotsWrap?.querySelectorAll("button").forEach((dot, dotIndex) => {
    const isActive = dotIndex === currentCard;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function stopStartupMotion() {
  window.clearInterval(startupTimer);
}

function startStartupMotion() {
  stopStartupMotion();
  const activePanel = document.querySelector(".view-panel.is-visible")?.dataset.panel;
  if (activePanel !== "startups") return;
  if (prefersReducedMotion.matches || startupCards.length < 2) return;
  startupTimer = window.setInterval(() => showStartup(currentCard + 1), 7200);
}

function restartStartupMotion() {
  stopStartupMotion();
  startStartupMotion();
}

prevButton?.addEventListener("click", () => {
  showStartup(currentCard - 1);
  restartStartupMotion();
});
nextButton?.addEventListener("click", () => {
  showStartup(currentCard + 1);
  restartStartupMotion();
});
startupShowcase?.addEventListener("mouseenter", stopStartupMotion);
startupShowcase?.addEventListener("mouseleave", startStartupMotion);
startupShowcase?.addEventListener("focusin", stopStartupMotion);
startupShowcase?.addEventListener("focusout", startStartupMotion);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopStartupMotion();
  } else {
    startStartupMotion();
  }
});

renderDots();
showStartup(0);

applyTheme(getSavedTheme() || "light");
showPanel("welcome");

function inferPanelFromMessage(message) {
  const text = message.toLowerCase();
  if (text.includes("resume") || text.includes("cv")) return "resume";
  if (text.includes("experience") || text.includes("work history") || text.includes("rentzoo")) return "experience";
  if (text.includes("tech") || text.includes("skill") || text.includes("stack")) return "tech";
  if (text.includes("proud") || text.includes("favorite") || text.includes("favourite")) return "proud";
  if (text.includes("project")) return "projects";
  if (text.includes("startup") || text.includes("tirth") || text.includes("build")) return "startups";
  if (text.includes("contact") || text.includes("email") || text.includes("linkedin")) return "contact";
  if (text.includes("stand") || text.includes("different")) return "standout";
  if (text.includes("about") || text.includes("yourself")) return "about";
  return "welcome";
}

function resizeComposer() {
  if (!composerInput) return;
  composerInput.style.height = "auto";
  composerInput.style.height = `${Math.min(composerInput.scrollHeight, 128)}px`;
}

composerInput?.addEventListener("input", () => {
  const hasText = composerInput.value.trim().length > 0;
  composerButton.disabled = !hasText;
  resizeComposer();
});

composer?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = composerInput.value.trim();
  if (!message) return;
  showPanel(inferPanelFromMessage(message));
  composerInput.value = "";
  composerButton.disabled = true;
  resizeComposer();
});

function setContactStatus(message, type = "success") {
  if (!contactStatus) return;
  contactStatus.textContent = message;
  contactStatus.classList.toggle("is-error", type === "error");
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const submitLabel = contactSubmitButton?.querySelector("span");
  const defaultLabel = submitLabel?.textContent || "Send Message";
  const formData = new FormData(contactForm);

  if (contactSubmitButton) contactSubmitButton.disabled = true;
  if (submitLabel) submitLabel.textContent = "Sending...";
  setContactStatus("");

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Contact form submission failed");
    }

    contactForm.reset();
    setContactStatus("Message sent successfully. I will reply soon.");
  } catch {
    setContactStatus("Message could not be sent. Please email me directly.", "error");
  } finally {
    if (contactSubmitButton) contactSubmitButton.disabled = false;
    if (submitLabel) submitLabel.textContent = defaultLabel;
  }
});
