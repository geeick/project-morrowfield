"use client";

import { useEffect, useState } from "react";
import { Check, FilePlus2 } from "lucide-react";

type Page = "home" | "method" | "participants" | "notice";

const evidenceForPage: Partial<Record<Page, string>> = {
  home: "official",
  participants: "session",
  notice: "backup",
};

export default function RecoveredWebsite() {
  const [page, setPage] = useState<Page>("home");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const sync = () => {
    const stored = JSON.parse(localStorage.getItem("morrowfield:evidence") ?? "[]");
    setEvidence(Array.isArray(stored) ? stored : []);
    setSolved(localStorage.getItem("morrowfield:solved-01") === "true");
  };

  useEffect(() => {
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function capture() {
    const id = evidenceForPage[page];
    if (!id || evidence.includes(id)) return;
    const next = [...evidence, id];
    localStorage.setItem("morrowfield:evidence", JSON.stringify(next));
    setEvidence(next);
  }

  const evidenceId = evidenceForPage[page];
  const captured = evidenceId ? evidence.includes(evidenceId) : false;

  return (
    <main className="legacy-site">
      <header className="capture-bar">
        <div><span>BWU ARCHIVE CAPTURE</span><strong>Snapshot 18 SEP 2003</strong></div>
        {evidenceId ? (
          <button disabled={captured || solved} onClick={capture}>
            {captured ? <><Check size={15}/> Captured to case file</> : <><FilePlus2 size={15}/> Capture relevant record</>}
          </button>
        ) : <span className="no-record">No relevant record detected on this page</span>}
      </header>

      <div className="legacy-shell">
        <header className="legacy-header">
          <div className="legacy-wordmark"><span>Bellwether University</span><strong>Department of Cognitive Studies</strong></div>
          <div className="legacy-search">Search Bellwether <button>Go</button></div>
        </header>
        <nav className="legacy-nav">
          <button className={page==="home"?"active":""} onClick={()=>setPage("home")}>Project Home</button>
          <button className={page==="method"?"active":""} onClick={()=>setPage("method")}>Methodology</button>
          <button className={page==="participants"?"active":""} onClick={()=>setPage("participants")}>Participant Logs</button>
          <button className={page==="notice"?"active":""} onClick={()=>setPage("notice")}>Collection Status</button>
        </nav>
        <div className="legacy-columns">
          <aside>
            <strong>Project Morrowfield</strong>
            <a>Overview</a><a>Research team</a><a>Study materials</a><a>Publications</a>
            <hr/>
            <small>Protocol BWU-03-118<br/>Last updated 09/18/03</small>
          </aside>
          <article className={solved && page==="home" ? "page-shift" : ""}>
            {page==="home" && <>
              <p className="breadcrumbs">Bellwether › Research › Active Studies</p>
              <h1>Project Morrowfield</h1>
              <p className="lead">A controlled study of memory conformity in constructed environments.</p>
              <h2>Project overview</h2>
              <p>Project Morrowfield examines how repeated exposure to a coherent fictional history influences autobiographical recall.</p>
              <p>Participant sessions commenced <mark>{solved ? "September 12, 2003" : "September 18, 2003"}</mark>.</p>
              {solved && <p className="changed-record">Research team: five authorized investigators.</p>}
              <div className="legacy-rule"/>
              <p className="legacy-meta">Principal investigator: Dr. Elian Voss<br/>Contact: evoss@bellwether.edu</p>
              {solved && <div className="archive-alert">This page differs from the capture you previously reviewed.</div>}
            </>}
            {page==="method" && <>
              <p className="breadcrumbs">Bellwether › Project Morrowfield › Methodology</p>
              <h1>Study Methodology</h1>
              <p>Participants reviewed a fabricated municipal history, then completed guided-recall interviews at seven-day intervals.</p>
              <h2>Materials control</h2>
              <p>The fictional material was designed and sealed before the first participant session. No additions were permitted after commencement.</p>
              <div className="legacy-approval">APPROVED · 03 SEPT 2003</div>
            </>}
            {page==="participants" && <>
              <p className="breadcrumbs">Bellwether › Project Morrowfield › Participant Logs</p>
              <h1>Session Log 01-A</h1>
              <table><tbody><tr><th>Participant</th><td>014</td></tr><tr><th>Session</th><td>Initial guided recall</td></tr><tr><th>Recorded</th><td><mark>September 12, 2003</mark></td></tr></tbody></table>
              <blockquote>Participant recognized the water tower but could not recall the town’s name. Asked twice whether the girl in the festival photograph would be interviewed.</blockquote>
              <p className="legacy-meta">Filed by E. Voss · Project day 8</p>
            </>}
            {page==="notice" && <>
              <p className="breadcrumbs">Bellwether › Project Morrowfield › Collection Status</p>
              <h1>Collection Status</h1>
              <p>This project was terminated. Participant materials were destroyed under university policy.</p>
              <div className="legacy-redaction">FINAL REPORT WITHHELD</div>
              <p className="legacy-meta">Last verified backup: <mark>September 04, 2003</mark><br/>Archive checksum incomplete</p>
            </>}
          </article>
        </div>
        <footer>© 2003 Bellwether University · Text-only version · Accessibility · Webmaster</footer>
      </div>
    </main>
  );
}
