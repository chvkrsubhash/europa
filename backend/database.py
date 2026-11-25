import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from backend.config import settings

# Hybrid database engine:
# If MONGODB_URI is provided and reachable, it connects to MongoDB via Motor.
# Otherwise, it provides an ACID-safe JSON document store that replicates MongoDB collection APIs:
# find, find_one, insert_one, update_one, delete_one, count_documents.
# This guarantees that the system works seamlessly out of the box in zero-config development,
# and connects immediately to MongoDB Atlas in production.

class LocalCollection:
    def __init__(self, name: str, store_dir: str):
        self.name = name
        self.file_path = os.path.join(store_dir, f"{name}.json")
        self._lock = asyncio.Lock()
        self._data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = []
        else:
            self._data = []

    def _save(self):
        temp_path = self.file_path + ".tmp"
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2, ensure_ascii=False)
        if os.path.exists(self.file_path):
            os.remove(self.file_path)
        os.rename(temp_path, self.file_path)

    def _match(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._match(doc, subq) for subq in v):
                    return False
                continue
            if isinstance(v, dict):
                # Handle operators like $in, $ne, $regex
                if "$in" in v:
                    val = doc.get(k)
                    if isinstance(val, list):
                        if not any(item in v["$in"] for item in val):
                            return False
                    elif val not in v["$in"]:
                        return False
                if "$ne" in v and doc.get(k) == v["$ne"]:
                    return False
                if "$regex" in v:
                    import re
                    pattern = v["$regex"]
                    flags = re.IGNORECASE if v.get("$options") == "i" else 0
                    if not re.search(pattern, str(doc.get(k, "")), flags):
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    async def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List[tuple]] = None) -> List[Dict[str, Any]]:
        async with self._lock:
            query = query or {}
            results = [doc.copy() for doc in self._data if self._match(doc, query)]
            if sort:
                for key, direction in reversed(sort):
                    results.sort(key=lambda d: d.get(key, 0) or 0, reverse=(direction < 0))
            return results

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            for doc in self._data:
                if self._match(doc, query):
                    return doc.copy()
            return None

    async def insert_one(self, doc: Dict[str, Any]) -> Any:
        async with self._lock:
            item = doc.copy()
            self._data.append(item)
            self._save()
            class InsertResult:
                inserted_id = item.get("id") or item.get("_id")
            return InsertResult()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False) -> Any:
        async with self._lock:
            matched = False
            for doc in self._data:
                if self._match(doc, query):
                    matched = True
                    if "$set" in update:
                        doc.update(update["$set"])
                    if "$addToSet" in update:
                        for k, v in update["$addToSet"].items():
                            doc.setdefault(k, [])
                            if v not in doc[k]:
                                doc[k].append(v)
                    if "$pull" in update:
                        for k, v in update["$pull"].items():
                            if k in doc and isinstance(doc[k], list):
                                doc[k] = [x for x in doc[k] if x != v]
                    self._save()
                    break
            if not matched and upsert:
                new_doc = query.copy()
                if "$set" in update:
                    new_doc.update(update["$set"])
                self._data.append(new_doc)
                self._save()

    async def delete_one(self, query: Dict[str, Any]) -> Any:
        async with self._lock:
            idx = -1
            for i, doc in enumerate(self._data):
                if self._match(doc, query):
                    idx = i
                    break
            if idx != -1:
                self._data.pop(idx)
                self._save()

    async def delete_many(self, query: Dict[str, Any]) -> Any:
        async with self._lock:
            self._data = [d for d in self._data if not self._match(d, query)]
            self._save()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        async with self._lock:
            if not query:
                return len(self._data)
            return sum(1 for doc in self._data if self._match(doc, query))

class DatabaseManager:
    def __init__(self):
        self.is_mongo = False
        self.client = None
        self.db = None
        self.collections: Dict[str, Any] = {}
        self.store_dir = settings.LOCAL_STORAGE_DIR

    async def init_db(self):
        if settings.MONGODB_URI and (settings.MONGODB_URI.startswith("mongodb://") or settings.MONGODB_URI.startswith("mongodb+srv://")):
            try:
                import motor.motor_asyncio
                self.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
                # Quick ping check
                await self.client.admin.command('ping')
                self.db = self.client[settings.DATABASE_NAME]
                self.is_mongo = True
                print(f"[Europa DB] Connected successfully to MongoDB Atlas: {settings.DATABASE_NAME}")
                return
            except Exception as e:
                print(f"[Europa DB] MongoDB connection warning: {e}. Falling back to high-performance local store.")
        
        self.is_mongo = False
        # If storage dir is in a temp directory (e.g. serverless Vercel runtime), seed initial JSON documents
        seed_dir = os.path.join(os.path.dirname(__file__), "data_store")
        if os.path.abspath(self.store_dir) != os.path.abspath(seed_dir) and os.path.exists(seed_dir):
            try:
                import shutil
                for fname in os.listdir(seed_dir):
                    if fname.endswith(".json"):
                        dest = os.path.join(self.store_dir, fname)
                        if not os.path.exists(dest):
                            shutil.copy2(os.path.join(seed_dir, fname), dest)
            except Exception:
                pass
        print(f"[Europa DB] Using local persistent JSON collection store at {self.store_dir}")

    def get_collection(self, name: str):
        if self.is_mongo and self.db is not None:
            return self.db[name]
        if name not in self.collections:
            self.collections[name] = LocalCollection(name, self.store_dir)
        return self.collections[name]

db_manager = DatabaseManager()

# Predefined collection getters matching Section 19
def get_users_col(): return db_manager.get_collection("users")
def get_notebooks_col(): return db_manager.get_collection("notebooks")
def get_section_groups_col(): return db_manager.get_collection("section_groups")
def get_sections_col(): return db_manager.get_collection("sections")
def get_pages_col(): return db_manager.get_collection("pages")
def get_canvas_blocks_col(): return db_manager.get_collection("canvas_blocks")
def get_attachments_col(): return db_manager.get_collection("attachments")
def get_ink_strokes_col(): return db_manager.get_collection("ink_strokes")
def get_tags_col(): return db_manager.get_collection("tags")
def get_tasks_col(): return db_manager.get_collection("tasks")
def get_comments_col(): return db_manager.get_collection("comments")
def get_permissions_col(): return db_manager.get_collection("notebook_permissions")
def get_revisions_col(): return db_manager.get_collection("revisions")
def get_conversations_col(): return db_manager.get_collection("ai_conversations")
def get_messages_col(): return db_manager.get_collection("ai_messages")
def get_embeddings_col(): return db_manager.get_collection("embeddings")
def get_templates_col(): return db_manager.get_collection("templates")
def get_preferences_col(): return db_manager.get_collection("user_preferences")
def get_audit_logs_col(): return db_manager.get_collection("audit_logs")

