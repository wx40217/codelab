import { Chapter, Lesson, LessonMeta } from '../types/course';
import { binaryBitsLesson } from './lessons/binaryBits';
import { pixelArtLesson } from './lessons/pixelArt';
import { textEncodingLesson } from './lessons/textEncoding';
import { seqAndBugLesson } from './lessons/seqAndBug';
import { robotLoopLesson } from './lessons/robotLoop';
import { ifConditionsLesson } from './lessons/ifConditions';
import { variablesBoxLesson } from './lessons/variablesBox';
import { arraysLockersLesson } from './lessons/arraysLockers';
import { stackPlatesLesson } from './lessons/stackPlates';
import { queueLineLesson } from './lessons/queueLine';
import { binaryTreeLesson } from './lessons/binaryTree';
import { countStepsLesson } from './lessons/countSteps';
import { binarySearchLesson } from './lessons/binarySearch';
import { cardSortingLesson } from './lessons/cardSorting';

export const READY_LESSON_LIST: Lesson[] = [
  binaryBitsLesson,
  pixelArtLesson,
  textEncodingLesson,
  seqAndBugLesson,
  robotLoopLesson,
  ifConditionsLesson,
  variablesBoxLesson,
  arraysLockersLesson,
  stackPlatesLesson,
  queueLineLesson,
  binaryTreeLesson,
  countStepsLesson,
  binarySearchLesson,
  cardSortingLesson,
];

const READY_LESSONS: Record<string, Lesson> = Object.fromEntries(
  READY_LESSON_LIST.map((lesson) => [lesson.id, lesson])
);

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    num: '01',
    title: '电脑的秘密语言',
    lessons: [binaryBitsLesson, pixelArtLesson, textEncodingLesson],
  },
  {
    id: 'ch-2',
    num: '02',
    title: '指挥小机器人',
    lessons: [seqAndBugLesson, robotLoopLesson, ifConditionsLesson, variablesBoxLesson],
  },
  {
    id: 'ch-3',
    num: '03',
    title: '装数据的魔法盒子',
    lessons: [arraysLockersLesson, stackPlatesLesson, queueLineLesson, binaryTreeLesson],
  },
  {
    id: 'ch-4',
    num: '04',
    title: '聪明的解题魔法',
    lessons: [countStepsLesson, binarySearchLesson, cardSortingLesson],
  },
];

export const DEFAULT_LESSON_ID = binaryBitsLesson.id;

export function getAllLessonMetas(): LessonMeta[] {
  return CHAPTERS.flatMap((c) => c.lessons);
}

export function getLessonById(id: string): Lesson | undefined {
  return READY_LESSONS[id];
}

export function getLessonMetaById(id: string): LessonMeta | undefined {
  return getAllLessonMetas().find((l) => l.id === id);
}

export function getChapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getNextReadyLesson(currentId: string): Lesson | undefined {
  const idx = READY_LESSON_LIST.findIndex((l) => l.id === currentId);
  if (idx === -1) return READY_LESSON_LIST[0];
  return READY_LESSON_LIST[(idx + 1) % READY_LESSON_LIST.length];
}
