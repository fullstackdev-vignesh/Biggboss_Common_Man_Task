# Bigg Boss Common Man Task — New Business Flow (Tanglish)

Idha document oru **business/flow spec** — code illa, appdi enna maadhiri app work aganum nu explain pandrom. Existing screens (Splash, Wheel, Coin, Coupon) same UI/design, aana flow order matum change agudhu.

---

## 1. Current Flow (Baseline — reference ku)

```
Splash → Registration (name+phone) → Wheel Spin → Coin Flip → Coupon (direct show)
```

Idhu than ippo irukra flow. Idha next section la evlo maathanum nu paaru.

---

## 2. Puthu Business Flow (Overview)

```
Splash → Wheel Spin → Coin Flip
                          ├── Retry → "Better Luck Next Time" → OK → Splash (/)
                          └── Win  → "Congratulations" → Name+Phone Form → Submit
                                          → Unique Claim Link generate
                                          → (Testing phase) Link screen la show + Close → Splash (/)
                                          → (Production phase) Link SMS ah phone ku send

Claim Link (yaru vena open pannalam, another tab/device):
   → Bigg Boss branding + task/challenge details + username show
   → "I Accept" checkbox
   → Submit button click pannina odane → **automatic ah Coupon Code show aagum** (admin approval thevai illa)
   → Checkbox tick pannama / Submit click pannaadha varaikkum → coupon kaamikadhu

Admin Panel (separate, login protected, READ-ONLY status page — checkbox/Proceed button illa):
   → List of users yaru Spin + Coin task complete pannirukanga
   → Ovvoru user row-kum status column:
        - Claim link-la checkbox+Submit already pannirundhal → Coupon Code display aagum
        - Innum pannaadha users → "Pending" nu display aagum
   → Idhu pure monitoring/tracking page, admin edhuvum action edukkadhu
```

---

## 3. Screen-by-Screen Changes

### 3.1 Splash Screen (Image 1) — **NO CHANGE**

- "Enter the Task" button already irukra madhiri than.
- **Maathram:** Idhu click pannina odane, **Registration screen (Image 2) mudhalla vera route** — namma **neraya Wheel Spin screen (Image 3) ku poidum.**
- Registration screen **business flow-la remove aagidhu** (component code delete pananum nu illa — flow order-la use pananum illa, adha thaan sollranga).

### 3.2 Registration Screen (Image 2) — **REMOVE FROM FLOW**

- Idhu ippo skip aagum. Name/Phone ippo idhu screen la ketka koodadhu.
- Name + Phone ippo **Coin Win aana pooram** dhaan collect pannuvom (see 3.4).

### 3.3 Wheel Spin Screen (Image 3) — **NO CHANGE**

- Same as is. Spin → Challenge modal → task assign → proceed to Coin.
- Top-right participant badge (name/phone) — idhu ippo name/phone illama irukanum, so idha badge Wheel/Coin stage la **hide pannanum** (yenna, avanga innum register aagala).

### 3.4 Coin Flip Screen (Image 4 & 5) — **CHANGE**

**Case A: Retry (Image 4 — "One Last Chance" → Better Luck Next Time)**

- **NO CHANGE.** Better Luck Next Time message + OK button → click pannina odane `/` (Splash) ku navigate aagum. Reset.

**Case B: Win (Image 5 — Congratulations)**

- "Congratulations! You've earned your Bigg Boss Entry Coupon" message **same ah** show pannanum.
- Aana ippo **direct ah coupon code kaatakoodadhu.**
- Adhukku pathila oru **form** varanum: **Name + Phone Number** enter panna, oru **Submit** button.
- User Name + Phone submit pannina odane:
  - System oru **unique claim link/URL** generate pannanum (idhu andha particular user oda spin result + coin result oda associate aagirukanum).
  - **Testing Phase** (SMS integration aaguravaraikkum): Andha URL ah screen-layae **show pannanum** (link text/box maadhiri), + oru **Close button**.
    - Close button click pannina odane `/` (Splash) ku navigate aagum (reset).
    - Idhu tester ku andha link ah copy pannikittu, **vera tab-la open panni test pandradhukku.**
  - **Production Phase** (SMS confirm aana pooram): Screen-la link **kaatakoodadhu** — pathila andha link **SMS/phone message ah** user oda phone number ku direct ah send aagidum. Screen-la simple ah "Coupon link sent to your phone" madhiri message podalam.

