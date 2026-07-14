import { z } from "zod";

export const customerSchema = z.object({
  username: z.string().min(10),
  fullname: z.string().min(3),
  address: z.string().min(5),
  phonenumber: z.string().min(10),
  ontName: z.string().min(10),
  redamanOlt: z.string().min(10),
  diskon: z.number(),
  olt: z.string().min(10),
  paketId: z.string().min(10),
  areaId: z.string().min(10),
  odpId: z.string().min(10),
  modemId: z.string().min(10),
  oltId: z.string().min(10),
  status: z.enum(["active", "nonactive"]),
});

export type CustomerSchema = z.infer<typeof customerSchema>;
