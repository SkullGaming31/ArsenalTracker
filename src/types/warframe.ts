export interface Resource {
  name: string;
  quantity: number;
  collected: boolean;
}

export interface Warframe {
  name: string;
  type: string;
  neuroptics_collected: boolean;
  chassis_collected: boolean;
  systems_collected: boolean;
  blueprint_collected: boolean;
  is_mastered: boolean;
  neuroptics_resources: Resource[];
  chassis_resources: Resource[];
  systems_resources: Resource[];
  blueprint_resources: Resource[];
}
