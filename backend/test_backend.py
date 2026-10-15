import os
import unittest
import json
import tempfile
from pathlib import Path

# Use a temporary test database so real development database is never modified
test_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
test_db_path = test_db_file.name
test_db_file.close()

os.environ["DATABASE_PATH"] = test_db_path
os.environ["JWT_SECRET_KEY"] = "test-secret-key-12345-long-secure-and-random-key-for-careerpath-testing-64b"

from database import init_db, get_db_connection
from app import app

class BackendTestSuite(unittest.TestCase):
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

    def test_01_health_endpoint(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data["status"], "ok")

    def test_02_registration_and_duplicate_rejection(self):
        # Register User A
        payload = {
            "email": "alice@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "full_name": "Alice Developer"
        }
        resp = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(resp.status_code, 201)
        data = resp.get_json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "alice@example.com")

        # Duplicate registration should fail with 409
        dup_resp = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(dup_resp.status_code, 409)

    def test_03_login_success_and_failure(self):
        # Invalid password
        bad_resp = self.client.post("/api/auth/login", json={
            "email": "alice@example.com",
            "password": "WrongPassword"
        })
        self.assertEqual(bad_resp.status_code, 401)

        # Successful login
        ok_resp = self.client.post("/api/auth/login", json={
            "email": "alice@example.com",
            "password": "Password123!"
        })
        self.assertEqual(ok_resp.status_code, 200)
        data = ok_resp.get_json()
        self.assertIn("token", data)
        self.__class__.alice_token = data["token"]
        self.__class__.alice_id = data["user"]["id"]

    def test_04_protected_route_rejection(self):
        # Unauthorized access to /api/auth/me without header
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 401)

        # With invalid token
        bad_resp = self.client.get("/api/auth/me", headers={"Authorization": "Bearer badtoken123"})
        self.assertEqual(bad_resp.status_code, 401)

    def test_05_profile_retrieval_and_update(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Get profile
        resp = self.client.get("/api/profile", headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn("completion_percentage", data)

        # Update profile
        update_resp = self.client.put("/api/profile", headers=headers, json={
            "education": "B.S. in Computer Science",
            "field_of_study": "Software Engineering",
            "stage": "Graduating Senior",
            "target_role": "frontend-dev",
            "short_term_goal": "Secure a summer frontend internship"
        })
        self.assertEqual(update_resp.status_code, 200)

        # Verify update
        check_resp = self.client.get("/api/profile", headers=headers)
        self.assertEqual(check_resp.get_json()["profile"]["target_role"], "frontend-dev")

    def test_06_skills_crud(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Add React skill
        add_resp = self.client.post("/api/skills", headers=headers, json={
            "skill_name": "React",
            "proficiency": 80,
            "category": "Software Engineering",
            "years_exp": 1.5
        })
        self.assertEqual(add_resp.status_code, 201)
        skill_id = add_resp.get_json()["skill"]["id"]

        # Add Python skill
        self.client.post("/api/skills", headers=headers, json={
            "skill_name": "Python",
            "proficiency": 75,
            "category": "Software Engineering"
        })

        # Edit React skill proficiency
        put_resp = self.client.put(f"/api/skills/{skill_id}", headers=headers, json={
            "proficiency": 90
        })
        self.assertEqual(put_resp.status_code, 200)

        # Verify skills list
        list_resp = self.client.get("/api/skills", headers=headers)
        skills = list_resp.get_json()["skills"]
        self.assertTrue(any(s["skill_name"] == "React" and s["proficiency"] == 90 for s in skills))

    def test_07_career_catalogue_and_matching(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Catalogue retrieval
        cat_resp = self.client.get("/api/careers", headers=headers)
        self.assertEqual(cat_resp.status_code, 200)
        roles = cat_resp.get_json()["roles"]
        self.assertGreaterEqual(len(roles), 12)

        # Match endpoint with Alice's skills (React & Python)
        match_resp = self.client.post("/api/careers/match", headers=headers, json={})
        self.assertEqual(match_resp.status_code, 200)
        results = match_resp.get_json()["results"]
        # Junior Frontend Developer or Python Developer should be top
        top_titles = [r["title"] for r in results[:3]]
        self.assertTrue(any("Frontend" in t or "Python" in t for t in top_titles))

        # Check explainable score fields
        top = results[0]
        self.assertIn("match_score", top)
        self.assertIn("matched_skills", top)
        self.assertIn("missing_skills", top)
        self.assertIn("explanation", top)

    def test_08_saved_careers(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Save frontend role
        save_resp = self.client.post("/api/careers/save", headers=headers, json={
            "role_id": "frontend-dev",
            "notes": "Target company uses React 19"
        })
        self.assertEqual(save_resp.status_code, 200)

        # List saved careers
        list_resp = self.client.get("/api/careers/saved", headers=headers)
        saved = list_resp.get_json()["saved_careers"]
        self.assertEqual(len(saved), 1)
        self.assertEqual(saved[0]["id"], "frontend-dev")

        # Unsave role
        unsave_resp = self.client.delete("/api/careers/saved/frontend-dev", headers=headers)
        self.assertEqual(unsave_resp.status_code, 200)

    def test_09_learning_roadmap_and_tasks(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Generate roadmap for frontend-dev
        gen_resp = self.client.post("/api/roadmap/generate", headers=headers, json={"role_id": "frontend-dev"})
        self.assertEqual(gen_resp.status_code, 200)
        self.assertGreater(gen_resp.get_json()["tasks_created"], 0)

        # Retrieve tasks
        tasks_resp = self.client.get("/api/roadmap/tasks", headers=headers)
        tasks = tasks_resp.get_json()["tasks"]
        self.assertGreater(len(tasks), 0)
        task_id = tasks[0]["id"]

        # Complete task
        comp_resp = self.client.put(f"/api/roadmap/tasks/{task_id}", headers=headers, json={"status": "completed"})
        self.assertEqual(comp_resp.status_code, 200)

        # Reopen task
        reopen_resp = self.client.put(f"/api/roadmap/tasks/{task_id}", headers=headers, json={"status": "pending"})
        self.assertEqual(reopen_resp.status_code, 200)

        # Add custom task
        add_task_resp = self.client.post("/api/roadmap/tasks", headers=headers, json={
            "title": "Build portfolio project with React Router",
            "explanation": "Create 4-screen interactive app",
            "priority": "High"
        })
        self.assertEqual(add_task_resp.status_code, 201)

    def test_10_networking_hub(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Add contact
        add_resp = self.client.post("/api/networking/contacts", headers=headers, json={
            "contact_name": "Sarah Connor",
            "organization": "Cyberdyne Systems",
            "role_title": "Senior Frontend Lead",
            "status": "In Discussion",
            "email": "sarah@cyberdyne.io",
            "notes": "Discussed React component performance"
        })
        self.assertEqual(add_resp.status_code, 201)
        contact_id = add_resp.get_json()["contact_id"]

        # Templates
        tmpl_resp = self.client.get("/api/networking/templates")
        self.assertEqual(tmpl_resp.status_code, 200)
        self.assertGreater(len(tmpl_resp.get_json()["templates"]), 0)

        # Delete contact
        del_resp = self.client.delete(f"/api/networking/contacts/{contact_id}", headers=headers)
        self.assertEqual(del_resp.status_code, 200)

    def test_11_chat_assistant_and_persistence(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Create conversation
        conv_resp = self.client.post("/api/chat/conversations", headers=headers, json={"title": "Interview Prep"})
        self.assertEqual(conv_resp.status_code, 201)
        conv_id = conv_resp.get_json()["conversation"]["id"]

        # Send message
        msg_resp = self.client.post(f"/api/chat/conversations/{conv_id}/messages", headers=headers, json={
            "content": "Which careers best fit my current skills?"
        })
        self.assertEqual(msg_resp.status_code, 201)
        msg_data = msg_resp.get_json()["message"]
        self.assertEqual(msg_data["role"], "assistant")
        self.assertIn("Frontend", msg_data["content"])

        # Fetch messages history
        hist_resp = self.client.get(f"/api/chat/conversations/{conv_id}/messages", headers=headers)
        self.assertEqual(hist_resp.status_code, 200)
        messages = hist_resp.get_json()["messages"]
        self.assertGreaterEqual(len(messages), 2)

    def test_12_cross_user_data_isolation(self):
        # Register User B (Bob)
        reg_b = self.client.post("/api/auth/register", json={
            "email": "bob@example.com",
            "password": "Password123!",
            "full_name": "Bob Builder"
        })
        bob_token = reg_b.get_json()["token"]
        bob_headers = {"Authorization": f"Bearer {bob_token}"}
        alice_headers = {"Authorization": f"Bearer {self.alice_token}"}

        # Bob creates a task
        bob_task = self.client.post("/api/roadmap/tasks", headers=bob_headers, json={
            "title": "Bob's Private Task",
            "explanation": "Confidential"
        }).get_json()
        bob_task_id = bob_task["task_id"]

        # Alice attempts to edit Bob's task -> MUST return 404/unauthorized
        alice_hack = self.client.put(f"/api/roadmap/tasks/{bob_task_id}", headers=alice_headers, json={
            "title": "Hacked Title"
        })
        self.assertEqual(alice_hack.status_code, 404)

        # Alice attempts to delete Bob's task -> MUST return 404/unauthorized
        alice_del_hack = self.client.delete(f"/api/roadmap/tasks/{bob_task_id}", headers=alice_headers)
        self.assertEqual(alice_del_hack.status_code, 404)

        # Bob creates a conversation
        bob_conv = self.client.post("/api/chat/conversations", headers=bob_headers, json={"title": "Bob Secret"}).get_json()
        bob_conv_id = bob_conv["conversation"]["id"]

        # Alice attempts to read Bob's conversation -> MUST return 404/unauthorized
        alice_read_conv = self.client.get(f"/api/chat/conversations/{bob_conv_id}/messages", headers=alice_headers)
        self.assertEqual(alice_read_conv.status_code, 404)

    def test_13_ai_status_and_transparency(self):
        resp = self.client.get("/api/chat/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data["api_online"])
        self.assertIn("active_mode", data)
        self.assertIn("generative_llm", data)

    def test_14_global_search_and_notifications(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Search for "React"
        search_resp = self.client.get("/api/search?q=React", headers=headers)
        self.assertEqual(search_resp.status_code, 200)
        results = search_resp.get_json()["results"]
        self.assertTrue(any("Frontend" in r["title"] or "React" in r["title"] for r in results))

        # Check notifications
        notif_resp = self.client.get("/api/notifications", headers=headers)
        self.assertEqual(notif_resp.status_code, 200)
        notifs = notif_resp.get_json()["notifications"]
        self.assertGreater(len(notifs), 0)

    def test_15_proactive_ai_insights_and_role_advice(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        
        # Test proactive insights
        insights_resp = self.client.get("/api/chat/proactive-insights", headers=headers)
        self.assertEqual(insights_resp.status_code, 200)
        insights = insights_resp.get_json()["insights"]
        self.assertIsInstance(insights, list)
        self.assertGreater(len(insights), 0)
        first_insight = insights[0]
        self.assertIn("message", first_insight)
        self.assertIn("kicker", first_insight)
        self.assertIn("action_label", first_insight)

        # Test role advice
        advice_resp = self.client.post("/api/chat/role-advice", headers=headers, json={"role_id": "frontend-dev"})
        self.assertEqual(advice_resp.status_code, 200)
        advice_data = advice_resp.get_json()
        self.assertIn("advice", advice_data)
        self.assertIn("matched_skills", advice_data)
        self.assertIn("actions", advice_data)

    def test_16_profile_preferences_and_hours(self):
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        # Update profile with weekly_hours and learning_style
        up_resp = self.client.put("/api/profile", headers=headers, json={
            "full_name": "Alice Wonderland",
            "weekly_hours": 15,
            "learning_style": "Hands-on Projects",
            "portfolio_projects": "CLI Task Manager in Python",
            "education": "B.S. Software Engineering",
            "field_of_study": "Computer Science",
            "target_role": "frontend-dev"
        })
        self.assertEqual(up_resp.status_code, 200)

        # Retrieve profile and verify persistence
        prof_resp = self.client.get("/api/profile", headers=headers)
        self.assertEqual(prof_resp.status_code, 200)
        p = prof_resp.get_json()["profile"]
        self.assertEqual(p["weekly_hours"], 15)
        self.assertEqual(p["learning_style"], "Hands-on Projects")
        self.assertEqual(p["portfolio_projects"], "CLI Task Manager in Python")

    def test_17_cors_preflight_and_login_headers(self):
        # 1. Test preflight OPTIONS on login from production Vercel domain
        preflight_resp = self.client.options(
            "/api/auth/login",
            headers={
                "Origin": "https://career-path-six-gamma.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type,Authorization"
            }
        )
        self.assertEqual(preflight_resp.status_code, 200)
        self.assertEqual(
            preflight_resp.headers.get("Access-Control-Allow-Origin"),
            "https://career-path-six-gamma.vercel.app"
        )
        self.assertIn("POST", preflight_resp.headers.get("Access-Control-Allow-Methods", ""))
        self.assertIn("Authorization", preflight_resp.headers.get("Access-Control-Allow-Headers", ""))

        # 2. Test actual login POST with CORS origin header
        login_resp = self.client.post(
            "/api/auth/login",
            headers={"Origin": "https://career-path-six-gamma.vercel.app"},
            json={"email": "alice@example.com", "password": "Password123!"}
        )
        self.assertEqual(login_resp.status_code, 200)
        self.assertEqual(
            login_resp.headers.get("Access-Control-Allow-Origin"),
            "https://career-path-six-gamma.vercel.app"
        )
        self.assertIn("token", login_resp.get_json())

        # 3. Test preflight from Vercel preview branch deployment (regex match)
        preview_resp = self.client.options(
            "/api/auth/login",
            headers={
                "Origin": "https://career-path-git-preview-test.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        self.assertEqual(preview_resp.status_code, 200)
        self.assertEqual(
            preview_resp.headers.get("Access-Control-Allow-Origin"),
            "https://career-path-git-preview-test.vercel.app"
        )

        # 4. Test preflight from untrusted origin (should NOT receive Access-Control-Allow-Origin)
        bad_origin_resp = self.client.options(
            "/api/auth/login",
            headers={
                "Origin": "https://malicious-site.example.com",
                "Access-Control-Request-Method": "POST"
            }
        )
        self.assertIsNone(bad_origin_resp.headers.get("Access-Control-Allow-Origin"))

if __name__ == "__main__":
    unittest.main()
