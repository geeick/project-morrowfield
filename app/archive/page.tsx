"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

type Page = "home" | "method" | "participants" | "participant" | "notice" | "team" | "materials" | "publications" | "systems" | "activity" | "ethics" | "memos" | "memo";
type TaskNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const labels: Record<Page, string> = {
  home: "Project Home",
  method: "Methodology",
  participants: "Participant Logs",
  participant: "Participant Record",
  notice: "Collection Status",
  team: "Research Team",
  materials: "Study Materials",
  publications: "Publications",
  systems: "Server Records",
  activity: "Server Activity",
  ethics: "Ethics Review",
  memos: "Internal Memos",
  memo: "Internal Memo",
};
const evidenceKey = (task: TaskNumber) => `morrowfield:evidence-${String(task).padStart(2, "0")}`;
const solvedKey = (task: TaskNumber) => `morrowfield:solved-${String(task).padStart(2, "0")}`;

const participantLogs = [
  ["32-F", "047", "September 30, 2003", "N. Bell", "Recall follow-up"], ["31-C", "022", "September 29, 2003", "N. Bell", "Recall follow-up"], ["30-H", "063", "September 28, 2003", "J. Reed", "Image sequence"], ["29-B", "011", "September 27, 2003", "N. Bell", "Recall follow-up"], ["28-E", "039", "September 26, 2003", "J. Reed", "Map prompt"], ["27-A", "006", "September 25, 2003", "N. Bell", "Recall follow-up"], ["26-D", "051", "September 24, 2003", "N. Bell", "Interview"], ["25-G", "058", "September 23, 2003", "J. Reed", "Image sequence"], ["24-B", "017", "September 22, 2003", "N. Bell", "Recall follow-up"], ["23-F", "045", "September 21, 2003", "N. Bell", "Interview"], ["22-C", "026", "September 20, 2003", "J. Reed", "Map prompt"], ["21-A", "004", "September 19, 2003", "N. Bell", "Recall follow-up"], ["20-E", "036", "September 18, 2003", "N. Bell", "Image sequence"], ["19-D", "054", "September 17, 2003", "J. Reed", "Interview"], ["18-H", "069", "September 16, 2003", "N. Bell", "Recall follow-up"], ["17-A", "008", "September 15, 2003", "N. Bell", "Map prompt"], ["16-G", "060", "September 14, 2003", "J. Reed", "Interview"], ["15-C", "023", "September 13, 2003", "N. Bell", "Image sequence"], ["01-A", "014", "September 12, 2003", "E. Harrow", "Initial guided recall"],
] as const;

const participantLogNotes: Record<string, string> = {
  "32-F": "Participant recalled the municipal square without prompting but placed the clock tower on the wrong side of the street.",
  "31-C": "Participant repeated the market-day account from the packet and added a bakery that does not appear in the source material.",
  "30-H": "Participant identified the station photograph and described a platform canopy that is not visible in the image.",
  "29-B": "Participant recalled the river crossing consistently but changed the remembered color of the bridge railing.",
  "28-E": "Participant placed the school and post office correctly, then drew an additional lane behind the civic hall.",
  "27-A": "Participant described the harvest festival as a personal childhood memory before correcting the statement when prompted.",
  "26-D": "Participant gave a detailed account of the town library and reported uncertainty about whether the memory came from the study packet.",
  "25-G": "Participant recognized three festival photographs and attributed one unfamiliar face to a former neighbor.",
  "24-B": "Participant retained the street sequence from the prior interview but substituted a church for the municipal records office.",
  "23-F": "Participant described hearing a factory whistle near the river despite no audio material being used in the study.",
  "22-C": "Participant reproduced the main road accurately and added a footpath between the station and water tower.",
  "21-A": "Participant recalled the founding-year story with high confidence and treated two packet details as personally witnessed events.",
  "20-E": "Participant recognized the civic parade image and supplied names for two unidentified people in the photograph.",
  "19-D": "Participant reported a vivid memory of visiting the town square, then noted that the memory may have come from repeated exposure.",
  "18-H": "Participant preserved the same account of the water tower but moved it from the north edge of town to the western road.",
  "17-A": "Participant drew the central street grid from memory and omitted the rail line shown in the study map.",
  "16-G": "Participant described the town as familiar and recalled a grocery storefront not present in the constructed archive.",
  "15-C": "Participant recognized the station and festival photographs but incorrectly linked both images to the same street.",
  "01-A": "Participant recognized the water tower but could not recall the town’s name.",
};

