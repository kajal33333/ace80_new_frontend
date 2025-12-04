import { toast } from "sonner";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sun,
  CloudLightning,
  Droplet,
  Leaf,
} from "lucide-react";

// Success: Positive / confirmation (black & white)
export const showSuccess = (message) =>
  toast.success(message, {
    icon: <CheckCircle2 className="text-black dark:text-white" />,
    className:
      "bg-white text-black dark:bg-black dark:text-white border border-gray-700 shadow-sm",
  });

// Info: General info / notice
export const showInfo = (message) =>
  toast(message, {
    icon: <Info className="text-black dark:text-white" />,
    className:
      "bg-gray-100 text-black dark:bg-gray-800 dark:text-white border border-gray-600 shadow-sm",
  });

// Warning: Caution / alert
export const showWarning = (message) =>
  toast.warning(message, {
    icon: <AlertTriangle className="text-black dark:text-white" />,
    className:
      "bg-gray-200 text-black dark:bg-gray-700 dark:text-white border border-gray-600 shadow-sm",
  });

// Error: Error / failure
export const showError = (message) =>
  toast.error(message, {
    icon: <XCircle className="text-black dark:text-white" />,
    className:
      "bg-gray-300 text-black dark:bg-gray-800 dark:text-white border border-gray-700 shadow-sm",
  });
