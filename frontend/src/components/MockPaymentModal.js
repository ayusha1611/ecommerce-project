import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const MockPaymentModal = ({ orderId, amount, onSuccess, onClose }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleMockPayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      alert("Please fill all card details");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "/api/orders/mock-payment-success",
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess(response.data.paymentId);
      }

    } catch (error) {
      console.error("Mock payment failed:", error);
      alert("Payment failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: "20px" }}>Secure Payment</h2>

        <p style={{ marginBottom: "15px", fontWeight: "600" }}>
          Amount to Pay: ₹{amount}
        </p>

        <input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="password"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <button
          onClick={handleMockPayment}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "14px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "12px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "10px",
  width: "400px",
  maxWidth: "90%"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

export default MockPaymentModal;
