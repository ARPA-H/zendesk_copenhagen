import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TicketFieldObject } from "../../ticket-fields/data-types/TicketFieldObject";
import type { Attachment } from "../../ticket-fields/data-types/AttachmentsField";
import type { AttachmentsOption } from "../data-types/Attachments";
import { ASSET_TYPE_KEY, ASSET_KEY } from "../constants";
import { hasFieldValue } from "../../ticket-fields/data-types/hasFieldValue";

export interface ValidationErrors {
  attachments: string | null;
  assetType: string | null;
  asset: string | null;
}

export interface ValidationResult {
  hasError: boolean;
  errors: ValidationErrors;
  // Generic per-field errors, keyed by field.id, for any required field
  // left empty that ISN'T an asset/asset-type/attachments field (those
  // already have their own dedicated error channel above). Merged onto
  // requestFields by ServiceCatalogItem.tsx so it renders through the
  // same `error` prop -> aria-invalid pipeline as server-returned errors.
  fieldErrors: Record<string, string>;
}

function isAssetTypeField(field: TicketFieldObject): boolean {
  return field.relationship_target_type === ASSET_TYPE_KEY;
}

function isAssetField(field: TicketFieldObject): boolean {
  return field.relationship_target_type === ASSET_KEY;
}

export function useValidateServiceItemForm(
  attachmentsOption: AttachmentsOption | undefined
) {
  const { t } = useTranslation();

  const validate = useCallback(
    (
      fields: TicketFieldObject[],
      attachments: Attachment[]
    ): ValidationResult => {
      const errors: ValidationErrors = {
        attachments: null,
        assetType: null,
        asset: null,
      };
      const fieldErrors: Record<string, string> = {};

      if (attachmentsOption) {
        const isRequired =
          attachmentsOption.custom_object_fields["standard::is_required"];

        if (isRequired && attachments.length === 0) {
          errors.attachments = t(
            "service-catalog.attachments-required-error",
            "Upload a file to continue."
          );
        }
      }

      const genericRequiredMessage = t(
        "service-catalog.field-required-error",
        "This field is required."
      );

      for (const field of fields) {
        if (field.required && !hasFieldValue(field)) {
          if (isAssetTypeField(field)) {
            errors.assetType = t(
              "service-catalog.asset-type-required-error",
              "Select an asset type"
            );
          } else if (isAssetField(field)) {
            errors.asset = t(
              "service-catalog.asset-required-error",
              "Select an asset"
            );
          } else {
            // Every other required field type (text, textarea, checkbox,
            // date, dropdown, multiselect, tagger, lookup) has no
            // dedicated error channel like assetType/asset/attachments
            // do -- flag it here instead, keyed by field.id, so
            // ServiceCatalogItem.tsx can merge it directly onto the
            // field's `error` prop (which is what drives aria-invalid /
            // the red highlight in _svc-form-validation.scss). Without
            // this, a plain required field left empty silently passed
            // client-side validation, and only ever got flagged if the
            // *server* also rejected it and its 422 response happened to
            // map back by field_key -- unreliable, and gave no feedback
            // at all when that mapping didn't line up or the request
            // never completed.
            fieldErrors[field.id] = genericRequiredMessage;
          }
        }
      }

      const hasError = Boolean(
        errors.attachments ||
          errors.assetType ||
          errors.asset ||
          Object.keys(fieldErrors).length > 0
      );

      return { hasError, errors, fieldErrors };
    },
    [attachmentsOption, t]
  );

  return { validate };
}
