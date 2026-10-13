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

  &:focus {
    outline: none;
  }

  &:focus-visible {
    /* The transparent outline is repainted in forced-colors mode, where the
       box-shadow ring is dropped. */
    outline: 2px solid transparent;
    outline-offset: -2px;
    box-shadow: inset 0 0 0 2px
      ${(props) =>
        getColor({ theme: props.theme, variable: "border.primaryEmphasis" })};
  }
`;

const ExpandButton = styled.button`
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

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 8px;
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

  const { t } = useTranslation();
  const nameId = useId();
  const countId = useId();
  const hasCount = typeof category.items_count === "number";

  const displayName = isAllServices
    ? t("service-catalog-sidebar.all-services", "All services")
    : isUncategorized
      ? t("service-catalog-sidebar.uncategorized", "Uncategorized")
      : category.name;

  // Name the toggle after its category, so a list of buttons does not read
  // "Expand, Expand, Expand".
  const toggleLabel = isExpanded
    ? t(
        "service-catalog-sidebar.collapse-category-named",
        "Collapse {{name}}",
        {
          name: displayName,
        }
      )
    : t("service-catalog-sidebar.expand-category-named", "Expand {{name}}", {
        name: displayName,
      });

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(category.id);
  };

  return (
    <>
      <CategoryItemWrapper>
        <StyledSidebarItem
          $active={isSelected}
          $nestingLevel={nestingLevel}
          $hasChildren={hasChildren}
          aria-current={isSelected ? "true" : undefined}
          // The row selects the category; without this its name would swallow
          // the nested toggle's label ("Expand Hardware 4").
          aria-labelledby={hasCount ? `${nameId} ${countId}` : nameId}
          onClick={() => onSelect(category.id)}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            // Keys pressed on the nested toggle belong to the toggle; without
            // this check the row cancels its native Enter and Space click.
            if (e.target !== e.currentTarget) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(category.id);
            }
          }}
          data-test-id={
            isAllServices
              ? "sidebar-all-services"
              : `sidebar-category-${category.id}`
          }
        >
          <CategoryItemContainer $nestingLevel={hasChildren ? nestingLevel : 0}>
            {hasChildren && (
              <ExpandButton
                onClick={handleExpandClick}
                aria-label={toggleLabel}
                type="button"
              >
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </ExpandButton>
            )}
            <ItemContent>
              <SidebarItemName id={nameId}>{displayName}</SidebarItemName>
              {hasCount && (
                <ItemCount id={countId}>{category.items_count}</ItemCount>
              )}
            </ItemContent>
          </CategoryItemContainer>
        </StyledSidebarItem>
      </CategoryItemWrapper>
      {hasChildren && isExpanded && (
        <>
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
        </>
      )}
    </>
  );
};
