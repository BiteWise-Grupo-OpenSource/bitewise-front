/**
 * Activity level entity — represents a user's physical activity frequency.
 */
export interface ActivityLevel {
  id: number;
  name: string;
  description: string;
  multiplier: number;
}
