# FactorySee Monitor – Build Plan (Hackathon Scope)

---

## 1. Problem Statement

Small and medium manufacturing units in India are rapidly adopting cheap IoT devices, PLCs, sensors, and connected machines. However:

- Factory networks are **opaque**: Owners and plant managers usually don’t know:
  - How many devices are connected
  - What each device is talking to
  - Whether anything abnormal is happening right now
- Existing monitoring tools are:
  - Built for **large enterprises** (complex dashboards, SIEM-style tools)
  - Require **specialist security/IT skills**
  - Often **too costly** and difficult to deploy in SME factories
- Vendors rarely ship **security-by-default visibility**:
  - Devices speak many different protocols (Modbus, OPC UA, MQTT, HTTP, proprietary)
  - Little standardization; logs and telemetry are inconsistent
  - No simple, out-of-the-box way to “see” the network

As a result, SME factories operate with **very low cybersecurity observability**:
- Attacks (e.g., unknown remote access, malware, unauthorized data exfiltration) can go unnoticed.
- Non-technical plant managers can’t interpret raw traffic or complex alerts.
- Language barriers (English-only tools) make it even harder for local staff.

**Core problem:** SME factories lack a **simple, affordable, language-accessible, real-time visibility tool** that tells them, in human terms, **“What is on my factory network and what is it doing right now?”**

---

## 2. Solution Overview

**FactorySee Monitor** is a **plug-and-play network visibility web app** for SME factories:

- It **passively listens** to network traffic (using pre-captured packet/flow data in the hackathon version).
- It builds a **Real-Time Device Map** showing:
  - All connected IoT/OT devices
  - Their types (e.g., PLC, CCTV, HMI panel, CNC machine, sensor)
  - Relationships and communication flows between them
- It uses **Auto-Classification of Devices** to infer the role/type of each device from:
  - IP/MAC info
  - Protocols used (e.g., Modbus, MQTT, HTTP, RTSP)
  - Ports and typical behavior
- It runs **Anomaly Detection & Alerts** in the background to:
  - Spot unusual communication patterns (new connections, data spikes, unknown external IPs)
  - Generate alerts with **plain-language explanations** of potential risks
- A **Traffic-to-Story Engine** converts raw network flows into:
  - Short, natural-language descriptions of what’s happening
  - Explanations in **local languages (e.g., Hindi, Tamil)** via **Local Language Support**
  - Actionable guidance suited for non-cybersecurity experts

For the hackathon prototype:
- Data source: Offline **sample packet capture (pcap) or simplified JSON “flow” files**.
- Output: A **single-page web UI** showing:
  - A live-updating device map
  - Device list and classification
  - Alert feed with traffic-to-story explanations
  - Language switch for English / Hindi / Tamil

---

## 3. Target Users

### 3.1 SME Factory Owners / Directors
- Goals:
  - Assurance that their production environment is not “wide open.”
  - Easy, non-technical view of cyber risk.
- Needs:
  - A **high-level dashboard** to answer “Are we safe right now?”
  - Simple explanations to drive investment or policy decisions.

### 3.2 Plant Managers / Line Supervisors
- Goals:
  - Keep machines running with minimal disruption.
  - Quickly know if something strange is happening on the network.
- Needs:
  - **Color-coded map** they can check at a glance.
  - **Plain-language alerts in their local language** (e.g., Hindi, Tamil).
  - Guidance like “Check this camera’s password” rather than technical jargon.

### 3.3 IT/OT Administrators (often one person wearing multiple hats)
- Goals:
  - Maintain both productivity and security.
  - Diagnose network issues quickly.
- Needs:
  - **Device classification** and protocol visibility.
  - Ability to see **who talks to whom**, quickly.
  - Simple anomaly indicators to prioritize investigation.

Hackathon emphasis: Design the UX primarily for **plant managers and IT/OT admins** who have **basic technical skills but limited security expertise and often prefer local language content**.

---

## 4. Key Features

You MUST include all of these in the prototype (even in simplified form).

1. **Real-Time Device Map**
   - Dynamic, color-coded visualization of all detected devices.
   - Nodes = devices (machines, sensors, cameras, PLCs).
   - Edges = communication flows (e.g., PLC → SCADA server).
   - Colors indicate device status / risk (e.g., green = normal, yellow = warning, red = alert).

