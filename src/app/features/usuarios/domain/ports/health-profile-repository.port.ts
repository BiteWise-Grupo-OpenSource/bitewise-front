import { Observable } from 'rxjs';
import { HealthProfile, CreateHealthProfileDto, UpdateHealthProfileDto } from '../entities';

/**
 * Port for Health Profile repository operations.
 */
export abstract class HealthProfileRepositoryPort {
  abstract getByUserId(userId: number): Observable<HealthProfile | undefined>;
  abstract create(dto: CreateHealthProfileDto): Observable<HealthProfile>;
  abstract update(id: number, dto: UpdateHealthProfileDto): Observable<HealthProfile>;
}
