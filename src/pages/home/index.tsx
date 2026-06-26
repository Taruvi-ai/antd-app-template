import { Flex, Typography } from "antd";
import { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";

export const Home = () => {
  const { mode } = useContext(ColorModeContext);
  const isDark = mode === "dark";

  const coverBackground = isDark
    ? "linear-gradient(135deg, #002A3C 0%, #004369 55%, #056A8F 100%)"
    : "linear-gradient(135deg, #dce9f5 0%, #5ab4f0 60%, #2b97ff 100%)";

  return (
    <div
      style={{
        minHeight: "calc(100vh - var(--nav-height, 60px))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: coverBackground,
        position: "relative",
        overflow: "hidden",
        padding: "48px 32px",
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        gap={48}
        style={{ width: "100%", maxWidth: 1200, zIndex: 1 }}
        wrap="wrap"
      >
        <div>
          <Typography.Title
            level={1}
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 300,
              color: "#fff",
              fontSize: "clamp(2.5rem, 5vw, 3.625rem)",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Taruvi
            <br />
            Design
            <br />
            System
          </Typography.Title>
          <Typography.Paragraph
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: "'Open Sans', sans-serif",
              fontSize: "1.0625rem",
              maxWidth: 420,
              marginBottom: 0,
            }}
          >
            Welcome to your Taruvi template — branded with the Taruvi design system.
          </Typography.Paragraph>
        </div>

        <Flex
          align="flex-end"
          gap={12}
          style={{
            display: "none",
            opacity: 0.85,
            fontFamily: "'Quicksand', sans-serif",
          }}
          className="home-type-demo"
        />
      </Flex>
      <style>{`
        @media (min-width: 768px) {
          .home-type-demo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};
