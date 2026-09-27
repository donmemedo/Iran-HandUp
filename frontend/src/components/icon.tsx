"use client";

import { Book, Hammer, Heart, Home, Shirt, Stethoscope, Utensils } from "lucide-react";

const map = { stethoscope: Stethoscope, utensils: Utensils, home: Home, book: Book, hammer: Hammer, shirt: Shirt, heart: Heart };

export default function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const C = map[name as keyof typeof map] ?? Heart;
  return <C className={className} />;
}
