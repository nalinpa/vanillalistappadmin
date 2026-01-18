import type { CheckpointFormState, ConeFormState } from "../../models/cone";
import { newCheckpointId } from "../../lib/coneAdmin";
import { Input, SecondaryButton } from "../ui/FormControls";

type Props = {
  coneForm: ConeFormState;
  checkpoints: CheckpointFormState[];
  onChange: (next: CheckpointFormState[]) => void;
};

export function CheckpointsEditor({ coneForm, checkpoints, onChange }: Props) {
  function addCheckpoint() {
    onChange([
      ...checkpoints,
      {
        id: newCheckpointId(),
        label: "",
        lat: coneForm.lat || "",
        lng: coneForm.lng || "",
        radiusMeters: coneForm.radiusMeters || "80",
      },
    ]);
  }

  function removeCheckpoint(index: number) {
    onChange(checkpoints.filter((_, i) => i !== index));
  }

  function moveCheckpoint(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= checkpoints.length) return;
    const next = [...checkpoints];
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    onChange(next);
  }

  function update(index: number, patch: Partial<CheckpointFormState>) {
    onChange(checkpoints.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function copyFromCone(index: number) {
    update(index, {
      lat: coneForm.lat || checkpoints[index].lat,
      lng: coneForm.lng || checkpoints[index].lng,
      radiusMeters: coneForm.radiusMeters || checkpoints[index].radiusMeters,
    });
  }

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-700">Checkpoints</div>
          <div className="text-xs text-slate-500 mt-1">
            If set, users complete the cone when inside any checkpoint circle. If empty,
            the cone’s main lat/lng/radius is used.
          </div>
        </div>
        <SecondaryButton type="button" onClick={addCheckpoint}>
          Add checkpoint
        </SecondaryButton>
      </div>

      {checkpoints.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          No checkpoints (mobile will fall back to the cone’s main location).
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {checkpoints.map((cp, idx) => (
            <div key={`${cp.id}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium text-slate-900">Checkpoint {idx + 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveCheckpoint(idx, -1)}
                    disabled={idx === 0}
                    className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCheckpoint(idx, 1)}
                    disabled={idx === checkpoints.length - 1}
                    className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCheckpoint(idx)}
                    className="text-xs rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">ID (stable)</label>
                  <Input
                    value={cp.id}
                    onChange={(e) => update(idx, { id: e.target.value })}
                    placeholder="e.g. summit, carpark, lookout"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Label (optional)</label>
                  <Input
                    value={cp.label}
                    onChange={(e) => update(idx, { label: e.target.value })}
                    placeholder="Summit trig"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Latitude</label>
                  <Input
                    value={cp.lat}
                    onChange={(e) => update(idx, { lat: e.target.value })}
                    placeholder="-36.879"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Longitude</label>
                  <Input
                    value={cp.lng}
                    onChange={(e) => update(idx, { lng: e.target.value })}
                    placeholder="174.765"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-slate-700">Radius (m)</label>
                  <Input
                    value={cp.radiusMeters}
                    onChange={(e) => update(idx, { radiusMeters: e.target.value })}
                    placeholder="80"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => copyFromCone(idx)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Copy from cone
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
