const bookGrid = document.getElementById("bookGrid");
const bookDetails = document.getElementById("bookDetails");

const modal = document.getElementById("previewModal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const previewPage = document.getElementById("previewPage");
const previewCounter = document.getElementById("previewCounter");
const modalBuy = document.getElementById("modalBuy");
const prevPreview = document.getElementById("prevPreview");
const nextPreview = document.getElementById("nextPreview");

let activeBook = null;
let activePreview = 0;

function createCover(book) {
    return `
        <div class="book-cover">
            <img
                class="book-cover-image"
                src="${book.cover}"
                alt="${escapeHtml(book.title)} book cover"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <div class="book-cover-fallback" style="display:none;">
                <span class="cover-brand">VIELUNEA</span>
                <span class="cover-title">${escapeHtml(book.title)}</span>
                <span class="cover-subtitle">${escapeHtml(book.subtitle)}</span>
                <span class="cover-author">digital self-help ebook</span>
            </div>
        </div>
    `;
}

function createBookCard(book) {
    return `
        <article class="book-card">
            <div class="cover-wrap">
                ${createCover(book)}
            </div>

            <div class="book-card-content">
                <h3>${escapeHtml(book.title)}</h3>
                <p>${escapeHtml(book.subtitle)}</p>

                <div class="card-actions">
                    <button class="button button-ghost preview-button" data-book="${book.id}">
                        Preview
                    </button>

                    <a class="button button-primary"
                       href="${book.kofi}"
                       target="_blank"
                       rel="noopener noreferrer">
                        Buy ↗
                    </a>
                </div>
            </div>
        </article>
    `;
}

function createBookDetail(book, index) {
    const previewButtons = book.previews.map((preview, previewIndex) => `
        <button class="preview-thumb"
                data-book="${book.id}"
                data-preview="${previewIndex}"
                aria-label="Open ${escapeHtml(preview.label)}">

            <img
                src="${preview.image}"
                alt="${escapeHtml(preview.label)}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <span class="preview-thumb-placeholder" style="display:none;">
                <span>${escapeHtml(preview.label)}</span>
                <strong>${escapeHtml(preview.title)}</strong>
            </span>
        </button>
    `).join("");

    const tags = book.tags.map(tag =>
        `<span class="meta-pill">${escapeHtml(tag)}</span>`
    ).join("");

    return `
        <article class="book-detail" id="book-${book.id}">
            <div class="detail-cover">
                ${createCover(book)}
            </div>

            <div class="detail-info">
                <p class="eyebrow">BOOK ${String(index + 1).padStart(2, "0")}</p>

                <h3>${escapeHtml(book.title)}</h3>

                <p class="detail-subtitle">${escapeHtml(book.subtitle)}</p>

                <p class="detail-description">${escapeHtml(book.description)}</p>

                <div class="detail-meta">
                    ${tags}
                </div>

                <div class="preview-strip">
                    ${previewButtons}
                </div>

                <div class="detail-actions">
                    <button class="button button-ghost preview-button" data-book="${book.id}">
                        View Preview Pages
                    </button>

                    <a class="button button-primary"
                       href="${book.kofi}"
                       target="_blank"
                       rel="noopener noreferrer">
                        Get the Digital Copy on Ko-fi ↗
                    </a>
                </div>
            </div>
        </article>
    `;
}

function renderBooks() {
    bookGrid.innerHTML = books.map(createBookCard).join("");
    bookDetails.innerHTML = books.map(createBookDetail).join("");
}

function showPreview(book, previewIndex = 0) {
    activeBook = book;
    activePreview = Math.max(
        0,
        Math.min(previewIndex, book.previews.length - 1)
    );

    const preview = book.previews[activePreview];

    modalTitle.textContent = book.title;
    modalSubtitle.textContent = book.subtitle;
    modalBuy.href = book.kofi;

    previewPage.innerHTML = `
        <img
            src="${preview.image}"
            alt="${escapeHtml(preview.label)}"
            onerror="showPreviewFallback(this)"
        >

        <div class="preview-page-fallback" style="display:none;">
            <span class="page-number">${escapeHtml(preview.label)}</span>
            <div class="page-rule"></div>
            <h4>${escapeHtml(preview.title)}</h4>
            <p>${escapeHtml(preview.text)}</p>
        </div>
    `;

    previewCounter.textContent =
        `${activePreview + 1} / ${book.previews.length}`;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalClose.focus();
}

function showPreviewFallback(image) {
    image.style.display = "none";
    const fallback = image.nextElementSibling;

    if (fallback) {
        fallback.style.display = "flex";
    }
}

function closePreview() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

function openBookPreview(bookId, previewIndex = 0) {
    const book = books.find(item => item.id === Number(bookId));

    if (book) {
        showPreview(book, Number(previewIndex));
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* Preview buttons */
document.addEventListener("click", (event) => {
    const previewButton = event.target.closest(".preview-button");
    const previewThumb = event.target.closest(".preview-thumb");

    if (previewButton) {
        openBookPreview(previewButton.dataset.book, 0);
    }

    if (previewThumb) {
        openBookPreview(
            previewThumb.dataset.book,
            previewThumb.dataset.preview
        );
    }
});

/* Modal navigation */
prevPreview.addEventListener("click", () => {
    if (!activeBook) return;

    activePreview =
        (activePreview - 1 + activeBook.previews.length) %
        activeBook.previews.length;

    showPreview(activeBook, activePreview);
});

nextPreview.addEventListener("click", () => {
    if (!activeBook) return;

    activePreview =
        (activePreview + 1) % activeBook.previews.length;

    showPreview(activeBook, activePreview);
});

modalClose.addEventListener("click", closePreview);

modal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) {
        closePreview();
    }
});

document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
        closePreview();
    }

    if (event.key === "ArrowLeft") {
        prevPreview.click();
    }

    if (event.key === "ArrowRight") {
        nextPreview.click();
    }
});

/* Mobile navigation */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
        navLinks.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

/* Main Ko-fi links */
document.getElementById("mainKofiLink").href = shopUrl;
document.getElementById("supportKofiLink").href = shopUrl;
document.getElementById("footerKofiLink").href = shopUrl;

document.getElementById("year").textContent =
    new Date().getFullYear();

renderBooks();
