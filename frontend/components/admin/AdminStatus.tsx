"use client";

type AdminStatusProps = {
  type?: "success" | "error" | "info";
  message: string | null;
};

export const AdminStatus = ({
  type = "info",
  message,
}: AdminStatusProps): React.JSX.Element | null => {
  if (!message) return null;
  return (
    <div className={`admin-banner admin-banner-${type}`} role="status">
      {message}
    </div>
  );
};
