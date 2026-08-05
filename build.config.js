"use strict";

module.exports = {
  outputDirectory: "dist",

  /*
   * These public browser scripts are moderately obfuscated after
   * minification.
   */
  obfuscateJavaScript: [
    "portal.js",
    "phase2.js",
    "themes.js",
    "patch-notes.js",
    "malware-scanner.js",
    "staff-directory.js",
  ],

  /*
   * These files remain readable because they contain public content
   * or configuration rather than private application logic.
   */
  readableJavaScript: [
    "exposes.js",
    "bug-report.js",
    "pii-protection.js",
    "phase2-data.js",
    "staff-data.js",
    "music-config.js",
    "music-player.js",
  ],

  /*
   * Server-side files are copied without client-side obfuscation.
   */
  serverJavaScript: [
    "api/bug-report.js"
  ],

  htmlFiles: [
    "index.html",
    "privacy.html",
    "bug-report.html",
    "status.html",
    "transparency.html",
    "changelog.html",
    "news.html",
    "faq.html",
    "downloads.html",
    "search.html",
    "patch-notes.html",
    "security-status.html",
    "exposes.html"
  ],

  cssFiles: [
    "portal.css",
    "phase2.css",
    "cwn-tools.css",
    "staff-directory.css",
    "bug-report.css",
    "pii-protection.css",
    "exposes.css",
    "music-player.css",
  ],

  staticDirectories: [
    "assets"
  ],

  staticFiles: [
    "README.md",
    "LICENSE",
    "robots.txt",
    "sitemap.xml",
    "favicon.ico",
    "manifest.webmanifest"
  ]
};
