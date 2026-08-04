const crypto = require("node:crypto");

const MAX_BODY_BYTES = 20_000;

const allowedServices = new Set([
  "CWN Links Portal",
  "Staff Directory",
  "File Risk Scanner",
  "Privacy Notice",
  "Discord Community",
  "VRChat Group",
  "CWN Help Centre",
  "Other CWN Service"
]);

const allowedCategories = new Set([
  "Visual / Layout",
  "Mobile Compatibility",
  "Navigation",
  "Search",
  "Form Submission",
  "Broken Link",
  "Incorrect Information",
  "Accessibility",
  "Performance",
  "Security Concern",
  "Other"
]);

const severityConfig = {
  low: {
    label: "🟢 Low",
    colour: 0x58f58a,
    priority: "Normal review"
  },

  medium: {
    label: "🟡 Medium",
    colour: 0xffd166,
    priority: "Review recommended"
  },

  high: {
    label: "🟠 High",
    colour: 0xff9f43,
    priority: "Priority review"
  },

  critical: {
    label: "🔴 Critical",
    colour: 0xff5c5c,
    priority: "Immediate review recommended"
  }
};

const limits = {
  reporter: [2, 80],
  contact: [0, 120],
  title: [5, 120],
  description: [20, 1800],
  steps: [10, 1200],
  expected: [5, 700],
  actual: [5, 700],
  device: [0, 150],
  browser: [0, 150],
  pageUrl: [0, 500],
  evidenceUrl: [0, 500],
  notes: [0, 800]
};

const rateLimitStore =
  globalThis.__cwnBugRateLimit ||
  new Map();

const temporaryBlockStore =
  globalThis.__cwnBugTemporaryBlocks ||
  new Map();

globalThis.__cwnBugRateLimit =
  rateLimitStore;

globalThis.__cwnBugTemporaryBlocks =
  temporaryBlockStore;

const RATE_LIMITS = {
  short: {
    windowMs: 60 * 1000,
    maximum: 3
  },

  medium: {
    windowMs: 15 * 60 * 1000,
    maximum: 8
  },

  long: {
    windowMs: 24 * 60 * 60 * 1000,
    maximum: 25
  }
};

const TEMPORARY_BLOCK_MS =
  60 * 60 * 1000;

function cleanText(
  value,
  minimum,
  maximum,
  fieldName
) {
  if (
    value === undefined ||
    value === null
  ) {
    value = "";
  }

  if (typeof value !== "string") {
    throw new Error(
      `${fieldName} must be text.`
    );
  }

  const cleaned =
    value
      .replace(/\u0000/g, "")
      .replace(/\r\n/g, "\n")
      .trim();

  if (
    cleaned.length < minimum ||
    cleaned.length > maximum
  ) {
    throw new Error(
      `${fieldName} must contain between ${minimum} and ${maximum} characters.`
    );
  }

  return cleaned;
}

const sensitiveContentDetectors = [
  {
    type: "Private key",
    highRisk: true,
    pattern:
      /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i
  },
  {
    type: "Discord credential",
    highRisk: true,
    pattern:
      /(?:mfa\.[A-Za-z0-9_-]{20,}|[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,})/
  },
  {
    type: "JWT or bearer token",
    highRisk: true,
    pattern:
      /(?:Bearer\s+)?eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,}/i
  },
  {
    type: "GitHub token",
    highRisk: true,
    pattern:
      /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,255}\b/
  },
  {
    type: "AWS access key",
    highRisk: true,
    pattern:
      /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/
  },
  {
    type: "Google API key",
    highRisk: true,
    pattern:
      /\bAIza[0-9A-Za-z_-]{30,45}\b/
  },
  {
    type: "Generic secret",
    highRisk: true,
    pattern:
      /\b(?:api[_ -]?key|secret|token|password|passwd)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}["']?/i
  },
  {
    type: "Email address",
    highRisk: false,
    pattern:
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  },
  {
    type: "IPv4 address",
    highRisk: false,
    pattern:
      /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/
  },
  {
    type: "UK postcode",
    highRisk: false,
    pattern:
      /\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i
  }
];

