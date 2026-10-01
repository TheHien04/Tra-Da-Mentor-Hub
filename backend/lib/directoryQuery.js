import { applyListQuery } from './listQuery.js';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function mongoListFilter(query, textFields, { skillFields = [] } = {}) {
  const filter = {};
  const q = String(query.q || '').trim();
  const and = [];

  if (q && textFields.length) {
    const rx = new RegExp(escapeRegex(q), 'i');
    and.push({ $or: textFields.map((field) => ({ [field]: rx })) });
  }
  if (query.track) filter.track = query.track;
  if (query.mentorshipType) filter.mentorshipType = query.mentorshipType;
  if (query.duration) filter.duration = query.duration;
  if (query.applicationStatus) filter.applicationStatus = query.applicationStatus;
  if (query.capacity === 'full') {
    filter.$expr = {
      $gte: [{ $size: { $ifNull: ['$mentees', []] } }, { $ifNull: ['$maxMentees', 10] }],
    };
  } else if (query.capacity === 'active') {
    filter.$expr = {
      $lt: [{ $size: { $ifNull: ['$mentees', []] } }, { $ifNull: ['$maxMentees', 10] }],
    };
  } else if (query.capacity === 'none') {
    filter._id = { $exists: false };
  }
  if (query.expertise && skillFields.length) {
    const rx = new RegExp(escapeRegex(query.expertise), 'i');
    and.push({ $or: skillFields.map((field) => ({ [field]: rx })) });
  }
  if (and.length === 1) Object.assign(filter, and[0]);
  else if (and.length > 1) filter.$and = and;
  return filter;
}

function applyBase(list, baseFilter = {}) {
  return list.filter((item) => {
    if (baseFilter.mentorId && item.mentorId !== baseFilter.mentorId) return false;
    if (baseFilter._id && String(item._id) !== String(baseFilter._id)) return false;
    return true;
  });
}

export function queryMemoryDirectory(items, query, textFields, baseFilter) {
  return applyListQuery(applyBase(items, baseFilter), query, textFields);
}

export async function queryMongoDirectory(Model, query, { textFields, skillFields, baseFilter = {}, map }) {
  const filter = { ...baseFilter, ...mongoListFilter(query, textFields, { skillFields }) };
  const hasPage = query.page != null && query.page !== '';
  const toRow = (doc) => (map ? map(doc) : doc);

  if (!hasPage) {
    const docs = await Model.find(filter).sort({ name: 1 }).lean();
    return { paged: false, data: docs.map(toRow) };
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const start = (page - 1) * limit;
  const [total, docs] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).sort({ name: 1 }).skip(start).limit(limit).lean(),
  ]);
  return {
    paged: true,
    body: {
      data: docs.map(toRow),
      page,
      limit,
      total,
    },
  };
}

export function sendDirectory(res, result) {
  if (result.paged) return res.json(result.body);
  return res.json(result.data);
}
