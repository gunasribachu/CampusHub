
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const PAGE_SIZE = 5;

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Exams() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    examDate: "",
    examTime: "",
    venue: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("examDate");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExams, setTotalExams] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchExams() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sortBy,
        order,
      });

      if (search.trim()) params.set("search", search.trim());

      const data = await apiRequest(`/exams?${params.toString()}`);

      setExams(data.exams || []);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setTotalExams(data.totalExams ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load exams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExams();
  }, [page, search, sortBy, order]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({
      subject: "",
      examDate: "",
      examTime: "",
      venue: "",
    });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.examDate < getToday()) {
      setError("Please select today or a future exam date.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        examDate: new Date(`${form.examDate}T12:00:00`).toISOString(),
      };

      if (editingId) {
        await apiRequest(`/exams/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Exam updated successfully.");
      } else {
        await apiRequest("/exams", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Exam added successfully.");
      }

      resetForm();

      if (!editingId && page !== 1) {
        setPage(1);
      } else {
        await fetchExams();
      }
    } catch (err) {
      setError(err.message || "Failed to save exam.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(exam) {
    setForm({
      subject: exam.subject || "",
      examDate: formatDateInput(exam.examDate),
      examTime: exam.examTime || "",
      venue: exam.venue || "",
    });
    setEditingId(exam._id);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this exam?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/exams/${id}`, {
        method: "DELETE",
      });

      setMessage("Exam deleted successfully.");

      if (exams.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchExams();
      }
    } catch (err) {
      setError(err.message || "Failed to delete exam.");
    }
  }

  function changeSort(field) {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
    setPage(1);
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Exams</h1>
        <p className="mt-1 text-slate-500">
          Organize your exam schedule and venue details.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          {editingId ? "Edit Exam" : "Add Exam"}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Enter subject name"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Exam Date
            </label>
            <input
              type="date"
              name="examDate"
              value={form.examDate}
              min={getToday()}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Exam Time
            </label>
            <input
              type="time"
              name="examTime"
              value={form.examTime}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Exam"
                  : "Add Exam"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              My Exams
            </h2>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by subject..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 lg:max-w-xs"
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-500">Sort by:</span>

          <button
            onClick={() => changeSort("examDate")}
            className={`rounded-lg border px-3 py-2 text-sm ${
              sortBy === "examDate"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-300 text-slate-600"
            }`}
          >
            Exam Date {sortBy === "examDate" ? (order === "asc" ? "↑" : "↓") : ""}
          </button>

          <button
            onClick={() => changeSort("subject")}
            className={`rounded-lg border px-3 py-2 text-sm ${
              sortBy === "subject"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-300 text-slate-600"
            }`}
          >
            Subject {sortBy === "subject" ? (order === "asc" ? "↑" : "↓") : ""}
          </button>

          <button
            onClick={() => changeSort("createdAt")}
            className={`rounded-lg border px-3 py-2 text-sm ${
              sortBy === "createdAt"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-300 text-slate-600"
            }`}
          >
            Date Added {sortBy === "createdAt" ? (order === "asc" ? "↑" : "↓") : ""}
          </button>
        </div>

        {loading ? (
          <p className="py-10 text-center text-slate-500">
            Loading exams...
          </p>
        ) : exams.length === 0 ? (
          <div className="rounded-xl bg-slate-50 py-10 text-center">
            <p className="font-medium text-slate-700">No exams found</p>
            <p className="mt-1 text-sm text-slate-500">
              Add an exam or change your search.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <article
                key={exam._id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-semibold text-slate-900">
                      {exam.subject}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>📅 Date: {formatDate(exam.examDate)}</p>
                      <p>🕒 Time: {exam.examTime || "—"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Exams;
