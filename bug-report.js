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

  const piiScanButton =
    document.querySelector("#pii-scan-button");

  const piiRedactButton =
    document.querySelector("#pii-redact-button");

  const piiStatus =
    document.querySelector("#pii-protection-status");

  const piiFindings =
    document.querySelector("#pii-findings");

  const piiConfirmation =
    document.querySelector("#pii-confirmation");

  const piiConfirmationCheckbox =
    document.querySelector("#pii-confirmation-checkbox");

  const piiProtectedFieldIds = [
    "title",
    "description",
    "steps",
    "expected",
    "actual",
    "device",
    "browser",
    "pageUrl",
    "evidenceUrl",
    "notes"
  ];

  let piiScanState = {
    scanned: false,
    findings: [],
    hasHighRisk: false,
    fingerprint: ""
  };

  let turnstileVerified = false;

  window.cwnTurnstileComplete = () => {
    turnstileVerified = true;
    hideMessage();
  };

  window.cwnTurnstileExpired = () => {
    turnstileVerified = false;

    showMessage(
      "Human verification expired. Please complete it again."
    );
  };

  window.cwnTurnstileError = () => {
    turnstileVerified = false;

    showMessage(
      "Human verification could not be completed. Please reload the page or try again."
    );
  };

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

    data.set(
      "personalInformationScan",
      piiScanState.scanned
        ? "completed"
        : "not-completed"
    );

    return Object.fromEntries(
      data.entries()
    );
  };

  const getPiiProtectedText = () =>
    piiProtectedFieldIds
      .map((fieldId) => {
        const field =
          document.getElementById(fieldId);

        return field?.value || "";
      })
      .join("\n");

  const getPiiFingerprint = () =>
    getPiiProtectedText();

  const resetPiiState = () => {
    piiScanState = {
      scanned: false,
      findings: [],
      hasHighRisk: false,
      fingerprint: ""
    };

    if (piiStatus) {
      piiStatus.className =
        "pii-protection-status";

      piiStatus.textContent =
        "Report content changed. Run the check again before submitting.";
    }

    if (piiFindings) {
      piiFindings.hidden = true;
      piiFindings.replaceChildren();
    }

    if (piiRedactButton) {
      piiRedactButton.hidden = true;
    }

    if (piiConfirmation) {
      piiConfirmation.hidden = true;
    }

    if (piiConfirmationCheckbox) {
      piiConfirmationCheckbox.checked =
        false;
    }
  };

  const renderPiiScan = (findings) => {
    const hasHighRisk =
      findings.some(
        (finding) =>
          finding.highRisk
      );

    const hasRedactable =
      findings.some(
        (finding) =>
          finding.redactable
      );

    piiScanState = {
      scanned: true,
      findings,
      hasHighRisk,
      fingerprint:
        getPiiFingerprint()
    };

    piiFindings.replaceChildren();

    if (findings.length === 0) {
      piiStatus.className =
        "pii-protection-status pii-protection-status-safe";

      piiStatus.textContent =
        "No obvious personal-information or credential patterns were detected.";

      piiFindings.hidden = true;
      piiRedactButton.hidden = true;
      piiConfirmation.hidden = true;
      piiConfirmationCheckbox.checked =
        false;

      return;
    }

    piiFindings.hidden = false;

    findings.forEach((finding) => {
      const row =
        document.createElement("div");

      row.className =
        "pii-finding";

      const name =
        document.createElement("strong");

      name.textContent =
        finding.type;

      const detail =
        document.createElement("span");

      detail.textContent =
        `${finding.count} possible ${
          finding.count === 1
            ? "match"
            : "matches"
        } · ${
          finding.redactable
            ? "Can be redacted"
            : "Must be removed"
        }`;

      row.append(name, detail);
      piiFindings.append(row);
    });

    if (hasHighRisk) {
      piiStatus.className =
        "pii-protection-status pii-protection-status-critical";

      piiStatus.textContent =
        "High-risk credential or secret patterns were detected. Remove them before submitting.";

      piiConfirmation.hidden = true;
      piiConfirmationCheckbox.checked =
        false;
    } else {
      piiStatus.className =
        "pii-protection-status pii-protection-status-warning";

      piiStatus.textContent =
        "Possible personal information was detected. Redact it or confirm that its inclusion is necessary.";

      piiConfirmation.hidden = false;
    }

    piiRedactButton.hidden =
      !hasRedactable;
  };

  const scanPiiContent = () => {
    const protection =
      window.CWNPersonalInfoProtection;

    if (!protection) {
      showMessage(
        "CWN Shield Personal Information Protection could not be loaded."
      );

      return [];
    }

    const findings =
      protection.scanText(
        getPiiProtectedText()
      );

    renderPiiScan(findings);

    return findings;
  };

  const redactPiiContent = () => {
    const protection =
      window.CWNPersonalInfoProtection;

    if (!protection) {
      return;
    }

    piiProtectedFieldIds.forEach(
      (fieldId) => {
        const field =
          document.getElementById(
            fieldId
          );

        if (!field?.value) {
          return;
        }

        const result =
          protection.redactText(
            field.value
          );

        field.value =
          result.text;

        field.dispatchEvent(
          new Event(
            "input",
            {
              bubbles: true
            }
          )
        );
      }
    );

    scanPiiContent();
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

  piiScanButton?.addEventListener(
    "click",
    scanPiiContent
  );

  piiRedactButton?.addEventListener(
    "click",
    redactPiiContent
  );

  piiProtectedFieldIds.forEach(
    (fieldId) => {
      document
        .getElementById(fieldId)
        ?.addEventListener(
          "input",
          () => {
            if (
              piiScanState.scanned &&
              piiScanState.fingerprint !==
                getPiiFingerprint()
            ) {
              resetPiiState();
            }
          }
        );
    }
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

      if (!turnstileVerified) {
        showMessage(
          "Please complete the human verification before submitting."
        );

        return;
      }

      if (
        !piiScanState.scanned ||
        piiScanState.fingerprint !==
          getPiiFingerprint()
      ) {
        scanPiiContent();

        showMessage(
          "Review the CWN Shield personal-information check before submitting."
        );

        return;
      }

      if (piiScanState.hasHighRisk) {
        showMessage(
          "Remove all detected credentials, tokens, secrets or private keys before submitting."
        );

        return;
      }

      if (
        piiScanState.findings.length > 0 &&
        !piiConfirmationCheckbox.checked
      ) {
        showMessage(
          "Redact the detected personal information or confirm that its inclusion is necessary."
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

      turnstileVerified = false;
      resetPiiState();

      if (
        window.turnstile &&
        typeof window.turnstile.reset === "function"
      ) {
        window.turnstile.reset();
      }

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
