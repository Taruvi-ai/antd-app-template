import type { MenuProps } from "antd";
import React, { useMemo, useState } from "react";
import { Menu } from "antd";
import { type TreeMenuItem, useLink, useMenu } from "@refinedev/core";
import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";

/** Compact column; main content offset uses --app-sider-width in App.tsx */
const WIDTH_EXPANDED = 152;
const WIDTH_COLLAPSED = 56;

export const SideNav = ({ meta }: { meta?: Record<string, unknown> }) => {
  const [collapsed, setCollapsed] = useState(true);
  const Link = useLink();

  const { menuItems, selectedKey } = useMenu({ meta });

  const cleanedMenuItems = useMemo(() => {
    const mapItems = (nodes: TreeMenuItem[]): NonNullable<MenuProps["items"]> =>
      nodes.map((item) => {
        const labelText = item.label ?? item.name;
        if (item.children?.length) {
          return {
            key: item.key,
            icon: item.icon,
            label: labelText,
            children: mapItems(item.children),
          };
        }
        return {
          key: item.key,
          icon: item.icon,
          label: <Link to={item.route ?? ""}>{labelText}</Link>,
        };
      });

    return mapItems(menuItems);
  }, [menuItems, Link]);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        height: "100%",
        width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED,
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((c) => !c)}
        style={{
          flexShrink: 0,
          width: "100%",
          height: 46,
          padding: 0,
          border: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          background: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {collapsed ? <MenuUnfoldOutlined style={{fontSize: 18, color: "#434343", lineHeight: 1}}/> : <MenuFoldOutlined style={{fontSize: 18, color: "#434343", lineHeight: 1}} />}
      </button>
      <Menu
        inlineCollapsed={collapsed}
        inlineIndent={collapsed ? 12 : 14}
        items={cleanedMenuItems}
        selectedKeys={selectedKey ? [selectedKey] : []}
        style={{
          flex: 1,
          overflowY: "auto",
          border: "none",
          width: "100%",
          minWidth: 0,
        }}
      />
    </div>
  );
};
