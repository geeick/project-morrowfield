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
type TaskNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type PostIt = { id: string; text: string; savedText: string };
type Notes = Record<TaskNumber, PostIt[]>;

const taskNumbers: TaskNumber[] = [1, 2, 3, 4, 5, 6, 7];

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
  "materials-rule": { title: "Materials control rule", value: "No additions were permitted after commencement.", source: "Study Methodology" },
  "packet-b-revision": { title: "Packet B revision record", value: "Revised September 22, 2003", source: "Study Materials · Packet B" },
  "memory-16g": { title: "Unsupported place memory", value: "Participant described the town as familiar and recalled a grocery storefront not present in the constructed archive.", source: "Participant Log 16-G" },
  "memory-19d": { title: "Claimed visit to Morrowfield", value: "Participant reported a vivid memory of visiting the town square, then noted that the memory may have come from repeated exposure.", source: "Participant Log 19-D" },
  "memory-23f": { title: "Unsupported sensory memory", value: "Participant described hearing a factory whistle near the river despite no audio material being used in the study.", source: "Participant Log 23-F" },
  "memory-27a": { title: "Personal childhood memory", value: "Participant described the harvest festival as a personal childhood memory before correcting the statement when prompted.", source: "Participant Log 27-A" },
  "ethics-safeguard": { title: "Participant safeguard", value: "Suspend exposure if a participant attributes constructed Morrowfield material to personal autobiographical experience.", source: "Ethics Review · Continuation conditions" },
  "incident-threshold": { title: "Incident summary", value: "Four autobiographical-attribution incidents documented.", source: "Internal Memo NB-07" },
  "termination-order": { title: "Suspension authorization", value: "Dr. Miriam Calder · Immediate suspension · October 02, 2003", source: "Internal Memo MC-14" },
  "current-case": { title: "Linked accession case", value: "Case 27-041", source: "Restored resource reference" },
  "current-access-date": { title: "Restored access date", value: "September 09, 2026", source: "Site administration activity record" },
  "reopened-export": { title: "Resolved export file", value: "participant-index-03.zip", source: "Restored resource reference" },
} as const;

