export enum GraingerStatusEnum {
  WaitForProceed = 0,
  Proceed = 1,
  Success = 2,
  Error = 3,
}

export class GetGraingerOrder {
  amazonOrderId: string;
  status: GraingerStatusEnum;
  graingerOrders: {
    graingerOrderId: string;
    g_web_number: string;
    graingerTrackingNumber: string;
    items: {
      graingerItemNumber: string;
      graingerPrice: string;
    }[];
  }[];
}
