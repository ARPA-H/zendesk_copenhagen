# Sentinel Connector Monitoring Scripts

PowerShell scripts for creating Azure Monitor alerts on Sentinel connector Function Apps and Application Insights components. Run from the directory where the scripts are saved after an `az login`.

---

## Setup-FunctionAlerts.ps1

Creates three metric alert rules per connector Function App using `az monitor metrics alert create`. Reuses the shared `FunctionAlerts-ActionGroup` in `rg-operations-sentinel-playbooks-usc` (creates it if absent).

**Alert rules created per app:**

| Suffix | Metric | Condition | Severity | Eval / Window |
| --- | --- | --- | --- | --- |
| `Http5xx` | `Http5xx` | total > 5 | 2 | 5m / 15m |
| `HighLatency` | `HttpResponseTime` | avg > 5s | 3 | 5m / 15m |
| `LowAvailability` | `HealthCheckStatus` | avg < 100 | 1 | 1m / 5m |

`-ResourceGroupPrefix` (default: `rg-operations-sentinel-`) — scopes discovery to connector resource groups automatically. New connectors are picked up without any script changes.

```powershell
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Creates Azure Monitor metric alert rules for Sentinel connector Function Apps.

.DESCRIPTION
    Discovers all Function Apps in resource groups whose name starts with ResourceGroupPrefix,
    then creates three metric alert rules per app (Http5xx, HighLatency, LowAvailability).
    Reuses the shared FunctionAlerts-ActionGroup action group; creates it if absent.

.PARAMETER SubscriptionId
    Azure subscription ID. Defaults to current subscription.

.PARAMETER EmailAddresses
    Comma-separated email addresses for alert notifications.

.PARAMETER ResourceGroupPrefix
    Prefix used to discover connector resource groups (default: rg-operations-sentinel-).

.PARAMETER ActionGroupName
    Shared action group name (default: FunctionAlerts-ActionGroup).

.PARAMETER AlertPrefix
    Prefix for alert rule names (default: FuncAlert).

.EXAMPLE
    .\Setup-FunctionAlerts.ps1 -EmailAddresses "sentinel-connector-alerts@arpa-h.gov"

.EXAMPLE
    .\Setup-FunctionAlerts.ps1 -ResourceGroupPrefix "rg-ops-sentinel-" -EmailAddresses "alerts@example.com"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$SubscriptionId,

    [Parameter(Mandatory = $true)]
    [string]$EmailAddresses,

    [Parameter(Mandatory = $false)]
    [string]$ResourceGroupPrefix = "rg-operations-sentinel-",

    [Parameter(Mandatory = $false)]
    [string]$ActionGroupName = "FunctionAlerts-ActionGroup",

    [Parameter(Mandatory = $false)]
    [string]$AlertPrefix = "FuncAlert"
)

$ErrorActionPreference = "Stop"

function Test-AzureCLI {
    try {
        $azVersion = az version --output json 2>&1 | ConvertFrom-Json
        Write-Host "✓ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Azure CLI is not installed. Please install from: https://aka.ms/installazurecliwindows"
        return $false
    }
}

function Test-AzureLogin {
    try {
        $account = az account show --output json 2>&1 | ConvertFrom-Json
        Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green
        Write-Host "✓ Current subscription: $($account.name) ($($account.id))" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Not logged in to Azure. Please run: az login"
        return $false
    }
}

Write-Host "`n=== Azure Function Monitoring Setup ===" -ForegroundColor Cyan

if (-not (Test-AzureCLI)) { exit 1 }
if (-not (Test-AzureLogin)) { exit 1 }

if ($SubscriptionId) { az account set --subscription $SubscriptionId }

$subscription = az account show --output json | ConvertFrom-Json
Write-Host "`nWorking with subscription: $($subscription.name)" -ForegroundColor Cyan

# Discover Function Apps across all connector resource groups
Write-Host "`nDiscovering resource groups matching prefix '$ResourceGroupPrefix'..." -ForegroundColor Yellow
$resourceGroups = az group list --query "[?starts_with(name, '$ResourceGroupPrefix')].name" --output json | ConvertFrom-Json

