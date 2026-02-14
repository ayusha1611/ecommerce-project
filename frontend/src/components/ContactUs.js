import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaClock } from 'react-icons/fa';

const ContactUs = () => {
  const PHONE_NUMBER = '9430561797';
  const WHATSAPP_NUMBER = '9430561797';
  const EMAIL = 'shekharbiyalaa@gmail.com';
  const ADDRESS = 'Katihar, Bihar, India';
  
  // Katihar, Bihar coordinates
  const LATITUDE = 25.5350;
  const LONGITUDE = 87.5688;

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about your products.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#2e3192' }}>
        Contact Us
      </h2>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
        Get in touch with us for any queries or product information
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        {/* Contact Information */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '25px', color: '#2e3192' }}>
              Contact Information
            </h3>

            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: '#e8f4ff', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2e3192',
                  fontSize: '20px'
                }}>
                  <FaPhone />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Phone</h4>
                  <a href={`tel:${PHONE_NUMBER}`} style={{ color: '#666', textDecoration: 'none', fontSize: '15px' }}>
                    {PHONE_NUMBER}
                  </a>
                  
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: '#e8ffe8', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#25D366',
                  fontSize: '20px'
                }}>
                  <FaWhatsapp />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>WhatsApp</h4>
                  <button 
                    onClick={handleWhatsAppClick}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#25D366', 
                      cursor: 'pointer',
                      fontSize: '15px',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Chat with us on WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: '#fff4e8', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff9800',
                  fontSize: '20px'
                }}>
                  <FaEnvelope />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Email</h4>
                  <a href={`mailto:${EMAIL}`} style={{ color: '#666', textDecoration: 'none', fontSize: '15px' }}>
                    {EMAIL}
                  </a>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: '#ffe8e8', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f44336',
                  fontSize: '20px'
                }}>
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Address</h4>
                  <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>
                    {ADDRESS}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: '#f0e8ff', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9c27b0',
                  fontSize: '20px'
                }}>
                  <FaClock />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Business Hours</h4>
                  <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>
                    Mon - Sat: 9:00 AM - 8:00 PM
                  </p>
                  <p style={{ color: '#666', fontSize: '15px', margin: '3px 0 0 0' }}>
                    Tuesday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <button
              onClick={() => window.location.href = `tel:${PHONE_NUMBER}`}
              style={{
                padding: '15px',
                backgroundColor: '#2e3192',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <FaPhone /> Call Now
            </button>
            <button
              onClick={handleWhatsAppClick}
              style={{
                padding: '15px',
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <FaWhatsapp /> WhatsApp
            </button>
          </div>
        </div>

        {/* Company Info */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#2e3192' }}>
              Shikhar Garments
            </h3>
            <div style={{ borderLeft: '3px solid #00a699', paddingLeft: '15px', marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#666', margin: 0 }}>
                We are a leading retailer of quality men's and kids' garments in Katihar, Bihar. 
                With 18 years of experience, we provide a wide range of products including cotton boxers, 
                shorts, lowers, and much more.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '25px' }}>
              <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#999', marginBottom: '5px' }}>GST Number</h4>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#333', margin: 0 }}>
                  10BRJPB9017P1ZQ
                </p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#999', marginBottom: '5px' }}>Year Established</h4>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#333', margin: 0 }}>
                  2017
                </p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', color: '#999', marginBottom: '5px' }}>Business Type</h4>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#333', margin: 0 }}>
                  Retailer
                </p>
              </div>
            
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#2e3192' }}>
          Find Us on Map
        </h3>
        <div style={{ 
          width: '100%', 
          height: '450px', 
          borderRadius: '10px', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <iframe
            title="Shikhar Garments Location"
            src={`https://www.google.com/maps?q=${LATITUDE},${LONGITUDE}&hl=es;z=14&output=embed`}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          <FaMapMarkerAlt style={{ marginRight: '5px' }} />
          Katihar, Bihar, India
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
