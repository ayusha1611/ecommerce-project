import React from "react";

const SuccessAnimation = ({ message }) => {
  return (
    <div style={overlay}>
      <div style={card}>
        <div className="checkmark-circle">
          <div className="background"></div>
          <div className="checkmark draw"></div>
        </div>

        <h2 style={{ marginTop: "20px" }}>Payment Successful 🎉</h2>
        <p style={{ marginTop: "10px", whiteSpace: "pre-line" }}>{message}</p>

        <style>{`
          .checkmark-circle {
            width: 80px;
            height: 80px;
            position: relative;
            display: inline-block;
          }

          .background {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #28a745;
            position: absolute;
            animation: pop 0.4s ease-out forwards;
          }

          .checkmark.draw:after {
            animation: checkmark 0.4s ease forwards;
            transform: scaleX(-1) rotate(135deg);
            animation-delay: 0.3s;
          }

          .checkmark:after {
            content: '';
            position: absolute;
            left: 28px;
            top: 40px;
            width: 20px;
            height: 40px;
            border-right: 5px solid white;
            border-top: 5px solid white;
            opacity: 0;
          }

          @keyframes pop {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          @keyframes checkmark {
            from { opacity: 0; height: 0; }
            to { opacity: 1; height: 40px; }
          }
        `}</style>
      </div>
    </div>
  );
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000
};

const card = {
  background: "white",
  padding: "40px",
  borderRadius: "12px",
  textAlign: "center",
  width: "400px",
  maxWidth: "90%"
};

export default SuccessAnimation;
