import { Toaster } from "~/components/ui/sonner";

type Props = {
  children: React.ReactNode;
};

export function AppProvider({ children }: Props) {
  return (
    <>
      {children}

      <Toaster richColors position="top-right" />
    </>
  );
}
