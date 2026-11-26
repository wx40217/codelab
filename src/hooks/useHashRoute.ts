import { useCallback, useEffect, useState } from 'react';

export interface RouteLocation {
  lessonId: string;
  stepIndex: number; // 0-based
}

function parseHash(defaultLessonId: string): RouteLocation {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return { lessonId: defaultLessonId, stepIndex: 0 };
  const parts = raw.split('/').filter(Boolean);
  const lessonId = parts[0] || defaultLessonId;
  const parsedStep = parts[1] ? Number.parseInt(parts[1], 10) : 1;
  const stepIndex = Number.isFinite(parsedStep) && parsedStep >= 1 ? parsedStep - 1 : 0;
  return { lessonId, stepIndex };
}

export function useHashRoute(defaultLessonId: string) {
  const [route, setRoute] = useState<RouteLocation>(() => parseHash(defaultLessonId));

  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      window.history.replaceState(null, '', `#/${defaultLessonId}/1`);
    }

    const onHashChange = () => {
      setRoute(parseHash(defaultLessonId));
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [defaultLessonId]);

  const navigateLesson = useCallback((lessonId: string, stepIndex = 0) => {
    const target = `#/${lessonId}/${stepIndex + 1}`;
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
    setRoute({ lessonId, stepIndex });
  }, []);

  const replaceStep = useCallback((lessonId: string, stepIndex: number) => {
    const target = `#/${lessonId}/${stepIndex + 1}`;
    if (window.location.hash !== target) {
      window.history.replaceState(null, '', target);
    }
    setRoute({ lessonId, stepIndex });
  }, []);

  return { route, navigateLesson, replaceStep };
}
