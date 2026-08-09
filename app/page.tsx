"use client";

import { useRef, useState } from "react";
import { jsPDF } from "jspdf";

type ModelData = {
  id: string;
  name: string;
  street: string;
  city: string;
  birth: string;
  birthText: string;
  email: string;
  instagram: string;
  sameContact: boolean;
  guardianName: string;
  guardianEmail: string;
  modelSignature: string;
  guardianSignature: string;
};

const consentText = "Ich erkläre mich damit einverstanden, dass die von Chris Franz Design aufgenommenen Fotos für Portfolio, Website, Social Media (z. B. Instagram/Facebook), Ausstellungen und Eigenwerbung verwendet werden dürfen. Der Verkauf und die kommerzielle Weitergabe der Fotos an Dritte sind ausgeschlossen. Alle Fotos werden ausschließlich in digitaler Form an das jeweilige Model übermittelt. Diese Einwilligung kann für zukünftige Nutzungen widerrufen werden. Bereits veröffentlichte Medien bleiben hiervon unberührt, soweit gesetzlich zulässig.";
const imageTerms = "Das Shooting erfolgt auf TFP-Basis. Eine Vergütung in Geld erfolgt nicht. Als Gegenleistung für die Mitwirkung erhält jedes Model mindestens fünf von Chris Franz Design ausgewählte und vollständig bearbeitete Fotos ohne Wasserzeichen. Die Übermittlung erfolgt ausschließlich digital. Nach individueller Absprache können dem Model weitere vollständig bearbeitete Fotos ohne Wasserzeichen unentgeltlich oder zu gesondert vereinbarten Bedingungen zur Verfügung gestellt werden. Ein Anspruch auf die Herausgabe weiterer Bilder besteht nicht. Auswahl und Bearbeitungsstil der Bilder liegen bei Chris Franz Design. Unbearbeitete Aufnahmen und RAW-Dateien werden nicht herausgegeben. Das Model erhält an den übermittelten Bildern ein einfaches, nicht übertragbares und nicht kommerzielles Nutzungsrecht für private Zwecke, das eigene Portfolio und die eigenen Social-Media-Profile. Bei einer Veröffentlichung ist Chris Franz Design als Fotograf zu nennen oder zu verlinken. Weitere gemeinsame Shootings oder Projekte können nach gegenseitiger Absprache vereinbart werden; eine Verpflichtung hierzu besteht für keine der Parteien.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function newModel(index: number): ModelData {
  return {
    id: `${Date.now()}-${index}-${Math.random()}`,
    name: "", street: "", city: "", birth: "", birthText: "", email: "",
    instagram: "", sameContact: false, guardianName: "", guardianEmail: "",
    modelSignature: "", guardianSignature: "",
  };
}

