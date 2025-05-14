const searchBar = document.getElementById("search-bar");
const filterSelect = document.getElementById("filter-select");
const sortSelect = document.getElementById("sort-select");

let productos = [];

async function getProducts() {
  const response = await fetch("http://localhost:5000/api/abm/productos/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    throw new Error("Error fetching products");
  }
  const productos = await response.json();
  console.log(productos);
  return productos;
}

async function setProducts() {
  const productosContainer = document.getElementById("productos_container");

  if (!productosContainer) {
    return;
  }

  productos = productos.length == 0 ? await getProducts() : productos;

  if (productos.data.length === 0) {
    productosContainer.innerHTML = `<h3 class="mx-auto">No hay productos disponibles</h3>`;
    return;
  }

  productosContainer.innerHTML = '';

  productos.data.forEach((producto) => {
    const productItem = document.createElement("div");
    productItem.style = "cursor: pointer;";
    productItem.className = "product__item col-lg-3 col-md-4 col-sm-12 col-12";

    const productPic = document.createElement("div");
    productPic.className = "product__item__pic set-bg";
    productPic.setAttribute(
      "style",
      `background-image: url(${producto.imagenes[0]});`
    );

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "New";

    const productHover = document.createElement("ul");
    productHover.className = "product__hover";

    const heartIcon = document.createElement("li");
    heartIcon.innerHTML = `<a href="#"><img src="img/icon/heart.png" alt="" /></a>`;
    const compareIcon = document.createElement("li");
    compareIcon.innerHTML = `<a href="#"><img src="img/icon/compare.png" alt="" /><span>Compare</span></a>`;
    const searchIcon = document.createElement("li");
    searchIcon.innerHTML = `<a href="#"><img src="img/icon/search.png" alt="" /></a>`;

    productHover.append(heartIcon, compareIcon, searchIcon);
    productPic.append(label, productHover);

    const productText = document.createElement("div");
    productText.className = "product__item__text";

    const productName = document.createElement("h6");
    productName.textContent = producto.nombre;

    const addToCart = document.createElement("a");
    addToCart.href = "#";
    addToCart.className = "add-cart";
    addToCart.textContent = "+ Add To Cart";
    addToCart.id = `product_${producto.id}`;
    addToCart.onclick = async function (event) {
      event.preventDefault();
      const quantity = 1; // Default quantity set to 1
      try {
      const response = await fetch(
        "http://localhost:5000/api/carrito/agregar",
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_product: producto.id,
          quantity: parseFloat(quantity),
        }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        swal({
        title: "Producto agregado al carrito",
        text: "El producto ha sido agregado a tu carrito de compras.",
        icon: "success",
        button: "Aceptar",
        });
        await getTotalCarrito();
      } else {
        console.error("Error al agregar el producto al carrito");
        swal({
        title: "Error",
        text: "No se pudo agregar el producto al carrito.",
        icon: "error",
        button: "Aceptar",
        });
      }
      } catch (error) {
      console.error("Error:", error);
      swal({
        title: "Error",
        text: "Ocurrió un error al intentar agregar el producto al carrito.",
        icon: "error",
        button: "Aceptar",
      });
      }
    };

    const productPrice = document.createElement("h5");
    productPrice.textContent = `$${producto.precios[0]}`;

    const productColorSelect = document.createElement("div");
    productColorSelect.className = "product__color__select";

    producto.colores.forEach((color, index) => {
      const colorLabel = document.createElement("label");
      colorLabel.setAttribute("for", `pc-${index + 1}`);
      if (index === 0) colorLabel.className = "active";
      const colorInput = document.createElement("input");
      colorInput.type = "radio";
      colorInput.id = `pc-${index + 1}`;
      colorLabel.appendChild(colorInput);
      productColorSelect.appendChild(colorLabel);
    });

    productPic.onclick = () => {
      window.location.href = `shop-details.html?i=${btoa(
        JSON.stringify({ id: producto.id })
      )}`;
    };

    productText.append(
      productName,
      addToCart,
      productPrice,
      productColorSelect
    );

    productItem.append(productPic, productText);
    productosContainer.appendChild(productItem);
  });
}

function filterAndSortProducts() {
  const searchQuery = searchBar.value.toLowerCase();
  const selectedCategory = filterSelect.value;
  const sortOption = sortSelect.value;

  let filteredProducts = productos.data.filter((producto) => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchQuery);
    const matchesCategory =
      !selectedCategory ||
      (selectedCategory === "bolsos" && producto.categoria_id === 2) ||
      (selectedCategory === "mochilas" && producto.categoria_id === 3) ||
      (selectedCategory === "accesorios" && producto.categoria_id === 4);
    return matchesSearch && matchesCategory;
  });

  if (sortOption === "precio-asc") {
    filteredProducts.sort((a, b) => a.precios[0] - b.precios[0]);
  } else if (sortOption === "precio-desc") {
    filteredProducts.sort((a, b) => b.precios[0] - a.precios[0]);
  } else if (sortOption === "nombre-asc") {
    filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  } else if (sortOption === "nombre-desc") {
    filteredProducts.sort((a, b) => b.nombre.localeCompare(a.nombre, "es"));
  }

  setProducts({ data: filteredProducts });
}

async function getCartItems() {
  const response = await fetch("http://localhost:5000/api/carrito/obtener", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error fetching products");
  }
  const productos = await response.json();
  console.log(productos);
  return productos;
}

