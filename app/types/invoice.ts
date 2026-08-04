export interface InvoiceDashboardResponse {
  success: boolean;
  data: {
    invoice: {
      total: number;
      bulanIni: number;
    };

    status: {
      paid: number;
      unpaid: number;
      partial: number;
      expired: number;
      cancelled: number;
      overdue: number;
      dueToday: number;
      dueNext7Days: number;
    };

    nominal: {
      total: number;
      paid: number;
      outstanding: number;
    };
  };
}
