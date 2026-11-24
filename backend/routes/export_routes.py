from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
import json
import re
from datetime import datetime
from backend.auth import get_current_user
from backend.database import get_pages_col, get_canvas_blocks_col, get_sections_col, get_notebooks_col

router = APIRouter(prefix="/api/export", tags=["export"])

def blocks_to_markdown(title: str, blocks: List[Dict[str, Any]]) -> str:
    md = [f"# {title}\n"]
    # Sort by y coordinate then x coordinate for natural reading flow
    sorted_blocks = sorted(blocks, key=lambda b: (b.get("y", 0), b.get("x", 0)))
    
    for b in sorted_blocks:
        btype = b.get("block_type", "text")
        content = b.get("content", "")
        
        if btype == "text" or btype == "callout":
            if isinstance(content, str):
                # Basic html to md conversion
                text = content
                text = re.sub(r'<h1>(.*?)</h1>', r'# \1\n', text)
                text = re.sub(r'<h2>(.*?)</h2>', r'## \1\n', text)
                text = re.sub(r'<h3>(.*?)</h3>', r'### \1\n', text)
                text = re.sub(r'<strong>(.*?)</strong>', r'**\1**', text)
                text = re.sub(r'<em>(.*?)</em>', r'*\1*', text)
                text = re.sub(r'<p>(.*?)</p>', r'\1\n\n', text)
                text = re.sub(r'<li>(.*?)</li>', r'- \1\n', text)
                text = re.sub(r'<[^>]+>', '', text)
                md.append(text.strip() + "\n")
        elif btype == "checklist":
            if isinstance(content, list):
                for item in content:
                    status = "[x]" if item.get("checked") else "[ ]"
                    md.append(f"{status} {item.get('text', '')}\n")
                md.append("\n")
        elif btype == "code":
            md.append(f"```\n{content}\n```\n")
        elif btype == "equation":
            md.append(f"$$\n{content}\n$$\n")
            
    return "\n".join(md)

@router.get("/page/{page_id}")
async def export_page(page_id: str, format: str = "markdown", current_user: Dict[str, Any] = Depends(get_current_user)):
    pages_col = get_pages_col()
    page = await pages_col.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
        
    blocks_col = get_canvas_blocks_col()
    blocks = await blocks_col.find({"page_id": page_id})
    
    if format == "json":
        return {
            "page": page,
            "blocks": blocks,
            "export_version": "1.0",
            "product": "Europa",
            "brand": "AkashaVyom Labs"
        }
    elif format == "titan":
        # AkashaVyom Titan Document Exchange Format
        return {
            "titan_document_version": "1.0",
            "source_application": "Europa Notebook",
            "author": current_user.get("full_name", "AkashaVyom User"),
            "document_title": page["title"],
            "sections": [
                {
                    "title": page["title"],
                    "content_markdown": blocks_to_markdown(page["title"], blocks),
                    "raw_blocks": blocks
                }
            ],
            "metadata": {
                "created_at": page.get("created_at"),
                "exported_at": datetime.utcnow().isoformat() + "Z"
            }
        }
    elif format == "html":
        body_html = "".join([f"<div style='margin-bottom:16px;'>{b.get('content','')}</div>" for b in blocks if isinstance(b.get("content"), str)])
        full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{page['title']} — Europa</title>
<style>
  body {{ font-family: Segoe UI, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #242424; line-height: 1.6; }}
  h1 {{ color: #6941A5; border-bottom: 2px solid #F0EAF8; padding-bottom: 8px; }}
  .brand {{ color: #8A8A8A; font-size: 13px; margin-top: 40px; border-top: 1px solid #E0E0E0; padding-top: 12px; }}
</style>
</head>
<body>
<h1>{page['title']}</h1>
{body_html}
<div class="brand">Exported from Europa &bull; A product of AkashaVyom Labs</div>
</body>
</html>"""
        return {"content": full_html, "mime_type": "text/html", "filename": f"{page['title']}.html"}
    else:
        # Default markdown
        md_text = blocks_to_markdown(page["title"], blocks)
        return {"content": md_text, "mime_type": "text/markdown", "filename": f"{page['title']}.md"}
