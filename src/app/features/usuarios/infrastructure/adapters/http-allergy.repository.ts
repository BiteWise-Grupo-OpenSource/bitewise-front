import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Allergy } from '../../domain/entities';
import { AllergyRepositoryPort } from '../../domain/ports';

@Injectable({ providedIn: 'root' })
export class HttpAllergyRepository extends AllergyRepositoryPort {

  private readonly baseUrl = `${environment.apiUrl}/allergies`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getAll(): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(this.baseUrl);
  }
}
