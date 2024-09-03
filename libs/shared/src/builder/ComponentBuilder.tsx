import {
  CSSProperties,
  Children,
  DependencyList,
  Dispatch,
  EffectCallback,
  FC,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  cloneElement,
  createElement,
  isValidElement,
  memo,
  useEffect,
  useState,
} from 'react';

export const DATA_CUSTOMIZE_ID = 'data-customize-id';

export type CB_State = Record<string, unknown>;
export type CB_StateFn = (
  state: CB_State,
  setState: Dispatch<SetStateAction<CB_State>>,
) => void;

export interface CB_Styles {
  host?: CSSProperties;
  component?: CSSProperties;
}
export type CB_StylesFn = (state?: CB_State) => CB_Styles;

export interface CB_ClassNames {
  host?: string | string[];
  component?: string | string[];
}
export type CB_ClassNamesFn = (state?: CB_State) => CB_ClassNames;

export interface CB_Effect {
  effect: EffectCallback;
  dependencies: DependencyList;
}
export type CB_EffectsFn = (state?: CB_State) => CB_Effect[];

type CB_HostHandlers = Record<string, (...args: unknown[]) => unknown>;
type CB_ComponentHandlers = Record<string, (...args: unknown[]) => unknown>;
export interface CB_Handlers {
  host?: CB_HostHandlers;
  component?: CB_ComponentHandlers;
}
export type CB_HandlersFn = (
  state?: CB_State,
  setState?: Dispatch<SetStateAction<CB_State>>,
) => CB_Handlers;

export type CB_HTMLContentFn = (
  children?: ReactNode | ReactNode[],
  state?: CB_State,
  handlers?: CB_Handlers['component'],
) => ReactNode;

type ComponentProps<P> =
  P extends FC<infer Props> ? PropsWithChildren<Props> : never;

export class ComponentBuilder<
  Component,
  BlockIds extends string,
  Props extends ComponentProps<Component> = ComponentProps<Component>,
> {
  private htmlReplacements: Partial<Record<BlockIds, CB_HTMLContentFn>> = {};

  private constructor(component: FC<Props>) {
    this.component = component;
  }

  static use<Component, BlockIds extends string = ''>(
    component: FC<ComponentProps<Component>>,
  ) {
    return new ComponentBuilder<Component, BlockIds>(component);
  }

  updateStyles(updateFn: (styles: CB_Styles, state?: CB_State) => CB_Styles) {
    if (typeof updateFn === 'function') {
      const prevStylesFn = this.stylesFn;
      this.stylesFn = (state) => updateFn(prevStylesFn(state), state);
    }
    return this;
  }

  updateClassNames(
    updateFn: (classNames: CB_ClassNames, state?: CB_State) => CB_ClassNames,
  ) {
    if (typeof updateFn === 'function') {
      const prevClassNamesFn = this.classNamesFn;
      this.classNamesFn = (state) => updateFn(prevClassNamesFn(state), state);
    }
    return this;
  }

  updateHTML(
    htmlContentFnOrBlocks:
      | CB_HTMLContentFn
      | Partial<Record<BlockIds, CB_HTMLContentFn>>,
  ) {
    if (typeof htmlContentFnOrBlocks === 'function') {
      this.htmlContentFn = htmlContentFnOrBlocks;
    } else {
      this.htmlReplacements = htmlContentFnOrBlocks;
      this.htmlContentFn = ((
        children: ReactNode,
        state: CB_State,
        handlers: CB_ComponentHandlers,
      ) => {
        return this.applyHTMLReplacements(children, state, handlers);
      }) as CB_HTMLContentFn;
    }
    return this;
  }

  updateHandlers(
    updateFn: (
      handlers: CB_Handlers,
      state?: CB_State,
      setState?: Dispatch<SetStateAction<CB_State>>,
    ) => CB_Handlers,
  ) {
    if (typeof updateFn === 'function') {
      const prevHandlersFn = this.handlersFn;
      this.handlersFn = (state, setState) =>
        updateFn(prevHandlersFn(state, setState), state, setState);
    }
    return this;
  }

  addState(stateFn: CB_StateFn) {
    this.stateFn = stateFn;
    return this;
  }

  addEffects(effectsFn: CB_EffectsFn) {
    this.effectsFn = effectsFn;
    return this;
  }

  build(options: { reactMemo?: boolean } = {}) {
    const component = (props: Props) => {
      const [componentState, setComponentState] = useState<CB_State>({});

      useEffect(() => {
        this.stateFn?.(componentState, setComponentState);
      }, [this.stateFn]);

      this.effectsFn?.(componentState).forEach(({ effect, dependencies }) => {
        useEffect(effect, dependencies);
      });

      const { host: hostHandlers, component: componentHandlers } =
        this.handlersFn?.(componentState, setComponentState) ?? {};

      const renderedChildren =
        typeof this.component === 'function'
          ? this.component({ ...props })
          : createElement(this.component, { ...props });

      const composeClassNames = (classNames: string | string[] = []) => {
        return (Array.isArray(classNames) ? classNames : [classNames]).join(
          ' ',
        );
      };

      return (
        <div
          className={composeClassNames(
            this.classNamesFn?.(componentState)?.host,
          )}
          style={this.stylesFn?.(componentState)?.host}
          {...hostHandlers}
        >
          {this.htmlContentFn?.(
            renderedChildren,
            componentState,
            componentHandlers,
          ) ?? renderedChildren}
        </div>
      );
    };

    return options?.reactMemo ? memo(component) : component;
  }

  private readonly component: FC<Props> = () => null;

  private stylesFn: CB_StylesFn = () => ({ host: {}, component: {} });

  private classNamesFn: CB_ClassNamesFn = () => ({ host: [], component: [] });

  private htmlContentFn: CB_HTMLContentFn = () => null;

  private handlersFn: CB_HandlersFn = () => ({ host: {}, component: {} });

  private stateFn: CB_StateFn = () => ({
    state: {},
    setState: () => ({}),
  });

  private effectsFn: CB_EffectsFn = () => [];

  private applyHTMLReplacements(
    children: ReactNode | ReactNode[],
    state: CB_State,
    handlers: CB_ComponentHandlers,
  ): ReactNode | ReactNode[] {
    return Children.map(children, (child: ReactNode) => {
      if (!isValidElement(child)) {
        return child;
      }

      const customizeId = child.props[DATA_CUSTOMIZE_ID];

      if (customizeId && this.htmlReplacements[customizeId as BlockIds]) {
        const replacedContent = this.htmlReplacements[customizeId as BlockIds]!(
          child,
          state,
          handlers,
        );

        if (!isValidElement(replacedContent)) {
          return child;
        }

        return cloneElement(replacedContent, {
          [DATA_CUSTOMIZE_ID]: customizeId,
          children: this.applyHTMLReplacements(
            replacedContent.props.children,
            state,
            handlers,
          ),
        } as HTMLAttributes<HTMLElement>);
      }

      return cloneElement(child, {
        children: this.applyHTMLReplacements(
          child.props.children,
          state,
          handlers,
        ),
      } as HTMLAttributes<HTMLElement>);
    });
  }
}

export default ComponentBuilder;
