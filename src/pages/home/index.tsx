import { useContext } from "react";
import { Flex, Typography } from "antd";
import { ColorModeContext } from "../../contexts/color-mode";
import "./home.css";

export const Home = () => {
  const { mode } = useContext(ColorModeContext);
  const isDark = mode === "dark";

  return (
    <Flex
      align="center"
      justify="center"
      className={`home-hero ${isDark ? "home-hero--dark" : "home-hero--light"}`}
    >
      <div className="home-hero__content">
        <Typography.Title level={1} className="home-hero__title">
          Hello
        </Typography.Title>
        <Typography.Paragraph className="home-hero__subtitle">
          Welcome to your Taruvi template
        </Typography.Paragraph>
      </div>
    </Flex>
  );
};
