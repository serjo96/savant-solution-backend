import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ItemsMock } from './items.mock';

describe('Items Controller', () => {
  let controller: ItemsController;
  const ItemsServiceProvider = {
    provide: ItemsService,
    useClass: ItemsMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [ItemsServiceProvider],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
