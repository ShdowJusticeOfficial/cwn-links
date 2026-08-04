(() => {
  "use strict";

  const HIGH_RISK_TYPES = new Set([
    "Private key",
    "Discord credential",
    "JWT or bearer token",
    "GitHub token",
    "AWS access key",
    "Google API key",
    "Cloudflare API token",
    "Generic secret"
  ]);

  /*
   * These patterns are advisory. Pattern matching can produce false
   * positives and cannot detect every form of personal information.
   */
  const DETECTORS = [
    {
      type: "Private key",
      severity: "critical",
      redactable: false,
      pattern:
        /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/gi
    },
    {
      type: "Discord credential",
      severity: "critical",
      redactable: false,
      pattern:
        /(?:mfa\.[A-Za-z0-9_-]{20,}|[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,})/g
    },
    {
      type: "JWT or bearer token",
      severity: "critical",
      redactable: false,
      pattern:
        /(?:Bearer\s+)?eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,}/gi
    },
    {
      type: "GitHub token",
      severity: "critical",
      redactable: false,
      pattern:
        /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,255}\b/g
    },
    {
      type: "AWS access key",
      severity: "critical",
      redactable: false,
      pattern:
        /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g
    },
    {
      type: "Google API key",
      severity: "critical",
      redactable: false,
      pattern:
        /\bAIza[0-9A-Za-z_-]{30,45}\b/g
    },
    {
      type: "Cloudflare API token",
      severity: "critical",
      redactable: false,
      pattern:
        /\b[A-Za-z0-9_-]{35,45}\b/g,
      context:
        /\b(?:cloudflare|cf[_ -]?api|api[_ -]?token)\b/i
    },
    {
      type: "Generic secret",
      severity: "critical",
      redactable: false,
      pattern:
        /\b(?:api[_ -]?key|secret|token|password|passwd)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}["']?/gi
    },
    {
      type: "Email address",
      severity: "high",
      redactable: true,
      pattern:
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      replacement: "[REDACTED EMAIL]"
    },
    {
      type: "IPv4 address",
      severity: "high",
      redactable: true,
      pattern:
        /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
      replacement: "[REDACTED IP ADDRESS]"
    },
    {
      type: "IPv6 address",
      severity: "high",
      redactable: true,
      pattern:
        /\b(?:[A-F0-9]{1,4}:){2,7}[A-F0-9]{1,4}\b/gi,
      replacement: "[REDACTED IP ADDRESS]"
    },
    {
      type: "Phone number",
      severity: "high",
      redactable: true,
      pattern:
        /(?:^|[^\w])(\+?\d[\d ()-]{7,}\d)(?=$|[^\w])/g,
      replacement: "[REDACTED PHONE NUMBER]",
      validate(match) {
        const digits =
          match.replace(/\D/g, "");

        return (
          digits.length >= 9 &&
          digits.length <= 15
        );
      }
    },
    {
      type: "UK postcode",
      severity: "medium",
      redactable: true,
      pattern:
        /\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/gi,
      replacement: "[REDACTED POSTCODE]"
    },
    {
      type: "Geographic coordinates",
      severity: "high",
      redactable: true,
      pattern:
        /(?:^|[^\d])-?(?:[0-8]?\d(?:\.\d{4,})?|90(?:\.0+)?)[,\s]+-?(?:1[0-7]\d(?:\.\d{4,})?|180(?:\.0+)?|\d?\d(?:\.\d{4,})?)(?=$|[^\d])/g,
      replacement: "[REDACTED COORDINATES]"
    }
  ];

  const getMatches = (
    text,
    detector
  ) => {
    const input =
      String(text ?? "");

    const pattern =
      detector?.pattern;

    /*
     * Do not use instanceof RegExp here because values created in
     * another JavaScript realm can fail that check.
     */
    if (
      !pattern ||
      typeof pattern.source !== "string"
    ) {
      console.warn(
        "[CWN Shield] Detector has no valid pattern:",
        detector?.type || "Unknown detector"
      );

      return [];
    }

    /*
     * Some embedded browsers do not expose RegExp.flags reliably.
     * Reconstruct the flags from individual properties when needed.
     */
    const detectedFlags =
      typeof pattern.flags === "string"
        ? pattern.flags
        : [
            pattern.global
              ? "g"
              : "",
            pattern.ignoreCase
              ? "i"
              : "",
            pattern.multiline
              ? "m"
              : "",
            pattern.unicode
              ? "u"
              : "",
            pattern.sticky
              ? "y"
              : "",
            pattern.dotAll
              ? "s"
              : ""
          ].join("");

    const flags =
      detectedFlags.includes("g")
        ? detectedFlags
        : `${detectedFlags}g`;

    const expression =
      new RegExp(
        pattern.source,
        flags
      );

    const matches = [];
    let match;

    while (
      (
        match =
          expression.exec(input)
      ) !== null
    ) {
      const matchedValue =
        String(
          match[0] ?? ""
        );

      if (
        detector.context &&
        typeof detector.context.test ===
          "function"
      ) {
        detector.context.lastIndex = 0;

        if (
          !detector.context.test(input)
        ) {
          continue;
        }
      }

      if (
        detector.validate &&
        !detector.validate(
          matchedValue
        )
      ) {
        continue;
      }

      matches.push(match);

      /*
       * Prevent an infinite loop if a future detector can match an
       * empty string.
       */
      if (
        matchedValue.length === 0
      ) {
        expression.lastIndex += 1;
      }
    }

    return matches;
  };

  const scanText = (
    text = ""
  ) => {
    const findings = [];

    for (
      const detector of
      DETECTORS
    ) {
      const matches =
        getMatches(
          String(text),
          detector
        );

      if (matches.length === 0) {
        continue;
      }

      findings.push({
        type: detector.type,
        severity:
          detector.severity,
        count: matches.length,
        redactable:
          detector.redactable,
        highRisk:
          HIGH_RISK_TYPES.has(
            detector.type
          )
      });
    }

    return findings;
  };

  const redactText = (
    text = ""
  ) => {
    let output =
      String(text);

    const redactedTypes = [];

    for (
      const detector of
      DETECTORS
    ) {
      if (
        !detector.redactable ||
        !detector.replacement
      ) {
        continue;
      }

      const matches =
        getMatches(
          output,
          detector
        );

      if (matches.length === 0) {
        continue;
      }

      detector.pattern.lastIndex = 0;

      output = output.replace(
        detector.pattern,
        (match) => {
          if (
            detector.validate &&
            !detector.validate(match)
          ) {
            return match;
          }

          return detector.replacement;
        }
      );

      redactedTypes.push(
        detector.type
      );
    }

    return {
      text: output,
      redactedTypes: [
        ...new Set(
          redactedTypes
        )
      ]
    };
  };

  window.CWNPersonalInfoProtection = {
    scanText,
    redactText,
    highRiskTypes:
      HIGH_RISK_TYPES
  };
})();
