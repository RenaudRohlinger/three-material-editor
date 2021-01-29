import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  MutableRefObject,
  Ref,
  HTMLAttributes,
} from 'react';
import { unmountComponentAtNode, render } from 'react-dom';
import { Group } from 'three';
import { Assign } from 'utility-types';
import { ReactThreeFiber } from 'react-three-fiber';

export interface HtmlProps
  extends Omit<
    Assign<
      HTMLAttributes<HTMLDivElement>,
      ReactThreeFiber.Object3DNode<Group, typeof Group>
    >,
    'ref'
  > {
  portal?: MutableRefObject<HTMLElement>;
}

export const Html = forwardRef(
  (
    { children, style, className, portal, ...props }: HtmlProps,
    ref: Ref<HTMLDivElement>
  ) => {
    // const { gl } = useThree();
    const [el] = useState(() => document.createElement('div'));
    const group = useRef<Group>(null);
    const target = portal?.current ?? document.body;

    useEffect(() => {
      if (group.current) {
        if (target) {
          target.appendChild(el);
        }
        return () => {
          if (target) target.removeChild(el);
          unmountComponentAtNode(el);
        };
      }
      return undefined;
    }, [target, el]);

    useEffect(
      () =>
        void render(
          <div ref={ref} className={className} children={children} />,
          el
        )
    );

    return <group {...props} ref={group} />;
  }
);
