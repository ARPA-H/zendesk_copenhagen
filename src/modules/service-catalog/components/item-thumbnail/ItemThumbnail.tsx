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

  /* ~60% of the avatar's diameter, matching how uploaded/image icons already
     fill the circle (Garden's default "& > img { width/height: 100% }").
     !important needed: Garden's own "&& > svg { width: 1em; height: 1em }"
     rule has identical specificity, so cascade order alone can't be trusted. */
  && > svg {
    width: ${(props) => (props.size === "large" ? 44 : 24)}px !important;
    height: ${(props) => (props.size === "large" ? 44 : 24)}px !important;
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

  // Rendered when an iconify reference can't actually be resolved (typo'd
  // name, icon doesn't exist, API unreachable) — otherwise @iconify/react
  // silently renders nothing, which looks like no icon was set at all.
  const unresolvedIconFallback =
    url && url.trim() ? (
      <img src={url} alt="" />
    ) : (
      <ShapesIcon aria-hidden="true" />
    );

  return (
    <StyledAvatar size={size} isSystem>
      {icon.kind === "iconify" ? (
        <Icon
          icon={icon.name}
          aria-hidden="true"
          fallback={unresolvedIconFallback}
        />
      ) : icon.kind === "image" ? (
        <img src={icon.url} alt="" />
      ) : (
        <ShapesIcon aria-hidden="true" />
      )}
    </StyledAvatar>
  );
};
