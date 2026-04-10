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

import type { CheckpointFormState, Location, LocationFormState } from "../models/location";
import { validateCheckpoints, validateLocation } from "../lib/locationAdmin";
import { SecondaryButton } from "../components/ui/FormControls";
import { LocationList } from "../components/locations/LocationList";
import { LocationForm } from "../components/locations/LocationForm";

const emptyForm: LocationFormState = {
  name: "",
  slug: "",
  lat: "",
  lng: "",
  radiusMeters: "80",
  region: "",
  category: "",
  active: true,
  description: "",
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<LocationFormState>({ ...emptyForm });
  const [checkpoints, setCheckpoints] = useState<CheckpointFormState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "__DB_COLLECTION__"), orderBy("name"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Location[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setLocations(rows);
        setLoading(false);
      },
      (err) => {
        console.log(err);
        setMsg(err.message);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const selected = useMemo(
    () => (selectedId ? locations.find((l) => l.id === selectedId) ?? null : null),
    [locations, selectedId],
  );

  useEffect(() => {
    if (!selected) return;

    setForm({
      name: selected.name ?? "",
      slug: selected.slug ?? "",
      lat: String(selected.lat ?? ""),
      lng: String(selected.lng ?? ""),
      radiusMeters: String(selected.radiusMeters ?? "80"),
      region: (selected.region as any) ?? "",
      category: ((selected as any).category as any) ?? "",
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

    const locV = validateLocation(form);
    if (locV.errors.length) {
      setMsg(locV.errors.join(" "));
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
      slug: locV.slug,
      lat: locV.lat,
      lng: locV.lng,
      radiusMeters: locV.radius,
      region: locV.region,
      category: locV.category,
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
          payload.defaultCheckpointId = cpsV.parsed[0]?.id;
        } else {
          payload.checkpoints = deleteField();
          payload.defaultCheckpointId = deleteField();
        }

        await updateDoc(doc(db, "__DB_COLLECTION__", selectedId), payload);
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
          payload.defaultCheckpointId = cpsV.parsed[0]?.id;
        }

        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "__DB_COLLECTION__"), payload);
        setMsg("Created ✅");
      }

      reset();
    } catch (e: any) {
      console.error(e);
      setMsg(e.message ?? "Error saving");
    }
  }

  async function removeLocation(id: string) {
    const ok = confirm("Delete this __ENTITY_SINGULAR__? This cannot be undone.");
    if (!ok) return;

    setMsg("");
    try {
      await deleteDoc(doc(db, "__DB_COLLECTION__", id));
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
      await updateDoc(doc(db, "__DB_COLLECTION__", id), { active, updatedAt: serverTimestamp() });
    } catch (e: any) {
      console.error(e);
      setMsg(e.message ?? "Error updating");
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">__ENTITY_PLURAL__</h1>
          <p className="text-sm text-slate-600 mt-1">
            Add/edit __ENTITY_PLURAL__ (map marker + completion checkpoints). Users see only{" "}
            <span className="font-medium">active</span> __ENTITY_PLURAL__.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Map pin always uses the __ENTITY_SINGULAR__’s latitude/longitude. Checkpoints are for completion only.
          </p>
        </div>
        <SecondaryButton onClick={reset}>New __ENTITY_SINGULAR__</SecondaryButton>
      </div>

      {msg && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {msg}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <LocationList
            locations={locations}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={removeLocation}
            onToggleActive={toggleActive}
          />
        </div>

        <div className="lg:col-span-2">
          <LocationForm
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