import { FC, PropsWithChildren } from 'react';

type ComponentProps<P> =
  P extends FC<infer Props> ? PropsWithChildren<Props> : never;
type OriginalComponent<P = unknown> = FC<P>;
type ComponentImplementation<OC extends OriginalComponent> = FC<
  ComponentProps<OC>
>;

const container = new WeakMap<
  OriginalComponent,
  ComponentImplementation<OriginalComponent>
>();

function resolve<OC extends OriginalComponent>(component: OC) {
  if (!container.has(component)) {
    container.set(component, component);
  }

  return {
    instance: () => getInstance(component),
    bind: (
      newComponentOrFn:
        | ComponentImplementation<OriginalComponent>
        | ((component: OC) => ComponentImplementation<OriginalComponent>),
    ) => bindImplementation(component, newComponentOrFn),
    render: () => renderImplementation(component),
  };
}

function getInstance<OC extends OriginalComponent>(
  component: OC,
): ComponentImplementation<OC> | undefined {
  return container.get(component) as ComponentImplementation<OC> | undefined;
}

function bindImplementation<OC extends OriginalComponent>(
  component: OC,
  newComponentOrFn:
    | ComponentImplementation<OriginalComponent>
    | ((component: OC) => ComponentImplementation<OriginalComponent>),
): ComponentImplementation<OriginalComponent> {
  const newComponent = (
    typeof newComponentOrFn === 'function'
      ? newComponentOrFn(component)
      : newComponentOrFn
  ) as ComponentImplementation<OriginalComponent>;
  container.set(component, newComponent);

  return newComponent;
}

function renderImplementation<OC extends OriginalComponent>(
  component: OC,
): ComponentImplementation<OC> {
  return (props: ComponentProps<OC>) => {
    const ResolvedComponent = container.get(component) ?? component;

    return <ResolvedComponent {...props} />;
  };
}

export const Inversify = {
  resolve,
};

export default Inversify;
