"use strict";

const crypto = require("node:crypto");

const COOKIE_NAME = "cwn_dev_session";
const SESSION_DURATION_SECONDS = 12 * 60 * 60;

function getRequiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `Required environment variable ${name} is not configured.`
    );
  }

  return value.trim();
}

function base64UrlEncode(value) {
  return Buffer
    .from(value)
    .toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(
    value,
    "base64url"
  ).toString("utf8");
}

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password, "utf8")
    .digest("hex");
}

function constantTimeEqual(left, right) {
  const leftBuffer =
    Buffer.from(String(left));

  const rightBuffer =
    Buffer.from(String(right));

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    leftBuffer,
    rightBuffer
  );
}

function verifyPassword(password) {
  const expectedHash =
    getRequiredEnvironmentVariable(
      "CWN_DEV_PASSWORD_HASH"
    );

  const suppliedHash =
    hashPassword(password);

  return constantTimeEqual(
    suppliedHash,
    expectedHash
  );
}

function createSignature(encodedPayload) {
  const secret =
    getRequiredEnvironmentVariable(
      "CWN_SESSION_SECRET"
    );

  return crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(encodedPayload)
    .digest("base64url");
}

function createSessionToken() {
  const issuedAt =
    Math.floor(Date.now() / 1000);

  const payload = {
    version: 1,
    purpose: "cwn-development-access",
    issuedAt,
    expiresAt:
      issuedAt +
      SESSION_DURATION_SECONDS,
    nonce:
      crypto
        .randomBytes(18)
        .toString("base64url")
  };

  const encodedPayload =
    base64UrlEncode(
      JSON.stringify(payload)
    );

  const signature =
    createSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  if (
    typeof token !== "string" ||
    token.length < 20 ||
    token.length > 2000
  ) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [
    encodedPayload,
    suppliedSignature
  ] = parts;

  const expectedSignature =
    createSignature(encodedPayload);

  if (
    !constantTimeEqual(
      suppliedSignature,
      expectedSignature
    )
  ) {
    return null;
  }

  try {
    const payload =
      JSON.parse(
        base64UrlDecode(
          encodedPayload
        )
      );

    const currentTime =
      Math.floor(Date.now() / 1000);

    if (
      payload.version !== 1 ||
      payload.purpose !==
        "cwn-development-access" ||
      !Number.isInteger(
        payload.issuedAt
      ) ||
      !Number.isInteger(
        payload.expiresAt
      ) ||
      payload.expiresAt <=
        currentTime ||
      payload.issuedAt >
        currentTime + 60 ||
      payload.expiresAt -
        payload.issuedAt >
        SESSION_DURATION_SECONDS
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};

  if (
    typeof cookieHeader !== "string" ||
    cookieHeader.length === 0
  ) {
    return cookies;
  }

  for (
    const section of
    cookieHeader.split(";")
  ) {
    const separator =
      section.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const name =
      section
        .slice(0, separator)
        .trim();

    const value =
      section
        .slice(separator + 1)
        .trim();

    if (!name) {
      continue;
    }

    cookies[name] = value;
  }

  return cookies;
}

function readSessionFromRequest(request) {
  const cookies =
    parseCookies(
      request.headers.cookie || ""
    );

  return verifySessionToken(
    cookies[COOKIE_NAME]
  );
}

function createSessionCookie(token) {
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict"
  ].join("; ");
}

function createExpiredSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "Secure",
    "SameSite=Strict"
  ].join("; ");
}

module.exports = {
  COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createExpiredSessionCookie,
  createSessionCookie,
  createSessionToken,
  readSessionFromRequest,
  verifyPassword,
  verifySessionToken
};