if ($resourceGroups.Count -eq 0) {
    Write-Error "No resource groups found matching prefix '$ResourceGroupPrefix'."
    exit 1
}

$functionApps = @()
foreach ($rg in $resourceGroups) {
    $apps = az functionapp list --resource-group $rg --output json 2>$null | ConvertFrom-Json
    if ($apps) {
        $functionApps += $apps | ForEach-Object {
            [PSCustomObject]@{ name = $_.name; resourceGroup = $rg; id = $_.id }
        }
    }
}

if ($functionApps.Count -eq 0) {
    Write-Warning "No Function Apps found in the matching resource groups."
    exit 0
}
Write-Host "Found $($functionApps.Count) Function App(s)" -ForegroundColor Green

$emailList = @($EmailAddresses -split ',' | ForEach-Object { $_.Trim() })
Write-Host "Notification emails: $($emailList -join ', ')" -ForegroundColor Cyan

# ── Action group ──────────────────────────────────────────────────────────────
Write-Host "`n--- Action Group ---" -ForegroundColor Yellow
$actionGroupRG = "rg-operations-sentinel-playbooks-usc"

$existingActionGroup = az monitor action-group show `
    --name $ActionGroupName `
    --resource-group $actionGroupRG `
    --output json 2>$null

if ($existingActionGroup) {
    Write-Host "✓ Action group '$ActionGroupName' already exists" -ForegroundColor Green
    $actionGroupId = ($existingActionGroup | ConvertFrom-Json).id
}
else {
    $emailReceivers = @()
    for ($i = 0; $i -lt $emailList.Count; $i++) {
        $emailReceivers += @{ name = "Email$($i+1)"; emailAddress = $emailList[$i]; useCommonAlertSchema = $false }
    }
    $token = (az account get-access-token --output json | ConvertFrom-Json).accessToken
    $agUri = "https://management.azure.com/subscriptions/$($subscription.id)/resourceGroups/$actionGroupRG/providers/microsoft.insights/actionGroups/$($ActionGroupName)?api-version=2021-09-01"
    $agBody = @{
        location   = "global"
        properties = @{
            groupShortName = "FuncAlerts"
            enabled        = $true
            emailReceivers = $emailReceivers
        }
    } | ConvertTo-Json -Depth 5
    $actionGroup = Invoke-RestMethod -Method PUT -Uri $agUri -Body $agBody `
        -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json"
    $actionGroupId = $actionGroup.id
    Write-Host "✓ Created action group: $ActionGroupName" -ForegroundColor Green
}

if (-not $actionGroupId) {
    Write-Error "Action group ID is empty — action group creation failed."
    exit 1
}

# ── Alert rules ───────────────────────────────────────────────────────────────
Write-Host "`n--- Creating Alerts ---" -ForegroundColor Yellow

$alertDefs = @(
    @{ Suffix = "Http5xx";         Condition = "total Http5xx > 5";           Description = "Alert when HTTP 5xx errors exceed threshold";        Frequency = "5m"; Window = "15m"; Severity = 2 },
    @{ Suffix = "HighLatency";     Condition = "avg HttpResponseTime > 5";    Description = "Alert when average response time exceeds 5 seconds"; Frequency = "5m"; Window = "15m"; Severity = 3 },
    @{ Suffix = "LowAvailability"; Condition = "avg HealthCheckStatus < 100"; Description = "Alert when health check status indicates issues";    Frequency = "1m"; Window = "5m";  Severity = 1 }
)

