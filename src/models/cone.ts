export type ConeRegion = "central" | "north" | "harbour" | "south";

export type Checkpoint = {
  id?: string;
  label?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type Cone = {
  id: string;
  name: string;
  slug: string;

  // "core" location (can remain, used as fallback)
  lat: number;
  lng: number;
  radiusMeters: number;
  region: ConeRegion;
  defaultCheckpointId?: string;
  mapLat?: number;
  mapLng?: number;

  active: boolean;
  description?: string;
  checkpoints?: Checkpoint[];
};

export type ConeFormState = {
  name: string;
  slug: string;
  lat: string;
  lng: string;
  radiusMeters: string;
  region: ConeRegion;
  mapLat: string;
  mapLng: string;
  active: boolean;
  description: string;
};

export type CheckpointFormState = {
  id: string;
  label: string;
  lat: string;
  lng: string;
  radiusMeters: string;
};
