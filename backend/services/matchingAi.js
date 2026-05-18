import env from '../config/env.js';
import logger from '../config/logger.js';
import { scoreMentorForMentee } from './matchingEngine.js';

function buildFallbackExplanation(match) {
  const parts = [
    `${match.mentorName} và ${match.menteeName} có điểm phù hợp **${match.score}%**.`,
    match.reasons?.length ? match.reasons.join('. ') + '.' : '',
    match.matchedSkills?.length
      ? `Kỹ năng chung: ${match.matchedSkills.slice(0, 5).join(', ')}.`
      : '',
    `Mentor đang nhận ${match.capacity.active}/${match.capacity.max} mentee.`,
  ].filter(Boolean);
  return parts.join(' ');
}

/**
 * Optional OpenAI narrative for a mentor–mentee pair. Falls back to rule-based text.
 */
export async function explainMatch(mentor, mentee) {
  const match = scoreMentorForMentee(mentor, mentee);

  if (!env.openaiApiKey) {
    return {
      explanation: buildFallbackExplanation(match),
      source: 'rules',
      match,
    };
  }

  const prompt = `You are a mentorship program advisor for "Trà Đá Mentor".
Write 2-3 concise sentences in Vietnamese explaining why this mentor–mentee pairing makes sense.
Be specific, warm, and professional. Do not invent skills not listed.

Mentor: ${mentor.name}, track: ${mentor.track || 'n/a'}, expertise: ${(mentor.expertise || []).join(', ') || 'n/a'}
Mentee: ${mentee.name || mentee.email}, track: ${mentee.track || 'n/a'}, interests: ${(mentee.interests || []).join(', ') || 'n/a'}
Match score: ${match.score}%
Matched skills: ${match.matchedSkills.join(', ') || 'none'}
Reasons: ${match.reasons.join('; ')}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.openaiApiKey}`,
      },
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
      const errText = await res.text();
      logger.warn(`OpenAI explain failed: ${res.status} ${errText}`);
      return { explanation: buildFallbackExplanation(match), source: 'rules', match };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return {
      explanation: text || buildFallbackExplanation(match),
      source: 'openai',
      match,
    };
  } catch (err) {
    logger.warn(`OpenAI explain error: ${err.message}`);
    return { explanation: buildFallbackExplanation(match), source: 'rules', match };
  }
}
