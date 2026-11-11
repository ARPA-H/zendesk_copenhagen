---
name: arpa-h-travel-expenses
description: >
  Fills out the latest ARPA-H Voucher Expense Report PDF from a trip's receipts. Use when the user
  says things like "fill out my travel voucher", "complete my ARPA-H expense report", "fill in my
  travel form from my receipts", or references the ARPA-H Travel Voucher / Voucher Expense Report.
  Uses the blank form bundled in this skill's assets folder, asks a short set of questions up front
  (where the receipts are, Comp Time, TANUM), searches only the receipt source the user names,
  extracts amounts and descriptions, categorizes and orders expenses chronologically, calculates POV
  mileage, and fills the PDF using PyMuPDF so all fields render correctly in Adobe Acrobat, macOS
  Preview, iOS Files/Books, and Windows Edge/Reader. Keeps searches narrow instead of scanning whole
  sites. The output is a draft the user must validate before sending to the Travel team.
---

# ARPA-H Travel Voucher Skill

## Overview

This skill automates filling the ARPA-H Voucher Expense Report (a fillable PDF) from a trip's receipts. It starts from the blank form bundled with the skill, reads the receipts the user points to, extracts the amount and details, maps each to the correct form category, orders everything chronologically by time, and produces a draft PDF that works correctly in Adobe Acrobat and Preview.

**The output is a draft.** The user must validate every field before sending it to the Travel team (see Step 6).

## Bundled files

- `${CLAUDE_SKILL_DIR}/assets/ARPA-H-VoucherExpenseReport.pdf`: the blank fillable form. Never modify it. Copy it to the working folder and fill the copy.
- `${CLAUDE_SKILL_DIR}/assets/FORM_VERSION.txt`: the SharePoint `lastModifiedDateTime` (UTC) of the bundled form, used only for the optional staleness warning in Step 1.1.

## Operating rules (read these first)

These rules exist because an earlier version of this skill wandered through the user's mailbox and SharePoint to guess the trip, burned dozens of tool calls, and still had to ask the user the questions it should have asked first. Ask first; search second.

1. **Ask, do not explore.** Make no search, listing, or read call against Microsoft 365, Slack, email, or card systems until the user has told you where the receipts are (Step 1.3). The one exception is the optional date check in Step 1.1. Never run a broad "find anything that looks like a receipt" search to discover which trip the user means.
2. **Free text goes in plain chat, never in a menu.** `AskUserQuestion` is for closed sets of answers only. Its "Other" free-text option is not visible to users in this deployment (confirmed), so never rely on it for a folder name, URL, date range, vendor list, or TANUM. Ask for those in a normal chat message and wait for the reply.
3. **Search only where the user pointed.** If they chose SharePoint/OneDrive, do not also search Outlook. If they chose Outlook, do not also search SharePoint. Ask before widening.
4. **Sensitive sources are opt-in.** Card-alert emails (for example Citi "Notification of transaction"), travel authorizations, and other personal records are read only if the user names them as a source. Do not mine them to guess a trip. Do not store addresses, card numbers, or similar details in memory.
5. **Batch tool calls.** Run all searches in one parallel message and all receipt reads in one parallel message. Do not page through results; if a search returns too many hits, narrow it or ask the user.
6. **Keep the search narrow.** Scope every search and listing to the smallest folder that plausibly holds this trip's receipts. If the user gives a parent (a whole OneDrive, a SharePoint site, or a "Travel" folder that holds many trips), do not crawl it recursively or search all of it. List its immediate children once, show the user the child folder names, and have them pick the relevant child or grandchild before you read anything. If you notice you are scanning more than one or two folders, or opening files that are not about this trip, stop and ask the user which folder is right. Judge efficiency by whether you are scanning more than the trip needs, not by a fixed number of tool calls.
7. **Use the bundled form; never try to download it.** No tool in this deployment can return a file's bytes from SharePoint or OneDrive (verified 2026-11-10), so do not spend calls on it, do not use `curl` or Python requests, and never rebuild the form from its text.

---

## Step 1: Intake (ask before searching)

### 1.1 Locate the form (one parallel message)

In a single message, run:

