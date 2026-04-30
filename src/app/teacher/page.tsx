"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiGet, apiPost } from "@/lib/apiClient";
import type { Assignment, StudentProgress } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const STEPS = ["Quiz", "Goal", "Portfolio", "Simulation"] as const;

function generateClassCode() {
  return `FIN${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function TeacherDashboard() {
  const { user } = useApp();
  const router = useRouter();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [classCode] = useState(() => user?.classCode ?? generateClassCode());

  useEffect(() => {
    if (!user || user.role !== "teacher") return;
    Promise.all([
      apiGet<Assignment[]>("/api/teacher/assignments"),
      apiGet<StudentProgress[]>("/api/teacher/students"),
    ]).then(([a, s]) => {
      if (a) setAssignments(a);
      if (s) setStudents(s);
      setLoading(false);
    });
  }, [user]);

  if (!user) { router.replace("/onboarding"); return null; }
  if (user.role !== "teacher") { router.replace("/dashboard"); return null; }

  const completedAll = students.filter((s) => s.simulationDone).length;

  async function handleAddAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const a = await apiPost<Assignment>("/api/teacher/assignments", {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      classCode,
    });

    if (a) setAssignments((prev) => [a, ...prev]);
    setTitle("");
    setDescription("");
    setDueDate("");
    setShowForm(false);
  }

  function handleExport() {
    const header = ["Name", "Quiz", "Goal", "Portfolio", "Simulation", "Complete"].join(",");
    const rows = students.map((s) =>
      [
        s.studentName,
        s.quizDone       ? "Yes" : "No",
        s.goalDone       ? "Yes" : "No",
        s.portfolioDone  ? "Yes" : "No",
        s.simulationDone ? "Yes" : "No",
        s.simulationDone ? "Yes" : "No",
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "highfin_progress.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            + New Assignment
          </Button>
        </div>
      </div>

      {/* Class code */}
      <Card className="mb-6 bg-emerald-50 border-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Class Code</p>
            <p className="text-3xl font-extrabold text-emerald-900 tracking-widest">{classCode}</p>
            <p className="text-xs text-emerald-700 mt-1">
              Share this code with your students to join your class.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-2xl font-bold text-emerald-900">
              {completedAll}/{students.length}
            </p>
            <p className="text-xs text-emerald-700">students completed</p>
          </div>
        </div>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STEPS.map((step) => {
          const key = (step.toLowerCase() + "Done") as keyof StudentProgress;
          const done = students.filter((s) => s[key]).length;
          return (
            <Card key={step} padding="sm" className="text-center">
              <p className="text-2xl font-bold text-slate-900">{done}</p>
              <p className="text-xs text-slate-500">{step} complete</p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: students.length > 0
                      ? `${(done / students.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Student progress table */}
      <Card className="mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">Student Progress</p>
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-6">Loading student data…</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No students enrolled yet. Share your class code above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-2 pr-4">Student</th>
                  {STEPS.map((s) => (
                    <th key={s} className="pb-2 pr-3">{s}</th>
                  ))}
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const stepsArr = [s.quizDone, s.goalDone, s.portfolioDone, s.simulationDone];
                  const done = stepsArr.filter(Boolean).length;
                  return (
                    <tr key={s.userId} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-800">{s.studentName}</td>
                      {stepsArr.map((v, i) => (
                        <td key={i} className="py-3 pr-3">
                          <span className={v ? "text-emerald-500" : "text-slate-300"}>
                            {v ? "✓" : "○"}
                          </span>
                        </td>
                      ))}
                      <td className="py-3">
                        <span
                          className={[
                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                            done === 4
                              ? "bg-emerald-100 text-emerald-700"
                              : done > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {done === 4 ? "Done" : done > 0 ? `${done}/4` : "Not started"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assignments */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">Assignments</p>

        {showForm && (
          <Card className="mb-4 border-emerald-200">
            <p className="font-semibold text-slate-800 mb-4">New Assignment</p>
            <form onSubmit={handleAddAssignment} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Create Assignment
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {assignments.length === 0 && !showForm ? (
          <Card className="text-center py-8 bg-slate-50 border-dashed">
            <p className="text-slate-400 text-sm">No assignments yet.</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-sm text-emerald-600 hover:underline mt-2"
            >
              Create your first assignment
            </button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {assignments.map((a) => (
              <Card key={a.id} padding="sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{a.title}</p>
                    {a.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{a.description}</p>
                    )}
                    {a.dueDate && (
                      <p className="text-xs text-slate-400 mt-1">
                        Due:{" "}
                        {new Date(a.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">
                    {a.classCode}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
