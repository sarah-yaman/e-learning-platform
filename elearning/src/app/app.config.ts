import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {InterceptorService} from "./services/interceptor.service"

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient,  withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),provideHttpClient(withInterceptorsFromDi()), { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }, provideAnimationsAsync() ]
};
