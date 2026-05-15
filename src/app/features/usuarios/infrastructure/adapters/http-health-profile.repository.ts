import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HealthProfile, CreateHealthProfileDto, UpdateHealthProfileDto } from '../../domain/entities';
import { HealthProfileRepositoryPort } from '../../domain/ports';

/**
 * HTTP adapter implementing HealthProfileRepositoryPort.
 */
@Injectable({ providedIn: 'root' })
export class HttpHealthProfileRepository extends HealthProfileRepositoryPort {

  private readonly baseUrl = `${environment.apiUrl}/health-profiles`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getByUserId(userId: number): Observable<HealthProfile | undefined> {
    return this.http.get<HealthProfile[]>(this.baseUrl, { params: { userId: userId.toString() } })
      .pipe(map(profiles => profiles[0]));
  }

  create(dto: CreateHealthProfileDto): Observable<HealthProfile> {
    return this.http.post<HealthProfile>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateHealthProfileDto): Observable<HealthProfile> {
    return this.http.patch<HealthProfile>(`${this.baseUrl}/${id}`, dto);
  }
}