2. **Auto-Classification of Devices**
   - Automatically tags each device with a **type** and **role**:
     - Examples: “CCTV Camera”, “PLC”, “SCADA Server”, “HMI Panel”, “Temperature Sensor”.
   - Uses:
     - Protocols (Modbus, MQTT, RTSP, HTTP, etc.)
     - Ports and behavioral patterns
   - Shown in the device map and device detail panel.

3. **Anomaly Detection & Alerts**
   - Monitors network flows for unusual patterns:
     - New unknown external IPs contacted
     - Unusual port usage
     - Spikes in data volume
     - Devices talking to peers they normally don’t talk to
   - Generates alerts with:
     - Severity (Low/Medium/High)
     - Time, device(s) involved
     - Short explanation of why it’s suspicious.

4. **Traffic-to-Story Engine**
   - Core logic that:
     - Takes raw flow records (e.g., src IP, dst IP, protocol, bytes, frequency).
     - Generates **easy-to-understand stories** like:
       - “Your PLC controller 192.168.1.10 started talking to an unknown IP in Singapore on port 22 (SSH). This may indicate unauthorized remote access.”
   - Stories must:
     - Avoid heavy jargon.
     - Include **recommended next steps** (e.g., “Confirm if this remote access is expected. If not, block this IP in your firewall.”).

5. **Local Language Support**
   - UI and stories should support at least:
     - **English**
     - **Hindi**
     - **Tamil** (even partial translation is okay for hackathon)
   - Language toggle in the UI:
     - Switches all static UI text.
     - Switches traffic-to-story explanations using a translation layer or dictionary.

6. *(Optional, Nice-to-Have)* **Simple Risk Summary Panel**
   - High-level summary for non-technical users:
     - “Total devices: 18”
     - “Devices with alerts: 3”
     - “High-risk alerts in last 24h: 1”
   - May be computed from underlying alerts and classifications.

---

## 5. User Flow

Describe the end-to-end experience from first visit to daily use. Adjust wording/UI as needed during implementation.

### 5.1 First-Time Setup (Hackathon Demo)

1. **User opens web app** in browser.
2. Landing page shows:
   - Brief description: “FactorySee Monitor – See all your factory devices and suspicious activity in plain language.”
   - A big **“Start Demo”** button.
3. On click:
   - App loads **predefined sample network data** (e.g., flows.json).
   - User is taken to the **Main Dashboard View**.

### 5.2 Main Dashboard View

Components (all on one page for hackathon):

1. **Top Bar**
   - App title: “FactorySee Monitor”
   - **Language selector**: Dropdown [EN | HI | TA]
   - Time range selector (optional, can be static for demo).

2. **Left Panel – Real-Time Device Map**
   - Network graph with nodes and edges:
     - Node label: Device name (e.g., “PLC-1”, “Camera-3”), optionally with icon.
     - Node color:
       - Green: normal
       - Yellow: has warning-level alert
       - Red: has high-severity alert
     - Hover/click on node shows basic tooltip: Device name, IP, type, status.
   - Graph auto-updates every few seconds based on simulated “live” data from the dataset.

3. **Right Panel – Details & Alerts**
   - Tabs or stacked sections:
     1. **Device List**
        - Table: [Device Name | IP | Type (from Auto-Classification) | Status | Last Seen]
        - Clicking a row:
          - Highlights that device in the map.
          - Opens **Device Detail Drawer/Modal**.
     2. **Alerts Feed**
        - Chronological list:
          - [Time] [Device(s)] [Severity Badge] [Short Story] (from Traffic-to-Story Engine)
        - Each alert item:
          - Short title: “Camera-1 contacted unknown external IP”
          - One-line story (localized): “Your CCTV Camera at 192.168.1.50 sent a large amount of data to an unknown IP in another country.”
          - Clicking expands to see “Details & Recommended Action”.
     3. **Risk Summary (if implemented)**
        - Simple cards:
          - “Total Devices: XX”
          - “Devices with Alerts: YY”
          - “High Severity Alerts: ZZ in last 24h”

