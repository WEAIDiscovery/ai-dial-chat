/* eslint-disable no-restricted-globals */
import { Observable, map } from 'rxjs';

import { Conversation } from '@/src/types/chat';
import {
  BackendFile,
  BackendFileFolder,
  DialFile,
  FileFolderInterface,
} from '@/src/types/files';
import { FolderInterface } from '@/src/types/folder';
import { Prompt } from '@/src/types/prompt';
import { Theme } from '@/src/types/settings';
import { DialStorage } from '@/src/types/storage';

import { getPathNameId, getRelativePath } from '../file';
import { ApiMockStorage } from './storages/api-mock-storage';
import { ApiStorage } from './storages/api-storage';
import { BrowserStorage } from './storages/browser-storage';

export class DataService {
  private static dataStorage: DialStorage;

  public static init(storageType?: string) {
    BrowserStorage.init();
    this.setDataStorage(storageType);
  }

  public static getConversationsFolders(): Observable<FolderInterface[]> {
    return this.getDataStorage().getConversationsFolders();
  }

  public static setConversationFolders(
    folders: FolderInterface[],
  ): Observable<void> {
    return this.getDataStorage().setConversationsFolders(folders);
  }

  public static getPromptsFolders(): Observable<FolderInterface[]> {
    return this.getDataStorage().getPromptsFolders();
  }
  public static setPromptFolders(folders: FolderInterface[]): Observable<void> {
    return this.getDataStorage().setPromptsFolders(folders);
  }

  public static getPrompts(): Observable<Prompt[]> {
    return this.getDataStorage().getPrompts();
  }

  public static setPrompts(prompts: Prompt[]): Observable<void> {
    return this.getDataStorage().setPrompts(prompts);
  }

  public static getConversations(): Observable<Conversation[]> {
    return this.getDataStorage().getConversations();
  }
  public static setConversations(
    conversations: Conversation[],
  ): Observable<void> {
    return this.getDataStorage().setConversations(conversations);
  }
  public static getSelectedConversationsIds(): Observable<string[]> {
    return BrowserStorage.getData('selectedConversationIds', []);
  }
  public static setSelectedConversationsIds(
    selectedConversationsIds: string[],
  ): Observable<void> {
    return BrowserStorage.setData(
      'selectedConversationIds',
      selectedConversationsIds,
    );
  }
  public static getRecentModelsIds(): Observable<string[]> {
    return BrowserStorage.getData('recentModelsIds', []);
  }
  public static setRecentModelsIds(
    recentModelsIds: string[],
  ): Observable<void> {
    return BrowserStorage.setData('recentModelsIds', recentModelsIds);
  }

  public static getRecentAddonsIds(): Observable<string[]> {
    return BrowserStorage.getData('recentAddonsIds', []);
  }
  public static setRecentAddonsIds(
    recentAddonsIds: string[],
  ): Observable<void> {
    return BrowserStorage.setData('recentAddonsIds', recentAddonsIds);
  }

  public static getTheme(): Observable<Theme> {
    return BrowserStorage.getData('settings', { theme: 'dark' as Theme }).pipe(
      map((settings) => settings.theme),
    );
  }
  public static setTheme(theme: Theme): Observable<void> {
    return BrowserStorage.setData('settings', { theme });
  }
  public static getShowChatbar(): Observable<boolean> {
    return BrowserStorage.getData('showChatbar', true);
  }
  public static setShowChatbar(showChatbar: boolean): Observable<void> {
    return BrowserStorage.setData('showChatbar', showChatbar);
  }
  public static getShowPromptbar(): Observable<boolean> {
    return BrowserStorage.getData('showPromptbar', true);
  }
  public static setShowPromptbar(showPromptbar: boolean): Observable<void> {
    return BrowserStorage.setData('showPromptbar', showPromptbar);
  }
  public static getOpenedFolderIds(): Observable<string[]> {
    return BrowserStorage.getData('openedFoldersIds', []);
  }
  public static setOpenedFolderIds(
    openedFolderIds: string[],
  ): Observable<void> {
    return BrowserStorage.setData('openedFoldersIds', openedFolderIds);
  }

  public static sendFile(
    formData: FormData,
    path?: string | null | undefined,
  ): Observable<{ percent?: number; result?: DialFile }> {
    return ApiStorage.requestOld({
      url: `api/files${path ? '?path=' + path : ''}`,
      method: 'POST',
      async: true,
      body: formData,
    }).pipe(
      map(
        ({
          percent,
          result,
        }: {
          percent?: number;
          result?: BackendFile;
        }): { percent?: number; result?: DialFile } => {
          if (percent) {
            return { percent };
          }

          if (!result) {
            return {};
          }

          const relativePath = getRelativePath(result.path);
          return {
            result: {
              id: getPathNameId(result.name, relativePath),
              name: result.name,
              absolutePath: result.path,
              relativePath: relativePath,
              folderId: relativePath,
              contentLength: result.contentLength,
              contentType: result.contentType,
              serverSynced: true,
            },
          };
        },
      ),
    );
  }

  public static getFileFolders(
    parentPath?: string,
  ): Observable<FileFolderInterface[]> {
    const query = new URLSearchParams({
      filter: 'FOLDER',
      ...(parentPath && { path: parentPath }),
    });
    const resultQuery = query.toString();

    return ApiStorage.request(
      `api/files/listing${resultQuery ? '?' + resultQuery : ''}`,
    ).pipe(
      map((folders: BackendFileFolder[]) => {
        return folders.map((folder): FileFolderInterface => {
          const relativePath = getRelativePath(folder.path);

          return {
            id: getPathNameId(folder.name, relativePath),
            name: folder.name,
            type: 'file',
            absolutePath: folder.path,
            relativePath: relativePath,
            folderId: relativePath,
            serverSynced: true,
          };
        });
      }),
    );
  }

  public static removeFile(filePath: string): Observable<void> {
    const query = new URLSearchParams({
      path: filePath,
    });
    const resultQuery = query.toString();

    return ApiStorage.request(`api/files${'?' + resultQuery}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getFiles(parentPath?: string): Observable<DialFile[]> {
    const query = new URLSearchParams({
      filter: 'FILE',
      ...(parentPath && { path: parentPath }),
    });
    const resultQuery = query.toString();

    return ApiStorage.request(
      `api/files/listing${resultQuery ? '?' + resultQuery : ''}`,
    ).pipe(
      map((files: BackendFile[]) => {
        return files.map((file): DialFile => {
          const relativePath = getRelativePath(file.path);

          return {
            id: getPathNameId(file.name, relativePath),
            name: file.name,
            absolutePath: file.path,
            relativePath: relativePath,
            folderId: relativePath,
            contentLength: file.contentLength,
            contentType: file.contentType,
            serverSynced: true,
          };
        });
      }),
    );
  }

  private static getDataStorage(): DialStorage {
    if (!this.dataStorage) {
      this.setDataStorage();
    }
    return this.dataStorage;
  }

  private static setDataStorage(dataStorageType?: string): void {
    switch (dataStorageType) {
      case 'api':
        this.dataStorage = new ApiStorage();
        break;
      case 'apiMock':
        this.dataStorage = new ApiMockStorage();
        break;
      case 'browserStorage':
      default:
        this.dataStorage = new BrowserStorage();
    }
  }
}