function scanSensitiveReportContent(
  report
) {
  /*
   * Contact information is intentionally omitted because users may
   * voluntarily supply a contact address in the dedicated field.
   */
  const content = [
    report.title,
    report.description,
    report.steps,
    report.expected,
    report.actual,
    report.device,
    report.browser,
    report.pageUrl,
    report.evidenceUrl,
    report.notes
  ]
    .filter(Boolean)
    .join("\n");

  return sensitiveContentDetectors
    .filter(
      (detector) =>
        detector.pattern.test(
          content
        )
    )
    .map(
      (detector) => ({
        type:
          detector.type,
        highRisk:
          detector.highRisk
      })
    );
}

function neutraliseMentions(value) {
  return value
    .replace(/@everyone/gi, "@\u200beveryone")
    .replace(/@here/gi, "@\u200bhere")
    .replace(/<@/g, "<@\u200b")
    .replace(/<@&/g, "<@&\u200b");
}

function truncate(value, maximum) {
  if (value.length <= maximum) {
    return value;
  }

  return `${value.slice(
    0,
    maximum - 1
  )}…`;
}

function validateOptionalUrl(
  value,
  fieldName
) {
  if (!value) {
    return "";
  }

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `${fieldName} must be a valid URL.`
    );
  }

  if (
    url.protocol !== "https:" &&
    url.protocol !== "http:"
  ) {
    throw new Error(
      `${fieldName} must use http or https.`
    );
  }

  return url.toString();
}

