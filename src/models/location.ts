export type __Location__Region = "region_1" | "region_2" | "region_3" | "region_4" | "region_5";

export type __Location__Category = "category_1" | "category_2" | "category_3" | "other";

export type Checkpoint = {
  id?: string;
  label?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type __Location__ = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;

  region: __Location__Region;
  category: __Location__Category;

  defaultCheckpointId?: string;
  mapLat?: number;
  mapLng?: number;

  active: boolean;
  description?: string;
  checkpoints?: Checkpoint[];
};

export type __Location__FormState = {
  name: string;
  slug: string;
  lat: string;
  lng: string;
  radiusMeters: string;
  region: __Location__Region;
  category: __Location__Category;
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