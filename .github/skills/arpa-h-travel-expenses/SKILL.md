---
name: arpa-h-travel-expenses
description: >
  Fill out the latest ARPA-H Voucher Expense Report PDF from a trip's receipts.
  Use when the user says things like "fill out my travel voucher",
  "complete my ARPA-H expense report", "fill in my travel form from my receipts",
  or references the ARPA-H Travel Voucher / Voucher Expense Report. Downloads the
  current form from the ARPA-H SharePoint on every request, guides the user through
  connecting the Microsoft 365 connector (Claude Desktop, ChatGPT Enterprise,
  Gemini web or Antigravity), locates the trip's receipts from a fuzzy name or
  location, extracts amounts and descriptions, categorizes and orders expenses
  chronologically, calculates POV mileage, and fills the PDF using PyMuPDF so all
  fields render correctly in Adobe Acrobat, macOS Preview, iOS Files/Books, and
  Windows Edge/Reader. The output is a draft the user must validate before
  sending to the Travel team.
---

# ARPA-H Travel Voucher Skill

## Overview

This skill automates filling the ARPA-H Voucher Expense Report (a fillable PDF) from a trip's receipts. It always starts from the latest published form, reads every receipt, extracts the amount and details, maps each to the correct form category, orders everything chronologically by time, and produces a draft PDF that works correctly in Adobe Acrobat and Preview.

**The output is a draft.** The user must validate every field before sending it to the Travel team (see Step 6).

Follow Steps 1.1 to 1.4 in order. Do not skip ahead to building the PDF until the connector is confirmed (1.2) and the receipt location is identified (1.3).

---

## Step 1: Setup and Information Gathering

### 1.1 Fetch the latest blank form (every request)

The form is revised periodically, so never reuse a previously downloaded copy. On every request, download the current version from the ARPA-H SharePoint (all ARPA-H staff have access):

> <https://arpah.sharepoint.com/:b:/s/ARPA-H-NET/IQBNMHbjw56kTqdzgZXKaZidAZyaKnuRIqNuOronFpmfz9g?e=RbAGMx>

This is an authenticated SharePoint link, so a plain HTTP fetch will usually return a sign-in page. Retrieve it in this order:

1. **Microsoft 365 connector** (preferred): once connected (see 1.2), have the connector open/download the file from the sharing link above.
2. **User-provided copy**: if the connector cannot read the link, ask the user to open the link in their browser (signed in with their ARPA-H account), download `ARPA-H-VoucherExpenseReport.pdf`, and attach or save it to the working folder.
3. **Bundled backup** (last resort): if neither works and this skill was installed with its files (for example, shipped directly to the endpoint), use [assets/ARPA-H-VoucherExpenseReport.pdf](assets/ARPA-H-VoucherExpenseReport.pdf). It is only a snapshot and may be out of date, and it is not available when the skill is delivered without its assets. Tell the user it is a backup copy and that they should confirm it matches the current form on SharePoint before submitting.

Save it as the blank template (e.g., `ARPA-H-VoucherExpenseReport.pdf`) and never modify it; write output to a new file. Because the form can change between versions, always re-run the field introspection in Step 3 rather than assuming the field names are unchanged.

### 1.2 Guide the user through connecting Microsoft 365

Receipts live in the user's ARPA-H Microsoft 365 account (Outlook email, OneDrive, SharePoint, Teams), so an AI client must be connected to Microsoft 365 before it can find them. Ask which client the user is working in, check whether the connector is already available (try a harmless read, such as listing recent OneDrive files), and if not, walk them through the matching setup below.

ARPA-H uses Microsoft 365 GCC. Connectors typically require sign-in with the user's ARPA-H Entra ID account, and an admin may need to approve the connector for the organization. If setup is blocked by an admin-consent or policy message, direct the user to the ARPA-H Service Desk rather than working around it.

- **Claude Desktop**: Open **Settings → Connectors**, find **Microsoft 365** (Outlook, OneDrive, SharePoint, Teams), click **Connect**, and sign in with the ARPA-H account. If it is missing, an organization Owner may need to enable it under **Organization settings → Connectors**.
- **ChatGPT Enterprise (app/web)**: Open **Settings → Apps** (labeled Connectors in some workspaces), enable the **Outlook**, **Microsoft OneDrive**, and **Microsoft SharePoint** apps, and sign in with the ARPA-H account. If unavailable, the workspace admin must enable them. Start a new chat and select the apps from the **+** menu.
- **Gemini web**: Gemini does not have a native Microsoft 365 connector. Use the Antigravity route below, or fall back to manual download (below).
- **Antigravity app**: Open the agent panel menu → **MCP Servers → Manage MCP Servers**, add a Microsoft 365 MCP server approved for ARPA-H (confirm the approved server and config with the Service Desk), and complete the browser sign-in with the ARPA-H account.

