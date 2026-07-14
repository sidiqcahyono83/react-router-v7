import { Toaster } from "~/components/ui/sonner";

export function ToastProvider() {
  return (
    <Toaster richColors position="top-right" closeButton duration={3000} />
  );
}
