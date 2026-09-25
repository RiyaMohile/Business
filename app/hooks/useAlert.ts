"use client";

import { useState } from "react";

type AlertType =
  | "success"
  | "error"
  | "warning"
  | "info";

export function useAlert() {
  const [alert, setAlert] = useState({
    open: false,
    title: "",
    message: "",
    type: "info" as AlertType,
  });

  const showAlert = (
    message: string,
    type: AlertType = "info",
    title?: string
  ) => {
    setAlert({
      open: true,
      message,
      type,
      title: title || "",
    });
  };

  const closeAlert = () => {
    setAlert((previous) => ({
      ...previous,
      open: false,
    }));
  };

  return {
    alert,
    showAlert,
    closeAlert,
  };
}