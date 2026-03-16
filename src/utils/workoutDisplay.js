const toFiniteNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    const normalized = String(value ?? '').trim();
    if (normalized) return normalized;
  }
  return '';
};

const extractRawWorkoutDetails = (item = {}) => {
  const nestedWorkout = [
    item?.workout,
    item?.workoutInfo,
    item?.workoutSummary,
    item?.workoutDto,
    item?.attachedWorkout,
    item?.attachWorkout,
    item?.workoutRecord,
    item?.workoutData,
  ].find((candidate) => isObject(candidate)) || {};

  return [
    item?.workoutDetails,
    item?.workoutDetailList,
    item?.workoutDetailDtoList,
    item?.workoutDetailCreateDtoList,
    nestedWorkout?.workoutDetails,
    nestedWorkout?.workoutDetailList,
    nestedWorkout?.workoutDetailDtoList,
    nestedWorkout?.workoutDetailCreateDtoList,
  ].find((candidate) => Array.isArray(candidate) && candidate.length > 0) || [];
};

export const extractWorkoutExercises = (item = {}) => extractRawWorkoutDetails(item)
  .map((detail, index) => {
    if (typeof detail === 'string') {
      const name = String(detail || '').trim();
      return name
        ? {
            name,
            stats: '-',
            weight: null,
            sets: null,
            reps: null,
            hasWeight: false,
            hasSets: false,
            hasReps: false,
          }
        : null;
    }

    if (!isObject(detail)) return null;

    const name = firstNonEmptyString(
      detail?.workoutName,
      detail?.exerciseName,
      detail?.name,
      detail?.title,
      detail?.label,
      detail?.movement,
    ) || `운동 ${index + 1}`;

    const hasWeight = detail?.weight != null || detail?.totalWeight != null || detail?.volume != null || detail?.kg != null;
    const hasSets = detail?.setCount != null || detail?.sets != null || detail?.set != null;
    const hasReps = detail?.rep != null || detail?.reps != null || detail?.repCount != null || detail?.count != null;

    const weight = toFiniteNumber(detail?.weight ?? detail?.totalWeight ?? detail?.volume ?? detail?.kg);
    const sets = toFiniteNumber(detail?.setCount ?? detail?.sets ?? detail?.set);
    const reps = toFiniteNumber(detail?.rep ?? detail?.reps ?? detail?.repCount ?? detail?.count);

    const statsParts = [];
    if (hasWeight && weight !== null) statsParts.push(`${weight}kg`);
    if (hasSets && sets !== null) statsParts.push(`${sets}세트`);
    if (hasReps && reps !== null) statsParts.push(`${reps}회`);

    return {
      name,
      stats: statsParts.length > 0 ? statsParts.join(' · ') : '-',
      weight,
      sets,
      reps,
      hasWeight,
      hasSets,
      hasReps,
    };
  })
  .filter(Boolean);

export const buildWorkoutTitle = (exercises = [], fallbackTitle = '운동') => {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return String(fallbackTitle || '운동').trim() || '운동';
  }

  const firstName = String(exercises[0]?.name || '').trim() || '운동';
  if (exercises.length === 1) return firstName;
  return `${firstName} 외 ${exercises.length - 1}개`;
};

export const buildWorkoutTags = (exercises = []) => (
  Array.isArray(exercises) && exercises.length > 0
    ? exercises.map((exercise) => exercise?.name).filter(Boolean).join(', ')
    : '운동'
);