> ⚠️ Rollout order: Mudhalla Testing Phase-oda ship pananum (link screen-la kaata), namma manual ah vera tab-la open panni whole claim-flow test panni confirm pannanum. Adhukku aprom dhaan SMS provider wire pannitu Production Phase ku switch pananum.

### 3.5 Claim Link Page (Puthu Screen — Image 1 madhiri Bigg Boss branding use pannalam)

- Idhu oru **puthu route/page** — unique link vazhi dhaan access aaganum (namba app oda navigation vazhi illa).
- Ithula:
  - Bigg Boss branding/icons (eye logo etc.)
  - Task/Challenge details (avaru enna task spin panninanga nu)
  - Username (avaru submit panna name)
  - **"I Accept" checkbox** (terms/consent)
  - **Submit button**
- Checkbox tick pannitu Submit click pannina odane → **automatic ah Coupon code show aagum** (Entry Coupon card, existing design madhiri). Admin approval edhuvum thevai illa — idhe page action-e coupon generate/reveal pannudhu.
- Checkbox tick pannama illa Submit click pannaadha varaikkum → coupon code kaamikadhu, page andha state-layae irukum.
- Idhu link, edho device-layum open pannalam — so **no login required** idhu page ku, aana link itself unique/unguessable ah irukanum (security ku).

### 3.6 Admin Panel (Puthu Section — login protected, READ-ONLY status page)

- Idhu **separate admin-only page** (namba public flow-la varadhu).
- Yaaru **Wheel Spin + Coin Flip rendu task-um complete pannirukanga** — andha users oda list kaamikanum (name, phone, task, spin result, coin result, status).
- **Checkbox illa, Proceed/Submit button illa** — idhu pure **status display / monitoring page.**
- Ovvoru user row-kum oru **status column**:
  - Andha user claim link-la checkbox tick panni Submit already click pannirundhal → **Coupon Code** display aagum.
  - Innum checkbox+Submit pannaadha users → **"Pending"** nu display aagum.
- Admin idhula edhuvum action edukkadhu — just track pandradhukku matum.

---

## 4. Full End-to-End Flow (Summary)

1. User `/` open pannaranga → Splash screen.
2. "Enter the Task" click → **neraya Wheel Spin screen** (Registration skip).
3. Spin the wheel → Challenge modal → task kaamikirathu → Proceed → Coin Flip screen.
4. Coin flip:
   - **Retry** → "Better Luck Next Time" → OK → `/` ku reset. (End.)
   - **Win** → "Congratulations" message → Name + Phone form → Submit.
5. Submit pannina odane unique claim link generate aagudhu:
   - Testing phase: Link screen-la kaamikirathu + Close button (`/` ku navigate).
   - Production phase: Link SMS via phone ku pogudhu.
6. User (ivaru entha device/tab-layum) andha claim link open pannaranga:
   - Bigg Boss branding + task details + username kaamikirathu.
   - "I Accept" checkbox tick panni Submit click pannina odane → **automatic ah Coupon Code show aagum** (admin approval thevai illa).
   - Checkbox tick pannama/Submit click pannaadha varaikkum → coupon kaamikadhu.
7. Admin panel (read-only status page) — Spin+Coin complete pannavanga list-la, ovvoru user oda status:
   - Andha user claim link-la already Submit pannirundha → **Coupon Code** display aagum.
   - Innum Submit pannaadha user → **"Pending"** display aagum.
   - Checkbox/Proceed button admin panel-la illa — pure monitoring page.

---

## 5. Open Points / Decisions Needed (future)

- Claim link expiry (evlo neram varaikkum valid) — decide pananum.
- Admin panel login/auth mechanism — evvalavu users, roles, etc.
- SMS provider (idhu already `sendCouponToPhone` stub-la irukku, `src/lib/coupon.ts`) — production phase-ku idha wire pananum.
- Claim link page — status polling venuma (admin approve pannaadha varaikkum user wait pannanuma, illa refresh pannanuma)?
- Duplicate submission handling — same user rendu tabla claim link open pannina enna aagum.
