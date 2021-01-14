import { Test, TestingModule } from '@nestjs/testing';
import { OrdersMock } from './orders.mock';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  const OrdersServiceProvider = {
    provide: OrdersService,
    useClass: OrdersMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersServiceProvider],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
