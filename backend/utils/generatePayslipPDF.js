const PDFDocument = require("pdfkit");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

/**
 * Convert Number to Words (Indian Rupees)
 */
const numberToWords = (amount) => {
    if (amount === 0) return "Zero Rupees Only";

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertChunk = (num) => {
        let str = "";
        if (num > 99) {
            str += units[Math.floor(num / 100)] + " Hundred ";
            num %= 100;
        }
        if (num > 19) {
            str += tens[Math.floor(num / 10)] + " ";
            num %= 10;
        }
        if (num > 0) {
            if (num < 10) str += units[num] + " ";
            else if (num >= 10 && num < 20) {
                str += teens[num - 10] + " ";
                num = 0; // consumed
            }
        }
        return str;
    };

    // Split amount into integer and decimal
    const [integerPart, decimalPart] = amount.toFixed(2).split(".");
    let num = parseInt(integerPart);

    let words = "";

    // Indian Numbering System: Crore, Lakh, Thousand
    if (Math.floor(num / 10000000) > 0) {
        words += convertChunk(Math.floor(num / 10000000)) + "Crore ";
        num %= 10000000;
    }
    if (Math.floor(num / 100000) > 0) {
        words += convertChunk(Math.floor(num / 100000)) + "Lakh ";
        num %= 100000;
    }
    if (Math.floor(num / 1000) > 0) {
        words += convertChunk(Math.floor(num / 1000)) + "Thousand ";
        num %= 1000;
    }
    if (num > 0) {
        words += convertChunk(num);
    }

    words = words.trim();
    if (words) words += " Rupees"; // e.g. "Nineteen Thousand Three Hundred Fifty Five Rupees"

    if (parseInt(decimalPart) > 0) {
        words += " and " + convertChunk(parseInt(decimalPart)) + "Paise";
    }

    return words + " Only";
};


/**
 * Generates a Payslip PDF
 */
