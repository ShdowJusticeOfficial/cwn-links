(() => {
  "use strict";

  const form =
    document.querySelector("#bug-report-form");

  const submitButton =
    document.querySelector("#bug-submit-button");

  const submitLabel =
    document.querySelector("#bug-submit-label");

  const message =
    document.querySelector("#bug-form-message");

  const success =
    document.querySelector("#bug-success");

  const reference =
    document.querySelector("#bug-reference");

  const anotherButton =
    document.querySelector("#submit-another-report");

  const severity =
    document.querySelector("#severity");

  const severityPreview =
    document.querySelector("#severity-preview");

  const severityDot =
    document.querySelector("#severity-dot");

  const severityLabel =
    document.querySelector("#severity-label");

  const severityDescription =
    document.querySelector("#severity-description");

  const progress =
    document.querySelector("#bug-progress");

  const fieldsWithCounters = [
    ["title", "title-counter", 120],
    ["description", "description-counter", 1800],
    ["steps", "steps-counter", 1200]
  ];

  const severityDetails = {
    low: {
      label: "Low severity",
      description:
        "A minor issue that does not prevent normal use.",
      colour: "#58f58a"
    },

    medium: {
      label: "Medium severity",
      description:
        "A feature is partly broken or difficult to use.",
      colour: "#ffd166"
    },

    high: {
      label: "High severity",
      description:
        "A major feature is unusable or significantly disrupted.",
      colour: "#ff9f43"
    },

    critical: {
      label: "Critical severity",
      description:
        "A serious security issue, data exposure or total outage.",
      colour: "#ff5c5c"
    }
  };

  if (!form) {
    return;
  }

  const showMessage = (
    text,
    type = "error"
  ) => {
    message.textContent = text;
    message.className =
      `bug-form-message bug-form-message-${type}`;

    message.hidden = false;
    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };

  const hideMessage = () => {
    message.hidden = true;
    message.textContent = "";
  };

  const setSubmitting = (submitting) => {
    submitButton.disabled = submitting;

    submitLabel.textContent =
      submitting
        ? "Sending Report…"
        : "Submit Bug Report";
  };

  const collectPayload = () => {
    const data =
      new FormData(form);

    return Object.fromEntries(
      data.entries()
    );
  };

  const updateSeverity = () => {
    const details =
      severityDetails[
        severity.value
      ];

    if (!details) {
      severityPreview.hidden = true;
      return;
    }

    severityPreview.hidden = false;
    severityDot.style.background =
      details.colour;

    severityDot.style.boxShadow =
      `0 0 11px ${details.colour}`;

    severityLabel.textContent =
      details.label;

    severityDescription.textContent =
      details.description;
  };

  fieldsWithCounters.forEach(
    ([fieldId, counterId, maximum]) => {
      const field =
        document.getElementById(fieldId);

      const counter =
        document.getElementById(counterId);

      const update = () => {
        counter.textContent =
          `${field.value.length} / ${maximum}`;
      };

      field.addEventListener(
        "input",
        update
      );

      update();
    }
  );

  severity.addEventListener(
    "change",
    updateSeverity
  );

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      hideMessage();

      if (!form.checkValidity()) {
        form.reportValidity();

        showMessage(
          "Please complete every required field and correct any invalid values."
        );

        return;
      }

      const lastSubmission =
        Number(
          localStorage.getItem(
            "cwnBugLastSubmission"
          ) || 0
        );

      const elapsed =
        Date.now() -
        lastSubmission;

      const clientCooldown =
        60 * 1000;

      if (elapsed < clientCooldown) {
        const seconds =
          Math.ceil(
            (clientCooldown - elapsed) /
            1000
          );

        showMessage(
          `Please wait ${seconds} seconds before sending another report.`
        );

        return;
      }

      setSubmitting(true);

      try {
        const response =
          await fetch(
            "/api/bug-report",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify(
                collectPayload()
              )
            }
          );

        const responseData =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            responseData.error ||
            "The report could not be submitted."
          );
        }

        localStorage.setItem(
          "cwnBugLastSubmission",
          String(Date.now())
        );

        form.hidden = true;
        success.hidden = false;

        reference.textContent =
          responseData.reference ||
          "CWN-BUG-SUBMITTED";

        success.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } catch (error) {
        showMessage(
          error.message ||
          "An unexpected submission error occurred."
        );
      } finally {
        setSubmitting(false);
      }
    }
  );

  anotherButton.addEventListener(
    "click",
    () => {
      form.reset();
      updateSeverity();

      fieldsWithCounters.forEach(
        ([fieldId]) => {
          document
            .getElementById(fieldId)
            .dispatchEvent(
              new Event("input")
            );
        }
      );

      success.hidden = true;
      form.hidden = false;
      hideMessage();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );

  window.addEventListener(
    "scroll",
    () => {
      const maximum =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      const percentage =
        maximum > 0
          ? Math.min(
              100,
              (window.scrollY /
                maximum) *
                100
            )
          : 0;

      progress.style.width =
        `${percentage}%`;
    },
    {
      passive: true
    }
  );

  const deviceInput =
    document.querySelector("#device");

  const browserInput =
    document.querySelector("#browser");

  const pageUrlInput =
    document.querySelector("#pageUrl");

  if (pageUrlInput) {
    pageUrlInput.value =
      document.referrer.startsWith(
        window.location.origin
      )
        ? document.referrer
        : "";
  }

  if (deviceInput && !deviceInput.value) {
    deviceInput.value =
      `${navigator.platform || "Unknown device"}`;
  }

  if (browserInput && !browserInput.value) {
    browserInput.value =
      navigator.userAgent
        .slice(0, 150);
  }

  updateSeverity();
})();
