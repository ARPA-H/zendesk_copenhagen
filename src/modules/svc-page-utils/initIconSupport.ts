/*
 * Theme-specific icon support for the Service Catalog module (see
 * src/modules/shared/service-icons for the resolution logic itself). This
 * wrapper is what templates call — it, not service-catalog, is the thing
 * that changes if icon behavior needs to change, keeping the vendored
 * service-catalog render entry points untouched.
 */
import { initIconConfig } from "../shared/service-icons/iconConfig";

export function initIconSupport(
  assetBase?: string | null,
  iconApiBase?: string | null
): void {
  initIconConfig({ assetBase, iconApiBase });
}
