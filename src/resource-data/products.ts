export type Product = {
  sku: string;
  name: string;
  category: string;
  price: number;
  inventory: number;
  description: string;
};

export const products: Product[] = [
  {
    sku: "MED-STETH-001",
    name: "Cardiology Stethoscope",
    category: "Diagnostic Instruments",
    price: 129.99,
    inventory: 64,
    description: "Dual-head cardiology stethoscope for clinical auscultation."
  },
  {
    sku: "MED-BP-002",
    name: "Digital Blood Pressure Monitor",
    category: "Patient Monitoring",
    price: 84.5,
    inventory: 118,
    description: "Automatic upper-arm monitor with cuff, memory, and irregular heartbeat detection."
  },
  {
    sku: "MED-THERM-003",
    name: "Infrared Forehead Thermometer",
    category: "Diagnostic Instruments",
    price: 39.95,
    inventory: 210,
    description: "Contactless infrared thermometer with fast clinical temperature readings."
  },
  {
    sku: "MED-PULSE-004",
    name: "Fingertip Pulse Oximeter",
    category: "Patient Monitoring",
    price: 32.75,
    inventory: 175,
    description: "Portable SpO2 and pulse-rate monitor with OLED display."
  },
  {
    sku: "MED-OTOS-005",
    name: "LED Otoscope Kit",
    category: "ENT Instruments",
    price: 74.25,
    inventory: 49,
    description: "Reusable LED otoscope kit with specula and carrying case."
  },
  {
    sku: "MED-GLUCO-006",
    name: "Blood Glucose Meter Kit",
    category: "Lab Testing",
    price: 58.4,
    inventory: 92,
    description: "Glucose meter kit with lancets, strips, control solution, and case."
  },
  {
    sku: "MED-SYR-007",
    name: "Sterile Syringe Pack",
    category: "Clinical Supplies",
    price: 18.99,
    inventory: 520,
    description: "Box of sterile single-use syringes for clinical administration."
  },
  {
    sku: "MED-SCALPEL-008",
    name: "Disposable Scalpel Set",
    category: "Surgical Instruments",
    price: 46.8,
    inventory: 138,
    description: "Sterile disposable scalpels in assorted sizes for minor procedures."
  },
  {
    sku: "MED-NEB-009",
    name: "Portable Nebulizer Machine",
    category: "Respiratory Care",
    price: 96.3,
    inventory: 37,
    description: "Compact nebulizer compressor with adult and pediatric masks."
  },
  {
    sku: "MED-SUTURE-010",
    name: "Suture Practice and Supply Kit",
    category: "Surgical Instruments",
    price: 67.15,
    inventory: 73,
    description: "Suture kit with sterile practice supplies and common thread sizes."
  }
];
