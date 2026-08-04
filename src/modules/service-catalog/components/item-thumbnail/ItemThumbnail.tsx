import ShapesIcon from "@zendeskgarden/svg-icons/src/16/shapes-fill.svg";
import styled from "styled-components";
import { getColor } from "@zendeskgarden/react-theming";
import { Avatar } from "@zendeskgarden/react-avatars";
import { Icon } from "@iconify/react";

import { resolveItemIcon } from "../../../shared";

const StyledAvatar = styled(Avatar)<{ size: "medium" | "large" }>`
  background-color: ${({ theme }) =>
    getColor({ theme, hue: "grey", shade: 100 })};
  width: ${(props) => (props.size === "large" ? 72 : 40)}px !important;
  height: ${(props) => (props.size === "large" ? 72 : 40)}px !important;

  && > svg {
    width: ${(props) => (props.size === "large" ? 28 : 16)}px;
    height: ${(props) => (props.size === "large" ? 28 : 16)}px;
    color: ${({ theme }) => getColor({ theme, hue: "grey", shade: 600 })};
  }
`;

type ItemThumbnailProps = {
  size: "medium" | "large";
  /** Item display name — used to look up a curated icon (SERVICE_ICON_MAP). */
  name?: string | null;
  /** Item description — may contain an `[icon: ...]` reference marker. */
  description?: string | null;
  /** Uploaded thumbnail image URL (legacy fallback). */
  url?: string | null;
};

export const ItemThumbnail = ({
  size,
  name,
  description,
  url,
}: ItemThumbnailProps) => {
  const icon = resolveItemIcon({ name, description, thumbnailUrl: url });

  return (
    <StyledAvatar size={size} isSystem>
      {icon.kind === "iconify" ? (
        <Icon icon={icon.name} aria-hidden="true" />
      ) : icon.kind === "image" ? (
        <img src={icon.url} alt="" />
      ) : (
        <ShapesIcon aria-hidden="true" />
      )}
    </StyledAvatar>
  );
};
