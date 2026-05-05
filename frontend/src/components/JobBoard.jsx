import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const WORK_MODES = ["REMOTE", "HYBRID", "ONSITE"];

export default function JobBoard({ accessToken }) {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState({
    number: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    title: "",
    minSalary: "",
    maxSalary: "",
    location: "",
    workMode: "",
  });
  const [form, setForm] = useState({
    title: "",
    salaryRange: "",
    location: "",
    workMode: "REMOTE",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken]
  );

  useEffect(() => {
    if (accessToken) {
      fetchJobs(0);
    }
  }, [accessToken]);

  async function fetchJobs(nextPage = 0) {
    setLoading(true);
    setMessage("");

    const params = new URLSearchParams({
      page: String(nextPage),
      size: "20",
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "") {
        params.set(key, value);
      }
    });

    try {
      const response = await fetch(`${API_URL}/jobs/filter?${params}`, {
        headers: authHeaders,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Jobs could not be loaded.");
      }

      setJobs(data.content ?? []);
      setPage(normalizePage(data));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createJob(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          salaryRange: Number(form.salaryRange),
          location: form.location,
          workMode: form.workMode,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Job could not be created.");
      }

      setForm({
        title: "",
        salaryRange: "",
        location: "",
        workMode: "REMOTE",
      });
      setMessage("Job posted.");
      await fetchJobs(0);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h1 className="text-xl font-semibold">Jobs</h1>

          <form onSubmit={createJob} className="mt-5 grid gap-3">
            <input
              name="title"
              value={form.title}
              onChange={updateForm}
              placeholder="Position"
              className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              name="salaryRange"
              value={form.salaryRange}
              onChange={updateForm}
              placeholder="Salary"
              type="number"
              min="0"
              className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <input
              name="location"
              value={form.location}
              onChange={updateForm}
              placeholder="Location"
              className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <select
              name="workMode"
              value={form.workMode}
              onChange={updateForm}
              className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {formatWorkMode(mode)}
                </option>
              ))}
            </select>
            <button
              disabled={loading || !accessToken}
              className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Post Job
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Filters
            </h2>
            <div className="mt-3 grid gap-3">
              <input
                name="title"
                value={filters.title}
                onChange={updateFilter}
                placeholder="Search position"
                className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="minSalary"
                  value={filters.minSalary}
                  onChange={updateFilter}
                  placeholder="Min salary"
                  type="number"
                  min="0"
                  className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  name="maxSalary"
                  value={filters.maxSalary}
                  onChange={updateFilter}
                  placeholder="Max salary"
                  type="number"
                  min="0"
                  className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <input
                name="location"
                value={filters.location}
                onChange={updateFilter}
                placeholder="Location"
                className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                name="workMode"
                value={filters.workMode}
                onChange={updateFilter}
                className="rounded-md bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any work mode</option>
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {formatWorkMode(mode)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => fetchJobs(0)}
                disabled={loading || !accessToken}
                className="rounded-md bg-zinc-100 px-4 py-2 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">
              {page.totalElements} listings
            </p>
            {loading && <p className="text-sm text-zinc-400">Loading...</p>}
          </div>

          <div className="grid gap-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {job.location} · {formatWorkMode(job.workMode)}
                    </p>
                  </div>
                  <strong className="rounded-md bg-emerald-500 px-3 py-1 text-sm text-zinc-950">
                    {formatSalary(job.salaryRange)}
                  </strong>
                </div>
                <p className="mt-4 text-sm text-zinc-500">
                  Posted by {job.createdBy?.firstName} {job.createdBy?.lastName}
                </p>
              </article>
            ))}

            {!loading && jobs.length === 0 && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                No matching jobs found.
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={() => fetchJobs(page.number - 1)}
              disabled={loading || page.number <= 0}
              className="rounded-md bg-zinc-800 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-400">
              Page {page.number + 1} of {Math.max(page.totalPages, 1)}
            </span>
            <button
              onClick={() => fetchJobs(page.number + 1)}
              disabled={loading || page.number + 1 >= page.totalPages}
              className="rounded-md bg-zinc-800 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function normalizePage(data) {
  if (data.page) {
    return {
      number: data.page.number ?? 0,
      size: data.page.size ?? 20,
      totalPages: data.page.totalPages ?? 0,
      totalElements: data.page.totalElements ?? 0,
    };
  }

  return {
    number: data.number ?? 0,
    size: data.size ?? 20,
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
  };
}

function formatWorkMode(workMode) {
  return workMode
    ? workMode.charAt(0) + workMode.slice(1).toLowerCase()
    : "Unknown";
}

function formatSalary(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
