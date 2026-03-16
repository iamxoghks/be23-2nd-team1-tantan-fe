const RESERVATION_STATUS_LABELS = {
  CONFIRMED: '예약 확정',
  CANCELLED: '예약 취소',
};

const pad = (value) => String(value).padStart(2, '0');

export const parseReservationDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatReservationDate = (value) => {
  const date = parseReservationDateTime(value);
  if (!date) return '-';
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

export const formatReservationTime = (value) => {
  const date = parseReservationDateTime(value);
  if (!date) return '--:--';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const getReservationStatusLabel = (status) => (
  RESERVATION_STATUS_LABELS[String(status || '').toUpperCase()] || '예약'
);

export const getReservationPhase = (reservation, now = Date.now()) => {
  if (!reservation) return 'past';
  if (String(reservation.status || '').toUpperCase() === 'CANCELLED') return 'cancelled';
  return Number(reservation.timestamp || 0) >= now ? 'upcoming' : 'past';
};

export const getReservationPhaseLabel = (reservation, now = Date.now()) => {
  const phase = getReservationPhase(reservation, now);
  if (phase === 'cancelled') return '취소';
  if (phase === 'upcoming') return '예정';
  return '지난 예약';
};

export const getReservationRelativeLabel = (reservation, now = Date.now()) => {
  const phase = getReservationPhase(reservation, now);
  if (phase === 'cancelled') return '취소됨';

  const timestamp = Number(reservation?.timestamp || 0);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '';

  const diffMinutes = Math.round(Math.abs(timestamp - now) / (60 * 1000));
  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}분 ${phase === 'upcoming' ? '후' : '전'}`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 ${phase === 'upcoming' ? '후' : '전'}`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}일 ${phase === 'upcoming' ? '후' : '전'}`;
};

export const normalizeReservationRecord = (item, index = 0, now = Date.now()) => {
  const reservationDateTime = item?.reservationDateTime || item?.slotDateTime || item?.dateTime || null;
  const parsedDate = parseReservationDateTime(reservationDateTime);
  const timestamp = parsedDate ? parsedDate.getTime() : 0;
  const status = String(item?.status || 'CONFIRMED').toUpperCase();

  const normalized = {
    id: item?.id ?? `reservation-${index + 1}`,
    gymId: Number(item?.gymId || 0) || null,
    gymName: String(item?.gymName || '예약한 짐').trim() || '예약한 짐',
    reservationDateTime,
    timestamp,
    dateKey: String(reservationDateTime || '').slice(0, 10),
    status,
    statusLabel: getReservationStatusLabel(status),
    date: formatReservationDate(reservationDateTime),
    time: formatReservationTime(reservationDateTime),
    cancelReason: String(item?.cancelReason || '').trim(),
  };

  return {
    ...normalized,
    phase: getReservationPhase(normalized, now),
    phaseLabel: getReservationPhaseLabel(normalized, now),
    relativeLabel: getReservationRelativeLabel(normalized, now),
  };
};

export const sortReservationRecords = (records, now = Date.now()) => {
  const rank = (item) => {
    const phase = getReservationPhase(item, now);
    if (phase === 'upcoming') return 0;
    if (phase === 'past') return 1;
    return 2;
  };

  return [...records].sort((left, right) => {
    const leftRank = rank(left);
    const rightRank = rank(right);
    if (leftRank !== rightRank) return leftRank - rightRank;

    if (leftRank === 0) {
      return Number(left.timestamp || 0) - Number(right.timestamp || 0);
    }

    if (leftRank === 1) {
      return Number(right.timestamp || 0) - Number(left.timestamp || 0);
    }

    return Math.abs(Number(left.timestamp || 0) - now) - Math.abs(Number(right.timestamp || 0) - now);
  });
};

export const pickNearestReservation = (records, now = Date.now()) => {
  if (!Array.isArray(records) || records.length === 0) return null;

  const activeRecords = records.filter((item) => getReservationPhase(item, now) !== 'cancelled');
  const targetRecords = activeRecords.length > 0 ? activeRecords : records;
  return sortReservationRecords(targetRecords, now)[0] || null;
};
