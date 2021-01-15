import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersMock } from './orders.mock';
import { OrdersService } from './orders.service';

describe('orders Controller', () => {
  let controller: OrdersController;
  const OrdersServiceProvider = {
    provide: OrdersService,
    useClass: OrdersMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersServiceProvider],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
