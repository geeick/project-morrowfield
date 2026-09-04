"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

type Page = "home" | "method" | "participants" | "notice" | "team" | "materials" | "publications" | "systems";
type TaskNumber = 1 | 2 | 3 | 4;

const labels: Record<Page, string> = { home: "Project Home", method: "Methodology", participants: "Participant Logs", notice: "Collection Status", team: "Research Team", materials: "Study Materials", publications: "Publications", systems: "Server Records" };
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

const serverLogs = [
  ["September 18, 2003", "jreed", "index.html", "publish"], ["September 19, 2003", "nbell", "session-21-a.log", "upload"], ["September 22, 2003", "jreed", "map-register.dat", "read"], ["September 25, 2003", "nbell", "consent-index.csv", "read"], ["September 28, 2003", "evoss", "report-draft-04.doc", "upload"], ["October 01, 2003", "jreed", "materials-checksum.txt", "read"], ["October 02, 2003", "system", "collection.lock", "write"], ["October 03, 2003", "mcalder", "termination-notice.txt", "read"], ["October 06, 2003", "system", "backup-rotation.log", "write"], ["October 11, 2003", "evoss", "participant-index-03.zip", "export"],
] as const;

export default function RecoveredWebsite() {
  const [page, setPage] = useState<Page>("home");
  const [activeTask, setActiveTask] = useState<TaskNumber>(1);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [ascending, setAscending] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState("01-A");
  const [serverNewest, setServerNewest] = useState(false);

  const sync = () => {
    const task: TaskNumber = localStorage.getItem(solvedKey(1)) !== "true" ? 1 : localStorage.getItem(solvedKey(2)) !== "true" ? 2 : localStorage.getItem(solvedKey(3)) !== "true" ? 3 : 4;
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
  function Fact({ id, label, task, children }: { id: string; label: string; task: TaskNumber; children: ReactNode }) { return <span className="evidence-fact" role="button" tabIndex={0} aria-label={`Record ${label} in casebook`} onClick={() => capture(id, label, task)} onKeyDown={(event) => captureKey(event, id, label, task)}>{children}</span>; }
  const go = (destination: Page) => { setPage(destination); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const orderedLogs = useMemo(() => ascending ? [...participantLogs].reverse() : participantLogs, [ascending]);
  const visibleLogs = orderedLogs.slice((logPage - 1) * 5, logPage * 5);
  const selectedLog = participantLogs.find((log) => log[0] === selectedLogId) ?? participantLogs[participantLogs.length - 1];
  const selectedProjectDay = Number(selectedLog[2].split(" ")[1].replace(",", "")) - 4;
  const activity = useMemo(() => serverNewest ? [...serverLogs].reverse() : serverLogs, [serverNewest]);

  return <main className="legacy-site"><div className="legacy-shell">
    <header className="legacy-header"><button className="legacy-wordmark" onClick={() => go("home")}><span>Bellwether University</span><strong>Department of Cognitive Studies</strong></button><form className="legacy-search" onSubmit={(event) => { event.preventDefault(); setNotice("Search service unavailable in recovered snapshot."); }}><label htmlFor="archive-search">Search Bellwether</label><input id="archive-search"/><button type="submit">Go</button></form></header>
    <nav className="legacy-nav" aria-label="Project navigation">{(["home", "method", "participants", "notice"] as Page[]).map((id) => <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)}>{labels[id]}</button>)}</nav>
    <div className="legacy-columns"><aside><button className="sidebar-title" onClick={() => go("home")}>Project Morrowfield</button>{(["home", "team", "materials", "publications", "systems"] as Page[]).map((id) => <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)}>{id === "home" ? "Overview" : labels[id]}</button>)}<hr/><small>Protocol BWU-03-118<br/>Last updated 09/18/03</small></aside>
      <article><p className="breadcrumbs">Bellwether › Research › {labels[page]}</p>
        {page === "home" && <><h1>Project Morrowfield</h1><p className="lead">A controlled study of memory conformity in constructed environments.</p><h2>Project overview</h2><p>Project Morrowfield examines how repeated exposure to a coherent fictional history influences autobiographical recall.</p><p>Participant sessions commenced <Fact id="official" label="official commencement date" task={1}>September 18, 2003</Fact>.</p><div className="legacy-rule"/><p className="legacy-meta">Principal investigator: Dr. Elian Voss<br/>Contact: evoss@bellwether.edu</p></>}
        {page === "method" && <><h1>Study Methodology</h1><p>Participants reviewed a fabricated municipal history, then completed guided-recall interviews at seven-day intervals.</p><h2>Materials control</h2><p>The fictional material was designed and sealed before the first participant session. <Fact id="materials-rule" label="materials control rule" task={4}>No additions were permitted after commencement.</Fact></p><h2>Indexing practice</h2><p>Session records are arranged by filing date. Cross-reference numbers refer to the materials register rather than participant identifiers.</p><div className="legacy-approval">APPROVED · 03 SEPT 2003</div></>}
        {page === "participants" && <><h1>Participant Log Index</h1><p>Recovered session records. Files display newest first unless the date heading is selected. Select any log number to read the recovered entry below.</p><table className="log-table"><thead><tr><th>Log</th><th>Participant</th><th><button className="date-sort" onClick={() => { setAscending((value) => !value); setLogPage(1); }}>Recorded {ascending ? "▲" : "▼"}</button></th><th>Prepared by</th><th>Session</th></tr></thead><tbody>{visibleLogs.map((log) => { const earliest = log[0] === "01-A"; return <tr key={log[0]} className={selectedLogId === log[0] ? "selected-log" : ""}><td><button className="log-record-link" aria-pressed={selectedLogId === log[0]} onClick={() => setSelectedLogId(log[0])}>{log[0]}</button></td><td>{log[1]}</td><td>{earliest ? <Fact id="session" label="earliest participant session" task={1}>{log[2]}</Fact> : log[2]}</td><td>{earliest ? <Fact id="harrow-log" label="log preparer" task={2}>{log[3]}</Fact> : log[3]}</td><td>{log[4]}</td></tr>; })}</tbody></table><div className="log-pages"><span>Page {logPage} of 4</span>{[1, 2, 3, 4].map((number) => <button key={number} className={logPage === number ? "active" : ""} onClick={() => setLogPage(number)}>{number}</button>)}</div><section className="log-detail" id={`log-${selectedLog[0]}`}><h2>Session Log {selectedLog[0]}</h2><p><strong>Participant {selectedLog[1]}.</strong> {selectedLog[4]}. {participantLogNotes[selectedLog[0]]}</p><p className="legacy-meta">Filed by {selectedLog[3]} · {selectedLog[2]} · Project day {selectedProjectDay}</p></section></>}
        {page === "notice" && <><h1>Collection Status</h1><p>Project Morrowfield was terminated. Participant materials were closed under university records policy on <Fact id="closure-memo" label="formal closure date" task={3}>October 02, 2003</Fact>.</p><div className="legacy-redaction">FINAL REPORT WITHHELD</div><p className="legacy-meta">Last verified backup: <Fact id="backup" label="last verified backup" task={1}>September 04, 2003</Fact><br/>Archive checksum incomplete</p></>}
        {page === "team" && <><h1>Research Team</h1><p className="lead">Project Morrowfield was administered by the Memory and Suggestibility Laboratory.</p><div className="staff-list"><section><h2>Dr. Elian Voss</h2><p>Principal investigator · Experimental design and participant interviews</p></section><section><h2>Dr. Miriam Calder</h2><p>Faculty sponsor · Research ethics and methodology review</p></section><section><h2>Jonas Reed</h2><p>Graduate researcher · Materials construction and data coding</p></section><section><h2>Nadia Bell</h2><p>Research assistant · Session scheduling and records management</p></section></div></>}
        {page === "materials" && <><h1>Study Materials</h1><p>Participants were shown a constructed municipal archive representing the fictional town of Morrowfield.</p><ul className="materials-list"><li><strong>Packet A</strong><span>Municipal history and founding records</span></li><li><strong>Packet B</strong><span>Street map and civic landmarks · <Fact id="packet-b-revision" label="Packet B revision record" task={4}>revised 09/22/03</Fact></span></li><li><strong>Packet C</strong><span>Festival photographs, 1971-1987</span></li><li><strong>Packet D</strong><span>Simulated newspaper extracts</span></li></ul><h2>Technical documents</h2><p><a className="document-link" href="/documents/morrowfield-methodology.pdf" target="_blank" rel="noopener" onClick={() => capture("methodology-pdf", "methodology appendix", 2)}>Morrowfield methodology appendix (PDF, 312 KB)</a></p></>}
        {page === "publications" && <><h1>Publications</h1><p>No peer-reviewed findings were published from this project.</p><div className="publication-entry"><a className="document-link" href="/documents/voss-constructed-environments.pdf" target="_blank" rel="noopener" onClick={() => capture("voss-paper", "Voss publication", 2)}>Voss, E. (2003). Constructed environments and autobiographical conformity. (PDF)</a><span>Conference paper. Retrieved from the departmental working-paper index.</span></div></>}
        {page === "systems" && <><h1>Site Administration</h1><p>Automated activity retained by the departmental server. Times shown in university local time.</p><h2>Access and export register</h2><table className="server-table"><thead><tr><th><button className="date-sort" onClick={() => setServerNewest((value) => !value)}>Accessed {serverNewest ? "▼" : "▲"}</button></th><th>Account</th><th>Resource</th><th>Action</th></tr></thead><tbody>{activity.map((entry) => { const final = entry[0] === "October 11, 2003"; return <tr key={`${entry[0]}-${entry[2]}`}><td>{final ? <Fact id="access-log" label="final authenticated access" task={3}>{entry[0]}</Fact> : entry[0]}</td><td>{entry[1]}</td><td>{final ? <Fact id="export-file" label="post-closure export" task={3}>{entry[2]}</Fact> : entry[2]}</td><td>{entry[3]}</td></tr>; })}</tbody></table><p className="legacy-meta">Register source: /var/log/httpd/morrowfield-access.log<br/>Export records retained independently of collection files.</p></>}
      </article>
    </div><footer>© 2003 Bellwether University · Text-only version · Accessibility · <button onClick={() => go("systems")}>Webmaster</button></footer></div>{notice && <div className="capture-notice" role="status">{notice}</div>}</main>;
}