const tasks = {
  1: {
    label: "Investigation 01",
    title: "Establish the project’s commencement date",
    brief: "The recovered Project Morrowfield records contain conflicting dates. Determine when participant activity actually began.",
    required: "Establish the project timeline and preserve the records that support it.",
    reportTitle: "Record the conflicting project dates",
    fields: ["What commencement date is claimed on the public project homepage?", "What is the date of the earliest participant session?", "What is the date of the last verified backup?"],
    evidence: [
      { id: "official", hint: "The public-facing project material contains one date." },
      { id: "session", hint: "The participant records can be ordered chronologically." },
      { id: "backup", hint: "Look for an archival date that predates both of those records." },
    ],
  },
  2: {
    label: "Investigation 02",
    title: "Identify the unlisted contributor",
    brief: "The public team page names four researchers, but technical records point to another person who maintained the collection.",
    required: "Identify the missing contributor and establish their role from the recovered archive.",
    reportTitle: "Reconcile the contributor records",
    fields: ["Who is the unlisted contributor?", "What work were they performing for the project?", "What was their fuller role in the collection?"],
    evidence: [
      { id: "harrow-log", hint: "Some participant records identify who prepared them." },
      { id: "methodology-pdf", hint: "A technical document contains staffing information not shown on the team page." },
      { id: "voss-paper", hint: "A publication expands an abbreviated name elsewhere in the archive." },
    ],
  },
  3: {
    label: "Investigation 03",
    title: "Identify the final post-closure access",
    brief: "Project Morrowfield was formally closed, yet the recovered server retains a later activity trail.",
    required: "Determine what happened after closure and preserve the records that establish it.",
    reportTitle: "Document the post-closure access",
    fields: ["When was Project Morrowfield formally closed?", "What account made the final authenticated access, and on what date?", "What was taken during that access?"],
    evidence: [
      { id: "closure-memo", hint: "First establish the date the collection was formally closed." },
      { id: "access-log", hint: "The server retains activity after the official closure." },
      { id: "export-file", hint: "The last activity includes a specific resource and action." },
    ],
  },
  4: {
    label: "Investigation 04",
    title: "Investigate the altered study material",
    brief: "A recovered materials record suggests that part of the experiment changed after participant sessions were already underway. Determine whether the archive documents a breach of the study’s own controls.",
    required: "Establish whether the study materials were changed when they should have remained fixed.",
    reportTitle: "Document the materials-control breach",
    fields: ["What rule governed changes to study materials after participant sessions began?", "What recovered record shows that rule may have been violated?"],
    evidence: [
      { id: "materials-rule", hint: "The study documentation states how materials were supposed to be controlled." },
      { id: "packet-b-revision", hint: "One listed study packet carries a revision date worth comparing with the participant timeline." },
    ],
  },
  5: {
    label: "Investigation 05",
    title: "Trace the false-memory pattern",
    brief: "Several participant sessions suggest that Morrowfield stopped being remembered merely as study material. Determine whether the records show participants treating the constructed town as part of their own experience.",
    required: "Preserve the participant records that show the clearest progression from invented details to autobiographical memory.",
    reportTitle: "Document the autobiographical contamination",
    fields: [
      "What record shows a participant remembering a place that was never in the archive?",
      "What record shows a participant remembering having visited Morrowfield?",
      "What record shows a sensory memory unsupported by the study materials?",
      "What record most clearly turns Morrowfield into a personal childhood memory?",
    ],
    evidence: [
      { id: "memory-16g", hint: "Some early interviews contain details that do not exist in the constructed archive." },
      { id: "memory-19d", hint: "Look for a participant who describes being physically present in Morrowfield." },
      { id: "memory-23f", hint: "One participant remembers a sense the study materials never supplied." },
      { id: "memory-27a", hint: "The strongest example explicitly frames a Morrowfield event as part of the participant’s own past." },
    ],
  },
  6: {
    label: "Investigation 06",
    title: "Reconstruct the termination decision",
    brief: "The public archive records that Project Morrowfield was terminated but does not explain the decision. Determine what condition was breached and how the shutdown was authorized.",
    required: "Reconstruct the chain of records that explains why active exposure was stopped.",
    reportTitle: "Document the termination decision",
    fields: [
      "What participant-safety condition required exposure to stop?",
      "What later record shows that this condition had become a recurring problem?",
      "Who authorized the suspension, and when?",
    ],
    evidence: [
      { id: "ethics-safeguard", hint: "The project had continuation conditions beyond its general experimental methodology." },
      { id: "incident-threshold", hint: "A late administrative record summarizes a pattern already visible in the participant logs." },
      { id: "termination-order", hint: "The authorization itself is preserved separately from the public collection-status notice." },
    ],
  },
  7: {
    label: "Investigation 07",
    title: "Trace accession-session-041",
    brief: "The automated accession queue recorded the request identifier accession-session-041 while rebuilding the Morrowfield snapshot. The request was written to the website’s server register, but its resource was not indexed. Trace the request to its final record. Preserve anything you do not want to rely on memory for.",
    required: "Use accession-session-041 to locate the server event, then follow its resource reference to the associated case and exported file.",
    reportTitle: "Document the unindexed request",
    fields: [
      "On what date was accession-session-041 recorded?",
      "Which accession case does its resource reference identify?",
      "Which exported file does the reference resolve to?",
    ],
    evidence: [
      { id: "current-access-date", hint: "In Server Records, find the row whose account matches the request identifier in your assignment, then open its date." },
      { id: "current-case", hint: "The matching activity record names a resource. Open that reference and inspect its accession field." },
      { id: "reopened-export", hint: "The same resource-reference record identifies the filename it resolves to." },
    ],
  },
} as const;

const evidenceKey = (task: TaskNumber) => `morrowfield:evidence-${String(task).padStart(2, "0")}`;
const solvedKey = (task: TaskNumber) => `morrowfield:solved-${String(task).padStart(2, "0")}`;

const emptyEvidence = (): Record<TaskNumber, string[]> => ({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });
const emptySolved = (): Record<TaskNumber, boolean> => ({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false });
const emptyNotes = (): Notes => ({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });

