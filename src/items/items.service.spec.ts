import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { ItemsServiceMock } from './items.service.mock';

describe('ItemsService', () => {
  let service: ItemsService;
  const ItemsServiceProvider = {
    provide: ItemsService,
    useClass: ItemsServiceMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemsServiceProvider],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
