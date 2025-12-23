import { toast } from "react-toastify";

export const successnotify = (message: string) => {
  toast.success(message, {
    position: "bottom-left",
    theme: "dark",
    autoClose: 1000,
  });
};

export const errornotify = (title: string, message?: string) => {
  const displayMessage = message ? `${title}: ${message}` : title;
  toast.error(displayMessage, {
    position: "bottom-left",
    theme: "dark",
    autoClose: 3000,
  });
};

export default { successnotify, errornotify };
