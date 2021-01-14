import { ItemDto } from './dto/item.dto';
import { Items } from './item.entity';

export class ItemsServiceMock {
  findAll(where: any): any[] {
    return [
      {
        itemNumber: '242424',
        quantity: 2,
        threshold: null,
        amazonSku: 'AMAz',
        supplier: 'aeasee',
        altSupplier: '',
        status: 2,
        id: '9a6777c8-db44-4f54-8cd9-6c051bb90ad9',
        updatedAt: new Date(),
        deletedAt: null,
        note: null,
        createdAt: new Date(),
      },
    ];
  }

  findOne(where: any): any {
    return {
      itemNumber: '242424',
      quantity: 2,
      threshold: null,
      amazonSku: 'AMAz',
      supplier: 'aeasee',
      altSupplier: '',
      status: 2,
      id: '9a6777c8-db44-4f54-8cd9-6c051bb90ad9',
      updatedAt: new Date(),
      deletedAt: null,
      note: null,
      createdAt: new Date(),
    };
  }

  create(data: ItemDto): Partial<Items> {
    return {
      itemNumber: '242424',
      quantity: 2,
      threshold: null,
      amazonSku: 'AMAz',
      supplier: 'aeasee',
      altSupplier: '',
      status: 2,
      id: '9a6777c8-db44-4f54-8cd9-6c051bb90ad9',
      updatedAt: new Date(),
      deletedAt: null,
      note: null,
      createdAt: new Date(),
    };
  }

  save(data: ItemDto): Promise<Items> {
    const responseData = {
      itemNumber: '242424',
      quantity: 2,
      threshold: null,
      amazonSku: 'AMAz',
      supplier: 'aeasee',
      altSupplier: '',
      status: 'ACTIVE',
      id: '9a6777c8-db44-4f54-8cd9-6c051bb90ad9',
      updatedAt: '2021-01-14T22:02:12.617Z',
      deletedAt: null,
      note: null,
      createdAt: '2021-01-14T22:02:12.617Z',
    };
    const promise = new Promise((resolve, rejects) => {
      resolve(responseData);
    });
    return promise.then();
  }
}
