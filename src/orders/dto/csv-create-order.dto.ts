export interface CsvCreateOrderDto {
  amazonOrderId: string;
  amazonItemId: string;
  createdAt: string;
  amazonSku: string;
  amazonQuantity: number;
  amazonPrice: number;
  recipientName: string;
  shipAddress: string;
  shipCity: string;
  shipState: string;
  shipPostalCode: string;
}
