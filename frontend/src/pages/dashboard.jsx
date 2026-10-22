
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest("/dashboard");
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = stats
    ? [
        { label: "Total Assignments", value: stats.assignments.total },
        { label: "Pending", value: stats.assignments.pending },
        { label: "Completed", value: stats.assignments.completed },
        { label: "Overdue", value: stats.assignments.overdue },
        { label: "Upcoming Exams", value: stats.exams.total },
        {
          label: "Completion Rate",
          value: `${stats.assignments.completionPercentage}%`,
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Here's your academic overview.
        </p>

        {loading && (
          <p className="mt-8 text-slate-600">Loading your statistics...</p>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {stats && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-blue-600">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">
                Next Exam
              </h2>

              {stats.exams.nextExam ? (
                <div className="mt-4">
                  <p className="text-lg font-semibold text-blue-600">
                    {stats.exams.nextExam.subject}
                  </p>
                  <p className="mt-1 text-slate-600">
                    {new Date(
                      stats.exams.nextExam.examDate
                    ).toLocaleDateString()}
                    {" · "}
                    {stats.exams.nextExam.examTime}
                  </p>
                  {stats.exams.nextExam.venue && (
                    <p className="mt-1 text-slate-500">
                      Venue: {stats.exams.nextExam.venue}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-slate-500">
                  No upcoming exams scheduled.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
