/**
 * Health profile entity — describes a user's physical and dietary attributes.
 */
export interface HealthProfile {
  id: number;
  userId: number;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  goalId: number;
  activityLevelId: number;
  allergyIds: number[];
}

export type CreateHealthProfileDto = Omit<HealthProfile, 'id'>;

export type UpdateHealthProfileDto = Partial<Omit<HealthProfile, 'id' | 'userId'>>;
