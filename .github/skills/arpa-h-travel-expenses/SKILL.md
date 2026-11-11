---
name: "arpa-h-travel-expenses"
description: "Fills out the latest ARPA-H Voucher Expense Report PDF from a trip's receipts. Use when the user says \"fill out my travel voucher\", \"complete my ARPA-H expense report\", or references the ARPA-H Travel Voucher / Voucher Expense Report. Accepts an optional argument: the name or URL of the SharePoint/OneDrive folder holding that trip's receipts, e.g. \"/arpa-h-travel-expenses Portland May 2026\". Uses the bundled blank form, asks a few questions up front (receipt location if no argument, Comp Time, TANUM), searches only the named source, extracts amounts, categorizes and orders expenses chronologically, calculates POV mileage, and fills the PDF with PyMuPDF so it renders in Acrobat, Preview, iOS, and Edge. Keeps searches narrow. The output is a draft the user must validate before sending to the Travel team."
---

# ARPA-H Travel Voucher Skill

## Overview

This skill automates filling the ARPA-H Voucher Expense Report (a fillable PDF) from a trip's receipts. It starts from the blank form bundled with the skill, reads the receipts the user points to, extracts the amount and details, maps each to the correct form category, orders everything chronologically by time, and produces a draft PDF that works correctly in Adobe Acrobat and Preview.

**The output is a draft.** The user must validate every field before sending it to the Travel team (see Step 6).

## Argument: trip folder (optional)

The skill accepts one optional argument: the name of the folder where this trip's expenses are located. Examples:

- `/arpa-h-travel-expenses Portland May 2026`
- `/arpa-h-travel-expenses https://arpah-my.sharepoint.com/personal/.../Documents/Travel/Portland-May-2026`

How to treat the argument:

1. **Presence of an argument means the receipt source is SharePoint or OneDrive.** Do not ask the "Where are this trip's receipts?" question (Step 1.2, question 1), and do not ask for the folder name in Round 2 (Step 1.3). The argument already answers both.
2. **Treat it as a folder name or URL, never as a date range or search topic.** A rough name is fine. If it is a full URL, use it directly. If it is a name, resolve it with a single `sharepoint_folder_search` (limit 10) for that name, run in parallel with any other Step 2.1 searches.
3. **Resolve ambiguity with a closed-choice question, not more searching.**
   - No folder matches: tell the user, and ask in plain chat for a different name or a URL.
   - Several folders match: show the paths and ask which one is the trip folder.
   - The match is a parent that holds many trips or unrelated folders (for example a folder named only by year or month): follow Operating rule 6. List its immediate children once, then ask which child holds this trip's receipts.
4. **The argument does not widen the search.** Search or list only the resolved folder (and, if the receipts are split into subfolders such as `Receipts` or `Uber`, only its immediate children). Do not search Outlook or the rest of the site.
5. **Still ask the other Round 1 questions** (Comp Time and TANUM) in one prompt, and still run the Round 3 confirmation. The argument replaces only the receipt-location questions.
6. **No argument given:** run the normal flow in Step 1 unchanged.

## Bundled files

All paths in this skill are relative to the directory that contains this SKILL.md.

- `assets/ARPA-H-VoucherExpenseReport.pdf`: the blank fillable form. Never modify it. Copy it to the working folder and fill the copy.

## Operating rules (read these first)

These rules exist because an earlier version of this skill wandered through the user's mailbox and SharePoint to guess the trip, burned dozens of tool calls, and still had to ask the user the questions it should have asked first. Ask first; search second.

1. **Ask, do not explore.** Make no search, listing, or read call against Microsoft 365, Slack, email, or card systems until the user has told you where the receipts are (Step 1.3), either by answering or by passing the folder argument. Never run a broad "find anything that looks like a receipt" search to discover which trip the user means.
2. **Free text goes in plain chat, never in a choice menu.** Use a closed-choice prompt (a menu, or numbered options in chat) only for questions with a fixed set of answers. Some clients hide the free-text field in choice menus, so ask for a folder name, URL, date range, vendor list, or TANUM in a normal chat message and wait for the reply.
3. **Search only where the user pointed.** If they chose SharePoint/OneDrive (or passed a folder argument), do not also search Outlook. If they chose Outlook, do not also search SharePoint. Ask before widening.
4. **Sensitive sources are opt-in.** Card-alert emails (for example Citi "Notification of transaction"), travel authorizations, and other personal records are read only if the user names them as a source. Do not mine them to guess a trip. Do not store addresses, card numbers, or similar details in memory.
5. **Batch tool calls.** Run all searches in one parallel message and all receipt reads in one parallel message. Do not page through results; if a search returns too many hits, narrow it or ask the user.
6. **Keep the search narrow.** Scope every search and listing to the smallest folder that plausibly holds this trip's receipts. If the user gives a parent (a whole OneDrive, a SharePoint site, or a "Travel" folder that holds many trips), do not crawl it recursively or search all of it. List its immediate children once, show the user the child folder names, and have them pick the relevant child or grandchild before you read anything. If you notice you are scanning more than one or two folders, or opening files that are not about this trip, stop and ask the user which folder is right. Judge efficiency by whether you are scanning more than the trip needs, not by a fixed number of tool calls.
7. **Use the bundled form; never try to download it.** When this skill was tested (2026-11-10), no available tool could return a file's bytes from SharePoint or OneDrive: connector tools returned extracted text only, and web fetches of SharePoint URLs ended at a sign-in page. Do not spend calls on it, do not use `curl` or Python requests, and never rebuild the form from its text.

