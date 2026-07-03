/**
 * OEJTS 1.2 — Open Extended Jungian Type Scales
 * Questions & scoring based on openpsychometrics.org/tests/OEJTS/
 * Engine logic aligned with github.com/openjung/core (MIT)
 * License: CC BY-NC-SA 4.0 for item text — attribution required.
 */
(function (global) {
  const BL = (de, en) => ({ de, en });
  const THRESHOLD = 24;
  const SCORE_MIN = 8;
  const SCORE_MAX = 40;

  const DIMENSION_META = {
    EI: {
      key: "EI",
      left: "E",
      right: "I",
      leftLabel: BL("Extraversion", "Extraversion"),
      rightLabel: BL("Introversion", "Introversion"),
      leftHint: BL("Energie nach aussen, durch Interaktion geladen", "Energy outward, recharged through interaction"),
      rightHint: BL("Energie nach innen, durch Ruhe geladen", "Energy inward, recharged through solitude")
    },
    SN: {
      key: "SN",
      left: "S",
      right: "N",
      leftLabel: BL("Sensing", "Sensing"),
      rightLabel: BL("Intuition", "Intuition"),
      leftHint: BL("Konkret, detailorientiert, erfahrungsnah", "Concrete, detail-focused, experience-led"),
      rightHint: BL("Muster, Moeglichkeiten, Zusammenhaenge", "Patterns, possibilities, connections")
    },
    TF: {
      key: "TF",
      left: "F",
      right: "T",
      leftLabel: BL("Feeling", "Feeling"),
      rightLabel: BL("Thinking", "Thinking"),
      leftHint: BL("Werte, Harmonie, menschliche Wirkung", "Values, harmony, human impact"),
      rightHint: BL("Logik, Fairness, strukturierte Analyse", "Logic, fairness, structured analysis")
    },
    JP: {
      key: "JP",
      left: "J",
      right: "P",
      leftLabel: BL("Judging", "Judging"),
      rightLabel: BL("Perceiving", "Perceiving"),
      leftHint: BL("Struktur, Entscheidung, Abschluss", "Structure, decision, closure"),
      rightHint: BL("Flexibilitaet, Offenheit, Improvisation", "Flexibility, openness, improvisation")
    }
  };

  const dimensionQuestions = {
    EI: [3, 7, 11, 15, 19, 23, 27, 31],
    SN: [4, 8, 12, 16, 20, 24, 28, 32],
    TF: [2, 6, 10, 14, 18, 22, 26, 30],
    JP: [1, 5, 9, 13, 17, 21, 25, 29]
  };

  const questions = [
    { id: 1, dimension: "JP", title: BL("Wie trackst du Aufgaben?", "How do you track tasks?"), left: BL("Macht Listen", "Makes lists"), right: BL("Verlaesst sich aufs Gedaechtnis", "Relies on memory") },
    { id: 2, dimension: "TF", title: BL("Wie gehst du mit neuer Info um?", "How do you approach new information?"), left: BL("Will glauben", "Wants to believe"), right: BL("Skeptisch", "Skeptical") },
    { id: 3, dimension: "EI", title: BL("Wie fuehlst du dich allein?", "How do you feel about being alone?"), left: BL("Langweilt sich allein", "Bored by time alone"), right: BL("Braucht Zeit fuer sich", "Needs time alone") },
    { id: 4, dimension: "SN", title: BL("Wie siehst du den Status quo?", "How do you view the status quo?"), left: BL("Akzeptiert, wie es ist", "Accepts things as they are"), right: BL("Unzufrieden mit dem Ist", "Unsatisfied with the way things are") },
    { id: 5, dimension: "JP", title: BL("Wie organisierst du deinen Raum?", "How do you organize your space?"), left: BL("Haelt Ordnung", "Keeps a clean room"), right: BL("Legt Dinge irgendwohin", "Just puts stuff wherever") },
    { id: 6, dimension: "TF", title: BL("Wie siehst du logisches Denken?", "How do you view logical thinking?"), left: BL("«Roboterhaft» ist Beleidigung", "Thinks \"robotic\" is an insult"), right: BL("Strebt mechanisches Denken an", "Strives to have a mechanical mind") },
    { id: 7, dimension: "EI", title: BL("Wie ist dein Energielevel?", "What is your energy level like?"), left: BL("Energiegeladen", "Energetic"), right: BL("Gelassen", "Mellow") },
    { id: 8, dimension: "SN", title: BL("Welchen Testtyp bevorzugst du?", "What type of test do you prefer?"), left: BL("Multiple Choice", "Prefers multiple choice test"), right: BL("Essay-Antworten", "Prefers essay answers") },
    { id: 9, dimension: "JP", title: BL("Wie wuerdest du deinen Lebensstil nennen?", "How would you describe your lifestyle?"), left: BL("Organisiert", "Organized"), right: BL("Chaotisch", "Chaotic") },
    { id: 10, dimension: "TF", title: BL("Wie gehst du mit Kritik um?", "How do you handle criticism?"), left: BL("Leicht verletzt", "Easily hurt"), right: BL("Dickes Fell", "Thick-skinned") },
    { id: 11, dimension: "EI", title: BL("Wo arbeitest du am besten?", "How do you work best?"), left: BL("Am besten in Gruppen", "Works best in groups"), right: BL("Am besten allein", "Works best alone") },
    { id: 12, dimension: "SN", title: BL("Wo liegt dein Zeitfokus?", "Where is your focus in time?"), left: BL("Fokus auf Vergangenheit", "Focused on the past"), right: BL("Fokus auf Zukunft", "Focused on the future") },
    { id: 13, dimension: "JP", title: BL("Wann planst du?", "When do you make plans?"), left: BL("Plant weit voraus", "Plans far ahead"), right: BL("Plant in letzter Minute", "Plans at the last minute") },
    { id: 14, dimension: "TF", title: BL("Was suchst du bei anderen?", "What do you seek from others?"), left: BL("Will Liebe", "Wants people's love"), right: BL("Will Respekt", "Wants people's respect") },
    { id: 15, dimension: "EI", title: BL("Wie wirken Partys auf dich?", "How do parties make you feel?"), left: BL("Wird durch Partys angefeuert", "Gets fired up by parties"), right: BL("Wird durch Partys muede", "Gets worn out by parties") },
    { id: 16, dimension: "SN", title: BL("In der Gruppe neigst du dazu...", "In a group, do you tend to..."), left: BL("Dazuzugehoeren", "Fits in"), right: BL("Herauszustechen", "Stands out") },
    { id: 17, dimension: "JP", title: BL("Wie triffst du Entscheidungen?", "How do you approach decisions?"), left: BL("Commitment", "Commits"), right: BL("Optionen offen halten", "Keeps options open") },
    { id: 18, dimension: "TF", title: BL("Worin moechtest du gut sein?", "What would you like to be good at?"), left: BL("Menschen helfen", "Wants to be good at fixing people"), right: BL("Dinge reparieren", "Wants to be good at fixing things") },
    { id: 19, dimension: "EI", title: BL("In Gespraechen...", "In conversations, do you..."), left: BL("Redet mehr", "Talks more"), right: BL("Hoert mehr zu", "Listens more") },
    { id: 20, dimension: "SN", title: BL("Beim Erzaehlen...", "When telling a story, do you..."), left: BL("Beschreibt was passierte", "Describes what happened"), right: BL("Beschreibt was es bedeutete", "Describes what it meant") },
    { id: 21, dimension: "JP", title: BL("Wann erledigst du Aufgaben?", "When do you complete tasks?"), left: BL("Sofort erledigen", "Gets work done right away"), right: BL("Prokrastiniert", "Procrastinates") },
    { id: 22, dimension: "TF", title: BL("Wie entscheidest du?", "How do you make decisions?"), left: BL("Folgt dem Herzen", "Follows the heart"), right: BL("Folgt dem Kopf", "Follows the head") },
    { id: 23, dimension: "EI", title: BL("Was machst du am Wochenende?", "What do you prefer on weekends?"), left: BL("Geht aus", "Goes out on the town"), right: BL("Bleibt zu Hause", "Stays at home") },
    { id: 24, dimension: "SN", title: BL("Beim Lernen willst du...", "When learning something new, what do you want?"), left: BL("Die Details", "Wants the details"), right: BL("Das grosse Bild", "Wants the big picture") },
    { id: 25, dimension: "JP", title: BL("Neue Situationen...", "How do you handle new situations?"), left: BL("Bereitet vor", "Prepares"), right: BL("Improvisiert", "Improvises") },
    { id: 26, dimension: "TF", title: BL("Worauf basiert Moral?", "What is morality based on?"), left: BL("Mitgefuehl", "Bases morality on compassion"), right: BL("Gerechtigkeit", "Bases morality on justice") },
    { id: 27, dimension: "EI", title: BL("Wie laut ist deine Stimme?", "How loud is your natural voice?"), left: BL("Laut reden ist natuerlich", "Yelling comes naturally"), right: BL("Schwer laut zu schreien", "Finds it difficult to yell loudly") },
    { id: 28, dimension: "SN", title: BL("Wie gehst du an Wissen heran?", "How do you approach knowledge?"), left: BL("Empirisch", "Empirical"), right: BL("Theoretisch", "Theoretical") },
    { id: 29, dimension: "JP", title: BL("Was treibt dich mehr?", "What drives you more?"), left: BL("Arbeitet hart", "Works hard"), right: BL("Spielt hart", "Plays hard") },
    { id: 30, dimension: "TF", title: BL("Wie stehst du zu Emotionen?", "How do you relate to emotions?"), left: BL("Schaetzt Emotionen", "Values emotions"), right: BL("Unwohl mit Emotionen", "Uncomfortable with emotions") },
    { id: 31, dimension: "EI", title: BL("Wie stehst du im Rampenlicht?", "How do you feel about being in the spotlight?"), left: BL("Mag auftreten", "Likes to perform"), right: BL("Meidet oeffentliches Sprechen", "Avoids public speaking") },
    { id: 32, dimension: "SN", title: BL("Welche Fragen interessieren dich?", "What questions interest you most?"), left: BL("Wer / Was / Wann", "Likes to know \"who/what/when\""), right: BL("Warum", "Likes to know \"why\"") }
  ];

  const sortedQuestions = [...questions].sort((a, b) => a.id - b.id);
  const questionById = Object.fromEntries(questions.map(q => [q.id, q]));

  const TYPE_DESCRIPTIONS = {
    INTJ: BL("Strategisch, unabhaengig, visionaer — plant langfristig und setzt Ideen strukturiert um.", "Strategic, independent, visionary — plans long-term and implements ideas with structure."),
    INTP: BL("Analytisch, neugierig, konzeptuell — liebt Modelle und logische Konsistenz.", "Analytical, curious, conceptual — loves models and logical consistency."),
    ENTJ: BL("Fuehrend, entscheidungsfreudig, zielorientiert — organisiert Menschen und Ressourcen.", "Decisive, goal-oriented leader — organizes people and resources."),
    ENTP: BL("Debatierfreudig, erfinderisch, schnell im Denken — testet Ideen durch Argument.", "Debate-loving, inventive, quick-thinking — tests ideas through argument."),
    INFJ: BL("Tief, empathisch, zielgerichtet — spuert Bedeutung und will Wirkung im Grossen.", "Deep, empathetic, purpose-driven — senses meaning and seeks large-scale impact."),
    INFP: BL("Idealistisch, wertebasiert, kreativ — handelt aus innerer Ueberzeugung.", "Idealistic, values-led, creative — acts from inner conviction."),
    ENFJ: BL("Verbindend, motivierend, menschenorientiert — sieht Potenzial in anderen.", "Connecting, motivating, people-oriented — sees potential in others."),
    ENFP: BL("Enthusiastisch, assoziativ, warm — erkundet Moeglichkeiten mit anderen.", "Enthusiastic, associative, warm — explores possibilities with others."),
    ISTJ: BL("Zuverlaessig, pflichtbewusst, detailgenau — haelt Systeme am Laufen.", "Reliable, dutiful, detail-precise — keeps systems running."),
    ISFJ: BL("Fuersorglich, loyal, praktisch — schuetzt Stabilitaet fuer Nahestehende.", "Caring, loyal, practical — protects stability for close ones."),
    ESTJ: BL("Organisatorisch, direkt, ergebnisorientiert — setzt Regeln und Plaene durch.", "Organizational, direct, results-focused — enforces rules and plans."),
    ESFJ: BL("Harmoniebeduerftig, serviceorientiert, sozial — haelt Gruppen zusammen.", "Harmony-seeking, service-oriented, social — holds groups together."),
    ISTP: BL("Pragmatisch, handwerklich, cool — loest Probleme durch Tun und Anpassung.", "Pragmatic, hands-on, cool — solves problems through action and adaptation."),
    ISFP: BL("Sensibel, aesthetisch, im Moment — lebt Werte leise und authentisch.", "Sensitive, aesthetic, in-the-moment — lives values quietly and authentically."),
    ESTP: BL("Handlungsorientiert, direkt, risikofreudig — reagiert schnell auf die Realitaet.", "Action-oriented, direct, risk-tolerant — reacts quickly to reality."),
    ESFP: BL("Lebensfroh, spontan, praesent — bringt Energie und Freude ins Hier und Jetzt.", "Life-loving, spontaneous, present — brings energy and joy to the here and now.")
  };

  function calculateScores(answers) {
    const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    for (const [dim, ids] of Object.entries(dimensionQuestions)) {
      scores[dim] = ids.reduce((sum, id) => sum + (answers[id] ?? 0), 0);
    }
    return scores;
  }

  function determineType(scores) {
    const e_i = scores.EI > THRESHOLD ? "I" : "E";
    const s_n = scores.SN > THRESHOLD ? "N" : "S";
    const t_f = scores.TF > THRESHOLD ? "T" : "F";
    const j_p = scores.JP > THRESHOLD ? "P" : "J";
    return `${e_i}${s_n}${t_f}${j_p}`;
  }

  function calculatePercentages(scores) {
    const toRight = score => Math.round(((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100);
    const eiR = toRight(scores.EI);
    const snR = toRight(scores.SN);
    const tfR = toRight(scores.TF);
    const jpR = toRight(scores.JP);
    return {
      E: 100 - eiR, I: eiR,
      S: 100 - snR, N: snR,
      F: 100 - tfR, T: tfR,
      J: 100 - jpR, P: jpR
    };
  }

  function getConfidenceLevel(distance) {
    if (distance >= 12) return "strong";
    if (distance >= 6) return "moderate";
    if (distance >= 2) return "slight";
    return "balanced";
  }

  function calculateConfidence(scores) {
    const dims = ["EI", "SN", "TF", "JP"];
    const out = {};
    let totalDistance = 0;
    dims.forEach(dim => {
      const distance = Math.abs(scores[dim] - THRESHOLD);
      totalDistance += distance;
      out[dim] = { level: getConfidenceLevel(distance), distance, percentage: Math.round((distance / 16) * 100) };
    });
    out.clarityIndex = Math.round((totalDistance / 64) * 100);
    return out;
  }

  function generateResult(answers) {
    const scores = calculateScores(answers);
    const type = determineType(scores);
    const percentages = calculatePercentages(scores);
    const confidence = calculateConfidence(scores);
    const preferences = {
      EI: scores.EI > THRESHOLD ? "I" : "E",
      SN: scores.SN > THRESHOLD ? "N" : "S",
      TF: scores.TF > THRESHOLD ? "T" : "F",
      JP: scores.JP > THRESHOLD ? "P" : "J"
    };
    return { type, scores, percentages, confidence, preferences };
  }

  function isTestComplete(answers) {
    return sortedQuestions.every(q => answers[q.id] >= 1 && answers[q.id] <= 5);
  }

  function answeredCount(answers) {
    return sortedQuestions.filter(q => answers[q.id] >= 1 && answers[q.id] <= 5).length;
  }

  function getTypeDescription(type) {
    return TYPE_DESCRIPTIONS[type] || BL("Kein Standardprofil hinterlegt.", "No standard profile on file.");
  }

  function confidenceLabel(level, lang) {
    const map = {
      strong: BL("Starke Praeferenz", "Strong preference"),
      moderate: BL("Moderate Praeferenz", "Moderate preference"),
      slight: BL("Leichte Praeferenz", "Slight preference"),
      balanced: BL("Ausgewogen", "Balanced")
    };
    const entry = map[level] || map.balanced;
    return entry[lang] || entry.de;
  }

  global.OEJTS = {
    ATTRIBUTION: "OEJTS 1.2 · Open Psychometrics · CC BY-NC-SA 4.0 · openpsychometrics.org/tests/OEJTS/",
    TOTAL: 32,
    THRESHOLD,
    DIMENSION_META,
    dimensionQuestions,
    questions,
    sortedQuestions,
    questionById,
    calculateScores,
    determineType,
    calculatePercentages,
    calculateConfidence,
    generateResult,
    isTestComplete,
    answeredCount,
    getTypeDescription,
    confidenceLabel,
    TYPE_DESCRIPTIONS
  };
})(typeof window !== "undefined" ? window : globalThis);
