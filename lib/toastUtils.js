import { toast } from "sonner";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Leaf,
  Sun,
  CloudLightning,
  Droplet,
} from "lucide-react";

// Success: Growth (leaf, vibrant agri green)
export const showSuccess = (message) =>
  toast.success(message, {
    icon: <Leaf className="text-green-700" />, // leaf = growth
    className:
      "bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50 border border-green-600 shadow-sm",
  });

// Info: Innovation / General info (lime-blue hybrid for tech)
export const showInfo = (message) =>
  toast(message, {
    icon: <Sun className="text-lime-700" />, // sun = clarity, innovation
    className:
      "bg-lime-50 text-lime-900 dark:bg-lime-900 dark:text-lime-50 border border-lime-600 shadow-sm",
  });

// Warning: Weather alerts or harvest alerts (golden yellow)
export const showWarning = (message) =>
  toast.warning(message, {
    icon: <CloudLightning className="text-yellow-700" />, // cloud = agri uncertainty
    className:
      "bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-50 border border-yellow-600 shadow-sm",
  });

// Error: Dryness, issues (deep clay red)
export const showError = (message) =>
  toast.error(message, {
    icon: <Droplet className="text-red-800" />, // droplet = water/stress
    className:
      "bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-50 border border-red-700 shadow-sm",
  });
