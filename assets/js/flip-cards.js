class PostcardViewer {
  constructor() {
    this.template = document.getElementById("cardTemplate");
    this.container = document.getElementById("cardGrid");
    this.cardTitles = {
      0: { front: "Titel", back: "Titel - Rückseite" },
      1: { front: "Karte 2", back: "Karte 2 - Rückseite" },
      // ... more if needed
    };
    this.init();
  }

  init() {
    if (!this.template || !this.container) {
      console.error("Missing template or container");
      return;
    }
    this.loadCards();
    // Initialize lightbox after all cards are created
    this.initializeLightbox();
  }

  loadCards() {
    // Populate 16 example cards:
    const data = this.generateCardsData();
    data.forEach((card) => this.createCard(card));
  }

  generateCardsData() {
    const cards = [];
    for (let i = 0; i < 16; i++) {
      const num = String(i).padStart(2, "0");
      cards.push({
        id: i,
        frontTitle: this.cardTitles[i]?.front || `Karte ${i + 1}`,
        backTitle: this.cardTitles[i]?.back || `Karte ${i + 1} - Rückseite`,
        frontImage: `assets/img/postcards/Kartenset_UniGraz_${num}.webp`,
        backImage: `assets/img/postcards/Kartenset_UniGraz_${num}R.webp`,
      });
    }
    return cards;
  }

  createCard(cardData) {
    const clone = this.template.content.cloneNode(true);

    // front/back <img>:
    const frontImg = clone.querySelector(".flip-card-front img");
    const backImg = clone.querySelector(".flip-card-back img");
    // Set PDF download links
    const frontPdf = cardData.frontImage
      .replace(".webp", ".pdf")
      .replace("/postcards/", "/postcards/pdf/");
    const backPdf = cardData.backImage
      .replace(".webp", ".pdf")
      .replace("/postcards/", "/postcards/pdf/");

    frontImg.src = cardData.frontImage;
    frontImg.alt = cardData.frontTitle;
    backImg.src = cardData.backImage;
    backImg.alt = cardData.backTitle;

    // front/back titles:
    clone.querySelector(".flip-card-front .card-title").textContent =
      cardData.frontTitle;
    clone.querySelector(".flip-card-back .card-title").textContent =
      cardData.backTitle;

    // Set PDF download links
    clone.querySelector(".flip-card-front .download-btn").href = frontPdf;
    clone.querySelector(".flip-card-back .download-btn").href = backPdf;

    // Append to grid:
    this.container.appendChild(clone);

    // The newly inserted card:
    const flipCard =
      this.container.lastElementChild.querySelector(".flip-card");

    // 1 Flip toggles:
    flipCard.querySelectorAll(".flip-btn").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        flipCard.classList.toggle("flipped");
      });
    });
    // 2) Add click handlers for view buttons
    flipCard.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        // Find the closest image to this button
        const img = btn.closest(".card").querySelector(".card-img-top");
        // Trigger click on the image to open lightbox
        img.click();
      });
    });
  }

  initializeLightbox() {
    // Get all images after all cards are created
    const allImages = this.container.querySelectorAll(".card-img-top");
    const dynamicElements = Array.from(allImages).map((img) => {
      const src = img.src;
      const pdfUrl = src
        .replace(".webp", ".pdf")
        .replace("/postcards/", "/postcards/pdf/");

      // Get card title and determine if it's front or back
      const cardBody = img.closest(".card").querySelector(".card-title");
      const title = cardBody ? cardBody.textContent : "";
      const isFront = img.closest(".flip-card-front") !== null;

      return {
        src: src,
        thumb: src,
        downloadUrl: pdfUrl,
        subHtml: `<h4>${title}</h4>`, // Add title to lightbox
        alt: title, // Use title as alt text too
      };
    });

    // Add click handlers to all images
    allImages.forEach((img, index) => {
      // Make both the wrapper and image clickable
      const wrapper = img.closest(".card-img-wrapper");
      [img, wrapper].forEach((element) => {
        element.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent event bubbling
          const gallery = lightGallery(img, {
            dynamic: true,
            dynamicEl: dynamicElements,
            download: true,
            counter: true,
            index: index,
            mobileSettings: {
              controls: true,
              showCloseIcon: true,
              download: true,
            },
            addClass: "lg-card-gallery",
            appendSubHtmlTo: ".lg-outer", // Changed from .lg-item to show caption below
          });
          gallery.openGallery(index);

          img.addEventListener("lgAfterClose", () => gallery.destroy(), {
            once: true,
          });
        });
      });
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  new PostcardViewer();
});
