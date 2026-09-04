"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookCheck,
  BookMarked,
  BookOpen,
  ExternalLink,
  FileSearch,
  FolderOpen,
  History,
  LockKeyhole,
  NotebookPen,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type View = "task" | "website" | "casebook" | "report";
type BookView = "current" | "history" | "notes";
type TaskNumber = 1 | 2 | 3;
type PostIt = { id: string; text: string; savedText: string };
type Notes = Record<TaskNumber, PostIt[]>;

const taskNumbers: TaskNumber[] = [1, 2, 3];

const records = {
  official: { title: "Official commencement date", value: "September 18, 2003", source: "Project homepage" },
  session: { title: "Earliest participant session", value: "September 12, 2003", source: "Participant Log 01-A" },
  backup: { title: "Last verified backup", value: "September 04, 2003", source: "Collection status" },
  "harrow-log": { title: "Log preparer", value: "E. Harrow", source: "Participant Log 01-A" },
  "methodology-pdf": { title: "Methodology appendix", value: "Records contractor: E. Harrow", source: "Morrowfield Methodology Appendix" },
  "voss-paper": { title: "Publication acknowledgement", value: "Eleanor Harrow, project archivist", source: "Voss (2003)" },
  "closure-memo": { title: "Formal closure date", value: "October 02, 2003", source: "Collection status" },
  "access-log": { title: "Final authenticated access", value: "October 11, 2003 · evoss", source: "Site administration log" },
  "export-file": { title: "Post-closure export", value: "participant-index-03.zip", source: "Server export register" },
} as const;

const tasks = {
  1: {
    label: "Investigation 01",
    title: "Establish the project’s commencement date",
    brief: "The recovered Project Morrowfield records contain conflicting dates. Determine when participant activity actually began.",
    required: "Your report must identify the actual commencement date, the date claimed publicly, and the record proving the conflict.",
    reportTitle: "Document the date discrepancy",
    fields: ["When did participant activity actually begin?", "What date did the public website claim?", "Which record proves the contradiction?"],
    evidence: [
      { id: "official", hint: "The public project homepage includes a commencement date." },
      { id: "session", hint: "Sort the participant records by date and inspect the earliest session." },
      { id: "backup", hint: "Administrative pages often retain an earlier backup record." },
    ],
    reportEvidence: [
      { id: "session", supports: "Actual commencement date" },
      { id: "official", supports: "Publicly claimed date" },
      { id: "session", supports: "Record proving the discrepancy" },
    ],
  },
  2: {
    label: "Investigation 02",
    title: "Identify the unlisted contributor",
    brief: "The public team page names four researchers, but technical records point to another person who maintained the collection.",
    required: "Your report must give the contributor’s full name, their role, and the document that establishes that role.",
    reportTitle: "Identify the missing contributor",
    fields: ["Who was the unlisted contributor?", "What was their role on the project?", "Which document identifies their full role?"],
    evidence: [
      { id: "harrow-log", hint: "The earliest participant record has a preparer, not just a date." },
      { id: "methodology-pdf", hint: "Methodology appendices often list people responsible for records." },
      { id: "voss-paper", hint: "Publication acknowledgements often expand initials into full names." },
    ],
    reportEvidence: [
      { id: "voss-paper", supports: "Contributor’s full name" },
      { id: "methodology-pdf", supports: "Contributor’s project role" },
      { id: "voss-paper", supports: "Document establishing the role" },
    ],
  },
  3: {
    label: "Investigation 03",
    title: "Identify the final post-closure access",
    brief: "Project Morrowfield was formally closed, yet the recovered server retains a later activity trail.",
    required: "Your report must identify who made the final access, when it occurred, and which file was exported.",
    reportTitle: "Document the post-closure access",
    fields: ["Who made the final access?", "When did the final access occur?", "Which file was exported?"],
    evidence: [
      { id: "closure-memo", hint: "Start by establishing when the collection officially closed." },
      { id: "access-log", hint: "Server logs can be sorted by their most recent activity." },
      { id: "export-file", hint: "The final access left an export entry in the server register." },
    ],
    reportEvidence: [
      { id: "access-log", supports: "Account behind the final access" },
      { id: "access-log", supports: "Date of the final access" },
      { id: "export-file", supports: "File exported after closure" },
    ],
  },
} as const;

