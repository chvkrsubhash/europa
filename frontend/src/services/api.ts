import { Notebook, Section, Page, CanvasBlock, InkStroke, TaskItem, TagItem, TemplateItem, User } from '../types';
import { offlineStore } from './offlineStore';

const getApiBase = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

class ApiClient {
  private token: string | null = localStorage.getItem('europa_auth_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('europa_auth_token', token);
    } else {
      localStorage.removeItem('europa_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      // Check if network error and offlineStore has cached version
      console.warn(`API call failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async login(email: string, password: string):Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.access_token);
    return res;
  }

  // Notebooks
  async getNotebooks(): Promise<Notebook[]> {
    try {
      const nbs = await this.request<Notebook[]>('/notebooks');
      await offlineStore.saveNotebooks(nbs);
      return nbs;
    } catch (e) {
      const cached = await offlineStore.getNotebooks();
      if (cached && cached.length > 0) return cached;
      throw e;
    }
  }

  async createNotebook(data: { title: string; color?: string; description?: string }): Promise<Notebook> {
    const nb = await this.request<Notebook>('/notebooks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return nb;
  }

  async updateNotebook(id: string, data: Partial<Notebook>): Promise<Notebook> {
    return this.request<Notebook>(`/notebooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNotebook(id: string): Promise<void> {
    return this.request<void>(`/notebooks/${id}`, { method: 'DELETE' });
  }

  async duplicateNotebook(id: string): Promise<Notebook> {
    return this.request<Notebook>(`/notebooks/${id}/duplicate`, { method: 'POST' });
  }

  async shareNotebook(id: string, email: string, role: string): Promise<any> {
    return this.request<any>(`/notebooks/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
  }

  // Sections
  async getSections(notebookId: string): Promise<Section[]> {
    try {
      const secs = await this.request<Section[]>(`/notebooks/${notebookId}/sections`);
      await offlineStore.saveSections(notebookId, secs);
      return secs;
    } catch (e) {
      const cached = await offlineStore.getSections(notebookId);
      if (cached && cached.length > 0) return cached;
      throw e;
    }
  }

  async createSection(data: { notebook_id: string; title: string; color?: string; password?: string }): Promise<Section> {
    return this.request<Section>('/sections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSection(id: string, data: Partial<Section>): Promise<Section> {
    return this.request<Section>(`/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async verifySectionPassword(id: string, password: string): Promise<{ unlocked: boolean }> {
    return this.request<{ unlocked: boolean }>(`/sections/${id}/verify-password`, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  }

  async deleteSection(id: string): Promise<void> {
    return this.request<void>(`/sections/${id}`, { method: 'DELETE' });
  }

  // Pages
  async getPages(sectionId: string): Promise<Page[]> {
    try {
      const pages = await this.request<Page[]>(`/sections/${sectionId}/pages`);
      await offlineStore.savePages(sectionId, pages);
      return pages;
    } catch (e) {
      const cached = await offlineStore.getPages(sectionId);
      if (cached && cached.length > 0) return cached;
      throw e;
    }
  }

  async getPage(id: string): Promise<Page> {
    return this.request<Page>(`/pages/${id}`);
  }

  async createPage(data: { section_id: string; title?: string }): Promise<Page> {
    return this.request<Page>('/pages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePage(id: string, data: Partial<Page>): Promise<Page> {
    return this.request<Page>(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deletePage(id: string): Promise<void> {
    return this.request<void>(`/pages/${id}`, { method: 'DELETE' });
  }

  async duplicatePage(id: string): Promise<Page> {
    return this.request<Page>(`/pages/${id}/duplicate`, { method: 'POST' });
  }

  // Canvas Blocks
  async getPageBlocks(pageId: string): Promise<CanvasBlock[]> {
    try {
      const blocks = await this.request<CanvasBlock[]>(`/pages/${pageId}/blocks`);
      await offlineStore.savePageBlocks(pageId, blocks);
      return blocks;
    } catch (e) {
      const cached = await offlineStore.getPageBlocks(pageId);
      if (cached && cached.length > 0) return cached;
      throw e;
    }
  }

  async createBlock(pageId: string, block: Partial<CanvasBlock>): Promise<CanvasBlock> {
    return this.request<CanvasBlock>(`/pages/${pageId}/blocks`, {
      method: 'POST',
      body: JSON.stringify(block)
    });
  }

  async updateBlock(id: string, block: Partial<CanvasBlock>): Promise<CanvasBlock> {
    return this.request<CanvasBlock>(`/blocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(block)
    });
  }

  async deleteBlock(id: string): Promise<void> {
    return this.request<void>(`/blocks/${id}`, { method: 'DELETE' });
  }

  async batchUpdateBlocks(pageId: string, blocks: Partial<CanvasBlock>[]): Promise<void> {
    return this.request<void>(`/pages/${pageId}/blocks/batch`, {
      method: 'POST',
      body: JSON.stringify({ blocks })
    });
  }

  // Digital Ink Strokes
  async getPageInk(pageId: string): Promise<InkStroke[]> {
    try {
      const strokes = await this.request<InkStroke[]>(`/pages/${pageId}/ink`);
      await offlineStore.savePageInk(pageId, strokes);
      return strokes;
    } catch (e) {
      const cached = await offlineStore.getPageInk(pageId);
      if (cached && cached.length > 0) return cached;
      throw e;
    }
  }

  async addInkStroke(pageId: string, stroke: Partial<InkStroke>): Promise<InkStroke> {
    return this.request<InkStroke>(`/pages/${pageId}/ink`, {
      method: 'POST',
      body: JSON.stringify(stroke)
    });
  }

  async clearPageInk(pageId: string): Promise<void> {
    return this.request<void>(`/pages/${pageId}/ink/clear`, { method: 'POST' });
  }

  // Search
  async search(query: string, scope: string = 'all', pageId?: string, notebookId?: string): Promise<any> {
    const params = new URLSearchParams({ q: query, scope });
    if (pageId) params.append('page_id', pageId);
    if (notebookId) params.append('notebook_id', notebookId);
    return this.request<any>(`/search?${params.toString()}`);
  }

  // Tags & Tasks
  async getTagsSummary(): Promise<Record<string, TagItem[]>> {
    return this.request<Record<string, TagItem[]>>('/tags/summary');
  }

  async getTasks(): Promise<TaskItem[]> {
    return this.request<TaskItem[]>('/tasks');
  }

  async createTask(data: Partial<TaskItem>): Promise<TaskItem> {
    return this.request<TaskItem>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTask(id: string, data: Partial<TaskItem>): Promise<TaskItem> {
    return this.request<TaskItem>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, { method: 'DELETE' });
  }

  // Templates
  async getTemplates(): Promise<TemplateItem[]> {
    return this.request<TemplateItem[]>('/templates');
  }

  async applyTemplate(templateId: string, sectionId: string): Promise<Page> {
    return this.request<Page>('/templates/apply', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId, section_id: sectionId })
    });
  }

  // AI Assistant
  async askAI(data: {
    prompt: string;
    context_scope?: string;
    selected_text?: string;
    current_page_id?: string;
    current_section_id?: string;
    current_notebook_id?: string;
    conversation_id?: string;
    provider?: string;
    user_api_key?: string;
  }): Promise<any> {
    return this.request<any>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAIConfig(): Promise<any> {
    return this.request<any>('/ai/config');
  }

  // File Upload
  async uploadFile(file: File): Promise<{ filename: string; url: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  }

  // Storage & Disk Sync
  async getStorageStatus(): Promise<any> {
    return this.request<any>('/storage/status');
  }

  async syncStorage(): Promise<any> {
    return this.request<any>('/storage/sync', { method: 'POST' });
  }

  // Export
  async exportPage(pageId: string, format: 'markdown' | 'html' | 'json' | 'titan' = 'markdown'): Promise<any> {
    return this.request<any>(`/export/page/${pageId}?format=${format}`);
  }
}

export const api = new ApiClient();

