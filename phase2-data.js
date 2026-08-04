window.CWN_PHASE2_DATA = {
  version: "3.1.0",
  releaseName: "Portal Phase 2",
  lastUpdated: "2026-08-04",

  status: [
    {
      name: "CWN Links Portal",
      status: "operational",
      uptime: "99.9%",
      description: "Official CWN public portal and service directory.",
      lastIncident: "No recent incidents",
      maintenance: "None scheduled"
    },
    {
      name: "Staff Directory",
      status: "operational",
      uptime: "99.9%",
      description: "Public Executive Leadership and Directorate verification.",
      lastIncident: "No recent incidents",
      maintenance: "None scheduled"
    },
    {
      name: "Bug Reporting",
      status: "operational",
      uptime: "99.8%",
      description: "Secure bug reports delivered to CWN through Discord.",
      lastIncident: "No recent incidents",
      maintenance: "None scheduled"
    },
    {
      name: "File Risk Scanner",
      status: "operational",
      uptime: "100%",
      description: "Local browser-based file risk assessment.",
      lastIncident: "No recent incidents",
      maintenance: "None scheduled"
    },
    {
      name: "CWN Discord",
      status: "operational",
      uptime: "External service",
      description: "Official CWN community and communications server.",
      lastIncident: "Dependent on Discord availability",
      maintenance: "Managed by Discord"
    },
    {
      name: "CWN Help Centre",
      status: "limited",
      uptime: "Development",
      description: "Support, ticketing and public knowledge-base service.",
      lastIncident: "Service still under development",
      maintenance: "Development work ongoing"
    },
    {
      name: "Recruitment",
      status: "limited",
      uptime: "Manual",
      description: "Selected leadership and Deputy positions are vacant.",
      lastIncident: "Applications not yet fully automated",
      maintenance: "Application system planned"
    },
    {
      name: "Portal Search",
      status: "operational",
      uptime: "100%",
      description: "Client-side search across public CWN portal content.",
      lastIncident: "No recent incidents",
      maintenance: "Index updated with releases"
    }
  ],

  statistics: [
    {
      value: 9,
      suffix: "",
      label: "Appointed Leaders",
      detail: "Executive Leadership and active Directors"
    },
    {
      value: 10,
      suffix: "",
      label: "Directorates",
      detail: "Departments within the CWN structure"
    },
    {
      value: 4,
      suffix: "",
      label: "Director Vacancies",
      detail: "Open Directorate leadership positions"
    },
    {
      value: 13,
      suffix: "",
      label: "Deputy Vacancies",
      detail: "Executive and Directorate Deputy positions"
    },
    {
      value: 8,
      suffix: "",
      label: "Public Services",
      detail: "Services tracked on the status page"
    },
    {
      value: 1,
      suffix: "",
      label: "Security Tool",
      detail: "Local File Risk Scanner"
    },
    {
      value: 550,
      suffix: " GBP",
      label: "Fundraising Goal",
      detail: "Infrastructure and development funding"
    },
    {
      value: 3,
      suffix: ".1.0",
      label: "Portal Version",
      detail: "Current public portal release"
    }
  ],

  changelog: [
    {
      version: "3.1.0",
      date: "2026-08-04",
      title: "CWN Portal Phase 2",
      summary: "Expanded the CWN Portal with public information, search, status and content-management tools.",
      added: [
        "Dedicated service-status page",
        "Transparency dashboard",
        "Universal portal search",
        "Theme selector",
        "News page",
        "FAQ page",
        "Downloads centre",
        "Community showcase",
        "Patch-note generator"
      ],
      changed: [
        "Expanded portal navigation",
        "Improved Quick Actions",
        "Updated portal statistics and version information"
      ],
      fixed: [],
      security: [
        "Kept all Phase 2 tools client-side without collecting additional visitor data"
      ]
    },
    {
      version: "3.0.0",
      date: "2026-08-04",
      title: "Portal Foundation",
      summary: "Converted the CWN links page into the CWN public portal.",
      added: [
        "Portal dashboard",
        "Quick Actions",
        "Manual service-status panel",
        "Mission and vision overview",
        "Organisation statistics",
        "Floating navigation",
        "Portal search",
        "Scroll progress indicator",
        "Back-to-top control"
      ],
      changed: [
        "Reorganised public services around the new portal interface"
      ],
      fixed: [],
      security: []
    },
    {
      version: "2.1.0",
      date: "2026-08-04",
      title: "Secure Bug Reporting",
      summary: "Added structured technical issue reporting for CWN services.",
      added: [
        "Public bug-report form",
        "Discord embed delivery",
        "Bug reference identifiers",
        "Server-side field validation",
        "Basic request rate limiting"
      ],
      changed: [
        "Updated the privacy notice for bug-report processing"
      ],
      fixed: [],
      security: [
        "Protected the Discord webhook through Vercel environment variables",
        "Disabled Discord mention parsing in submitted reports"
      ]
    },
    {
      version: "2.0.0",
      date: "2026-08-03",
      title: "Organisation and Safety Tools",
      summary: "Added CWN organisational information and public safety tools.",
      added: [
        "Executive Leadership hierarchy",
        "Directorate directory",
        "Mission statement",
        "Local File Risk Scanner",
        "Data and Privacy Notice"
      ],
      changed: [
        "Removed duplicated HTML document content"
      ],
      fixed: [
        "Corrected duplicate document structure"
      ],
      security: [
        "Scanner files remain local to the browser"
      ]
    }
  ],

  news: [
    {
      id: "CWN-NEWS-20260804-001",
      category: "Portal",
      title: "CWN Portal Phase 2 Released",
      date: "2026-08-04",
      summary: "The CWN Portal now includes status information, public news, downloads, FAQ content, themes, universal search and a patch-note generator.",
      url: "changelog.html"
    },
    {
      id: "CWN-NEWS-20260804-002",
      category: "Security",
      title: "Secure Bug Reporting Is Now Available",
      date: "2026-08-04",
      summary: "Visitors can submit structured technical issue reports directly to CWN using the secure portal form.",
      url: "bug-report.html"
    },
    {
      id: "CWN-NEWS-20260804-003",
      category: "Organisation",
      title: "Executive Leadership and Directorates Published",
      date: "2026-08-04",
      summary: "The official CWN organisational hierarchy is now available through the public Staff Directory.",
      url: "index.html#staff-directory"
    },
    {
      id: "CWN-NEWS-20260804-004",
      category: "Privacy",
      title: "CWN Data and Privacy Notice Published",
      date: "2026-08-04",
      summary: "CWN has published a public explanation of what the portal collects, processes and does not collect.",
      url: "privacy.html"
    }
  ],

  faq: [
    {
      category: "About CWN",
      question: "What is Community Watch Network?",
      answer: "Community Watch Network is an independent community organisation focused on online-safety awareness, community support, responsible documentation and accountability."
    },
    {
      category: "About CWN",
      question: "Is CWN a police force or government agency?",
      answer: "No. CWN is not a police force, government agency, emergency service, court or substitute for qualified legal, safeguarding or cybersecurity professionals."
    },
    {
      category: "Reports",
      question: "How do I report a technical problem?",
      answer: "Use the CWN Bug Reporting System. Technical reports are delivered to an internal CWN Discord channel and receive a unique reference number."
    },
    {
      category: "Reports",
      question: "Should I submit passwords or private evidence?",
      answer: "No. Never submit passwords, authentication tokens, payment details, private home addresses, malware files or other highly sensitive information through the public portal."
    },
    {
      category: "Scanner",
      question: "Does the File Risk Scanner upload my file?",
      answer: "No. The file is analysed locally inside your browser and is not uploaded to CWN through the scanner."
    },
    {
      category: "Scanner",
      question: "Does a low-risk result prove that a file is safe?",
      answer: "No. The scanner performs limited static checks. Use reputable and updated antivirus software for a more complete malware scan."
    },
    {
      category: "Staff",
      question: "How can I verify a CWN staff member?",
      answer: "Use the official Staff Directory. Only profiles shown in that directory should be treated as verified public CWN leadership."
    },
    {
      category: "Staff",
      question: "Are there vacant CWN roles?",
      answer: "Yes. Several Director and Deputy positions are currently vacant. Recruitment details will be published when the application system is available."
    },
    {
      category: "Privacy",
      question: "Does the portal use advertising trackers?",
      answer: "The current CWN portal code does not intentionally set advertising or behavioural-profiling cookies."
    },
    {
      category: "Privacy",
      question: "Where can I read CWN's data practices?",
      answer: "Read the Data and Privacy Notice available from the portal navigation and footer."
    }
  ],

  downloads: [
    {
      category: "Policies",
      name: "CWN Data and Privacy Notice",
      description: "Public information about CWN portal data handling.",
      type: "HTML",
      url: "privacy.html",
      status: "Available"
    },
    {
      category: "Organisation",
      name: "CWN Staff Directory",
      description: "Current Executive Leadership and Directorate structure.",
      type: "Portal",
      url: "index.html#staff-directory",
      status: "Available"
    },
    {
      category: "Security",
      name: "CWN File Risk Scanner",
      description: "Browser-based file risk assessment tool.",
      type: "Tool",
      url: "index.html#malware-scanner",
      status: "Available"
    },
    {
      category: "Reporting",
      name: "CWN Bug Report Form",
      description: "Structured technical issue reporting form.",
      type: "Form",
      url: "bug-report.html",
      status: "Available"
    },
    {
      category: "Branding",
      name: "CWN Brand Kit",
      description: "Official logos, colours and branding guidance.",
      type: "Archive",
      url: "#",
      status: "Coming soon"
    },
    {
      category: "Templates",
      name: "Investigation Report Template",
      description: "Standard public investigation report structure.",
      type: "Document",
      url: "#",
      status: "Coming soon"
    },
    {
      category: "Templates",
      name: "Incident Documentation Template",
      description: "Template for documenting online-safety incidents.",
      type: "Document",
      url: "#",
      status: "Coming soon"
    }
  ],

  showcase: [
    {
      type: "Project",
      title: "CWN Public Portal",
      description: "The central public access point for CWN services, staff verification, safety tools and transparency information.",
      url: "index.html"
    },
    {
      type: "Safety Tool",
      title: "File Risk Scanner",
      description: "A privacy-preserving browser tool that performs basic static file-risk checks.",
      url: "index.html#malware-scanner"
    },
    {
      type: "Transparency",
      title: "Public Staff Directory",
      description: "A published hierarchy for CWN Executive Leadership and Directorates.",
      url: "index.html#staff-directory"
    },
    {
      type: "Quality Assurance",
      title: "Bug Reporting System",
      description: "A secure report workflow delivering styled technical reports to CWN's Discord logs.",
      url: "bug-report.html"
    }
  ]
};
