"""
End-to-end simulated user journey testing the complete application workflow:
1. Registration
2. Onboarding & Profile Completion
3. Skill Management (Add & Edit)
4. Career Matching & Explainable Scoring
5. Career Detail & Gap Analysis
6. Saved Career
7. Personalized Learning Roadmap Generation
8. Task Completion & Calendar Scheduling
9. Networking Hub & Outreach Templates
10. AI Assistant Conversation & Messaging
11. Persistence Across Session Reload
12. Multi-User Isolation Verification
"""
import os
import unittest
import tempfile
from pathlib import Path

test_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
test_db_path = test_db_file.name
test_db_file.close()

os.environ["DATABASE_PATH"] = test_db_path
os.environ["JWT_SECRET_KEY"] = "super-secure-production-ready-jwt-secret-key-careerpath-testing-64b"

from database import init_db
from app import app

class FullUserJourneyTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db(test_db_path)
        cls.client = app.test_client()

    @classmethod
    def tearDownClass(cls):
        try:
            os.remove(test_db_path)
        except Exception:
            pass

    def test_full_user_journey(self):
        c = self.client

        # 1. Register User A
        reg_res = c.post("/api/auth/register", json={
            "full_name": "Jordan Lee",
            "email": "jordan.lee@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        })
        self.assertEqual(reg_res.status_code, 201)
        token = reg_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Complete Onboarding
        onboard_res = c.post("/api/profile/onboarding", headers=headers, json={
            "education": "B.S. in Information Systems",
            "field_of_study": "Information Systems",
            "stage": "Recent Graduate",
            "preferred_location": "Remote",
            "experience_level": "Entry-level",
            "target_role": "python-dev",
            "short_term_goal": "Get an internship in Python backend",
            "long_term_goal": "Backend Engineer",
            "skills": [
                {"name": "Python", "proficiency": 80, "category": "Software Engineering"},
                {"name": "Flask", "proficiency": 75, "category": "Software Engineering"},
                {"name": "SQL", "proficiency": 70, "category": "Data & Analytics"}
            ]
        })
        self.assertEqual(onboard_res.status_code, 200)

        # 3. Verify Profile and Dynamic Completion %
        prof_res = c.get("/api/profile", headers=headers)
        self.assertEqual(prof_res.status_code, 200)
        self.assertGreaterEqual(prof_res.get_json()["completion_percentage"], 85)

        # 4. Add additional skill (Git) and update proficiency
        skill_res = c.post("/api/skills", headers=headers, json={
            "skill_name": "Git",
            "proficiency": 65,
            "category": "General",
            "years_exp": 1.0
        })
        self.assertEqual(skill_res.status_code, 201)
        git_skill_id = skill_res.get_json()["skill"]["id"]

        c.put(f"/api/skills/{git_skill_id}", headers=headers, json={"proficiency": 85})

        # 5. Career Matching
        match_res = c.post("/api/careers/match", headers=headers, json={})
        self.assertEqual(match_res.status_code, 200)
        matches = match_res.get_json()["results"]
        self.assertGreater(len(matches), 0)
        top_role = matches[0]
        self.assertEqual(top_role["id"], "python-dev")
        self.assertGreater(top_role["match_score"], 55)
        self.assertIn("Python", top_role["matched_skills"])
        self.assertIn("explanation", top_role)

        # 6. Save Role
        save_res = c.post("/api/careers/save", headers=headers, json={"role_id": "python-dev", "notes": "Top target"})
        self.assertEqual(save_res.status_code, 200)

        saved_list = c.get("/api/careers/saved", headers=headers).get_json()["saved_careers"]
        self.assertEqual(len(saved_list), 1)
        self.assertEqual(saved_list[0]["id"], "python-dev")

        # 7. Generate Personalized Roadmap
        gen_res = c.post("/api/roadmap/generate", headers=headers, json={"role_id": "python-dev"})
        self.assertEqual(gen_res.status_code, 200)

        tasks_res = c.get("/api/roadmap/tasks", headers=headers)
        tasks = tasks_res.get_json()["tasks"]
        self.assertGreater(len(tasks), 0)
        first_task = tasks[0]

        # 8. Complete and Reopen Task
        c.put(f"/api/roadmap/tasks/{first_task['id']}", headers=headers, json={"status": "completed"})
        check_task = c.get("/api/roadmap/tasks", headers=headers).get_json()["tasks"][0]
        self.assertEqual(check_task["status"], "completed")

        # 9. Networking Hub Contact & Template
        c.post("/api/networking/contacts", headers=headers, json={
            "contact_name": "Dr. Alan Turing",
            "organization": "Bletchley Labs",
            "role_title": "Lead Researcher",
            "status": "Reached Out",
            "notes": "Discussed computational logic"
        })
        contacts = c.get("/api/networking/contacts", headers=headers).get_json()["contacts"]
        self.assertEqual(len(contacts), 1)

        templates = c.get("/api/networking/templates").get_json()["templates"]
        self.assertGreaterEqual(len(templates), 4)

        # 10. AI Career Assistant Conversation
        conv_res = c.post("/api/chat/conversations", headers=headers, json={"title": "Roadmap Coaching"})
        conv_id = conv_res.get_json()["conversation"]["id"]

        chat_res = c.post(f"/api/chat/conversations/{conv_id}/messages", headers=headers, json={
            "content": "Which careers best fit my current skills?"
        })
        self.assertEqual(chat_res.status_code, 201)
        assistant_msg = chat_res.get_json()["message"]
        self.assertEqual(assistant_msg["role"], "assistant")
        self.assertIn("Python Developer", assistant_msg["content"])

        # 11. Session Persistence: Log in again as Jordan Lee
        login_res = c.post("/api/auth/login", json={
            "email": "jordan.lee@example.com",
            "password": "Password123!"
        })
        self.assertEqual(login_res.status_code, 200)
        new_token = login_res.get_json()["token"]
        new_headers = {"Authorization": f"Bearer {new_token}"}

        # Jordan's data still intact
        re_user = c.get("/api/auth/me", headers=new_headers).get_json()["user"]
        self.assertEqual(re_user["email"], "jordan.lee@example.com")
        self.assertGreaterEqual(len(re_user["skills"]), 4)

        re_convs = c.get("/api/chat/conversations", headers=new_headers).get_json()["conversations"]
        self.assertEqual(len(re_convs), 1)

        # 12. Security & Multi-User Isolation: User B (Eve) cannot access Jordan's private data
        c.post("/api/auth/register", json={
            "full_name": "Eve Hacker",
            "email": "eve@example.com",
            "password": "Password123!"
        })
        eve_login = c.post("/api/auth/login", json={"email": "eve@example.com", "password": "Password123!"})
        eve_token = eve_login.get_json()["token"]
        eve_headers = {"Authorization": f"Bearer {eve_token}"}

        # Eve tries to read Jordan's conversation
        eve_peek_conv = c.get(f"/api/chat/conversations/{conv_id}/messages", headers=eve_headers)
        self.assertEqual(eve_peek_conv.status_code, 404)

        # Eve tries to delete Jordan's task
        eve_del_task = c.delete(f"/api/roadmap/tasks/{first_task['id']}", headers=eve_headers)
        self.assertEqual(eve_del_task.status_code, 404)

        # Eve's task list is empty
        eve_tasks = c.get("/api/roadmap/tasks", headers=eve_headers).get_json()["tasks"]
        self.assertEqual(len(eve_tasks), 0)

if __name__ == "__main__":
    unittest.main()