4. **Device Detail Drawer/Modal**
   - Shows when user clicks a device:
     - Device name, IP, MAC (mock), **Auto-Classified Type**.
     - Protocols observed (top 2–3).
     - Recent alerts related to this device (from Anomaly Detection & Alerts).
     - Summarized **story of behavior** (Traffic-to-Story Engine), localized:
       - e.g., “In the last hour, this PLC mainly communicated with SCADA-SERVER (normal). However, it also made a new connection to an unknown host on port 22 (unusual).”

### 5.3 Language Switching Flow

1. User clicks language dropdown → chooses **Hindi**.
2. Immediately:
   - All static labels change to Hindi equivalents.
   - All alert stories and device behavior explanations are shown in Hindi.
3. User chooses **Tamil**:
   - Same behavior with Tamil strings.
4. For hackathon:
   - At minimum, translate:
     - Alert titles and story text.
     - Device type names (Camera, PLC, etc.).
     - Basic UI labels (Alerts, Devices, Risk Level, etc.).

### 5.4 Ongoing Use (Simulated)

- The app “ticks” every N seconds:
  - Loads the next batch of flows from dataset as if they just occurred.
  - Updates:
    - Device map (if new devices appear or statuses change).
    - Device statuses based on alerts.
    - Alerts feed with any new anomalies.
- User occasionally:
  - Glances at the map (are there red nodes?).
  - Opens alerts to read the stories in their preferred language.
  - Checks which devices are repeatedly causing problems.

---

## 6. Technical Approach

### 6.1 Overall Architecture (Hackathon)

**Frontend-only or thin-backend approach** is enough for prototype:

- **Option A (Recommended for Hackathon):** Single-page web app with:
  - Static JSON files as data sources.
  - All “logic” (classification, anomaly detection, story generation) mocked or run in-browser.

- **Option B:** Lightweight backend API (Node.js/Express or Python/FastAPI) to:
  - Parse sample pcap / flows.
  - Expose `/devices`, `/flows`, `/alerts` endpoints.
  - Frontend consumes via REST.

For speed, choose A if you want minimal infra, B if you want more realistic separation.

---

### 6.2 Suggested Tech Stack

**Frontend:**
- Framework: **React** (or Vue, but React has more examples).
- Graph visualization: 
  - **react-force-graph**, **vis-network**, or **D3.js** (prebuilt React graph library preferred).
- UI components:
  - **Material UI (MUI)**, **Chakra UI**, or simple CSS with Tailwind.

**Backend (if used):**
- Language: **Node.js (Express)** or **Python (FastAPI)**.
- Parsing network data:
  - For hackathon, pre-generate **flows.json** instead of parsing pcap in real-time.
  - Use Python + `scapy` or `pyshark` offline to produce data.

**Data Format:**
- `devices.json` (optional) – Pre-labeled devices.
- `flows.json` – List of network flows:
  ```json
  {
    "timestamp": "2024-10-30T10:15:00Z",
    "src_ip": "192.168.1.10",
    "dst_ip": "192.168.1.50",
    "src_port": 502,
    "dst_port": 12345,
    "protocol": "MODBUS",
    "bytes": 2048
  }
  ```
- `alerts.json` can be dynamically derived from flows or pre-defined to guarantee interesting stories.

---

### 6.3 Implementing Each Key Feature

#### 6.3.1 Real-Time Device Map

**Data prep:**
- On app init:
  - Scan `flows.json` to extract a list of unique IPs → create device objects.
  - Keep a mapping: `ip -> deviceId -> { ip, name, type, status }`.

**Visualization logic:**
- Nodes:
  - `id`: deviceId
  - `label`: `name` or `ip`
  - `color`: based on `status` (OK/WARN/ALERT)
- Edges:
  - For each flow in the current time window:
    - `{ source: srcDeviceId, target: dstDeviceId, protocol }`
- “Real-time” behavior:
  - Use a `setInterval` to advance through flows in chronological order.
  - Maintain a sliding time window (e.g., last 5 minutes of flows).
  - When device gains an alert, update its node color.

**Libraries:**
- Use `react-force-graph` for quick force-directed graph, or `vis-network` React wrapper.

---

#### 6.3.2 Auto-Classification of Devices

**Simplified heuristic rules (hardcoded for demo):**