Menu names change between releases; if the labels above do not match what the user sees, search the client's settings for "Microsoft 365", "Outlook", "OneDrive", or "SharePoint" and follow the on-screen flow.

**Fallback (no connector available):** the user downloads the form and the trip's receipts manually into one folder and shares that folder with the client. Continue from 1.3 using that folder.

**Confirmation gate:** use `AskUserQuestion` to get the user's explicit confirmation that the connector is connected and working (or that they are using the manual-folder fallback). Do not proceed to 1.3 until confirmed.

### 1.3 Ask where this trip's expenses/receipts are (fuzzy)

Only after 1.2 is confirmed, ask the user, in one question, for a fuzzy description of where this trip's expenses and receipts are. Examples:

- A destination or event: "Portland trip in May", "ARPA-H Summit Boston"
- A folder name: "OneDrive > Travel > Portland", "Receipts 2026-05"
- An email hint: "Uber and Alaska Airlines emails from last week of May"

Then search with the connector across OneDrive, SharePoint, and Outlook (receipts often arrive as forwarded or attached emails) using that text plus date ranges and likely vendors (Uber, Lyft, airline, hotel, Google Maps, SmarTrip). Download every matching receipt into a working folder.

Before reading them, show the user the list of what was found (name, date, source) and ask them to confirm it, including whether anything is missing or does not belong to this trip. Ask follow-up questions if the match is ambiguous (e.g., two trips to the same city).

### 1.4 Collect remaining information with `AskUserQuestion`

Skim the receipts from 1.3 first (dates, vendors, cities) so you can propose defaults for the form header, then ask the user for the items below. For items 1 to 4, offer the suggested value as a selectable option plus an override (free-text) option; never silently fill them from inference.

1. **Traveler's Name**: suggest the signed-in Microsoft 365 account's display name (or the name on the receipts), with an override option.
2. **Departure Date**: suggest the earliest travel-related receipt date (flight, first-day ground transport, or POV leg), with an override option. Format `m/d/yyyy`.
3. **Return Date**: suggest the latest travel-related receipt date (hotel checkout, return flight, or POV leg home), with an override option. Format `m/d/yyyy`.
4. **Destination(s)**: suggest the destination inferred from the receipts and the trip description from 1.3 (e.g., `Portland, OR`), with an override option.
5. **Comp Time for Travel (CTT)**: ask Yes or No whether the user is claiming CTT hours. If Yes, remind them that a separate CTT form is required (the Travel Ambassador or AMO can provide it); this skill does not fill it out.
6. **TANUM**: Always ask the user for the VCH/TANUM number for this trip. It is found at **<https://mynbs.nih.gov>** (NIH NBS Travel system); format is typically `TANUM##XXX`. The form's instructions say the Travel Ambassador completes this field, so if the user does not have it yet, leave it blank and note that in the delivery summary.

Also ask about ambiguous cases you spot while reading receipts (see "Common Ambiguities" below).

The working folder should now contain the blank form and all receipt files (PDFs, PNGs, etc.). List them to confirm:

```bash
ls "/path/to/folder"
```

---

## Step 2: Read Every Receipt

Read all receipt files gathered in Step 1.3. For each receipt extract:

| Field              | What to look for                                                 |
| ------------------ | ---------------------------------------------------------------- |
| **Date**           | The transaction date (not the email date for forwarded receipts) |
| **Time**           | Time of transaction — critical for ordering same-day receipts    |
| **Total amount**   | The final charged amount (after discounts, tips included)        |
| **Expense type**   | See category table below                                         |
| **Description**    | Route/vendor/purpose — keep concise                              |
| **Payment method** | Card used — determines "Reimburse To"                            |

**Payment → Reimburse To mapping:**

- HHS Travel Card / Government Visa → `Government Travel Charge Card`
- Personal card, SmarTrip stored value, or cash → `Personal`
- POV mileage → `Personal`

---

## Step 3: Inspect the Form's Fields

Before filling, always introspect the actual PDF to confirm field names (they may differ between form versions):

```python
from pypdf import PdfReader
reader = PdfReader("voucher.pdf")
fields = reader.get_fields()
for name, field in fields.items():
    print(f'{name!r}: type={field.field_type}, value={field.value!r}')

# Check dropdown options on a choice field:
obj = fields['Expensesp1'].indirect_reference.get_object()
print(obj['/Opt'])
```

