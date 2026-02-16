import React, { useEffect, useState } from "react";

import axios from "axios";

const ProductsPage = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupProductsByCategory = () => {
    const grouped = {};
    products.forEach((product) => {
      const category = product.category || "Other Products";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    return grouped;
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const groupedProducts = groupProductsByCategory();

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "30px auto", padding: "0 20px" }}>
      <h2 style={{ fontSize: "32px", marginBottom: "10px", color: "#b49b0d97" }}>
        Products & Services
      </h2>
      <p style={{ fontSize: "16px", color: "#666", marginBottom: "30px" }}>
        Browse our complete range of quality products
      </p>

      {/* Categories Sidebar and Products */}
      <div className="products-layout" style={{ display: "flex", gap: "30px" }}>
        {/* Category Sidebar */}
        <div
          className="products-sidebar"
          style={{ width: "250px", flexShrink: 0 }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: "sticky",
              top: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                marginBottom: "20px",
                color: "#b49b0d97",
              }}
            >
              Products
            </h3>

            {/* All Products Button */}
            <button
              onClick={() => setSelectedCategory("all")}
              style={{
                width: "100%",
                padding: "12px 15px",
                marginBottom: "8px",
                border: "none",
                backgroundColor:
                  selectedCategory === "all" ? "#b49b0d97" : "transparent",
                color: selectedCategory === "all" ? "white" : "#333",
                textAlign: "left",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: selectedCategory === "all" ? "600" : "normal",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== "all") {
                  e.target.style.backgroundColor = "#f0f0f0";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== "all") {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              All Products
              <span style={{ float: "right", fontSize: "13px", opacity: 0.7 }}>
                ({products.length})
              </span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  marginBottom: "8px",
                  border: "none",
                  backgroundColor:
                    selectedCategory === cat.name ? "#b49b0d97" : "transparent",
                  color: selectedCategory === cat.name ? "white" : "#333",
                  textAlign: "left",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: selectedCategory === cat.name ? "600" : "normal",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.name) {
                    e.target.style.backgroundColor = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat.name) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {cat.name}
                <span
                  style={{ float: "right", fontSize: "13px", opacity: 0.7 }}
                >
                  ({(groupedProducts[cat.name] || []).length})
                </span>
              </button>
            ))}

            {categories.length === 0 && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#999",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                No categories available
              </p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1 }}>
          {selectedCategory === "all" ? (
            // Show all products grouped by category
            categories.length > 0 ? (
              categories.map((category) => {
                const categoryProducts = groupedProducts[category.name] || [];
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={category._id} style={{ marginBottom: "50px" }}>
                    <h3
                      style={{
                        fontSize: "24px",
                        marginBottom: "20px",
                        color: "#b49b0d97",
                        borderBottom: "2px solid #b49b0d97",
                        paddingBottom: "10px",
                      }}
                    >
                      {category.name}
                    </h3>
                    <div
                      className="products-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      {categoryProducts.map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          onClick={onProductClick}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h3>No products available</h3>
                <p>Products will appear here once added!</p>
              </div>
            )
          ) : (
            // Show filtered products
            <div>
              <h3
                style={{
                  fontSize: "24px",
                  marginBottom: "20px",
                  color: "#b49b0d97",
                }}
              >
                {selectedCategory}
              </h3>
             
              <div
  className="products-grid"
  style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '20px' 
  }}
>

                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={onProductClick}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h3>No products in this category</h3>
                  <p>Check back later for new products!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onClick }) => {
  const minQty = product.minOrderQuantity || 24;
  const isInStock = product.inStock && product.quantity >= minQty;

  return (
    <div
      className="product-card"
      onClick={() => onClick(product)}
      style={{ cursor: "pointer", position: "relative" }}
    >
      {/* Stock Badge */}
      <div
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}
      >
        {isInStock ? (
          <span
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            ✅ In Stock
          </span>
        ) : (
          <span
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            ⚠️ Out of Stock
          </span>
        )}
      </div>

      <img
        src={`http://localhost:5000${product.image || product.images?.[0]}`}
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <p className="product-name">{product.name}</p>
      </div>
      <div style={{ padding: "15px", textAlign: "center" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#00a699",
            marginBottom: "5px",
          }}
        >
          ₹{product.price}
          <span
            style={{ fontSize: "13px", color: "#666", fontWeight: "normal" }}
          >
            /pc
          </span>
        </div>

        {/* Stock Info */}
        <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>
          {isInStock ? (
            <span style={{ color: "#28a745" }}>
              {product.quantity} pcs available
            </span>
          ) : (
            <span style={{ color: "#dc3545" }}>Currently unavailable</span>
          )}
        </div>

        {/* Min Order Quantity */}
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>
          Min. Order: {minQty} pieces
        </p>

        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isInStock ? "#b49b0d97" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isInStock ? "pointer" : "not-allowed",
            fontSize: "14px",
            fontWeight: "600",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(product);
          }}
        >
          {isInStock ? "View Details" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};


export default ProductsPage;
