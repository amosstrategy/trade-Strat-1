/**
 * IPIP-NEO-120 tab UI — renders and binds events (used from app/index.html).
 */
(function (global) {
  const BL = (de, en) => ({ de, en });

  function renderLikert(q, selected, lang) {
    const labels = IPIP.choiceLabels(lang);
    return `<div class="oejts-likert" role="radiogroup" aria-label="${q.text[lang] || q.text.de}">
      ${[1, 2, 3, 4, 5].map(v => `
        <label>
          <input type="radio" name="ipip-q-${q.num}" value="${v}" data-ipip-answer="${q.num}" ${Number(selected) === v ? "checked" : ""}>
          <span>${labels[v - 1]?.[lang] || labels[v - 1]?.de || v}</span>
        </label>`).join("")}
    </div>`;
  }

  function renderDomainCard(domain, result, notes, lang, T) {
    const meta = IPIP.domainMeta(domain);
    const d = result.domains[domain];
    const pct = d.percentile;
    const note = notes?.compare;
    return `<div class="oejts-dim-card">
      <strong>${meta[lang] || meta.de}</strong>
      <div style="margin:6px 0;font-size:.88rem;color:var(--bone)">${IPIP.levelLabel(d.level, lang)} · ${T(BL("Perzentil", "Percentile"))} ~${pct}</div>
      <div class="oejts-bar" title="${d.average}/5">
        <span style="width:${Math.round((d.average / 5) * 100)}%"></span>
        <span style="flex:1"></span>
      </div>
      <div style="font-size:.75rem;color:var(--muted)">${T(BL("Mittel", "Mean"))}: ${d.average} / 5</div>
      <p style="margin:8px 0 0;font-size:.78rem;color:var(--muted);line-height:1.45">${T(notes?.summary)}</p>
      ${note ? `<p style="margin:8px 0 0;font-size:.78rem;color:var(--accent);line-height:1.45">${T(note)}</p>` : ""}
    </div>`;
  }

  function renderFacetGrid(domain, result, lang, T) {
    const meta = IPIP.domainMeta(domain);
    let html = `<details class="ipip-facet-details" style="margin-top:10px"><summary style="cursor:pointer;color:var(--cyber-cyan);font-size:.82rem">${T(BL("30 Facetten anzeigen", "Show 30 facets"))} — ${meta[lang] || meta.de}</summary><div class="ipip-facet-grid">`;
    for (let f = 1; f <= 6; f++) {
      const fd = result.facets[domain][f];
      const name = IPIP.facetName(domain, f, lang);
      html += `<div class="ipip-facet-card">
        <strong>${name}</strong>
        <span>${fd.average}/5 · ~${fd.percentile}%</span>
      </div>`;
    }
    return html + "</div></details>";
  }

  function renderProfilePanel(profile, lang, T, hdSummary, jungSummary, b5Summary) {
    return `
      <section class="panel oejts-profile-panel">
        <h3 style="margin:0 0 10px;font-size:.95rem;color:var(--cyber-cyan)">${T(BL("Profil", "Profile"))}</h3>
        <div class="small-card oejts-profile-status">
          <strong>${profile.name}</strong><br>
          <span class="profile-lens-row" style="margin-top:8px">
            <span class="lens-badge lens-hd"><strong>HD</strong> ${hdSummary}</span>
            <span class="lens-badge lens-jung"><strong>Jung</strong> ${jungSummary}</span>
            <span class="lens-badge lens-b5"><strong>OCEAN</strong> ${b5Summary}</span>
          </span>
        </div>
      </section>`;
  }

  function renderIpipTab(ctx) {
    const { profile, answers, step, qIndex, lang, T, hdSummary, jungSummary, b5Summary } = ctx;
    const total = IPIP.TOTAL;
    const answered = IPIP.answeredCount(answers);
    const profilePanel = renderProfilePanel(profile, lang, T, hdSummary, jungSummary, b5Summary);

    if (step === "intro") {
      return `${profilePanel}<section class="panel">
        <h2>${T(BL("Big Five · IPIP-NEO-120", "Big Five · IPIP-NEO-120"))}</h2>
        <p class="oejts-intro">${T(BL(
          "Johnson IPIP-NEO-120 (2014) — Public Domain, wissenschaftlich etabliertes Five-Factor-Modell. Vollständiger Test: 120 Items, 5 Domänen (OCEAN), 30 Facetten — keine Kurzversion, kein IPIP-50. Ergebnis und Export erst nach allen 120 Antworten.",
          "Johnson IPIP-NEO-120 (2014) — Public Domain, established Five-Factor Model. Full test only: 120 items, 5 domains (OCEAN), 30 facets — no short form, no IPIP-50. Results and export only after all 120 answers."
        ))}</p>
        <div class="small-card">${T(BL("Vollständig · ca. 10–15 Minuten · 120/120 für Auswertung · pro Profil lokal gespeichert", "Full test · about 10–15 minutes · 120/120 required for scoring · saved locally per profile"))}</div>
        <div class="oejts-nav">
          <button type="button" class="btn-primary" id="ipipStart">${T(BL("Test starten", "Start test"))}</button>
          ${answered ? `<button type="button" id="ipipContinue">${T(BL(`Fortsetzen (${answered}/${total})`, `Continue (${answered}/${total})`))}</button>` : ""}
          ${IPIP.isTestComplete(answers) ? `<button type="button" id="ipipShowResults">${T(BL("Ergebnis anzeigen", "Show results"))}</button>` : ""}
        </div>
        <p class="oejts-attrib">${IPIP.ATTRIBUTION}</p>
      </section>`;
    }

    if (step === "quiz") {
      const q = IPIP.questions[qIndex];
      const selected = answers[q.num];
      const labels = IPIP.choiceLabels(lang);
      return `${profilePanel}<section class="panel">
        <h2>${T(BL("Frage", "Question"))} ${qIndex + 1} / ${total}</h2>
        <div class="oejts-progress"><span style="width:${Math.round(((qIndex + (selected ? 1 : 0)) / total) * 100)}%"></span></div>
        <div class="oejts-qcard">
          <div class="oejts-qtitle">${q.text[lang] || q.text.de}</div>
          ${renderLikert(q, selected, lang)}
          <p style="font-size:.78rem;color:var(--muted);text-align:center;margin-top:10px">${T(BL("1 = sehr unzutreffend · 5 = sehr zutreffend", "1 = very inaccurate · 5 = very accurate"))}</p>
        </div>
        <div class="oejts-nav">
          <button type="button" id="ipipPrev" ${qIndex === 0 ? "disabled" : ""}>←</button>
          <button type="button" id="ipipNext">${qIndex >= total - 1 ? T(BL("Auswerten", "Score")) : T(BL("Weiter", "Next"))}</button>
          <button type="button" id="ipipQuit">${T(BL("Pause", "Pause"))}</button>
        </div>
        <p class="oejts-attrib">${IPIP.ATTRIBUTION}</p>
      </section>`;
    }

    const result = IPIP.generateResult(answers);
    const record = ctx.getProfileRecord(profile.id);
    const hdSnap = IPIPInterpret.buildHdSnapshot(profile, record);
    const interp = IPIPInterpret.buildInterpretation(result, hdSnap, lang);
    const hdFeatures = IPIP.extractHdFeatures(record?.chart, profile);

    const domainCards = IPIP.DOMAIN_ORDER.map(domain =>
      renderDomainCard(domain, result, interp.domainNotes[domain], lang, T)
    ).join("");

    const facetBlocks = IPIP.DOMAIN_ORDER.map(domain => renderFacetGrid(domain, result, lang, T)).join("");

    const bridgeHtml = interp.bridgeNotes.map(n => `<li>${T(n)}</li>`).join("");

    const hdFeatureHtml = hdFeatures ? `<div class="small-card" style="margin-top:12px;font-size:.82rem;line-height:1.5">
      <strong>${T(BL("HD-Feature-Vektor (Forschung)", "HD feature vector (research)"))}</strong><br>
      ${T(BL("Typ", "Type"))}: ${hdFeatures.type || "—"} ·
      ${T(BL("Autorität", "Authority"))}: ${hdFeatures.authority || "—"} ·
      ${T(BL("Definiert", "Defined"))}: ${hdFeatures.definedCenterCount}/9 ·
      ${T(BL("Kanäle", "Channels"))}: ${hdFeatures.channelCount}
    </div>` : "";

    return `${profilePanel}<section class="panel">
      <h2>${T(BL("Dein Big-Five-Profil (OCEAN)", "Your Big Five profile (OCEAN)"))}</h2>
      <p style="color:var(--muted);line-height:1.55;max-width:68ch">${T(BL(
        "Percentile basieren auf Johnson-Internet-Stichproben-Normen (approx.). Explorative HD-Vergleiche — keine validierte Zuordnung.",
        "Percentiles based on Johnson internet-sample norms (approx.). Exploratory HD comparisons — not a validated mapping."
      ))}</p>
      <div class="oejts-dim-grid">${domainCards}</div>
      ${facetBlocks}
      <div class="oejts-deutung-panel">
        <h3>${T(BL("HD-Brücke (explorativ)", "HD bridge (exploratory)"))}</h3>
        <ul class="oejts-chart-notes">${bridgeHtml}</ul>
        ${hdFeatureHtml}
        <p style="margin:10px 0 0;font-size:.82rem;color:var(--muted);line-height:1.48">${T(BL(
          "Für Probanden-Forschung: Admin (?admin=1) → Big-Five/HD-Export.",
          "For proband research: Admin (?admin=1) → Big Five/HD export."
        ))}</p>
      </div>
      <div class="oejts-nav">
        <button type="button" id="ipipRetake">${T(BL("Neu starten", "Retake"))}</button>
        <button type="button" id="ipipReview">${T(BL("Antworten prüfen", "Review answers"))}</button>
        <button type="button" id="ipipExport">${T(BL("JSON exportieren", "Export JSON"))}</button>
      </div>
      <p class="oejts-attrib">${IPIP.ATTRIBUTION}</p>
    </section>`;
  }

  function bindIpipEvents(ctx) {
    const { answers, setAnswers, step, setStep, qIndex, setQIndex, flush, rerender, T, profile, getProfileRecord } = ctx;

    const firstUnanswered = () => {
      const idx = IPIP.questions.findIndex(q => !(answers[q.num] >= 1 && answers[q.num] <= 5));
      return idx >= 0 ? idx : 0;
    };

    document.querySelectorAll("[data-ipip-answer]").forEach(input => {
      input.addEventListener("change", e => {
        setAnswers({ ...answers, [Number(e.target.dataset.ipipAnswer)]: Number(e.target.value) });
        flush();
        rerender();
      });
    });

    const click = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };

    click("ipipStart", () => { setStep("quiz"); setQIndex(0); rerender(); });
    click("ipipContinue", () => { setStep("quiz"); setQIndex(firstUnanswered()); rerender(); });
    click("ipipShowResults", () => { setStep("results"); rerender(); });
    click("ipipPrev", () => { setQIndex(Math.max(0, qIndex - 1)); rerender(); });
    click("ipipNext", () => {
      const q = IPIP.questions[qIndex];
      if (!(answers[q.num] >= 1 && answers[q.num] <= 5)) {
        alert(T(BL("Bitte eine Antwort wählen.", "Please select an answer.")));
        return;
      }
      if (qIndex >= IPIP.TOTAL - 1) {
        setStep(IPIP.isTestComplete(answers) ? "results" : "intro");
        flush();
      } else {
        setQIndex(qIndex + 1);
      }
      rerender();
    });
    click("ipipQuit", () => { setStep("intro"); flush(); rerender(); });
    click("ipipRetake", () => {
      if (!confirm(T(BL("Alle Big-Five-Antworten für dieses Profil löschen?", "Delete all Big Five answers for this profile?")))) return;
      setAnswers({});
      setQIndex(0);
      setStep("intro");
      flush();
      rerender();
    });
    click("ipipReview", () => { setStep("quiz"); setQIndex(0); rerender(); });
    click("ipipExport", () => {
      const record = getProfileRecord(profile.id);
      const bundle = IPIP.exportResearchBundle(profile.id, record, profile, answers);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `paradise-b5-hd-${profile.id}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  global.IPIPUI = { renderIpipTab, bindIpipEvents, BL };
})(typeof window !== "undefined" ? window : globalThis);
