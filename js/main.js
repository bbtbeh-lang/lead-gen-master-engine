/* ==========================================================================
   main.js — Lead-Gen Master Engine
   Pixflow Agency — Vanilla JS, no dependencies
   Handles: mobile nav toggle, lead form validation & submission
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Mobile Nav Toggle                                                   */
  /* ------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const navList = document.querySelector(".pf-nav__list");
  const headerActions = document.querySelector(".pf-header__actions");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navList.classList.toggle("is-open");
      if (headerActions) headerActions.classList.toggle("is-open");
      navToggle.setAttribute("aria-label", isOpen ? "باز کردن منو" : "بستن منو");
    });

    // Close mobile menu after clicking a nav link
    navList.querySelectorAll(".pf-nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "باز کردن منو");
        navList.classList.remove("is-open");
        if (headerActions) headerActions.classList.remove("is-open");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Lead Form — Validation & Submission                                 */
  /* ------------------------------------------------------------------ */
  const leadForm = document.getElementById("lead-form");
  if (!leadForm) return;

  // [CLIENT INPUT REQUIRED]: replace with the real lead-capture endpoint
  // (e.g. a serverless function, Formspree, or the Level 2/3 admin API).
  const LEAD_ENDPOINT = "[CLIENT INPUT REQUIRED: form submission endpoint URL]";

  const fields = {
    name: leadForm.querySelector("#lead-name"),
    phone: leadForm.querySelector("#lead-phone"),
    service: leadForm.querySelector("#lead-service"),
    message: leadForm.querySelector("#lead-message"),
  };

  const submitBtn = leadForm.querySelector('button[type="submit"]');
  const submitBtnDefaultText = submitBtn ? submitBtn.textContent : "";

  // Basic Iranian/international-friendly phone check: digits, +, spaces, dashes, 8-15 chars
  const PHONE_PATTERN = /^[0-9+\s-]{8,15}$/;

  function clearFieldError(field) {
    field.classList.remove("pf-input--error");
    const existing = field.parentElement.querySelector(".pf-field__error");
    if (existing) existing.remove();
  }

  function setFieldError(field, message) {
    clearFieldError(field);
    field.classList.add("pf-input--error");
    const err = document.createElement("span");
    err.className = "pf-field__error";
    err.setAttribute("role", "alert");
    err.textContent = message;
    field.parentElement.appendChild(err);
  }

  function validateForm() {
    let isValid = true;

    // Name: required, at least 2 characters
    const nameVal = fields.name.value.trim();
    if (nameVal.length < 2) {
      setFieldError(fields.name, "لطفاً نام و نام خانوادگی را وارد کنید.");
      isValid = false;
    } else {
      clearFieldError(fields.name);
    }

    // Phone: required, valid pattern
    const phoneVal = fields.phone.value.trim();
    if (!PHONE_PATTERN.test(phoneVal)) {
      setFieldError(fields.phone, "لطفاً یک شماره تماس معتبر وارد کنید.");
      isValid = false;
    } else {
      clearFieldError(fields.phone);
    }

    return isValid;
  }

  function showFormStatus(type, text) {
    let statusEl = leadForm.querySelector(".pf-lead-form__status");
    if (!statusEl) {
      statusEl = document.createElement("p");
      statusEl.className = "pf-lead-form__status";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
      leadForm.appendChild(statusEl);
    }
    statusEl.textContent = text;
    statusEl.classList.remove("is-success", "is-error");
    statusEl.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function setLoadingState(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "در حال ارسال..." : submitBtnDefaultText;
  }

  async function submitLead(payload) {
    // Placeholder network call. Swap LEAD_ENDPOINT with the real backend
    // once Admin Level (Level 1/2/3) and hosting are finalized.
    const response = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Submission failed with status " + response.status);
    }

    return response.json().catch(function () {
      return {};
    });
  }

  leadForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateForm()) {
      showFormStatus("error", "لطفاً خطاهای فرم را برطرف کنید.");
      return;
    }

    const payload = {
      name: fields.name.value.trim(),
      phone: fields.phone.value.trim(),
      service: fields.service ? fields.service.value : "",
      message: fields.message ? fields.message.value.trim() : "",
      source: "lead-gen-engine",
      page: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    setLoadingState(true);

    submitLead(payload)
      .then(function () {
        showFormStatus("success", "درخواست شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.");
        leadForm.reset();
      })
      .catch(function () {
        showFormStatus("error", "ارسال فرم با خطا مواجه شد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.");
      })
      .finally(function () {
        setLoadingState(false);
      });
  });

  // Clear field-level error as soon as the user starts correcting it
  [fields.name, fields.phone].forEach(function (field) {
    field.addEventListener("input", function () {
      clearFieldError(field);
    });
  });
})();
