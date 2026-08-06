"use strict";

(() => {
  const launchTime =
    new Date(
      "2026-08-28T23:00:00.000Z"
    ).getTime();

  const elements = {
    days:
      document.getElementById(
        "maintenance-days"
      ),
    hours:
      document.getElementById(
        "maintenance-hours"
      ),
    minutes:
      document.getElementById(
        "maintenance-minutes"
      ),
    seconds:
      document.getElementById(
        "maintenance-seconds"
      ),
    form:
      document.getElementById(
        "maintenance-access-form"
      ),
    key:
      document.getElementById(
        "maintenance-key"
      ),
    message:
      document.getElementById(
        "maintenance-message"
      )
  };

  function formatNumber(value) {
    return String(value)
      .padStart(2, "0");
  }

  function updateCountdown() {
    const remaining =
      Math.max(
        0,
        launchTime - Date.now()
      );

    const totalSeconds =
      Math.floor(
        remaining / 1000
      );

    const days =
      Math.floor(
        totalSeconds / 86400
      );

    const hours =
      Math.floor(
        (
          totalSeconds % 86400
        ) / 3600
      );

    const minutes =
      Math.floor(
        (
          totalSeconds % 3600
        ) / 60
      );

    const seconds =
      totalSeconds % 60;

    if (elements.days) {
      elements.days.textContent =
        formatNumber(days);
    }

    if (elements.hours) {
      elements.hours.textContent =
        formatNumber(hours);
    }

    if (elements.minutes) {
      elements.minutes.textContent =
        formatNumber(minutes);
    }

    if (elements.seconds) {
      elements.seconds.textContent =
        formatNumber(seconds);
    }
  }

  function showMessage(
    text,
    type
  ) {
    if (!elements.message) {
      return;
    }

    elements.message.hidden = false;
    elements.message.textContent =
      text;

    elements.message.classList
      .remove(
        "success",
        "error"
      );

    if (type) {
      elements.message.classList
        .add(type);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (
      !elements.form ||
      !elements.key
    ) {
      return;
    }

    const button =
      elements.form.querySelector(
        'button[type="submit"]'
      );

    const password =
      elements.key.value;

    if (!password) {
      showMessage(
        "Enter the authorised developer bypass key.",
        "error"
      );

      elements.key.focus();
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent =
        "Authorising…";
    }

    showMessage(
      "Verifying developer access…",
      null
    );

    try {
      const response =
        await fetch(
          "/api/maintenance/login",
          {
            method: "POST",
            credentials:
              "same-origin",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                password
              })
          }
        );

      let result = {};

      try {
        result =
          await response.json();
      } catch {
        result = {};
      }

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
          "Developer access could not be authorised."
        );
      }

      elements.key.value = "";

      showMessage(
        "Access authorised. Opening the development website…",
        "success"
      );

      window.setTimeout(
        () => {
          window.location.assign(
            result.redirect || "/"
          );
        },
        500
      );
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Developer access could not be authorised.",
        "error"
      );

      elements.key.select();
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "Authorise";
      }
    }
  }

  updateCountdown();

  window.setInterval(
    updateCountdown,
    1000
  );

  if (elements.form) {
    elements.form.addEventListener(
      "submit",
      handleLogin
    );
  }
})();
