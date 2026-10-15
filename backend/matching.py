"""Career matching service: transparent overlap baseline, proficiency weighting, and TF-IDF semantic similarity."""
import re
from functools import lru_cache

def normalize_skill(skill):
    """Normalizes skill strings for accurate comparison."""
    if not skill:
        return ""
    cleaned = re.sub(r"[^a-zA-Z0-9\s\+\#\.\/]", " ", str(skill).lower())
    return re.sub(r"\s+", " ", cleaned).strip()

def calculate_skill_alignment(user_skills_dict, required_skills, related_skills=None):
    """
    Calculates detailed alignment between user skills (name -> proficiency 1-100)
    and required/related role skills.
    """
    related_skills = related_skills or []
    norm_user = {normalize_skill(s): (prof if isinstance(prof, (int, float)) else 70) 
                 for s, prof in user_skills_dict.items() if normalize_skill(s)}
    
    matched_required = []
    missing_required = []
    required_points = 0.0
    total_required_weight = max(1.0, float(len(required_skills)))

    for skill in required_skills:
        ns = normalize_skill(skill)
        if ns in norm_user:
            prof = norm_user[ns]
            # Full match weighted by proficiency (50% baseline + 50% proficiency factor)
            factor = 0.5 + 0.5 * (min(100, max(10, prof)) / 100.0)
            required_points += factor
            matched_required.append({"name": skill, "proficiency": prof, "type": "required"})
        else:
            # Check for partial / related matches
            partial_match = False
            for u_skill, prof in norm_user.items():
                if u_skill in ns or ns in u_skill:
                    factor = 0.3 + 0.3 * (prof / 100.0)
                    required_points += factor
                    matched_required.append({"name": skill, "proficiency": prof, "type": "partial", "via": u_skill})
                    partial_match = True
                    break
            if not partial_match:
                missing_required.append({"name": skill, "importance": "High", "type": "required"})

    # Bonus points for related skills (up to 15% bonus)
    matched_related = []
    missing_related = []
    for skill in related_skills:
        ns = normalize_skill(skill)
        if ns in norm_user:
            matched_related.append({"name": skill, "proficiency": norm_user[ns], "type": "related"})
        else:
            missing_related.append({"name": skill, "importance": "Medium", "type": "related"})

    base_ratio = min(1.0, required_points / total_required_weight)
    related_bonus = min(0.15, len(matched_related) * 0.04)
    raw_score = (base_ratio * 100.0) + (related_bonus * 100.0)
    final_score = round(max(5.0, min(98.0, raw_score)), 1) if matched_required else 0.0

    return {
        "score": final_score,
        "matched_skills": [m["name"] for m in matched_required],
        "missing_skills": [m["name"] for m in missing_required],
        "matched_related": [m["name"] for m in matched_related],
        "missing_related": [m["name"] for m in missing_related],
        "all_missing_prioritized": missing_required + missing_related
    }

def compute_semantic_score(profile_text, job_text):
    """
    Uses Scikit-learn TF-IDF Vectorizer and Cosine Similarity to compute
    a robust, locally executed semantic similarity score without massive downloads.
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np

        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([profile_text, job_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Map cosine similarity to 0-100 score
        score = round(max(0.0, min(100.0, float(sim) * 100.0)), 1)
        return score
    except Exception:
        return 0.0

def build_explanation(role_title, score, matched, missing, interests=None):
    """Generates an honest, clear, explainable narrative for recommendation."""
    matched_count = len(matched)
    missing_count = len(missing)
    matched_sample = ", ".join(matched[:3]) if matched else "None yet"
    missing_sample = ", ".join(missing[:3]) if missing else "None"

    if score >= 75:
        fit = f"Strong alignment with {role_title}."
        advice = f"You already have strong coverage in core skills ({matched_sample}). Focus on mastering {missing_sample} to be fully job-ready."
    elif score >= 45:
        fit = f"Promising developmental match for {role_title}."
        advice = f"You possess relevant foundations ({matched_sample}). Bridging target gaps like {missing_sample} will significantly elevate your readiness."
    else:
        fit = f"Growth opportunity for {role_title}."
        advice = f"This role requires building foundational competencies in {missing_sample}."

    return (
        f"{fit} Based on your profile, you match {matched_count} key skills ({matched_sample}). "
        f"{advice} Note: Match scores represent profile-to-role similarity, not an employment guarantee."
    )

def rank_jobs(profile, jobs, use_semantic=False):
    """
    Ranks career roles against a user profile.
    profile can contain:
      - skills: list of strings OR dict of name -> proficiency
      - interests: list of strings
      - location: string preference
    """
    skills_raw = profile.get("skills", [])
    if isinstance(skills_raw, list):
        user_skills_dict = {s: 70 for s in skills_raw if s}
    elif isinstance(skills_raw, dict):
        user_skills_dict = skills_raw
    else:
        user_skills_dict = {}

    interests = profile.get("interests", [])
    location_pref = str(profile.get("location", "Any")).strip().lower()

    profile_text = (
        "Skills: " + ", ".join(user_skills_dict.keys()) +
        ". Interests: " + ", ".join(interests) +
        ". Location preference: " + location_pref
    )

    results = []
    for job in jobs:
        req_skills = job.get("skills", [])
        rel_skills = job.get("related_skills", [])
        
        alignment = calculate_skill_alignment(user_skills_dict, req_skills, rel_skills)
        base_score = alignment["score"]

        # Boost score slightly if user interests align with job category or summary
        interest_boost = 0.0
        job_haystack = f"{job.get('title', '')} {job.get('category', '')} {job.get('summary', '')}".lower()
        for interest in interests:
            if interest and interest.lower() in job_haystack:
                interest_boost += 4.0
        interest_boost = min(12.0, interest_boost)

        if use_semantic:
            job_text = (
                f"{job.get('title', '')}. {job.get('category', '')}. {job.get('summary', '')}. "
                f"Required skills: {', '.join(req_skills)}. Related: {', '.join(rel_skills)}"
            )
            sem_score = compute_semantic_score(profile_text, job_text)
            # Combine skill overlap (70%) with semantic profile similarity (30%) + interest boost
            combined_score = round(min(99.0, (base_score * 0.7) + (sem_score * 0.3) + interest_boost), 1)
            final_score = combined_score
            method = "Hybrid (Skill Overlap + Semantic TF-IDF)"
        else:
            final_score = round(min(99.0, base_score + interest_boost), 1)
            method = "Weighted Skill Overlap & Proficiency"

        explanation = build_explanation(
            job.get("title", "Role"),
            final_score,
            alignment["matched_skills"],
            alignment["missing_skills"],
            interests
        )

        results.append({
            "id": job.get("id"),
            "title": job.get("title"),
            "category": job.get("category", "General"),
            "company": job.get("company", "Sample Role Catalogue"),
            "location": job.get("location", "Remote / Hybrid"),
            "experience_level": job.get("experience_level", "Entry-level"),
            "summary": job.get("summary", ""),
            "responsibilities": job.get("responsibilities", []),
            "skills": req_skills,
            "related_skills": rel_skills,
            "learning": job.get("learning", []),
            "resources": job.get("resources", []),
            "match_score": final_score,
            "baseline_score": base_score,
            "matched_skills": alignment["matched_skills"],
            "missing_skills": alignment["missing_skills"],
            "matched_related": alignment["matched_related"],
            "missing_related": alignment["missing_related"],
            "explanation": explanation,
            "match_method": method,
            "readiness_note": "A profile-to-role similarity indicator, not a hiring guarantee."
        })

    # Sort descending by match score
    return sorted(results, key=lambda x: x["match_score"], reverse=True)