Example rules:
- If protocol includes:
  - `"RTSP"` or dest port `554` or `8554` → Device type: **“CCTV Camera”**
  - `"MODBUS"` or src/dst port `502` → Device type: **“PLC”**
  - `"OPC_UA"` or port `4840` → Device type: **“SCADA / OPC UA Server”**
  - `"MQTT"` or port `1883` / `8883` → Device type: **“MQTT Sensor Gateway”**
  - HTTP traffic only & many different devices talk to it → **“Management / Web Server”**
- If no rule matches:
  - Default: **“Unknown IoT Device”**

**Implementation:**
- On initial load, run classification for all devices and **store `type`**.
- In UI:
  - Show `type` in device list and device detail view.
  - Use icons / emojis (if allowed) or simple text for type.

---

#### 6.3.3 Anomaly Detection & Alerts

Focus on **simple, rule-based anomalies** that are easy to implement and demo:

**Example anomaly rules:**

1. **New External Connection**
   - If `dst_ip` is outside the local factory subnet (e.g., `192.168.x.x`) and:
     - Device has never talked to this IP before → generate alert:
       - Severity: Medium/High
       - Type: “New external connection”

2. **Unusual Protocol Usage**
   - If a device usually uses protocol A (e.g., Modbus), but now uses SSH (port 22), RDP (3389) or FTP (21):
     - Alert: “PLC started using SSH protocol unexpectedly.”

3. **Data Exfiltration Spike**
   - For each device, maintain **rolling sum of bytes** per time window.
   - If bytes in the last N minutes > `threshold * usualAverage`:
     - Alert: “Camera-3 sending large amount of data outside the network.”

4. **Unexpected Peer Communication**
   - If two internal devices communicate for the **first time** and one is high-value (e.g., PLC, SCADA):
     - Alert: “New device communicating with PLC-1.”

**Implementation:**
- On frontend:
  - As you “replay” flows, maintain state in memory:
    - Past connections per device
    - Volume stats
  - Run anomaly rules on each new flow.
  - If any rule triggers:
    - Push a new alert into an `alerts` array.
    - Mark involved devices’ status (e.g., WARN/ALERT).
- For hackathon reliability:
  - You can also **pre-generate** some alerts from the dataset and seed them on load.

---

#### 6.3.4 Traffic-to-Story Engine

The engine converts raw anomaly events into human-readable, localized stories.

**Inputs:**
- Anomaly event object, e.g.:
  ```json
  {
    "rule": "NEW_EXTERNAL_CONNECTION",
    "timestamp": "2024-10-30T10:15:00Z",
    "device_ip": "192.168.1.50",
    "device_type": "CCTV Camera",
    "dst_ip": "13.248.118.1",
    "dst_country": "Singapore",
    "protocol": "TCP",
    "bytes": 40960,
    "severity": "HIGH"
  }
  ```

**Processing:**
- Map `rule` → template:
  - EN: `"Your {device_type} at {device_ip} started sending data to an unknown external address ({dst_ip}) in {dst_country}. This could indicate unauthorized remote access or data upload."`
  - Hi: `"आपका {device_type} ({device_ip}) एक अज्ञात बाहरी पते ({dst_ip}, {dst_country}) पर डेटा भेजना शुरू कर चुका है। यह अनधिकृत रिमोट एक्सेस या डेटा चोरी का संकेत हो सकता है।"`
  - Ta: (Tamil equivalent string).

- Add **recommended action text** per rule:
  - EN: `"Confirm if this external connection is expected (for example, cloud backup). If not, block this IP on your router or firewall and change the device password."`
  - Hi / Ta: localized equivalents.

**Implementation detail:**
- Maintain a dictionary of templates:
  ```js
  const storyTemplates = {
    NEW_EXTERNAL_CONNECTION: {
      en: {
        title: "New external connection from {device_type}",
        body: "Your {device_type} at {device_ip} started sending data to an unknown external address ({dst_ip}) in {dst_country}. This may indicate unauthorized remote access or data upload.",
        action: "Confirm if this external connection is expected. If not, block this IP in your firewall and change the device password."
      },
      hi: { ... },
      ta: { ... }
    },
    // other rules...
  }
  ```
- On alert creation:
  - Get current language from global state (e.g., React context).
  - Fill placeholders with real values.
  - Attach `title`, `body`, `action` strings to the alert.

---

