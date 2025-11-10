"use client";

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

interface InterpretationPopoverProps {
  value: number | null;
  type: "validitas" | "reliabilitas" | "tingkat_kesukaran" | "daya_pembeda";
  pdfMode?: boolean;
}

export default function InterpretationPopover({ value, type, pdfMode = false }: InterpretationPopoverProps) {
  const getInterpretation = () => {
    if (value === null) return { text: "Tidak dapat dihitung", color: "text-gray-500" };

    switch (type) {
      case "validitas":
        if (value >= 0.7) return { text: "Sangat Valid", color: "text-green-600" };
        if (value >= 0.3) return { text: "Valid", color: "text-green-500" };
        if (value >= 0) return { text: "Kurang Valid", color: "text-yellow-500" };
        return { text: "Tidak Valid", color: "text-red-500" };

      case "reliabilitas":
        if (value >= 0.9) return { text: "Sangat Reliabel", color: "text-green-600" };
        if (value >= 0.7) return { text: "Reliabel", color: "text-green-500" };
        if (value >= 0.5) return { text: "Cukup Reliabel", color: "text-yellow-500" };
        return { text: "Kurang Reliabel", color: "text-red-500" };

      case "tingkat_kesukaran":
        if (value >= 0.7) return { text: "Mudah", color: "text-yellow-500" };
        if (value >= 0.3) return { text: "Sedang", color: "text-green-500" };
        return { text: "Sukar", color: "text-red-500" };

      case "daya_pembeda":
        if (value >= 0.4) return { text: "Sangat Baik", color: "text-green-600" };
        if (value >= 0.3) return { text: "Baik", color: "text-green-500" };
        if (value >= 0.2) return { text: "Cukup", color: "text-yellow-500" };
        return { text: "Kurang Baik", color: "text-red-500" };
    }
  };

  const getDescription = () => {
    switch (type) {
      case "validitas":
        return "Validitas menunjukkan ketepatan soal dalam mengukur kemampuan. Nilai > 0.3 menunjukkan soal valid, > 0.7 sangat valid.";
      case "reliabilitas":
        return "Reliabilitas menunjukkan konsistensi hasil pengukuran. Nilai > 0.7 menunjukkan tes reliabel, > 0.9 sangat reliabel.";
      case "tingkat_kesukaran":
        return "Tingkat kesukaran menunjukkan proporsi siswa yang menjawab benar. 0.3-0.7 adalah rentang ideal (sedang).";
      case "daya_pembeda":
        return "Daya pembeda menunjukkan kemampuan soal membedakan siswa berkemampuan tinggi dan rendah. Nilai > 0.3 menunjukkan daya pembeda yang baik.";
    }
  };

  const interpretation = getInterpretation();

  if (pdfMode) {
    return (
      <div className="text-sm">
        <span className={interpretation.color}>{interpretation.text}</span>
        <p className="text-gray-600 mt-1">{getDescription()}</p>
      </div>
    );
  }

  return (
    <Popover className="relative inline-block">
      <PopoverButton className="outline-none">
        <div className="flex items-center gap-2">
          <span className={interpretation.color}>{interpretation.text}</span>
          <InformationCircleIcon className="h-5 w-5" />
        </div>
      </PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute z-10 mt-2 w-72 -translate-x-1/2 transform px-4">
          <div className="rounded-lg shadow-lg ring-1 ring-[#00A19A] ring-opacity-5">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">{getDescription()}</p>
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}