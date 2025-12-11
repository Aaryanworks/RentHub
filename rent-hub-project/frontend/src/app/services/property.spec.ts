import { TestBed } from '@angular/core/testing';
import { PropertyService } from './property';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('PropertyService', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;
  let authServiceSpy: { isLoggedIn$: any, getUser: any };

  beforeEach(() => {
    authServiceSpy = {
      isLoggedIn$: of(true),
      getUser: vi.fn().mockReturnValue(null) // Default to no user to avoid auto-requests in constructor
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PropertyService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