1. One `ls` of the uploads folder and any connected folder, looking for a user-attached form (a PDF whose name contains `VoucherExpenseReport`) and any receipt files already attached.
2. One `ls` and `cat` of `${CLAUDE_SKILL_DIR}/assets/` to confirm the bundled PDF exists and read `FORM_VERSION.txt`.
3. Optional, only if the Microsoft 365 connector is available: one `sharepoint_search` for `ARPA-H-VoucherExpenseReport` (file type `pdf`, limit 5), used only to read the `lastModifiedDateTime` of the `/sites/ARPA-H-NET/` result. If the connector errors, skip it silently.

Use the form in this order: a user-attached form, then the bundled form. If the bundled PDF is missing, tell the user the skill install is incomplete and ask them to attach the form or contact the skill owner; do not search for it elsewhere.

If the SharePoint date is newer than `FORM_VERSION.txt`, still use the bundled form, but add one line to the delivery summary: "The official form was revised on [date] and may differ from the one used here. Check it against the current form before submitting, and tell the skill owner so the bundle can be updated." Never ask the user to download anything.

Whatever you find shortens Round 1: skip any question whose answer you already have.

### 1.2 Round 1: one `AskUserQuestion` with up to three closed-choice questions

Ask these together in one call, skipping any that are already answered:

1. **Receipt source**: "Where are this trip's receipts?" Options: "SharePoint or OneDrive folder or file", "Outlook email", "Local folder or files I'll attach".
2. **Comp Time for Travel (CTT)**: "Are you claiming CTT hours?" Options: "No", "Yes (needs a separate CTT form, which this skill does not fill out)".
3. **TANUM**: "Do you have the VCH/TANUM number?" Options: "Yes, I'll type it in chat", "No, leave it blank for the Travel Ambassador". It is found at <https://mynbs.nih.gov> and is typically formatted `TANUM##XXX`.

Never modify the blank form; write output to a new file.

### 1.3 Round 2: one plain chat message (branched on the receipt source)

Do not call any tool for this. Send a normal chat message asking only for what the chosen source needs, then stop and wait for the reply:

- **SharePoint or OneDrive**: "What is the folder name or URL? A rough name is fine."
- **Outlook email**: "What dates did the trip cover, and which vendors should I look for (airline, hotel, Uber or Lyft, parking, WiFi)? Say if the receipts are in a mailbox other than your work account."
- **Local folder or attached files**: "Please attach the receipts or share the folder path." Use `request_cowork_directory` if a folder is needed.

In the same message, add:

- If they answered "Yes, I'll type it" to TANUM: "Please send the TANUM number."
- One optional line: "If you want me to use card alert emails (for example Citi) to catch charges that have no receipt, say so. By default I will not."

### 1.4 Connector setup (only if a receipt search fails to sign in)

If the user chose SharePoint, OneDrive, or Outlook as the receipt source and the first search fails with a sign-in or permission error, walk the user through setup. ARPA-H uses Microsoft 365 GCC; connectors sign in with the ARPA-H Entra ID account, and an admin may need to approve the connector. If an admin-consent or policy message appears, direct the user to the ARPA-H Service Desk rather than working around it. The bundled form does not need the connector, so setup is only for reading receipts.

- **Claude Desktop**: Open **Settings → Connectors**, find **Microsoft 365** (Outlook, OneDrive, SharePoint, Teams), click **Connect**, and sign in with the ARPA-H account. If it is missing, an organization Owner may need to enable it under **Organization settings → Connectors**.
- **ChatGPT Enterprise (app/web)**: Open **Settings → Apps** (labeled Connectors in some workspaces), enable the **Outlook**, **Microsoft OneDrive**, and **Microsoft SharePoint** apps, and sign in with the ARPA-H account. If unavailable, the workspace admin must enable them. Start a new chat and select the apps from the **+** menu.
- **Gemini web**: Gemini does not have a native Microsoft 365 connector. Use the Antigravity route below, or have the user download the receipts into one folder and share it.
- **Antigravity app**: Open the agent panel menu → **MCP Servers → Manage MCP Servers**, add a Microsoft 365 MCP server approved for ARPA-H (confirm the approved server and config with the Service Desk), and complete the browser sign-in with the ARPA-H account.