### Known field names for the standard ARPA-H Travel Voucher Form

**Header (page 1):**

- `VCHTANUM` — VCH/TANUM number
- `Travelers NameRow1` — Traveler's name
- `Destinations` — Destination(s)
- `Date2_af_date_departure` — Departure date
- `Date3_af_date_return` — Return date
- `Check Box4` — Comp Time for Travel **Yes** (left checkbox; on-state `Yes`)
- `Check Box5` — Comp Time for Travel **No** (right checkbox; on-state `Yes`)

`Travelers NameRow1`, `Destinations`, and the departure/return date fields each have a widget on both page 1 and page 2, so setting the value once fills both. Check one CTT box and leave the other unchecked; if the form is revised, confirm which box is Yes/No by its position on the page.

**Per-row fields — page 1 has 23 rows:**

| Row   | Date field           | Expense dropdown   | Description field                      | Amount field   | Reimburse dropdown |
| ----- | -------------------- | ------------------ | -------------------------------------- | -------------- | ------------------ |
| 1     | `Date1_af_date`      | `Expensesp1`       | `Description Details of ExpenseRow1`   | `AmountRow1`   | `Dropdown2-1`      |
| 2     | `Date2_af_date`      | `Expensesp1-1`     | `Description Details of ExpenseRow2`   | `AmountRow2`   | `Dropdown2-2`      |
| 3     | `Date3_af_date`      | `Expensesp1-2`     | `Description Details of ExpenseRow3`   | `AmountRow3`   | `Dropdown2-3`      |
| 4     | `Date4_af_date`      | `Expensesp1-3`     | `Description Details of ExpenseRow4`   | `AmountRow4`   | `Dropdown2-4`      |
| 5     | `Date5_af_date`      | `Expensesp1-4`     | `Description Details of ExpenseRow5`   | `AmountRow5`   | `Dropdown2-5`      |
| 6     | `Date6_af_date_row6` | `Expensesp1-5`     | `Description Details of ExpenseRow6`   | `AmountRow6`   | `Dropdown2-6`      |
| 7     | `Date7_af_date_row7` | `Expensesp1-6`     | `Description Details of ExpenseRow7`   | `AmountRow7`   | `Dropdown2-7`      |
| 8     | `Date8_af_date_row8` | `Expensesp1-7`     | `Description Details of ExpenseRow8`   | `AmountRow8`   | `Dropdown2-8`      |
| 9     | `Date9_af_date_row9` | `Expensesp1-8`     | `Description Details of ExpenseRow9`   | `AmountRow9`   | `Dropdown2-9`      |
| 10–23 | `Date{N}_af_date`    | `Expensesp1-{N-1}` | `Description Details of ExpenseRow{N}` | `AmountRow{N}` | `Dropdown2-{N}`    |

**Page 1 total:** `Total`

**Page 2** (Additional Expenses Form — use if more than 23 rows needed):

- Date fields: `Datep2_af_date`, `Datep2_1_af_date` … `Datep2_22_af_date`
- Expense dropdowns: `Expensesp2`, `Expensesp2-1` … `Expensesp2-22`
- Description: `Description Details of ExpenseRow1_2` … `Row23_2`
- Amount: `AmountRow1_2` … `AmountRow23_2`
- Reimburse: `Dropdownp2`, `Dropdownp2-1` … `Dropdownp2-22`
- Page 2 total: `Total_2`

---

## Step 4: Categorize and Order Expenses

### Expense Category Dropdown Values

These strings must match exactly — copy them character-for-character:

```text
ATM Fee
Baggage Fee
Gasoline-Rental Car
Hotel Room Tax
Internet Connection Fee
Laundry
Lodging
Miscellaneous
Parking Fee
Privately Owned Vehicle (POV)
Public Transit
Registration Fee
Rental Car
Tolls
Transportation Network Company
```

Use `Transportation Network Company` for Uber, Lyft, and similar rideshare apps.

### Reimburse To Dropdown Values

```text
Personal
Government Travel Charge Card
```

### Chronological Ordering Rules

Order all rows by date, then by transaction time within the same date.

**Departure day convention** (when the traveler leaves home):

1. `Privately Owned Vehicle (POV)` — driving to departure airport
2. `Baggage Fee` — at departure airport
3. `Internet Connection Fee` — inflight WiFi (purchased early in flight)
4. `Transportation Network Company` — ground transport from arrival airport

**Return day convention** (when the traveler flies home):