async function deleteItemFromCart(id) {
  const response = await fetch(
    `http://localhost:5000/api/carrito/eliminar/${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_product: id }),
    }
  );
  if (!response.ok) {
    throw new Error("Error deleting item from cart");
  }
  const items = await response.json();
  console.log(items);
  return items;
}

async function setCartItems() {
  const cart_items = document.getElementById("cart_items") || null;
  if (cart_items) {
    cart_items.innerHTML = ""; // Limpiar antes de agregar
    const itemsCart = await getCartItems();
    console.log(itemsCart);

    if (itemsCart.data.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      const h4 = document.createElement("h4");
      h4.textContent = "No hay productos en el carrito";
      td.appendChild(h4);
      tr.appendChild(td);
      cart_items.appendChild(tr);
      return;
    }

    let subtotal = 0;
    let total = 0;

    itemsCart.data.forEach((item) => {
      // <tr>
      const tr = document.createElement("tr");

      // <td class="product__cart__item">
      const tdProduct = document.createElement("td");
      tdProduct.className = "product__cart__item";

      // <div class="product__cart__item__pic">
      const divPic = document.createElement("div");
      divPic.className = "product__cart__item__pic";
      const img = document.createElement("img");
      img.src = item.imagenes[0];
      img.width = 100;
      img.alt = "";
      divPic.appendChild(img);

      // <div class="product__cart__item__text">
      const divText = document.createElement("div");
      divText.className = "product__cart__item__text";
      const h6 = document.createElement("h6");
      h6.textContent = item.nombre;
      const h5 = document.createElement("h5");
      h5.textContent = `$${parseFloat(item.precios[0])}`;
      divText.appendChild(h6);
      divText.appendChild(h5);

      tdProduct.appendChild(divPic);
      tdProduct.appendChild(divText);

      // <td class="quantity__item">
      const tdQuantity = document.createElement("td");
      tdQuantity.className = "quantity__item";
      const divQuantity = document.createElement("div");
      divQuantity.className = "quantity";
      const divProQty = document.createElement("div");
      divProQty.className = "pro-qty-2";
      const input = document.createElement("input");
      input.type = "number";
      input.value = parseFloat(item.quantity);
      divProQty.appendChild(input);
      divQuantity.appendChild(divProQty);
      tdQuantity.appendChild(divQuantity);

      // <td class="cart__price">
      const tdPrice = document.createElement("td");
      tdPrice.className = "cart__price";
      tdPrice.textContent = `$${parseFloat(item.precios[0]) * parseFloat(item.quantity)}`;

      // <td class="cart__close">
      const tdClose = document.createElement("td");
      tdClose.className = "cart__close";
      const button = document.createElement("button");
      button.id = `cart_item_${item.id_product}`;
      button.style.cursor = "pointer";
      button.style.background = "none";
      button.style.border = "none";
      button.style.padding = "0";
      const icon = document.createElement("i");
      icon.className = "fa fa-close";
      button.appendChild(icon);
      tdClose.appendChild(button);

      // Agregar eventos
      button.addEventListener("click", async () => {
        console.log("Delete item", item.id_product);
        await deleteItemFromCart(item.id_product);
        await setCartItems();
        await getTotalCarrito();
      });

      // Agregar todos los td al tr
      tr.appendChild(tdProduct);
      tr.appendChild(tdQuantity);
      tr.appendChild(tdPrice);
      tr.appendChild(tdClose);

      cart_items.appendChild(tr);

      subtotal += parseFloat(item.precios[0]) * parseFloat(item.quantity);
      total += parseFloat(item.precios[0]) * parseFloat(item.quantity);
    });

    document.getElementById("subtotal").innerHTML = `$${subtotal}`;
    document.getElementById("total").innerHTML = `$${total}`;
  }
}

async function getTotalCarrito() {
  //http://localhost:5000/api/carrito/contar
  const response = await fetch("http://localhost:5000/api/carrito/contar", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error fetching cart total");
  }
  const total = await response.json();

  console.log(total);

  const cantidadTotal = document.getElementById("cantidadTotal") || null;
  const valorTotal = document.getElementById("valorTotal") || null;
  if (cantidadTotal) {
    cantidadTotal.innerHTML = `${parseFloat(total.data.totalItems)}`;
  }
  if (valorTotal) {
    valorTotal.innerHTML = `$${parseFloat(total.data.totalPrice)}`;
  }
}

async function checkOut() {
  const response = await fetch("http://localhost:5000/api/carrito/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error checking out");
  }
  const checkout = await response.json();
  // console.log(checkout);
  return checkout;
}

async function createMPContainer(preferenceId) {
  try {

    // Inicializa Mercado Pago con tu clave pública
    const mp = new MercadoPago('APP_USR-41fdb4a8-3e22-4a76-bdd7-971a915556a9');

    // Crea el botón de pago en el contenedor especificado
    mp.bricks().create("wallet", "wallet_container", {
      initialization: {
        preferenceId: preferenceId, // Reemplaza con tu ID de preferencia
      }
    });
  // }
} catch (error) {
  console.error("Error during createContainer checkout:", error);
}
}

// document.getElementById("checkoutBtn").onclick = async (e) => {
//   e.preventDefault();


// };

async function mpButton() {
  const checkout = await checkOut();
  console.log(checkout);
  await createMPContainer(checkout.data.preferenceId);
}

window.onload = async () => {
  try {
    await setProducts();
    await setCartItems();
    await getTotalCarrito();
    if (document.getElementById('wallet_container') && productos.length > 0) {
      mpButton();
    }
  } catch (error) {
    console.error("Error loading products:", error);
    productosContainer.innerHTML = "<p>Error loading products</p>";
  }
};

if (searchBar) searchBar.oninput = filterAndSortProducts;
if (filterSelect) filterSelect.onchange = filterAndSortProducts;
if (sortSelect) sortSelect.onchange = filterAndSortProducts;
