import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

export const ModalRoot = ({ children }: PropsWithChildren) => {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
};
