import { Observable } from 'rxjs';
import { Allergy } from '../entities';

/**
 * Port for Allergy catalog operations.
 */
export abstract class AllergyRepositoryPort {
  abstract getAll(): Observable<Allergy[]>;
}
