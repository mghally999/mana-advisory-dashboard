import type { Module } from "@/lib/types";

export const MODULES: Record<string, Module> = {
  marine: {
    id: "marine",
    label: "Marine",
    color: "#5a7da8",
    companies: [{ id: "kha", label: "KHA Marine (Seven Seven Marine)" }],
    subcategoryLabel: "Project type",
    subcategories: ["Fiberglass", "Steel"],
  },
  interior: {
    id: "interior",
    label: "Interior & Fitout",
    color: "#b08838",
    companies: [
      { id: "montaigne", label: "Montaigne Design" },
      { id: "suofeiya", label: "Suofeiya" },
      { id: "buildtech", label: "Buildtech" },
      { id: "dnake", label: "DNAKE" },
    ],
    subcategoryLabel: "Company",
  },
  mana: {
    id: "mana",
    label: "Mana",
    color: "#7a4f5e",
    companies: [{ id: "mana", label: "Mana Advisory" }],
    subcategoryLabel: "Business line",
    subcategories: ["Real Estate", "Consulting", "Back Office"],
  },
  engineering: {
    id: "engineering",
    label: "Engineering",
    color: "#5a7a3e",
    companies: [{ id: "jupiter", label: "Jupiter Engineering Corporation LLC" }],
    subcategoryLabel: "Discipline",
    subcategories: ["Civil", "MEP", "Structural"],
  },
};

export const STATUSES = [
  { id: "lead" as const, label: "Lead", color: "#9d8f76" },
  { id: "todo" as const, label: "To Do", color: "#5a7da8" },
  { id: "in_progress" as const, label: "In Progress", color: "#c2872a" },
  { id: "finished" as const, label: "Finished", color: "#5a7a3e" },
];
