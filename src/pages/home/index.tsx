import { useContext } from "react";
import { Typography } from "antd";
import { ColorModeContext } from "../../contexts/color-mode";
import "./home.css";

export const Home = () => {
  const { mode } = useContext(ColorModeContext);
  const isDark = mode === "dark";

  return (
    <div className={`home-hero ${isDark ? "home-hero--dark" : "home-hero--light"}`}>
      <div className="home-hero__inner">
        <div>
          <Typography.Title level={1} className="home-hero__title">
            Taruvi
            <br />
            Design
            <br />
            System
          </Typography.Title>
          <Typography.Paragraph className="home-hero__subtitle">
            Welcome to your Taruvi template — branded with the Taruvi design
            system.
          </Typography.Paragraph>
        </div>

        {/* Cover type-demo: outlined A / a (Quicksand) */}
        <div className="home-hero__glyphs" aria-hidden="true">
          <span className="home-hero__glyph-upper">A</span>
          <span className="home-hero__glyph-lower">a</span>
        </div>
      </div>
    </div>
  );
};
