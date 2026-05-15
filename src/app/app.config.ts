import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

// Domain ports
import { UserRepositoryPort } from './features/usuarios/domain/ports';
import { HealthProfileRepositoryPort } from './features/usuarios/domain/ports';
import { GoalRepositoryPort } from './features/usuarios/domain/ports';
import { ActivityLevelRepositoryPort } from './features/usuarios/domain/ports';
import { AllergyRepositoryPort } from './features/usuarios/domain/ports';

// Infrastructure adapters
import { HttpUserRepository } from './features/usuarios/infrastructure/adapters';
import { HttpHealthProfileRepository } from './features/usuarios/infrastructure/adapters';
import { HttpGoalRepository } from './features/usuarios/infrastructure/adapters';
import { HttpActivityLevelRepository } from './features/usuarios/infrastructure/adapters';
import { HttpAllergyRepository } from './features/usuarios/infrastructure/adapters';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),

    // i18n — ngx-translate v17 uses DI-based loader
    ...provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader
        }
      })
    ),

    // Hexagonal DI — bind ports to adapters
    { provide: UserRepositoryPort, useClass: HttpUserRepository },
    { provide: HealthProfileRepositoryPort, useClass: HttpHealthProfileRepository },
    { provide: GoalRepositoryPort, useClass: HttpGoalRepository },
    { provide: ActivityLevelRepositoryPort, useClass: HttpActivityLevelRepository },
    { provide: AllergyRepositoryPort, useClass: HttpAllergyRepository }
  ]
};
