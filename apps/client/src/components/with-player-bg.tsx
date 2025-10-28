import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings";

export function withPlayerBg<T extends { className?: string; children?: ReactNode; [key: string]: unknown }>(
  WrappedComponent: ComponentType<T>
): ComponentType<T> {
  return function WithPlayerBg(props: T) {
    const useBlurForPlayerBackground = useSettingsStore(
      (state) => state.useBlurForPlayerBackground,
    );

    const enhancedProps = {
      ...props,
      className: cn(
        props.className,
        useBlurForPlayerBackground ? "with-blur" : "with-material",
      ),
    } as T;

    return <WrappedComponent {...enhancedProps} />;
  };
}