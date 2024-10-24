import { ChatSettingsSelectors } from '../selectors';
import { BaseElement } from './baseElement';

import { TalkToGroup } from '@/src/ui/webElements/talkToGroup';
import { Locator, Page } from '@playwright/test';

export class RecentEntities extends BaseElement {
  constructor(page: Page, parentLocator: Locator) {
    super(page, ChatSettingsSelectors.recentEntities, parentLocator);
  }

  public talkToGroup!: TalkToGroup;

  getTalkToGroup(): TalkToGroup {
    if (!this.talkToGroup) {
      this.talkToGroup = new TalkToGroup(this.page, this.rootLocator);
    }
    return this.talkToGroup;
  }

  public replayAsIsButton = this.getChildElementBySelector(
    ChatSettingsSelectors.replayAsIsButton,
  );

  public playbackButton = this.getChildElementBySelector(
    ChatSettingsSelectors.playbackButton,
  );
}