const evidenceKey = (task: TaskNumber) => `morrowfield:evidence-${String(task).padStart(2, "0")}`;
const solvedKey = (task: TaskNumber) => `morrowfield:solved-${String(task).padStart(2, "0")}`;

export default function Home() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("task");
  const [bookView, setBookView] = useState<BookView>("current");
  const [evidenceByTask, setEvidenceByTask] = useState<Record<TaskNumber, string[]>>({ 1: [], 2: [], 3: [] });
  const [solved, setSolved] = useState<Record<TaskNumber, boolean>>({ 1: false, 2: false, 3: false });
  const [answers, setAnswers] = useState(["", "", ""]);
  const [feedback, setFeedback] = useState("");
  const [shownHints, setShownHints] = useState<string[]>([]);
  const [notes, setNotes] = useState<Notes>({ 1: [], 2: [], 3: [] });
  const [notesTask, setNotesTask] = useState<TaskNumber>(1);
  const [websiteOpened, setWebsiteOpened] = useState(false);

  const activeTask: TaskNumber = solved[1] ? (solved[2] ? 3 : 2) : 1;
  const task = tasks[activeTask];
  const currentEvidence = evidenceByTask[activeTask];
  const isComplete = solved[3];

  const sync = () => {
    const solvedState = Object.fromEntries(taskNumbers.map((number) => [number, localStorage.getItem(solvedKey(number)) === "true"])) as Record<TaskNumber, boolean>;
    const legacy = JSON.parse(localStorage.getItem("morrowfield:evidence") ?? "[]");
    const grouped = Object.fromEntries(taskNumbers.map((number) => {
      const saved = JSON.parse(localStorage.getItem(evidenceKey(number)) ?? "[]");
      if (Array.isArray(saved) && saved.length) return [number, saved];
      if (Array.isArray(legacy)) {
        const allowed = tasks[number].evidence.map((item) => item.id);
        return [number, legacy.filter((id) => allowed.includes(id))];
      }
      return [number, []];
    })) as Record<TaskNumber, string[]>;
    setSolved(solvedState);
    setEvidenceByTask(grouped);
    const savedNotes = JSON.parse(localStorage.getItem("morrowfield:notes") ?? '{"1":[],"2":[],"3":[]}');
    const normalizedNotes = Object.fromEntries(taskNumbers.map((number) => {
      const source = savedNotes[number] ?? [];
      if (typeof source === "string") return [number, source.trim() ? [{ id: `migrated-${number}`, text: source, savedText: source }] : []];
      return [number, Array.isArray(source) ? source : []];
    })) as Notes;
    setNotes(normalizedNotes);
  };

  useEffect(() => {
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); };
  }, []);

  useEffect(() => {
    setAnswers(["", "", ""]); setFeedback(""); setShownHints([]); setNotesTask(activeTask);
  }, [activeTask]);

  const reset = () => {
    ["morrowfield:evidence", "morrowfield:notes", ...taskNumbers.flatMap((number) => [evidenceKey(number), solvedKey(number)])].forEach((key) => localStorage.removeItem(key));
    setStarted(false); setView("task"); setBookView("current"); setEvidenceByTask({ 1: [], 2: [], 3: [] });
    setSolved({ 1: false, 2: false, 3: false }); setAnswers(["", "", ""]); setFeedback(""); setNotes({ 1: [], 2: [], 3: [] });
  };

  const persistNotes = (next: Notes) => { setNotes(next); localStorage.setItem("morrowfield:notes", JSON.stringify(next)); };
  const addPostIt = () => {
    const note: PostIt = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text: "", savedText: "" };
    setNotes((current) => ({ ...current, [notesTask]: [...current[notesTask], note] }));
  };
  const editPostIt = (id: string, text: string) => setNotes((current) => ({ ...current, [notesTask]: current[notesTask].map((note) => note.id === id ? { ...note, text } : note) }));
  const savePostIt = (id: string) => setNotes((current) => {
    const next = { ...current, [notesTask]: current[notesTask].map((note) => note.id === id ? { ...note, savedText: note.text } : note) };
    localStorage.setItem("morrowfield:notes", JSON.stringify(next)); return next;
  });
  const deletePostIt = (id: string) => setNotes((current) => {
    const next = { ...current, [notesTask]: current[notesTask].filter((note) => note.id !== id) };
    localStorage.setItem("morrowfield:notes", JSON.stringify(next)); return next;
  });

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isDate = (value: string, month: string, day: string) => {
    const answer = normalize(value);
    return answer.includes(`${month}${day}2003`) || answer.includes(`${month.slice(0, 3)}${day}2003`) || answer.includes(`${month.slice(0, 3)}${day}`);
  };
  const updateAnswer = (index: number, value: string) => setAnswers((current) => current.map((answer, i) => i === index ? value : answer));

  const submit = () => {
    if (currentEvidence.length < task.evidence.length) { setFeedback(`Record all ${task.evidence.length} pieces of evidence in your casebook before submitting.`); return; }
    if (answers.some((answer) => !answer.trim())) { setFeedback("Complete all three report fields before submitting."); return; }
    const normalized = answers.map(normalize);
    let accepted = false;
    if (activeTask === 1) accepted = isDate(answers[0], "september", "12") && isDate(answers[1], "september", "18") && (normalized[2].includes("participantlog") || normalized[2].includes("sessionlog") || normalized[2].includes("01a"));
    if (activeTask === 2) accepted = normalized[0].includes("eleanorharrow") && (normalized[1].includes("archiv") || normalized[1].includes("record")) && (normalized[2].includes("voss") || normalized[2].includes("constructedenvironments"));
    if (activeTask === 3) accepted = (normalized[0].includes("elianvoss") || normalized[0] === "voss") && isDate(answers[1], "october", "11") && normalized[2].includes("participantindex03zip");
    if (!accepted) { setFeedback("The report does not match the records currently in your casebook. Recheck the evidence and your notes."); return; }
    localStorage.setItem(solvedKey(activeTask), "true");
    setSolved((current) => ({ ...current, [activeTask]: true })); setFeedback(""); setView("task");
  };

  const previousTasks = useMemo(() => taskNumbers.filter((number) => solved[number]), [solved]);
  const recovery = isComplete ? 42 : solved[2] ? 34 : solved[1] ? 24 : 14;

  if (!started) return <main className="boot"><section className="boot-card"><div className="seal"><Archive /></div><p className="eyebrow">Bellwether University Archives</p><h1>The Morrowfield Collection</h1><p>Accession review 27-041. Investigate the recovered website, preserve relevant evidence, and complete each accession report.</p><button className="primary" onClick={() => setStarted(true)}>Open case file</button><small>Authorized archival workstation · Case 27-041</small></section></main>;

  return <main className="workstation">
    <header className="system-bar"><div><Archive size={18}/><strong>Bellwether Digital Archives</strong><span>Case 27-041</span></div><button onClick={reset}><RotateCcw size={15}/> Restart</button></header>
    <section className="desktop redesigned">
      <nav className="rail" aria-label="Case applications">
        <button className={view === "task" ? "active" : ""} onClick={() => setView("task")}><BookOpen/><span>Task</span></button>
        <button className={view === "website" ? "active" : ""} onClick={() => setView("website")}><FolderOpen/><span>Website</span></button>
        <button className={view === "casebook" ? "active" : ""} onClick={() => setView("casebook")}><FileSearch/><span>Casebook</span><b>{currentEvidence.length}</b></button>
        <button className={view === "report" ? "active" : ""} onClick={() => setView("report")}><LockKeyhole/><span>Report</span></button>
      </nav>
      <section className="window">
        <div className="window-title"><span>{view === "task" ? "Current Assignment" : view === "website" ? "Recovered Website" : view === "casebook" ? "Investigation Casebook" : "Accession Report"}</span><i>□ □ ×</i></div>

        {view === "task" && <div className="content task-page"><p className="label">{isComplete ? "Current case status" : task.label}</p><h2>{isComplete ? "All available reports accepted" : task.title}</h2>{isComplete ? <><p>Three findings have been preserved in the accession record. Your earlier evidence and notes remain available in the casebook.</p><button className="secondary-action" onClick={() => { setBookView("history"); setView("casebook"); }}>Review completed case</button></> : <><p>{task.brief}</p><div className="assignment-card"><div><span>Objective</span><p>{task.required}</p></div><div><span>What you will submit</span><strong>3 written answers supported by {task.evidence.length} records</strong></div></div><div className="next-step"><span>Next</span><p>Search the recovered Project Morrowfield website for the information required by this report.</p><button className="primary" onClick={() => setView("website")}>Go to recovered website</button></div></>}</div>}

        {view === "website" && <div className="content external-archive"><p className="label">Step 2 · Investigate</p><h2>Search Project Morrowfield</h2><p>The answers to your current report are somewhere in the recovered university website. Relevant text and document links can be clicked to preserve them in your casebook.</p><div className="external-file"><FolderOpen/><div><strong>morrowfield.bellwether.edu</strong><span>Recovered snapshot · opens in a separate tab</span></div><a className="primary" href="/archive" target="_blank" rel="noopener" onClick={() => setWebsiteOpened(true)}>Open website <ExternalLink size={16}/></a></div><div className="workflow-help"><BookMarked/><div><strong>Found something useful?</strong><p>Click the relevant fact on the recovered website. It will be filed under Current Findings in your casebook.</p></div><button className="secondary-action" onClick={() => setView("casebook")}>{websiteOpened ? "Open casebook" : "View casebook"}</button></div></div>}

        {view === "casebook" && <div className="content casebook-page"><p className="label">Step 3 · Organize</p><h2>Investigation Casebook</h2><div className="book-tabs" role="tablist" aria-label="Casebook sections"><button className={bookView === "current" ? "active" : ""} onClick={() => setBookView("current")}><BookCheck/><span>Current findings</span><b>{currentEvidence.length}/{task.evidence.length}</b></button><button className={bookView === "history" ? "active" : ""} onClick={() => setBookView("history")}><History/><span>Evidence archive</span><b>{previousTasks.length}</b></button><button className={bookView === "notes" ? "active" : ""} onClick={() => setBookView("notes")}><NotebookPen/><span>Personal notes</span></button></div>
          {bookView === "current" && <section className="book-sheet"><div className="book-heading"><div><span>{task.label}</span><h3>{task.title}</h3></div><strong>{currentEvidence.length} of {task.evidence.length} records</strong></div><div className="evidence-list">{task.evidence.map((slot, index) => { const item = records[slot.id as keyof typeof records]; const captured = currentEvidence.includes(slot.id); const shown = shownHints.includes(slot.id); return <article key={slot.id} className={captured ? "collected" : ""}><span>EX-{String(index + 1).padStart(2, "0")}</span><div><h3>{captured ? item.title : `Evidence slot ${index + 1}`}</h3>{captured ? <><strong>{item.value}</strong><p>{item.source}</p></> : <p>Nothing has been recorded in this slot.</p>}{shown && <p className="evidence-hint">Hint: {slot.hint}</p>}<button className="hint-button" onClick={() => setShownHints((current) => current.includes(slot.id) ? current : [...current, slot.id])}>{shown ? "Hint shown" : "Show hint"}</button></div></article>; })}</div><button className="primary report-cta" disabled={currentEvidence.length < task.evidence.length} onClick={() => setView("report")}>Complete report</button></section>}
          {bookView === "history" && <section className="book-sheet"><div className="book-heading"><div><span>Preserved records</span><h3>Evidence archive</h3></div></div>{previousTasks.length === 0 ? <p className="empty">Accepted investigations will be stored here with all of their evidence.</p> : <div className="history-stack">{previousTasks.map((number) => <details key={number} open={number === previousTasks.at(-1)}><summary><span>{tasks[number].label}</span><strong>{tasks[number].title}</strong><b>{evidenceByTask[number].length}/{tasks[number].evidence.length}</b></summary><div className="archived-evidence">{tasks[number].evidence.map((slot) => { const item = records[slot.id as keyof typeof records]; return <article key={slot.id}><BookMarked/><div><strong>{item.title}</strong><span>{item.value}</span><small>{item.source}</small></div></article>; })}</div></details>)}</div>}</section>}
          {bookView === "notes" && <section className="book-sheet notes-book"><div className="book-heading"><div><span>Saved on this device</span><h3>Personal investigation notes</h3></div><button className="add-postit" onClick={addPostIt}><Plus/> Add Post-it</button></div><div className="note-task-tabs">{taskNumbers.map((number) => <button key={number} className={notesTask === number ? "active" : ""} disabled={number > activeTask} onClick={() => setNotesTask(number)}>Book {String(number).padStart(2, "0")}</button>)}</div><div className="postit-board">{notes[notesTask].length === 0 ? <p className="empty">No notes yet. Add a Post-it for a date, theory, contradiction, or page location.</p> : notes[notesTask].map((note) => <article className="postit" key={note.id}><textarea value={note.text} onChange={(event) => editPostIt(note.id, event.target.value)} placeholder="Write a note…"/><div><span>{note.text === note.savedText ? "Saved" : "Unsaved changes"}</span><button onClick={() => savePostIt(note.id)} aria-label="Save Post-it"><Save/> Save</button><button className="delete-postit" onClick={() => deletePostIt(note.id)} aria-label="Delete Post-it"><Trash2/> Delete</button></div></article>)}</div></section>}
        </div>}

        {view === "report" && <div className="content"><p className="label">Step 4 · {task.label}</p><h2>{task.reportTitle}</h2><p>Use the collected records below to write the report. Each answer shows the evidence that supports it; your Post-its remain available in the casebook.</p><div className="report-evidence-summary"><span>Evidence recorded</span><strong>{currentEvidence.length}/{task.evidence.length}</strong><button onClick={() => { setBookView("current"); setView("casebook"); }}>Review casebook</button></div>{activeTask === 3 && <div className="report-context"><strong>Why this matters</strong><span>The collection was formally closed on October 02, 2003. The records below establish what happened afterward.</span></div>}<div className="finding-fields">{task.fields.map((field, index) => { const link = task.reportEvidence[index]; const item = records[link.id as keyof typeof records]; const captured = currentEvidence.includes(link.id); return <label key={field}><span>{field}</span><div className={captured ? "report-record" : "report-record missing"}><small>{link.supports}</small><strong>{captured ? item.value : "Evidence not yet recorded"}</strong><em>{captured ? item.source : "Return to the recovered website to find this record."}</em></div><input value={answers[index]} onChange={(event) => updateAnswer(index, event.target.value)} placeholder="Enter your finding" autoComplete="off"/></label>; })}</div>{feedback && <p className="feedback">{feedback}</p>}<button className="primary" disabled={isComplete} onClick={submit}>{isComplete ? "Finding accepted" : "Submit report"}</button></div>}
      </section>
      <aside className="status"><p>Current assignment</p><strong>0{activeTask}</strong><span className="status-title">{isComplete ? "Case complete" : task.title}</span><Progress value={(currentEvidence.length / task.evidence.length) * 100}/><dl><div><dt>Evidence</dt><dd>{currentEvidence.length} / {task.evidence.length}</dd></div><div><dt>Report</dt><dd>{solved[activeTask] ? "Accepted" : "Not submitted"}</dd></div><div><dt>Recovery</dt><dd>{recovery}%</dd></div></dl><button className="status-report" onClick={() => setView("report")}>Open report</button></aside>
    </section>
  </main>;
}
