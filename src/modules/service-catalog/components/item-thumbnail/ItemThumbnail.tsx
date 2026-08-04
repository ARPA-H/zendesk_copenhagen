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

  /* Iconify sets (uil, mdi, etc.) bake their own padding into the 24x24
     viewBox, so shrinking the svg box further on top of that made icons look
     much smaller than uploaded PNGs, which are full-bleed. Fill the avatar
     the same way img does (Garden's default "& > img { width/height: 100% }")
     instead of applying an extra size reduction.
     !important needed: Garden's own "&& > svg { width: 1em; height: 1em }"
     rule has identical specificity, so cascade order alone can't be trusted. */
  && > svg {
    width: 100% !important;
    height: 100% !important;
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
