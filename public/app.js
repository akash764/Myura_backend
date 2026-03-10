const productsTableBody = document.querySelector("#productsTable tbody");
const statusMessage = document.getElementById("statusMessage");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminTokenStatus = document.getElementById("adminTokenStatus");
const refreshProductsBtn = document.getElementById("refreshProductsBtn");
const addProductForm = document.getElementById("addProductForm");
const placeOrderForm = document.getElementById("placeOrderForm");
const addOrderItemBtn = document.getElementById("addOrderItemBtn");
const orderItemsContainer = document.getElementById("orderItems");
const orderItemTemplate = document.getElementById("orderItemTemplate");

let productsCache = [];
let adminToken = localStorage.getItem("adminToken") || "";

function setStatus(message) {
  statusMessage.textContent = message;
}

function setAdminTokenStatus(message) {
  adminTokenStatus.textContent = message;
}

function refreshAdminTokenStatus() {
  if (adminToken) {
    setAdminTokenStatus("Admin token active.");
  } else {
    setAdminTokenStatus("Not logged in. Add Product requires admin login.");
  }
}

function formatINR(amount) {
  const value = Number(amount || 0);
  return `Rs. ${value.toFixed(2)}`;
}

function renderProducts(products) {
  productsTableBody.innerHTML = "";

  for (const product of products) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.product_name}</td>
      <td>${product.category}</td>
      <td>${formatINR(product.price)}</td>
      <td>${product.stock}</td>
    `;
    productsTableBody.appendChild(row);
  }
}

function buildProductOptions(selectElement) {
  selectElement.innerHTML = productsCache
    .map(
      (product) =>
        `<option value="${product.id}">#${product.id} ${product.product_name} (Stock: ${product.stock})</option>`
    )
    .join("");
}

function addOrderItemRow() {
  const node = orderItemTemplate.content.cloneNode(true);
  const row = node.querySelector(".order-item-row");
  const select = node.querySelector(".order-product-select");
  const removeBtn = node.querySelector(".remove-order-item-btn");

  buildProductOptions(select);

  removeBtn.addEventListener("click", () => {
    row.remove();
  });

  orderItemsContainer.appendChild(node);
}

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.message || "Failed to load products.");
      return;
    }

    productsCache = data.products || [];
    renderProducts(productsCache);

    document.querySelectorAll(".order-product-select").forEach((select) => {
      const selectedValue = select.value;
      buildProductOptions(select);
      if (productsCache.some((product) => String(product.id) === selectedValue)) {
        select.value = selectedValue;
      }
    });

    setStatus(`Loaded ${productsCache.length} products.`);
  } catch (error) {
    setStatus(`Failed to fetch products: ${error.message}`);
  }
}

addProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(addProductForm);
  const payload = {
    product_name: formData.get("product_name"),
    price: Number(formData.get("price")),
    category: formData.get("category"),
    stock: Number(formData.get("stock"))
  };

  try {
    const headers = { "Content-Type": "application/json" };
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }

    const response = await fetch("/api/products", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (response.ok) {
      addProductForm.reset();
      await loadProducts();
      setStatus("Product created successfully.");
      return;
    }
    setStatus(data.message || "Failed to create product.");
  } catch (error) {
    setStatus(`Failed to create product: ${error.message}`);
  }
});

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(adminLoginForm);
  const payload = {
    email: formData.get("email"),
    password: formData.get("password")
  };

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (response.ok) {
      adminToken = data.access_token;
      localStorage.setItem("adminToken", adminToken);
      refreshAdminTokenStatus();
      setStatus("Admin login successful.");
      return;
    }

    setStatus(data.message || "Admin login failed.");
  } catch (error) {
    setStatus(`Admin login failed: ${error.message}`);
  }
});

placeOrderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(placeOrderForm);
  const items = [];

  orderItemsContainer.querySelectorAll(".order-item-row").forEach((row) => {
    const select = row.querySelector(".order-product-select");
    const qtyInput = row.querySelector(".order-qty-input");

    items.push({
      product_id: Number(select.value),
      quantity: Number(qtyInput.value)
    });
  });

  const payload = {
    customer_name: formData.get("customer_name"),
    customer_email: formData.get("customer_email"),
    customer_phone: formData.get("customer_phone"),
    items
  };

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (response.ok) {
      placeOrderForm.reset();
      orderItemsContainer.innerHTML = "";
      addOrderItemRow();
      await loadProducts();
      setStatus("Order placed successfully.");
      return;
    }
    setStatus(data.message || "Failed to place order.");
  } catch (error) {
    setStatus(`Failed to place order: ${error.message}`);
  }
});

refreshProductsBtn.addEventListener("click", loadProducts);
addOrderItemBtn.addEventListener("click", addOrderItemRow);

addOrderItemRow();
loadProducts();
refreshAdminTokenStatus();
