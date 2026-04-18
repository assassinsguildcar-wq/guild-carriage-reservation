"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const now = new Date();
const TODAY_STR = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

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
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [reservations, setReservations] = useState<Record<string, string>>({});

  const [modalDate, setModalDate] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);
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
      <div className="gc-page">
        <header className="gc-header">
          <h1 className="gc-title">Guild Carriage Reservation</h1>
          <p className="gc-subtitle">Manage carriage duty assignments for guild members.</p>
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

          <div className="gc-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="gc-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="gc-grid">
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="gc-cell gc-cell-empty" />;
              }

              const iso = toISO(year, month, day);
              const reservedBy = reservations[iso];
              const isToday = iso === TODAY_STR;
              const isPast = iso < TODAY_STR;

              return (
                <button
                  key={iso}
                  type="button"
                  className={`gc-cell ${reservedBy ? "gc-cell-reserved" : ""} ${isToday ? "gc-cell-today" : ""}`}
                  onClick={() => openModal(iso)}
                >
                  <div className="gc-day">{day}</div>

                  <div className="gc-name-wrap">
                    {reservedBy ? (
                      <span className="gc-name">{reservedBy}</span>
                    ) : (
                      <span className={`gc-empty-label ${isPast ? "gc-empty-past" : ""}`}>
                        {isPast ? "Past" : "Open"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>

      {modalDate && (
        <div className="gc-modal-backdrop" onClick={closeModal}>
          <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="gc-modal-title">{prettyDate(modalDate)}</h3>

            <label className="gc-label">Reserved Member</label>
            <select
              value={selMember}
              onChange={(e) => setSelMember(e.target.value)}
              className="gc-select"
            >
              <option value="">Select member</option>
              {members.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <label className="gc-label">Operator</label>
            <select
              value={selOperator}
              onChange={(e) => setSelOperator(e.target.value)}
              className="gc-select"
            >
              <option value="">Select your name</option>
              {members.map((name) => (
                <option key={`op-${name}`} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {formError && <p className="gc-error">{formError}</p>}

            <div className="gc-modal-actions">
              <button onClick={handleSave} className="gc-save-btn">
                {existingMember ? "Update" : "Reserve"}
              </button>

              {existingMember && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="gc-delete-btn"
                >
                  Delete
                </button>
              )}

              {existingMember && confirmDelete && (
                <button onClick={handleDelete} className="gc-delete-btn">
                  Confirm Delete
                </button>
              )}

              <button onClick={closeModal} className="gc-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .gc-page {
  min-height: 100vh;
  color: #f5e7c8;
  padding: 20px;
}

        .gc-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .gc-title {
          font-size: 36px;
          margin: 0 0 8px;
        }

        .gc-subtitle {
          color: #d8b874;
          margin: 0;
        }

        .gc-main {
          max-width: 1100px;
          margin: 0 auto;
        }

        .gc-settings-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }

        .gc-settings-btn,
        .gc-nav-btn,
        .gc-save-btn,
        .gc-delete-btn,
        .gc-cancel-btn {
          border: none;
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .gc-settings-btn,
        .gc-nav-btn,
        .gc-save-btn {
          background: linear-gradient(180deg, #dcb45b, #be8e2f);
          color: #111;
        }

        .gc-delete-btn {
          background: #7a1f1f;
          color: #fff;
        }

        .gc-cancel-btn {
          background: #333;
          color: #fff;
        }

        .gc-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .gc-month-label {
          margin: 0;
          font-size: 28px;
          text-align: center;
          flex: 1;
        }

        .gc-weekdays,
        .gc-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 10px;
        }

        .gc-weekday {
          text-align: center;
          color: #d4a017;
          font-weight: 700;
          padding: 8px 0;
        }

        .gc-cell {
          min-height: 92px;
          background: #1b0d06;
          border: 1px solid #9c6f12;
          border-radius: 14px;
          color: #f5e7c8;
          text-align: left;
          padding: 10px;
        }

        .gc-cell-empty {
          background: transparent;
          border: none;
        }

        .gc-cell-reserved {
          background: #241208;
          box-shadow: inset 0 0 0 1px #d4a017;
        }

        .gc-cell-today {
          outline: 2px solid #f0c14b;
        }

        .gc-day {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .gc-name-wrap {
          min-height: 36px;
        }

        .gc-name {
          display: inline-block;
          font-size: 13px;
          line-height: 1.3;
          color: #f0c14b;
          word-break: break-word;
        }

        .gc-empty-label {
          font-size: 12px;
          color: #8f7a57;
        }

        .gc-empty-past {
          color: #6e6254;
        }

        .gc-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .gc-modal {
          width: 100%;
          max-width: 460px;
          background: #1b0d06;
          border: 1px solid #9c6f12;
          border-radius: 18px;
          padding: 24px;
        }

        .gc-modal-title {
          margin: 0 0 18px;
          font-size: 24px;
        }

        .gc-label {
          display: block;
          margin: 12px 0 8px;
          color: #f0c14b;
          font-weight: 700;
        }

        .gc-select {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          border: 1px solid #c99a27;
          background: #000;
          color: #f5e7c8;
          padding: 0 12px;
        }

        .gc-error {
          margin-top: 12px;
          color: #ff8f8f;
        }

        .gc-modal-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        @media (max-width: 640px) {
          .gc-page {
            padding: 12px;
          }

          .gc-title {
            font-size: 28px;
          }

          .gc-month-label {
            font-size: 22px;
          }

          .gc-weekdays,
          .gc-grid {
            gap: 6px;
          }

          .gc-cell {
            min-height: 78px;
            padding: 8px;
          }

          .gc-day {
            font-size: 16px;
            margin-bottom: 6px;
          }

          .gc-name {
            font-size: 11px;
          }

          .gc-settings-row {
            justify-content: stretch;
          }

          .gc-settings-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}