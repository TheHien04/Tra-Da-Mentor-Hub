import { getAnalyticsSummary } from '../services/analyticsService.js';

export async function getSummary(req, res, next) {
  try {
    const period = req.query.period || '90d';
    const locale = req.query.locale || 'vi-VN';
    const data = await getAnalyticsSummary(period, locale);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
