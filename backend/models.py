from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import uuid

def gen_id() -> str:
    return str(uuid.uuid4())

def current_time_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"

# 1. User Models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    avatar_url: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    created_at: str

# 2. Notebook Models
class NotebookCreate(BaseModel):
    title: str
    color: Optional[str] = "#6941A5"
    description: Optional[str] = ""

class NotebookUpdate(BaseModel):
    title: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    is_archived: Optional[bool] = None
    is_deleted: Optional[bool] = None

class Notebook(BaseModel):
    id: str = Field(default_factory=gen_id)
    owner_id: str
    title: str
    color: str = "#6941A5"
    description: str = ""
    is_archived: bool = False
    is_deleted: bool = False
    created_at: str = Field(default_factory=current_time_iso)
    updated_at: str = Field(default_factory=current_time_iso)

# 3. Section Group & Section Models
class SectionGroupCreate(BaseModel):
    notebook_id: str
    title: str
    parent_group_id: Optional[str] = None

class SectionGroup(BaseModel):
    id: str = Field(default_factory=gen_id)
    notebook_id: str
    title: str
    parent_group_id: Optional[str] = None
    created_at: str = Field(default_factory=current_time_iso)

class SectionCreate(BaseModel):
    notebook_id: str
    title: str
    section_group_id: Optional[str] = None
    color: Optional[str] = "#6941A5"
    password: Optional[str] = None

class SectionUpdate(BaseModel):
    title: Optional[str] = None
    color: Optional[str] = None
    section_group_id: Optional[str] = None
    order: Optional[int] = None
    password: Optional[str] = None
    is_locked: Optional[bool] = None

class Section(BaseModel):
    id: str = Field(default_factory=gen_id)
    notebook_id: str
    section_group_id: Optional[str] = None
    title: str
    color: str = "#6941A5"
    order: int = 0
    password_hash: Optional[str] = None
    is_locked: bool = False
    created_at: str = Field(default_factory=current_time_iso)
    updated_at: str = Field(default_factory=current_time_iso)

# 4. Page Models
class PageCreate(BaseModel):
    section_id: str
    title: str = "Untitled Page"
    parent_page_id: Optional[str] = None

class PageUpdate(BaseModel):
    title: Optional[str] = None
    parent_page_id: Optional[str] = None
    order: Optional[int] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None
    is_deleted: Optional[bool] = None
    background_color: Optional[str] = None
    paper_style: Optional[str] = None # blank | ruled | dotted | graph
    rule_spacing: Optional[int] = None

class Page(BaseModel):
    id: str = Field(default_factory=gen_id)
    section_id: str
    notebook_id: str
    title: str = "Untitled Page"
    parent_page_id: Optional[str] = None
    order: int = 0
    is_pinned: bool = False
    is_favorite: bool = False
    is_deleted: bool = False
    background_color: str = "#FFFFFF"
    paper_style: str = "ruled"
    rule_spacing: int = 32
    created_at: str = Field(default_factory=current_time_iso)
    updated_at: str = Field(default_factory=current_time_iso)

# 5. Canvas Block Models (Section 19: exact requirements)
class CanvasBlockCreate(BaseModel):
    page_id: str
    block_type: str = "text" # text | image | table | equation | code | audio | checklist | pdf_page | callout
    x: float = 50.0
    y: float = 50.0
    width: float = 380.0
    height: Optional[float] = None
    layer_order: int = 0
    content: Any = ""
    formatting: Dict[str, Any] = Field(default_factory=dict)
    is_locked: bool = False

class CanvasBlockUpdate(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    layer_order: Optional[int] = None
    content: Optional[Any] = None
    formatting: Optional[Dict[str, Any]] = None
    is_locked: Optional[bool] = None

class CanvasBlock(BaseModel):
    id: str = Field(default_factory=gen_id)
    page_id: str
    block_type: str = "text"
    x: float = 50.0
    y: float = 50.0
    width: float = 380.0
    height: Optional[float] = None
    layer_order: int = 0
    content: Any = ""
    formatting: Dict[str, Any] = Field(default_factory=dict)
    is_locked: bool = False
    created_at: str = Field(default_factory=current_time_iso)
    updated_at: str = Field(default_factory=current_time_iso)

# 6. Ink Stroke Models (Digital Ink vector representation)
class InkPoint(BaseModel):
    x: float
    y: float
    pressure: Optional[float] = 0.5

class InkStrokeCreate(BaseModel):
    page_id: str
    tool: str = "pen" # pen | pencil | highlighter | marker | eraser | line | arrow | rectangle | circle | triangle
    points: List[Dict[str, Any]] = Field(default_factory=list)
    color: str = "#6941A5"
    thickness: float = 2.0
    opacity: float = 1.0

class InkStroke(BaseModel):
    id: str = Field(default_factory=gen_id)
    page_id: str
    tool: str = "pen"
    points: List[Dict[str, Any]] = Field(default_factory=list)
    color: str = "#6941A5"
    thickness: float = 2.0
    opacity: float = 1.0
    created_at: str = Field(default_factory=current_time_iso)

# 7. Tags & Tasks
class TagItem(BaseModel):
    id: str = Field(default_factory=gen_id)
    notebook_id: str
    page_id: str
    block_id: Optional[str] = None
    tag_type: str # todo | important | question | remember | definition | exam | follow_up | contact | idea | custom
    label: str
    content_snippet: str
    created_at: str = Field(default_factory=current_time_iso)

class TaskItem(BaseModel):
    id: str = Field(default_factory=gen_id)
    user_id: str
    notebook_id: str
    page_id: str
    block_id: Optional[str] = None
    title: str
    is_completed: bool = False
    priority: str = "medium" # low | medium | high | urgent
    due_date: Optional[str] = None
    created_at: str = Field(default_factory=current_time_iso)
    updated_at: str = Field(default_factory=current_time_iso)

# 8. Comments & Collaborations
class CommentCreate(BaseModel):
    page_id: str
    block_id: Optional[str] = None
    text: str

class Comment(BaseModel):
    id: str = Field(default_factory=gen_id)
    page_id: str
    block_id: Optional[str] = None
    author_id: str
    author_name: str
    text: str
    is_resolved: bool = False
    created_at: str = Field(default_factory=current_time_iso)

# 9. AI Models
class AIAskRequest(BaseModel):
    prompt: str
    context_scope: str = "current_page" # selected_text | current_page | current_section | current_notebook | all_notebooks
    selected_text: Optional[str] = None
    current_page_id: Optional[str] = None
    current_section_id: Optional[str] = None
    current_notebook_id: Optional[str] = None
    conversation_id: Optional[str] = None
    action_type: Optional[str] = "chat" # chat | summarize | rewrite | quiz | flashcards | action_items | explain | study_plan
    user_api_key: Optional[str] = None
    provider: Optional[str] = None # gemini | groq | openrouter | ollama

class AIConfigUpdate(BaseModel):
    provider: str
    model: str
    api_key: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2048

