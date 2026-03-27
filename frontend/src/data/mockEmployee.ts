import type { AppRole } from "@/types/roles";

export interface MockEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppRole;
  password: string;
  department: string;
  status: "active" | "disabled";
}

export const MOCK_EMPLOYEES: MockEmployee[] = [
  {
    id: "emp-001",
    name: "Sarah Mitchell",
    email: "sarah@coherence.app",
    phone: "+1 (555) 100-0001",
    role: "owner",
    password: "owner123",
    department: "Management",
    status: "active",
  },
  {
    id: "emp-002",
    name: "Elena Vasquez",
    email: "elena@coherence.app",
    phone: "+1 (555) 100-0002",
    role: "manager",
    password: "manager123",
    department: "Management",
    status: "active",
  },
  {
    id: "emp-003",
    name: "Tomás Rivera",
    email: "tomas@coherence.app",
    phone: "+1 (555) 100-0003",
    role: "pos",
    password: "pos123",
    department: "Front of House",
    status: "active",
  },
  {
    id: "emp-004",
    name: "Marco Rossi",
    email: "marco@coherence.app",
    phone: "+1 (555) 100-0004",
    role: "kitchen",
    password: "kitchen123",
    department: "Kitchen",
    status: "active",
  },
  {
    id: "emp-005",
    name: "Aisha Patel",
    email: "aisha@coherence.app",
    phone: "+1 (555) 100-0005",
    role: "procurement",
    password: "proc123",
    department: "Procurement",
    status: "active",
  },
  {
    id: "emp-006",
    name: "James Okonkwo",
    email: "james@coherence.app",
    phone: "+1 (555) 100-0006",
    role: "pos",
    password: "pos456",
    department: "Front of House",
    status: "active",
  },
  {
    id: "emp-007",
    name: "Sophie Chen",
    email: "sophie@coherence.app",
    phone: "+1 (555) 100-0007",
    role: "kitchen",
    password: "kitchen456",
    department: "Kitchen",
    status: "disabled",
  },
];
