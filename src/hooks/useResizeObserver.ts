import { useEffect, useState, useRef } from 'react';

interface DimensionObject {
  width: number;
  height: number;
  top: number;
  left: number;
  x: number;
  y: number;
  right: number;
  bottom: number;
}

export const useResizeObserver = (
  ref: React.RefObject<HTMLElement>
): DimensionObject | null => {
  const [dimensions, setDimensions] = useState<DimensionObject | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (ref.current) {
      const observeTarget = ref.current;
      resizeObserver.current = new ResizeObserver(entries => {
        entries.forEach(entry => {
          setDimensions(entry.contentRect);
        });
      });
      
      resizeObserver.current.observe(observeTarget);
      
      return () => {
        if (resizeObserver.current && observeTarget) {
          resizeObserver.current.unobserve(observeTarget);
        }
      };
    }
  }, [ref]);

  return dimensions;
};