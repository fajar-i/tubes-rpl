"use client";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import React, { useRef, useEffect } from "react";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

export default function Jawaban() {
    // Spreadsheet array of worksheets
    const banyaksoal = 10;
    const spreadsheetRef = useRef(null);
    const handleSave = () => {
        if (spreadsheetRef.current) {
            const data = spreadsheetRef.current[0].getData();
            console.log("Data JSON:", data[0][0]);
            // Anda dapat mengirim data ini ke backend atau menyimpannya sesuai kebutuhan
        }
    };
    const p = () => {
        return false;
    };
    // Render component
    return (
        <div>
            <Spreadsheet ref={spreadsheetRef} tabs={true} toolbar={true}>
                <Worksheet minDimensions={[banyaksoal, 6]} allowInsertColumn={false} />
            </Spreadsheet>
            <button onClick={handleSave}>Simpan Data sebagai JSON</button>
        </div>
    );
}
