from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.auth import get_current_user
from backend.database import get_pages_col, get_canvas_blocks_col, get_sections_col

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATES_LIBRARY = [
    {
        "id": "blank",
        "title": "Blank Canvas",
        "category": "General",
        "description": "A clean white slate ready for unconstrained thinking and free-form notes.",
        "icon": "FileText",
        "paper_style": "blank",
        "blocks": [
            {"type": "text", "x": 60, "y": 60, "w": 500, "content": "<h1>Untitled Thought</h1><p>Start clicking and typing anywhere...</p>"}
        ]
    },
    {
        "id": "cornell",
        "title": "Cornell Notes",
        "category": "Education",
        "description": "Structured note-taking with cues on the left, notes in the middle, and summary below.",
        "icon": "GraduationCap",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 50, "y": 40, "w": 800, "content": "<h2>Topic / Lecture Title</h2><p><strong>Date:</strong> " + datetime.utcnow().strftime("%B %d, %Y") + " &nbsp;|&nbsp; <strong>Course:</strong> Subject Name</p>"},
            {"type": "text", "x": 50, "y": 120, "w": 240, "content": "<h3>Cues & Keywords</h3><ul><li>Key Concept 1</li><li>Formula / Rule</li><li>Important Question?</li></ul>", "formatting": {"backgroundColor": "#F7F3FB"}},
            {"type": "text", "x": 310, "y": 120, "w": 540, "content": "<h3>Detailed Lecture Notes</h3><p>Record notes using short sentences, bullet points, and diagrams.</p><p>Leave blank space between points to elaborate later.</p>"},
            {"type": "text", "x": 50, "y": 400, "w": 800, "content": "<h3>Summary</h3><p>Briefly synthesize the main takeaway in 2-3 sentences immediately after class.</p>", "formatting": {"backgroundColor": "#F0EAF8"}}
        ]
    },
    {
        "id": "meeting_minutes",
        "title": "Meeting Minutes",
        "category": "Business",
        "description": "Track attendees, agenda items, key discussions, decisions, and action items with owners.",
        "icon": "Users",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 760, "content": "<h1>Team Sync & Planning</h1><p><strong>Date:</strong> " + datetime.utcnow().strftime("%B %d, %Y") + " &nbsp;|&nbsp; <strong>Location:</strong> Conf Room / Virtual</p><p><strong>Attendees:</strong> Alex, Sarah, Priya, Michael</p>"},
            {"type": "text", "x": 60, "y": 180, "w": 480, "content": "<h3>Agenda & Key Discussion</h3><ol><li>Sprint Roadmap Progress</li><li>Q1 Architecture Milestones</li><li>Customer Feedback Review</li></ol>"},
            {"type": "checklist", "x": 60, "y": 340, "w": 480, "content": [
                {"text": "Alex: Finalize API endpoints schema by Friday", "checked": False},
                {"text": "Sarah: Complete UX review of OneNote canvas ribbon", "checked": True},
                {"text": "Priya: Schedule load testing deployment", "checked": False}
            ]},
            {"type": "callout", "x": 560, "y": 180, "w": 300, "content": "<strong>Decisions Made:</strong><br/>Adopt Europa workspace for cross-team documentation.", "formatting": {"backgroundColor": "#F0EAF8", "borderColor": "#6941A5"}}
        ]
    },
    {
        "id": "student_lecture",
        "title": "Lecture Notes",
        "category": "Education",
        "description": "Standard university lecture format with definitions, theorems, and homework assignments.",
        "icon": "BookOpen",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 50, "w": 700, "content": "<h1>Lecture Notes: Advanced Systems</h1><p><strong>Professor:</strong> Dr. Thorne &nbsp;|&nbsp; <strong>Module:</strong> CS-401</p>"},
            {"type": "callout", "x": 60, "y": 150, "w": 700, "content": "<strong>Core Definition:</strong> State-machine replication guarantees fault tolerance across distributed nodes.", "formatting": {"backgroundColor": "#EBF3FB", "borderColor": "#2B88D8"}},
            {"type": "text", "x": 60, "y": 260, "w": 700, "content": "<h3>Lecture Takeaways</h3><ul><li>Consistency vs Availability trade-offs</li><li>Raft consensus leader election mechanics</li></ul>"}
        ]
    },
    {
        "id": "competitive_exam",
        "title": "Competitive Examination Prep",
        "category": "Education",
        "description": "High-yield formulas, mnemonics, quick revision tables, and mock test scores.",
        "icon": "Award",
        "paper_style": "grid",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 780, "content": "<h1>Exam Strategy & Revision Vault</h1><p><strong>Target Exam:</strong> UPSC / GATE / GRE / SAT &nbsp;|&nbsp; <strong>Subject:</strong> Quantitative & Analytical</p>"},
            {"type": "callout", "x": 60, "y": 130, "w": 360, "content": "<strong>High-Yield Mnemonics:</strong><br/>Remember core algorithmic steps and formula shortcuts.", "formatting": {"backgroundColor": "#FFF8E1", "borderColor": "#FFA000"}},
            {"type": "checklist", "x": 440, "y": 130, "w": 400, "content": [
                {"text": "Solve 50 previous year questions", "checked": False},
                {"text": "Review error log and weak spots", "checked": False},
                {"text": "Timed 60-minute mock test", "checked": False}
            ]}
        ]
    },
    {
        "id": "research_notebook",
        "title": "Research Notebook",
        "category": "Research",
        "description": "Literature citations, hypothesis testing, methodology notes, and observations.",
        "icon": "Microscope",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 760, "content": "<h1>Research Study: AI Grounded Retrieval</h1><p><strong>Principal Investigator:</strong> AkashaVyom Labs</p>"},
            {"type": "callout", "x": 60, "y": 140, "w": 760, "content": "<strong>Hypothesis:</strong> Combining dense vector search with lexical re-ranking reduces hallucination in knowledge workspaces.", "formatting": {"backgroundColor": "#F0EAF8", "borderColor": "#6941A5"}},
            {"type": "text", "x": 60, "y": 240, "w": 500, "content": "<h3>Experimental Setup</h3><p>Evaluated on 1,000 multi-topic technical notebooks with citations verification.</p>"}
        ]
    },
    {
        "id": "daily_journal",
        "title": "Daily Journal",
        "category": "Personal",
        "description": "Morning reflections, daily priorities, gratitude, and evening recap.",
        "icon": "Calendar",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 650, "content": "<h1>Daily Reflection: " + datetime.utcnow().strftime("%A, %B %d") + "</h1>"},
            {"type": "text", "x": 60, "y": 120, "w": 400, "content": "<h3>Today's Top 3 Intentions</h3><ol><li>Deliver Europa milestone</li><li>30-minute afternoon walk</li><li>Read chapter on distributed systems</li></ol>"},
            {"type": "callout", "x": 480, "y": 120, "w": 300, "content": "<strong>Gratitude Prompt:</strong><br/>What went really well today? What am I grateful for?", "formatting": {"backgroundColor": "#FDF8E4", "borderColor": "#F5A623"}}
        ]
    },
    {
        "id": "weekly_planner",
        "title": "Weekly Planner",
        "category": "Personal",
        "description": "5-day work week plan with priorities, scheduled commitments, and weekly habits.",
        "icon": "Clock",
        "paper_style": "grid",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 800, "content": "<h1>Weekly Focus & Scheduling</h1>"},
            {"type": "checklist", "x": 60, "y": 110, "w": 260, "content": [
                {"text": "Monday: Sprint kick-off & goals", "checked": True},
                {"text": "Tuesday: Deep work coding", "checked": False},
                {"text": "Wednesday: Mid-week review", "checked": False}
            ]},
            {"type": "checklist", "x": 340, "y": 110, "w": 260, "content": [
                {"text": "Thursday: Documentation & tests", "checked": False},
                {"text": "Friday: Demo & retrospective", "checked": False}
            ]}
        ]
    },
    {
        "id": "software_dev",
        "title": "Software Architecture Spec",
        "category": "Engineering",
        "description": "System architecture diagram notes, REST API contracts, and database schemas.",
        "icon": "Code",
        "paper_style": "dotted",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 780, "content": "<h1>Architecture Spec: Microservices Bus</h1><p><strong>Author:</strong> Lead Architect &nbsp;|&nbsp; <strong>Version:</strong> v2.1</p>"},
            {"type": "code", "x": 60, "y": 140, "w": 700, "content": "// Event Envelope Schema\ninterface NotebookEvent {\n  id: string;\n  topic: 'block.created' | 'ink.stroke';\n  timestamp: number;\n  payload: Record<string, unknown>;\n}"}
        ]
    },
    {
        "id": "project_notebook",
        "title": "Project Notebook",
        "category": "Business",
        "description": "Track milestones, deliverable deadlines, team dependencies, and risk register.",
        "icon": "Briefcase",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 760, "content": "<h1>Project Europa Launch Plan</h1>"},
            {"type": "checklist", "x": 60, "y": 120, "w": 400, "content": [
                {"text": "Phase 1: Free-form canvas and digital ink", "checked": True},
                {"text": "Phase 2: RAG Assistant with citations", "checked": True},
                {"text": "Phase 3: Real-time collaboration & Titan export", "checked": True}
            ]}
        ]
    },
    {
        "id": "business_canvas",
        "title": "Business Model Canvas",
        "category": "Business",
        "description": "Value proposition, customer segments, channels, cost structure, and revenue streams.",
        "icon": "TrendingUp",
        "paper_style": "grid",
        "blocks": [
            {"type": "text", "x": 50, "y": 40, "w": 800, "content": "<h1>Business Model Canvas</h1>"},
            {"type": "callout", "x": 50, "y": 110, "w": 260, "content": "<strong>Value Propositions:</strong><br/>- Genuine OneNote freeform canvas<br/>- Native AI RAG knowledge engine<br/>- Strict privacy and local data control", "formatting": {"backgroundColor": "#F0EAF8", "borderColor": "#6941A5"}},
            {"type": "callout", "x": 330, "y": 110, "w": 260, "content": "<strong>Customer Segments:</strong><br/>- Researchers & Academics<br/>- Engineering Teams<br/>- Enterprise Knowledge Workers", "formatting": {"backgroundColor": "#EBF3FB", "borderColor": "#2B88D8"}}
        ]
    },
    {
        "id": "personal_kb",
        "title": "Personal Knowledge Base",
        "category": "Personal",
        "description": "Zettelkasten-inspired atomic notes, references, book highlights, and ideas.",
        "icon": "Brain",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 740, "content": "<h1>PKM: Atomic Concepts Index</h1>"},
            {"type": "text", "x": 60, "y": 130, "w": 500, "content": "<h3>Core Principles</h3><p>Every note should capture a single, atomic concept that links naturally to other ideas.</p>"}
        ]
    },
    {
        "id": "todo_matrix",
        "title": "Eisenhower Priority Matrix",
        "category": "Productivity",
        "description": "Urgent vs Important 4-quadrant productivity matrix for high-impact focus.",
        "icon": "CheckSquare",
        "paper_style": "grid",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 800, "content": "<h1>Eisenhower Decision Matrix</h1>"},
            {"type": "callout", "x": 60, "y": 110, "w": 380, "content": "<strong>1. Urgent & Important (Do First)</strong><br/>Critical bugs, imminent customer deadlines", "formatting": {"backgroundColor": "#FDE8E8", "borderColor": "#D13438"}},
            {"type": "callout", "x": 460, "y": 110, "w": 380, "content": "<strong>2. Not Urgent but Important (Schedule)</strong><br/>Strategic planning, knowledge synthesis, exercise", "formatting": {"backgroundColor": "#EBF3FB", "borderColor": "#0078D4"}}
        ]
    },
    {
        "id": "study_revision",
        "title": "Study & Revision Notes",
        "category": "Education",
        "description": "Active recall triggers, flashcard summaries, and spaced repetition tracking.",
        "icon": "BookMarked",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 760, "content": "<h1>Active Recall Revision Sheet</h1>"},
            {"type": "text", "x": 60, "y": 130, "w": 400, "content": "<h3>Prompt Questions</h3><p>Can you derive the theorem without looking at notes?</p>"},
            {"type": "callout", "x": 480, "y": 130, "w": 320, "content": "<strong>Hidden Answer:</strong><br/>Use active retrieval before revealing solutions.", "formatting": {"backgroundColor": "#F7F3FB"}}
        ]
    },
    {
        "id": "titan_document",
        "title": "Titan Document Bridge",
        "category": "AkashaVyom",
        "description": "Prepared template with structured sections designed for export to Titan document editor.",
        "icon": "Layers",
        "paper_style": "ruled",
        "blocks": [
            {"type": "text", "x": 60, "y": 40, "w": 780, "content": "<h1>AkashaVyom Titan Document Bridge</h1><p>This note structure complies with Titan Document Specification v1.0.</p>"},
            {"type": "text", "x": 60, "y": 140, "w": 780, "content": "<h3>Executive Overview</h3><p>Structured notes written in Europa can be exported as Titan documents with preserved hierarchy.</p>"}
        ]
    }
]