function getClientIp(req) {
  const forwarded =
    req.headers[
      "x-forwarded-for"
    ];

  if (Array.isArray(forwarded)) {
    return forwarded[0] || "unknown";
  }

  if (typeof forwarded === "string") {
    return (
      forwarded
        .split(",")[0]
        .trim() ||
      "unknown"
    );
  }

  return (
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function hashIp(ip) {
  const salt =
    process.env.BUG_REPORT_IP_SALT ||
    "cwn-bug-report";

  return crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex")
    .slice(0, 16);
}

function cleanupSecurityStores(now) {
  for (
    const [
      identifier,
      blockedUntil
    ] of temporaryBlockStore
  ) {
    if (blockedUntil <= now) {
      temporaryBlockStore.delete(
        identifier
      );
    }
  }

  for (
    const [
      identifier,
      timestamps
    ] of rateLimitStore
  ) {
    const recent =
      timestamps.filter(
        (timestamp) =>
          now - timestamp <
          RATE_LIMITS.long.windowMs
      );

    if (recent.length === 0) {
      rateLimitStore.delete(
        identifier
      );
    } else {
      rateLimitStore.set(
        identifier,
        recent
      );
    }
  }
}

function checkRateLimit(identifier) {
  const now = Date.now();

  cleanupSecurityStores(now);

  const blockedUntil =
    temporaryBlockStore.get(
      identifier
    );

  if (
    blockedUntil &&
    blockedUntil > now
  ) {
    return {
      allowed: false,
      blocked: true,
      retryAfterSeconds:
        Math.ceil(
          (blockedUntil - now) /
          1000
        ),
      reason:
        "temporary-block"
    };
  }

  const timestamps =
    (
      rateLimitStore.get(
        identifier
      ) || []
    ).filter(
      (timestamp) =>
        now - timestamp <
        RATE_LIMITS.long.windowMs
    );

  const exceeded =
    Object.entries(
      RATE_LIMITS
    ).find(
      ([
        ,
        limit
      ]) =>
        timestamps.filter(
          (timestamp) =>
            now - timestamp <
            limit.windowMs
        ).length >=
        limit.maximum
    );

  if (exceeded) {
    const [
      tier,
      limit
    ] = exceeded;

    /*
     * Repeat abuse triggers a one-hour temporary block.
     */
    if (
      tier === "medium" ||
      tier === "long"
    ) {
      temporaryBlockStore.set(
        identifier,
        now +
          TEMPORARY_BLOCK_MS
      );

      return {
        allowed: false,
        blocked: true,
        retryAfterSeconds:
          Math.ceil(
            TEMPORARY_BLOCK_MS /
            1000
          ),
        reason:
          `${tier}-limit`
      };
    }

    const oldestRelevant =
      timestamps
        .filter(
          (timestamp) =>
            now - timestamp <
            limit.windowMs
        )
        .sort(
          (a, b) => a - b
        )[0];

    return {
      allowed: false,
      blocked: false,
      retryAfterSeconds:
        Math.max(
          1,
          Math.ceil(
            (
              limit.windowMs -
              (
                now -
                oldestRelevant
              )
            ) /
            1000
          )
        ),
      reason:
        `${tier}-limit`
    };
  }

  timestamps.push(now);

  rateLimitStore.set(
    identifier,
    timestamps
  );

  return {
    allowed: true,
    blocked: false,
    retryAfterSeconds: 0,
    reason: "allowed"
  };
}

function createReference() {
  const date =
    new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");

  const random =
    crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

  return `CWN-BUG-${date}-${random}`;
}

function getAllowedOrigins(req) {
  const configured =
    process.env.BUG_REPORT_ALLOWED_ORIGINS ||
    "";

  const values =
    configured
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

  const host =
    req.headers.host;

  if (host) {
    values.push(`https://${host}`);
    values.push(`http://${host}`);
  }

  values.push(
    "https://cwn-links.vercel.app"
  );

  return new Set(values);
}

function isAllowedOrigin(req) {
  const origin =
    req.headers.origin;

  if (!origin) {
    return true;
  }

  return getAllowedOrigins(req)
    .has(origin);
}

function json(res, status, body) {
  res.statusCode = status;

  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.end(
    JSON.stringify(body)
  );
}

module.exports = async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      "POST"
    );

    return json(
      res,
      405,
      {
        error:
          "Only POST requests are supported."
      }
    );
  }

  if (
    process.env
      .CWN_SHIELD_LOCKDOWN ===
    "enabled"
  ) {
    res.setHeader(
      "Retry-After",
      "900"
    );

    res.setHeader(
      "X-CWN-Shield",
      "lockdown"
    );

    return json(
      res,
      503,
      {
        error:
          "Bug reporting is temporarily unavailable while CWN Shield protection is active.",

        protection:
          "CWN Shield Lockdown"
      }
    );
  }

  if (!isAllowedOrigin(req)) {
    return json(
      res,
      403,
      {
        error:
          "This request origin is not permitted."
      }
    );
  }

  const fetchSite =
    String(
      req.headers["sec-fetch-site"] ||
      ""
    ).toLowerCase();

  if (
    fetchSite &&
    ![
      "same-origin",
      "same-site",
      "none"
    ].includes(fetchSite)
  ) {
    return json(
      res,
      403,
      {
        error:
          "Cross-site submissions are not permitted."
      }
    );
  }

  const userAgent =
    String(
      req.headers["user-agent"] ||
      ""
    );

  if (
    userAgent.length > 700
  ) {
    return json(
      res,
      400,
      {
        error:
          "Invalid request metadata."
      }
    );
  }

  const contentType =
    String(
      req.headers[
        "content-type"
      ] || ""
    );

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    return json(
      res,
      415,
      {
        error:
          "The request must contain JSON."
      }
    );
  }

  const contentLength =
    Number(
      req.headers[
        "content-length"
      ] || 0
    );

  if (
    contentLength >
    MAX_BODY_BYTES
  ) {
    return json(
      res,
      413,
      {
        error:
          "The report is too large."
      }
    );
  }

  const webhookUrl =
    process.env
      .DISCORD_BUG_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error(
      "DISCORD_BUG_WEBHOOK_URL is not configured."
    );

    return json(
      res,
      503,
      {
        error:
          "Bug reporting is temporarily unavailable."
      }
    );
  }

  const clientIdentifier =
    hashIp(
      getClientIp(req)
    );

  const rateLimitResult =
    checkRateLimit(
      clientIdentifier
    );

  res.setHeader(
    "X-CWN-Shield",
    "active"
  );

  res.setHeader(
    "X-CWN-Request-ID",
    crypto.randomUUID()
  );

  if (!rateLimitResult.allowed) {
    res.setHeader(
      "Retry-After",
      String(
        rateLimitResult
          .retryAfterSeconds
      )
    );

    return json(
      res,
      429,
      {
        error:
          rateLimitResult.blocked
            ? "This connection has been temporarily blocked because of repeated excessive submissions."
            : "Too many reports were submitted. Please wait before trying again.",

        protection:
          "CWN Shield",

        retryAfter:
          rateLimitResult
            .retryAfterSeconds
      }
    );
  }

  try {
    const body =
      req.body &&
      typeof req.body === "object"
        ? req.body
        : {};

    if (body.companyWebsite) {
      return json(
        res,
        200,
        {
          success: true,
          reference:
            createReference()
        }
      );
    }

    const requestId =
      crypto.randomUUID();

    await validateTurnstileToken({
      token:
        body["cf-turnstile-response"],
      clientIp:
        getClientIp(req),
      idempotencyKey:
        requestId
    });

    if (
      body.safeContent !== "on" ||
      body.accurateReport !== "on"
    ) {
      throw new Error(
        "Both confirmation boxes are required."
      );
    }

    if (
      !allowedServices.has(
        body.service
      )
    ) {
      throw new Error(
        "The selected service is invalid."
      );
    }

    if (
      !allowedCategories.has(
        body.category
      )
    ) {
      throw new Error(
        "The selected category is invalid."
      );
    }

    const severity =
      severityConfig[
        body.severity
      ];

    if (!severity) {
      throw new Error(
        "The selected severity is invalid."
      );
    }

    const report = {};

    for (
      const [
        key,
        [minimum, maximum]
      ] of Object.entries(limits)
    ) {
      report[key] =
        cleanText(
          body[key],
          minimum,
          maximum,
          key
        );
    }

    report.pageUrl =
      validateOptionalUrl(
        report.pageUrl,
        "Affected page URL"
      );

    report.evidenceUrl =
      validateOptionalUrl(
        report.evidenceUrl,
        "Evidence URL"
      );

    const sensitiveFindings =
      scanSensitiveReportContent(
        report
      );

    const highRiskFindings =
      sensitiveFindings.filter(
        (finding) =>
          finding.highRisk
      );

    if (
      highRiskFindings.length > 0
    ) {
      console.warn(
        "CWN Shield blocked high-risk content:",
        highRiskFindings.map(
          (finding) =>
            finding.type
        )
      );

      return json(
        res,
        400,
        {
          error:
            "CWN Shield detected a credential, token, private key or other high-risk secret. Remove it before submitting.",

          protection:
            "CWN Shield Personal Information Protection",

          findingTypes:
            highRiskFindings.map(
              (finding) =>
                finding.type
            )
        }
      );
    }

    if (
      sensitiveFindings.length > 0 &&
      body.personalInformationConfirmed !==
        "on"
    ) {
      return json(
        res,
        400,
        {
          error:
            "Possible personal information was detected. Review, redact or explicitly confirm it before submitting.",

          protection:
            "CWN Shield Personal Information Protection",

          findingTypes:
            sensitiveFindings.map(
              (finding) =>
                finding.type
            )
        }
      );
    }

    if (
      body.personalInformationScan !==
      "completed"
    ) {
      return json(
        res,
        400,
        {
          error:
            "Complete the CWN Shield personal-information check before submitting."
        }
      );
    }

    for (
      const key of
      Object.keys(report)
    ) {
      report[key] =
        neutraliseMentions(
          report[key]
        );
    }

    const reference =
      createReference();

    const submittedAt =
      new Date();

    const embedFields = [
      {
        name: "Severity",
        value:
          `${severity.label}\n${severity.priority}`,
        inline: true
      },

      {
        name: "Affected Service",
        value:
          truncate(
            report.service ||
            body.service,
            1024
          ),
        inline: true
      },

      {
        name: "Category",
        value:
          truncate(
            body.category,
            1024
          ),
        inline: true
      },

      {
        name: "Reporter",
        value:
          truncate(
            report.reporter,
            1024
          ),
        inline: true
      },

      {
        name: "Contact",
        value:
          truncate(
            report.contact ||
            "Not provided",
            1024
          ),
        inline: true
      },

      {
        name: "Reference",
        value:
          `\`${reference}\``,
        inline: true
      },

      {
        name: "Description",
        value:
          truncate(
            report.description,
            1024
          ),
        inline: false
      },

      {
        name: "Steps to Reproduce",
        value:
          truncate(
            report.steps,
            1024
          ),
        inline: false
      },

      {
        name: "Expected Behaviour",
        value:
          truncate(
            report.expected,
            1024
          ),
        inline: false
      },

      {
        name: "Actual Behaviour",
        value:
          truncate(
            report.actual,
            1024
          ),
        inline: false
      },

      {
        name: "Environment",
        value:
          truncate(
            [
              report.device
                ? `**Device:** ${report.device}`
                : "",
              report.browser
                ? `**Browser/App:** ${report.browser}`
                : ""
            ]
              .filter(Boolean)
              .join("\n") ||
            "Not provided",
            1024
          ),
        inline: false
      }
    ];

    if (report.pageUrl) {
      embedFields.push({
        name: "Affected Page",
        value:
          truncate(
            report.pageUrl,
            1024
          ),
        inline: false
      });
    }

    if (report.evidenceUrl) {
      embedFields.push({
        name: "Evidence Link",
        value:
          truncate(
            report.evidenceUrl,
            1024
          ),
        inline: false
      });
    }

    if (report.notes) {
      embedFields.push({
        name: "Additional Notes",
        value:
          truncate(
            report.notes,
            1024
          ),
        inline: false
      });
    }

    const roleId =
      process.env
        .DISCORD_BUG_ALERT_ROLE_ID;

    const shouldPing =
      Boolean(roleId) &&
      (
        body.severity === "high" ||
        body.severity === "critical"
      );

    const discordPayload = {
      username:
        "CWN Bug Reporting System",

      avatar_url:
        process.env
          .DISCORD_BUG_WEBHOOK_AVATAR ||
        undefined,

      content:
        shouldPing
          ? `<@&${roleId}>`
          : undefined,

      allowed_mentions: {
        parse: [],
        roles:
          shouldPing
            ? [roleId]
            : []
      },

      embeds: [
        {
          title:
            `🐞 ${truncate(
              report.title,
              240
            )}`,

          description:
            [
              `A new bug report has been submitted through the CWN Portal.`,
              "",
              `**${severity.label}** · ${body.service}`
            ].join("\n"),

          color:
            severity.colour,

          fields:
            embedFields,

          footer: {
            text:
              `Community Watch Network • ${reference}`
          },

          timestamp:
            submittedAt
              .toISOString()
        }
      ]
    };

    const discordResponse =
      await fetch(
        webhookUrl,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(
              discordPayload
            )
        }
      );

    if (
      !discordResponse.ok
    ) {
      const errorText =
        await discordResponse
          .text()
          .catch(() => "");

      console.error(
        "Discord webhook failed:",
        discordResponse.status,
        errorText.slice(0, 500)
      );

      return json(
        res,
        502,
        {
          error:
            "CWN could not deliver the report to Discord. Please try again later."
        }
      );
    }

    return json(
      res,
      201,
      {
        success: true,
        reference
      }
    );
  } catch (error) {
    return json(
      res,
      400,
      {
        error:
          error.message ||
          "The report contains invalid information."
      }
    );
  }
};
