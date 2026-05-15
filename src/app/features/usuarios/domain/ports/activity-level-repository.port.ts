import { Observable } from 'rxjs';
import { ActivityLevel } from '../entities';

/**
 * Port for Activity Level catalog operations.
 */
export abstract class ActivityLevelRepositoryPort {
  abstract getAll(): Observable<ActivityLevel[]>;
  abstract getById(id: number): Observable<ActivityLevel>;
}
