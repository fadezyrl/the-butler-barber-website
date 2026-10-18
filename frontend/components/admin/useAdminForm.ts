"use client";

import { useCallback, useState } from "react";

import { AdminApiError } from "@/lib/admin-api";

type FormStatus = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export const useAdminForm = () => {
  const [status, setStatus] = useState<FormStatus>({
    loading: false,
    error: null,
    success: null,
  });

  const run = useCallback(async <T,>(
    action: () => Promise<T>,
    successMessage = "Saved successfully.",
  ): Promise<T | null> => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const result = await action();
      setStatus({ loading: false, error: null, success: successMessage });
      return result;
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setStatus({ loading: false, error: message, success: null });
      return null;
    }
  }, []);

  const clear = useCallback((): void => {
    setStatus({ loading: false, error: null, success: null });
  }, []);

  return { ...status, run, clear, setStatus };
};
