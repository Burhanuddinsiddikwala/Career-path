import json
import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
_db_env = os.getenv("DATABASE_PATH", "careerpath.db")
_db_candidate = Path(_db_env)
DB_PATH = _db_candidate if _db_candidate.is_absolute() else (BASE_DIR / _db_candidate)
JOBS_PATH = BASE_DIR / "data" / "jobs.json"

def get_db_connection(db_path=None):
    """Returns a SQLite connection with foreign keys enabled and Row factory."""
    raw_path = db_path or DB_PATH
    target_path = Path(raw_path)
    if target_path.parent:
        target_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(target_path))
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path=None):
    """Initializes all required application tables and seeds catalogue idempotently."""
    conn = get_db_connection(db_path)
    with conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id INTEGER PRIMARY KEY,
                education TEXT DEFAULT '',
                field_of_study TEXT DEFAULT '',
                stage TEXT DEFAULT 'Student',
                preferred_location TEXT DEFAULT 'Remote',
                experience_level TEXT DEFAULT 'Entry-level',
                short_term_goal TEXT DEFAULT '',
                long_term_goal TEXT DEFAULT '',
                target_role TEXT DEFAULT '',
                learning_style TEXT DEFAULT 'Hands-on Projects',
                weekly_hours INTEGER DEFAULT 10,
                portfolio_projects TEXT DEFAULT '',
                onboarding_completed INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                skill_name TEXT NOT NULL,
                proficiency INTEGER NOT NULL DEFAULT 60,
                category TEXT DEFAULT 'General',
                years_exp REAL DEFAULT 1.0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE (user_id, skill_name)
            );

            CREATE TABLE IF NOT EXISTS career_roles (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT NOT NULL,
                experience_level TEXT NOT NULL,
                summary TEXT NOT NULL,
                responsibilities_json TEXT NOT NULL,
                skills_json TEXT NOT NULL,
                related_skills_json TEXT NOT NULL,
                learning_json TEXT NOT NULL,
                resources_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS saved_careers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                role_id TEXT NOT NULL,
                notes TEXT DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES career_roles (id) ON DELETE CASCADE,
                UNIQUE (user_id, role_id)
            );

            CREATE TABLE IF NOT EXISTS learning_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                explanation TEXT NOT NULL,
                skill_category TEXT DEFAULT 'Skill Development',
                priority TEXT NOT NULL DEFAULT 'Medium',
                estimated_duration TEXT DEFAULT '30-45 mins',
                recommended_order INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'pending',
                start_date TEXT DEFAULT '',
                due_date TEXT DEFAULT '',
                resource_url TEXT DEFAULT '',
                resource_label TEXT DEFAULT '',
                related_role_id TEXT DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS networking_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                contact_name TEXT NOT NULL,
                organization TEXT NOT NULL,
                role_title TEXT DEFAULT '',
                status TEXT NOT NULL DEFAULT 'Identified',
                email TEXT DEFAULT '',
                linkedin_url TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                follow_up_date TEXT DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL DEFAULT 'New Career Chat',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS conversation_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata_json TEXT DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                link TEXT DEFAULT '',
                is_read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS match_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                skills_json TEXT NOT NULL,
                interests_json TEXT NOT NULL,
                method TEXT NOT NULL,
                top_role TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
            );
        """)
        # Ensure new profile columns exist on existing databases
        profile_cols = [c[1] for c in conn.execute("PRAGMA table_info(user_profiles)").fetchall()]
        if "learning_style" not in profile_cols:
            conn.execute("ALTER TABLE user_profiles ADD COLUMN learning_style TEXT DEFAULT 'Hands-on Projects'")
        if "weekly_hours" not in profile_cols:
            conn.execute("ALTER TABLE user_profiles ADD COLUMN weekly_hours INTEGER DEFAULT 10")
        if "portfolio_projects" not in profile_cols:
            conn.execute("ALTER TABLE user_profiles ADD COLUMN portfolio_projects TEXT DEFAULT ''")
    conn.close()
    seed_career_roles(db_path)

def seed_career_roles(db_path=None):
    """Seeds the career catalogue with comprehensive, vetted roles idempotently."""
    roles = [
        {
            "id": "data-analyst",
            "title": "Junior Data Analyst",
            "category": "Data & Analytics",
            "company": "Tech & Finance Sector",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Transform business data into actionable insights, build interactive BI reports, clean datasets, and communicate metric trends to cross-functional teams.",
            "responsibilities": [
                "Extract and clean data from SQL databases and analytical warehouses",
                "Perform statistical exploratory analysis with Python and Pandas",
                "Design and maintain dashboards in Power BI or Tableau",
                "Present weekly findings to product and marketing stakeholders"
            ],
            "skills": ["SQL", "Python", "Pandas", "Data Visualization", "Excel", "Statistics"],
            "related_skills": ["Tableau", "Power BI", "Data Cleaning", "Business Intelligence", "Git"],
            "learning": [
                "Master complex SQL queries, JOINs, subqueries, and window functions",
                "Complete an end-to-end data cleaning project with Python and Pandas",
                "Build and publish a real-time portfolio dashboard using open government data"
            ],
            "resources": [
                {"label": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
                {"label": "Pandas User Guide", "url": "https://pandas.pydata.org/docs/getting_started/index.html"},
                {"label": "SQL Tutorial - W3Schools", "url": "https://www.w3schools.com/sql/"}
            ]
        },
        {
            "id": "frontend-dev",
            "title": "Junior Frontend Developer",
            "category": "Software Engineering",
            "company": "Web & SaaS Industry",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Build high-performance, accessible, and responsive user interfaces using modern React, TypeScript, and clean CSS styling connected to REST APIs.",
            "responsibilities": [
                "Implement interactive components according to Figma design specifications",
                "Integrate client-side code with RESTful backend APIs and state management",
                "Ensure cross-browser compatibility and WCAG accessibility standards",
                "Write clean, modular code with automated component tests"
            ],
            "skills": ["JavaScript", "React", "HTML", "CSS", "Git", "REST APIs"],
            "related_skills": ["TypeScript", "Tailwind CSS", "Vite", "Responsive Design", "Jest"],
            "learning": [
                "Construct a responsive multi-page application with React Router and state hooks",
                "Connect frontend components to an authenticated backend API with error handling",
                "Practice Git pull-request workflows, branch management, and code reviews"
            ],
            "resources": [
                {"label": "React Official Docs", "url": "https://react.dev/learn"},
                {"label": "MDN Web Development Guide", "url": "https://developer.mozilla.org/en-US/docs/Learn"},
                {"label": "JavaScript Info", "url": "https://javascript.info/"}
            ]
        },
        {
            "id": "python-dev",
            "title": "Junior Python Developer",
            "category": "Software Engineering",
            "company": "Backend & Cloud Services",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Develop scalable backend web services, design secure database schemas, write robust unit tests, and integrate third-party APIs.",
            "responsibilities": [
                "Build and document RESTful endpoints using Flask and FastAPI",
                "Write optimized SQL queries and integrate SQLite/PostgreSQL databases",
                "Implement secure token-based user authentication and access controls",
                "Maintain code quality with pytest unit and integration test suites"
            ],
            "skills": ["Python", "Flask", "REST APIs", "SQL", "Git", "Testing"],
            "related_skills": ["FastAPI", "PostgreSQL", "Docker", "Pytest", "Linux"],
            "learning": [
                "Build a full CRUD API with Flask, SQLite persistence, and validation",
                "Implement JWT authentication with role-based permissions",
                "Write comprehensive test suites achieving over 85% test coverage"
            ],
            "resources": [
                {"label": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial/"},
                {"label": "Flask Documentation", "url": "https://flask.palletsprojects.com/en/stable/quickstart/"},
                {"label": "Real Python Tutorials", "url": "https://realpython.com/"}
            ]
        },
        {
            "id": "ml-intern",
            "title": "Machine Learning Intern",
            "category": "AI / Machine Learning",
            "company": "AI Research & Labs",
            "location": "Remote / Hybrid",
            "experience_level": "Internship / Student",
            "summary": "Prepare raw training data, construct baseline machine learning models, evaluate performance metrics, and document experimental results.",
            "responsibilities": [
                "Preprocess datasets, handle missing values, and execute feature engineering",
                "Train supervised regression and classification models using scikit-learn",
                "Evaluate models with precision, recall, F1-score, and ROC-AUC curves",
                "Document experiment runs, hyperparameter choices, and reproducible findings"
            ],
            "skills": ["Python", "NumPy", "Pandas", "Scikit-learn", "Statistics", "Model Evaluation"],
            "related_skills": ["PyTorch", "Data Preprocessing", "Jupyter", "Matplotlib", "Math"],
            "learning": [
                "Train and compare three classification models on a real-world tabular dataset",
                "Conduct rigorous cross-validation and document error analysis",
                "Build a reproducible inference pipeline and publish results to GitHub"
            ],
            "resources": [
                {"label": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
                {"label": "Fast.ai Practical Deep Learning", "url": "https://course.fast.ai/"},
                {"label": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course"}
            ]
        },
        {
            "id": "uiux-designer",
            "title": "Junior UI/UX Designer",
            "category": "Design & Product",
            "company": "Digital Product Studios",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Conduct qualitative user research, design wireframes and high-fidelity interactive prototypes, and collaborate with developers to ship intuitive digital experiences.",
            "responsibilities": [
                "Conduct user interviews and synthesize feedback into journey maps and personas",
                "Develop wireframes, user flows, and interactive prototypes in Figma",
                "Maintain and expand accessible design system component libraries",
                "Perform usability testing sessions and iterate designs based on evidence"
            ],
            "skills": ["Figma", "User Research", "Wireframing", "Prototyping", "Accessibility", "Design Systems"],
            "related_skills": ["Information Architecture", "Usability Testing", "UI Design", "Visual Design", "Design Thinking"],
            "learning": [
                "Design a complete mobile-first user onboarding experience in Figma",
                "Build an interactive prototype with variable states and component variants",
                "Conduct 5 usability test sessions and write a prioritized UX recommendation deck"
            ],
            "resources": [
                {"label": "Figma Learning Center", "url": "https://help.figma.com/hc/en-us/categories/360002051613-Get-started"},
                {"label": "Nielsen Norman Group UX Articles", "url": "https://www.nngroup.com/articles/"},
                {"label": "Interaction Design Foundation", "url": "https://www.interaction-design.org/literature"}
            ]
        },
        {
            "id": "cloud-devops",
            "title": "Cloud DevOps Associate",
            "category": "Cloud & Infrastructure",
            "company": "Enterprise Tech & Cloud",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Automate cloud infrastructure deployments, build CI/CD pipelines, containerize microservices, and ensure high system availability and monitoring.",
            "responsibilities": [
                "Containerize web services using Docker and manage local testing environments",
                "Create and maintain automated build/test pipelines with GitHub Actions",
                "Provision cloud infrastructure using Terraform and Infrastructure as Code",
                "Monitor application health, logs, and latency alerts with Prometheus/Grafana"
            ],
            "skills": ["Linux", "Docker", "Git", "CI/CD", "AWS", "Bash"],
            "related_skills": ["Kubernetes", "Terraform", "Python", "Cloud Monitoring", "Networking"],
            "learning": [
                "Containerize a multi-tier web application using Docker and Docker Compose",
                "Set up an automated GitHub Actions CI workflow with testing and linting",
                "Deploy an application securely to AWS or cloud provider with TLS encryption"
            ],
            "resources": [
                {"label": "Docker Getting Started", "url": "https://docs.docker.com/get-started/"},
                {"label": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions"},
                {"label": "AWS Skill Builder Free", "url": "https://explore.skillbuilder.aws/"}
            ]
        },
        {
            "id": "cybersecurity-analyst",
            "title": "Junior Cybersecurity Analyst",
            "category": "Security & Defense",
            "company": "Security Operations (SOC)",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Monitor security event logs, analyze vulnerabilities, investigate potential threat incidents, and enforce security compliance policies.",
            "responsibilities": [
                "Monitor SIEM alerts and triage suspicious network traffic and authentication anomalies",
                "Conduct vulnerability scans and prioritize patch remediation recommendations",
                "Document incident investigation timelines and write post-incident reviews",
                "Promote secure coding guidelines and user security awareness"
            ],
            "skills": ["Networking", "Linux", "Security Principles", "Vulnerability Assessment", "Python", "SIEM"],
            "related_skills": ["Wireshark", "Bash", "Incident Response", "Cryptography", "OWASP"],
            "learning": [
                "Master TCP/IP networking fundamentals, packet inspection, and Wireshark capture",
                "Study OWASP Top 10 vulnerabilities and practical mitigation strategies",
                "Complete hands-on incident triage labs on public cybersecurity training platforms"
            ],
            "resources": [
                {"label": "OWASP Top 10 Security Risks", "url": "https://owasp.org/www-project-top-ten/"},
                {"label": "Professor Messer Security+ Free Course", "url": "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/"},
                {"label": "Cisco Networking Basics", "url": "https://www.cisco.com/c/en/us/solutions/small-business/resource-center/networking/networking-basics.html"}
            ]
        },
        {
            "id": "fullstack-dev",
            "title": "Junior Full Stack Developer",
            "category": "Software Engineering",
            "company": "Modern Product Startups",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Work across the entire stack from responsive React frontend experiences to robust backend REST APIs and relational database persistence.",
            "responsibilities": [
                "Develop responsive web features with React on frontend and Python/Node on backend",
                "Design and manage relational database schemas and migration scripts",
                "Implement robust state management, authentication flows, and API security",
                "Deploy and maintain web applications on cloud and serverless platforms"
            ],
            "skills": ["JavaScript", "React", "Python", "SQL", "Git", "REST APIs"],
            "related_skills": ["Node.js", "TypeScript", "Flask", "Docker", "HTML/CSS"],
            "learning": [
                "Build a complete full-stack SaaS project with authentication and persistence",
                "Implement secure payment or webhook integration with automated error handling",
                "Deploy the full-stack system with separate frontend and backend hosting"
            ],
            "resources": [
                {"label": "The Odin Project Full Stack", "url": "https://www.theodinproject.com/"},
                {"label": "Full Stack Open (University of Helsinki)", "url": "https://fullstackopen.com/en/"},
                {"label": "MDN Web Docs", "url": "https://developer.mozilla.org/"}
            ]
        },
        {
            "id": "ai-engineer",
            "title": "AI Systems Engineer",
            "category": "AI / Machine Learning",
            "company": "Applied AI Companies",
            "location": "Remote / Hybrid",
            "experience_level": "Junior to Mid-level",
            "summary": "Design and build production AI services, integrate LLMs via embeddings and RAG pipelines, and optimize inference latency and cost.",
            "responsibilities": [
                "Implement retrieval-augmented generation (RAG) pipelines with vector search",
                "Build local and cloud inference integrations with structured output parsing",
                "Create evaluation benchmarks to monitor hallucination rates and prompt efficacy",
                "Optimize API rate limits, streaming responses, and contextual memory stores"
            ],
            "skills": ["Python", "REST APIs", "Vector Databases", "Prompt Engineering", "Git", "Scikit-learn"],
            "related_skills": ["LangChain", "FastAPI", "Docker", "RAG Pipelines", "Embeddings"],
            "learning": [
                "Build a local RAG assistant over custom documentation using vector embeddings",
                "Implement structured schema validation for LLM responses",
                "Create a rigorous automated benchmark measuring answer accuracy"
            ],
            "resources": [
                {"label": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course"},
                {"label": "Pinecone Learning Center", "url": "https://www.pinecone.io/learn/"},
                {"label": "Python Official Documentation", "url": "https://docs.python.org/3/"}
            ]
        },
        {
            "id": "data-engineer",
            "title": "Junior Data Engineer",
            "category": "Data & Analytics",
            "company": "Big Data & FinTech",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Construct dependable data pipelines, transform batch and streaming data, design analytical data models, and ensure data quality across warehouse tables.",
            "responsibilities": [
                "Write robust ETL/ELT pipelines using Python and SQL",
                "Model data warehouse tables using star schema and dimensional principles",
                "Automate data quality testing, schema enforcement, and pipeline alerting",
                "Collaborate with data analysts to deliver clean, documented datasets"
            ],
            "skills": ["Python", "SQL", "Git", "Data Modeling", "ETL Pipelines", "Linux"],
            "related_skills": ["PostgreSQL", "Apache Spark", "Airflow", "Docker", "Pandas"],
            "learning": [
                "Build an automated ETL pipeline that ingests public API data into PostgreSQL",
                "Design a dimensional data warehouse schema for e-commerce transactions",
                "Implement automated data quality checks and pipeline scheduling"
            ],
            "resources": [
                {"label": "PostgreSQL Official Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html"},
                {"label": "Data Engineering Zoomcamp", "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp"},
                {"label": "Python for Data Analysis Book Material", "url": "https://wesmckinney.com/book/"}
            ]
        },
        {
            "id": "product-intern",
            "title": "Product Management Intern",
            "category": "Design & Product",
            "company": "Tech Accelerators",
            "location": "Remote / Hybrid",
            "experience_level": "Internship / Student",
            "summary": "Support product discovery, conduct competitive market research, analyze user telemetry data, and write clear feature specifications for engineering teams.",
            "responsibilities": [
                "Conduct user research sessions and synthesize customer pain points",
                "Draft comprehensive Product Requirement Documents (PRDs) with acceptance criteria",
                "Analyze product usage metrics and conversion funnels to identify drop-offs",
                "Coordinate sprint priorities between design and software engineering teams"
            ],
            "skills": ["User Research", "Data Analysis", "Agile", "Wireframing", "Product Strategy", "Communication"],
            "related_skills": ["Figma", "SQL", "Market Research", "Jira", "A/B Testing"],
            "learning": [
                "Write a complete Product Requirement Document for a consumer app feature",
                "Map out a user journey and establish key performance metrics (KPIs)",
                "Conduct a competitive feature teardown of three leading SaaS products"
            ],
            "resources": [
                {"label": "Product School Resources", "url": "https://productschool.com/blog"},
                {"label": "Lenny's Newsletter Product Archive", "url": "https://www.lennysnewsletter.com/"},
                {"label": "Atlassian Agile Coach", "url": "https://www.atlassian.com/agile"}
            ]
        },
        {
            "id": "mobile-dev",
            "title": "Junior Mobile Developer",
            "category": "Software Engineering",
            "company": "Consumer Tech & Apps",
            "location": "Remote / Hybrid",
            "experience_level": "Entry-level (0-2 years)",
            "summary": "Develop cross-platform mobile applications for iOS and Android, connect local offline storage with backend APIs, and craft smooth mobile animations.",
            "responsibilities": [
                "Build responsive cross-platform screens using React Native or Flutter",
                "Manage local SQLite persistence and offline-first state synchronization",
                "Integrate device hardware features such as camera, notifications, and location",
                "Prepare app store distribution assets and test on diverse screen dimensions"
            ],
            "skills": ["JavaScript", "React", "Mobile Development", "REST APIs", "Git", "State Management"],
            "related_skills": ["React Native", "TypeScript", "iOS/Android Basics", "CSS", "Jest"],
            "learning": [
                "Build a cross-platform mobile task tracker with offline storage",
                "Implement push notification handling and secure auth token storage",
                "Publish a production-ready demo build tested across Android and iOS emulators"
            ],
            "resources": [
                {"label": "React Native Official Getting Started", "url": "https://reactnative.dev/docs/getting-started"},
                {"label": "Flutter Docs", "url": "https://docs.flutter.dev/"},
                {"label": "MDN Mobile Web Development", "url": "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"}
            ]
        }
    ]

    conn = get_db_connection(db_path)
    with conn:
        for r in roles:
            conn.execute("""
                INSERT INTO career_roles (
                    id, title, category, company, location, experience_level,
                    summary, responsibilities_json, skills_json, related_skills_json,
                    learning_json, resources_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    category = excluded.category,
                    company = excluded.company,
                    location = excluded.location,
                    experience_level = excluded.experience_level,
                    summary = excluded.summary,
                    responsibilities_json = excluded.responsibilities_json,
                    skills_json = excluded.skills_json,
                    related_skills_json = excluded.related_skills_json,
                    learning_json = excluded.learning_json,
                    resources_json = excluded.resources_json
            """, (
                r["id"], r["title"], r["category"], r["company"], r["location"],
                r["experience_level"], r["summary"],
                json.dumps(r["responsibilities"]),
                json.dumps(r["skills"]),
                json.dumps(r["related_skills"]),
                json.dumps(r["learning"]),
                json.dumps(r["resources"])
            ))
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized and seeded successfully.")