Menu names change between releases; if the labels above do not match what the user sees, search the client's settings for "Microsoft 365", "Outlook", "OneDrive", or "SharePoint".

**Fallback (no connector available):** the user downloads the receipts into one folder and shares it with the client, and you continue from Step 2 using that folder. The bundled form still works without the connector.

---

## Step 2: Find, Read, and Confirm the Receipts

### 2.1 Scoped search (one parallel message)

Using only the source and hint from Round 2, run at most three searches in a single message. Use the user's folder name or URL, or their dates and vendors, as the query. For email, always add a date range from the user's trip dates and look only at likely receipt senders (airline, hotel, rideshare, parking, WiFi provider, Google Maps/SmarTrip). Do not page, and do not open messages that are not plausible receipts.

For SharePoint or OneDrive, check what the user gave you before searching. If it is a specific trip folder (or a file), search or list just that folder. If it is a parent that holds many trips or many unrelated folders, list only its immediate children once, then ask the user with a closed-choice question which child folder (or grandchild, if the child is still a parent) holds this trip's receipts. Never search a whole site or drive to find it.

### 2.2 Read every candidate receipt (one parallel message)

Read every candidate receipt in one message. For each, extract:

| Field              | What to look for                                                 |
| ------------------ | ---------------------------------------------------------------- |
| **Date**           | The transaction date (not the email date for forwarded receipts) |
| **Time**           | Time of transaction; critical for ordering same-day receipts     |
| **Total amount**   | The final charged amount (after discounts, tips included)        |
| **Expense type**   | See category table below                                         |
| **Description**    | Route/vendor/purpose; keep concise                               |
| **Payment method** | Card used; determines "Reimburse To"                             |

**Payment → Reimburse To mapping:**

- HHS Travel Card / Government Visa → `Government Travel Charge Card`
- Personal card, SmarTrip stored value, or cash → `Personal`
- POV mileage → `Personal`

