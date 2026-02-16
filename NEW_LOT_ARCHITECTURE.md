# 🎯 New Lot Architecture Documentation

## Overview
The lot management system has been redesigned to support flexible shipment creation with pieces from multiple lots.

---

## 📊 Architecture Diagram

```
Lot (Supplier Container)
  └── LotPiece[] (Individual trackable items)
        ├── S22 Ultra 256GB (10 units, $500 each)
        ├── iPhone 14 Pro (5 units, $800 each)
        └── ...

Shipment (Shipping Company Delivery)
  └── ShipmentPiece[] (Selected pieces from various lots)
        ├── 5x S22 Ultra from Lot #1
        ├── 3x iPhone 14 from Lot #2
        └── ...

LotArrival (What Actually Arrived)
  ├── Linked to Shipment
  ├── Verification Status
  └── Piece Details (expected vs received)
```

---

## 🗂️ Data Models

### **Lot** - Container for pieces from supplier
```typescript
{
  id: string (UUID)
  lotId: number (Auto-increment: 1, 2, 3...)
  companyName: string (Supplier name)
  companyCity: string (Supplier city)
  totalPrice: Decimal (Auto-calculated from pieces)
  totalQuantity: number (Auto-calculated from pieces)
  status: LotStatus
  notes?: string

  // Relations
  pieces: LotPiece[]
  arrivals: LotArrival[]
}
```

### **LotPiece** - Individual trackable item in a lot
```typescript
{
  id: string (UUID)
  pieceId: number (Auto-increment: 1, 2, 3...)
  lotId: string
  name: string (e.g., "S22 Ultra 256GB")
  quantity: number (How many units)
  unitPrice: Decimal (Price per unit)
  totalPrice: Decimal (unitPrice × quantity)
  status: PieceStatus (NEW, USED, REFURBISHED, AVAILABLE, SHIPPED, ARRIVED, DAMAGED)
  color?: string (UI color coding)
  notes?: string
  metadata?: Json

  // Relations
  lot: Lot
  shipmentPieces: ShipmentPiece[]
}
```

### **Shipment** - Delivery from shipping company
```typescript
{
  id: string (UUID)
  shipmentId: number (Auto-increment: 1, 2, 3...)
  shippingCompany: string (e.g., "DHL", "FedEx")
  shippingCompanyCity: string
  status: ShipmentStatus (PENDING, IN_TRANSIT, ARRIVED, VERIFIED, CANCELLED)
  trackingNumber?: string
  estimatedArrival?: DateTime
  actualArrival?: DateTime
  totalPieces: number (Auto-calculated)
  totalValue: Decimal (Auto-calculated)
  notes?: string

  // Relations
  pieces: ShipmentPiece[]
  arrivals: LotArrival[]
}
```

### **ShipmentPiece** - Junction table linking pieces to shipments
```typescript
{
  id: string (UUID)
  shipmentId: string
  lotPieceId: string
  quantityShipped: number (How many of this piece)
  notes?: string

  // Relations
  shipment: Shipment
  lotPiece: LotPiece
}
```

### **LotArrival** - Verification of what actually arrived
```typescript
{
  id: string (UUID)
  arrivalId: number (Auto-increment: 1, 2, 3...)
  lotId: string
  shipmentId: string
  quantity: number (Total received)
  totalValue: Decimal
  shippingCompany: string
  shippingCompanyCity: string
  pieceDetails: Json[] // [{name, quantityExpected, quantityReceived, status, notes}]
  status: ArrivalStatus (PENDING, VERIFIED, DAMAGED, INCOMPLETE, EXCESS)
  notes?: string
  verifiedAt?: DateTime
  verifiedBy?: string (Admin user ID)

  // Relations
  lot: Lot
  shipment: Shipment
}
```

---

## 🔄 Workflow Examples

### **Example 1: Creating a Lot with Pieces**

```bash
# Step 1: Create a lot
POST /lots
{
  "companyName": "Samsung Supplier Inc",
  "companyCity": "Seoul",
  "notes": "New stock arrival"
}
# Response: { id: "lot-uuid-1", lotId: 1, ... }

# Step 2: Add pieces to the lot
POST /lot-pieces
{
  "lotId": "lot-uuid-1",
  "name": "S22 Ultra 256GB",
  "quantity": 10,
  "unitPrice": 500,
  "status": "NEW"
}

POST /lot-pieces
{
  "lotId": "lot-uuid-1",
  "name": "S22 Ultra 512GB",
  "quantity": 5,
  "unitPrice": 600,
  "status": "NEW"
}

# Lot totals are auto-calculated:
# totalQuantity = 15
# totalPrice = (10 * 500) + (5 * 600) = 8000
```

### **Example 2: Creating a Shipment from Multiple Lots**

```bash
# Scenario: Ship 5x S22 Ultra from Lot #1 and 3x iPhone 14 from Lot #2

POST /shipments
{
  "shippingCompany": "DHL Express",
  "shippingCompanyCity": "Dubai",
  "trackingNumber": "TRACK123456",
  "estimatedArrival": "2024-03-01T10:00:00Z",
  "pieces": [
    {
      "lotPieceId": "piece-uuid-s22",  // From Lot #1
      "quantityShipped": 5,
      "notes": "Handle with care"
    },
    {
      "lotPieceId": "piece-uuid-iphone",  // From Lot #2
      "quantityShipped": 3
    }
  ]
}

# Response: Shipment created with:
# - totalPieces = 8
# - totalValue = (5 * 500) + (3 * 800) = 4900
# - Both lot pieces marked as "SHIPPED"
```

### **Example 3: Recording Arrival and Verification**

