// Elite Strikers Football Academy
// Client-side interactions:
// - Mobile navigation toggle
// - Smooth scroll to sections
// - Animated statistic counters
// - Enrollment form validation + Formspree submission
//
// This script runs in the BROWSER only. Do not run with Node.js.
// Open index.html in a browser (or use a local server) to use the site.

if (typeof document === "undefined" || typeof window === "undefined") {
  console.warn("This script is for the browser. Open index.html in a browser to run the website.");
  if (typeof process !== "undefined") process.exit(0);
}

document.addEventListener("DOMContentLoaded", function () {
  // Load editable content from content.json (client edits via admin page, not code)
  fetch("content.json")
    .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
    .then(function (data) {
      applyContent(data);
    })
    .catch(function () { /* keep default HTML content */ });
  initMobileNav();
  initSmoothScroll();
  initSectionObserver();
  initScrollProgress();
  initBackToTop();
  initScrollReveal();
  initCounters();
  initEnrollmentForm();
  setCurrentYear();
});

/**
 * Applies full content from content.json to the entire page (meta, header, hero, about, programs, why us, coaches, enroll, footer).
 */
function applyContent(data) {
  if (!data) return;

  function setEl(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text != null ? text : "";
  }
  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html != null ? html : "";
  }

  if (data.meta) {
    if (data.meta.pageTitle) document.title = data.meta.pageTitle;
    var metaDesc = document.getElementById("c-meta-description");
    if (metaDesc && data.meta.metaDescription) metaDesc.setAttribute("content", data.meta.metaDescription);
    var metaKw = document.getElementById("c-meta-keywords");
    if (metaKw && data.meta.metaKeywords) metaKw.setAttribute("content", data.meta.metaKeywords);
  }

  if (data.header) {
    setEl("c-logo-mark", data.header.logoMark);
    setEl("c-logo-title", data.header.logoTitle);
    setEl("c-logo-subtitle", data.header.logoSubtitle);
    var navEl = document.getElementById("c-header-nav");
    if (navEl && data.header.nav && data.header.nav.length) {
      var lastIsEnroll = data.header.nav.length && data.header.nav[data.header.nav.length - 1].label.toLowerCase() === "enroll";
      navEl.innerHTML = data.header.nav.map(function (n, i) {
        var cls = (lastIsEnroll && i === data.header.nav.length - 1) ? " class=\"nav-cta\"" : "";
        return "<li><a href=\"" + escapeHtml(n.href || "#") + "\"" + cls + ">" + escapeHtml(n.label || "") + "</a></li>";
      }).join("");
    }
  }

  if (data.hero) {
    setEl("c-hero-kicker", data.hero.kicker);
    setEl("c-hero-title", data.hero.title);
    setEl("c-hero-subtitle", data.hero.subtitle);
    setEl("c-hero-btn-primary", data.hero.btnPrimary);
    setEl("c-hero-btn-secondary", data.hero.btnSecondary);
    if (data.hero.stats && data.hero.stats.length) {
      var statsContainer = document.getElementById("c-hero-stats");
      if (statsContainer) {
        var statsHtml = data.hero.stats.map(function (s) {
          return "<div class=\"stat\"><span class=\"stat-number\" data-target=\"" + escapeHtml(String(s.value)) + "\">0</span><span class=\"stat-label\">" + escapeHtml(s.label || "") + "</span></div>";
        }).join("");
        statsContainer.innerHTML = statsHtml;
      }
    }
  }

  if (data.about) {
    setEl("c-about-title", data.about.title);
    setEl("c-about-p1", data.about.paragraph1);
    setEl("c-about-p2", data.about.paragraph2);
    var pillsEl = document.getElementById("c-about-pills");
    if (pillsEl && data.about.pills && data.about.pills.length) {
      pillsEl.innerHTML = data.about.pills.map(function (p) {
        return "<div class=\"pill\">" + escapeHtml(p || "") + "</div>";
      }).join("");
    }
  }

  if (data.programs) {
    setEl("c-programs-title", data.programs.title);
    setEl("c-programs-intro", data.programs.intro);
    var cardsEl = document.getElementById("c-programs-cards");
    if (cardsEl && data.programs.cards && data.programs.cards.length) {
      cardsEl.innerHTML = data.programs.cards.map(function (card) {
        var itemsHtml = (card.items || []).map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");
        return "<article class=\"card\"><h3>" + escapeHtml(card.title || "") + "</h3><p>" + escapeHtml(card.description || "") + "</p><ul>" + itemsHtml + "</ul></article>";
      }).join("");
    }
  }

  if (data.whyUs) {
    setEl("c-why-title", data.whyUs.title);
    setEl("c-why-intro", data.whyUs.intro);
    var featuresEl = document.getElementById("c-why-features");
    if (featuresEl && data.whyUs.features && data.whyUs.features.length) {
      featuresEl.innerHTML = data.whyUs.features.map(function (f) {
        return "<article class=\"feature\"><div class=\"feature-icon\" aria-hidden=\"true\">" + escapeHtml(f.icon || "") + "</div><h3>" + escapeHtml(f.title || "") + "</h3><p>" + escapeHtml(f.description || "") + "</p></article>";
      }).join("");
    }
  }

  if (data.coaches) {
    setEl("c-coaches-title", data.coaches.title);
    setEl("c-coaches-intro", data.coaches.intro);
    var container = document.getElementById("coaches-container");
    if (container && data.coaches.list && Array.isArray(data.coaches.list)) {
      var placeholders = ["coach-photo-1", "coach-photo-2", "coach-photo-3"];
      container.innerHTML = data.coaches.list.map(function (c, i) {
        var photoClass = placeholders[i % 3];
        var photoDiv = (c.photoUrl && c.photoUrl.trim())
          ? "<div class=\"coach-photo\"><img src=\"" + escapeHtml(c.photoUrl) + "\" alt=\"" + escapeHtml(c.name || "Coach") + "\"></div>"
          : "<div class=\"coach-photo " + photoClass + "\" aria-hidden=\"true\" title=\"Coach photo placeholder\"></div>";
        return "<article class=\"coach-card\">" + photoDiv + "<h3>" + escapeHtml(c.name || "") + "</h3><p class=\"coach-role\">" + escapeHtml(c.role || "") + "</p><p class=\"coach-bio\">" + escapeHtml(c.bio || "") + "</p></article>";
      }).join("");
    }
  }

  if (data.enroll) {
    setEl("c-enroll-title", data.enroll.title);
    setEl("c-enroll-intro", data.enroll.intro);
    var listEl = document.getElementById("c-enroll-list");
    if (listEl && data.enroll.listItems && data.enroll.listItems.length) {
      listEl.innerHTML = data.enroll.listItems.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");
    }
    var form = data.enroll.form;
    if (form) {
      setEl("c-form-name-label", form.playerNameLabel);
      setEl("c-form-age-label", form.ageLabel);
      setEl("c-form-phone-label", form.phoneLabel);
      setEl("c-form-email-label", form.emailLabel);
      setEl("c-form-program-label", form.programLabel);
      setEl("c-form-program-placeholder", form.programPlaceholder);
      setEl("c-form-time-legend", form.timeLegend);
      setEl("c-form-submit", form.submitLabel);
      var progSelect = document.getElementById("program");
      if (progSelect && form.programOptions && form.programOptions.length) {
        progSelect.innerHTML = "<option value=\"\">" + escapeHtml(form.programPlaceholder || "") + "</option>" + form.programOptions.map(function (o) {
          return "<option value=\"" + escapeHtml(o.value || "") + "\">" + escapeHtml(o.label || "") + "</option>";
        }).join("");
      }
      var timeOpts = document.getElementById("c-form-time-options");
      if (timeOpts && form.timeOptions && form.timeOptions.length) {
        timeOpts.innerHTML = form.timeOptions.map(function (o, i) {
          var req = i === 0 ? " required" : "";
          return "<label><input type=\"radio\" name=\"preferredTime\" value=\"" + escapeHtml(o.value || "") + "\"" + req + "> " + escapeHtml(o.label || "") + "</label>";
        }).join("");
      }
    }
    if (data.enroll.formspreeAction && document.getElementById("enrollment-form")) {
      document.getElementById("enrollment-form").setAttribute("action", data.enroll.formspreeAction);
    }
  }

  if (data.footer) {
    setEl("c-footer-logo-mark", data.footer.logoMark != null ? data.footer.logoMark : (data.footer.brandName ? data.footer.brandName.substring(0, 2).toUpperCase() : "ES"));
    setEl("c-footer-brand", data.footer.brandName);
    setEl("c-footer-tagline", data.footer.tagline);
    setEl("c-footer-contact-heading", data.footer.contactHeading);
    setEl("c-footer-social-heading", data.footer.socialHeading);
    setEl("c-footer-copyright", data.footer.copyrightText);
    if (data.footer.contact) {
      setHtml("contact-email", "Email: <a href=\"mailto:" + escapeHtml(data.footer.contact.email || "") + "\">" + escapeHtml(data.footer.contact.email || "") + "</a>");
      setHtml("contact-phone", "Phone: <a href=\"tel:" + escapeHtml((data.footer.contact.phone || "").replace(/\s/g, "")) + "\">" + escapeHtml(data.footer.contact.phone || "") + "</a>");
      setEl("contact-location", data.footer.contact.location);
    }
    if (data.footer.social && data.footer.social.length) {
      var socialList = document.getElementById("c-footer-social-list");
      if (socialList) {
        socialList.innerHTML = data.footer.social.map(function (s) {
          return "<li><a href=\"" + escapeHtml(s.url || "#") + "\" aria-label=\"" + escapeHtml(s.ariaLabel || s.label || "") + "\">" + escapeHtml(s.label || "") + "</a></li>";
        }).join("");
      }
    }
  }
}