Note that the Microsoft 365 connector returns attachment text only (a limit of the connector, not of the user's permissions). If an attachment's text is missing the amount or time, ask the user to attach the file or tell you the value rather than guessing.

### 2.3 Round 3: one confirmation round

First show the user a short table of what you found (item, date, amount, source). Then ask one `AskUserQuestion` call (up to four closed-choice questions) covering everything that needs a decision:

1. **Receipt list**: "Is this the right set?" Options: "Yes, continue", "Something is missing or wrong". If they pick the second, ask what to change in plain chat.
2. **Header values**: show the proposed Traveler's Name (the signed-in Microsoft 365 display name or the name on the receipts), Departure Date and Return Date (`m/d/yyyy`, from the earliest and latest travel receipts), and Destination(s). Options: "Use these values", "Change something" (then ask in plain chat).
3. **Hotel taxes** (only if a hotel folio is present): "Combine room and tax in one Lodging row, or split into Lodging and Hotel Room Tax?"
4. **Duplicates or mileage** (only if you spotted possible duplicate receipts, or POV legs with no mileage): ask which to keep, and ask for the mileage in plain chat.

Never silently fill the header from inference. Anything the user cannot give (for example TANUM) stays blank and gets flagged in the delivery summary. The form's own instructions say the Travel Ambassador completes the VCH/TANUM field.

The working folder should now contain a copy of the blank form and all receipt files. Move on to Step 3.

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

- `VCHTANUM`: VCH/TANUM number
- `Travelers NameRow1`: Traveler's name
- `Destinations`: Destination(s)
- `Date2_af_date_departure`: Departure date
- `Date3_af_date_return`: Return date
- `Check Box4`: Comp Time for Travel **Yes** (left checkbox; on-state `Yes`)
- `Check Box5`: Comp Time for Travel **No** (right checkbox; on-state `Yes`)

`Travelers NameRow1`, `Destinations`, and the departure/return date fields each have a widget on both page 1 and page 2, so setting the value once fills both. Check one CTT box and leave the other unchecked; if the form is revised, confirm which box is Yes/No by its position on the page.

**Per-row fields (page 1 has 23 rows):**

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
| 10 to 23 | `Date{N}_af_date`    | `Expensesp1-{N-1}` | `Description Details of ExpenseRow{N}` | `AmountRow{N}` | `Dropdown2-{N}`    |

**Page 1 total:** `Total`

**Page 2** (Additional Expenses Form, use if more than 23 rows needed):

- Date fields: `Datep2_af_date`, `Datep2_1_af_date` … `Datep2_22_af_date`
- Expense dropdowns: `Expensesp2`, `Expensesp2-1` … `Expensesp2-22`
- Description: `Description Details of ExpenseRow1_2` … `Row23_2`
- Amount: `AmountRow1_2` … `AmountRow23_2`
- Reimburse: `Dropdownp2`, `Dropdownp2-1` … `Dropdownp2-22`
- Page 2 total: `Total_2`

---

## Step 4: Categorize and Order Expenses

### Expense Category Dropdown Values

These strings must match exactly; copy them character-for-character:

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

1. `Privately Owned Vehicle (POV)`: driving to departure airport
2. `Baggage Fee`: at departure airport
3. `Internet Connection Fee`: inflight WiFi (purchased early in flight)
4. `Transportation Network Company`: ground transport from arrival airport

**Return day convention** (when the traveler flies home):

1. `Lodging`: hotel checkout day
2. `Transportation Network Company`: rides to departure airport (in time order)
3. `Baggage Fee`: at departure airport
4. `Internet Connection Fee`: inflight WiFi on return flight
5. `Privately Owned Vehicle (POV)`: driving home from arrival airport

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

# INPUT is the working-folder copy of the form chosen in Step 1.1
# (the bundled assets/ARPA-H-VoucherExpenseReport.pdf, or a user-attached one).
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

`page.widgets()` only reaches page annotation objects. This form also has a separate AcroForm `/Fields` object for some fields (notably `VCHTANUM`) that shares the same `/AP` but holds its own `/V`. PDF viewers like Preview read the AcroForm object; if its `/V` is empty, the field shows blank even though the page annotation is correct.

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

Also list anything you were unsure about (assumed categories, merged or skipped duplicates, estimated times or mileage, missing receipts, and which form you used: bundled or user-attached) so the user knows where to look first. Do not send, submit, or email the report to the Travel team on the user's behalf.

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

## Common Ambiguities: Ask the User

These are normally settled in the single confirmation round (Step 2.3). Use closed-choice `AskUserQuestion` options for the choice, and plain chat for any number or text you need back:

- **Duplicate receipts**: Same trip ID, same amount in two files; include only one
- **Hotel with taxes**: Split into `Lodging` + `Hotel Room Tax` rows, or combine into one `Lodging` row?
- **Missing TANUM**: The user was asked in Step 1.2. If they do not have it, point them to <https://mynbs.nih.gov>; if they still do not, leave the field blank (the Travel Ambassador can complete it) and flag it in the delivery summary. Do not go searching their mailbox for it unless they ask you to
- **Multiple mileage legs**: Confirm each leg's mileage if multiple POV receipts exist

---

## Notes for Future-Proofing

- The POV rate changes annually; always fetch the current rate from the GSA link above rather than hardcoding it.
- **`VCHTANUM` uses `/Helv` in its `/DA`**, an abbreviated font name only defined in the field's local `/DR`. Preview can't resolve it and shows the field blank. After filling, check `VCHTANUM`'s `/DA` and replace `/Helv` with `/Helvetica`: `doc.xref_set_key(vchtanum_xref, "DA", "(0 g /Helvetica 12 Tf)")`.
- **`NeedAppearances true`** is set in this form's AcroForm dictionary. Viewers use `/DA` + `/V` to regenerate rendering rather than the `/AP` stream, so the `/DA` font name must be resolvable by the viewer.
- The form is revised periodically, so always re-run the introspection script in Step 3 to remap field names. Run the introspection and the fill as single scripts; do not probe fields one call at a time.
- The `Expensesp1` / `Dropdown2-N` naming pattern (where row 1 uses no suffix, and rows 2+ use `-{N-1}`) is quirky; double-check with the introspection output if things seem off.
- If a user has more than 23 expense rows, overflow to the "Additional Expenses Form" (page 2) using the `_2` field variants.
