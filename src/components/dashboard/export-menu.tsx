"use client";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";

export function ExportMenu() {
  return (
    <div className="flex items-center gap-2">
      <a href="/api/export/dashboard" target="_blank" rel="noopener">
        <Button variant="outline" size="sm">
          <FileDown size={14} />
          PDF
        </Button>
      </a>
      <a href="/api/export/tasks" target="_blank" rel="noopener">
        <Button variant="outline" size="sm">
          <FileSpreadsheet size={14} />
          Excel
        </Button>
      </a>
    </div>
  );
}
