"use client";

import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  X,
} from "lucide-react";

interface AlertBoxProps {
  open: boolean;
  title?: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export default function AlertBox({
  open,
  title,
  message,
  type = "info",
  onClose,
}: AlertBoxProps) {
  if (!open) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-green-600",
      bgClass: "bg-green-50",
      title: title || "Success",
    },

    error: {
      icon: XCircle,
      iconClass: "text-red-600",
      bgClass: "bg-red-50",
      title: title || "Something went wrong",
    },

    warning: {
      icon: AlertCircle,
      iconClass: "text-yellow-600",
      bgClass: "bg-yellow-50",
      title: title || "Warning",
    },

    info: {
      icon: Info,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
      title: title || "Information",
    },
  };

  const selected = config[type];

  const Icon = selected.icon;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${selected.bgClass}`}
            >
              <Icon
                size={22}
                className={selected.iconClass}
              />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              {selected.title}
            </h3>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>

        </div>

        {/* MESSAGE */}
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {message}
        </p>

        {/* BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          OK
        </button>

      </div>
    </div>
  );
}