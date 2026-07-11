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

export interface Area {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
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
