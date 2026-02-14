import React, { useState } from "react";

const AddressForm = ({ onSubmit, onCancel }) => {
  const [address, setAddress] = useState({
  name: '',
  phone: '',
  fullAddress: '',
  pincode: '',
  city: '',
  state: '',
  country: 'India'
});


  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!address.name || address.name.trim().length < 2) {
      newErrors.name = "Please enter valid full name";
    }

    // Phone validation (Indian mobile numbers)
    if (!address.phone || !/^[6-9]\d{9}$/.test(address.phone)) {
      newErrors.phone = "Please enter valid 10-digit mobile number";
    }

    // Full address validation
    if (!address.fullAddress || address.fullAddress.trim().length < 10) {
      newErrors.fullAddress =
        "Please enter complete address (min 10 characters)";
    }

    // Pincode validation
    if (!address.pincode || !/^\d{6}$/.test(address.pincode)) {
      newErrors.pincode = "Please enter valid 6-digit pincode";
    }

    // City validation
    if (!address.city || address.city.trim().length < 2) {
      newErrors.city = "Please enter valid city name";
    }

    // State validation
    if (!address.state || address.state.trim().length < 2) {
      newErrors.state = "Please enter valid state name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (validateForm()) {
    onSubmit({
      name: address.name,
      phone: address.phone,
      fullAddress: address.fullAddress,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country
    });
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });

    // Clear error on typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>Delivery Address</h3>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "600" }}>Full Name *</label>
          <input
            type="text"
            name="name"
            value={address.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${errors.name ? "#dc3545" : "#ddd"}`,
              borderRadius: "5px",
              marginTop: "5px",
            }}
          />
          {errors.name && (
            <p style={{ color: "#dc3545", fontSize: "12px" }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "600" }}>Mobile Number *</label>
          <input
            type="text"
            name="phone"
            value={address.phone}
            onChange={handleChange}
            maxLength="10"
            placeholder="Enter 10-digit mobile number"
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${errors.phone ? "#dc3545" : "#ddd"}`,
              borderRadius: "5px",
              marginTop: "5px",
            }}
          />
          {errors.phone && (
            <p style={{ color: "#dc3545", fontSize: "12px" }}>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Full Address */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "600" }}>Full Address *</label>
          <textarea
            name="fullAddress"
            value={address.fullAddress}
            onChange={handleChange}
            rows="3"
            placeholder="House No., Street, Locality, Landmark"
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${
                errors.fullAddress ? "#dc3545" : "#ddd"
              }`,
              borderRadius: "5px",
              marginTop: "5px",
            }}
          />
          {errors.fullAddress && (
            <p style={{ color: "#dc3545", fontSize: "12px" }}>
              {errors.fullAddress}
            </p>
          )}
        </div>

        {/* Pincode + City */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label style={{ fontWeight: "600" }}>Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={address.pincode}
              onChange={handleChange}
              maxLength="6"
              placeholder="6-digit pincode"
              style={{
                width: "100%",
                padding: "12px",
                border: `1px solid ${
                  errors.pincode ? "#dc3545" : "#ddd"
                }`,
                borderRadius: "5px",
                marginTop: "5px",
              }}
            />
            {errors.pincode && (
              <p style={{ color: "#dc3545", fontSize: "12px" }}>
                {errors.pincode}
              </p>
            )}
          </div>

          <div>
            <label style={{ fontWeight: "600" }}>City *</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              placeholder="Your city"
              style={{
                width: "100%",
                padding: "12px",
                border: `1px solid ${errors.city ? "#dc3545" : "#ddd"}`,
                borderRadius: "5px",
                marginTop: "5px",
              }}
            />
            {errors.city && (
              <p style={{ color: "#dc3545", fontSize: "12px" }}>
                {errors.city}
              </p>
            )}
          </div>
        </div>

        {/* State + Country */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label style={{ fontWeight: "600" }}>State *</label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={handleChange}
              placeholder="Your state"
              style={{
                width: "100%",
                padding: "12px",
                border: `1px solid ${errors.state ? "#dc3545" : "#ddd"}`,
                borderRadius: "5px",
                marginTop: "5px",
              }}
            />
            {errors.state && (
              <p style={{ color: "#dc3545", fontSize: "12px" }}>
                {errors.state}
              </p>
            )}
          </div>

          <div>
            <label style={{ fontWeight: "600" }}>Country</label>
            <input
              type="text"
              value="India"
              readOnly
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                marginTop: "5px",
                backgroundColor: "#f5f5f5",
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "14px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Continue to Payment
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "14px 30px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
