import { TestBed } from '@angular/core/testing';

import { DataRouteService } from './data-route.service';

describe('DataRouteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataRouteService = TestBed.get(DataRouteService);
    expect(service).toBeTruthy();
  });
});
