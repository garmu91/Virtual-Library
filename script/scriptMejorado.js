document.addEventListener("DOMContentLoaded", () => {
  inicializarApp();
});

function inicializarApp() {
  cargarLibros();
  configurarModoOscuro();
  cargarListaCompra();
}

// 🎨 Modo oscuro con localStorage
function configurarModoOscuro() {
  const themeSwitch = document.getElementById("theme-switch");
  const body = document.body;
  const darkModeActivo = localStorage.getItem("dark-mode") === "active";

  body.classList.toggle("dark-mode", darkModeActivo);

  themeSwitch.addEventListener("click", () => {
    const activado = !body.classList.contains("dark-mode");
    body.classList.toggle("dark-mode", activado);
    localStorage.setItem("dark-mode", activado ? "active" : "inactive");
  });
}

// 📚 Cargar libros desde JSON
async function cargarLibros() {
  try {
    const response = await fetch("./assets/json/books.json");
    if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");

    const data = await response.json();
    renderizarLibros(data.library);
    generarFiltros(data.library);
    manejarListaCompra(data.library);
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("book-template").innerHTML =
      "<p>No se pudieron cargar los datos.</p>";
  }
}

// 📖 Renderizar libros en la página
function renderizarLibros(library) {
  const container = document.getElementById("book-template");
  container.innerHTML = "";

  library.forEach((item) => {
    if (!item.book) return;

    const bookElement = document.createElement("div");
    bookElement.classList.add("book");
    bookElement.dataset.isbn = item.book.ISBN; // Guardamos el ISBN como identificador único

    bookElement.innerHTML = `
      <div class="book-front">
        <b><span class="title">${item.book.title || "N/A"}</span></b>
        <img class="cover" src="${item.book.cover?.src || "#"}" alt="${
      item.book.cover?.alt || "#"
    }">
      </div>
      <div class="book-back">
        <p>Pages: <span>${item.book.pages || "N/A"}</span></p>
        <p>Genre: <span class="genre">${item.book.genre || "N/A"}</span></p>
        <p>Résumé: <span>${item.book.synopsis || "N/A"}</span></p>
        <p>Année: <span>${item.book.year || "N/A"}</span></p>
        <p>ISBN: <span>${item.book.ISBN || "N/A"}</span></p>
        <p>Auteur: <span>${item.book.author?.name || "N/A"}</span></p>
      </div>`;

    container.appendChild(bookElement);
  });

  marcarLibrosSeleccionados(); // 🔥 Marcar los libros ya añadidos
}

// 🎭 Generar filtros por género
function generarFiltros(library) {
  const listGenre = document.getElementById("list-filtre");
  const genres = [...new Set(library.map((item) => item.book.genre))];

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.textContent = genre;
    listGenre.appendChild(option);
  });

  listGenre.addEventListener("change", () => filtrarLibros(listGenre.value));
}

// 🔍 Filtrar libros por género
function filtrarLibros(genre) {
  const books = document.querySelectorAll(".book");
  const librosFiltrados = Array.from(books).filter(
    (book) =>
      book.querySelector(".genre").textContent.trim() === genre ||
      genre === "select"
  );

  books.forEach((book) => (book.style.display = "none"));
  librosFiltrados.forEach((book) => (book.style.display = "flex"));

  const count = librosFiltrados.length;
  const info = document.getElementById("livres-dispo-genre");
  info.textContent = `${count} livres dans le genre ${genre}`;
  info.style.display = genre === "select" ? "none" : "flex";
}

// 🛒 Manejo de lista de compras
function manejarListaCompra(library) {
  const container = document.getElementById("book-template");
  const list = document.getElementById("list");

  container.addEventListener("click", (event) => {
    const book = event.target.closest(".book");
    if (!book) return;
    agregarALaLista(book, list, library);
  });

  list.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-book")) {
      eliminarDeLista(event.target.closest("li"), list, library);
    }
  });
}

// ➕ Agregar libro a la lista de compras y guardarlo en localStorage
function agregarALaLista(book, list, library) {
  const coverSrc = book.querySelector(".cover").src;
  const coverAlt = book.querySelector(".cover").alt;
  const isbn = book.dataset.isbn;

  //if (!isbn) return; // Evita añadir libros sin ISBN válido

  const listItem = document.createElement("li");
  listItem.dataset.isbn = isbn; // Guardamos el ISBN como identificador
  listItem.innerHTML = `
    <img src="${coverSrc}" alt="${coverAlt}" class="cover-achat">
    <span class="delete-book">X</span>
  `;

  list.appendChild(listItem);
  //book.classList.add("selected");
  //book.setAttribute("inert", "");

  guardarListaEnLocalStorage(); // 🔥 Guardar en localStorage
  //cargarListaCompra(); // 🔄 Recargar lista de compras
  //actualizarContador(library, list);
  return list;
}
module.exports = agregarALaLista;

// ❌ Eliminar libro de la lista de compras y actualizar localStorage
function eliminarDeLista(listItem, list, library) {
  const isbn = listItem.dataset.isbn;
  listItem.remove();

  document.querySelectorAll(".book").forEach((book) => {
    if (book.dataset.isbn === isbn) {
      book.classList.remove("selected");
      book.removeAttribute("inert");
    }
  });

  guardarListaEnLocalStorage(); // 🔥 Actualizar localStorage
  //actualizarContador(library, list);
}
module.exports = eliminarDeLista;

// 📥 Cargar lista desde localStorage al recargar la página
function cargarListaCompra() {
  const list = document.getElementById("list");
  const data = JSON.parse(localStorage.getItem("lista")) || [];
  const shoppingList = document.getElementById("shopping-list");
  const count = data.length;

  list.innerHTML = "";

  data.forEach(({ isbn, coverSrc, coverAlt }) => {
    const listItem = document.createElement("li");
    listItem.dataset.isbn = isbn;
    listItem.innerHTML = `
      <img src="${coverSrc}" alt="${coverAlt}" class="cover-achat">
      <span class="delete-book">X</span>
    `;
    list.appendChild(listItem);
  });

  if (count > 0) {
    shoppingList.classList.add("show");
    shoppingList.removeAttribute("inert");
  } else {
    shoppingList.classList.remove("show");
    shoppingList.setAttribute("inert", "");
  }

  marcarLibrosSeleccionados();
}
//module.exports = cargarListaCompra;

// 💾 Guardar lista en localStorage
function guardarListaEnLocalStorage() {
  const list = document.getElementById("list");
  const data = Array.from(list.children).map((li) => ({
    isbn: li.dataset.isbn,
    coverSrc: li.querySelector("img").src,
    coverAlt: li.querySelector("img").alt,
  }));

  localStorage.setItem("lista", JSON.stringify(data));
}
//module.exports = guardarListaEnLocalStorage;

// 🔄 Marcar libros seleccionados al recargar la página
function marcarLibrosSeleccionados() {
  const listaGuardada = JSON.parse(localStorage.getItem("lista")) || [];

  document.querySelectorAll(".book").forEach((book) => {
    if (listaGuardada.some((item) => item.isbn === book.dataset.isbn)) {
      book.classList.add("selected");
      book.setAttribute("inert", "");
    }
  });
}

// 🔢 Actualizar contadores
function actualizarContador(library, list) {
  const count = list.childElementCount;

  document.getElementById(
    "livres-achat"
  ).textContent = `${count} livres en liste d'achats`;
  document.getElementById("livres-dispo").textContent = `${
    library.length - count
  } livres disponibles`;
}
