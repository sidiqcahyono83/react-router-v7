import { format } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: Date | string, pattern = "dd MMM yyyy") {
  return format(new Date(date), pattern, {
    locale: id,
  });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy HH:mm", {
    locale: id,
  });
}