```bash
# Step 1: Create arrival record when shipment arrives
POST /lot-arrivals
{
  "shipmentId": "shipment-uuid-1",
  "quantity": 7,  // Only 7 arrived instead of 8
  "totalValue": 4200,
  "shippingCompany": "DHL Express",
  "shippingCompanyCity": "Dubai",
  "pieceDetails": [
    {
      "name": "S22 Ultra 256GB",
      "quantityExpected": 5,
      "quantityReceived": 5,
      "status": "verified"
    },
    {
      "name": "iPhone 14 Pro",
      "quantityExpected": 3,
      "quantityReceived": 2,
      "status": "incomplete",
      "notes": "1 unit missing"
    }
  ],
  "status": "INCOMPLETE",
  "notes": "Missing 1x iPhone 14"
}

# Step 2: Admin verifies and updates
PATCH /lot-arrivals/{arrival-id}
{
  "status": "VERIFIED",
  "verifiedBy": "admin-user-id"
}

# System automatically updates:
# - Shipment status → "ARRIVED"
# - Shipment actualArrival → current timestamp
# - Lot piece statuses → "ARRIVED" or "DAMAGED" based on verification
```

---

## 🎨 API Endpoints

### **Lots**
- `POST /lots` - Create a new lot
- `GET /lots` - List all lots (with pagination)
- `GET /lots/:id` - Get lot by UUID
- `GET /lots/lotId/:lotId` - Get lot by human-readable ID
- `PATCH /lots/:id` - Update lot
- `DELETE /lots/:id` - Soft delete lot

### **Lot Pieces**
- `POST /lot-pieces` - Add a piece to a lot
- `GET /lot-pieces` - List all pieces (with filters)
- `GET /lot-pieces/lot/:lotId` - Get all pieces for a lot
- `GET /lot-pieces/:id` - Get piece by ID
- `PATCH /lot-pieces/:id` - Update piece
- `DELETE /lot-pieces/:id` - Soft delete piece

### **Shipments**
- `POST /shipments` - Create shipment with pieces from multiple lots
- `GET /shipments` - List all shipments (with pagination)
- `GET /shipments/:id` - Get shipment by UUID
- `GET /shipments/shipmentId/:shipmentId` - Get shipment by human-readable ID
- `PATCH /shipments/:id` - Update shipment
- `DELETE /shipments/:id` - Soft delete shipment

### **Shipment Pieces**
- `POST /shipment-pieces` - Add piece to existing shipment
- `GET /shipment-pieces` - List all shipment pieces
- `GET /shipment-pieces/shipment/:shipmentId` - Get pieces for shipment
- `GET /shipment-pieces/:id` - Get shipment piece by ID
- `PATCH /shipment-pieces/:id` - Update shipment piece quantity
- `DELETE /shipment-pieces/:id` - Remove piece from shipment

### **Lot Arrivals**
- `POST /lot-arrivals` - Create arrival record for shipment
- `GET /lot-arrivals` - List all arrivals (with pagination)
- `GET /lot-arrivals/by-lot/:lotId` - Get arrivals for a lot
- `GET /lot-arrivals/by-shipment/:shipmentId` - Get arrivals for a shipment
- `GET /lot-arrivals/:id` - Get arrival by ID
- `PATCH /lot-arrivals/:id` - Verify/update arrival
- `DELETE /lot-arrivals/:id` - Soft delete arrival

---

## ✨ Key Features

### **Auto-Calculation**
- Lot totals are automatically calculated from pieces
- Shipment totals are automatically calculated from shipment pieces
- Status updates cascade through the system

### **Flexible Shipments**
- Select specific quantities from any lot piece
- Mix pieces from multiple lots in one shipment
- Track each piece independently

### **Status Tracking**
```
Piece Lifecycle:
NEW/USED → AVAILABLE → SHIPPED → ARRIVED/DAMAGED
```

### **Verification Workflow**
1. Create shipment with expected pieces
2. Record arrival when shipment arrives
3. Admin verifies and compares expected vs actual
4. System updates piece and shipment statuses

---

## 🚀 Migration Notes

### **Deprecated Models**
- `LotDetail` - Replaced by `LotPiece` (more granular tracking)

### **Database Reset**
All existing lot data was wiped during migration to the new schema.

### **New Modules Created**
- `lot-pieces` - Manage individual pieces
- `shipments` - Manage shipments
- `shipment-pieces` - Manage shipment composition

---

## 📝 Frontend Integration Guide

### **Creating a Lot Flow**
1. Create lot → Get `lotId`
2. For each item:
   - Call `POST /lot-pieces` with lot ID
   - Display running totals

### **Creating a Shipment Flow**
1. Display available lots
2. For each lot, show available pieces (status: AVAILABLE)
3. User selects pieces and quantities
4. Submit all selected pieces in one `POST /shipments` call

### **Arrival Verification Flow**
1. List pending shipments (status: IN_TRANSIT)
2. When shipment arrives, create arrival record
3. Display expected vs received comparison
4. Admin updates piece details and status
5. Submit verification

---

## 🔍 Query Examples

```bash
# Get lot with all pieces
GET /lots/{id}
# Returns: lot with pieces[] array

# Get all available pieces from a lot
GET /lot-pieces/lot/{lotId}?status=AVAILABLE

# Get shipment with all pieces
GET /shipments/{id}
# Returns: shipment with pieces[lotPiece{lot}]

# Get all in-transit shipments
GET /shipments?status=IN_TRANSIT

# Get all arrivals for a lot
GET /lot-arrivals/by-lot/{lotId}
```

---

This new architecture provides complete flexibility for your client's shipment workflow! 🎉
