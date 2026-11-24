export type BlockType = 
  | 'text' 
  | 'image' 
  | 'table' 
  | 'equation' 
  | 'code' 
  | 'audio' 
  | 'checklist' 
  | 'callout' 
  | 'pdf_page';

export type PaperStyle = 'blank' | 'ruled' | 'dotted' | 'grid';

export type DrawingTool = 
  | 'select' 
  | 'pen' 
  | 'pencil' 
  | 'highlighter' 
  | 'marker' 
  | 'eraser' 
  | 'line' 
  | 'arrow' 
  | 'rectangle' 
  | 'circle' 
  | 'triangle';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface Notebook {
  id: string;
  owner_id: string;
  title: string;
  color: string;
  description: string;
  is_archived: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionGroup {
  id: string;
  notebook_id: string;
  title: string;
  parent_group_id?: string;
  created_at: string;
}

export interface Section {
  id: string;
  notebook_id: string;
  section_group_id?: string | null;
  title: string;
  color: string;
  order: number;
  has_password?: boolean;
  is_locked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  section_id: string;
  notebook_id: string;
  title: string;
  parent_page_id?: string | null;
  order: number;
  is_pinned: boolean;
  is_favorite: boolean;
  is_deleted: boolean;
  background_color: string;
  paper_style: PaperStyle;
  rule_spacing: number;
  created_at: string;
  updated_at: string;
}

export interface CanvasBlock {
  id: string;
  page_id: string;
  block_type: BlockType;
  x: number;
  y: number;
  width: number;
  height?: number | null;
  layer_order: number;
  content: any;
  formatting: Record<string, any>;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InkPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface InkStroke {
  id: string;
  page_id: string;
  tool: string;
  points: InkPoint[];
  color: string;
  thickness: number;
  opacity: number;
  created_at?: string;
}

export interface TaskItem {
  id: string;
  user_id: string;
  notebook_id: string;
  page_id: string;
  block_id?: string;
  title: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  created_at: string;
}

export interface TagItem {
  id: string;
  notebook_id: string;
  page_id: string;
  block_id?: string;
  tag_type: string;
  label: string;
  content_snippet: string;
  created_at: string;
}

export interface Citation {
  id: number;
  page_id?: string;
  page_title?: string;
  snippet: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  provider?: string;
  created_at: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  paper_style: PaperStyle;
  blocks: any[];
}

