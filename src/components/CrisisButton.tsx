import React from "react";

export function CrisisButton() {
  return (
    <div className="flex flex-col">
      <div className="bg-[#8B3D3D] px-4 py-2 text-white">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider opacity-90">Crisis Support:</span>
          <div className="flex gap-3">
            <a href="tel:18334564566" className="whitespace-nowrap text-[11px] font-medium hover:underline">Canada (1-833-456-4566)</a>
            <a href="tel:6134324946" className="whitespace-nowrap text-[11px] font-medium hover:underline">MacKay (613-432-4946)</a>
            <a href="tel:911" className="whitespace-nowrap text-[11px] font-bold hover:underline">911</a>
          </div>
        </div>
      </div>
    </div>
  );
}