function escapeHtml(text) {
  if (text == null || text === undefined) return "";
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// MOBILE NAV
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });

  nav.addEventListener("click", (event) => {
    const target = event.target;
    if (target.matches("a")) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// SMOOTH SCROLL
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href") || "";
      if (!hash.startsWith("#") || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}

// ACTIVE NAV LINK HIGHLIGHT
function initSectionObserver() {
  if (typeof IntersectionObserver === "undefined") return;

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  let activeId = null;

  function setActive(id) {
    if (!id || activeId === id) return;
    activeId = id;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const linkId = href.startsWith("#") ? href.slice(1) : null;
      if (linkId && linkId === id) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: "0px 0px -30% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
}

// SCROLL PROGRESS BAR
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + "%";
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// BACK TO TOP BUTTON
function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  const toggleVisibility = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    if (scrollTop > 300) {
      button.classList.add("visible");
    } else {
      button.classList.remove("visible");
    }
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// SCROLL REVEAL ANIMATIONS
function initScrollReveal() {
  if (typeof IntersectionObserver === "undefined") return;

  const elements = document.querySelectorAll(".reveal-on-scroll");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.25,
    }
  );

  elements.forEach((el) => observer.observe(el));
}

// COUNTERS
function initCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (!counters.length) return;

  const animateCounters = () => {
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target") || "0", 10);
      if (!target) return;

      const duration = 1600;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(progress * target);
        counter.textContent = value.toString();
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target.toString();
        }
      };

      requestAnimationFrame(step);
    });
  };

  const hero = document.querySelector(".hero");
  if (!hero) {
    animateCounters();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(hero);
}

