import type { Customer } from "../types";

interface Props {
  customers: Customer[];
}

export function CustomerTable({ customers }: Props) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="p-3 text-left">No</th>
          <th className="p-3 text-left">Nama</th>
          <th className="p-3 text-left">Telepon</th>
          <th className="p-3 text-left">Status</th>
        </tr>
      </thead>

      <tbody>
        {customers.map((customer, index) => (
          <tr key={customer.id} className="border-b">
            <td className="p-3">{index + 1}</td>
            <td className="p-3">{customer.fullname}</td>
            <td className="p-3">{customer.phonenumber}</td>
            <td className="p-3">{customer.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