#### 6.3.5 Local Language Support

**Strategy:**
- No need for dynamic machine translation; use a **static translation file**.

**Implementation:**
- Define language packs:
  ```js
  const translations = {
    en: {
      APP_TITLE: "FactorySee Monitor",
      DEVICES: "Devices",
      ALERTS: "Alerts",
      RISK_SUMMARY: "Risk Summary",
      // ...
    },
    hi: {
      APP_TITLE: "फैक्टरीसी मॉनिटर",
      DEVICES: "डिवाइस",
      ALERTS: "चेतावनियाँ",
      RISK_SUMMARY: "जोखिम सारांश",
      // ...
    },
    ta: {
      APP_TITLE: "FactorySee கண்காணிப்பு",
      DEVICES: "சாதனங்கள்",
      ALERTS: "எச்சரிக்கைகள்",
      RISK_SUMMARY: "அபாய சுருக்கம்",
      // ...
    }
  }
  ```
- Use a simple i18n helper:
  - `t(key)` returns the string in current language.
- Language selector:
  - Stores chosen language in app state (and optionally in `localStorage`).
  - Re-renders components with new strings.
- For Traffic-to-Story:
  - Use the same `locale` state to pick the right story template.

---

### 6.4 Data Simulation / Demo Mode

Because live packet capture is complicated for a hackathon, use **simulated streaming**:

1. Prepare `flows.json` sorted by timestamp.
2. On app load:
   - Keep an index `currentIndex = 0`.
3. Every 2–3 seconds:
   - Read next N flows (e.g., N=10) from `flows[currentIndex ... currentIndex+N]`.
   - Feed them into:
     - Device map update.
     - Anomaly detection.
   - Increment `currentIndex`.
4. When you reach the end:
   - Either loop from start or stop with “End of demo” message.

---

## 7. Success Metrics

For a hackathon prototype, measure success in terms of **functionality, usability, and clarity**.

### 7.1 Functional Metrics

1. **Real-Time Device Map**
   - The map shows **all devices** derived from flows.
   - Node colors change when alerts occur.
   - User can click a node to see details.

2. **Auto-Classification of Devices**
   - At least 3–4 distinct device types are correctly auto-assigned from traffic.
   - Visible and understandable in the device list and detail view.

3. **Anomaly Detection & Alerts**
   - At least 3 types of anomaly rules trigger during the demo timeline.
   - Alerts appear in the UI with correct device references and severity.

4. **Traffic-to-Story Engine**
   - Every alert has a corresponding human-readable **title, story, and recommended action**.
   - Stories accurately reflect the underlying event in plain language.

5. **Local Language Support**
   - Switching between English, Hindi, and Tamil correctly changes:
     - UI labels
     - Alert titles and stories
   - No major layout breakage when switching languages.

### 7.2 Usability Metrics (Qualitative)

1. **Comprehension by Non-Experts**
   - When shown to a non-cybersecurity student, they can:
     - Identify which devices are in trouble (red/yellow nodes).
     - Explain in their own words “what is going wrong” from the stories.

2. **Language Accessibility**
   - Hindi / Tamil speakers can understand:
     - The meaning of alerts.
     - At least one recommended action without needing English.

3. **Clarity of Visuals**
   - At a glance (<10 seconds), user can answer:
     - “How many devices?”
     - “Are there any high-risk issues right now?”

### 7.3 Extensibility / Future Potential (for judges)

- Demonstrated ability to:
  - Swap sample data with real `pcap` → flows pipeline.
  - Extend to more languages or protocols.
  - Integrate with real network taps in the future.

---

## Summary

This plan describes a hackathon-ready **FactorySee Monitor** prototype that:
- Provides a **Real-Time Device Map** of factory networks.
- Uses **Auto-Classification of Devices** to simplify heterogeneous IoT/OT environments.
- Runs **Anomaly Detection & Alerts** to highlight suspicious behavior.
- Leverages a **Traffic-to-Story Engine** to convert raw traffic into human stories.
- Offers **Local Language Support** (English, Hindi, Tamil), making cyber visibility accessible to SME factory stakeholders in India.

An AI prototyping tool (or student team) can implement this using:
- React + a graph library for visualization.
- Static JSON data for flows + simple in-browser logic for rules, stories, and language handling.