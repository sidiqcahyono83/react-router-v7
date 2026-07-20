export interface Customer {
  id: string;
  fullname: string;
  username: string;
  address?: string;
  status?: string;
  phonenumber: string;
  ontName: string;
  redamanOlt: string;
  diskon: number;
  olt: string;
  createdAt: Date;
  updatedAt: Date;
  paketId: string;
  areaId: string;
  odpId: string;
  modemId: string;

  oltId: string;
  paket: Paket;
  area: Area;
  odp: Odp;
  modem: Modem;
  Olt: Olt;
  Pembayaran: Pembayaran[];
}

export interface dataLogin {
  username: string;
  password: string;
}

export interface Area {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
  level: string;
}
export interface Paket {
  id: string;
  name: string;
  harga: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface Modem {
  id: string;
  name: string;
  serial: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Odp {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Olt {
  id: string;
  name: string;
  serial: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}
// app/type/pembayaran.ts

export interface Pembayaran {
  id: string;
  periode: string;
  metode: string;
  totalBayar: number;
  bulan: number | null;
  tahun: number | null;
  image: string | null;

  customer: {
    id: string;
    fullname: string;
    username: string;

    paket: {
      id: string;
      name: string;
      harga: number;
    };

    area: {
      id: string;
      name: string;
    };

    odp: {
      id: string;
      name: string;
    };

    modem: {
      id: string;
      name: string;
      serial: string;
    };
  };

  user: {
    id: string;
    fullname: string;
    username: string;
  };

  pendapatan: {
    id: string;
    totalMasuk: number;
    metode: string;
  } | null;
}

export interface PembayaranResponse {
  pembayarans: Pembayaran[];
}

export interface PembayaranFormData {
  customerId: string;
  periode: string;
  metode: string;
  totalBayar: number;
  image?: File | null;
}

export interface CustomerOption {
  id: string;
  fullname: string;
  username: string;

  paket?: {
    name: string;
    harga: number;
  };

  diskon: number;
}

export interface Pendapatan {
  id: string;
  totalMasuk: number;
  deskripsi: string;
  metode: string;
  createdAt: string;
  updatedAt: string;
  pembayaran: Pembayaran[];
}

export interface PendapatanResponse {
  pendapatan: Pendapatan[];
}

export interface Pendapatan {
  id: string;
  totalMasuk: number;
  deskripsi: string;
  metode: string;
  createdAt: string;
  updatedAt: string;
  pembayaran: Pembayaran[];
}
