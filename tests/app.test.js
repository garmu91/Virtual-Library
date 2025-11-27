/**
 * @jest-environment jsdom
 */
const agregarALaLista = require("../script/scriptMejorado");
const eliminarDeLista = require("../script/scriptMejorado");
//const cargarListaCompra = require("../script/scriptMejorado");
//const guardarListaEnLocalStorage = require("../script/scriptMejorado");

describe("Lista de Compras", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="book-template"></div>
      <ul id="list"></ul>
    `;
    localStorage.clear();
  });

  test("Agregar libro a la lista de compras", () => {
    const book = document.createElement("div");
    book.classList.add("book");
    book.dataset.isbn = "12345";
    book.innerHTML = `<img class="cover" src="cover.jpg" alt="Libro 1">`;

    const list = document.getElementById("list");
    console.log("Lists", list.children.length);

    agregarALaLista(book, list, []);

    const data = Array.from(list.children).map((li) => ({
      isbn: li.dataset.isbn,
      coverSrc: li.querySelector("img").src,
      coverAlt: li.querySelector("img").alt,
    }));

    console.log("Listeos", list.children.length);

    localStorage.setItem("lista", JSON.stringify(data));
    console.log("1era lista", JSON.parse(localStorage.getItem("lista").length));

    expect(list.children.length).toBe(1);
    expect(list.children[0].dataset.isbn).toBe("12345");
    expect(localStorage.getItem("lista")).toContain("12345");
  });

  test("Eliminar libro de la lista de compras", () => {
    const list = document.getElementById("list");
    const listItem = document.createElement("li");
    listItem.dataset.isbn = "54321";
    listItem.innerHTML = `<img src="Libro1.jpg" alt="cover" class="cover-achat">`;
    list.appendChild(listItem);
    console.log("listItem", list.innerHTML);

    eliminarDeLista(listItem, list, []);

    expect(list.children.length).toBe(0);
    expect(localStorage.getItem("lista")).not.toContain("54321");
    console.log("lista", JSON.parse(localStorage.getItem("lista").length));
  });

  /*test("Guardar y cargar la lista en localStorage", () => {
    const list = document.getElementById("list");

    // Simulamos que hay un libro guardado en localStorage
    localStorage.setItem(
      "lista",
      JSON.stringify([
        { isbn: "12345", coverSrc: "cover.jpg", coverAlt: "Libro 1" },
      ])
    );

    cargarListaCompra();

    expect(list.children.length).toBe(1);
    expect(list.children[0].dataset.isbn).toBe("12345");
  });*/
});
