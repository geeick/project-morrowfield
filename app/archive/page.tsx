"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

type Page =
  | "home"
  | "method"
  | "participants"
  | "notice"
  | "team"
  | "materials"
  | "publications";

const pageLabels: Record<Page, string> = {
  home: "Project Home",
  method: "Methodology",
  participants: "Participant Logs",
  notice: "Collection Status",
  team: "Research Team",
  materials: "Study Materials",
  publications: "Publications",
};

export default function RecoveredWebsite() {
  const [page, setPage] = useState<Page>("home");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [notice, setNotice] = useState("");

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

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function capture(id: string, label: string) {
    if (solved || evidence.includes(id)) return;
    const next = [...evidence, id];
    localStorage.setItem("morrowfield:evidence", JSON.stringify(next));
    setEvidence(next);
    setNotice(`${label} added to the case file.`);
  }

  function captureWithKeyboard(
    event: KeyboardEvent<HTMLSpanElement>,
    id: string,
    label: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      capture(id, label);
    }
  }

  function EvidenceFact({
    id,
    label,
    children,
  }: {
    id: string;
    label: string;
    children: ReactNode;
  }) {
    return (
      <span
        className="evidence-fact"
        role="button"
        tabIndex={0}
        aria-label={`Add ${label} to the case file`}
        onClick={() => capture(id, label)}
        onKeyDown={(event) => captureWithKeyboard(event, id, label)}
      >
        {children}
      </span>
    );
  }

  const navigate = (destination: Page) => {
    setPage(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="legacy-site">
      <div className="legacy-shell">
        <header className="legacy-header">
          <button className="legacy-wordmark" onClick={() => navigate("home")}>
            <span>Bellwether University</span>
            <strong>Department of Cognitive Studies</strong>
          </button>
          <form
            className="legacy-search"
            onSubmit={(event) => {
              event.preventDefault();
              setNotice("Search service unavailable in recovered snapshot.");
            }}
          >
            <label htmlFor="archive-search">Search Bellwether</label>
            <input id="archive-search" />
            <button type="submit">Go</button>
          </form>
        </header>

        <nav className="legacy-nav" aria-label="Project navigation">
          {(["home", "method", "participants", "notice"] as Page[]).map((id) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => navigate(id)}
            >
              {pageLabels[id]}
            </button>
          ))}
        </nav>

        <div className="legacy-columns">
          <aside>
            <button className="sidebar-title" onClick={() => navigate("home")}>
              Project Morrowfield
            </button>
            <button className={page === "home" ? "active" : ""} onClick={() => navigate("home")}>
              Overview
            </button>
            <button className={page === "team" ? "active" : ""} onClick={() => navigate("team")}>
              Research team
            </button>
            <button className={page === "materials" ? "active" : ""} onClick={() => navigate("materials")}>
              Study materials
            </button>
            <button className={page === "publications" ? "active" : ""} onClick={() => navigate("publications")}>
              Publications
            </button>
            <hr />
            <small>Protocol BWU-03-118<br />Last updated 09/18/03</small>
          </aside>

          <article className={solved && page === "home" ? "page-shift" : ""}>
            <p className="breadcrumbs">
              Bellwether › Research › {pageLabels[page]}
            </p>

            {page === "home" && (
              <>
                <h1>Project Morrowfield</h1>
                <p className="lead">
                  A controlled study of memory conformity in constructed environments.
                </p>
                <h2>Project overview</h2>
                <p>
                  Project Morrowfield examines how repeated exposure to a coherent
                  fictional history influences autobiographical recall.
                </p>
                <p>
                  Participant sessions commenced{" "}
                  {solved ? (
                    <span>September 12, 2003</span>
                  ) : (
                    <EvidenceFact id="official" label="official commencement date">
                      September 18, 2003
                    </EvidenceFact>
                  )}
                  .
                </p>
                {solved && (
                  <p className="changed-record">Research team: five authorized investigators.</p>
                )}
                <div className="legacy-rule" />
                <p className="legacy-meta">
                  Principal investigator: Dr. Elian Voss<br />
                  Contact: evoss@bellwether.edu
                </p>
                {solved && (
                  <div className="archive-alert">
                    This page differs from the capture you previously reviewed.
                  </div>
                )}
              </>
            )}

            {page === "method" && (
              <>
                <h1>Study Methodology</h1>
                <p>
                  Participants reviewed a fabricated municipal history, then
                  completed guided-recall interviews at seven-day intervals.
                </p>
                <h2>Materials control</h2>
                <p>
                  The fictional material was designed and sealed before the first
                  participant session. No additions were permitted after commencement.
                </p>
                <div className="legacy-approval">APPROVED · 03 SEPT 2003</div>
              </>
            )}

            {page === "participants" && (
              <>
                <h1>Session Log 01-A</h1>
                <table>
                  <tbody>
                    <tr><th>Participant</th><td>014</td></tr>
                    <tr><th>Session</th><td>Initial guided recall</td></tr>
                    <tr>
                      <th>Recorded</th>
                      <td>
                        <EvidenceFact id="session" label="earliest participant session">
                          September 12, 2003
                        </EvidenceFact>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <blockquote>
                  Participant recognized the water tower but could not recall the
                  town’s name. Asked twice whether the girl in the festival photograph
                  would be interviewed.
                </blockquote>
                <p className="legacy-meta">Filed by E. Voss · Project day 8</p>
              </>
            )}

            {page === "notice" && (
              <>
                <h1>Collection Status</h1>
                <p>
                  This project was terminated. Participant materials were destroyed
                  under university policy.
                </p>
                <div className="legacy-redaction">FINAL REPORT WITHHELD</div>
                <p className="legacy-meta">
                  Last verified backup:{" "}
                  <EvidenceFact id="backup" label="last verified backup">
                    September 04, 2003
                  </EvidenceFact>
                  <br />
                  Archive checksum incomplete
                </p>
              </>
            )}

            {page === "team" && (
              <>
                <h1>Research Team</h1>
                <p className="lead">
                  Project Morrowfield was administered by the Memory and Suggestibility Laboratory.
                </p>
                <div className="staff-list">
                  <section><h2>Dr. Elian Voss</h2><p>Principal investigator · Experimental design and participant interviews</p></section>
                  <section><h2>Dr. Miriam Calder</h2><p>Faculty sponsor · Research ethics and methodology review</p></section>
                  <section><h2>Jonas Reed</h2><p>Graduate researcher · Materials construction and data coding</p></section>
                  <section><h2>Nadia Bell</h2><p>Research assistant · Session scheduling and records management</p></section>
                </div>
              </>
            )}

            {page === "materials" && (
              <>
                <h1>Study Materials</h1>
                <p>
                  Participants were shown a constructed municipal archive representing
                  the fictional town of Morrowfield.
                </p>
                <ul className="materials-list">
                  <li><strong>Packet A</strong><span>Municipal history and founding records</span></li>
                  <li><strong>Packet B</strong><span>Street map and civic landmarks</span></li>
                  <li><strong>Packet C</strong><span>Festival photographs, 1971–1987</span></li>
                  <li><strong>Packet D</strong><span>Simulated newspaper extracts</span></li>
                </ul>
                <p className="legacy-meta">Digital copies restricted pending records review.</p>
              </>
            )}

            {page === "publications" && (
              <>
                <h1>Publications</h1>
                <p>No peer-reviewed findings were published from this project.</p>
                <div className="publication-entry">
                  <strong>Voss, E. (2003). Constructed environments and autobiographical conformity.</strong>
                  <span>Conference abstract withdrawn by author.</span>
                </div>
              </>
            )}
          </article>
        </div>

        <footer>
          © 2003 Bellwether University · Text-only version · Accessibility · Webmaster
        </footer>
      </div>

      {notice && <div className="capture-notice" role="status">{notice}</div>}
    </main>
  );
}
