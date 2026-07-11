/**
 * IPIP-NEO-120 — Johnson (2014), Public Domain
 * https://ipip.ori.org/ · https://doi.org/10.1016/j.jrp.2014.05.003
 *
 * Policy: full 120-item instrument only — no IPIP-50 or other short forms.
 * Scoring, facets, and research export require 120/120 answers.
 */
(function (global) {
  const BL = (de, en) => ({ de, en });
  const data = global.IPIP_DATA || {};
  const questions = (data.questions || []).map(q => ({ ...q }));
  const TOTAL = questions.length;

  const DOMAIN_ORDER = ["N", "E", "O", "A", "C"];

  const ATTRIBUTION = "IPIP Public Domain · Johnson IPIP-NEO-120 (2014) · ipip.ori.org";

  // Johnson internet-sample domain means (approx.) for percentile mapping — Phase 3
  const NORM_MEANS = { N: 2.91, E: 3.25, O: 3.46, A: 3.72, C: 3.37 };
  const NORM_SDS = { N: 0.72, E: 0.72, O: 0.68, A: 0.63, C: 0.71 };

  function getChoices(lang) {
    const c = data.choices?.[lang] || data.choices?.en;
    return c || { plus: [], minus: [] };
  }

  function choiceLabels(lang) {
    const c = getChoices(lang);
    return (c.plus || []).map((item, i) => BL(item.text, getChoices("en").plus[i]?.text || item.text));
  }

  function scoreItem(question, rawAnswer) {
    const val = Number(rawAnswer);
    if (!val || val < 1 || val > 5) return null;
    return question.keyed === "plus" ? val : 6 - val;
  }

  function answeredCount(answers) {
    return questions.filter(q => answers[q.num] >= 1 && answers[q.num] <= 5).length;
  }

  function isTestComplete(answers) {
    return answeredCount(answers) >= TOTAL;
  }

  function buildScoredAnswers(answers) {
    return questions.map(q => {
      const raw = answers[q.num];
      const score = scoreItem(q, raw);
      if (score == null) return null;
      return { domain: q.domain, facet: q.facet, score, num: q.num, raw };
    }).filter(Boolean);
  }

  function reduceFactors(scored) {
    const out = {};
    scored.forEach(b => {
      if (!out[b.domain]) out[b.domain] = { score: 0, count: 0, facet: {} };
      out[b.domain].score += b.score;
      out[b.domain].count += 1;
      if (!out[b.domain].facet[b.facet]) out[b.domain].facet[b.facet] = { score: 0, count: 0 };
      out[b.domain].facet[b.facet].score += b.score;
      out[b.domain].facet[b.facet].count += 1;
    });
    return out;
  }

  function levelFromAverage(avg) {
    if (avg > 3.35) return "high";
    if (avg < 2.65) return "low";
    return "neutral";
  }

  function percentileFromAverage(domain, avg) {
    const mean = NORM_MEANS[domain] ?? 3.2;
    const sd = NORM_SDS[domain] ?? 0.7;
    const z = (avg - mean) / sd;
    const pct = Math.round(normalCDF(z) * 100);
    return Math.max(1, Math.min(99, pct));
  }

  function normalCDF(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  function generateResult(answers) {
    const scored = buildScoredAnswers(answers);
    const reduced = reduceFactors(scored);
    const domains = {};
    const facets = {};

    DOMAIN_ORDER.forEach(domain => {
      const block = reduced[domain] || { score: 0, count: 0, facet: {} };
      const avg = block.count ? block.score / block.count : 0;
      domains[domain] = {
        score: block.score,
        count: block.count,
        average: Math.round(avg * 100) / 100,
        level: levelFromAverage(avg),
        percentile: percentileFromAverage(domain, avg)
      };
      facets[domain] = {};
      for (let f = 1; f <= 6; f++) {
        const fb = block.facet[f] || { score: 0, count: 0 };
        const favg = fb.count ? fb.score / fb.count : 0;
        facets[domain][f] = {
          score: fb.score,
          count: fb.count,
          average: Math.round(favg * 100) / 100,
          level: levelFromAverage(favg),
          percentile: percentileFromAverage(domain, favg)
        };
      }
    });

    return { domains, facets, answered: scored.length, total: TOTAL };
  }

  function levelLabel(level, lang) {
    const map = {
      high: BL("hoch", "high"),
      low: BL("niedrig", "low"),
      neutral: BL("mittel", "average")
    };
    const v = map[level] || map.neutral;
    return typeof v === "string" ? v : (v[lang] || v.de);
  }

  function domainMeta(domain) {
    return data.domainMeta?.[domain] || { de: domain, en: domain };
  }

  function facetName(domain, facet, lang) {
    const names = data.facetNames?.[domain]?.[facet - 1];
    if (!names) return `${domain}${facet}`;
    return names[lang] || names.de;
  }

  function extractHdFeatures(chart, display) {
    if (!chart?.definedCenters) return null;
    const allCenters = ["Head", "Ajna", "Throat", "G", "Ego", "Spleen", "Solar", "Sacral", "Root"];
    const defined = chart.definedCenters || [];
    const open = allCenters.filter(c => !defined.includes(c));
    return {
      type: chart.type || display?.typeKey || null,
      authority: chart.authority?.de || chart.authority || null,
      strategy: chart.strategy?.de || chart.strategy || null,
      profile: chart.profile || null,
      definedCenterCount: defined.length,
      openCenterCount: open.length,
      definedCenters: defined,
      openCenters: open,
      channelCount: (chart.channels || []).length,
      hasSacral: defined.includes("Sacral"),
      hasSolar: defined.includes("Solar"),
      hasThroat: defined.includes("Throat"),
      hasEmotionalAuthority: String(chart.authority?.de || chart.authority || "").toLowerCase().includes("emotion")
    };
  }

  function exportResearchBundle(profileId, profileRecord, chartDisplay, answers) {
    const result = isTestComplete(answers) ? generateResult(answers) : null;
    const hd = extractHdFeatures(profileRecord?.chart || chartDisplay, chartDisplay);
    return {
      profileId,
      exportedAt: new Date().toISOString(),
      instrument: "IPIP-NEO-120",
      license: "Public Domain (IPIP)",
      hdFeatures: hd,
      bigFive: result ? {
        domains: result.domains,
        facets: result.facets
      } : null,
      answersComplete: isTestComplete(answers)
    };
  }

  global.IPIP = {
    BL,
    TOTAL,
    questions,
    DOMAIN_ORDER,
    ATTRIBUTION,
    getChoices,
    choiceLabels,
    scoreItem,
    answeredCount,
    isTestComplete,
    generateResult,
    levelLabel,
    domainMeta,
    facetName,
    extractHdFeatures,
    exportResearchBundle
  };
})(typeof window !== "undefined" ? window : globalThis);