export default function Home() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("task");
  const [bookView, setBookView] = useState<BookView>("current");
  const [evidenceByTask, setEvidenceByTask] = useState<Record<TaskNumber, string[]>>(emptyEvidence());
  const [solved, setSolved] = useState<Record<TaskNumber, boolean>>(emptySolved());
  const [answers, setAnswers] = useState<string[]>(Array(tasks[1].fields.length).fill(""));
  const [feedback, setFeedback] = useState("");
  const [shownHints, setShownHints] = useState<string[]>([]);
  const [notes, setNotes] = useState<Notes>(emptyNotes());
  const [notesTask, setNotesTask] = useState<TaskNumber>(1);
  const [websiteOpened, setWebsiteOpened] = useState(false);
  const [archiveTrust, setArchiveTrust] = useState(0);

  const activeTask: TaskNumber = !solved[1] ? 1 : !solved[2] ? 2 : !solved[3] ? 3 : !solved[4] ? 4 : !solved[5] ? 5 : !solved[6] ? 6 : 7;
  const task = tasks[activeTask];
  const currentEvidence = evidenceByTask[activeTask];
  const isComplete = solved[7];

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
    setArchiveTrust(Number(localStorage.getItem("morrowfield:archive-trust") ?? "0"));
    const savedNotes = JSON.parse(localStorage.getItem("morrowfield:notes") ?? '{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[]}');
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
    setAnswers(Array(tasks[activeTask].fields.length).fill(""));
    setFeedback("");
    setShownHints([]);
    setNotesTask(activeTask);
  }, [activeTask]);

  const reset = () => {
    ["morrowfield:evidence", "morrowfield:notes", "morrowfield:archive-trust", ...taskNumbers.flatMap((number) => [evidenceKey(number), solvedKey(number)])].forEach((key) => localStorage.removeItem(key));
    setStarted(false);
    setView("task");
    setBookView("current");
    setEvidenceByTask(emptyEvidence());
    setSolved(emptySolved());
    setAnswers(Array(tasks[1].fields.length).fill(""));
    setFeedback("");
    setNotes(emptyNotes());
    setArchiveTrust(0);
  };

  const addPostIt = () => {
    const note: PostIt = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text: "", savedText: "" };
    setNotes((current) => ({ ...current, [notesTask]: [...current[notesTask], note] }));
  };
  const editPostIt = (id: string, text: string) => setNotes((current) => ({ ...current, [notesTask]: current[notesTask].map((note) => note.id === id ? { ...note, text } : note) }));
  const savePostIt = (id: string) => setNotes((current) => {
    const next = { ...current, [notesTask]: current[notesTask].map((note) => note.id === id ? { ...note, savedText: note.text } : note) };
    localStorage.setItem("morrowfield:notes", JSON.stringify(next));
    return next;
  });
  const deletePostIt = (id: string) => setNotes((current) => {
    const next = { ...current, [notesTask]: current[notesTask].filter((note) => note.id !== id) };
    localStorage.setItem("morrowfield:notes", JSON.stringify(next));
    return next;
  });

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const updateAnswer = (index: number, value: string) => setAnswers((current) => current.map((answer, i) => i === index ? value : answer));

  const submit = () => {
    if (currentEvidence.length < task.evidence.length) {
      setFeedback(`Record all ${task.evidence.length} relevant ${task.evidence.length === 1 ? "record" : "records"} in your casebook before submitting.`);
      return;
    }
    if (answers.some((answer) => !answer.trim())) {
      setFeedback(`Complete all ${task.fields.length} report ${task.fields.length === 1 ? "field" : "fields"} before submitting.`);
      return;
    }
    const expected = task.evidence.map((slot) => records[slot.id as keyof typeof records].value);
    const normalizedAnswers = answers.map(normalize);
    const observedDate = normalizedAnswers[0].includes("september052026") || normalizedAnswers[0].includes("september52026") || normalizedAnswers[0].includes("sep052026") || normalizedAnswers[0].includes("sep52026");
    const recordedDate = normalizedAnswers[0].includes("september092026") || normalizedAnswers[0].includes("september92026") || normalizedAnswers[0].includes("sep092026") || normalizedAnswers[0].includes("sep92026");
    const accepted = activeTask === 7
      ? (observedDate || recordedDate) && normalizedAnswers[1].includes("case27041") && normalizedAnswers[2].includes("participantindex03zip")
      : answers.every((answer, index) => normalize(answer) === normalize(expected[index] ?? ""));
    if (!accepted) {
      setFeedback("One or more answers do not match the finding saved in your casebook. Enter the casebook value for each question.");
      return;
    }
    if (activeTask === 7) {
      const nextTrust = archiveTrust + (observedDate ? -1 : 1);
      localStorage.setItem("morrowfield:archive-trust", String(nextTrust));
      setArchiveTrust(nextTrust);
    }
    localStorage.setItem(solvedKey(activeTask), "true");
    setSolved((current) => ({ ...current, [activeTask]: true }));
    setFeedback("");
    setView("task");
  };

  const previousTasks = useMemo(() => taskNumbers.filter((number) => solved[number]), [solved]);
  const recovery = isComplete ? 88 : solved[6] ? 80 : solved[5] ? 70 : solved[4] ? 58 : solved[3] ? 46 : solved[2] ? 34 : solved[1] ? 24 : 14;

  if (!started) return <main className="boot"><section className="boot-card"><div className="seal"><Archive /></div><p className="eyebrow">Bellwether University Archives</p><h1>The Morrowfield Collection</h1><p>Accession review 27-041. Investigate the recovered website, preserve relevant evidence, and complete each accession report.</p><button className="primary" onClick={() => setStarted(true)}>Open case file</button><small>Authorized archival workstation · Case 27-041</small></section></main>;

  return <main className="workstation">
    <header className="system-bar"><div><Archive size={18}/><strong>Bellwether Digital Archives</strong><span>Case 27-041</span></div><button onClick={reset}><RotateCcw size={15}/> Restart</button></header>
    <section className="desktop redesigned">
      <nav className="rail" aria-label="Case applications">
        <button className={view === "task" ? "active" : ""} onClick={() => setView("task")}><BookOpen/><span>Task</span></button>
        <button className={view === "website" ? "active" : ""} onClick={() => setView("website")}><FolderOpen/><span>Website</span></button>
        <button className={view === "casebook" ? "active" : ""} onClick={() => setView("casebook")}><FileSearch/><span>{solved[7] && archiveTrust > 0 ? "Recollection" : "Casebook"}</span><b>{currentEvidence.length}</b></button>
        <button className={view === "report" ? "active" : ""} onClick={() => setView("report")}><LockKeyhole/><span>Report</span></button>
      </nav>
      <section className="window">
        <div className="window-title"><span>{view === "task" ? "Current Assignment" : view === "website" ? "Recovered Website" : view === "casebook" ? "Investigation Casebook" : "Accession Report"}</span><i>□ □ ×</i></div>

        {view === "task" && <div className="content task-page"><p className="label">{isComplete ? "Current case status" : task.label}</p><h2>{isComplete ? "All available reports accepted" : task.title}</h2>{isComplete ? <><p>Seven investigations have been preserved in the accession record. Your earlier evidence and notes remain available in the casebook.</p><button className="secondary-action" onClick={() => { setBookView("history"); setView("casebook"); }}>Review completed case</button></> : <><p>{task.brief}</p><div className="assignment-card"><div><span>Objective</span><p>{task.required}</p></div><div><span>What you will submit</span><strong>{task.fields.length} written {task.fields.length === 1 ? "answer" : "answers"} supported by {task.evidence.length} relevant {task.evidence.length === 1 ? "record" : "records"}</strong></div></div><div className="next-step"><span>Next</span><p>{activeTask === 7 ? "Begin in Server Records. Locate the request identifier from the assignment, open its activity record, and follow the resource it names." : "Search the recovered Project Morrowfield website and build a supported conclusion from what you find."}</p><button className="primary" onClick={() => setView("website")}>Go to recovered website</button></div></>}</div>}

        {view === "website" && <div className="content external-archive"><p className="label">Investigate</p><h2>Search Project Morrowfield</h2><p>The information needed for your current report is somewhere in the recovered university website. Relevant text and document links can be clicked to preserve them in your casebook.</p><div className="external-file"><FolderOpen/><div><strong>morrowfield.bellwether.edu</strong><span>Recovered snapshot · opens in a separate tab</span></div><a className="primary" href="/archive" target="_blank" rel="noopener" onClick={() => setWebsiteOpened(true)}>Open website <ExternalLink size={16}/></a></div><div className="workflow-help"><BookMarked/><div><strong>Found something useful?</strong><p>Click a relevant fact on the recovered website to preserve it in Current Findings. You can keep your own theories and page references in Personal Notes.</p></div><button className="secondary-action" onClick={() => setView("casebook")}>{websiteOpened ? "Open casebook" : "View casebook"}</button></div></div>}

        {view === "casebook" && <div className="content casebook-page"><p className="label">Casebook</p><h2>Investigation Casebook</h2><div className="book-tabs" role="tablist" aria-label="Casebook sections"><button className={bookView === "current" ? "active" : ""} onClick={() => setBookView("current")}><BookCheck/><span>Current findings</span><b>{currentEvidence.length}/{task.evidence.length}</b></button><button className={bookView === "history" ? "active" : ""} onClick={() => setBookView("history")}><History/><span>Evidence archive</span><b>{previousTasks.length}</b></button><button className={bookView === "notes" ? "active" : ""} onClick={() => setBookView("notes")}><NotebookPen/><span>Personal notes</span></button></div>
          {bookView === "current" && <section className="book-sheet"><div className="book-heading"><div><span>{task.label}</span><h3>{task.title}</h3></div><strong>{currentEvidence.length} of {task.evidence.length} relevant {task.evidence.length === 1 ? "record" : "records"}</strong></div><div className="evidence-list">{task.evidence.map((slot, index) => { const item = records[slot.id as keyof typeof records]; const captured = currentEvidence.includes(slot.id); const shown = shownHints.includes(slot.id); return <article key={slot.id} className={captured ? "collected" : ""}><span>EX-{String(index + 1).padStart(2, "0")}</span><div><h3>{captured ? item.title : `Unresolved record ${index + 1}`}</h3>{captured ? <><strong>{item.value}</strong><p>{item.source}</p></> : <p>No relevant record has been preserved here yet.</p>}{shown && <p className="evidence-hint">Hint: {slot.hint}</p>}<button className="hint-button" onClick={() => setShownHints((current) => current.includes(slot.id) ? current : [...current, slot.id])}>{shown ? "Hint shown" : "Show hint"}</button></div></article>; })}</div><button className="primary report-cta" disabled={currentEvidence.length < task.evidence.length} onClick={() => setView("report")}>Complete report</button></section>}
          {bookView === "history" && <section className="book-sheet"><div className="book-heading"><div><span>Preserved records</span><h3>Evidence archive</h3></div></div>{previousTasks.length === 0 ? <p className="empty">Accepted investigations will be stored here with all of their evidence.</p> : <div className="history-stack">{previousTasks.map((number) => <details key={number} open={number === previousTasks.at(-1)}><summary><span>{tasks[number].label}</span><strong>{tasks[number].title}</strong><b>{evidenceByTask[number].length}/{tasks[number].evidence.length}</b></summary><div className="archived-evidence">{tasks[number].evidence.map((slot) => { const item = records[slot.id as keyof typeof records]; return <article key={slot.id}><BookMarked/><div><strong>{item.title}</strong><span>{item.value}</span><small>{item.source}</small></div></article>; })}</div></details>)}</div>}</section>}
          {bookView === "notes" && <section className="book-sheet notes-book"><div className="book-heading"><div><span>Saved on this device</span><h3>Personal investigation notes</h3></div><button className="add-postit" onClick={addPostIt}><Plus/> Add Post-it</button></div><div className="note-task-tabs">{taskNumbers.map((number) => <button key={number} className={notesTask === number ? "active" : ""} disabled={number > activeTask} onClick={() => setNotesTask(number)}>Book {String(number).padStart(2, "0")}</button>)}</div><div className="postit-board">{notes[notesTask].length === 0 ? <p className="empty">No notes yet. Add a Post-it for a date, theory, contradiction, or page location.</p> : notes[notesTask].map((note) => <article className="postit" key={note.id}><textarea value={note.text} onChange={(event) => editPostIt(note.id, event.target.value)} placeholder="Write a note…"/><div><span>{note.text === note.savedText ? "Saved" : "Unsaved changes"}</span><button onClick={() => savePostIt(note.id)} aria-label="Save Post-it"><Save/> Save</button><button className="delete-postit" onClick={() => deletePostIt(note.id)} aria-label="Delete Post-it"><Trash2/> Delete</button></div></article>)}</div></section>}
        </div>}

        {view === "report" && <div className="content"><p className="label">{task.label}</p><h2>{task.reportTitle}</h2><p>Enter each finding as it appears in your casebook. Capitalization and punctuation do not have to match exactly, but the recorded value should.</p><div className="report-evidence-summary"><span>Evidence recorded</span><strong>{currentEvidence.length}/{task.evidence.length}</strong><button onClick={() => { setBookView("current"); setView("casebook"); }}>Review casebook</button></div><div className="finding-fields">{task.fields.map((field, index) => <label key={field}><span>{field}</span><input value={answers[index] ?? ""} onChange={(event) => updateAnswer(index, event.target.value)} placeholder="Enter the casebook finding" autoComplete="off"/></label>)}</div>{feedback && <p className="feedback">{feedback}</p>}<button className="primary" disabled={isComplete} onClick={submit}>{isComplete ? "Finding accepted" : "Submit report"}</button></div>}
      </section>
      <aside className="status"><p>Current assignment</p><strong>{String(activeTask).padStart(2, "0")}</strong><span className="status-title">{isComplete ? "Case complete" : task.title}</span><Progress value={(currentEvidence.length / task.evidence.length) * 100}/><dl><div><dt>{solved[7] && archiveTrust > 0 ? "Recollection" : "Evidence"}</dt><dd>{currentEvidence.length} / {task.evidence.length}</dd></div><div><dt>Report</dt><dd>{solved[activeTask] ? "Accepted" : "Not submitted"}</dd></div><div><dt>Recovery</dt><dd>{recovery}%</dd></div></dl><button className="status-report" onClick={() => setView("report")}>Open report</button></aside>
    </section>
  </main>;
}
