import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database import db_manager

@pytest.mark.asyncio
async def test_api_suite():
    await db_manager.init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["product"] == "Europa"
        assert data["brand"] == "AkashaVyom Labs"

        # 2. Auth register & me
        reg_res = await client.post("/api/auth/register", json={
            "email": "scholar@akashavyom.com",
            "password": "SecurePassword2026",
            "full_name": "AkashaVyom Researcher"
        })
        assert reg_res.status_code in [200, 400] # 400 if already exists in local store
        token = reg_res.json().get("access_token")
        
        if not token:
            login_res = await client.post("/api/auth/login", json={
                "email": "scholar@akashavyom.com",
                "password": "SecurePassword2026"
            })
            assert login_res.status_code == 200
            token = login_res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        # 3. Notebooks list & create
        nb_list = await client.get("/api/notebooks", headers=headers)
        assert nb_list.status_code == 200
        nbs = nb_list.json()
        assert len(nbs) >= 1
        nb_id = nbs[0]["id"]

        new_nb = await client.post("/api/notebooks", headers=headers, json={
            "title": "Quantum Knowledge Vault",
            "color": "#6941A5",
            "description": "High yield technical notes"
        })
        assert new_nb.status_code == 200
        created_nb = new_nb.json()
        assert created_nb["title"] == "Quantum Knowledge Vault"

        # 4. Sections list & create
        sec_res = await client.get(f"/api/notebooks/{created_nb['id']}/sections", headers=headers)
        assert sec_res.status_code == 200
        secs = sec_res.json()
        assert len(secs) >= 1
        sec_id = secs[0]["id"]

        # 5. Pages list & create
        pages_res = await client.get(f"/api/sections/{sec_id}/pages", headers=headers)
        assert pages_res.status_code == 200
        pages = pages_res.json()
        assert len(pages) >= 1
        page_id = pages[0]["id"]

        # 6. Canvas blocks CRUD (click-to-type, rich containers)
        blk_res = await client.post(f"/api/pages/{page_id}/blocks", headers=headers, json={
            "page_id": page_id,
            "block_type": "text",
            "x": 120.0,
            "y": 80.0,
            "width": 450.0,
            "content": "<p>Testing free-form container placement</p>"
        })
        assert blk_res.status_code == 200
        block = blk_res.json()
        assert block["x"] == 120.0

        # Update block position (dragging)
        up_res = await client.put(f"/api/blocks/{block['id']}", headers=headers, json={
            "x": 180.0,
            "y": 140.0
        })
        assert up_res.status_code == 200
        assert up_res.json()["x"] == 180.0

        # 7. Digital ink stroke vector persistence
        ink_res = await client.post(f"/api/pages/{page_id}/ink", headers=headers, json={
            "page_id": page_id,
            "tool": "pen",
            "points": [{"x": 10, "y": 20}, {"x": 30, "y": 50}],
            "color": "#6941A5",
            "thickness": 3.0,
            "opacity": 1.0
        })
        assert ink_res.status_code == 200
        stroke = ink_res.json()
        assert stroke["tool"] == "pen"

        get_ink = await client.get(f"/api/pages/{page_id}/ink", headers=headers)
        assert get_ink.status_code == 200
        assert len(get_ink.json()) >= 1

        # 8. Templates application
        tpl_res = await client.get("/api/templates")
        assert tpl_res.status_code == 200
        templates = tpl_res.json()
        assert len(templates) >= 10

        apply_res = await client.post("/api/templates/apply", headers=headers, json={
            "template_id": "cornell",
            "section_id": sec_id
        })
        assert apply_res.status_code == 200
        cornell_page = apply_res.json()
        assert cornell_page["title"] == "Cornell Notes"

        # 9. Global Search
        search_res = await client.get("/api/search?q=free-form&scope=all", headers=headers)
        assert search_res.status_code == 200
        s_data = search_res.json()
        assert s_data["total"] >= 1

        # 10. AI Knowledge Assistant & RAG grounded retrieval
        ai_res = await client.post("/api/ai/ask", headers=headers, json={
            "prompt": "Summarize the note content",
            "context_scope": "current_page",
            "current_page_id": page_id
        })
        assert ai_res.status_code == 200
        ai_data = ai_res.json()
        assert len(ai_data["response"]) > 0
        assert "provider" in ai_data

        # 11. Export to Markdown, HTML, and Titan Document
        export_md = await client.get(f"/api/export/page/{page_id}?format=markdown", headers=headers)
        assert export_md.status_code == 200
        assert "content" in export_md.json()

        export_titan = await client.get(f"/api/export/page/{page_id}?format=titan", headers=headers)
        assert export_titan.status_code == 200
        titan_doc = export_titan.json()
        assert titan_doc["titan_document_version"] == "1.0"
        assert titan_doc["source_application"] == "Europa Notebook"

        # 12. Titan SSO unified auth endpoint
        titan_sso_res = await client.post("/api/auth/titan-sso", json={
            "titan_token": "mock-titan-jwt-token-12345",
            "titan_user": {"email": "titan.lead@akashavyom.com", "full_name": "Titan Lead Architect"}
        })
        assert titan_sso_res.status_code == 200
        assert "access_token" in titan_sso_res.json()

        print("\nAll 12 backend verification suites PASSED successfully!")

if __name__ == "__main__":
    asyncio.run(test_api_suite())

