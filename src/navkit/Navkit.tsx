import NavkitBase from "@taruvi/navkit";
import type { Client } from "@taruvi/sdk";
import type { ProfileMenuItem } from "./types";

type NavkitProps = {
  client: Client;
  getTheme: (theme: "light" | "dark") => void;
  profileMenuItems?: ProfileMenuItem[];
};

/**
 * Navkit wrapper — forwards profileMenuItems when the installed @taruvi/navkit
 * build supports it (feature landed in navkit after 0.0.48).
 */
export const Navkit = ({
  profileMenuItems,
  ...props
}: NavkitProps) => (
  <NavkitBase
    {...props}
    {...(profileMenuItems?.length
      ? ({ profileMenuItems } as Record<string, unknown>)
      : {})}
  />
);
