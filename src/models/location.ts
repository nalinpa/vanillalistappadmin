import type {
  Checkpoint,
  CheckpointFormState,
  __Location__FormState,
} from "../models/__location__";

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export function newCheckpointId() {
  const g = globalThis as any;
  if (typeof g?.crypto?.randomUUID === "function") return g.crypto.randomUUID();
  return `cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function validate__Location__(form: __Location__FormState) {
  const errors: string[] = [];

  if (!form.name.trim()) errors.push("Name is required.");

  const slug = form.slug.trim() || slugify(form.name);
  const lat = parseNum(form.lat);
  const lng = parseNum(form.lng);
  const radius = parseNum(form.radiusMeters);

  if (!slug) errors.push("Slug is required.");

  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    errors.push("Latitude must be between -90 and 90.");

  if (!Number.isFinite(lng) || lng < -180 || lng > 180)
    errors.push("Longitude must be between -180 and 180.");

  if (!Number.isFinite(radius) || radius < 10 || radius > 1000)
    errors.push("Radius should be 10–1000m.");

  // Region and category are now free-text fields in the boilerplate
  const region = (form.region || "").trim();
  const category = (form.category || "").trim();

  return {
    errors,
    slug,
    lat,
    lng,
    radius,
    region,
    category,
  };
}

export function validateCheckpoints(rows: CheckpointFormState[]) {
  const errors: string[] = [];
  const parsed: Checkpoint[] = [];
  const seenIds = new Set<string>();

  rows.forEach((r, i) => {
    const idx = i + 1;

    const id = (r.id ?? "").trim();
    if (!id) errors.push(`Checkpoint ${idx}: ID is required.`);
    if (id) {
      if (seenIds.has(id)) errors.push(`Checkpoint ${idx}: ID must be unique.`);
      seenIds.add(id);
    }

    const label = (r.label ?? "").trim();
    const lat = parseNum(r.lat);
    const lng = parseNum(r.lng);
    const radius = parseNum(r.radiusMeters);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90)
      errors.push(`Checkpoint ${idx}: latitude must be between -90 and 90.`);

    if (!Number.isFinite(lng) || lng < -180 || lng > 180)
      errors.push(`Checkpoint ${idx}: longitude must be between -180 and 180.`);

    if (!Number.isFinite(radius) || radius < 5 || radius > 2000)
      errors.push(`Checkpoint ${idx}: radius should be 5–2000m.`);

    parsed.push({
      id: id || undefined,
      label: label || undefined,
      lat,
      lng,
      radiusMeters: radius,
    });
  });

  return { errors, parsed };
}