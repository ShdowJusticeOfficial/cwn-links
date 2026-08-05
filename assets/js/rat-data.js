"use strict";

window.CWN_RAT_DATABASE = [
  {
    id: "CWN-RAT-2026-0001",
    slug: "overlord-july-2026",

    name: "Overlord",
    aliases: [
      "Overlord Client",
      "Overlord Agent"
    ],

    classification: "Remote Access Trojan",
    risk: "critical",
    status: "active-review",

    headline:
      "Individually configured Overlord client containing a compiled " +
      "fallback endpoint, persistence settings, an embedded build token " +
      "and extensive remote-control functionality.",

    summary:
      "CWN static analysis linked the analysed Windows payload to the " +
      "Overlord codebase. The sample contains an operational compiled " +
      "fallback endpoint, an internal build identifier, an internal " +
      "builder account ID and a signed build token. These values link the " +
      "sample to a particular deployment and build event, but do not by " +
      "themselves identify a real-world operator.",

    firstObserved: "2026-07-14",
    lastUpdated: "2026-08-05",

    platform: [
      "Windows"
    ],

    tags: [
      "remote-access",
      "surveillance",
      "keylogging",
      "webcam",
      "audio-capture",
      "file-management",
      "process-control",
      "persistence",
      "websocket",
      "webrtc",
      "go-malware"
    ],

    badges: [
      "CRITICAL",
      "WINDOWS",
      "REMOTE ACCESS TROJAN",
      "HASH VERIFIED",
      "TOKEN REDACTED",
      "ATTRIBUTION UNCONFIRMED",
      "SUBMISSION REQUIRED"
    ],

    sample: {
      filename: "decrypted-payload.bin",
      format: "PE32+ Windows executable",
      architecture: "x86-64",
      language: "Go",
      sizeBytes: 16377344,
      sha256:
        "7de2665b2a9448aa7ca54251b3b985784305796963f19a299337203a532fffbc",

      compilationTimestamp: null,

      compilationTimestampAssessment:
        "No independently verified PE compilation timestamp has been " +
        "published. The embedded build-token issuance time is not " +
        "automatically equivalent to the PE compilation timestamp."
    },

    infrastructure: {
      endpoint: "85.17.116.161:5173",
      ip: "85.17.116.161",
      port: 5173,
      protocolAssessment:
        "The source project expects WebSocket or secure WebSocket server " +
        "URLs. The compiled value does not include a scheme in the " +
        "recovered string.",

      hosting: "LeaseWeb Netherlands B.V.",
      network: "85.17.116.0/24",
      asn: "AS60781",
      country: "Netherlands",
      reverseDns: "No reverse DNS result observed during analysis",

      providerDisclaimer:
        "The hosting provider and ASN identify network allocation only. " +
        "They do not identify the customer, operator or distributor."
    },

    configuration: {
      defaultServer: "85.17.116.161:5173",
      mutex: "mptUc1YfsqC.U48angOzGZXX",
      buildId: "2fc41d73-b0f4-41d2-ab0a-c2ed660f4f01",
      builderUid: 1,
      issuedAtUnix: 1784045285,
      issuedAt: "2026-07-14T16:08:05+00:00",

      tokenVersion: 1,
      tokenVerified: false,

      redactedAgentToken: "G7JQQMqU...lIwrnHKX",

      signedTokenPublication:
        "Withheld from public release",

      tokenDisclaimer:
        "The signed token claims were decoded but were not " +
        "cryptographically verified against the originating server's " +
        "private signing configuration. The internal uid value does not " +
        "identify a real-world person without server-side corroboration."
    },

    embeddedCommands: {
      totalConfirmed: 77,

      categories: [
        {
          name: "Agent lifecycle",
          count: 1,
          commands: [
            "agent_update"
          ]
        },
        {
          name: "Client telemetry",
          count: 2,
          commands: [
            "client_logs_request",
            "client_logs_result"
          ]
        },
        {
          name: "Clipboard",
          count: 4,
          commands: [
            "clipboard_content",
            "clipboard_sync",
            "clipboard_sync_start",
            "clipboard_sync_stop"
          ]
        },
        {
          name: "Command execution protocol",
          count: 2,
          commands: [
            "command_progress",
            "command_result"
          ]
        },
        {
          name: "Desktop and audio control",
          count: 14,
          commands: [
            "desktop_audio_start",
            "desktop_audio_stop",
            "desktop_audio_uplink",
            "desktop_enable_cursor",
            "desktop_enable_keyboard",
            "desktop_enable_mouse",
            "desktop_mouse_down",
            "desktop_mouse_move",
            "desktop_mouse_wheel",
            "desktop_request_keyframe",
            "desktop_select_display",
            "desktop_set_duplication",
            "desktop_set_quality",
            "desktop_set_resolution"
          ]
        },
        {
          name: "File operations",
          count: 28,
          commands: [
            "file_chmod",
            "file_copy",
            "file_delete",
            "file_dirsize",
            "file_dirsize_result",
            "file_download",
            "file_execute",
            "file_hash",
            "file_hash_result",
            "file_icon",
            "file_icon_result",
            "file_list",
            "file_list_result",
            "file_mkdir",
            "file_move",
            "file_peek",
            "file_peek_result",
            "file_read",
            "file_read_result",
            "file_request_access",
            "file_search",
            "file_search_result",
            "file_thumb",
            "file_thumb_result",
            "file_upload",
            "file_upload_result",
            "file_write",
            "file_zip"
          ]
        },
        {
          name: "Keylogging",
          count: 8,
          commands: [
            "keylog_clear_result",
            "keylog_delete",
            "keylog_delete_result",
            "keylog_file_chunk",
            "keylog_file_content",
            "keylog_file_list",
            "keylog_permission_result",
            "keylog_request_permission"
          ]
        },
        {
          name: "Plugin system",
          count: 2,
          commands: [
            "plugin_event",
            "plugin_load"
          ]
        },
        {
          name: "Process control",
          count: 7,
          commands: [
            "process_icon",
            "process_icon_result",
            "process_kill",
            "process_list",
            "process_list_result",
            "process_resume",
            "process_suspend"
          ]
        },
        {
          name: "Screenshots",
          count: 1,
          commands: [
            "screenshot_result"
          ]
        },
        {
          name: "Voice communication",
          count: 4,
          commands: [
            "voice_capabilities",
            "voice_session_start",
            "voice_session_stop",
            "voice_uplink"
          ]
        },
        {
          name: "Webcam",
          count: 2,
          commands: [
            "webcam_devices",
            "webcam_set_quality"
          ]
        },
        {
          name: "WebRTC",
          count: 2,
          commands: [
            "webrtc_p2p_answer",
            "webrtc_p2p_ice"
          ]
        }
      ],

      disclaimer:
        "Exact command identifiers confirm that the corresponding protocol " +
        "functionality is present in the analysed build. They do not prove " +
        "that every command was issued against a victim."
    },

    capabilities: [
      {
        title: "Remote desktop control",
        severity: "critical",
        description:
          "The sample contains protocol identifiers for mouse, keyboard, " +
          "display selection, image quality, resolution and desktop-audio " +
          "control."
      },
      {
        title: "File-system access",
        severity: "critical",
        description:
          "The confirmed command inventory includes listing, reading, " +
          "writing, uploading, downloading, executing, deleting, moving, " +
          "copying, hashing, searching and archiving files."
      },
      {
        title: "Keylogging",
        severity: "critical",
        description:
          "Keylogger permission, file-list, content, chunk, deletion and " +
          "clear-result identifiers were embedded in the payload."
      },
      {
        title: "Webcam and microphone access",
        severity: "critical",
        description:
          "The build includes webcam enumeration and quality controls as " +
          "well as voice-session and audio-uplink functionality."
      },
      {
        title: "Process management",
        severity: "high",
        description:
          "The sample supports listing, suspending, resuming and terminating " +
          "processes."
      },
      {
        title: "Plugin loading",
        severity: "high",
        description:
          "Embedded protocol identifiers indicate support for loading and " +
          "handling plugin events."
      },
      {
        title: "Persistence configuration",
        severity: "high",
        description:
          "Source and compiled configuration references indicate support for " +
          "startup and registry-based persistence options."
      }
    ],

    iocs: [
      {
        type: "SHA-256",
        value:
          "7de2665b2a9448aa7ca54251b3b985784305796963f19a299337203a532fffbc",
        confidence: "High",
        public: true
      },
      {
        type: "IPv4",
        value: "85.17.116.161",
        confidence: "High",
        public: true
      },
      {
        type: "TCP port",
        value: "5173",
        confidence: "High",
        public: true
      },
      {
        type: "Endpoint",
        value: "85.17.116.161:5173",
        confidence: "High",
        public: true
      },
      {
        type: "Mutex",
        value: "mptUc1YfsqC.U48angOzGZXX",
        confidence: "High",
        public: true
      },
      {
        type: "Build ID",
        value: "2fc41d73-b0f4-41d2-ab0a-c2ed660f4f01",
        confidence: "High",
        public: true
      },
      {
        type: "Internal builder UID",
        value: "1",
        confidence: "High",
        public: true,
        note:
          "Internal panel identifier only; not a real-world identity."
      },
      {
        type: "Build-token issuance time",
        value: "2026-07-14T16:08:05+00:00",
        confidence: "High, signature pending",
        public: true
      }
    ],

    mitre: [
      {
        id: "T1056.001",
        name: "Input Capture: Keylogging",
        confidence: "High",
        evidence:
          "Confirmed keylog protocol identifiers and keylogger source modules."
      },
      {
        id: "T1113",
        name: "Screen Capture",
        confidence: "High",
        evidence:
          "Screenshot result handling and remote desktop capture functionality."
      },
      {
        id: "T1125",
        name: "Video Capture",
        confidence: "High",
        evidence:
          "Webcam device and quality-control functionality."
      },
      {
        id: "T1123",
        name: "Audio Capture",
        confidence: "High",
        evidence:
          "Desktop audio and voice uplink functionality."
      },
      {
        id: "T1105",
        name: "Ingress Tool Transfer",
        confidence: "High",
        evidence:
          "File upload, download and plugin-loading capabilities."
      },
      {
        id: "T1083",
        name: "File and Directory Discovery",
        confidence: "High",
        evidence:
          "File listing, searching, directory sizing and file inspection."
      },
      {
        id: "T1106",
        name: "Native API",
        confidence: "Medium",
        evidence:
          "Windows-specific process, registry, capture and persistence code."
      },
      {
        id: "T1057",
        name: "Process Discovery",
        confidence: "High",
        evidence:
          "Process list and process icon identifiers."
      },
      {
        id: "T1489",
        name: "Service Stop",
        confidence: "Low",
        evidence:
          "Process termination exists, but service-specific targeting was not " +
          "established."
      },
      {
        id: "T1547.001",
        name: "Registry Run Keys / Startup Folder",
        confidence: "High",
        evidence:
          "Build tags and source configuration reference registry and startup " +
          "persistence."
      },
      {
        id: "T1071.001",
        name: "Web Protocols",
        confidence: "High",
        evidence:
          "WebSocket and secure WebSocket server communication."
      }
    ],

    timeline: [
      {
        time: "2026-07-14T16:08:05Z",
        title: "Embedded build token issued",
        description:
          "The decoded token records build ID " +
          "2fc41d73-b0f4-41d2-ab0a-c2ed660f4f01 and internal builder UID 1."
      },
      {
        time: "2026-08-05T10:45:34Z",
        title: "Automated attribution analysis started",
        description:
          "CWN began consolidated local static analysis and evidence inventory."
      },
      {
        time: "2026-08-05T11:12:10Z",
        title: "Attribution report generated",
        description:
          "The compiled endpoint, mutex, build token and source relationships " +
          "were documented in a consolidated report."
      },
      {
        time: "2026-08-05T11:12:10Z",
        title: "Integrity manifest generated",
        description:
          "Generated evidence outputs were hashed using SHA-256."
      }
    ],

    evidence: [
      {
        id: "CWN-EVD-OVD-001",
        title: "Payload cryptographic hash",
        finding:
          "The analysed payload has SHA-256 " +
          "7de2665b2a9448aa7ca54251b3b985784305796963f19a299337203a532fffbc.",
        confidence: "High"
      },
      {
        id: "CWN-EVD-OVD-002",
        title: "Compiled fallback endpoint",
        finding:
          "85.17.116.161:5173 is stored as a Go string descriptor and " +
          "referenced by both configuration loading and server fallback logic.",
        confidence: "High"
      },
      {
        id: "CWN-EVD-OVD-003",
        title: "Embedded build identifier",
        finding:
          "Build ID 2fc41d73-b0f4-41d2-ab0a-c2ed660f4f01 is contained in " +
          "the decoded signed build token.",
        confidence: "High"
      },
      {
        id: "CWN-EVD-OVD-004",
        title: "Internal builder account identifier",
        finding:
          "The token contains uid 1, which source review associates with the " +
          "panel account linked to the build process.",
        confidence: "High"
      },
      {
        id: "CWN-EVD-OVD-005",
        title: "Compiled mutex",
        finding:
          "The sample contains the compiled mutex " +
          "mptUc1YfsqC.U48angOzGZXX.",
        confidence: "High"
      },
      {
        id: "CWN-EVD-OVD-006",
        title: "Embedded command mapping",
        finding:
          "Seventy-seven exact repository-derived protocol identifiers were " +
          "confirmed in the payload.",
        confidence: "High"
      }
    ],

    attribution: {
      codebase: {
        assessment: "Overlord codebase",
        confidence: "High"
      },

      deployment: {
        assessment:
          "Linked to a particular configured Overlord deployment and build event",
        confidence: "High"
      },

      operator: {
        assessment: "Not established",
        confidence: "Unconfirmed"
      },

      distributor: {
        assessment: "Not established",
        confidence: "Unconfirmed"
      },

      victimActivity: {
        assessment:
          "No command-by-command victim execution history was recovered",
        confidence: "Not established"
      }
    },

    github: {
      repositoryUrl: "",
      repositoryOwner: "",
      repositoryName: "",

      reportCategory: "Active malware or exploit concern",
      reportStatus: "submission-required",

      reportPreparedAt: "2026-08-05T11:12:10Z",
      reportedAt: null,
      acknowledgementAt: null,
      actionConfirmedAt: null,
      ticketReference: null,

      reportStatement:
        "CWN generated a GitHub-ready defensive evidence package for this " +
        "entry. Publication in the CWN RAT Database does not itself submit " +
        "the repository to GitHub. The status changes to Reported only " +
        "after a real submission has been confirmed.",

      concernSummary:
        "The repository appears associated with a remote-access framework " +
        "possessing surveillance, persistence and remote-control " +
        "capabilities. Static analysis recovered an individually configured " +
        "Windows agent build and an operational fallback endpoint. GitHub " +
        "should independently determine whether the repository is protected " +
        "dual-use research or supports active harmful deployment.",

      publicEvidence: [
        "The compiled endpoint is loaded as the default server value.",
        "The endpoint is used by fallback server-list logic.",
        "A specific build UUID is embedded in the analysed sample.",
        "An internal builder UID and issuance time are embedded.",
        "Remote desktop, file, keylogging, webcam and audio capabilities exist.",
        "Seventy-seven exact repository-derived commands were recovered."
      ]
    },

    disclosure: {
      publicRelease: true,
      publicReleaseDate: "2026-08-05",

      classification:
        "CWN Defensive Threat Intelligence",

      malwareAvailableForDownload: false,
      sensitiveValuesRedacted: true,
      personalAttributionEstablished: false,

      withheldItems: [
        "Complete embedded agent authentication token",
        "Complete signed build token",
        "Any private signing secret or signing key",
        "Executable malware sample",
        "Decrypted payload download",
        "Instructions for operating command-and-control infrastructure",
        "Any unrelated personal information"
      ],

      publicDisclaimer:
        "This record contains defensive indicators and static-analysis " +
        "findings. It does not prove the identity of the malware operator, " +
        "the person who distributed the sample or the commands executed on " +
        "a victim system."
    },

    limitations: [
      "The suspicious payload was not executed.",
      "No connection was made to the suspected endpoint.",
      "No remote service was authenticated against.",
      "The complete token signature has not been independently verified.",
      "No originating server database was recovered.",
      "No hosting subscriber records were obtained.",
      "Internal builder UID 1 is not a real-world identity.",
      "The command inventory proves capability presence, not command usage.",
      "Repository authorship does not independently prove malware operation.",
      "Hosting allocation does not independently identify the operator."
    ],

    corrections: {
      enabled: true,
      contact:
        "Corrections and right-of-reply submissions should include the case " +
        "ID, disputed statement and supporting evidence.",
      lastCorrection: null
    }
  }
];
