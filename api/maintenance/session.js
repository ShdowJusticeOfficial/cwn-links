"use strict";

const {
  readSessionFromRequest
} = require("./auth");

module.exports = function handler(
  request,
  response
) {
  if (
    request.method !== "GET"
  ) {
    response.setHeader(
      "Allow",
      "GET"
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

  const session =
    request.method === "GET"
      ? readSessionFromRequest(
          request
        )
      : null;

  response.end(
    JSON.stringify({
      ok:
        request.method === "GET",
      authenticated:
        Boolean(session),
      expiresAt:
        session?.expiresAt ||
        null
    })
  );
};
