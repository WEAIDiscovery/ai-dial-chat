import { useState } from 'react';

import classNames from 'classnames';

import { Action } from '@/src/types/chat';

import { MessageAction } from './MessageAction';

import ChevronDown from '@/public/images/icons/chevron-down.svg';
import { snake2camel } from '@/src/utils/app/snake-and-camel';

export interface Props {
  actions: Action[];
  onCallAction?: (actionId: string) => void;
}

const NUMBER_OF_VISIBLE_ACTIONS = 3;

export const MessageActions = ({ actions, onCallAction }: Props) => {
  const [showMore, setShowMore] = useState(false);

  const displayedActions = actions.map(snake2camel).slice(
    0,
    showMore ? actions.length : NUMBER_OF_VISIBLE_ACTIONS,
  );

  return (
    <div data-no-context-menu className="flex flex-row gap-1">
      {displayedActions.map((action) => (
        <MessageAction key={action.actionId} action={action} onCallAction={(actionId) =>{onCallAction && onCallAction(actionId)}} />
      ))}
      {actions.length > NUMBER_OF_VISIBLE_ACTIONS && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-2 flex leading-[18px] text-accent-primary"
        >
          {showMore ? 'Show less' : 'Show more'}
          <ChevronDown
            height={18}
            width={18}
            className={classNames(
              'ml-2 shrink-0 transition',
              showMore && 'rotate-180',
            )}
          />
        </button>
      )}
    </div>
  );
};
