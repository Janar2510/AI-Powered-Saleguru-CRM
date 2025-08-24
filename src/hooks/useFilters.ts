import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useFilters<T extends Record<string, string | number | undefined>>(key: string, initial: T) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // hydrate from URL or LS
  const [filters, setFilters] = useState<T>(() => {
    const fromUrl: any = { ...initial };
    for (const k of Object.keys(initial)) {
      const v = params.get(k);
      if (v !== null) fromUrl[k] = v;
    }
    if (Object.values(fromUrl).some((v) => v !== undefined && String(v).length > 0)) return fromUrl;
    const saved = localStorage.getItem(`filters:${key}`);
    return saved ? JSON.parse(saved) : initial;
  });

  // persist to URL & LS (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(location.search);
      Object.entries(filters).forEach(([k, v]) => {
        if (v === undefined || String(v).length === 0) next.delete(k);
        else next.set(k, String(v));
      });
      navigate({ search: next.toString() }, { replace: true });
      localStorage.setItem(`filters:${key}`, JSON.stringify(filters));
    }, 200);
    return () => clearTimeout(id);
  }, [filters]);

  return { filters, setFilters } as const;
}

