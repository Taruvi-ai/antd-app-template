import type { ReactNode } from "react";

/** Matches @taruvi/navkit ProfileMenuItem — local until navkit exports it. */
export type ProfileMenuItem = {
  title: string;
  icon: ReactNode;
  callBackFunc: () => void;
};
