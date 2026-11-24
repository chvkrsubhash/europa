import { get, set, del } from 'idb-keyval';
import { Notebook, Section, Page, CanvasBlock, InkStroke } from '../types';

class OfflineStore {
  // Notebooks
  async saveNotebooks(notebooks: Notebook[]): Promise<void> {
    await set('cached_notebooks', notebooks);
  }
  async getNotebooks(): Promise<Notebook[] | undefined> {
    return await get<Notebook[]>('cached_notebooks');
  }

  // Sections
  async saveSections(notebookId: string, sections: Section[]): Promise<void> {
    await set(`cached_sections_${notebookId}`, sections);
  }
  async getSections(notebookId: string): Promise<Section[] | undefined> {
    return await get<Section[]>(`cached_sections_${notebookId}`);
  }

  // Pages
  async savePages(sectionId: string, pages: Page[]): Promise<void> {
    await set(`cached_pages_${sectionId}`, pages);
  }
  async getPages(sectionId: string): Promise<Page[] | undefined> {
    return await get<Page[]>(`cached_pages_${sectionId}`);
  }

  // Page Canvas Blocks
  async savePageBlocks(pageId: string, blocks: CanvasBlock[]): Promise<void> {
    await set(`cached_blocks_${pageId}`, blocks);
  }
  async getPageBlocks(pageId: string): Promise<CanvasBlock[] | undefined> {
    return await get<CanvasBlock[]>(`cached_blocks_${pageId}`);
  }

  // Page Ink Strokes
  async savePageInk(pageId: string, ink: InkStroke[]): Promise<void> {
    await set(`cached_ink_${pageId}`, ink);
  }
  async getPageInk(pageId: string): Promise<InkStroke[] | undefined> {
    return await get<InkStroke[]>(`cached_ink_${pageId}`);
  }

  // Pending Offline Queue (For syncing back to server when online)
  async enqueuePendingAction(action: { type: string; payload: any; timestamp: number }): Promise<void> {
    const queue = (await get<any[]>('pending_offline_actions')) || [];
    queue.push(action);
    await set('pending_offline_actions', queue);
  }
  async getPendingQueue(): Promise<any[]> {
    return (await get<any[]>('pending_offline_actions')) || [];
  }
  async clearPendingQueue(): Promise<void> {
    await del('pending_offline_actions');
  }
}

export const offlineStore = new OfflineStore();

