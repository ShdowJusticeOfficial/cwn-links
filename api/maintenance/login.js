"use strict";

const {
  createSessionCookie,
  createSessionToken,
  verifyPassword
} = require("./auth");

const MAX_BODY_BYTES = 2_000;
const FAILURE_WINDOW_MS =
  15 * 60 * 1000;
const MAX_FAILURES = 7;
const BLOCK_DURATION_MS =
  30 * 60 * 1000;

const attemptStore =
  globalThis.__cwnMaintenanceAttempts ||
  new Map();

globalThis.__cwnMaintenanceAttempts =
  attemptStore;

function sendJson(
  response,
  statusCode,
  body,
  additionalHeaders = {}
) {
  response.statusCode = statusCode;

  response.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  response.setHeader(
    "Cache-Control",
    "no-store, max-age=0"
  );

  for (
    const [name, value] of
    Object.entries(additionalHeaders)
  ) {
    response.setHeader(
      name,
      value
    );
  }

  response.end(
    JSON.stringify(body)
  );
}

function getClientIdentifier(request) {
  const forwarded =
    request.headers[
      "x-forwarded-for"
    ];

  const forwardedValue =
    Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded;

  const address =
    typeof forwardedValue === "string"
      ? forwardedValue
          .split(",")[0]
          .trim()
      : request.socket
          ?.remoteAddress ||
        "unknown";

  return address.slice(0, 150);
}

function getAttemptRecord(identifier) {
  const now = Date.now();

  let record =
    attemptStore.get(identifier);

  if (!record) {
    record = {
      failures: [],
      blockedUntil: 0
    };
  }

  record.failures =
    record.failures.filter(
      (timestamp) =>
        now - timestamp <
        FAILURE_WINDOW_MS
    );

  if (
    record.blockedUntil &&
    record.blockedUntil <= now
  ) {
    record.blockedUntil = 0;
    record.failures = [];
  }

  attemptStore.set(
    identifier,
    record
  );

  return record;
}

function readBody(request) {
  return new Promise(
    (resolve, reject) => {
      let body = "";
      let size = 0;

      request.setEncoding("utf8");

      request.on(
        "data",
        (chunk) => {
          size +=
            Buffer.byteLength(
              chunk,
              "utf8"
            );

          if (
            size >
            MAX_BODY_BYTES
          ) {
            reject(
              new Error(
                "Request body is too large."
              )
            );

            request.destroy();
            return;
          }

          body += chunk;
        }
      );

      request.on(
        "end",
        () => resolve(body)
      );

      request.on(
        "error",
        reject
      );
    }
  );
}

module.exports = async function handler(
  request,
  response
) {
  if (
    request.method !== "POST"
  ) {
    response.setHeader(
      "Allow",
      "POST"
    );

    sendJson(
      response,
      405,
      {
        ok: false,
        error:
          "Method not allowed."
      }
    );

    return;
  }

  const identifier =
    getClientIdentifier(request);

  const record =
    getAttemptRecord(identifier);

  const now = Date.now();

  if (
    record.blockedUntil > now
  ) {
    const retryAfter =
      Math.ceil(
        (
          record.blockedUntil -
          now
        ) / 1000
      );

    sendJson(
      response,
      429,
      {
        ok: false,
        error:
          "Too many failed attempts. Try again later.",
        retryAfter
      },
      {
        "Retry-After":
          String(retryAfter)
      }
    );

    return;
  }

  try {
    const rawBody =
      await readBody(request);

    let body;

    try {
      body =
        JSON.parse(
          rawBody || "{}"
        );
    } catch {
      sendJson(
        response,
        400,
        {
          ok: false,
          error:
            "Invalid JSON request."
        }
      );

      return;
    }

    const password =
      typeof body.password ===
        "string"
        ? body.password
        : "";

    if (
      password.length < 1 ||
      password.length > 300
    ) {
      sendJson(
        response,
        400,
        {
          ok: false,
          error:
            "Enter a valid developer bypass key."
        }
      );

      return;
    }

    if (!verifyPassword(password)) {
      record.failures.push(now);

      if (
        record.failures.length >=
        MAX_FAILURES
      ) {
        record.blockedUntil =
          now +
          BLOCK_DURATION_MS;
      }

      attemptStore.set(
        identifier,
        record
      );

      sendJson(
        response,
        401,
        {
          ok: false,
          error:
            record.blockedUntil
              ? "Too many failed attempts. Access has been temporarily locked."
              : "The developer bypass key was not accepted."
        }
      );

      return;
    }

    attemptStore.delete(
      identifier
    );

    const token =
      createSessionToken();

    sendJson(
      response,
      200,
      {
        ok: true,
        message:
          "Developer access authorised.",
        redirect: "/"
      },
      {
        "Set-Cookie":
          createSessionCookie(
            token
          )
      }
    );
  } catch (error) {
    console.error(
      "[CWN maintenance login]",
      error
    );

    sendJson(
      response,
      500,
      {
        ok: false,
        error:
          "Developer authentication is temporarily unavailable."
      }
    );
  }
};
