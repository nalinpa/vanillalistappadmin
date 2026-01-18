import type { CheckpointFormState, ConeFormState } from "../../models/cone";
import { slugify } from "../../lib/coneAdmin";
import { CheckpointsEditor } from "./CheckpointsEditor";
import { Input, PrimaryButton, SecondaryButton, Textarea } from "../ui/FormControls";

type Props = {
  selectedId: string | null;
  form: ConeFormState;
  checkpoints: CheckpointFormState[];
  onChangeForm: (next: ConeFormState) => void;
  onChangeCheckpoints: (next: CheckpointFormState[]) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ConeForm({
  selectedId,
  form,
  checkpoints,
  onChangeForm,
  onChangeCheckpoints,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 border-b border-slate-100">
        <div className="font-semibold text-slate-900">{selectedId ? "Edit cone" : "Create cone"}</div>
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
              onChangeForm({
                ...form,
                name: e.target.value,
                slug: form.slug ? form.slug : slugify(e.target.value),
              })
            }
            placeholder="Maungawhau / Mount Eden"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Slug</label>
          <Input
            value={form.slug}
            onChange={(e) => onChangeForm({ ...form, slug: e.target.value })}
            placeholder="maungawhau-mt-eden"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Latitude</label>
            <Input
              value={form.lat}
              onChange={(e) => onChangeForm({ ...form, lat: e.target.value })}
              placeholder="-36.879"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Longitude</label>
            <Input
              value={form.lng}
              onChange={(e) => onChangeForm({ ...form, lng: e.target.value })}
              placeholder="174.765"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="text-sm font-medium text-slate-700">Radius (m)</label>
            <Input
              value={form.radiusMeters}
              onChange={(e) => onChangeForm({ ...form, radiusMeters: e.target.value })}
              placeholder="80"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 mt-6">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => onChangeForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
            />
            Active
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Description (optional)</label>
          <Textarea
            value={form.description}
            onChange={(e) => onChangeForm({ ...form, description: e.target.value })}
            placeholder="Notes, safety, where to stand for GPS point…"
            rows={4}
          />
        </div>

        <CheckpointsEditor
          coneForm={form}
          checkpoints={checkpoints}
          onChange={onChangeCheckpoints}
        />

        <div className="flex gap-3 pt-1">
          <PrimaryButton onClick={onSave}>{selectedId ? "Save changes" : "Create cone"}</PrimaryButton>
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
