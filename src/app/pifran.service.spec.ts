import { TestBed } from '@angular/core/testing';

import { PIFranService } from './pifran.service';

describe('PIFranService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PIFranService = TestBed.get(PIFranService);
    expect(service).toBeTruthy();
  });
});
