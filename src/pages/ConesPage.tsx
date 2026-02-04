import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import type { CheckpointFormState, Cone, ConeFormState } from "../models/cone";
import { validateCheckpoints, validateCone } from "../lib/coneAdmin";

import { SecondaryButton } from "../components/ui/FormControls";
import { ConeList } from "../components/cones/ConeList";
import { ConeForm } from "../components/cones/ConeForm";

const emptyForm: ConeFormState = {
  name: "",
  slug: "",
  lat: "",
  lng: "",
  radiusMeters: "80",
  region: "central",
  active: true,
  description: "",
};

export default function ConesPage() {
  const [cones, setCones] = useState<Cone[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<ConeFormState>({ ...emptyForm });
  const [checkpoints, setCheckpoints] = useState<CheckpointFormState[]>([]);
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
      },
    );
    return () => unsub();
  }, []);

  const selected = useMemo(
    () => (selectedId ? cones.find((c) => c.id === selectedId) ?? null : null),
    [cones, selectedId],
  );

  // ✅ Use selected (not selectedId) so it updates if the doc changes
  useEffect(() => {
    if (!selected) return;

    setForm({
      name: selected.name ?? "",
      slug: selected.slug ?? "",
      lat: String(selected.lat ?? ""),
      lng: String(selected.lng ?? ""),
      radiusMeters: String(selected.radiusMeters ?? "80"),
      region: (selected.region as any) ?? "central",
      active: !!selected.active,
      description: selected.description ?? "",
    });

    const cps = Array.isArray(selected.checkpoints) ? selected.checkpoints : [];
    setCheckpoints(
      cps.map((cp, i) => ({
        id: (cp.id ?? `cp_${i + 1}`).toString(),
        label: cp.label ?? "",
        lat: String(cp.lat ?? ""),
        lng: String(cp.lng ?? ""),
        radiusMeters: String(cp.radiusMeters ?? "80"),
      })),
    );
  }, [selected]);

  function reset() {
    setSelectedId(null);
    setForm({ ...emptyForm });
    setCheckpoints([]);
    setMsg("");
  }

  async function save() {
    setMsg("");

    const coneV = validateCone(form);
    if (coneV.errors.length) {
      setMsg(coneV.errors.join(" "));
      return;
    }

    const cpsTrimmed = checkpoints.map((c) => ({
      ...c,
      id: c.id.trim(),
      label: c.label.trim(),
    }));

    const cpsV = validateCheckpoints(cpsTrimmed);
    if (cpsV.errors.length) {
      setMsg(cpsV.errors.join(" "));
      return;
    }

    const hasCheckpoints = cpsTrimmed.length > 0;

    const basePayload: any = {
      name: form.name.trim(),
      slug: coneV.slug,
      lat: coneV.lat,
      lng: coneV.lng,

      radiusMeters: coneV.radius,
      region: coneV.region,

      active: !!form.active,
      description: form.description.trim(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (selectedId) {
        const payload: any = { ...basePayload };

        if (hasCheckpoints) {
          payload.checkpoints = cpsV.parsed.map((cp) => ({
            ...(cp.id ? { id: cp.id } : {}),
            ...(cp.label ? { label: cp.label } : {}),
            lat: cp.lat,
            lng: cp.lng,
            radiusMeters: cp.radiusMeters,
          }));

          // ✅ first checkpoint is canonical
          payload.defaultCheckpointId = cpsV.parsed[0]?.id;
        } else {
          payload.checkpoints = deleteField();
          payload.defaultCheckpointId = deleteField();
        }

        await updateDoc(doc(db, "cones", selectedId), payload);
        setMsg("Saved ✅");
      } else {
        const payload: any = { ...basePayload };

        if (hasCheckpoints) {
          payload.checkpoints = cpsV.parsed.map((cp) => ({
            ...(cp.id ? { id: cp.id } : {}),
            ...(cp.label ? { label: cp.label } : {}),
            lat: cp.lat,
            lng: cp.lng,
            radiusMeters: cp.radiusMeters,
          }));

          // ✅ first checkpoint is canonical
          payload.defaultCheckpointId = cpsV.parsed[0]?.id;
        }

        payload.createdAt = serverTimestamp();
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
            Add/edit Auckland cones (map marker + completion checkpoints). Users see only{" "}
            <span className="font-medium">active</span> cones.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Map pin always uses the cone’s latitude/longitude. Checkpoints are for completion only.
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
        <div className="lg:col-span-3">
          <ConeList
            cones={cones}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={removeCone}
            onToggleActive={toggleActive}
          />
        </div>

        <div className="lg:col-span-2">
          <ConeForm
            selectedId={selectedId}
            form={form}
            checkpoints={checkpoints}
            onChangeForm={setForm}
            onChangeCheckpoints={setCheckpoints}
            onSave={save}
            onCancel={reset}
          />

          <div className="mt-4 text-xs text-slate-500">
            You can later add a “Completions” page to review user completions + share bonuses.
          </div>
        </div>
      </div>
    </div>
  );
}
