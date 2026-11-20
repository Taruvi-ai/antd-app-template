import { ConfigProvider, theme } from "antd";
import { baseThemeConfig } from "../../theme/themeOptions";
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const colorModeFromLocalStorage = (() => {
    try {
      return localStorage.getItem("colorMode");
    } catch {
      return null;
    }
  })();
  const isSystemPreferenceDark = window?.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [mode, setModeState] = useState(
    colorModeFromLocalStorage || systemPreference
  );

  useEffect(() => {
    try {
      window.localStorage.setItem("colorMode", mode);
    } catch {
      /* storage unavailable — ignore */
    }
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const setMode = (nextMode: string) => {
    setModeState(nextMode === "dark" ? "dark" : "light");
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode,
        mode,
      }}
    >
      <ConfigProvider
        // Change brand colors in src/theme/themeOptions.ts
        theme={{
          ...baseThemeConfig,
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
