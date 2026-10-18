"use client";

import { useEffect } from "react";

export const JsClass = (): null => {
  useEffect(() => {
    document.documentElement.classList.add("js");
  }, []);

  return null;
};
