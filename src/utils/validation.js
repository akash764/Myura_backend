function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
  if (typeof value !== "string") {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function validateCreateProductPayload(body) {
  const errors = [];

  const productName = isNonEmptyString(body.product_name)
    ? body.product_name.trim()
    : "";
  const category = isNonEmptyString(body.category) ? body.category.trim() : "";
  const price = toNumber(body.price);
  const stock = toInteger(body.stock);

  if (!productName) {
    errors.push("product_name is required");
  } else if (productName.length > 255) {
    errors.push("product_name must be 255 characters or less");
  }

  if (!category) {
    errors.push("category is required");
  } else if (category.length > 100) {
    errors.push("category must be 100 characters or less");
  }

  if (price === null || price < 0) {
    errors.push("price must be a non-negative number");
  }

  if (stock === null || stock < 0) {
    errors.push("stock must be a non-negative integer");
  }

  return {
    value: {
      product_name: productName,
      category,
      price,
      stock
    },
    errors
  };
}

function validateStockUpdatePayload(params, body) {
  const errors = [];

  const productId = toInteger(params.id);
  const stock = toInteger(body.stock);

  if (productId === null || productId <= 0) {
    errors.push("id must be a positive integer");
  }

  if (stock === null || stock < 0) {
    errors.push("stock must be a non-negative integer");
  }

  return {
    value: { productId, stock },
    errors
  };
}

function validateCreateOrderPayload(body) {
  const errors = [];

  const customerName = isNonEmptyString(body.customer_name)
    ? body.customer_name.trim()
    : "";
  const customerEmail = isNonEmptyString(body.customer_email)
    ? body.customer_email.trim()
    : "";
  const customerPhone = isNonEmptyString(body.customer_phone)
    ? body.customer_phone.trim()
    : "";

  if (!customerName) {
    errors.push("customer_name is required");
  } else if (customerName.length > 150) {
    errors.push("customer_name must be 150 characters or less");
  }

  if (!customerEmail) {
    errors.push("customer_email is required");
  } else if (!isValidEmail(customerEmail)) {
    errors.push("customer_email must be a valid email address");
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    errors.push("items must be a non-empty array");
  }

  const mergedItems = new Map();

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index] || {};
    const productId = toInteger(item.product_id);
    const quantity = toInteger(item.quantity);

    if (productId === null || productId <= 0) {
      errors.push(`items[${index}].product_id must be a positive integer`);
      continue;
    }

    if (quantity === null || quantity <= 0) {
      errors.push(`items[${index}].quantity must be a positive integer`);
      continue;
    }

    const existing = mergedItems.get(productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      mergedItems.set(productId, { product_id: productId, quantity });
    }
  }

  return {
    value: {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      items: [...mergedItems.values()]
    },
    errors
  };
}

module.exports = {
  validateCreateProductPayload,
  validateStockUpdatePayload,
  validateCreateOrderPayload
};