const investigationFiveLogs: Record<string, { id: string; label: string }> = {
  "16-G": { id: "memory-16g", label: "unsupported place memory" },
  "19-D": { id: "memory-19d", label: "claimed visit to Morrowfield" },
  "23-F": { id: "memory-23f", label: "unsupported sensory memory" },
  "27-A": { id: "memory-27a", label: "personal childhood memory" },
};

const serverLogs = [
  ["September 18, 2003", "jreed", "index.html", "publish"], ["September 19, 2003", "nbell", "session-21-a.log", "upload"], ["September 22, 2003", "jreed", "map-register.dat", "read"], ["September 25, 2003", "nbell", "consent-index.csv", "read"], ["September 28, 2003", "evoss", "report-draft-04.doc", "upload"], ["October 01, 2003", "jreed", "materials-checksum.txt", "read"], ["October 02, 2003", "system", "collection.lock", "write"], ["October 03, 2003", "mcalder", "termination-notice.txt", "read"], ["October 06, 2003", "system", "backup-rotation.log", "write"], ["October 11, 2003", "evoss", "participant-index-03.zip", "export"],
] as const;

const memoIndex = [
  { id: "JR-03", date: "September 20, 2003", from: "J. Reed", subject: "Map coding discrepancy", body: "Two street-map responses used an obsolete landmark code. Coding sheet corrected; participant source files unchanged." },
  { id: "NB-05", date: "September 24, 2003", from: "N. Bell", subject: "Scheduling backlog", body: "Three follow-up sessions moved to afternoon blocks because the laboratory room was unavailable." },
  { id: "NB-07", date: "September 29, 2003", from: "N. Bell", subject: "Participant incident summary", body: "Four autobiographical-attribution incidents documented. Pattern now spans interview, sensory, and childhood-memory statements." },
  { id: "EV-11", date: "October 01, 2003", from: "E. Voss", subject: "Draft report circulation", body: "Working draft circulated internally. Statistical appendix remains incomplete pending final coding review." },
  { id: "MC-14", date: "October 02, 2003", from: "M. Calder", subject: "Continuation authorization", body: "Dr. Miriam Calder · Immediate suspension · October 02, 2003" },
  { id: "AR-02", date: "October 04, 2003", from: "Archives", subject: "Box transfer", body: "Paper consent forms transferred to locked departmental storage under standard records procedure." },
] as const;

