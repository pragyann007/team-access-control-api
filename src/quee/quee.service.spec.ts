import { Test, TestingModule } from '@nestjs/testing';
import { QueeService } from './quee.service';

describe('QueeService', () => {
  let service: QueeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueeService],
    }).compile();

    service = module.get<QueeService>(QueeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
