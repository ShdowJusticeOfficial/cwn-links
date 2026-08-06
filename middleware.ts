const COOKIE_NAME =
  "cwn_dev_session";

const PUBLIC_PATHS = new Set([
  "/maintenance",
  "/maintenance.html",
  "/maintenance.css",
  "/maintenance.js",
  "/favicon.ico",
  "/robots.txt"
]);

const PUBLIC_API_PATHS =
  new Set([
    "/api/maintenance/login",
    "/api/maintenance/logout",
    "/api/maintenance/session"
  ]);

function base64UrlToBytes(
  value: string
): Uint8Array {
  const base64 =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const padded =
    base64.padEnd(
      Math.ceil(
        base64.length / 4
      ) * 4,
      "="
    );

  const binary =
    atob(padded);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(index);
  }

  return bytes;
}

function safeEqual(
  left: Uint8Array,
  right: Uint8Array
): boolean {
  if (
    left.length !== right.length
  ) {
    return false;
  }

  let difference = 0;

  for (
    let index = 0;
    index < left.length;
    index += 1
  ) {
    difference |=
      left[index] ^
      right[index];
  }

  return difference === 0;
}

function getCookie(
  request: Request,
  name: string
): string | null {
  const cookieHeader =
    request.headers.get(
      "cookie"
    );

  if (!cookieHeader) {
    return null;
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

    const cookieName =
      section
        .slice(0, separator)
        .trim();

    if (cookieName !== name) {
      continue;
    }

    return section
      .slice(separator + 1)
      .trim();
  }

  return null;
}

async function verifySession(
  token: string | null
): Promise<boolean> {
  if (
    !token ||
    token.length < 20 ||
    token.length > 2000
  ) {
    return false;
  }

  const secret =
    process.env
      .CWN_SESSION_SECRET;

  if (!secret) {
    return false;
  }

  const parts =
    token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [
    encodedPayload,
    suppliedSignature
  ] = parts;

  try {
    const encoder =
      new TextEncoder();

    const key =
      await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
          name: "HMAC",
          hash: "SHA-256"
        },
        false,
        ["sign"]
      );

    const expectedSignature =
      new Uint8Array(
        await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(
            encodedPayload
          )
        )
      );

    const suppliedBytes =
      base64UrlToBytes(
        suppliedSignature
      );

    if (
      !safeEqual(
        expectedSignature,
        suppliedBytes
      )
    ) {
      return false;
    }

    const payloadText =
      new TextDecoder().decode(
        base64UrlToBytes(
          encodedPayload
        )
      );

    const payload =
      JSON.parse(payloadText);

    const currentTime =
      Math.floor(
        Date.now() / 1000
      );

    return (
      payload.version === 1 &&
      payload.purpose ===
        "cwn-development-access" &&
      Number.isInteger(
        payload.issuedAt
      ) &&
      Number.isInteger(
        payload.expiresAt
      ) &&
      payload.expiresAt >
        currentTime &&
      payload.issuedAt <=
        currentTime + 60 &&
      payload.expiresAt -
        payload.issuedAt <=
        12 * 60 * 60
    );
  } catch {
    return false;
  }
}

export default async function middleware(
  request: Request
): Promise<Response | undefined> {
  const url =
    new URL(request.url);

  const pathname =
    url.pathname;

  if (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_API_PATHS.has(pathname)
  ) {
    return undefined;
  }

  const token =
    getCookie(
      request,
      COOKIE_NAME
    );

  const authorised =
    await verifySession(token);

  if (authorised) {
    return undefined;
  }

  if (
    pathname.startsWith("/api/")
  ) {
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          "The CWN website API is unavailable during maintenance."
      }),
      {
        status: 503,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8",
          "Cache-Control":
            "no-store, max-age=0",
          "Retry-After":
            "3600"
        }
      }
    );
  }

  const maintenanceUrl =
    new URL(
      "/maintenance",
      request.url
    );

  return Response.redirect(
    maintenanceUrl,
    307
  );
}

export const config = {
  matcher: [
    "/((?!_vercel/|\\.well-known/).*)"
  ]
};
