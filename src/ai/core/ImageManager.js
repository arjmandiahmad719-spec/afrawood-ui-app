class ImageManager {
  constructor() {
    this.key = "afra_images_v2";
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }

  ensureShot(shotId) {
    if (!this.data[shotId]) {
      this.data[shotId] = {
        images: [],
        referenceImage: null,
      };
    }
  }

  /* =========================
     Images
  ========================= */
  addImage({ shotId, imageUrl, prompt, seed }) {
    this.ensureShot(shotId);

    this.data[shotId].images.unshift({
      id: Date.now(),
      imageUrl,
      prompt,
      seed,
      createdAt: new Date().toISOString(),
    });

    this.save();
  }

  getImages(shotId) {
    this.ensureShot(shotId);
    return this.data[shotId].images;
  }

  deleteImage(shotId, imageId) {
    this.ensureShot(shotId);

    this.data[shotId].images = this.data[shotId].images.filter(
      (img) => img.id !== imageId
    );

    this.save();
  }

  clearShot(shotId) {
    delete this.data[shotId];
    this.save();
  }

  /* =========================
     Reference
  ========================= */
  setReferenceImage(shotId, image) {
    this.ensureShot(shotId);
    this.data[shotId].referenceImage = image;
    this.save();
  }

  getReferenceImage(shotId) {
    this.ensureShot(shotId);
    return this.data[shotId].referenceImage;
  }
}

const instance = new ImageManager();
export default instance;