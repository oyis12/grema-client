import React from "react";
import { useAuthConfig } from "../../context/AppState";
import { FaInstagram } from "react-icons/fa";

const Receipt = React.forwardRef((props, ref) => {
  const { receiptNumber, receiptData, product } = props;
  const { user } = useAuthConfig();

  // console.log(receiptData);
  console.log("data: ",product);

  // console.log(receiptData);

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      ref={ref}
      className="receipt-print"
      style={{
        position: "relative",
        width: "210mm",
        padding: "20px",
        margin: "auto",
        background: "#fff",
        fontFamily: "'Helvetica', 'Arial', sans-serif",
        fontSize: "12px",
        color: "#000",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-35deg)",
            fontSize: "80px",
            color: "#000",
            opacity: 0.05,
            fontWeight: "bold",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 0,
          }}
        >
          {receiptData?.shop?.name || "GREY AND GREMA"}
        </h2>
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            color: "#1e3a8a",
            fontWeight: "900",
          }}
        >
          {user?.assignedShop?.name?.toUpperCase() || "GREY & GREMA CARPETS"}
        </h1>
        <p style={{ fontSize: "11px", color: "#64748b" }}>
          IMPORTERS OF QUALITY RUGS & INTERIOR DECOR
        </p>
        <p style={{ margin: "5px 0", fontSize: "12px" }}>
          Turkish Carpets | Persian Carpets | Silk Carpet | Chinese Carpets
        </p>
        <p style={{ margin: "-5px 0", fontSize: "11px" }}>
          Plot 1698, Aminu Kano Crescent, Wuse II, Abuja
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            marginTop: "8px",
          }}
        >
          <FaInstagram size={12} />
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
            Greyandgrema_carpets
          </p>
        </div>
        <p style={{ margin: "5px 0", fontSize: "11px" }}>
          08184343338, 08130262533, 08033212840
        </p>
        <div
          style={{
            marginTop: "10px",
            borderTop: "2px solid #1e3a8a",
            borderBottom: "2px solid #1e3a8a",
            padding: "5px 0",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "14px",
              letterSpacing: "3px",
              fontWeight: "bold",
            }}
          >
            PROFORMA INVOICE
          </h2>
        </div>
      </div>

      {/* Meta Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          backgroundColor: "#f8fafc",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div>
          <h4
            style={{
              margin: "0 0 5px 0",
              color: "#1e3a8a",
              fontSize: "10px",
              textTransform: "uppercase",
            }}
          >
            Bill To:
          </h4>
          <p
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: "14px",
              textTransform: "capitalize",
            }}
          >
            {receiptData?.customerName || "Walking Customer"}
          </p>
          <p style={{ margin: "2px 0 0 0", color: "#475569" }}>
            {receiptData?.customerPhone || "N/A"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "2px 0" }}>
            <strong>No:</strong>{" "}
            <span style={{ color: "#dc2626" }}>{receiptNumber}</span>
          </p>
          <p style={{ margin: "2px 0" }}>
            <strong>Date:</strong> {currentDate}
          </p>
          <p style={{ margin: "2px 0" }}>
            <strong>Issued By:</strong> {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ minHeight: "80mm" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #1e3a8a" }}>
              <th style={th}>SN</th>
              <th style={{ ...th, textAlign: "left", width: "35%" }}>
                PRODUCT DESCRIPTION
              </th>
              <th style={th}>DIMENSIONS</th>
              <th style={th}>UNIT/SQM</th>
              <th style={th}>QTY</th>
              <th style={th}>RATE (₦)</th>
              <th style={th}>TOTAL (₦)</th>
            </tr>
          </thead>
        <tbody>
  {receiptData?.enrichedProducts?.map((item, index) => {
    const isSqm = item.pricingType === "sqm";
    const totalSqm = item.dimensions?.totalSquareMeters || 0;
    const quantity = item.quantitySold || 1;
    const totalNegotiated = item.negotiatedPriceAtSale || 0;

    let unitRate = 0;

    if (isSqm) {
      unitRate =
        totalSqm > 0
          ? totalNegotiated / (totalSqm * quantity)
          : 0;
    } else {
      unitRate = totalNegotiated / quantity;
    }

    return (
      <tr
        key={index}
        style={{
          borderBottom: "1px solid #f1f5f9",
          pageBreakInside: "avoid",
        }}
      >
        <td style={td}>{index + 1}</td>

        <td style={{ ...td, textAlign: "left" }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "11px",
              textTransform: "capitalize",
            }}
          >
            {item.title}
          </div>
        </td>

        <td style={td}>
          {isSqm
            ? `${item.dimensions?.length}m x ${item.dimensions?.width}m`
            : `${item.size || "N/A"} (Fixed)`}
        </td>

        <td style={td}>
          {isSqm
            ? `${totalSqm.toFixed(2)} m²`
            : "1 Unit"}
        </td>

        <td style={td}>{quantity}</td>

        <td style={td}>
          ₦{unitRate.toLocaleString()}
        </td>

        <td
          style={{
            ...td,
            textAlign: "right",
            fontWeight: "bold",
          }}
        >
          ₦{totalNegotiated.toLocaleString()}
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "300px",
            backgroundColor: "#f8fafc",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <div style={sumRow}>
            <span style={{ color: "#64748b" }}>Gross Total:</span>
            <span style={{ fontWeight: "bold" }}>
              ₦{receiptData?.subTotal?.toLocaleString()}
            </span>
          </div>
          <div style={{ ...sumRow, color: "#dc2626" }}>
            <span>Discount/Adjustment:</span>
            <span>- ₦{receiptData?.discountTotal?.toLocaleString()}</span>
          </div>
          <div
            style={{
              ...sumRow,
              borderTop: "1px solid #cbd5e1",
              marginTop: "8px",
              paddingTop: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              color: "#1e3a8a",
            }}
          >
            <span>Net Payable:</span>
            <span>₦{receiptData?.totalAmount?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer / Terms */}
      <div
        style={{
          marginTop: "30px",
          padding: "12px",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          fontSize: "10px",
        }}
      >
        <h4 style={{ margin: "0 0 5px 0", fontSize: "11px", color: "#1e3a8a" }}>
          TERMS & CONDITIONS:
        </h4>
        <ul style={{ margin: 0, paddingLeft: "15px", lineHeight: "1.6" }}>
          <li>
            Goods sold in good condition are not returnable or exchangeable.
          </li>
          <li>
            Ensure dimensions are verified before payment. Gray & Grema is not
            liable for measurement errors by third parties.
          </li>
          <li>
            This proforma invoice is valid for 24 hours. Prices are subject to
            change after validity.
          </li>
          <li>
            Ownership of goods remains with the vendor until full payment is
            confirmed.
          </li>
        </ul>
      </div>

      {/* Signature */}
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={sigBox}>
          <div style={sigLine}></div>
          <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>
            STORE MANAGER
          </p>
          <p style={{ fontSize: "9px", color: "#94a3b8" }}>
            Authorized Signature
          </p>
        </div>
        <div style={sigBox}>
          <div style={sigLine}></div>
          <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>
            CUSTOMER ACCEPTANCE
          </p>
          <p style={{ fontSize: "9px", color: "#94a3b8" }}>Date & Signature</p>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          borderTop: "1px solid #f1f5f9",
          paddingTop: "10px",
        }}
      >
        <p style={{ fontSize: "9px", color: "#94a3b8" }}>
          Professional POS System
        </p>
      </div>
    </div>
  );
});

const th = {
  padding: "10px 5px",
  fontSize: "10px",
  color: "#1e3a8a",
  textTransform: "uppercase",
};
const td = { padding: "8px 5px", textAlign: "center", fontSize: "11px" };
const sumRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};
const sigBox = { width: "220px", textAlign: "center" };
const sigLine = { borderBottom: "1.5px solid #1e3a8a", marginBottom: "6px" };

export default Receipt;
