
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

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    dueDate: "",
    status: "Pending",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssignments, setTotalAssignments] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchAssignments() {
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
      if (status) params.set("status", status);

      const data = await apiRequest(`/assignments?${params.toString()}`);

      setAssignments(data.assignments || []);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setTotalAssignments(data.totalAssignments ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssignments();
  }, [page, search, status, sortBy, order]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({
      title: "",
      subject: "",
      dueDate: "",
      status: "Pending",
    });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.dueDate < getToday()) {
      setError("Please select today or a future due date.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        dueDate: new Date(`${form.dueDate}T12:00:00`).toISOString(),
      };

      if (editingId) {
        await apiRequest(`/assignments/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Assignment updated successfully.");
      } else {
        await apiRequest("/assignments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Assignment added successfully.");
      }

      resetForm();

      if (!editingId && page !== 1) {
        setPage(1);
      } else {
        await fetchAssignments();
      }
    } catch (err) {
      setError(err.message || "Failed to save assignment.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(assignment) {
    setForm({
      title: assignment.title || "",
      subject: assignment.subject || "",
      dueDate: formatDateInput(assignment.dueDate),
      status: assignment.status || "Pending",
    });
    setEditingId(assignment._id);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/assignments/${id}`, {
        method: "DELETE",
      });

      setMessage("Assignment deleted successfully.");

      if (assignments.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchAssignments();
      }
    } catch (err) {
      setError(err.message || "Failed to delete assignment.");
    }
  }

  async function toggleStatus(assignment) {
    const newStatus =
      assignment.status === "Completed" ? "Pending" : "Completed";

    setError("");
    setMessage("");

    try {
      await apiRequest(`/assignments/${assignment._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      setMessage("Assignment status updated.");
      await fetchAssignments();
    } catch (err) {
      setError(err.message || "Failed to update status.");
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

  function isOverdue(assignment) {
    return (
      assignment.status !== "Completed" &&
      formatDateInput(assignment.dueDate) < getToday()
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
        <p className="mt-1 text-slate-500">
          Manage your assignments and track your progress.
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
          {editingId ? "Edit Assignment" : "Add Assignment"}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Assignment Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter assignment title"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Enter subject"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              min={getToday()}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
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
                  ? "Update Assignment"
                  : "Add Assignment"}
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
              My Assignments
            </h2>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title or subject..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 lg:max-w-xs"
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <span className="text-sm text-slate-500">Sort by:</span>

          <button
            onClick={() => changeSort("dueDate")}
            className={`rounded-lg border px-3 py-2 text-sm ${
              sortBy === "dueDate"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-300 text-slate-600"
            }`}
          >
            Due Date {sortBy === "dueDate" ? (order === "asc" ? "↑" : "↓") : ""}
          </button>

          <button
            onClick={() => changeSort("title")}
            className={`rounded-lg border px-3 py-2 text-sm ${
              sortBy === "title"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-300 text-slate-600"
            }`}
          >
            Title {sortBy === "title" ? (order === "asc" ? "↑" : "↓") : ""}
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
            Loading assignments...
          </p>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl bg-slate-50 py-10 text-center">
            <p className="font-medium text-slate-700">
              No assignments found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add an assignment or change your search filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <article
                key={assignment._id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-semibold text-slate-900">
                        {assignment.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          assignment.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {assignment.status}
                      </span>

                      {isOverdue(assignment) && (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Subject: {assignment.subject}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Due: {formatDate(assignment.dueDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleStatus(assignment)}
                      className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                    >
                      {assignment.status === "Completed"
                        ? "Mark Pending"
                        : "Mark Completed"}
                    </button>

                    <button
                      onClick={() => handleEdit(assignment)}
                      className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(assignment._id)}
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

export default Assignments;