@router.get("")
async def list_templates():
    return TEMPLATES_LIBRARY

@router.post("/apply")
async def apply_template(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    template_id = payload.get("template_id")
    section_id = payload.get("section_id")
    if not section_id:
        raise HTTPException(status_code=400, detail="section_id required")
        
    tpl = next((t for t in TEMPLATES_LIBRARY if t["id"] == template_id), None)
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
        
    sec_col = get_sections_col()
    sec = await sec_col.find_one({"id": section_id})
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
        
    pages_col = get_pages_col()
    existing_count = await pages_col.count_documents({"section_id": section_id})
    
    page_id = f"page_{int(datetime.utcnow().timestamp()*1000)}"
    new_page = {
        "id": page_id,
        "section_id": section_id,
        "notebook_id": sec["notebook_id"],
        "title": tpl["title"],
        "parent_page_id": None,
        "order": existing_count,
        "is_pinned": False,
        "is_favorite": False,
        "is_deleted": False,
        "background_color": "#FFFFFF",
        "paper_style": tpl.get("paper_style", "ruled"),
        "rule_spacing": 32,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    await pages_col.insert_one(new_page)
    
    blocks_col = get_canvas_blocks_col()
    for idx, b in enumerate(tpl["blocks"]):
        blk = {
            "id": f"blk_{int(datetime.utcnow().timestamp()*1000)}_{idx}",
            "page_id": page_id,
            "block_type": b.get("type", "text"),
            "x": b.get("x", 60),
            "y": b.get("y", 60 + idx * 120),
            "width": b.get("w", 500),
            "height": b.get("h", None),
            "layer_order": idx,
            "content": b.get("content", ""),
            "formatting": b.get("formatting", {}),
            "is_locked": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        await blocks_col.insert_one(blk)
        
    return new_page

