import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import ChevronDownIcon from "@zendeskgarden/svg-icons/src/12/chevron-down-fill.svg";
import { useTranslation } from "react-i18next";
import { CategoryItem } from "./CategoryItem";
import type { Category } from "../../data-types/Categories";
import {
  findAncestorIds,
  findCategoryById,
  SIDEBAR_WIDTH,
} from "../../utils/categoryTreeUtils";
import { ALL_SERVICES_ID, UNCATEGORIZED_ID } from "./constants";

const Container = styled.div`
  width: ${SIDEBAR_WIDTH}px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MobileToggle = styled.button<{ $isOpen: boolean }>`
  display: none;

  svg {
    transform: rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});
    transition: transform 0.15s ease;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const CategoryList = styled.div<{ $isOpen: boolean }>`
  @media (max-width: 768px) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

interface ServiceCatalogCategoriesSidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
}

export const ServiceCatalogCategoriesSidebar: React.FC<
  ServiceCatalogCategoriesSidebarProps
> = ({ categories, selectedCategoryId, onSelect }) => {
  const { t } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  // Mobile only: the tree behaves like a collapsed dropdown, closed by
  // default so the service grid below can render at full width without the
  // tree pushing it down further.
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleExpand = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("category_id", categoryId);
      window.history.pushState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );

      const ancestors = findAncestorIds(categories, categoryId);
      if (ancestors?.length) {
        setExpandedCategories((prev) => {
          const next = new Set(prev);
          for (const id of ancestors) {
            next.add(id);
          }
          return next;
        });
      }

      onSelect(categoryId);
      // Collapse the dropdown on mobile once a category is picked.
      setIsMobileOpen(false);
    },
    [categories, onSelect]
  );

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategoryId || selectedCategoryId === ALL_SERVICES_ID) {
      return t("service-catalog-sidebar.all-services", "All services");
    }
    if (selectedCategoryId === UNCATEGORIZED_ID) {
      return t("service-catalog-sidebar.uncategorized", "Uncategorized");
    }
    return (
      findCategoryById(categories, selectedCategoryId)?.name ??
      t("service-catalog-sidebar.all-services", "All services")
    );
  }, [categories, selectedCategoryId, t]);

  useEffect(() => {
    if (selectedCategoryId) {
      const ancestors = findAncestorIds(categories, selectedCategoryId);
      if (ancestors?.length) {
        setExpandedCategories((prev) => {
          const next = new Set(prev);
          for (const id of ancestors) {
            next.add(id);
          }
          return next;
        });
      }
      return;
    }

    const firstCategory = categories[0];
    if (firstCategory) {
      onSelect(firstCategory.id);
    }
  }, [categories, selectedCategoryId, onSelect]);

  return (
    <Container>
      <MobileToggle
        type="button"
        className="svc-cat-sidebar-toggle"
        $isOpen={isMobileOpen}
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen((open) => !open)}
      >
        <span className="svc-cat-sidebar-toggle-label">
          {t("service-catalog-sidebar.categories", "Categories")}:{" "}
          {selectedCategoryLabel}
        </span>
        <ChevronDownIcon aria-hidden="true" />
      </MobileToggle>
      <CategoryList className="svc-cat-sidebar-list" $isOpen={isMobileOpen}>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            nestingLevel={0}
            selectedCategoryId={selectedCategoryId}
            onSelect={handleCategorySelect}
            expandedCategories={expandedCategories}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </CategoryList>
    </Container>
  );
};