function ageOf(value: string) {
  if (!value) return null;
  const birth = new Date(`${value}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "";
}

function Signature({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [signed, setSigned] = useState(Boolean(value));
  const position = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * event.currentTarget.width / rect.width,
      y: (event.clientY - rect.top) * event.currentTarget.height / rect.height,
    };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const ctx = event.currentTarget.getContext("2d");
    const point = position(event);
    drawing.current = true;
    if (ctx) {
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 4; ctx.strokeStyle = "#17211d";
      ctx.beginPath(); ctx.moveTo(point.x, point.y);
    }
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = event.currentTarget.getContext("2d");
    const point = position(event);
    ctx?.lineTo(point.x, point.y); ctx?.stroke(); setSigned(true);
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current?.toDataURL("image/png") || "");
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false); onChange("");
  };
  return <div className="signature-field">
    <div className="sig-head"><label>{label} *</label>{signed && <button type="button" onClick={clear}>Löschen</button>}</div>
    <canvas ref={canvasRef} width="800" height="260" aria-label={`${label} unterschreiben`} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
    <small>Mit Finger oder Stift unterschreiben</small>
  </div>;
}

async function logoData() {
  const blob = await (await fetch("./chris-franz-design-logo.png")).blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader(); reader.onloadend = () => resolve(String(reader.result)); reader.readAsDataURL(blob);
  });
}

export default function Home() {
  const [models, setModels] = useState<ModelData[]>([newModel(0)]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [consent, setConsent] = useState(false);
  const [photographerSignature, setPhotographerSignature] = useState("");
  const [status, setStatus] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const resolvedModel = (index: number) => {
    const model = models[index];
    if (index > 0 && model.sameContact) return { ...model, street: models[0].street, city: models[0].city, email: models[0].email };
    return model;
  };

  const updateModel = (index: number, patch: Partial<ModelData>) => {
    setModels((current) => current.map((model, modelIndex) => modelIndex === index ? { ...model, ...patch } : model));
  };

  const selectTab = (index: number) => {
    const next = Math.max(0, Math.min(index, models.length - 1));
    setActiveIndex(next);
    requestAnimationFrame(() => {
      tabsRef.current?.querySelector<HTMLElement>(`[data-tab-index="${next}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  };
  const changeCount = (count: number) => {
    setModels((current) => count > current.length
      ? [...current, ...Array.from({ length: count - current.length }, (_, index) => newModel(current.length + index))]
      : current.slice(0, count));
    setActiveIndex((current) => Math.min(current, count - 1));
  };

  const updateBirthText = (index: number, input: string) => {
    const digits = input.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length <= 2 ? digits : digits.length <= 4 ? `${digits.slice(0, 2)}.${digits.slice(2)}` : `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
    let iso = "";
    if (digits.length === 8) {
      const day = Number(digits.slice(0, 2)); const month = Number(digits.slice(2, 4)); const year = Number(digits.slice(4));
      const date = new Date(year, month - 1, day);
      if (year >= 1900 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    updateModel(index, { birthText: formatted, birth: iso });
  };

  const updateBirthCalendar = (index: number, value: string) => {
    const parts = value.split("-");
    updateModel(index, { birth: value, birthText: value && parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : "" });
  };

  const missing: string[] = [];
  models.forEach((_, index) => {
    const model = resolvedModel(index); const age = ageOf(model.birth); const label = firstName(model.name) || `Person ${index + 1}`;
    if (!model.name.trim()) missing.push(`Name (${label})`);
    if (!model.street.trim()) missing.push(`Anschrift (${label})`);
    if (!model.city.trim()) missing.push(`PLZ und Ort (${label})`);
    if (age === null || age < 0) missing.push(`gültiges Geburtsdatum (${label})`);
    if (!emailPattern.test(model.email.trim())) missing.push(`gültige E-Mail (${label})`);
    if (age !== null && age < 18) {
      if (!model.guardianName.trim()) missing.push(`Name Erziehungsberechtigte (${label})`);
      if (!emailPattern.test(model.guardianEmail.trim())) missing.push(`E-Mail Erziehungsberechtigte (${label})`);
      if (!model.guardianSignature) missing.push(`Unterschrift Erziehungsberechtigte (${label})`);
    }
    if (age !== null && age >= 14 && !model.modelSignature) missing.push(`Unterschrift Model (${label})`);
  });
  if (!consent) missing.push("Zustimmung zur Vereinbarung");
  if (!photographerSignature) missing.push("Unterschrift Fotograf");
  const ready = missing.length === 0;

  const makePdf = async () => {
    setStatus("PDF wird erstellt …");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const logo = await logoData(); const margin = 16; const contentWidth = 178;
    let y = 0;
    const ensureSpace = (needed: number) => { if (y + needed > 278) { pdf.addPage(); y = 18; } };

    pdf.addImage(logo, "PNG", margin, 9, 31, 31);
    pdf.setTextColor(24, 34, 30); pdf.setFont("helvetica", "bold"); pdf.setFontSize(19); pdf.text("MODEL-RELEASE", 53, 20);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5); pdf.text("Einwilligung zur Veröffentlichung von Fotoaufnahmen", 53, 27);
    pdf.setDrawColor(179, 145, 79); pdf.line(margin, 44, 194, 44);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.text("FOTOGRAF", margin, 51);
    pdf.setFont("helvetica", "normal"); pdf.text(["Chris Franz Design · Christopher Franz", "Schlesische Straße 15 · 31008 Elze · design@chris-franz.de"], margin, 57);
    y = 70;

    pdf.setFont("helvetica", "bold"); pdf.text("EINWILLIGUNG UND TFP-VEREINBARUNG", margin, y); y += 6;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5);
    const consentLines = pdf.splitTextToSize(consentText.replace("Chris Franz Design", "CHRIS FRANZ DESIGN"), contentWidth);
    pdf.text(consentLines, margin, y, { lineHeightFactor: 1.3 }); y += consentLines.length * 3.8 + 3;
    const termsLines = pdf.splitTextToSize(imageTerms.replace("Chris Franz Design", "CHRIS FRANZ DESIGN"), contentWidth);
    pdf.text(termsLines, margin, y, { lineHeightFactor: 1.3 }); y += termsLines.length * 3.8 + 7;

    models.forEach((_, index) => {
      const model = resolvedModel(index); const age = ageOf(model.birth) ?? 0;
      const signatures = [
        ...(age >= 14 ? [{ image: model.modelSignature, label: `Model: ${model.name}` }] : []),
        ...(age < 18 ? [{ image: model.guardianSignature, label: `Erziehungsberechtigt: ${model.guardianName}` }] : []),
      ];
      const needed = 34 + (age < 18 ? 8 : 0) + (signatures.length ? 24 : 0);
      ensureSpace(needed);
      pdf.setFillColor(245, 242, 234); pdf.rect(margin, y - 4, contentWidth, 8, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(`MODEL ${index + 1} · ${model.name}`, margin + 3, y + 1); y += 9;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5);
      pdf.text([`${model.street} · ${model.city}`, `Geburtsdatum: ${new Date(`${model.birth}T00:00:00`).toLocaleDateString("de-DE")} · E-Mail: ${model.email}`, ...(model.instagram ? [`Instagram: ${model.instagram}`] : [])], margin, y);
      y += model.instagram ? 14 : 10;
      if (age < 18) {
        pdf.setFont("helvetica", "bold"); pdf.text("Erziehungsberechtigte Person:", margin, y);
        pdf.setFont("helvetica", "normal"); pdf.text(`${model.guardianName} · ${model.guardianEmail}`, margin + 49, y); y += 8;
      }
      signatures.forEach((signature, signatureIndex) => {
        const x = margin + signatureIndex * 88;
        pdf.addImage(signature.image, "PNG", x, y, 48, 14);
        pdf.setFontSize(7); pdf.text(signature.label, x, y + 17);
      });
      if (signatures.length) y += 24;
      y += 4;
    });

    ensureSpace(34);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.text("FOTOGRAF – einmalig für alle aufgeführten Models", margin, y); y += 3;
    pdf.addImage(photographerSignature, "PNG", margin, y, 52, 15);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.text("Christopher Franz · Chris Franz Design", margin, y + 18); y += 25;
    pdf.setFontSize(8); pdf.text(`Abgeschlossen am ${new Date().toLocaleDateString("de-DE")}`, margin, y);

    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
      pdf.setPage(page); pdf.setFontSize(7); pdf.setTextColor(100);
      pdf.text("Widerruf für zukünftige Nutzungen: design@chris-franz.de", margin, 290);
      pdf.text(`Seite ${page} von ${pages}`, 194, 290, { align: "right" });
    }
    const filename = `Model-Release_${models.length}-Models_${today}.pdf`;
    pdf.save(filename); setStatus("PDF wurde auf deinem Gerät gespeichert.");
  };

  const active = models[activeIndex]; const activeResolved = resolvedModel(activeIndex); const activeAge = ageOf(active.birth);
  return <main><section className="card">
    <header><img src="./chris-franz-design-logo.png" alt="Chris Franz Design Logo" /><div><span className="eyebrow">Einwilligung zur Bildnutzung</span><h1>Model-Release</h1><p>Für einzelne Models oder Gruppen – digital ausfüllen und unterschreiben.</p></div></header>
    <div className="photographer"><div><span className="eyebrow">Fotograf</span><strong>Chris Franz Design · Christopher Franz</strong></div><address>Schlesische Straße 15 · 31008 Elze<br /><a href="mailto:design@chris-franz.de">design@chris-franz.de</a></address></div>
    <form onSubmit={(event) => { event.preventDefault(); if (ready) makePdf(); }}>
      <section className="participant-control"><div><span className="section-kicker">Shooting vorbereiten</span><h2>Wie viele Personen nehmen teil?</h2><p>Für jede Person werden eigene Modeldaten und die altersabhängigen Unterschriften erfasst.</p></div><label>Personenanzahl<select value={models.length} onChange={(event) => changeCount(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></section>

      <fieldset><legend>Daten des Models</legend>
        {models.length > 1 && <><div className="tab-navigator"><button type="button" className="tab-arrow" onClick={() => selectTab(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Vorheriges Model">‹</button><div ref={tabsRef} className="model-tabs" role="tablist" aria-label="Models">{models.map((model, index) => <button key={model.id} data-tab-index={index} type="button" role="tab" aria-selected={activeIndex === index} className={activeIndex === index ? "active" : ""} onClick={() => selectTab(index)}><span>{firstName(model.name) || `Person ${index + 1}`}</span>{(() => { const m = resolvedModel(index); const age = ageOf(m.birth); const complete = Boolean(m.name && m.street && m.city && emailPattern.test(m.email) && age !== null && age >= 0 && (age < 14 ? m.guardianName && m.guardianEmail && m.guardianSignature : age < 18 ? m.guardianName && m.guardianEmail && m.guardianSignature && m.modelSignature : m.modelSignature)); return <i>{complete ? "✓" : index + 1}</i>; })()}</button>)}</div><button type="button" className="tab-arrow" onClick={() => selectTab(activeIndex + 1)} disabled={activeIndex === models.length - 1} aria-label="Nächstes Model">›</button></div>{models.length > 3 && <span className="tabs-hint">Mit den Pfeilen wechseln oder Reiter seitlich wischen</span>}</>}
        <div className="model-panel" role="tabpanel">
          <div className="grid">
            <label className="wide">Vor- und Nachname *<input value={active.name} onChange={(event) => updateModel(activeIndex, { name: event.target.value })} autoComplete="name" required /></label>
            {activeIndex > 0 && <label className="wide same-contact"><input type="checkbox" checked={active.sameContact} onChange={(event) => updateModel(activeIndex, { sameContact: event.target.checked })} /><span>Adresse und E-Mail sind identisch mit Person 1</span></label>}
            <label className="wide">Straße und Hausnummer *<input value={activeResolved.street} onChange={(event) => updateModel(activeIndex, { street: event.target.value })} disabled={active.sameContact} required /></label>
            <label>PLZ und Ort *<input value={activeResolved.city} onChange={(event) => updateModel(activeIndex, { city: event.target.value })} disabled={active.sameContact} required /></label>
            <label>Geburtsdatum *<div className="birth-control"><input className="birth-text" type="text" inputMode="numeric" placeholder="TT.MM.JJJJ" maxLength={10} value={active.birthText} onChange={(event) => updateBirthText(activeIndex, event.target.value)} required /><span className="calendar-icon" aria-hidden="true">▦</span><input className="birth-picker" type="date" min="1900-01-01" max={today} value={active.birth} onChange={(event) => updateBirthCalendar(activeIndex, event.target.value)} aria-label="Geburtsdatum über Kalender auswählen" /></div></label>
            <label>E-Mail *<input type="email" inputMode="email" value={activeResolved.email} onChange={(event) => updateModel(activeIndex, { email: event.target.value })} disabled={active.sameContact} required /></label>
            <label>Instagram <em>(optional)</em><input value={active.instagram} onChange={(event) => updateModel(activeIndex, { instagram: event.target.value })} placeholder="@username" /></label>
          </div>
          {active.birth && activeAge !== null && activeAge >= 0 && <p className={`age ${activeAge < 18 ? "minor" : ""}`}>{activeAge < 14 ? `${activeAge} Jahre – nur die erziehungsberechtigte Person unterschreibt.` : activeAge < 18 ? `${activeAge} Jahre – Model und erziehungsberechtigte Person unterschreiben.` : `Volljährig (${activeAge} Jahre) – das Model unterschreibt selbst.`}</p>}
          {activeAge !== null && activeAge < 18 && <div className="guardian-block"><h3>Erziehungsberechtigte Person</h3><div className="grid"><label>Name *<input value={active.guardianName} onChange={(event) => updateModel(activeIndex, { guardianName: event.target.value })} required /></label><label>E-Mail *<input type="email" inputMode="email" value={active.guardianEmail} onChange={(event) => updateModel(activeIndex, { guardianEmail: event.target.value })} required /></label></div></div>}
          {activeAge !== null && activeAge >= 0 && <div className="model-signatures"><h3>Erforderliche Unterschriften für {active.name || `Person ${activeIndex + 1}`}</h3><div className="signatures">{activeAge >= 14 && <Signature key={`${active.id}-model`} label={`Model: ${active.name || `Person ${activeIndex + 1}`}`} value={active.modelSignature} onChange={(value) => updateModel(activeIndex, { modelSignature: value })} />}{activeAge < 18 && <Signature key={`${active.id}-guardian`} label={`Erziehungsberechtigt: ${active.guardianName || "Name noch eintragen"}`} value={active.guardianSignature} onChange={(value) => updateModel(activeIndex, { guardianSignature: value })} />}</div></div>}
        </div>
      </fieldset>

      <fieldset><legend>Einwilligung und TFP-Vereinbarung</legend><p className="copy">{consentText.split("Chris Franz Design")[0]}<em className="brand-name">Chris Franz Design</em>{consentText.split("Chris Franz Design")[1]}</p><p className="terms-copy">{imageTerms}</p><label className="check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>Alle aufgeführten Models beziehungsweise ihre erziehungsberechtigten Personen haben die Vereinbarung gelesen und stimmen ihr zu. *</span></label></fieldset>

      <fieldset><legend>Unterschrift Fotograf</legend><p className="field-intro">Diese Unterschrift gilt einmalig für alle oben aufgeführten Models.</p><div className="photographer-signature"><Signature label="Christopher Franz · Chris Franz Design" value={photographerSignature} onChange={setPhotographerSignature} /></div></fieldset>
      <div className="actions">{!ready && <div className="missing" role="status"><strong>Noch nicht vollständig</strong><span>Bitte ergänzen: {missing.join(", ")}.</span></div>}<button className="confirm" disabled={!ready}>Vereinbarung bestätigen & PDF speichern</button>{status && <p role="status" className="status">{status}</p>}</div>
    </form>
    <footer>Chris Franz Design · Model-Release · <a href="mailto:design@chris-franz.de">Widerruf für zukünftige Nutzungen</a></footer>
  </section></main>;
}