---

## Step 1: Intake (ask before searching)

### 1.1 Locate the form (one parallel message)

In a single message, run:

1. One `ls` of the uploads folder and any connected folder, looking for a user-attached form (a PDF whose name contains `VoucherExpenseReport`) and any receipt files already attached.
2. One `ls` of `assets/` to confirm the bundled PDF exists.

Use the form in this order: a user-attached form, then the bundled form. If the bundled PDF is missing, tell the user the skill install is incomplete and ask them to attach the form or contact the skill owner; do not search for it elsewhere. Never ask the user to download anything.

Whatever you find shortens Round 1: skip any question whose answer you already have.

### 1.2 Round 1: one prompt with up to three closed-choice questions

Ask these together in one prompt (your environment's multiple-choice prompt if it has one, otherwise numbered options in chat), skipping any that are already answered:

1. **Receipt source** (skip if a folder argument was passed; the source is then SharePoint or OneDrive): "Where are this trip's receipts?" Options: "SharePoint or OneDrive folder or file", "Outlook email", "Local folder or files I'll attach".
2. **Comp Time for Travel (CTT)**: "Are you claiming CTT hours?" Options: "No", "Yes (needs a separate CTT form, which this skill does not fill out)".
3. **TANUM**: "Do you have the VCH/TANUM number?" Options: "Yes, I'll type it in chat", "No, leave it blank for the Travel Ambassador". It is found at <https://mynbs.nih.gov> and is typically formatted `TANUM##XXX`.

Never modify the blank form; write output to a new file.

### 1.3 Round 2: one plain chat message (branched on the receipt source)

If a folder argument was passed and the user answered "Yes, I'll type it" to TANUM, the only thing left to ask here is the TANUM number, plus the optional card-alert line below. If nothing remains to ask, skip this round and go straight to Step 2.

Otherwise, do not call any tool for this round. Send a normal chat message asking only for what the chosen source needs, then stop and wait for the reply:

- **SharePoint or OneDrive**: "What is the folder name or URL? A rough name is fine."
- **Outlook email**: "What dates did the trip cover, and which vendors should I look for (airline, hotel, Uber or Lyft, parking, WiFi)? Say if the receipts are in a mailbox other than your work account."
- **Local folder or attached files**: "Please attach the receipts or share the folder path." If your environment needs permission to read a folder, request it.

In the same message, add:

- If they answered "Yes, I'll type it" to TANUM: "Please send the TANUM number."
- One optional line: "If you want me to use card alert emails (for example Citi) to catch charges that have no receipt, say so. By default I will not."

### 1.4 Connector setup (only if a receipt search fails to sign in)

If the user chose SharePoint, OneDrive, or Outlook as the receipt source (or passed a folder argument) and the first search fails with a sign-in or permission error, walk the user through setup. ARPA-H uses Microsoft 365 GCC; connectors sign in with the ARPA-H Entra ID account, and an admin may need to approve the connector. If an admin-consent or policy message appears, direct the user to the ARPA-H Service Desk rather than working around it. The bundled form does not need the connector, so setup is only for reading receipts.

Open your client's settings and look for connectors, apps, or integrations. Find **Microsoft 365** (Outlook, OneDrive, SharePoint, Teams), connect it, and sign in with the ARPA-H account. If it is missing, an administrator of your AI workspace may need to enable it. If your client has no built-in Microsoft 365 connector, ask the ARPA-H Service Desk which Microsoft 365 connector or MCP server is approved for ARPA-H and how to add it. Menu names differ between products and change between releases, so search the settings for "Microsoft 365", "Outlook", "OneDrive", or "SharePoint".

**Fallback (no connector available):** the user downloads the receipts into one folder and shares it with you, and you continue from Step 2 using that folder. The bundled form still works without the connector.

---

## Step 2: Find, Read, and Confirm the Receipts

### 2.1 Scoped search (one parallel message)

Using only the source and hint from the folder argument or Round 2, run at most three searches in a single message. Use the user's folder name or URL, or their dates and vendors, as the query. For email, always add a date range from the user's trip dates and look only at likely receipt senders (airline, hotel, rideshare, parking, WiFi provider, Google Maps/SmarTrip). Do not page, and do not open messages that are not plausible receipts.

For SharePoint or OneDrive, check what the user gave you (or passed as the folder argument) before searching. If it is a specific trip folder (or a file), search or list just that folder. If it is a parent that holds many trips or many unrelated folders, list only its immediate children once, then ask the user with a closed-choice question which child folder (or grandchild, if the child is still a parent) holds this trip's receipts. Never search a whole site or drive to find it. See "Argument: trip folder" above for how to resolve a folder name that matches zero, one, or several folders.

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

Note that Microsoft 365 tools may return extracted text only for attachments (a limit of the tooling, not of the user's permissions). If an attachment's text is missing the amount or time, ask the user to attach the file or tell you the value rather than guessing.

### 2.3 Round 3: one confirmation round

First show the user a short table of what you found (item, date, amount, source). Then ask one prompt (up to four closed-choice questions) covering everything that needs a decision:

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

### Description Conventions

Descriptions are presentable text that goes to the Travel team, so follow these rules:

- **Title Case** every description. Keep short connecting words (`to`, `of`) lowercase and keep airport codes uppercase. Examples: `Uber: Hotel to Tysons Corner`, `Alaska Airlines Baggage Fee, PDX to DCA`, `Homewood Suites DC Downtown, State Tax`.
- **Use purpose-based labels, not street addresses or times.** Rides use `Uber: [Origin] to [Destination]` (or `Lyft:`), where the origin and destination are plain labels such as `Home`, `Hotel`, `Dinner`, an airport code, or a city. Never put home addresses or driver names in a description.
- **`ARPA-H` is the label for 1301 K Street NW** (the ARPA-H office in Washington, DC). A ride to or from that address is `Uber: Hotel to ARPA-H`.
- **Ask when a destination is not obvious.** If a ride goes to or from an address that is not the hotel, an airport, home, or ARPA-H, ask the user what to call it in the Round 3 confirmation (for example, an evening ride to a restaurant is `Hotel to Dinner`, and the return is `Dinner to Hotel`). Do not guess from the street address.
- **Do not name the payment or Wi-Fi vendor** when the category already says it. Use `Inflight Wi-Fi, DCA to PDX`, not `Inflight Wi-Fi (Gogo)`. Airline names stay on baggage fees (`Alaska Airlines Baggage Fee, PDX to DCA`).
- **No en dashes or em dashes** in any field. Use `to`, a comma, or a colon instead (for example, `11/4 to 11/7 (3 Nights)`).

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

The GSA sets the POV reimbursement rate each January and **can change it midyear**. The rate that applies is the one in effect on the date the travel began, so **always look up the rate for the trip's travel date** at:

> <https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates/privately-owned-vehicle-pov-mileage-reimbursement>

Use the **Automobile** column for the case "an automobile was authorized, or no government-owned automobile was authorized or available".

Known 2026 rates (verify against the GSA page, since this list goes stale):

| Travel on or after | Automobile rate |
| ------------------ | --------------- |
| Jan. 1, 2026       | $0.725 per mile |
| Jul. 1, 2026       | $0.76 per mile  |

The July 1, 2026 increase follows the IRS midyear change; see GSA Bulletin FTR 26-03 (<https://www.gsa.gov/policy-regulations/regulations/federal-travel-regulation/ftr-and-related-files/gsa-bulletin-ftr-2603>).

**Lookup tip:** the GSA page is very large and `web_fetch` may save it to a file instead of returning it. Do not read it in full. Run a web search for "GSA POV mileage reimbursement rate [year] automobile per mile effective date", or search the saved file for `per mile` and the effective-date table rows.

Use `Decimal` arithmetic to avoid floating-point rounding errors:

```python
from decimal import Decimal, ROUND_HALF_UP

def calc_pov(miles: float, rate: float) -> str:  # pass the rate for the travel date
    result = (Decimal(str(miles)) * Decimal(str(rate))).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP
    )
    return str(result)
```

Get mileage from Google Maps printouts (use the shortest reasonable route distance shown).

Description format: `[Origin] to [Destination] ([X] mi @ $[rate])`
Example: `PDX to Home (25.8 mi @ $0.76)`

If Google Maps shows several routes and the text extraction is jumbled, use the distance in the selected "Drive N miles" summary line and ask the user to confirm it in Round 3.

---

## Step 5: Fill the Form

### CRITICAL: Use PyMuPDF (fitz), NOT pypdf

`pypdf`'s `update_page_form_field_values()` sets the text value (`/V`) but does not update the selected-index field (`/I`) that Adobe Acrobat uses to render dropdowns. This causes Acrobat to display blank dropdowns that clear themselves when clicked. PyMuPDF's `widget.update()` correctly rebuilds all three components (value, index, appearance stream).

Install if needed:

```bash
pip install pymupdf --break-system-packages
# If pip refuses because the environment is externally managed, --break-system-packages (or a virtual environment) is required.
```

**Run the fill script with plain `python3 script.py`, not `python3 -I`.** The isolated flag ignores the user site-packages directory where `pip install` puts PyMuPDF in some environments, which produces `ModuleNotFoundError`. Import it as `pymupdf` (the old name `fitz` still works but prints a deprecation warning).

### Fill script pattern

```python
import pymupdf as fitz  # "fitz" is the deprecated alias; keeps the rest of this script unchanged
from decimal import Decimal, ROUND_HALF_UP

def calc_pov(miles, rate):  # rate for the trip's travel date; see "POV Mileage Calculation"
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
    'Description Details of ExpenseRow1':     'Home to PDX (25.2 mi @ $0.76)',
    'AmountRow1':                             calc_pov(25.2),
    'Dropdown2-1':                            'Personal',

    # Row 2
    'Date2_af_date':                          '5/17/2026',
    'Expensesp1-1':                           'Baggage Fee',
    'Description Details of ExpenseRow2':     'Alaska Airlines Baggage Fee, PDX to DCA',
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
# With poppler:
pdftoppm -r 150 filled.pdf verify_imgs/page

# Or with PyMuPDF:
python -c "import pymupdf; d=pymupdf.open('filled.pdf'); [p.get_pixmap(dpi=150).save(f'verify_imgs/page-{i+1}.png') for i,p in enumerate(d)]"
```

Check:

- All expense category dropdowns show the correct value (not "Select Expense")
- All "Reimburse To" dropdowns show a value (not "Select Reimburse To")
- Dates, descriptions, and amounts are in the correct rows
- Traveler's Name, Destination(s), Departure Date, and Return Date match what the user confirmed (on both page 1 and page 2)
- Exactly one Comp Time for Travel box is checked, matching the user's answer
- Total matches sum of all amounts
- TANUM is filled in, or intentionally blank and flagged to the user

Save the output PDF to the folder the user named (or your environment's output folder) and give them the file path or a link to open it.

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

These are normally settled in the single confirmation round (Step 2.3). Use closed-choice options for the choice, and plain chat for any number or text you need back:

- **Duplicate receipts**: Same trip ID, same amount in two files; include only one
- **Hotel with taxes**: Split into `Lodging` + `Hotel Room Tax` rows, or combine into one `Lodging` row?
- **Missing TANUM**: The user was asked in Step 1.2. If they do not have it, point them to <https://mynbs.nih.gov>; if they still do not, leave the field blank (the Travel Ambassador can complete it) and flag it in the delivery summary. Do not go searching their mailbox for it unless they ask you to
- **Multiple mileage legs**: Confirm each leg's mileage if multiple POV receipts exist
- **Folder argument matches nothing, several folders, or a parent folder**: see "Argument: trip folder" near the top

---

## Notes for Future-Proofing

- The POV rate changes annually; always fetch the current rate from the GSA link above rather than hardcoding it.
- **`VCHTANUM` uses `/Helv` in its `/DA`**, an abbreviated font name only defined in the field's local `/DR`. Preview can't resolve it and shows the field blank. After filling, check `VCHTANUM`'s `/DA` and replace `/Helv` with `/Helvetica`: `doc.xref_set_key(vchtanum_xref, "DA", "(0 g /Helvetica 12 Tf)")`.
- **`NeedAppearances true`** is set in this form's AcroForm dictionary. Viewers use `/DA` + `/V` to regenerate rendering rather than the `/AP` stream, so the `/DA` font name must be resolvable by the viewer.
- The form is revised periodically, so always re-run the introspection script in Step 3 to remap field names. Run the introspection and the fill as single scripts; do not probe fields one call at a time.
- The `Expensesp1` / `Dropdown2-N` naming pattern (where row 1 uses no suffix, and rows 2+ use `-{N-1}`) is quirky; double-check with the introspection output if things seem off.
- If a user has more than 23 expense rows, overflow to the "Additional Expenses Form" (page 2) using the `_2` field variants.

