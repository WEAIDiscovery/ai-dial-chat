import { Action } from '@/src/types/chat';

export interface Props {
  action: Action;
  onCallAction?: (actionId: string) => void;
}

export const MessageAction = ({ action, onCallAction }: Props) => {
  return (
    <div className="block min-w-0 shrink rounded border border-secondary bg-layer-1">
      <button
          className="button button-secondary"
          data-qa="message-action"
          onClick={() => {
              onCallAction && onCallAction(action.actionId);
          }}
      >
        {action.name}
      </button>
    </div>
  );
};
