import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

type Cone = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  active: boolean;
  description?: string;
};

const emptyForm = {
  name: "",
  slug: "",
  lat: "",
  lng: "",
  radiusMeters: "80",
  active: true,
  description: "",
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function validate(form: typeof emptyForm) {
  const errors: string[] = [];
  if (!form.name.trim()) errors.push("Name is required.");
  const slug = form.slug.trim() || slugify(form.name);

  const lat = parseNum(form.lat);
  const lng = parseNum(form.lng);
  const radius = parseNum(form.radiusMeters);

  if (!slug) errors.push("Slug is required.");
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.push("Latitude must be between -90 and 90.");
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) errors.push("Longitude must be between -180 and 180.");
  if (!Number.isFinite(radius) || radius < 10 || radius > 1000) errors.push("Radius should be 10–1000m.");

  return { errors, slug, lat, lng, radius };
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm",
        "outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm",
        "outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-500",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-100",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export default function ConesPage() {
  const [cones, setCones] = useState<Cone[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "cones"), orderBy("name"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Cone[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setCones(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setMsg(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const selected = useMemo(
    () => (selectedId ? cones.find((c) => c.id === selectedId) ?? null : null),
    [cones, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setForm({
      name: selected.name ?? "",
      slug: selected.slug ?? "",
      lat: String(selected.lat ?? ""),
      lng: String(selected.lng ?? ""),
      radiusMeters: String(selected.radiusMeters ?? "80"),
      active: !!selected.active,
      description: selected.description ?? "",
    });
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  function reset() {
    setSelectedId(null);
    setForm({ ...emptyForm });
    setMsg("");
  }

  async function save() {
    setMsg("");
    const { errors, slug, lat, lng, radius } = validate(form);
    if (errors.length) {
      setMsg(errors.join(" "));
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug,
      lat,
      lng,
      radiusMeters: radius,
      active: !!form.active,
      description: form.description.trim(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (selectedId) {
        await updateDoc(doc(db, "cones", selectedId), payload);
        setMsg("Saved ✅");
      } else {
        await addDoc(collection(db, "cones"), payload);
        setMsg("Created ✅");
      }
      reset();
    } catch (e: any) {
      console.error(e);
      setMsg(e.message ?? "Error saving");
    }
  }

  async function removeCone(id: string) {
    const ok = confirm("Delete this cone? This cannot be undone.");
    if (!ok) return;
    setMsg("");
    try {
      await deleteDoc(doc(db, "cones", id));
      if (selectedId === id) reset();
      setMsg("Deleted ✅");
    } catch (e: any) {
      console.error(e);
      setMsg(e.message ?? "Error deleting");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setMsg("");
    try {
      await updateDoc(doc(db, "cones", id), { active, updatedAt: serverTimestamp() });
    } catch (e: any) {
      console.error(e);
      setMsg(e.message ?? "Error updating");
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cones</h1>
          <p className="text-sm text-slate-600 mt-1">
            Add/edit Auckland cones (GPS point + radius). Users see only <span className="font-medium">active</span> cones.
          </p>
        </div>
        <SecondaryButton onClick={reset}>New cone</SecondaryButton>
      </div>

      {msg && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {msg}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="font-semibold text-slate-900">All cones</div>
              <div className="text-xs text-slate-500">{cones.length} total</div>
            </div>

            {loading ? (
              <div className="p-4 text-slate-600">Loading…</div>
            ) : cones.length === 0 ? (
              <div className="p-4 text-slate-600">No cones yet. Create your first one →</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cones.map((c) => (
                  <div
                    key={c.id}
                    className={[
                      "p-4 flex items-center justify-between gap-4",
                      selectedId === c.id ? "bg-indigo-50" : "bg-white",
                    ].join(" ")}
                  >
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className="text-left flex-1"
                    >
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        <span className="font-mono">{c.slug}</span>
                        <span className="mx-2">•</span>
                        {c.lat},{c.lng}
                        <span className="mx-2">•</span>
                        {c.radiusMeters}m
                      </div>
                    </button>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!c.active}
                        onChange={(e) => toggleActive(c.id, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                      />
                      active
                    </label>

                    <button
                      onClick={() => removeCone(c.id)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <div className="font-semibold text-slate-900">
                {selectedId ? "Edit cone" : "Create cone"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Tip: choose a reachable spot (sign/trig/viewpoint). Radius 60–120m.
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug ? f.slug : slugify(e.target.value),
                    }))
                  }
                  placeholder="Maungawhau / Mount Eden"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="maungawhau-mt-eden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Latitude</label>
                  <Input
                    value={form.lat}
                    onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                    placeholder="-36.879"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Longitude</label>
                  <Input
                    value={form.lng}
                    onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                    placeholder="174.765"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-sm font-medium text-slate-700">Radius (m)</label>
                  <Input
                    value={form.radiusMeters}
                    onChange={(e) => setForm((f) => ({ ...f, radiusMeters: e.target.value }))}
                    placeholder="80"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 mt-6">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                  />
                  Active
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Description (optional)</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Notes, safety, where to stand for GPS point…"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <PrimaryButton onClick={save}>{selectedId ? "Save changes" : "Create cone"}</PrimaryButton>
                <SecondaryButton type="button" onClick={reset}>Cancel</SecondaryButton>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            You can later add a “Completions” page to review user completions + share bonuses.
          </div>
        </div>
      </div>
    </div>
  );
}
