export interface Pembayaran {
  id: string;

  customerId: string;

  metode: string;

  totalBayar: number;

  periode: string;

  image: string;

  createdAt: string;

  customer: {
    fullname: string;

    username: string;

    paket: {
      name: string;
      harga: number;
    };
  };
}

export interface Pagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}
