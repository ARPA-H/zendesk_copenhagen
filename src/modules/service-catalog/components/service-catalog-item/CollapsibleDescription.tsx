import { useEffect, useMemo, useState, useRef } from "react";
import styled from "styled-components";
import { Button } from "@zendeskgarden/react-buttons";
import ChevronUp from "@zendeskgarden/svg-icons/src/16/chevron-up-fill.svg";
import ChevronDown from "@zendeskgarden/svg-icons/src/16/chevron-down-fill.svg";
import { useTranslation } from "react-i18next";
import { getColor } from "@zendeskgarden/react-theming";
import { XXXL } from "@zendeskgarden/react-typography";
import { ItemThumbnail } from "../item-thumbnail/ItemThumbnail";
import { sanitizeHtml } from "../../utils/sanitize";
import { stripIconMarker } from "../../../shared";

const DescriptionWrapper = styled.div`
  border-bottom: ${(props) => props.theme.borders.sm}
    ${({ theme }) => getColor({ theme, hue: "grey", shade: 300 })};
  padding-bottom: ${(props) => props.theme.space.lg};
  margin-inline-end: ${(props) => props.theme.space.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    margin-inline-end: 0;
  }
`;

const ItemTitle = styled(XXXL)`
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  margin-bottom: 0;
  min-width: 0;
  overflow-wrap: break-word;
  max-width: 100%;
`;

const CollapsibleText = styled.div<{ isCollapsed: boolean }>`
  font-size: var(--font-size-xs, 1rem);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(props) => (props.isCollapsed ? 3 : "none")};
  overflow: hidden;
  margin-top: ${(props) => props.theme.space.md};
  padding-inline-end: ${(props) => props.theme.space.xl};
  overflow-wrap: break-word;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding-inline-end: 0;
  }
`;

const ToggleButton = styled(Button)`
  margin-top: ${(props) => props.theme.space.sm};
  font-size: var(--font-size-2xs, 0.875rem);
  &:hover {
    text-decoration: none;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${(props) => props.theme.space.md};

  /* A long service name wraps; it never squeezes the icon. */
  > :first-child {
    flex-shrink: 0;
  }
`;

interface CollapsibleDescriptionProps {
  title: string;
  description: string;
  thumbnailUrl: string;
}

export const CollapsibleDescription = ({
  title,
  description,
  thumbnailUrl,
}: CollapsibleDescriptionProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isClamped, setIsClamped] = useState<boolean>(false);
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Strip any [icon: ...] marker (consumed by ItemThumbnail to choose the
  // icon) before sanitizing, so it never renders in the description text.
  const displayDescription = useMemo(
    () => sanitizeHtml(stripIconMarker(description)),
    [description]
  );

  useEffect(() => {
    const el = contentRef.current;
    // While the text is expanded there is no clamped box to measure.
    if (!el || !isCollapsed) return;

    const checkClamped = () => {
      const visibleBoxHeight = el.getBoundingClientRect().height;
      const fullContentHeight = el.scrollHeight;
      setIsClamped(fullContentHeight - visibleBoxHeight > 1);
    };

    const frame = requestAnimationFrame(checkClamped);
    // The first measurement can run before the web fonts have loaded, when a
    // fallback font wraps the lines differently, and a description that fits
    // would keep a "Read more" that reveals nothing. Measure again when fonts
    // finish loading and whenever the box changes size.
    const fonts = document.fonts;
    fonts?.addEventListener("loadingdone", checkClamped);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(checkClamped);
    observer?.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      fonts?.removeEventListener("loadingdone", checkClamped);
      observer?.disconnect();
    };
  }, [displayDescription, isCollapsed]);

  const toggleDescription = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <DescriptionWrapper>
      <HeaderContainer>
        <ItemThumbnail
          size="large"
          name={title}
          description={description}
          url={thumbnailUrl}
        />
        <ItemTitle tag="h1">{title}</ItemTitle>
      </HeaderContainer>
      {displayDescription && (
        <CollapsibleText
          ref={contentRef}
          className="service-catalog-description"
          isCollapsed={isCollapsed}
          dangerouslySetInnerHTML={{ __html: displayDescription }}
        ></CollapsibleText>
      )}
      {isClamped && (
        <ToggleButton isLink onClick={toggleDescription}>
          {!isCollapsed
            ? t("service-catalog.item.read-less", "Read less")
            : t("service-catalog.item.read-more", "Read more")}
          <Button.EndIcon>
            {!isCollapsed ? <ChevronUp /> : <ChevronDown />}
          </Button.EndIcon>
        </ToggleButton>
      )}
    </DescriptionWrapper>
  );
};
