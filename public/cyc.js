const searchBar = document.getElementById("search-bar");
const filterSelect = document.getElementById("filter-select");
const sortSelect = document.getElementById("sort-select");

let productos = [];

async function getProducts() {
  const response = await fetch("http://localhost:5000/api/abm/productos/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
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

    productItem.onclick = () => {
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
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
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
    const itemsCart = await getCartItems();
    console.log(itemsCart);

    if (itemsCart.data.length === 0) {
      cart_items.innerHTML = `<tr><td colspan="4"><h4>No hay productos en el carrito</h4></td></tr>`;
      return;
    }

    let subtotal = 0;
    let total = 0;

    itemsCart.data.forEach((item) => {
      itemHtml = `
   <tr>
     <td class="product__cart__item">
       <div class="product__cart__item__pic">
         <img src="${item.imagenes[0]}" width="100" alt="">
       </div>
       <div class="product__cart__item__text">
         <h6>${item.nombre}</h6>
         <h5>$${parseFloat(item.precios[0])}</h5>
       </div>
     </td>
     <td class="quantity__item">
       <div class="quantity">
         <div class="pro-qty-2">
           <input type="number" value="${parseFloat(item.quantity)}">
         </div>
       </div>
     </td>
     <td class="cart__price">$${
       parseFloat(item.precios[0]) * parseFloat(item.quantity)
     }</td>
     <td class="cart__close" style="cursor: pointer;" id="cart_item_${
       item.id_product
     }"><i class="fa fa-close"></i></td>
   </tr>`;
      cart_items.innerHTML += itemHtml;
      subtotal += parseFloat(item.precios[0]) * parseFloat(item.quantity);
      total += parseFloat(item.precios[0]) * parseFloat(item.quantity);
      const deleteButton = document.getElementById(
        `cart_item_${item.id_product}`
      );
      deleteButton.onclick = async () => {
        await deleteItemFromCart(item.id_product);
        await setCartItems();
        await getTotalCarrito();
      };
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

window.onload = async () => {
  try {
    await setProducts();
    await setCartItems();
    await getTotalCarrito();
    const getcheckOut = await checkOut();
    createMPContainer(getcheckOut.data.preferenceId); 
  } catch (error) {
    console.error("Error loading products:", error);
    productosContainer.innerHTML = "<p>Error loading products</p>";
  }
};

if (searchBar) searchBar.oninput = filterAndSortProducts;
if (filterSelect) filterSelect.onchange = filterAndSortProducts;
if (sortSelect) sortSelect.onchange = filterAndSortProducts;
