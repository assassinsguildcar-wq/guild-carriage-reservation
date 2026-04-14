"use client";

import { useEffect, useState } from "react";

const SAMPLE: Record<string, string> = {};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const _now = new Date();
const TODAY_STR = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;

function buildCells(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function prettyDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CalendarPage() {
  const [year, setYear] = useState(_now.getFullYear());
  const [month, setMonth] = useState(_now.getMonth() + 1);
  const [reservations, setReservations] = useState<Record<string, string>>(SAMPLE);

  const [modalDate, setModalDate] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const memberNames = members;
  const [selMember, setSelMember] = useState("");
  const [selOperator, setSelOperator] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formError, setFormError] = useState("");

  const cells = buildCells(year, month);
  const monthHeading = new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const fetchReservations = async (targetYear: number, targetMonth: number) => {
    const monthStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
    const res = await fetch(`/api/reservations?month=${monthStr}`);
    const data = await res.json();

    if (data.reservations) {
      const map: Record<string, string> = {};
      data.reservations.forEach((r: any) => {
        map[r.date] = r.member_name;
      });
      setReservations(map);
    } else {
      setReservations({});
    }
  };

  const goPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const openModal = (iso: string) => {
    setModalDate(iso);
    setSelMember(reservations[iso] ?? "");
    setSelOperator("");
    setConfirmDelete(false);
    setFormError("");
  };

  const closeModal = () => {
    setModalDate(null);
    setFormError("");
    setConfirmDelete(false);
  };

  const handleSave = async () => {
    if (!selMember) {
      setFormError("Please select a member.");
      return;
    }

    if (!selOperator) {
      setFormError("Please select your own name.");
      return;
    }

    if (!modalDate) return;

    const existing = reservations[modalDate];

    let res: Response;

    if (existing) {
      res = await fetch("/api/reservations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_date: modalDate,
          new_date: modalDate,
          member_name: selMember,
        }),
      });
    } else {
      res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: modalDate,
          member_name: selMember,
        }),
      });
    }

    const data = await res.json();

    if (data.error) {
      setFormError(data.error);
      return;
    }

    await fetchReservations(year, month);
    closeModal();
  };

  const handleDelete = async () => {
    if (!modalDate) return;

    const res = await fetch("/api/reservations", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: modalDate,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setFormError(data.error);
      setConfirmDelete(false);
      return;
    }

    await fetchReservations(year, month);
    closeModal();
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await fetch("/api/members");
      const data = await res.json();

      if (Array.isArray(data.members)) {
        setMembers(data.members.map((m: any) => m.name));
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    fetchReservations(year, month);
  }, [year, month]);

  const existingMember = modalDate ? reservations[modalDate] : undefined;

  return (
    <>
      <style jsx global>{GUILD_CSS}</style>

      <div className="gc-page">
        <header className="gc-header">
          <div className="gc-crest-wrap">
            <svg className="gc-crest" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M32 3L59 14V37C59 54 47 66 32 71C17 66 5 54 5 37V14L32 3Z"
                stroke="#c9a027"
                strokeWidth="1.2"
                fill="#120e0a"
              />
              <path
                d="M32 8L54 18V37C54 51 43 62 32 67C21 62 10 51 10 37V18L32 8Z"
                stroke="#4a3510"
                strokeWidth="0.8"
                fill="none"
              />
              <line x1="19" y1="22" x2="45" y2="54" stroke="#c9a027" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="45" y1="22" x2="19" y2="54" stroke="#c9a027" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="32" cy="38" r="6.5" stroke="#c9a027" strokeWidth="0.9" fill="none" />
              <circle cx="32" cy="38" r="2" fill="#c9a027" />
            </svg>
          </div>

          <h1 className="gc-title">Guild Carriage Reservation</h1>
          <p className="gc-subtitle">Manage carriage duty assignments for guild members.</p>

          <div className="gc-ornament">
            <span className="gc-ornament-line" />
            <span className="gc-ornament-diamond">◆</span>
            <span className="gc-ornament-line" />
          </div>
        </header>

        <main className="gc-main">
          <div className="gc-settings-row">
            <button
              onClick={() => (window.location.href = "/settings")}
              className="gc-settings-btn"
            >
              Manage Members
            </button>
          </div>

          <div className="gc-nav">
            <button onClick={goPrev} className="gc-nav-btn" aria-label="Previous month">
              ‹
            </button>

            <h2 className="gc-month-label">{monthHeading}</h2>

            <button onClick={goNext} className="gc-nav-btn" aria-label="Next month">
              ›
            </button>
          </div>

          <div className="gc-panel">
            <div className="gc-weekdays">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  className={`gc-wday${i === 0 ? " gc-wday--sun" : i === 6 ? " gc-wday--sat" : ""}`}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="gc-grid">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="gc-cell gc-cell--empty" />;
                }

                const iso = toISO(year, month, day);
                const member = reservations[iso];
                const isToday = iso === TODAY_STR;
                const wday = idx % 7;

                return (
                  <button
                    key={iso}
                    onClick={() => openModal(iso)}
                    className={[
                      "gc-cell",
                      member ? "gc-cell--reserved" : "gc-cell--open",
                      isToday ? "gc-cell--today" : "",
                      wday === 0 ? "gc-cell--sun" : "",
                      wday === 6 ? "gc-cell--sat" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="gc-day-num">{day}</span>
                    {member && <span className="gc-day-name">{member}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="gc-footer">
            <div className="gc-legend">
              <span className="gc-legend-item">
                <span className="gc-legend-dot gc-legend-dot--reserved" />
                Reserved
              </span>
              <span className="gc-legend-item">
                <span className="gc-legend-dot gc-legend-dot--open" />
                Open
              </span>
              <span className="gc-legend-item">
                <span className="gc-legend-dot gc-legend-dot--today" />
                Today
              </span>
            </div>

            <p className="gc-hint">Tap any date to assign or edit a carriage duty</p>
          </div>
        </main>
      </div>

      {modalDate && (
        <div
          className="gc-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="gc-modal" role="dialog" aria-modal="true">
            <div className="gc-modal-head">
              <div className="gc-modal-head-inner">
                <span className="gc-modal-emoji">🐴</span>
                <div>
                  <h3 className="gc-modal-title">
                    {existingMember ? "Edit Assignment" : "Assign Duty"}
                  </h3>
                  <p className="gc-modal-date">{prettyDate(modalDate)}</p>
                </div>
              </div>

              <button onClick={closeModal} className="gc-modal-close" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="gc-modal-body">
              {existingMember && (
                <div className="gc-current">
                  <span className="gc-current-label">Currently assigned</span>
                  <span className="gc-current-name">{existingMember}</span>
                </div>
              )}

              <div className="gc-field">
                <label className="gc-field-label">
                  Reserved member <span className="gc-req">*</span>
                </label>
                <div className="gc-select-wrap">
                  <select
                    value={selMember}
                    onChange={(e) => setSelMember(e.target.value)}
                    className="gc-select"
                  >
                    <option value="">— Select reserved member —</option>
                    {memberNames.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="gc-select-arrow">▾</span>
                </div>
              </div>

              <div className="gc-field">
                <label className="gc-field-label">
                  Edited by <span className="gc-req">*</span>
                </label>
                <div className="gc-select-wrap">
                  <select
                    value={selOperator}
                    onChange={(e) => setSelOperator(e.target.value)}
                    className="gc-select"
                  >
                    <option value="">— Select editor name —</option>
                    {memberNames.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="gc-select-arrow">▾</span>
                </div>
              </div>

              {formError && <p className="gc-error">{formError}</p>}

              {confirmDelete ? (
                <div className="gc-delete-confirm">
                  <p className="gc-delete-msg">
                    Remove <strong>{existingMember}</strong>&apos;s assignment on this date?
                  </p>
                  <div className="gc-delete-btns">
                    <button onClick={handleDelete} className="gc-btn gc-btn--danger-solid">
                      Yes, Remove
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="gc-btn gc-btn--ghost">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gc-actions">
                  <button onClick={handleSave} className="gc-btn gc-btn--gold">
                    {existingMember ? "Save Changes" : "Assign Duty"}
                  </button>

                  {existingMember && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="gc-btn gc-btn--danger"
                    >
                      Remove Assignment
                    </button>
                  )}

                  <button onClick={closeModal} className="gc-btn gc-btn--ghost">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const GUILD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

.gc-page {
  min-height: 100vh;
  padding: 1.25rem 0.85rem 3rem;
  background: #09080a;
  color: #ddd0b8;
  font-family: 'EB Garamond', Georgia, serif;
  -webkit-tap-highlight-color: transparent;
}

.gc-header {
  max-width: 620px;
  margin: 0 auto 1.5rem;
  text-align: center;
}

.gc-crest-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 0.9rem;
}

.gc-crest {
  width: 58px;
  height: 68px;
  filter: drop-shadow(0 2px 16px rgba(201,160,39,0.25));
}

.gc-title {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: clamp(1.15rem, 5.6vw, 1.8rem);
  font-weight: 700;
  color: #c9a027;
  letter-spacing: 0.03em;
  margin: 0 0 0.45rem;
  line-height: 1.35;
}

.gc-subtitle {
  font-size: 1.05rem;
  color: #6a5e48;
  font-style: italic;
  margin: 0 0 1.1rem;
  line-height: 1.5;
  padding: 0 0.4rem;
}

.gc-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}

.gc-ornament-line {
  display: block;
  height: 1px;
  width: 56px;
  background: linear-gradient(to right, transparent, #4a3510, transparent);
}

.gc-ornament-diamond {
  color: #c9a027;
  font-size: 0.55rem;
  opacity: 0.7;
}

.gc-main {
  max-width: 620px;
  margin: 0 auto;
}

.gc-settings-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.85rem;
}

.gc-settings-btn {
  min-width: 108px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  border: 1px solid #2e2518;
  border-radius: 8px;
  background: #120f0c;
  color: #c9a027;
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.gc-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.gc-nav-btn {
  width: 46px;
  height: 46px;
  min-width: 46px;
  min-height: 46px;
  border: 1px solid #2e2518;
  border-radius: 10px;
  background: #120f0c;
  color: #c9a027;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  line-height: 1;
  touch-action: manipulation;
}

.gc-month-label {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.05rem, 4.8vw, 1.4rem);
  font-weight: 600;
  color: #ddd0b8;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
  text-align: center;
  flex: 1;
  line-height: 1.35;
}

.gc-panel {
  border: 1px solid #2e2518;
  border-radius: 12px;
  background: #0f0d0a;
  padding: 0.7rem;
}

.gc-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
}

.gc-wday {
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 0.52rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4a3e28;
  padding: 0.25rem 0;
}

.gc-wday--sun { color: #6a3535; }
.gc-wday--sat { color: #354668; }

.gc-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.gc-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 6px 3px 3px;
  border: 1px solid #1e1a14;
  border-radius: 8px;
  background: #120f0c;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  min-width: 0;
  min-height: 46px;
  touch-action: manipulation;
}

.gc-cell--empty {
  background: transparent;
  border-color: transparent;
  cursor: default;
}

.gc-cell--reserved {
  background: #1c1508;
  border-color: #5a4010;
}

.gc-cell--today {
  border-color: #c9a027 !important;
}

.gc-day-num {
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #5e5240;
  line-height: 1.1;
}

.gc-cell--reserved .gc-day-num { color: #8a7030; }
.gc-cell--today .gc-day-num { color: #c9a027; font-weight: 700; }

.gc-day-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e6c46a;
  margin-top: 4px;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.25;
}

.gc-footer {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.gc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1rem;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #5a5040;
}

.gc-legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.gc-legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.gc-legend-dot--reserved { background: #1c1508; border: 1px solid #5a4010; }
.gc-legend-dot--open { background: #120f0c; border: 1px solid #1e1a14; }
.gc-legend-dot--today { background: #120f0c; border: 1px solid #c9a027; }

.gc-hint {
  font-style: italic;
  color: #3e3428;
  font-size: 0.92rem;
  margin: 0;
  text-align: center;
  line-height: 1.45;
  padding: 0 0.35rem;
}

.gc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4,3,2,0.82);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding-top: env(safe-area-inset-top);
}

@media (min-width: 600px) {
  .gc-overlay {
    align-items: center;
    padding: 1rem;
  }
}

.gc-modal {
  background: #100e0b;
  width: 100%;
  max-width: 440px;
  max-height: min(92vh, 820px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 16px 16px 0 0;
  border: 1px solid #2e2518;
  border-top: 2px solid #c9a027;
  padding-bottom: calc(0.25rem + env(safe-area-inset-bottom));
}

@media (min-width: 600px) {
  .gc-modal {
    border-radius: 14px;
    border-top: 1px solid #2e2518;
  }
}

.gc-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1rem 0.85rem;
  border-bottom: 1px solid #1e1a14;
  gap: 0.75rem;
}

.gc-modal-head-inner {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.gc-modal-emoji {
  font-size: 1.45rem;
  line-height: 1;
  flex-shrink: 0;
}

.gc-modal-title {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #c9a027;
  letter-spacing: 0.05em;
  margin: 0 0 0.2rem;
  line-height: 1.35;
}

.gc-modal-date {
  font-size: 0.94rem;
  color: #6a5e48;
  margin: 0;
  font-style: italic;
  line-height: 1.45;
}

.gc-modal-close {
  background: transparent;
  border: none;
  color: #4a4030;
  font-size: 1rem;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  cursor: pointer;
  touch-action: manipulation;
}

.gc-modal-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.gc-current {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1a1508;
  border: 1px solid #3e2e10;
  border-radius: 8px;
  padding: 0.7rem 0.85rem;
  flex-wrap: wrap;
}

.gc-current-label {
  font-size: 0.82rem;
  color: #6a5e48;
}

.gc-current-name {
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #c9a027;
}

.gc-field {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.gc-field-label {
  font-family: 'Cinzel', serif;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7a6d55;
  line-height: 1.4;
}

.gc-req {
  color: #8a3a3a;
  margin-left: 1px;
}

.gc-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.gc-select {
  width: 100%;
  background: #0a0806;
  border: 1px solid #2e2518;
  border-radius: 9px;
  color: #c0b090;
  font-size: 1.08rem;
  padding: 0.9rem 2.4rem 0.9rem 0.9rem;
  min-height: 50px;
  cursor: pointer;
  appearance: none;
}

.gc-select option {
  background: #100e0b;
  color: #c0b090;
}

.gc-select-arrow {
  position: absolute;
  right: 0.9rem;
  color: #6a5540;
  font-size: 0.65rem;
  pointer-events: none;
}

.gc-error {
  font-size: 0.92rem;
  color: #c44;
  background: #180c0c;
  border: 1px solid #4a1c1c;
  border-radius: 8px;
  padding: 0.7rem 0.85rem;
  margin: 0;
  line-height: 1.45;
}

.gc-delete-confirm {
  background: #180c0c;
  border: 1px solid #5a1e1e;
  border-radius: 8px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gc-delete-msg {
  font-size: 0.92rem;
  color: #b08080;
  margin: 0;
  line-height: 1.5;
}

.gc-delete-btns {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.gc-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.gc-btn {
  width: 100%;
  border-radius: 9px;
  padding: 1rem 1rem;
  min-height: 50px;
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid transparent;
  touch-action: manipulation;
}

.gc-btn--gold {
  background: #c9a027;
  color: #0a0806;
  border-color: #c9a027;
}

.gc-btn--danger {
  background: transparent;
  color: #a03535;
  border-color: #4a1e1e;
}

.gc-btn--danger-solid {
  width: 100%;
  background: #7a1e1e;
  color: #f0c0c0;
  border: 1px solid #a03535;
  border-radius: 9px;
  padding: 0.9rem 1rem;
  min-height: 48px;
  font-family: 'Cinzel', serif;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.gc-btn--ghost {
  background: transparent;
  color: #4a4030;
  border-color: #1e1a14;
  width: 100%;
}

@media (min-width: 600px) {
  .gc-page {
    padding: 2.5rem 1rem 5rem;
  }

  .gc-header {
    margin: 0 auto 2.5rem;
  }

  .gc-crest-wrap {
    margin-bottom: 1.25rem;
  }

  .gc-crest {
    width: 68px;
    height: 78px;
  }

  .gc-subtitle {
    font-size: 1.05rem;
    margin: 0 0 1.5rem;
    padding: 0;
  }

  .gc-ornament {
    gap: 0.75rem;
  }

  .gc-ornament-line {
    width: 80px;
  }

  .gc-settings-row {
    margin-bottom: 1rem;
  }

  .gc-settings-btn {
    min-width: 116px;
    min-height: 38px;
    padding: 0.65rem 1rem;
    border-radius: 7px;
    font-size: 0.76rem;
  }

  .gc-nav {
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .gc-nav-btn {
    width: 38px;
    height: 38px;
    min-width: 38px;
    min-height: 38px;
    border-radius: 6px;
    font-size: 1.1rem;
  }

  .gc-panel {
    border-radius: 10px;
    padding: 1rem;
  }

  .gc-wday {
    font-size: 0.62rem;
    letter-spacing: 0.15em;
    padding: 0.35rem 0;
  }

  .gc-grid {
    gap: 3px;
  }

  .gc-cell {
    padding: 5px 3px 3px;
    border-radius: 5px;
    min-height: 0;
  }

  .gc-day-num {
    font-size: 0.68rem;
  }

  .gc-day-name {
    font-size: 0.75rem;
  }

  .gc-footer {
    margin-top: 1.25rem;
    gap: 0.5rem;
  }

  .gc-legend {
    gap: 1.5rem;
    font-size: 0.85rem;
  }

  .gc-hint {
    font-size: 0.82rem;
    padding: 0;
  }

  .gc-modal-head {
    padding: 1.25rem 1.25rem 1rem;
  }

  .gc-modal-title {
    font-size: 0.95rem;
  }

  .gc-modal-date {
    font-size: 0.88rem;
  }

  .gc-modal-close {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }

  .gc-modal-body {
    padding: 1.25rem;
    gap: 1rem;
  }

  .gc-current {
    gap: 0.6rem;
    border-radius: 7px;
    padding: 0.6rem 0.9rem;
  }

  .gc-current-label {
    font-size: 0.85rem;
  }

  .gc-current-name {
    font-size: 0.85rem;
  }

  .gc-field {
    gap: 0.375rem;
  }

  .gc-field-label {
    font-size: 0.68rem;
  }

  .gc-select {
    border-radius: 7px;
    font-size: 1.05rem;
    padding: 0.65rem 2.25rem 0.65rem 0.875rem;
    min-height: 0;
  }

  .gc-select-arrow {
    right: 0.875rem;
  }

  .gc-error {
    font-size: 0.95rem;
    border-radius: 7px;
    padding: 0.6rem 0.875rem;
  }

  .gc-delete-confirm {
    border-radius: 8px;
    padding: 0.875rem;
  }

  .gc-delete-msg {
    font-size: 0.95rem;
  }

  .gc-delete-btns {
    flex-direction: row;
    gap: 0.5rem;
  }

  .gc-actions {
    gap: 0.5rem;
  }

  .gc-btn {
    border-radius: 7px;
    padding: 0.85rem 1rem;
    min-height: 0;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
  }

  .gc-btn--danger-solid {
    width: auto;
    flex: 1;
    border-radius: 7px;
    padding: 0.75rem;
    min-height: 0;
    font-size: 0.75rem;
  }

  .gc-btn--ghost {
    flex: 1;
  }
}
`;