function includesText(item, fields, q) {
  return fields.some((field) => {
    const value = item?.[field];
    if (Array.isArray(value)) {
      return value.some((part) => String(part).toLowerCase().includes(q));
    }
    return String(value || '').toLowerCase().includes(q);
  });
}

/**
 * Optional pagination. Without `page`, callers keep the legacy array response.
 */
export function applyListQuery(items, query, fields) {
  let list = Array.isArray(items) ? items : [];
  const q = String(query.q || '').trim().toLowerCase();
  if (q && fields?.length) {
    list = list.filter((item) => includesText(item, fields, q));
  }

  if (query.track) {
    list = list.filter((item) => item.track === query.track);
  }
  if (query.mentorshipType) {
    list = list.filter((item) => item.mentorshipType === query.mentorshipType);
  }
  if (query.duration) {
    list = list.filter((item) => item.duration === query.duration);
  }
  if (query.applicationStatus) {
    list = list.filter((item) => item.applicationStatus === query.applicationStatus);
  }
  if (query.capacity === 'full') {
    list = list.filter((item) => (item.mentees?.length || 0) >= (item.maxMentees || 10));
  } else if (query.capacity === 'active') {
    list = list.filter((item) => (item.mentees?.length || 0) < (item.maxMentees || 10));
  } else if (query.capacity === 'none') {
    list = [];
  }
  if (query.expertise) {
    const needle = String(query.expertise).toLowerCase();
    list = list.filter((item) =>
      [...(item.expertise || []), ...(item.interests || [])].some((skill) =>
        String(skill).toLowerCase().includes(needle)
      )
    );
  }
  if (query.school) {
    const needle = String(query.school).toLowerCase();
    list = list.filter((item) => String(item.school || '').toLowerCase().includes(needle));
  }
  if (query.progressMin !== undefined && query.progressMin !== '') {
    const min = Number(query.progressMin);
    list = list.filter((item) => Number(item.progress) >= min);
  }
  if (query.progressMax !== undefined && query.progressMax !== '') {
    const max = Number(query.progressMax);
    list = list.filter((item) => Number(item.progress) <= max);
  }
  if (query.progress) {
    const bands = String(query.progress).split(',').filter(Boolean);
    list = list.filter((item) => {
      const value = Number(item.progress) || 0;
      if (value === 0 && bands.includes('just-started')) return true;
      if (value > 0 && value < 100 && bands.includes('in-progress')) return true;
      if (value === 100 && bands.includes('completed')) return true;
      return false;
    });
  }
  if (query.frequency) {
    list = list.filter((item) => (item.frequency || item.meetingSchedule?.frequency) === query.frequency);
  }
  if (query.mentorName) {
    const needle = String(query.mentorName).toLowerCase();
    list = list.filter((item) => String(item.mentor?.name || '').toLowerCase().includes(needle));
  }

  const hasPage = query.page != null && query.page !== '';
  if (!hasPage) {
    return { paged: false, data: list };
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const start = (page - 1) * limit;
  return {
    paged: true,
    body: {
      data: list.slice(start, start + limit),
      page,
      limit,
      total: list.length,
    },
  };
}

export function sendList(res, items, query, fields) {
  const result = applyListQuery(items, query, fields);
  if (!result.paged) return res.json(result.data);
  return res.json(result.body);
}