1. `Lodging` — hotel checkout day
2. `Transportation Network Company` — rides to departure airport (in time order)
3. `Baggage Fee` — at departure airport
4. `Internet Connection Fee` — inflight WiFi on return flight
5. `Privately Owned Vehicle (POV)` — driving home from arrival airport

For receipts with no clear time (e.g., baggage fees booked in advance), use position within the day's logical sequence.

### POV Mileage Calculation

The GSA sets the POV reimbursement rate each January. **Always look up the current rate** at:

> <https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates/privately-owned-vehicle-pov-mileage-reimbursement>

#### 2026 rate: $0.725/mile

Use `Decimal` arithmetic to avoid floating-point rounding errors:

```python
from decimal import Decimal, ROUND_HALF_UP

def calc_pov(miles: float, rate: float = 0.725) -> str:
    result = (Decimal(str(miles)) * Decimal(str(rate))).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP
    )
    return str(result)
```

Get mileage from Google Maps printouts (use the shortest reasonable route distance shown).

Description format: `[Origin] to [Destination] ([X] mi @ $[rate])`
Example: `Home to PDX (25.2 mi @ $0.725)`

---

## Step 5: Fill the Form

### CRITICAL: Use PyMuPDF (fitz), NOT pypdf

`pypdf`'s `update_page_form_field_values()` sets the text value (`/V`) but does not update the selected-index field (`/I`) that Adobe Acrobat uses to render dropdowns. This causes Acrobat to display blank dropdowns that clear themselves when clicked. PyMuPDF's `widget.update()` correctly rebuilds all three components (value, index, appearance stream).

Install if needed:

```bash
pip install pymupdf --break-system-packages
```

### Fill script pattern

```python
import fitz
from decimal import Decimal, ROUND_HALF_UP

def calc_pov(miles, rate=0.725):
    return str((Decimal(str(miles)) * Decimal(str(rate))).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP))

INPUT  = 'blank_voucher.pdf'
OUTPUT = 'filled_voucher.pdf'

# Build the complete updates dict: field_name -> string value
updates = {
    'VCHTANUM': 'TANUM##XXX',        # from user / mynbs.nih.gov; '' if not yet assigned
    'Travelers NameRow1': 'Jane Doe',
    'Destinations': 'Portland, OR',
    'Date2_af_date_departure': '5/17/2026',
    'Date3_af_date_return': '5/20/2026',
    'Check Box4': False,              # CTT Yes
    'Check Box5': True,               # CTT No
    'Total': '0.00',                  # calculate and set at end

    # Row 1
    'Date1_af_date':                          '5/17/2026',
    'Expensesp1':                             'Privately Owned Vehicle (POV)',
    'Description Details of ExpenseRow1':     'Home to PDX (25.2 mi @ $0.725)',
    'AmountRow1':                             calc_pov(25.2),
    'Dropdown2-1':                            'Personal',

    # Row 2
    'Date2_af_date':                          '5/17/2026',
    'Expensesp1-1':                           'Baggage Fee',
    'Description Details of ExpenseRow2':     'Alaska Airlines Baggage Fee PDX',
    'AmountRow2':                             '35',
    'Dropdown2-2':                            'Government Travel Charge Card',

    # ... continue for all rows
}

# Calculate total from all AmountRow fields
total = sum(
    float(v) for k, v in updates.items()
    if k.startswith('AmountRow') and v
)
updates['Total'] = f'{total:.2f}'

# Fill using PyMuPDF
doc = fitz.open(INPUT)
for page in doc:
    for w in page.widgets():
        if w.field_name in updates:
            w.field_value = updates[w.field_name]
            w.update()

doc.save(OUTPUT, garbage=4, deflate=True)
print(f"Saved: {OUTPUT}  (Total: ${total:.2f})")
```

### CRITICAL: Sync values to AcroForm field objects (required for Preview.app)

`page.widgets()` only reaches page annotation objects. This form also has a separate AcroForm `/Fields` object for some fields (notably `VCHTANUM`) that shares the same `/AP` but holds its own `/V`. PDF viewers like Preview read the AcroForm object — if its `/V` is empty, the field shows blank even though the page annotation is correct.

After saving, re-open and sync any such duplicates:

```python
import re

doc = fitz.open(OUTPUT)
# Collect values set on page annotations
filled = {}
for page in doc:
    for w in page.widgets():
        if w.field_value:
            filled[w.field_name] = w.field_value

# Find any AcroForm field objects with the same /T but empty /V and sync them
for xref in range(1, doc.xref_length()):
    try:
        obj = doc.xref_object(xref, compressed=False)
        m = re.search(r'/T \(([^)]+)\)', obj)
        if m and m.group(1) in filled:
            v = re.search(r'/V \(([^)]*)\)', obj)
            if v is not None and v.group(1) != filled[m.group(1)]:
                doc.xref_set_key(xref, "V", f"({filled[m.group(1)]})")
    except Exception:
        pass

doc.save(OUTPUT, incremental=True, encryption=fitz.PDF_ENCRYPT_KEEP)
```

