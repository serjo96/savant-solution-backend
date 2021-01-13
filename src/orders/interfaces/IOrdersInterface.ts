export default interface IOrdersInterface {
  id: string;
  quantity: number;
  itemNumber: string;
  amazonSku: string;
  status: string;
  threshold: number;
  supplier: string;
  altSupplier: string;
  note: string;
}