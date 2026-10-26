// Garden renders each field's error as role="alert" inside the field. Focus
// goes to the first control in that field that a keyboard can reach. That rules
// out the hidden input Garden keeps inside a combobox and the file input behind
// a drop zone: the combobox trigger and the drop zone are the focusable parts.
const CONTROL =
  'input, textarea, select, button, [role="combobox"], [tabindex]';
const NOT_REACHABLE =
  '[type="hidden"], [disabled], [hidden], [aria-hidden="true"], [tabindex="-1"]';

export function focusFirstInvalidField(form: HTMLElement): boolean {
  const alerts = Array.from(
    form.querySelectorAll<HTMLElement>('[role="alert"]')
  );

  for (const alert of alerts) {
    if (!alert.textContent?.trim()) continue;

    const field = alert.closest<HTMLElement>('[data-garden-id$="field"]');
    const control = Array.from(
      field?.querySelectorAll<HTMLElement>(CONTROL) ?? []
    ).find((element) => !element.matches(NOT_REACHABLE));

    if (control) {
      control.focus();
      return true;
    }
  }

  return false;
}
