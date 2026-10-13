import type React from "react";
import { useId } from "react";
import styled from "styled-components";
import { getColor } from "@zendeskgarden/react-theming";
import ChevronDownIcon from "@zendeskgarden/svg-icons/src/12/chevron-down-fill.svg";
import ChevronUpIcon from "@zendeskgarden/svg-icons/src/12/chevron-up-fill.svg";
import { useTranslation } from "react-i18next";
import type { Category } from "../../data-types/Categories";
import { ALL_SERVICES_ID, UNCATEGORIZED_ID } from "./constants";

const MAX_NESTING_LEVEL = 6;
const INDENT_PER_LEVEL = 20;
const BASE_PADDING_LEFT = 32;
const ARROW_MARGIN_LEFT = 12;

const CategoryItemWrapper = styled.div`
  width: 100%;
`;

const CategoryItemContainer = styled.div<{ $nestingLevel: number }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: ${(props) => {
    const level = Math.min(props.$nestingLevel, MAX_NESTING_LEVEL);
    return `${level * INDENT_PER_LEVEL}px`;
  }};
`;

const StyledSidebarItem = styled.div<{
  $active?: boolean;
  $nestingLevel: number;
  $hasChildren: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  padding-right: 12px;
  padding-left: ${(props) => {
    const level = Math.min(props.$nestingLevel, MAX_NESTING_LEVEL);
    const baseOffset = BASE_PADDING_LEFT + level * INDENT_PER_LEVEL;
    return props.$hasChildren ? `${ARROW_MARGIN_LEFT}px` : `${baseOffset}px`;
  }};
  cursor: pointer;
  background-color: ${(props) =>
    props.$active
      ? getColor({ theme: props.theme, hue: "blue", shade: 100 })
      : "transparent"};
  border-radius: 4px;

  &:hover {
    background-color: ${(props) =>
      props.$active
        ? getColor({ theme: props.theme, hue: "blue", shade: 200 })
        : getColor({ theme: props.theme, hue: "grey", shade: 100 })};
  }
`;

const ExpandButton = styled.button`
  position: relative;
  /* Above the select button's overlay, so the toggle takes its own clicks. */
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  /* A 24px hit area around the 12px chevron (WCAG 2.5.8 target size); the
     negative margins keep the chevron exactly where it was. */
  width: 24px;
  height: 24px;
  margin-block: -6px;
  margin-inline: -6px 2px;
  color: ${({ theme }) => getColor({ theme, hue: "grey", shade: 600 })};
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => getColor({ theme, hue: "grey", shade: 800 })};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

/* The row's control. It is a sibling of the expand button, never its parent:
   a button must not contain another control, and assistive technology may
   flatten one that does. Its ::after stretches over the whole row, so a click
   anywhere on the row still selects the category. */
const SelectButton = styled.button`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 4px;
  }

  &:focus-visible {
    /* The row-wide ring below replaces the theme's own ring on the button. */
    outline: none;
    box-shadow: none;
  }

  &:focus-visible::after {
    /* The transparent outline is repainted in forced-colors mode, where the
       box-shadow ring is dropped. */
    outline: 2px solid transparent;
    outline-offset: -2px;
    box-shadow: inset 0 0 0 2px
      ${(props) =>
        getColor({ theme: props.theme, variable: "border.primaryEmphasis" })};
  }
`;

const SidebarItemName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemCount = styled.span`
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => getColor({ theme, variable: "foreground.subtle" })};
`;

interface CategoryItemProps {
  category: Category;
  nestingLevel: number;
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  expandedCategories: Set<string>;
  onToggleExpand: (categoryId: string) => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  nestingLevel,
  expandedCategories,
  onToggleExpand,
  selectedCategoryId,
  onSelect,
}) => {
  const hasChildren = (category.children?.length ?? 0) > 0;
  const isExpanded = expandedCategories.has(category.id);
  const isAllServices = category.id === ALL_SERVICES_ID;
  const isUncategorized = category.id === UNCATEGORIZED_ID;
  const isSelected = selectedCategoryId === category.id;

  const { t, i18n } = useTranslation();
  const nameId = useId();
  const countId = useId();
  const childrenId = useId();
  const hasCount = typeof category.items_count === "number";

  const displayName = isAllServices
    ? t("service-catalog-sidebar.all-services", "All services")
    : isUncategorized
      ? t("service-catalog-sidebar.uncategorized", "Uncategorized")
      : category.name;

  // Name the toggle after its category, so a list of buttons does not read
  // "Expand, Expand, Expand". Where the locale has the name-bearing message
  // (English only: a theme cannot add Help Center translations), the name stays
  // the same when the state changes and aria-expanded says whether the
  // subcategories are showing. Every other locale keeps the Expand or Collapse
  // message it already translates, followed by the category's own name, rather
  // than an English phrase read in the wrong language.
  const toggleLabel = i18n.exists("service-catalog-sidebar.subcategories-named")
    ? t(
        "service-catalog-sidebar.subcategories-named",
        "{{name}} subcategories",
        { name: displayName }
      )
    : `${
        isExpanded
          ? t("service-catalog-sidebar.collapse-category", "Collapse")
          : t("service-catalog-sidebar.expand-category", "Expand")
      } ${displayName}`;

  return (
    <>
      <CategoryItemWrapper>
        <StyledSidebarItem
          $active={isSelected}
          $nestingLevel={nestingLevel}
          $hasChildren={hasChildren}
          data-test-id={
            isAllServices
              ? "sidebar-all-services"
              : `sidebar-category-${category.id}`
          }
        >
          <CategoryItemContainer $nestingLevel={hasChildren ? nestingLevel : 0}>
            {hasChildren && (
              <ExpandButton
                onClick={() => onToggleExpand(category.id)}
                aria-label={toggleLabel}
                aria-expanded={isExpanded}
                aria-controls={isExpanded ? childrenId : undefined}
                type="button"
              >
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </ExpandButton>
            )}
            <SelectButton
              onClick={() => onSelect(category.id)}
              aria-current={isSelected ? "true" : undefined}
              // Name it after the category and its count only.
              aria-labelledby={hasCount ? `${nameId} ${countId}` : nameId}
              type="button"
            >
              <SidebarItemName id={nameId}>{displayName}</SidebarItemName>
              {hasCount && (
                <ItemCount id={countId}>{category.items_count}</ItemCount>
              )}
            </SelectButton>
          </CategoryItemContainer>
        </StyledSidebarItem>
      </CategoryItemWrapper>
      {hasChildren && isExpanded && (
        <div id={childrenId}>
          {category.children?.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              nestingLevel={nestingLevel + 1}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              expandedCategories={expandedCategories}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </>
  );
};
