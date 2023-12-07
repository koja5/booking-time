import { TestBed } from '@angular/core/testing';

import { StaticApiService } from './static-api.service';

describe('StaticApiService', () => {
  let service: StaticApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
