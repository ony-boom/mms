import { useConnect } from "@/api/downloader/auth";

interface BindingSetupProps {
  children?: React.ReactNode;
}

export const InitBinding: React.FC<BindingSetupProps> = ({ children }) => {
  useConnect();

  // Return children when the connection has been established or failed
  return <>{children}</>;
};
