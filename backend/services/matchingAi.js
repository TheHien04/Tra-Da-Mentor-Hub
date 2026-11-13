import env from '../config/env.js';
import logger from '../config/logger.js';
import { demoIntegrationsEnabled } from '../lib/demoIntegrations.js';
import { scoreMentorForMentee } from './matchingEngine.js';

function buildFallbackExplanation(match, lang) {
  const skills = match.matchedSkills?.slice(0, 5).join(', ');
  const capacity = `${match.capacity.active}/${match.capacity.max}`;
  if (lang === 'en') {
    return [
      `${match.mentorName} and ${match.menteeName} fit at ${match.score}%.`,
      skills ? `Shared skills: ${skills}.` : 'No shared skill is listed yet.',
      `The mentor is carrying ${capacity} mentees.`,
      'The score weighs skill overlap, the same track, and remaining capacity.',
    ].join(' ');
  }
  return [
    `${match.mentorName} và ${match.menteeName} phù hợp ${match.score}%.`,
    skills ? `Kỹ năng chung: ${skills}.` : 'Chưa có kỹ năng trùng tên.',
    `Mentor đang nhận ${capacity} mentee.`,
    'Điểm cân kỹ năng trùng, cùng track và chỗ còn trống.',
  ].join(' ');
}

function safeText(value, maxLength = 120) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function safeList(values, maxItems = 8) {
  return (Array.isArray(values) ? values : [])
    .map((value) => safeText(value, 80))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function buildProviderInput(mentor, mentee, match) {
  return {
    mentorLabel: 'Mentor A',
    menteeLabel: 'Mentee B',
    mentorTrack: safeText(mentor.track, 80) || 'n/a',
    menteeTrack: safeText(mentee.track, 80) || 'n/a',
    expertise: safeList(mentor.expertise),
    interests: safeList(mentee.interests),
    score: match.score,
    matchedSkills: safeList(match.matchedSkills),
    reasons: safeList(match.reasons, 5),
  };
}

/**
 * Optional OpenAI narrative for a mentor–mentee pair. Falls back to rule-based text.
 */
export async function explainMatch(mentor, mentee, lang = 'vi') {
  const match = scoreMentorForMentee(mentor, mentee);
  const language = lang === 'en' ? 'en' : 'vi';

  if (!env.openaiApiKey) {
    return {
      explanation: buildFallbackExplanation(match, language),
      source: demoIntegrationsEnabled() ? 'demo' : 'rules',
      match,
    };
  }

  const providerInput = buildProviderInput(mentor, mentee, match);
  const prompt = `You are a mentorship program advisor for "Trà Đá Mentor".
Write 2-3 concise sentences in Vietnamese explaining why this mentor–mentee pairing makes sense.
Be specific, warm, and professional. Do not invent skills not listed.

Mentor: ${providerInput.mentorLabel}, track: ${providerInput.mentorTrack}, expertise: ${providerInput.expertise.join(', ') || 'n/a'}
Mentee: ${providerInput.menteeLabel}, track: ${providerInput.menteeTrack}, interests: ${providerInput.interests.join(', ') || 'n/a'}
Match score: ${providerInput.score}%
Matched skills: ${providerInput.matchedSkills.join(', ') || 'none'}
Reasons: ${providerInput.reasons.join('; ')}`;

  try {
    const signal = AbortSignal.timeout(env.openaiTimeoutMs);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openaiApiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: env.openaiModel,
        messages: [
          { role: 'system', content: 'Reply in Vietnamese only. Plain text, no markdown.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 220,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      logger.warn(`OpenAI explain failed: ${res.status}`);
      return { explanation: buildFallbackExplanation(match, language), source: 'rules', match };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return {
      explanation: text || buildFallbackExplanation(match, language),
      source: 'openai',
      match,
    };
  } catch (err) {
    logger.warn(`OpenAI explain error: ${err.message}`);
    return { explanation: buildFallbackExplanation(match, language), source: 'rules', match };
  }
}
