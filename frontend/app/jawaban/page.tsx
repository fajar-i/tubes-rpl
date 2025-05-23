"use client";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import React, { useRef, useEffect } from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";

export default function Jawaban() {
    // Spreadsheet array of worksheets
    const spreadsheetRef  = useRef(null);
    const handleSave = () => {
        if (spreadsheetRef.current) {
            const data = spreadsheetRef.current[0].getData();
            console.log("Data JSON:", data[0][0]);
            // Anda dapat mengirim data ini ke backend atau menyimpannya sesuai kebutuhan
        }
    };
    // Render component
    return (
        <div>
            <Spreadsheet ref={spreadsheetRef } tabs={true} toolbar={true}>
                <Worksheet minDimensions={[6, 6]} />
            </Spreadsheet>
            <button onClick={handleSave}>Simpan Data sebagai JSON</button>
        </div>
    );
}
