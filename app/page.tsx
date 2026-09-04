"use client";

import { useEffect, useState } from "react";
import { Archive, BookOpen, ExternalLink, FileSearch, FolderOpen, LockKeyhole, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type View = "brief" | "archive" | "evidence" | "report";

const records = {
  official: { title: "Official commencement date", value: "September 18, 2003", source: "Project homepage" },
  session: { title: "Earliest participant session", value: "September 12, 2003", source: "Session Log 01-A" },
  backup: { title: "Last verified backup", value: "September 04, 2003", source: "Collection status" },
};

export default function Home() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("brief");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [actual, setActual] = useState("");
  const [claimed, setClaimed] = useState("");
  const [support, setSupport] = useState("");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const sync = () => {
      const saved = JSON.parse(localStorage.getItem("morrowfield:evidence") ?? "[]");
      setEvidence(Array.isArray(saved) ? saved : []);
      setSolved(localStorage.getItem("morrowfield:solved-01") === "true");
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const reset = () => {
    localStorage.removeItem("morrowfield:evidence");
    localStorage.removeItem("morrowfield:solved-01");
    setStarted(false); setView("brief"); setEvidence([]);
    setActual(""); setClaimed(""); setSupport(""); setFeedback(""); setSolved(false);
  };

  const normalize = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const isSeptemberDate = (value: string, day: "12" | "18") => {
    const answer = normalize(value);
    return [
      `september${day}2003`,
      `sept${day}2003`,
      `sep${day}2003`,
      `september${day}`,
      `sept${day}`,
      `sep${day}`,
      `09${day}2003`,
      `9${day}2003`,
      `09${day}03`,
      `9${day}03`,
    ].includes(answer);
  };

  const isSessionLog = (value: string) => {
    const answer = normalize(value);
    return (
      answer.includes("sessionlog") ||
      answer.includes("participantlog") ||
      answer.includes("log01a") ||
      answer.includes("session01a")
    );
  };

  const submit = () => {
    if (
      isSeptemberDate(actual, "12") &&
      isSeptemberDate(claimed, "18") &&
      isSessionLog(support)
    ) {
      localStorage.setItem("morrowfield:solved-01", "true");
      setSolved(true); setFeedback(""); setView("archive");
    } else if (!actual || !claimed || !support) {
      setFeedback("Complete all three fields before submitting the report.");
    } else if (!isSessionLog(support)) {
      setFeedback("That record does not establish when participant activity began.");
    } else {
      setFeedback("The evidence supports a contradiction, but one or both dates are incorrect.");
    }
  };

  if (!started) return (
    <main className="boot">
      <section className="boot-card">
        <div className="seal"><Archive /></div>
        <p className="eyebrow">Bellwether University Archives</p>
        <h1>The Morrowfield Collection</h1>
        <p>Accession review 27-041. Determine which recovered files are authentic before the legacy server is decommissioned.</p>
        <button className="primary" onClick={() => setStarted(true)}>Open case file</button>
        <small>Authorized archival workstation · Case 27-041</small>
      </section>
    </main>
  );

  return (
    <main className="workstation">
      <header className="system-bar">
        <div><Archive size={18}/><strong>Bellwether Digital Archives</strong><span>Case 27-041</span></div>
        <button onClick={reset}><RotateCcw size={15}/> Restart</button>
      </header>
      <section className="desktop">
        <nav className="rail" aria-label="Workstation applications">
          <button className={view==="brief"?"active":""} onClick={()=>setView("brief")}><BookOpen/><span>Brief</span></button>
          <button className={view==="archive"?"active":""} onClick={()=>setView("archive")}><FolderOpen/><span>Archive</span></button>
          <button className={view==="evidence"?"active":""} onClick={()=>setView("evidence")}><FileSearch/><span>Evidence</span><b>{evidence.length}</b></button>
          <button className={view==="report"?"active":""} onClick={()=>setView("report")}><LockKeyhole/><span>Report</span></button>
        </nav>
        <section className="window">
          <div className="window-title"><span>{view==="brief"?"Assignment":view==="archive"?"Archive Browser":view==="evidence"?"Evidence File":"Accession Report"}</span><i>□ □ ×</i></div>

          {view==="brief" && <div className="content">
            <p className="label">Investigation 01</p>
            <h2>Establish the project’s commencement date</h2>
            <p>Three recovered versions of the Project Morrowfield website contain conflicting dates. Determine when participant activity actually began and document the discrepancy.</p>
            <div className="memo"><strong>Required finding</strong><p>Identify the earliest defensible commencement date, the date claimed publicly, and the record that proves the conflict.</p></div>
            <button className="primary" onClick={()=>setView("archive")}>Open archive browser</button>
          </div>}

          {view==="archive" && <div className="content external-archive">
            <p className="label">Recovered external resource</p>
            <h2>Project Morrowfield website</h2>
            <p>The recovered collection is isolated from the archival workstation. Open it in a separate browser tab, capture relevant records there, then return to this case.</p>
            <div className="external-file">
              <FolderOpen />
              <div><strong>morrowfield.bellwether.edu</strong><span>Snapshot: 18 September 2003</span></div>
              <a className="primary" href="/archive" target="_blank" rel="noopener">Open recovered website <ExternalLink size={16}/></a>
            </div>
            {solved && <div className="warning">The recovered website changed after your finding was accepted. Reopen it and inspect the homepage.</div>}
          </div>}

          {view==="evidence" && <div className="content">
            <p className="label">Collected records · {evidence.length}/3</p><h2>Evidence File</h2>
            {!evidence.length ? <p className="empty">No evidence saved. Inspect recovered pages and save relevant records.</p> :
              <div className="evidence-list">{evidence.map((id,index) => {
                const item=records[id as keyof typeof records];
                return <article key={id}><span>EX-{String(index+1).padStart(2,"0")}</span><div><h3>{item.title}</h3><strong>{item.value}</strong><p>{item.source}</p></div></article>;
              })}</div>}
          </div>}

          {view==="report" && <div className="content">
            <p className="label">Accession report · Finding 01</p><h2>Document the discrepancy</h2>
            <p>Write the finding in your own words. Dates may be entered in any ordinary format.</p>
            <div className="finding-fields">
              <label>
                <span>When did participant activity actually begin?</span>
                <input value={actual} onChange={(event)=>setActual(event.target.value)} placeholder="Enter a date" autoComplete="off"/>
              </label>
              <label>
                <span>What date did the public website claim?</span>
                <input value={claimed} onChange={(event)=>setClaimed(event.target.value)} placeholder="Enter a date" autoComplete="off"/>
              </label>
              <label>
                <span>Which record proves the contradiction?</span>
                <input value={support} onChange={(event)=>setSupport(event.target.value)} placeholder="Enter the record name" autoComplete="off"/>
              </label>
            </div>
            {feedback && <p className="feedback">{feedback}</p>}
            <button className="primary" disabled={solved} onClick={submit}>{solved?"Finding accepted":"Submit finding"}</button>
          </div>}
        </section>
        <aside className="status"><p>Archive recovery</p><strong>{solved?22:14}%</strong><Progress value={solved?22:14}/>
          <dl><div><dt>Finding</dt><dd>{solved?"Accepted":"Incomplete"}</dd></div><div><dt>Evidence</dt><dd>{evidence.length} / 3</dd></div><div><dt>Integrity</dt><dd>{solved?"Unstable":"Degraded"}</dd></div></dl>
          {solved && <div className="warning">The recovered page changed after your finding was accepted.</div>}
        </aside>
      </section>
    </main>
  );
}
