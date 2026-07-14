import { useEffect, useState } from "react";
import { CustomerAPI } from "~/features/customers/api/list";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const customers = await CustomerAPI.getAll();
      setCustomers(customers);
    } catch (error: any) {
      console.log(error.response?.status);
      console.log(error.response?.data);
    }
  }

  return (
    <div>
      {customers.map((item: any) => (
        <div key={item.id}>{item.fullname}</div>
      ))}
    </div>
  );
}
