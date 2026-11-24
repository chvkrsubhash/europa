from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
import re
import math
from backend.models import AIAskRequest, AIConfigUpdate
from backend.auth import get_current_user
from backend.routes.ai_service import ai_service
from backend.database import get_pages_col, get_canvas_blocks_col, get_sections_col, get_notebooks_col, get_conversations_col, get_messages_col
from datetime import datetime

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Helper: Simple cosine TF-IDF vector similarity for notebook-grounded RAG
def extract_terms(text: str) -> List[str]:
    return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_]{3,}\b', text)]

def compute_similarity(query_terms: List[str], doc_terms: List[str]) -> float:
    if not query_terms or not doc_terms:
        return 0.0
    q_set = set(query_terms)
    d_set = set(doc_terms)
    intersection = q_set.intersection(d_set)
    return len(intersection) / (math.sqrt(len(q_set)) * math.sqrt(len(d_set)) + 1e-6)

@router.post("/ask")
async def ask_assistant(req: AIAskRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    pages_col = get_pages_col()
    blocks_col = get_canvas_blocks_col()
    sections_col = get_sections_col()
    
    context_chunks = []
    
    # 1. Scope: Selected Text Only
    if req.context_scope == "selected_text" and req.selected_text:
        context_chunks.append({
            "page_id": req.current_page_id or "selected",
            "page_title": "Selected Note Text",
            "text": req.selected_text
        })
        
    # 2. Scope: Current Page
    elif req.context_scope == "current_page" and req.current_page_id:
        page = await pages_col.find_one({"id": req.current_page_id})
        page_title = page["title"] if page else "Current Page"
        blocks = await blocks_col.find({"page_id": req.current_page_id})
        
        page_texts = []
        for b in blocks:
            raw = b.get("content", "")
            if isinstance(raw, str):
                cleaned = re.sub(r'<[^>]+>', ' ', raw).strip()
                if cleaned:
                    page_texts.append(cleaned)
            elif isinstance(raw, list):
                t_list = " ".join([i.get("text", "") for i in raw if isinstance(i, dict)])
                if t_list.strip():
                    page_texts.append(t_list)
                    
        if page_texts:
            context_chunks.append({
                "page_id": req.current_page_id,
                "page_title": page_title,
                "text": " ".join(page_texts)
            })
            
    # 3. Scope: Current Section or Notebook
    elif req.context_scope in ["current_section", "current_notebook", "all_notebooks"]:
        target_pages = []
        if req.context_scope == "current_section" and req.current_section_id:
            target_pages = await pages_col.find({"section_id": req.current_section_id, "is_deleted": False})
        elif req.context_scope == "current_notebook" and req.current_notebook_id:
            target_pages = await pages_col.find({"notebook_id": req.current_notebook_id, "is_deleted": False})
        else:
            # All user notebooks
            target_pages = await pages_col.find({"is_deleted": False})
            
        q_terms = extract_terms(req.prompt)
        scored_chunks = []
        for p in target_pages:
            blocks = await blocks_col.find({"page_id": p["id"]})
            p_text = " ".join([re.sub(r'<[^>]+>', ' ', str(b.get("content",""))) for b in blocks])
            if p_text.strip():
                score = compute_similarity(q_terms, extract_terms(p_text))
                scored_chunks.append({
                    "score": score,
                    "page_id": p["id"],
                    "page_title": p["title"],
                    "text": p_text[:1500]
                })
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        context_chunks = scored_chunks[:3] # Top 3 relevant page chunks

    # Generate response
    response_data = await ai_service.generate_response(
        prompt=req.prompt,
        context_chunks=context_chunks,
        provider=req.provider,
        user_api_key=req.user_api_key
    )
    
    # Save to conversation history if conversation_id provided
    conv_col = get_conversations_col()
    msg_col = get_messages_col()
    cid = req.conversation_id or f"conv_{int(datetime.utcnow().timestamp()*1000)}"
    
    conv = await conv_col.find_one({"id": cid})
    if not conv:
        await conv_col.insert_one({
            "id": cid,
            "user_id": current_user["id"],
            "title": req.prompt[:30] + "...",
            "created_at": datetime.utcnow().isoformat() + "Z"
        })
        
    await msg_col.insert_one({
        "id": f"msg_u_{int(datetime.utcnow().timestamp()*1000)}",
        "conversation_id": cid,
        "role": "user",
        "content": req.prompt,
        "created_at": datetime.utcnow().isoformat() + "Z"
    })
    await msg_col.insert_one({
        "id": f"msg_a_{int(datetime.utcnow().timestamp()*1000)}",
        "conversation_id": cid,
        "role": "assistant",
        "content": response_data["text"],
        "citations": response_data["citations"],
        "provider": response_data["provider"],
        "created_at": datetime.utcnow().isoformat() + "Z"
    })

    return {
        "conversation_id": cid,
        "response": response_data["text"],
        "citations": response_data["citations"],
        "provider": response_data["provider"],
        "scope_used": req.context_scope
    }

@router.get("/conversations")
async def list_conversations(current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_conversations_col()
    return await col.find({"user_id": current_user["id"]}, sort=[("created_at", -1)])

@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    col = get_messages_col()
    return await col.find({"conversation_id": conversation_id}, sort=[("created_at", 1)])

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    conv_col = get_conversations_col()
    msg_col = get_messages_col()
    await conv_col.delete_one({"id": conversation_id, "user_id": current_user["id"]})
    await msg_col.delete_many({"conversation_id": conversation_id})
    return {"status": "success"}

@router.get("/config")
async def get_ai_config(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "default_provider": ai_service.default_provider,
        "available_providers": [
            {"id": "gemini", "name": "Google Gemini 1.5", "requires_key": True},
            {"id": "groq", "name": "Groq Llama 3.3 (Ultra Fast)", "requires_key": True},
            {"id": "openrouter", "name": "OpenRouter (Multi-Model)", "requires_key": True},
            {"id": "ollama", "name": "Ollama (Local Private LLM)", "requires_key": False},
            {"id": "europa-local", "name": "Europa Deterministic Engine (Offline / Safe)", "requires_key": False}
        ]
    }