const generatePayslipPDF = async (employee, salaryDetails, settings) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: "A4" });
            const buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- COLORS & STYLES ---
            const black = "#000000";
            const grey = "#444444";

            // --- HEADER ---
            let currentY = 40;

            const logoPath = path.join(__dirname, "../../frontend/src/assets/Images/blacklogo.png");
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, currentY, { width: 100 });
            } else {
                // Fallback text if logo missing
                doc.fontSize(18).font("Helvetica-Bold").text("iSpark", 40, currentY);
            }

            doc.font("Helvetica-Bold").fontSize(12).text(settings?.organizationName || "SkillUp Pvt. Ltd.,", 200, currentY, { align: "center" });
            currentY += 15;
            doc.font("Helvetica").fontSize(10);
            const addressLines = (settings?.organizationAddress || "53/10, virudhachalam main road,\nUlundurpet - 606107").split("\n");
            addressLines.forEach(line => {
                doc.text(line, 200, currentY, { align: "center" });
                currentY += 12;
            });

            // Email & Website
            currentY += 5;
            doc.text(`E-Mail : skilluptechsolution@gmail.com`, 200, currentY, { align: "center" }); // Hardcoded from image or settings
            currentY += 12;

            // Website with underline
            const website = "skillup.in";
            const webWidth = doc.widthOfString(website);
            // Center calculation manually or use align center
            doc.text(website, 200, currentY, { align: "center", underline: true });

            currentY += 30;

            // 3. Title: "Pay Slip for [Month]-[Year]"
            doc.font("Helvetica-Bold").fontSize(14).text("Pay Slip", 0, currentY, { align: "center" });
            currentY += 18;
            doc.fontSize(10).text(`for ${salaryDetails.month}-${salaryDetails.year}`, 0, currentY, { align: "center" });
            currentY += 25;

            // 4. Employee Name
            doc.fontSize(12).text(employee.name, 0, currentY, { align: "center" });
            currentY += 20;

            // --- EMPLOYEE DETAILS (Grid) ---
            // Draw Top Line
            doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(grey).lineWidth(0.5).stroke();
            currentY += 10;

            const leftColX = 40;
            const midColX = 160; // Value start for left
            const rightColLabelX = 300;
            const rightColValX = 440; // Value start for right

            const detailsRows = [
                { l: "Employee Number", v1: employee.employeeId || "", r: "Tax Regime", v2: employee.taxRegime || "Regular Tax Regime" },
                { l: "Function", v1: employee.department || "", r: "Income Tax Number (PAN)", v2: employee.panNumber || "" },
                { l: "Designation", v1: employee.designation || "", r: "Universal Account Number (UAN)", v2: employee.uanNumber || "" },
                { l: "Location", v1: employee.location || "Chennai", r: "PF account number", v2: employee.pfNumber || "" },
                { l: "Bank Details", v1: employee.bankName || "", r: "ESI Number", v2: employee.esiNumber || "" },
                { l: "Date of joining", v1: employee.joiningDate ? moment(employee.joiningDate).format("D-MMM-yy") : "", r: "PR Account Number (PRAN)", v2: employee.pranNumber || "" }
            ];

            doc.font("Helvetica").fontSize(9);

            detailsRows.forEach(row => {
                // Left Pair
                doc.text(row.l, leftColX, currentY);
                doc.text(":", midColX - 10, currentY);
                doc.text(row.v1, midColX, currentY);

                // Right Pair
                doc.text(row.r, rightColLabelX, currentY);
                doc.text(":", rightColValX - 10, currentY);
                doc.text(row.v2, rightColValX, currentY);

                currentY += 14;
            });

            // Draw Bottom Line of Details
            currentY += 5;
            doc.moveTo(40, currentY).lineTo(555, currentY).stroke();
            currentY += 10;

            // --- ATTENDANCE ---
            // Small table: "Attendance Details" | "Value"
            const attTableX = 40;
            const attTableW = 200;

            // Header
            doc.rect(attTableX, currentY, attTableW, 20).stroke();
            doc.font("Helvetica-Bold").text("Attendance Details", attTableX + 5, currentY + 5);
            doc.moveTo(attTableX + 150, currentY).lineTo(attTableX + 150, currentY + 20).stroke(); // Vertical divider
            doc.text("Value", attTableX + 155, currentY + 5);
            currentY += 20;

            // Row: Present | 30 Days
            doc.rect(attTableX, currentY, attTableW, 20).stroke();
            doc.font("Helvetica").text("Present", attTableX + 5, currentY + 5);
            doc.moveTo(attTableX + 150, currentY).lineTo(attTableX + 150, currentY + 20).stroke();
            // Use provided attendance days or default to 30
            const presentDays = employee.attendanceDays || "30";
            doc.text(`${presentDays} Days`, attTableX + 155, currentY + 5, { align: "center", width: 45 });

            currentY += 30; // Spacing before Salary Table

            // --- SALARY TABLE ---
            const tableTop = currentY;
            const tableWidth = 515;
            const col1W = 130;  // Description
            const col2W = 60;   // Amount
            const col3W = 60;   // Gross Salary
            // Mid divider for Deductions
            const midX = 40 + col1W + col2W + col3W; // 40 + 250 = 290 approx

            // Adjust widths to match image: 
            // Earnings (inc Amount, Gross) takes exactly half? 
            // Image looks like: Earnings | Amount | Gross || Deductions | Amount | Gross

            // Dimensions
            const startX = 40;
            const fullW = 515;
            const halfW = fullW / 2; // 257.5

            // Left Side: Earnings (130), Amount (64), Gross (64) approx
            const earnDescW = 130;
            const amountW = 63;
            const grossW = 64;

            // Header Box
            doc.font("Helvetica-Bold").fontSize(9);

            // Draw Main Box Outline later or row by row?
            // Row by Row is easier for dynamic content usually, but Box is cleaner
            // Let's do Header Row
            const headerH = 30;
            doc.rect(startX, currentY, fullW, headerH).stroke(); // Border

            // Vertical Dividers
            const v1 = startX + earnDescW;
            const v2 = v1 + amountW;
            const v3 = v2 + grossW; // Center Divider
            const v4 = v3 + earnDescW; // Ded Description
            const v5 = v4 + amountW; // Ded Amount
            // v6 is end

            doc.moveTo(v1, currentY).lineTo(v1, currentY + headerH).stroke();
            doc.moveTo(v2, currentY).lineTo(v2, currentY + headerH).stroke();
            doc.moveTo(v3, currentY).lineTo(v3, currentY + 100).stroke(); // Main center divider, draw longer initially? No, update per row.
            doc.moveTo(v4, currentY).lineTo(v4, currentY + headerH).stroke();
            doc.moveTo(v5, currentY).lineTo(v5, currentY + headerH).stroke();

            // Text
            doc.text("Earnings", startX + 5, currentY + 8);
            doc.text("Amount", v1 + 5, currentY + 8, { align: "right", width: amountW - 5 });
            doc.text("Gross Salary", v2 + 2, currentY + 4, { align: "right", width: grossW - 4 });

            doc.text("Deductions", v3 + 5, currentY + 8);
            doc.text("Amount", v4 + 5, currentY + 8, { align: "right", width: amountW - 5 });
            doc.text("Gross Salary", v5 + 2, currentY + 4, { align: "right", width: grossW - 4 });

            currentY += headerH;

            // Rows
            const earnings = salaryDetails.earnings || [];
            const deductions = salaryDetails.deductions || [];
            const maxRows = Math.max(earnings.length, deductions.length, 5); // Minimum 5 rows for height matching image

            doc.font("Helvetica").fontSize(9);

            for (let i = 0; i < maxRows; i++) {
                const rowH = 15;

                // Draw vertical lines for this row
                doc.moveTo(startX, currentY).lineTo(startX, currentY + rowH).stroke(); // Left border
                doc.moveTo(v1, currentY).lineTo(v1, currentY + rowH).stroke();
                doc.moveTo(v2, currentY).lineTo(v2, currentY + rowH).stroke();
                doc.moveTo(v3, currentY).lineTo(v3, currentY + rowH).stroke(); // Center
                doc.moveTo(v4, currentY).lineTo(v4, currentY + rowH).stroke();
                doc.moveTo(v5, currentY).lineTo(v5, currentY + rowH).stroke();
                doc.moveTo(startX + fullW, currentY).lineTo(startX + fullW, currentY + rowH).stroke(); // Right border

                // Content - Earnings
                if (earnings[i]) {
                    doc.text(earnings[i].name, startX + 5, currentY + 4);
                    // Amount
                    doc.text(earnings[i].amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v1 + 5, currentY + 4, { align: "right", width: amountW - 10 });
                    // Gross (Assuming same as amount for now unless structure differs)
                    // Image shows distinct values (Amount < Gross).
                    // Logic: We don't have distinct "Gross" input in `salaryDetails` usually. 
                    // Using Amount as per plan notes.
                    doc.text(earnings[i].amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v2 + 5, currentY + 4, { align: "right", width: grossW - 10 });
                }

                // Content - Deductions
                if (deductions[i]) {
                    doc.text(deductions[i].name, v3 + 5, currentY + 4);
                    doc.text(deductions[i].amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v4 + 5, currentY + 4, { align: "right", width: amountW - 10 });
                    // Empty Gross col for deductions as per image usually, or same.
                    // Image shows "Gross Salary" col for deductions is empty.
                }

                currentY += rowH;
            }

            // Total Row
            const totalRowH = 20;
            doc.rect(startX, currentY, fullW, totalRowH).stroke(); // Box around total row

            // Vertical dividers for total row
            doc.moveTo(v1, currentY).lineTo(v1, currentY + totalRowH).stroke();
            doc.moveTo(v2, currentY).lineTo(v2, currentY + totalRowH).stroke();
            doc.moveTo(v3, currentY).lineTo(v3, currentY + totalRowH).stroke();
            doc.moveTo(v4, currentY).lineTo(v4, currentY + totalRowH).stroke(); // optional if consolidated

            // Total Earnings Label
            doc.font("Helvetica-Bold");
            doc.text("Total Earnings", startX + 5, currentY + 6);

            // Total Earned Amount
            doc.text(salaryDetails.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v1 + 5, currentY + 6, { align: "right", width: amountW - 10 });
            // Total Gross Amount (Simulated same)
            doc.text(salaryDetails.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v2 + 5, currentY + 6, { align: "right", width: grossW - 10 });

            // Total Deductions Label
            doc.text("Total Deductions", v3 + 5, currentY + 6);

            // Total Deducted Amount is NOT in the Amount column in image? 
            // Image: "Total Deductions" label is in first deduction col? 
            // Image content: "Total Deductions" in Deductions Description col. Empty Amount. Empty Gross.
            // Wait, Reference image: 
            // "Total Deductions" (Col 1 of Right side).
            // "Net Amount" row below it.

            // Let's match image exactly: 
            // Total Row contains: Total Earnings | Amount | Gross || Total Deductions | (Empty) | (Empty)
            // But where is Total Deduction Value? 
            // Ah, the image shows "Total Deductions" text, but the value is missing in that row?
            // Wait, looking closer at image artifact... 
            // Row "Total Earnings": Shows 19,355.50 | 20,000.00
            // Row "Total Deductions": Label only? 
            // Row "Net Amount": Label "Net Amount" | 19,355.50 | 20,000.00 ??

            // Let's interpret sensibly.
            // Row 1: Total Earnings (Left) | Total Deductions (Right) - usually.
            // Image: Left side has "Total Earnings". Right side says "Total Deductions".
            // Then below that is "Net Amount".

            // I will put Total Deductions VALUE in the Amount column of Deductions section.
            doc.text(salaryDetails.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v4 + 5, currentY + 6, { align: "right", width: amountW - 10 });

            currentY += totalRowH;

            // Net Amount Row
            doc.rect(startX + v3 - startX, currentY, fullW - (v3 - startX), totalRowH).stroke(); // Box for Net Amount part (Right side only? Or full width?)
            // Image: "Net Amount" is a row spanning the Deduction columns? Or full width?
            // It looks like it's under Deductions.

            doc.text("Net Amount", v3 + 5, currentY + 6);
            doc.text(salaryDetails.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v4 + 5, currentY + 6, { align: "right", width: amountW - 10 });
            doc.text(salaryDetails.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 }), v5 + 5, currentY + 6, { align: "right", width: grossW - 10 }); // Gross Net? Or just empty? Image shows 20,000.00 there too.

            // Also the left side of Net Amount row?
            // Image: Under Total Earnings, it is empty/blank in that row?
            // Left side: Blank box.
            doc.rect(startX, currentY, v3 - startX, totalRowH).stroke();

            currentY += totalRowH + 10;

            // Amount in words
            doc.font("Helvetica").fontSize(9);
            doc.text("Amount (in words):", startX, currentY);
            currentY += 12;
            doc.text(`INR ${numberToWords(salaryDetails.netPay)}`, startX, currentY);

            // Footer / Disclaimer
            // "This is a computer generated..."

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generatePayslipPDF;
