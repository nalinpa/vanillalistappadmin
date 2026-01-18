export type Checkpoint = {
  id?: string; // stable string (recommended)
  label?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type Cone = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
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