// ENROLLMENT FORM
function initEnrollmentForm() {
  const form = document.getElementById("enrollment-form");
  const messageEl = document.getElementById("form-message");

  if (!form || !messageEl) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    messageEl.textContent = "";
    messageEl.className = "form-message";

    const validation = validateForm(form);
    if (!validation.valid) {
      showFieldErrors(validation.errors, form);
      messageEl.textContent = "Please correct the highlighted fields and try again.";
      messageEl.classList.add("error");
      return;
    }

    const endpoint = form.getAttribute("action");
    if (!endpoint || endpoint.includes("your-form-id")) {
      console.warn("Formspree endpoint not configured. Replace with your real Formspree form ID.");
      messageEl.textContent =
        "Form endpoint is not configured. Please contact the academy to complete your enrollment.";
      messageEl.classList.add("error");
      return;
    }

    try {
      const data = new FormData(form);
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        form.reset();
        messageEl.textContent =
          "Thank you for your enrollment request! Our team will contact you with next steps shortly.";
        messageEl.classList.add("success");
      } else {
        const result = await response.json().catch(() => null);
        const errorMessage =
          (result && result.error) ||
          "We couldn't submit your enrollment at this moment. Please try again in a little while.";
        messageEl.textContent = errorMessage;
        messageEl.classList.add("error");
      }
    } catch (error) {
      console.error(error);
      messageEl.textContent = "Network error. Please check your connection and try again.";
      messageEl.classList.add("error");
    }
  });
}

function validateForm(form) {
  const errors = {};

  const nameInput = form.querySelector("#player-name");
  const ageInput = form.querySelector("#age");
  const phoneInput = form.querySelector("#phone");
  const emailInput = form.querySelector("#email");
  const programSelect = form.querySelector("#program");
  const timeInputs = form.querySelectorAll('input[name="preferredTime"]');

  if (nameInput && !nameInput.value.trim()) {
    errors["player-name"] = "Please enter the player's name.";
  }

  if (ageInput) {
    const age = Number(ageInput.value);
    if (!ageInput.value) {
      errors["age"] = "Please enter the player's age.";
    } else if (Number.isNaN(age) || age < 6 || age > 18) {
      errors["age"] = "Age must be between 6 and 18.";
    }
  }

  if (phoneInput) {
    const phone = phoneInput.value.trim();
    if (!phone) {
      errors["phone"] = "Please enter a contact phone number.";
    } else if (!/^[\d+()\-\s]{7,}$/.test(phone)) {
      errors["phone"] = "Please enter a valid phone number.";
    }
  }

  if (emailInput) {
    const email = emailInput.value.trim();
    if (!email) {
      errors["email"] = "Please enter an email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors["email"] = "Please enter a valid email address.";
    }
  }

  if (programSelect && !programSelect.value) {
    errors["program"] = "Please select a training program.";
  }

  const timeSelected = Array.from(timeInputs).some((input) => input.checked);
  if (!timeSelected) {
    errors["preferredTime"] = "Please choose a preferred training time.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function clearFieldErrors(form) {
  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => input.classList.remove("input-invalid"));

  const errorEls = form.querySelectorAll(".field-error");
  errorEls.forEach((el) => {
    el.textContent = "";
  });
}

function showFieldErrors(errors, form) {
  Object.keys(errors).forEach((fieldId) => {
    const message = errors[fieldId];
    const input = form.querySelector("#" + fieldId);
    const errorEl = form.querySelector('.field-error[data-for="' + fieldId + '"]');

    if (input) {
      input.classList.add("input-invalid");
    }
    if (errorEl) {
      errorEl.textContent = message;
    }
  });
}

function setCurrentYear() {
  const yearEl = document.getElementById("current-year");
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear().toString();
}