---

## Step 6: Verify and Deliver

Convert the output to images to verify visually:

```bash
# Using the pdf skill's script if available:
python /path/to/pdf/skill/scripts/convert_pdf_to_images.py filled.pdf verify_imgs/

# Or with poppler:
pdftoppm -r 150 filled.pdf verify_imgs/page
```

Check:

- All expense category dropdowns show the correct value (not "Select Expense")
- All "Reimburse To" dropdowns show a value (not "Select Reimburse To")
- Dates, descriptions, and amounts are in the correct rows
- Traveler's Name, Destination(s), Departure Date, and Return Date match what the user confirmed (on both page 1 and page 2)
- Exactly one Comp Time for Travel box is checked, matching the user's answer
- Total matches sum of all amounts
- TANUM is filled in, or intentionally blank and flagged to the user

Save the output PDF to the user's folder and present it with `mcp__cowork__present_files`.

### Required: tell the user to validate before sending

When delivering the PDF, explicitly tell the user, in plain words and not buried in other text:

> This voucher is a draft generated from your receipts. **You must review and validate every field** (traveler name, destination, trip dates, Comp Time selection, expense dates, categories, descriptions, amounts, Reimburse To selections, mileage, TANUM, and the total) against your original receipts before sending it to the Travel team. You are responsible for the accuracy of the submitted report.

Also list anything you were unsure about (assumed categories, merged or skipped duplicates, estimated times or mileage, missing receipts) so the user knows where to look first. Do not send, submit, or email the report to the Travel team on the user's behalf.

---

## Common Receipt Types

| File                       | Expense type                                           | Key fields to extract                                                                |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Uber/Lyft PDF              | `Transportation Network Company`                       | Time shown at top of receipt; "Total" amount; payment card shown in Payments section |
| Airline baggage email PDF  | `Baggage Fee`                                          | Use the **flight date**, not the email date; amount in "Total USD"                   |
| Hotel folio PDF            | `Lodging` (or split into `Lodging` + `Hotel Room Tax`) | Total at bottom of folio; checkout date for the row date                             |
| Inflight WiFi PDF          | `Internet Connection Fee`                              | Payment card determines Personal vs Gov't card                                       |
| Google Maps PDF/screenshot | `Privately Owned Vehicle (POV)`                        | Miles from the recommended route; calculate amount                                   |
| SmarTrip/Metro screenshot  | `Public Transit`                                       | Amount from "Change" column (negative = cost paid)                                   |

---

## Common Ambiguities — Ask the User

Use `AskUserQuestion` when you encounter:

- **Duplicate receipts**: Same trip ID, same amount in two files — include only one
- **Hotel with taxes**: Split into `Lodging` + `Hotel Room Tax` rows, or combine into one `Lodging` row?
- **Missing TANUM**: Direct the user to <https://mynbs.nih.gov>; if they still do not have it, leave the field blank (the Travel Ambassador can complete it) and flag it in the delivery summary
- **Multiple mileage legs**: Confirm each leg's mileage if multiple POV receipts exist

---

## Notes for Future-Proofing

- The POV rate changes annually — always fetch the current rate from the GSA link above rather than hardcoding it.
- **`VCHTANUM` uses `/Helv` in its `/DA`**, an abbreviated font name only defined in the field's local `/DR`. Preview can't resolve it and shows the field blank. After filling, check `VCHTANUM`'s `/DA` and replace `/Helv` with `/Helvetica`: `doc.xref_set_key(vchtanum_xref, "DA", "(0 g /Helvetica 12 Tf)")`.
- **`NeedAppearances true`** is set in this form's AcroForm dictionary. Viewers use `/DA` + `/V` to regenerate rendering rather than the `/AP` stream — so the `/DA` font name must be resolvable by the viewer.
- The form is re-downloaded on every request (Step 1.1), so field names may change at any time; always re-run the introspection script in Step 3 to remap them.
- The `Expensesp1` / `Dropdown2-N` naming pattern (where row 1 uses no suffix, and rows 2+ use `-{N-1}`) is quirky — double-check with the introspection output if things seem off.
- If a user has more than 23 expense rows, overflow to the "Additional Expenses Form" (page 2) using the `_2` field variants.