$alertsCreated = 0
foreach ($app in $functionApps) {
    Write-Host "`n  $($app.name)" -ForegroundColor Cyan
    foreach ($def in $alertDefs) {
        $alertName = "$AlertPrefix-$($app.name)-$($def.Suffix)"
        az monitor metrics alert create `
            --name $alertName `
            --resource-group $app.resourceGroup `
            --scopes $app.id `
            --condition $def.Condition `
            --description $def.Description `
            --evaluation-frequency $def.Frequency `
            --window-size $def.Window `
            --severity $def.Severity `
            --action $actionGroupId `
            --output none 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ $alertName" -ForegroundColor Green
            $alertsCreated++
        } else {
            Write-Host "    ✗ Failed: $alertName" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "  Function Apps: $($functionApps.Count)" -ForegroundColor White
Write-Host "  Alert rules created: $alertsCreated of $($functionApps.Count * $alertDefs.Count)" -ForegroundColor White
Write-Host "  Action Group: $ActionGroupName" -ForegroundColor White
```

---

## Setup-AppInsightsAlerts.ps1

Creates four smart detector alert rules per Application Insights instance via the Azure Resource Manager REST API (`Microsoft.AlertsManagement/smartDetectorAlertRules`). Uses bearer token auth because `az monitor` has no CLI subcommand for smart detectors.

**Detectors created per App Insights instance:**

| Detector ID | Name | Severity | Frequency |
| --- | --- | --- | --- |
| `FailureAnomaliesDetector` | Failure Anomalies | Sev3 | PT1M |
| `ExceptionVolumeChangedDetector` | Abnormal Rise in Exception Volume | Sev3 | PT24H |
| `DependencyPerformanceDegradationDetector` | Dependency Latency Degradation | Sev3 | PT24H |
| `TraceSeverityDetector` | Trace Severity Degradation | Sev3 | PT24H |

`-ResourceGroupPrefix` (default: `rg-operations-sentinel-`) — scopes discovery to connector resource groups automatically. New connectors are picked up without any script changes.

```powershell
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Creates smart detector alert rules on Application Insights for Sentinel connectors.

.DESCRIPTION
    Discovers all Application Insights components in resource groups whose name starts
    with ResourceGroupPrefix, then creates four smart detector rules per component.
    Uses the ARM REST API directly — az monitor has no CLI subcommand for smart detectors.

.PARAMETER SubscriptionId
    Azure subscription ID. Defaults to current subscription.

.PARAMETER EmailAddresses
    Comma-separated email addresses for alert notifications.

.PARAMETER ResourceGroupPrefix
    Prefix used to discover connector resource groups (default: rg-operations-sentinel-).

.PARAMETER ActionGroupName
    Shared action group name (default: FunctionAlerts-ActionGroup).

.PARAMETER ActionGroupRG
    Resource group containing the action group (default: rg-operations-sentinel-playbooks-usc).

.EXAMPLE
    .\Setup-AppInsightsAlerts.ps1 -EmailAddresses "sentinel-connector-alerts@arpa-h.gov"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$SubscriptionId,

    [Parameter(Mandatory = $true)]
    [string]$EmailAddresses,

    [Parameter(Mandatory = $false)]
    [string]$ResourceGroupPrefix = "rg-operations-sentinel-",

    [Parameter(Mandatory = $false)]
    [string]$ActionGroupName = "FunctionAlerts-ActionGroup",

    [Parameter(Mandatory = $false)]
    [string]$ActionGroupRG = "rg-operations-sentinel-playbooks-usc"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Application Insights Smart Detection Setup ===" -ForegroundColor Cyan

$account = az account show --output json 2>&1 | ConvertFrom-Json
if (-not $account) { Write-Error "Not logged in. Run: az login"; exit 1 }
Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green

if ($SubscriptionId) {
    az account set --subscription $SubscriptionId
}
$subscription = az account show --output json | ConvertFrom-Json
Write-Host "✓ Subscription: $($subscription.name)" -ForegroundColor Green

$subId = $subscription.id
$token = (az account get-access-token --output json | ConvertFrom-Json).accessToken

# Resolve action group ID (with retry for transient connection resets)
$agUri = "https://management.azure.com/subscriptions/$subId/resourceGroups/$ActionGroupRG/providers/microsoft.insights/actionGroups/$($ActionGroupName)?api-version=2023-01-01"
$ag = $null
for ($attempt = 1; $attempt -le 3; $attempt++) {
    try {
        $ag = Invoke-RestMethod -Uri $agUri -Headers @{ Authorization = "Bearer $token" }
        break
    } catch {
        if ($attempt -lt 3) { Write-Host "  Retrying action group lookup (attempt $attempt)..." -ForegroundColor Yellow; Start-Sleep -Seconds 3 }
        else { throw }
    }
}
$actionGroupId = $ag.id
Write-Host "✓ Action group: $($ag.name)" -ForegroundColor Green

# Discover App Insights components across all connector resource groups
Write-Host "`nDiscovering resource groups matching prefix '$ResourceGroupPrefix'..." -ForegroundColor Yellow
$resourceGroups = az group list --query "[?starts_with(name, '$ResourceGroupPrefix')].name" --output json | ConvertFrom-Json

if ($resourceGroups.Count -eq 0) {
    Write-Error "No resource groups found matching prefix '$ResourceGroupPrefix'."
    exit 1
}

$appInsightsList = @()
foreach ($rg in $resourceGroups) {
    $components = az monitor app-insights component list --resource-group $rg --output json 2>$null | ConvertFrom-Json
    if ($components) {
        $appInsightsList += $components | ForEach-Object {
            [PSCustomObject]@{ name = $_.name; resourceGroup = $rg; id = $_.id }
        }
    }
}

if ($appInsightsList.Count -eq 0) {
    Write-Warning "No Application Insights components found in matching resource groups."
    exit 0
}
Write-Host "Found $($appInsightsList.Count) App Insights component(s)" -ForegroundColor Green

$detectors = @(
    @{ id = "FailureAnomaliesDetector";                 name = "Failure Anomalies";                 severity = "Sev3"; frequency = "PT1M"  },
    @{ id = "ExceptionVolumeChangedDetector";           name = "Abnormal Rise in Exception Volume"; severity = "Sev3"; frequency = "PT24H" },
    @{ id = "DependencyPerformanceDegradationDetector"; name = "Dependency Latency Degradation";    severity = "Sev3"; frequency = "PT24H" },
    @{ id = "TraceSeverityDetector";                    name = "Trace Severity Degradation";        severity = "Sev3"; frequency = "PT24H" }
)

Write-Host "`n--- Creating smart detector rules ($($appInsightsList.Count) App Insights × $($detectors.Count) detectors) ---" -ForegroundColor Yellow

$created = 0
$failed  = 0

foreach ($appi in $appInsightsList) {
    Write-Host "`n  $($appi.name)" -ForegroundColor Cyan

    foreach ($detector in $detectors) {
        $ruleName = "$($detector.name) - $($appi.name)"
        $ruleUri  = "https://management.azure.com/subscriptions/$subId/resourceGroups/$($appi.resourceGroup)/providers/Microsoft.AlertsManagement/smartDetectorAlertRules/$([Uri]::EscapeDataString($ruleName))?api-version=2021-04-01"

        $body = @{
            location   = "global"
            properties = @{
                description  = "Smart detector rule: $($detector.name)"
                state        = "Enabled"
                severity     = $detector.severity
                frequency    = $detector.frequency
                detector     = @{ id = $detector.id }
                scope        = @($appi.id)
                actionGroups = @{ groupIds = @($actionGroupId) }
            }
        } | ConvertTo-Json -Depth 5

        try {
            Invoke-RestMethod -Method PUT -Uri $ruleUri -Body $body `
                -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" | Out-Null
            Write-Host "    ✓ $($detector.name)" -ForegroundColor Green
            $created++
        }
        catch {
            $errMsg = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message -replace '\s+',' ' } else { $_.Exception.Message -replace "`n"," " }
            Write-Host "    ✗ $($detector.name) — $errMsg" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host "`n=== Complete ===" -ForegroundColor Green
Write-Host "  Rules created: $created of $($appInsightsList.Count * $detectors.Count)" -ForegroundColor White
Write-Host "  Failed:        $failed" -ForegroundColor White
Write-Host "  Action group:  $ActionGroupName" -ForegroundColor White
```