export default function RecoveredWebsite() {
  const [page, setPage] = useState<Page>("home");
  const [activeTask, setActiveTask] = useState<TaskNumber>(1);
  const [storyStage, setStoryStage] = useState(0);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [ascending, setAscending] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState("01-A");
  const [serverNewest, setServerNewest] = useState(false);
  const [selectedMemoId, setSelectedMemoId] = useState("JR-03");
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);

  const sync = () => {
    const completed = ([1, 2, 3, 4, 5, 6, 7] as TaskNumber[]).filter((task) => localStorage.getItem(solvedKey(task)) === "true").length;
    const task: TaskNumber = localStorage.getItem(solvedKey(1)) !== "true" ? 1 : localStorage.getItem(solvedKey(2)) !== "true" ? 2 : localStorage.getItem(solvedKey(3)) !== "true" ? 3 : localStorage.getItem(solvedKey(4)) !== "true" ? 4 : localStorage.getItem(solvedKey(5)) !== "true" ? 5 : localStorage.getItem(solvedKey(6)) !== "true" ? 6 : 7;
    setStoryStage(completed);
    setActiveTask(task);
    const saved = JSON.parse(localStorage.getItem(evidenceKey(task)) ?? "[]");
    setEvidence(Array.isArray(saved) ? saved : []);
  };
  useEffect(() => { sync(); window.addEventListener("storage", sync); window.addEventListener("focus", sync); return () => { window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); }; }, []);
  useEffect(() => { if (!notice) return; const timeout = window.setTimeout(() => setNotice(""), 2400); return () => window.clearTimeout(timeout); }, [notice]);

  function capture(id: string, label: string, task: TaskNumber) {
    if (task !== activeTask || evidence.includes(id)) return;
    const next = [...evidence, id];
    localStorage.setItem(evidenceKey(task), JSON.stringify(next));
    setEvidence(next);
    setNotice(`${label} added to the casebook.`);
  }
  function captureKey(event: KeyboardEvent<HTMLSpanElement>, id: string, label: string, task: TaskNumber) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); capture(id, label, task); } }
  function Fact({ id, label, task, children }: { id: string; label: string; task: TaskNumber; children: ReactNode }) {
    const available = task === activeTask && !evidence.includes(id);
    return <span className={available ? "evidence-fact available" : "evidence-fact"} role={available ? "button" : undefined} tabIndex={available ? 0 : undefined} aria-label={available ? `Record ${label} in casebook` : undefined} onClick={() => capture(id, label, task)} onKeyDown={(event) => captureKey(event, id, label, task)}>{children}</span>;
  }
  const go = (destination: Page) => { setPage(destination); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const orderedLogs = useMemo(() => ascending ? [...participantLogs].reverse() : participantLogs, [ascending]);
  const visibleLogs = orderedLogs.slice((logPage - 1) * 5, logPage * 5);
  const selectedLog = participantLogs.find((log) => log[0] === selectedLogId) ?? participantLogs[participantLogs.length - 1];
  const selectedProjectDay = Number(selectedLog[2].split(" ")[1].replace(",", "")) - 4;
  const restoredActivity = (storyStage >= 7
    ? ["September 05, 2003", "case-27-041", "participant-index-03.zip", "read"]
    : ["September 05, 2026", "accession-session-041", "restored-export.ref", "read"]) as readonly [string, string, string, string];
  const activitySource = storyStage >= 6 ? [...serverLogs, restoredActivity] : [...serverLogs];
  const activity = serverNewest ? [...activitySource].reverse() : activitySource;
  const investigationFiveEvidence = investigationFiveLogs[selectedLog[0]];
  const selectedMemo = memoIndex.find((memo) => memo.id === selectedMemoId) ?? memoIndex[0];
  const selectedActivity = activitySource[selectedActivityIndex] ?? activitySource[0];
  const isRestoredActivity = storyStage >= 6 && selectedActivityIndex === serverLogs.length;
  const sectionIsActive = (section: Page) => page === section || (section === "participants" && page === "participant") || (section === "memos" && page === "memo") || (section === "systems" && page === "activity");

  return <main className="legacy-site"><div className="legacy-shell">
    <header className="legacy-header"><button className="legacy-wordmark" onClick={() => go("home")}><span>Bellwether University</span><strong>{storyStage >= 6 ? "Department of Recollective Studies" : "Department of Cognitive Studies"}</strong></button><form className="legacy-search" onSubmit={(event) => { event.preventDefault(); setNotice("Search service unavailable in recovered snapshot."); }}><label htmlFor="archive-search">Search Bellwether</label><input id="archive-search" defaultValue={storyStage >= 6 ? "Case 27-041" : ""}/><button type="submit">Go</button></form></header>
    <nav className="legacy-nav" aria-label="Project navigation">{(["home", "method", "participants", "notice"] as Page[]).map((id) => <button key={id} className={sectionIsActive(id) ? "active" : ""} onClick={() => go(id)}>{labels[id]}</button>)}</nav>
    <div className="legacy-columns"><aside><button className="sidebar-title" onClick={() => go("home")}>Project Morrowfield</button>{(["home", "team", "materials", "publications", "ethics", "memos", "systems"] as Page[]).map((id) => <button key={id} className={sectionIsActive(id) ? "active" : ""} onClick={() => go(id)}>{id === "home" ? "Overview" : labels[id]}</button>)}<hr/><small>Protocol BWU-03-118<br/>Last updated {storyStage >= 1 ? "09/19/03" : "09/18/03"}</small></aside>
      <article><p className="breadcrumbs">Bellwether › Research › {labels[page]}</p>
        {page === "home" && <><h1>Project Morrowfield</h1><p className="lead">A controlled study of memory conformity in constructed environments.</p><h2>Project overview</h2><p>Project Morrowfield examines how repeated exposure to a coherent fictional history influences autobiographical recall.</p><p>Participant sessions commenced <Fact id="official" label="official commencement date" task={1}>September 18, 2003</Fact>.</p><div className="legacy-rule"/><p className="legacy-meta">Principal investigator: Dr. Elian Voss<br/>Contact: evoss@bellwether.edu</p></>}
        {page === "method" && <><h1>Study Methodology</h1><p>Participants reviewed a fabricated municipal history, then completed guided-recall interviews at seven-day intervals.</p><h2>Materials control</h2><p>The fictional material was designed and sealed before the first participant session. <Fact id="materials-rule" label="materials control rule" task={4}>No additions were permitted after commencement.</Fact></p><h2>Indexing practice</h2><p>Session records are arranged by filing date. Cross-reference numbers refer to the materials register rather than participant identifiers.</p><div className="legacy-approval">APPROVED · 03 SEPT 2003</div></>}
        {page === "participants" && <><h1>Participant Log Index</h1><p>Recovered session records. Files display newest first unless the date heading is selected. Select a log number to open its complete record.</p><table className="log-table"><thead><tr><th>Log</th><th>Participant</th><th><button className="date-sort" onClick={() => { setAscending((value) => !value); setLogPage(1); }}>Recorded {ascending ? "▲" : "▼"}</button></th><th>Prepared by</th><th>Session</th></tr></thead><tbody>{visibleLogs.map((log) => <tr key={log[0]}><td><button className="log-record-link" onClick={() => { setSelectedLogId(log[0]); go("participant"); }}>{log[0]}</button></td><td>{log[1]}</td><td>{log[2]}</td><td>{log[3]}</td><td>{log[4]}</td></tr>)}</tbody></table><div className="log-pages"><span>Page {logPage} of 4</span>{[1, 2, 3, 4].map((number) => <button key={number} className={logPage === number ? "active" : ""} onClick={() => setLogPage(number)}>{number}</button>)}</div><p className="legacy-meta">Index contains 19 recovered session files · Participant identifiers have been pseudonymized.</p></>}
        {page === "participant" && <><button className="record-back" onClick={() => go("participants")}>‹ Return to Participant Log Index</button><h1>Session Log {selectedLog[0]}</h1><p className="lead">Guided-recall session record · Participant {selectedLog[1]}</p><dl className="record-metadata"><div><dt>Recorded</dt><dd>{selectedLog[0] === "01-A" ? <Fact id="session" label="earliest participant session" task={1}>{selectedLog[2]}</Fact> : selectedLog[2]}</dd></div><div><dt>Prepared by</dt><dd>{selectedLog[0] === "01-A" ? <Fact id="harrow-log" label="log preparer" task={2}>{selectedLog[3]}</Fact> : selectedLog[3]}</dd></div><div><dt>Session type</dt><dd>{selectedLog[4]}</dd></div><div><dt>Project day</dt><dd>{selectedProjectDay}</dd></div></dl><h2>Session summary</h2><p><strong>Participant {selectedLog[1]}.</strong> {investigationFiveEvidence && storyStage < 5 ? <Fact id={investigationFiveEvidence.id} label={investigationFiveEvidence.label} task={5}>{participantLogNotes[selectedLog[0]]}</Fact> : investigationFiveEvidence && storyStage >= 5 ? "No irregular autobiographical attribution recorded." : participantLogNotes[selectedLog[0]]}</p><h2>Filing notes</h2><p>The session was transcribed from the laboratory worksheet and entered into the participant index under its recorded date. Source worksheet retained in departmental storage.</p><p className="legacy-meta">Record {selectedLog[0]} · Participant {selectedLog[1]} · Filed by {selectedLog[3]}</p></>}
        {page === "notice" && <><h1>Collection Status</h1><p>Project Morrowfield was terminated. Participant materials were closed under university records policy on <Fact id="closure-memo" label="formal closure date" task={3}>October 02, 2003</Fact>.</p><div className="legacy-redaction">FINAL REPORT WITHHELD</div><p className="legacy-meta">Last verified backup: <Fact id="backup" label="last verified backup" task={1}>September 04, 2003</Fact><br/>Archive checksum incomplete</p>{storyStage >= 6 && <><h2>Recovery processing</h2><p>Recovery ticket accession-session-041 is assigned to <Fact id="current-case" label="current recovery case" task={7}>Case 27-041</Fact>. The ticket remains open while restored collection references are verified.</p><p className="legacy-meta">Automated accession service · verification pending</p></>}</>}
        {page === "team" && <><h1>Research Team</h1><p className="lead">Project Morrowfield was administered by the Memory and Suggestibility Laboratory.</p><div className="staff-list"><section><h2>Dr. Elian Voss</h2><p>Principal investigator · Experimental design and participant interviews</p></section><section><h2>Dr. Miriam Calder</h2><p>Faculty sponsor · Research ethics and methodology review</p></section><section><h2>Jonas Reed</h2><p>Graduate researcher · Materials construction and data coding</p></section><section><h2>Nadia Bell</h2><p>Research assistant · Session scheduling and records management</p></section>{storyStage >= 2 && <section><h2>Eleanor Harrow</h2><p>Project archivist · Collection preparation and records maintenance</p></section>}</div><p className="legacy-meta">Laboratory roster · Autumn 2003</p></>}
        {page === "materials" && <><h1>Study Materials</h1><p>Participants were shown a constructed municipal archive representing the fictional town of Morrowfield.</p><ul className="materials-list"><li><strong>Packet A</strong><span>Municipal history and founding records</span></li><li><strong>Packet B</strong><span>Street map and civic landmarks · {storyStage >= 4 ? "original issue 09/03/03" : <Fact id="packet-b-revision" label="Packet B revision record" task={4}>revised 09/22/03</Fact>}</span></li><li><strong>Packet C</strong><span>Festival photographs, 1971-1987</span></li><li><strong>Packet D</strong><span>Simulated newspaper extracts</span></li></ul><h2>Technical documents</h2><p><a className="document-link" href="/documents/morrowfield-methodology.pdf" target="_blank" rel="noopener" onClick={() => capture("methodology-pdf", "methodology appendix", 2)}>Morrowfield methodology appendix (PDF, 312 KB)</a></p>{storyStage >= 6 && <><h2>Recovery register</h2><p>Restored export reference RX-03 resolves to <Fact id="reopened-export" label="reopened export file" task={7}>participant-index-03.zip</Fact>. The archive retains the filename but not the exported file contents.</p></>}<p className="legacy-meta">Materials register copy 4 · Checked against laboratory inventory</p></>}
        {page === "publications" && <><h1>Publications</h1><p>No peer-reviewed findings were published from this project.</p><div className="publication-entry"><a className="document-link" href="/documents/voss-constructed-environments.pdf" target="_blank" rel="noopener" onClick={() => capture("voss-paper", "Voss publication", 2)}>Voss, E. (2003). Constructed environments and autobiographical conformity. (PDF)</a><span>Conference paper. Retrieved from the departmental working-paper index.</span></div></>}
        {page === "ethics" && <><h1>Ethics Review</h1><p className="lead">Protocol BWU-03-118 · continuation review</p><h2>Approval status</h2><p>Approved September 03, 2003 for staged exposure and repeated guided recall. Faculty sponsor: Dr. Miriam Calder.</p><h2>Continuation conditions</h2><p>Routine confusion between packet details and prompted recall may be documented without interruption. <Fact id="ethics-safeguard" label="participant safeguard" task={6}>Suspend exposure if a participant attributes constructed Morrowfield material to personal autobiographical experience.</Fact></p><h2>Administrative notes</h2><p>Follow-up scheduling may be adjusted by up to 48 hours. Any change to stimulus material requires separate methodological review.</p><p className="legacy-meta">Review copy 2 of 3 · Office of Human Subjects · filed 09/05/03</p></>}
        {page === "memos" && <><h1>Internal Memo Index</h1><p>Recovered departmental memoranda. Routine operational notes and project correspondence are retained together.</p><table className="log-table"><thead><tr><th>Memo</th><th>Date</th><th>From</th><th>Subject</th></tr></thead><tbody>{memoIndex.map((memo) => <tr key={memo.id}><td><button className="log-record-link" onClick={() => { setSelectedMemoId(memo.id); go("memo"); }}>{memo.id}</button></td><td>{memo.date}</td><td>{memo.from}</td><td>{memo.subject}</td></tr>)}</tbody></table><p className="legacy-meta">Six memoranda recovered · Attachments were not included in the transfer.</p></>}
        {page === "memo" && <><button className="record-back" onClick={() => go("memos")}>‹ Return to Internal Memo Index</button><h1>Memorandum {selectedMemo.id}</h1><dl className="record-metadata"><div><dt>Filed</dt><dd>{selectedMemo.date}</dd></div><div><dt>From</dt><dd>{selectedMemo.from}</dd></div><div><dt>Subject</dt><dd>{selectedMemo.subject}</dd></div><div><dt>Series</dt><dd>Project correspondence</dd></div></dl><h2>{selectedMemo.subject}</h2><p>{selectedMemo.id === "NB-07" ? <Fact id="incident-threshold" label="incident summary" task={6}>{selectedMemo.body}</Fact> : selectedMemo.id === "MC-14" ? <Fact id="termination-order" label="suspension authorization" task={6}>{selectedMemo.body}</Fact> : selectedMemo.body}</p><p>Filed with the departmental project correspondence series. Distribution copies and handwritten annotations were not retained.</p><p className="legacy-meta">Memo {selectedMemo.id} · From {selectedMemo.from} · Filed {selectedMemo.date}</p></>}
        {page === "systems" && <><h1>Site Administration</h1><p>Automated activity retained by the departmental server. Times shown in university local time. Select an access date to inspect the complete register entry.</p><h2>Access and export register</h2><table className="server-table"><thead><tr><th><button className="date-sort" onClick={() => setServerNewest((value) => !value)}>Accessed {serverNewest ? "▼" : "▲"}</button></th><th>Account</th><th>Resource</th><th>Action</th></tr></thead><tbody>{activity.filter((entry) => storyStage < 3 || entry[0] !== "October 11, 2003").map((entry) => <tr key={`${entry[0]}-${entry[2]}`}><td><button className="log-record-link" onClick={() => { setSelectedActivityIndex(activitySource.findIndex((record) => record === entry)); go("activity"); }}>{entry[0]}</button></td><td>{entry[1]}</td><td>{entry[2]}</td><td>{entry[3]}</td></tr>)}</tbody></table><p className="legacy-meta">Register source: /var/log/httpd/morrowfield-access.log<br/>Export records retained independently of collection files.</p></>}
        {page === "activity" && storyStage >= 3 && selectedActivity[0] === "October 11, 2003" && <><button className="record-back" onClick={() => go("systems")}>‹ Return to Access and Export Register</button><h1>Register Entry</h1><div className="missing-record"><strong>ENTRY NOT AVAILABLE</strong><p>The requested line could not be reconstructed from the current register copy.</p></div><p className="legacy-meta">Register source: /var/log/httpd/morrowfield-access.log</p></>}
        {page === "activity" && !(storyStage >= 3 && selectedActivity[0] === "October 11, 2003") && <><button className="record-back" onClick={() => go("systems")}>‹ Return to Access and Export Register</button><h1>Server Activity Record</h1><p className="lead">Recovered HTTP and collection activity entry.</p><dl className="record-metadata"><div><dt>Authenticated record</dt><dd>{isRestoredActivity ? <><Fact id="current-access-date" label="restored access date" task={7}>{selectedActivity[0]}</Fact> · {selectedActivity[1]}</> : selectedActivity[0] === "October 11, 2003" ? <Fact id="access-log" label="final authenticated access" task={3}>{selectedActivity[0]} · {selectedActivity[1]}</Fact> : `${selectedActivity[0]} · ${selectedActivity[1]}`}</dd></div><div><dt>Resource</dt><dd>{selectedActivity[0] === "October 11, 2003" ? <Fact id="export-file" label="post-closure export" task={3}>{selectedActivity[2]}</Fact> : selectedActivity[2]}</dd></div><div><dt>Action</dt><dd>{selectedActivity[3]}</dd></div><div><dt>Source</dt><dd>morrowfield-access.log</dd></div></dl><h2>Register notes</h2><p>This entry was reconstructed from the server activity register. Export events are retained separately from the corresponding collection files.</p><p className="legacy-meta">Automated record · University local time</p></>}
      </article>
    </div><footer>© 2003 Bellwether University · Text-only version · Accessibility · <button onClick={() => go("systems")}>Webmaster</button>{storyStage >= 6 ? " · Review session 27-041 retained" : ""}</footer></div>{notice && <div className="capture-notice" role="status">{notice}</div>}</main>;
}
