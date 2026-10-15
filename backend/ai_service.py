"""AI Career Assistant Service: local Ollama inference, Gemini cloud inference, and an intelligent, proactive career mentor fallback."""
import os
import json
import re
import requests
from matching import rank_jobs

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
REQUEST_TIMEOUT = int(os.getenv("AI_REQUEST_TIMEOUT", "15"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

def check_ollama_availability():
    """Checks if a local Ollama server is accessible."""
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=1.5)
        if resp.status_code == 200:
            models_data = resp.json().get("models", [])
            model_names = [m.get("name", "").split(":")[0] for m in models_data]
            return {
                "available": True,
                "models": model_names,
                "target_model": OLLAMA_MODEL,
                "has_target_model": any(OLLAMA_MODEL in m for m in model_names)
            }
    except Exception:
        pass
    return {"available": False, "models": [], "target_model": OLLAMA_MODEL, "has_target_model": False}

def check_gemini_availability():
    """Checks if Google Gemini API is configured via environment variables."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    return {
        "configured": bool(api_key),
        "target_model": model,
        "is_available": bool(api_key)
    }

def get_ai_status():
    """Returns transparent health status of all AI subsystems."""
    ollama_info = check_ollama_availability()
    gemini_info = check_gemini_availability()
    
    ollama_ready = ollama_info["available"] and ollama_info["has_target_model"]
    gemini_ready = gemini_info["is_available"]

    if ollama_ready:
        active_mode = "generative_model_ollama"
        mode_desc = f"Local Generative Model (Ollama: {ollama_info['target_model']})"
        active_provider = "Ollama (Local LLM)"
        active_model = ollama_info["target_model"]
    elif gemini_ready:
        active_mode = "generative_model_gemini"
        mode_desc = f"Cloud Generative Model (Google Gemini: {gemini_info['target_model']})"
        active_provider = "Google Gemini (Cloud LLM)"
        active_model = gemini_info["target_model"]
    else:
        active_mode = "contextual_career_coach_fallback"
        mode_desc = "Context-Aware Local Career Mentoring Engine"
        active_provider = "Local Contextual Career Mentor Engine"
        active_model = "careerpath-mentor-v2"

    return {
        "api_online": True,
        "matching_engine": "active (weighted skill overlap & proficiency)",
        "semantic_engine": "active (scikit-learn tf-idf cosine similarity)",
        "generative_llm": {
            "configured": bool(OLLAMA_BASE_URL) or gemini_ready,
            "provider": active_provider,
            "base_url": OLLAMA_BASE_URL if ollama_ready else "https://generativelanguage.googleapis.com",
            "target_model": active_model,
            "is_available": ollama_ready or gemini_ready,
            "installed_models": ollama_info["models"],
            "cloud_provider": "gemini" if gemini_ready else None
        },
        "active_mode": active_mode,
        "mode_description": mode_desc
    }

def generate_proactive_insights(profile_context: dict, catalogue: list) -> list:
    """
    Synthesizes proactive, actionable career intelligence insights derived strictly
    from the user's authentic profile state, tasks momentum, and target role benchmarks.
    Never fabricates metrics, completed tasks, or false claims.
    """
    user_name = profile_context.get("full_name", "Learner").split()[0]
    user_skills = profile_context.get("skills", [])
    target_role_id = profile_context.get("target_role", "")
    tasks = profile_context.get("tasks", [])
    weekly_hours = profile_context.get("weekly_hours", 10)
    portfolio_projects = profile_context.get("portfolio_projects", "")

    insights = []
    user_skills_lower = {s.lower() for s in user_skills}

    # Find target role or top matched role
    target_role = None
    if target_role_id:
        target_role = next((r for r in catalogue if r["id"] == target_role_id or r["title"].lower() == target_role_id.lower()), None)
    if not target_role and user_skills:
        matches = rank_jobs({"skills": user_skills, "interests": []}, catalogue)
        if matches:
            top_id = matches[0]["id"]
            target_role = next((r for r in catalogue if r["id"] == top_id), None)
    if not target_role and catalogue:
        target_role = catalogue[0]

    # Insight 1: Targeted Competency & Gap Remediation
    if target_role:
        role_skills = target_role.get("skills", [])
        matched = [s for s in role_skills if s.lower() in user_skills_lower]
        missing = [s for s in role_skills if s.lower() not in user_skills_lower]

        if missing:
            top_missing = missing[0]
            insights.append({
                "id": "insight-gap",
                "type": "gap",
                "kicker": f"CRITICAL GAP : {target_role['title'].upper()}",
                "title": f"Priority competency: {top_missing}",
                "message": f"Your current stack includes {len(matched)} matching competency for {target_role['title']}, but '{top_missing}' is an essential prerequisite. Focusing on '{top_missing}' will yield the highest jump in qualification signal.",
                "action_label": f"Analyze {top_missing} Gap",
                "action_route": "/skills",
                "suggested_prompt": f"How can I effectively demonstrate {top_missing} for {target_role['title']}?"
            })
        elif matched:
            insights.append({
                "id": "insight-matched",
                "type": "gap",
                "kicker": f"ROLE ALIGNMENT : {target_role['title'].upper()}",
                "title": "Strong foundational overlap",
                "message": f"You match all core baseline competencies ({', '.join(matched[:4])}) for {target_role['title']}. Your next objective is assembling a cohesive portfolio project that proves practical synthesis.",
                "action_label": "Review Role Details",
                "action_route": f"/careers?role={target_role['id']}",
                "suggested_prompt": f"Suggest a portfolio capstone that proves proficiency in {', '.join(matched[:3])}."
            })

    # Insight 2: Learning Momentum & Weekly Pacing
    completed_tasks = [t for t in tasks if t.get("status") == "completed"]
    pending_tasks = [t for t in tasks if t.get("status") == "pending"]

    if len(completed_tasks) >= 2:
        insights.append({
            "id": "insight-momentum",
            "type": "momentum",
            "kicker": "MOMENTUM & SYNTHESIS",
            "title": f"{len(completed_tasks)} milestones completed",
            "message": f"You have completed {len(completed_tasks)} learning tasks. Rather than continuing with isolated tutorials, consolidate these skills into a deployed artifact with clear documentation.",
            "action_label": "Consult Mentor on Capstone",
            "action_route": "/chat",
            "suggested_prompt": "How can I turn my recently completed learning milestones into a resume impact bullet point?"
        })
    elif pending_tasks:
        first_pending = pending_tasks[0]
        est_duration = first_pending.get("estimated_duration", "45 mins")
        insights.append({
            "id": "insight-pacing",
            "type": "pacing",
            "kicker": f"WEEKLY STRATEGY : {weekly_hours} HOURS BUDGET",
            "title": f"Prioritized milestone: {first_pending.get('title')}",
            "message": f"With {weekly_hours} hours available this week, focus your learning sessions on '{first_pending.get('title')}'. Finishing this single milestone will maintain steady forward progress.",
            "action_label": "Open Learning Roadmap",
            "action_route": "/roadmap",
            "suggested_prompt": f"Break down '{first_pending.get('title')}' into two 45-minute study sessions."
        })
    else:
        insights.append({
            "id": "insight-roadmap",
            "type": "pacing",
            "kicker": "CURRICULUM INITIALIZATION",
            "title": "No active learning milestones scheduled",
            "message": f"You have {weekly_hours} hours available per week. Generate a structured 30-day curriculum tailored to your schedule to systematically bridge skill gaps.",
            "action_label": "Generate 30-Day Plan",
            "action_route": "/roadmap",
            "suggested_prompt": f"Create a realistic four-week study plan for {target_role['title'] if target_role else 'my target career'}."
        })

    # Insight 3: Portfolio & Demonstration Reality Check
    if user_skills and not portfolio_projects:
        primary_skill = user_skills[0]
        insights.append({
            "id": "insight-portfolio",
            "type": "portfolio",
            "kicker": "PORTFOLIO INTELLIGENCE",
            "title": f"Demonstrate {primary_skill} with a deployed artifact",
            "message": f"You've listed {primary_skill} in your competency ledger. In today's hiring market, recruiters heavily prioritize working GitHub repositories or deployed live URLs over mere self-reported skill ratings.",
            "action_label": "Get Project Ideas",
            "action_route": "/chat",
            "suggested_prompt": f"What is an impressive, realistic project idea that demonstrates {primary_skill}?"
        })

    return insights[:3]

def detect_intent(message: str) -> str:
    """Classifies user intent from natural language inquiry with expanded intelligence."""
    msg = message.lower()
    
    # Explain score or match reasons
    if any(k in msg for k in ["why is my score", "why low match", "why is my match score", "score low", "explain match score", "explain score", "why did i get"]):
        return "explain_score"

    # Weekly pacing & time budget
    if any(k in msg for k in ["hours available", "hours this week", "hours to study", "limited time", "what should i prioritize with", "time budget", "weekly pacing", "how many hours"]):
        return "weekly_pacing"

    # What to learn next
    if any(k in msg for k in ["what should i learn next", "what to learn next", "next skill", "priority skill", "what do i learn next", "what next"]):
        return "what_to_learn_next"

    # Portfolio project guidance
    if any(k in msg for k in ["portfolio", "improve this project", "project for my portfolio", "capstone", "github project", "build a project", "what project"]):
        return "portfolio_advice"

    # Simple language explanation
    if any(k in msg for k in ["simple language", "simple terms", "explain this skill", "explain in plain", "for beginners", "like i'm five", "eli5"]):
        return "explain_skill"

    # Career matching & role directions
    if any(k in msg for k in ["which career should i focus", "which career", "match", "fit my skills", "best fit", "recommend a role", "explore role"]):
        return "career_matching"

    # Skill gaps
    if any(k in msg for k in ["gap", "missing skills", "what skills am i missing", "skills do i need", "lacking"]):
        return "skill_gap"

    # Curricula & study plans
    if any(k in msg for k in ["four-week", "four week", "4-week", "4 week", "plan", "roadmap", "30-day", "30 day", "60 day", "study schedule", "schedule"]):
        return "learning_plan"

    # Resumes
    if any(k in msg for k in ["resume", "cv", "bullet point", "google xyz", "xyz formula"]):
        return "resume_guidance"

    # Interviews
    if any(k in msg for k in ["interview", "mock", "practice question", "behavioral", "technical interview", "star method"]):
        return "interview_prep"

    # Networking
    if any(k in msg for k in ["referral", "network", "reach out", "linkedin", "cold message", "outreach"]):
        return "networking_outreach"

    if any(k in msg for k in ["why did you recommend", "explain why", "why recommended"]):
        return "explain_recommendation"

    return "general_career"

def build_coach_fallback_response(user_msg: str, profile_context: dict, catalogue: list) -> dict:
    """
    Intelligent context-aware career mentor that generates detailed, personalized responses
    utilizing stored user skills, target role, education, weekly hours, learning style, and role catalogue.
    """
    intent = detect_intent(user_msg)
    user_name = profile_context.get("full_name", "Learner").split()[0]
    user_skills = profile_context.get("skills", [])
    target_role_id = profile_context.get("target_role", "")
    education = profile_context.get("education", "Undergraduate")
    tasks = profile_context.get("tasks", [])
    weekly_hours = profile_context.get("weekly_hours", 10)
    learning_style = profile_context.get("learning_style", "Hands-on Projects")
    portfolio_projects = profile_context.get("portfolio_projects", "")

    skills_str = ", ".join(user_skills) if user_skills else "no skills added yet"
    user_skills_lower = {s.lower() for s in user_skills}

    # Resolve target role
    target_role = None
    if target_role_id:
        target_role = next((r for r in catalogue if r["id"] == target_role_id or r["title"].lower() == target_role_id.lower()), None)
    if not target_role and user_skills:
        matches = rank_jobs({"skills": user_skills, "interests": []}, catalogue)
        if matches:
            target_role = next((r for r in catalogue if r["id"] == matches[0]["id"]), None)
    if not target_role and catalogue:
        target_role = catalogue[0]

    target_title = target_role["title"] if target_role else "Software Engineer"
    target_skills = target_role.get("skills", []) if target_role else []
    matched_skills = [s for s in target_skills if s.lower() in user_skills_lower]
    missing_skills = [s for s in target_skills if s.lower() not in user_skills_lower]

    # 1. Weekly Pacing & Time Budget Intent
    if intent == "weekly_pacing":
        # Extract mentioned hours if provided in message (e.g., "5 hours", "20 hours")
        hours_match = re.search(r"(\d+)\s*(?:hours|hrs)", user_msg.lower())
        budget = int(hours_match.group(1)) if hours_match else weekly_hours

        pending_tasks = [t for t in tasks if t.get("status") == "pending"]
        recommended_focus = pending_tasks[0]["title"] if pending_tasks else (f"Master {missing_skills[0]} Fundamentals" if missing_skills else "Build a Capstone Project")

        reply = [
            f"### Weekly Focus Strategy ({budget} Hours Available)\n",
            f"With **{budget} hours this week**, the most common mistake is spreading yourself thin across three different tutorials. Instead, prioritize depth on a single high-leverage objective.\n",
            f"#### 🎯 Your #1 Priority: **{recommended_focus}**",
            f"- **Why this matters**: It directly addresses a core requirement for {target_title} and moves you from passive learning to active capability.",
            f"- **Preferred Mode**: Tailored for your **{learning_style}** preference.\n",
            "#### ⏱️ Suggested Schedule Breakdown:",
            f"- **Session 1 ({int(budget * 0.4)} hrs)**: Deep conceptual foundation. Build a small reproduction script or minimal implementation.",
            f"- **Session 2 ({int(budget * 0.4)} hrs)**: Hands-on implementation. Write automated assertions or connect to an API endpoint.",
            f"- **Session 3 ({int(budget * 0.2)} hrs)**: Document your design decisions in a clean GitHub README.\n",
            f"> *Proactive Mentor Tip: Consistency beats marathon cramming. Two focused 2-hour blocks produce far better retention than one exhausted 4-hour session.*"
        ]
        actions = []
        if missing_skills:
            actions.append({
                "type": "create_task",
                "label": f"+ Add '{missing_skills[0]} Practice Task' to Roadmap",
                "payload": {
                    "title": f"Build a {missing_skills[0]} Mini-Application",
                    "explanation": f"Hands-on portfolio milestone tackling {missing_skills[0]} fundamentals for {target_title}.",
                    "priority": "High",
                    "estimated_duration": f"{max(30, int(budget * 30))} mins",
                    "skill_category": "Skill Development"
                }
            })
        actions.append({"label": "View Learning Roadmap", "route": "/roadmap"})
        return {"content": "\n".join(reply), "actions": actions}

    # 2. Explain Low Match Score Intent
    if intent == "explain_score":
        reply = [
            f"### 🔍 Understanding Your Match Score for **{target_title}**\n",
            "It is completely natural to look at a 40%–60% score and feel discouraged, but that number is a diagnostic tool, not an evaluation of your potential.\n",
            "#### How Your Score Is Calibrated:",
            f"1. **Core Overlap (70% weight)**: {target_title} requires `{', '.join(target_skills[:4])}`. You have verified **{len(matched_skills)} of {len(target_skills)}** skills.",
            f"2. **Proficiency Scaling**: We evaluate your self-assessed calibration level. A skill rated at 50% contributes less weight than one at 85%.",
            f"3. **Missing Critical Prerequisite**: You are currently missing `{', '.join(missing_skills[:3]) if missing_skills else 'advanced architecture'}`.\n",
            "#### 💡 Why This Is Actually Good News:",
            f"A score around 55%–65% for an entry-level applicant simply means you are in the **active preparation stage**. By adding just **one or two key skills** ({missing_skills[0] if missing_skills else 'system design'}), your score will typically jump by 15% to 25%.\n",
            "> *Remember: Match scores measure similarity to standard job descriptions, not an employer's hiring decision.*"
        ]
        actions = [
            {"label": f"Review {target_title} Details", "route": f"/careers?role={target_role['id']}"},
            {"label": "Calibrate Skills in Ledger", "route": "/skills"}
        ]
        return {"content": "\n".join(reply), "actions": actions}

    # 3. What to Learn Next Intent
    if intent == "what_to_learn_next":
        next_skill = missing_skills[0] if missing_skills else (user_skills[0] if user_skills else "Python")
        second_skill = missing_skills[1] if len(missing_skills) > 1 else "Git & CI/CD"

        reply = [
            f"### 🚀 Recommended Next Competency: **{next_skill}**\n",
            f"Based on your target role as a **{target_title}**, your single highest-return next milestone is **{next_skill}**.\n",
            f"#### Why {next_skill} Takes Precedence:",
            f"- It is listed as an essential requirement across {target_title} benchmark postings.",
            f"- It synergizes immediately with your existing knowledge of `{', '.join(user_skills[:2]) if user_skills else 'programming basics'}`.\n",
            f"#### Concrete Project to Prove It (Rather Than Just Reading):",
            f"- Build a small utility or service that demonstrates {next_skill} in action.",
            f"- Include error handling, modular functions, and write a clear README.",
            f"- Once completed, you can move to your second priority: **{second_skill}**.\n",
            f"Would you like me to add this milestone directly to your Learning Roadmap?"
        ]
        actions = [
            {
                "type": "create_task",
                "label": f"+ Add 'Master {next_skill}' to My Roadmap",
                "payload": {
                    "title": f"Implement {next_skill} Mini-Project",
                    "explanation": f"Hands-on project milestone validating practical competence in {next_skill} for {target_title}.",
                    "priority": "High",
                    "estimated_duration": "45-60 mins",
                    "skill_category": "Skill Development"
                }
            },
            {"label": "View Current Roadmap", "route": "/roadmap"}
        ]
        return {"content": "\n".join(reply), "actions": actions}

    # 4. Portfolio Guidance Intent
    if intent == "portfolio_advice":
        tech_stack = ", ".join(user_skills[:3]) if user_skills else "Python, SQL, React"
        reply = [
            f"### 💼 Portfolio Engineering: Moving Beyond Generic Tutorials\n",
            f"Hiring managers discard generic tutorial projects (like basic to-do apps or weather widgets) because they don't prove independent problem-solving. Here is how to create an impressive artifact using **{tech_stack}**:\n",
            "#### 1. Build Around a Real Data Flow",
            "- Don't use static dummy arrays. Ingest a real public API (e.g. NOAA weather data, SEC financial filings, or GitHub event stream).",
            "- Clean and transform the payload, handling malformed inputs and network timeouts.\n",
            "#### 2. Provide Verifiable Proof of Quality",
            "- Include automated tests: show at least 4 unit tests covering edge cases.",
            "- Add a deployed URL: a live link on Vercel, Render, or GitHub Pages increases review likelihood by 3x.\n",
            "#### 3. Write an Architectural README",
            "- Explain: *What problem does this solve?*",
            "- Detail: *What architectural tradeoffs did you make? (e.g. why SQLite over JSON files)*",
            "- Include: *How would you scale this to 10,000 requests/sec?*\n",
            f"> *Would you like me to outline a capstone project specifically tailored for {target_title}?*"
        ]
        actions = [
            {"label": "Review My Target Role", "route": f"/careers?role={target_role['id']}"},
            {"label": "Update Portfolio in Profile", "route": "/settings"}
        ]
        return {"content": "\n".join(reply), "actions": actions}

    # 5. Explain Skill in Simple Terms Intent
    if intent == "explain_skill":
        # Check what skill they might be asking about
        queried_skill = "REST APIs"
        for s in target_skills + user_skills + ["sql", "docker", "git", "react", "python", "typescript", "kubernetes", "rest"]:
            if s.lower() in user_msg.lower():
                queried_skill = s
                break

        reply = [
            f"### 💡 Simple Conceptual Breakdown: **{queried_skill.upper()}**\n",
            f"Here is how to understand **{queried_skill}** without academic jargon:\n",
            "#### The Restaurant Analogy:",
            f"- Imagine a restaurant kitchen. The kitchen (the server) has all the ingredients and cooking logic.",
            "- You (the client/browser) are at the dining table. You cannot walk into the kitchen yourself.",
            f"- The waiter who takes your order and brings your food back is **{queried_skill}** (the communication protocol).\n",
            "#### Why Employers Care:",
            "- In software engineering, no program runs alone. Every web application, mobile app, and AI model talks to external services.",
            f"- Knowing {queried_skill} means you know how to safely send requests, interpret responses, and handle errors when services fail.\n",
            "#### How to Practice It in 20 Minutes:",
            f"- Use a tool like Postman or `curl` to make a GET request to `https://api.github.com` and inspect the returned JSON payload."
        ]
        actions = [
            {
                "type": "create_task",
                "label": f"+ Add '{queried_skill} Hands-on Practice' to Roadmap",
                "payload": {
                    "title": f"Practice {queried_skill} with Live Endpoints",
                    "explanation": f"Hands-on exercise sending requests and handling JSON payloads.",
                    "priority": "Medium",
                    "estimated_duration": "30 mins",
                    "skill_category": "Skill Development"
                }
            },
            {"label": "View Learning Roadmap", "route": "/roadmap"}
        ]
        return {"content": "\n".join(reply), "actions": actions}

    # 6. Career Matching Intent
    if intent == "career_matching":
        if not user_skills:
            return {
                "content": f"Hi {user_name}! To provide personalized career recommendations, please record your competencies in the **My Skills** ledger. For example, adding languages like Python, JavaScript, SQL, or design tools like Figma will immediately trigger tailored role matches.",
                "actions": [{"label": "Add Skills in My Skills", "route": "/skills"}]
            }
        matches = rank_jobs({"skills": user_skills, "interests": profile_context.get("interests", [])}, catalogue)
        top_matches = matches[:3]
        
        reply = [f"Hi {user_name}! Based on your current skills (**{skills_str}**), here are your top 3 matching career directions:\n"]
        actions = []
        for i, m in enumerate(top_matches, 1):
            reply.append(f"### {i}. {m['title']} ({m['match_score']}% Match Signal)")
            reply.append(f"- **Why it matches**: You already have core skills: `{', '.join(m['matched_skills'][:3])}`.")
            if m["missing_skills"]:
                reply.append(f"- **Key skills to learn**: `{', '.join(m['missing_skills'][:3])}`.")
            reply.append(f"- **Next Step**: Review the role overview and consider adding a practice task.\n")
            actions.append({"label": f"Explore {m['title']}", "route": f"/careers?role={m['id']}"})
        
        reply.append("> *Note: Match signals represent profile-to-role similarity, not an employment guarantee.*")
        return {"content": "\n".join(reply), "actions": actions}

    # 7. Skill Gap Analysis Intent
    if intent == "skill_gap":
        target = target_role or catalogue[0]
        matched = [s for s in target["skills"] if s.lower() in user_skills_lower]
        missing = [s for s in target["skills"] if s.lower() not in user_skills_lower]

        reply = [
            f"### Skill-Gap Analysis for **{target['title']}**\n",
            f"Here is your transparent skill breakdown for the **{target['title']}** path:\n",
            f"✅ **Skills You Already Possess ({len(matched)}):**",
            f"- {', '.join(matched) if matched else 'None recorded yet.'}\n",
            f"🎯 **High-Priority Missing Skills ({len(missing)}):**"
        ]
        for s in missing:
            reply.append(f"- **{s}**: Foundational for {target['title']}. We recommend building a mini-project to demonstrate it.")
        
        reply.append(f"\n**Suggested Action**: Generate learning milestones for this path in your **Learning Roadmap**.")
        actions = []
        if missing:
            actions.append({
                "type": "create_task",
                "label": f"+ Add Milestone for {missing[0]}",
                "payload": {
                    "title": f"Study & Build with {missing[0]}",
                    "explanation": f"Targeted gap remediation for {target['title']}.",
                    "priority": "High",
                    "estimated_duration": "45 mins",
                    "skill_category": "Skill Development"
                }
            })
        actions.append({"label": f"View {target['title']} Details", "route": f"/careers?role={target['id']}"})
        actions.append({"label": "View Learning Roadmap", "route": "/roadmap"})
        return {"content": "\n".join(reply), "actions": actions}

    # 8. Learning Plan / Roadmap Intent
    if intent == "learning_plan":
        focus = target_title if target_role else "Software Engineering"
        reply = [
            f"### 📅 4-Week Practical Learning Plan: **{focus}**\n",
            f"Calibrated for your schedule ({weekly_hours} hours/week) and **{learning_style}** preference:\n",
            "#### Week 1: Core Fundamentals & Working CLI",
            "- **Goal**: Master syntax, variables, data structures, and control flow.",
            "- **Hands-on Task**: Build 3 CLI utility scripts solving daily automation tasks.",
            "- **Checkpoint**: Push code to a clean GitHub repository with a descriptive README.\n",
            "#### Week 2: Intermediate Tooling & API Integration",
            "- **Goal**: Work with external libraries, APIs, and file I/O.",
            "- **Hands-on Task**: Ingest a public API dataset, clean the data, and handle edge cases.",
            "- **Checkpoint**: Write automated unit tests for your data handlers.\n",
            "#### Week 3: Capstone Mini-Project",
            "- **Goal**: Connect frontend, backend, or database persistence.",
            "- **Hands-on Task**: Build an interactive portfolio artifact with documentation.",
            "- **Checkpoint**: Add unit tests and document setup instructions.\n",
            "#### Week 4: Polish, Code Review & Storytelling",
            "- **Goal**: Optimize code, perform self-review, and prepare for interviews.",
            "- **Hands-on Task**: Write a concise explanation explaining design choices and tradeoffs.",
            "- **Checkpoint**: Add the completed project to your resume using the Google XYZ formula."
        ]
        actions = [
            {
                "type": "create_task",
                "label": "+ Add Week 1 Task to Roadmap",
                "payload": {
                    "title": f"Week 1: Core {target_skills[0] if target_skills else 'Code'} Foundations",
                    "explanation": f"Initial 4-week roadmap milestone for {focus}.",
                    "priority": "High",
                    "estimated_duration": "45 mins",
                    "skill_category": "Skill Development"
                }
            },
            {"label": "View Full Learning Roadmap", "route": "/roadmap"}
        ]
        return {"content": "\n".join(reply), "actions": actions}

    # 9. Resume Guidance Intent
    if intent == "resume_guidance":
        reply = [
            f"### 📄 Actionable Resume Optimization for {user_name}\n",
            "To maximize interview callbacks for internships and junior positions, use the **Google XYZ Formula**:\n",
            "> *\"Accomplished [X], as measured by [Y], by doing [Z]\"*\n",
            "#### 1. Transform Passive Bullets into Impact Statements",
            "- ❌ *Weak*: \"Worked with React and made dashboard components.\"",
            "- ✅ *Strong*: \"Architected 6 reusable React components with accessibility standards, reducing page render latency by 35%.\"",
            "- ❌ *Weak*: \"Did data analysis in Python for class project.\"",
            "- ✅ *Strong*: \"Cleaned and transformed 45,000+ customer records using Pandas; discovered 3 pricing bottlenecks that improved simulated conversions by 12%.\"\n",
            "#### 2. Technical Skills Section",
            f"- Group your skills cleanly: **Languages** ({skills_str}), **Frameworks/Tools**, and **Databases**.",
            "- Never list rating bars (e.g. \"Python 4/5 stars\") — let your projects demonstrate your proficiency.\n",
            "#### 3. Portfolio & Code Proof",
            "- Always include verified GitHub links with working READMEs and live demo URLs."
        ]
        return {
            "content": "\n".join(reply),
            "actions": [{"label": "Review My Skills", "route": "/skills"}]
        }

    # 10. Interview Preparation Intent
    if intent == "interview_prep":
        reply = [
            f"### 🎯 Technical & Behavioral Interview Preparation Guide\n",
            f"Here are high-frequency practice questions tailored for {target_title} roles:\n",
            "#### Technical Fundamentals",
            "1. **Explain RESTful API design**: What are the key HTTP methods, status codes (200, 201, 400, 401, 404, 500), and idempotent operations?",
            "2. **State Management & Asynchronous flow**: How do you prevent UI race conditions when fetching data asynchronously?",
            "3. **Database Indexing & Queries**: How do SQL indexes optimize query execution, and what is the tradeoff with INSERT performance?\n",
            "#### Behavioral Question (STAR Method)",
            "- **Question**: *\"Tell me about a time you ran into a difficult bug or roadblock in a project. How did you resolve it?\"*",
            "- **Framework to Answer**:",
            "  - **Situation**: Context of the application you were building.",
            "  - **Task**: The specific unexpected failure or bug.",
            "  - **Action**: How you debugged it systematically (reading logs, isolating commits, writing a reproduction test).",
            "  - **Result**: What you learned and how you prevented future regressions."
        ]
        return {
            "content": "\n".join(reply),
            "actions": [{"label": "Schedule Mock Prep in Calendar", "route": "/calendar"}]
        }

    # 11. Networking & Outreach Intent
    if intent == "networking_outreach":
        reply = [
            f"### 🤝 High-Conversion Networking & Referral Outreach Template\n",
            "When reaching out to alumni, recruiters, or senior engineers on LinkedIn:\n",
            "```text\n"
            f"Hi [Name],\n\n"
            f"I hope you're having a great week! I've been following [Company]'s work on [Specific Product/Feature] and was really impressed by [Specific Detail].\n\n"
            f"I'm an aspiring software engineer specializing in {user_skills[0] if user_skills else 'software engineering'} and building projects in this space. I noticed your inspiring career journey at [Company] and would love to ask 2 brief questions about how your team approaches [Topic/Stack].\n\n"
            f"Would you be open to a 10-minute virtual coffee chat sometime next week? No worries if your schedule is packed!\n\n"
            f"Best regards,\n"
            f"{user_name}\n"
            "```\n",
            "**Key Tips:** Keep it under 100 words, show you did prior research, and never ask for a referral in the very first message."
        ]
        return {
            "content": "\n".join(reply),
            "actions": [{"label": "Save Contact in Networking Hub", "route": "/networking"}]
        }

    # 12. General Career Mentor Fallback
    completed_count = len([t for t in tasks if t.get("status") == "completed"])
    reply = [
        f"Hi {user_name}! I am your **CareerPath AI Mentor**.\n",
        f"Here is your current career standing: You have **{len(user_skills)} skills** logged ({skills_str}), **{completed_count} completed tasks**, and a budget of **{weekly_hours} hours/week** targeting **{target_title}**.\n",
        "Here are specific ways I can guide your progress today:",
        "1. **Weekly Pacing**: Ask *\"What should I prioritize with my hours this week?\"*",
        "2. **Skill-Gap Remediation**: Ask *\"What skills am I missing for my target role?\"*",
        "3. **Score Explanation**: Ask *\"Why is my match score what it is?\"*",
        "4. **Portfolio Engineering**: Ask *\"How can I improve my project for my portfolio?\"*",
        "5. **Conceptual Clarity**: Ask *\"Explain REST APIs in simple language\"*",
        "6. **Interview Practice**: Ask *\"Give me practice interview questions for React\"*\n",
        "Where would you like to direct our focus today?"
    ]
    return {
        "content": "\n".join(reply),
        "actions": [
            {"label": "Explore Career Matches", "route": "/careers"},
            {"label": "Manage Skills", "route": "/skills"}
        ]
    }

def generate_assistant_response(conversation_history: list, profile_context: dict, catalogue: list) -> dict:
    """
    Main orchestration function.
    Attempts local Ollama generative model first if configured and available.
    Falls back gracefully to the rich, context-aware local mentor engine.
    """
    user_message = conversation_history[-1]["content"] if conversation_history else ""
    ollama_status = check_ollama_availability()

    mentor_persona = (
        "You are the CareerPath AI Career Mentor, an expert, supportive, proactive career advisor. "
        "Your personality: knowledgeable without arrogance, encouraging without empty motivational fluff, "
        "honest about skill gaps, realistic about job market expectations, and proactive in suggesting practical next steps. "
        "Explain WHY a recommendation matters, not just what to do. Avoid robotic greetings or repetitive disclaimers. "
        f"User Profile: Name: {profile_context.get('full_name')}, Education: {profile_context.get('education')}, "
        f"Target Role: {profile_context.get('target_role')}, Weekly Hours: {profile_context.get('weekly_hours', 10)}, "
        f"Learning Style: {profile_context.get('learning_style', 'Hands-on')}, "
        f"Skills: {', '.join(profile_context.get('skills', []))}. "
        "Never claim match scores are hiring guarantees. Keep responses structured, concise, and actionable."
    )

    if ollama_status["available"] and ollama_status["has_target_model"]:
        try:
            messages = [{"role": "system", "content": mentor_persona}]
            for msg in conversation_history[-6:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
            resp = requests.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False
                },
                timeout=REQUEST_TIMEOUT
            )
            if resp.status_code == 200:
                body = resp.json()
                content = body.get("message", {}).get("content", "")
                if content:
                    return {
                        "content": content,
                        "provider": "Ollama (Local LLM)",
                        "model": OLLAMA_MODEL,
                        "is_generative": True,
                        "actions": []
                    }
        except Exception:
            pass

    # Attempt Google Gemini Cloud LLM if API key is provided
    gemini_status = check_gemini_availability()
    if gemini_status["is_available"]:
        try:
            contents = []
            for msg in conversation_history[-6:]:
                role = "user" if msg["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": msg["content"]}]})

            gemini_payload = {
                "contents": contents,
                "systemInstruction": {"parts": [{"text": mentor_persona}]},
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 800}
            }
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
            resp = requests.post(api_url, json=gemini_payload, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                if text:
                    return {
                        "content": text,
                        "provider": "Google Gemini (Cloud LLM)",
                        "model": GEMINI_MODEL,
                        "is_generative": True,
                        "actions": []
                    }
        except Exception:
            pass

    # Fallback to local contextual career mentor
    fallback_result = build_coach_fallback_response(user_message, profile_context, catalogue)
    return {
        "content": fallback_result["content"],
        "provider": "Local Contextual Career Mentor Engine",
        "model": "careerpath-mentor-v2",
        "is_generative": False,
        "actions": fallback_result.get("actions", [])
    }
