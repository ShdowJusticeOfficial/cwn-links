"use strict";

const {
  createExpiredSessionCookie
} = require("./auth");

module.exports = function handler(
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

    response.statusCode = 405;
  } else {
    response.statusCode = 200;
  }

  response.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  response.setHeader(
    "Cache-Control",
    "no-store, max-age=0"
  );

  response.setHeader(
    "Set-Cookie",
    createExpiredSessionCookie()
  );

  response.end(
    JSON.stringify({
      ok:
        request.method === "POST",
      message:
        request.method === "POST"
          ? "Developer session ended."
          : "Method not allowed."
    })
  );
};
