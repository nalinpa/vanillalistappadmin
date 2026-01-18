import type { Cone } from "../../models/cone";

type Props = {
  cones: Cone[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
};

export function ConeList({
  cones,
  loading,
  selectedId,
  onSelect,
  onDelete,
  onToggleActive,
}: Props) {
  return (
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
              <button onClick={() => onSelect(c.id)} className="text-left flex-1">
                <div className="font-semibold text-slate-900">{c.name}</div>
                <div className="mt-1 text-xs text-slate-600">
                  <span className="font-mono">{c.slug}</span>
                  <span className="mx-2">•</span>
                  {c.lat},{c.lng}
                  <span className="mx-2">•</span>
                  {c.radiusMeters}m
                  <span className="mx-2">•</span>
                  {(c.checkpoints?.length ?? 0) > 0 ? (
                    <span>{c.checkpoints!.length} checkpoint(s)</span>
                  ) : (
                    <span>no checkpoints</span>
                  )}
                </div>
              </button>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!!c.active}
                  onChange={(e) => onToggleActive(c.id, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                />
                active
              </label>

              <button
                onClick={() => onDelete(c.id)}
                className="text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
