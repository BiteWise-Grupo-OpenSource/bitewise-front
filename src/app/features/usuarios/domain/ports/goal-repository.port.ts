import { Observable } from 'rxjs';
import { Goal } from '../entities';

/**
 * Port for Goal catalog operations.
 */
export abstract class GoalRepositoryPort {
  abstract getAll(): Observable<Goal[]>;
  abstract getById(id: number): Observable<Goal>;
}
