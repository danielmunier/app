class ImageUploadService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024;
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  }

  validateImage(file) {
    const errors = [];

    if (!file) {
      errors.push('Nenhum arquivo selecionado');
      return { isValid: false, errors };
    }

    if (!this.allowedTypes.includes(file.type)) {
      errors.push('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP');
    }

    if (file.size > this.maxFileSize) {
      errors.push('Arquivo muito grande. Tamanho máximo: 5MB');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  async resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao redimensionar imagem'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async processImageUpload(file) {
    try {
      const validation = this.validateImage(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const resizedBlob = await this.resizeImage(file);
      const base64 = await this.convertToBase64(resizedBlob);
      
      return {
        success: true,
        data: base64,
        originalName: file.name,
        size: resizedBlob.size,
        type: resizedBlob.type
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  createFileInput(accept = 'image/*') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    return input;
  }

  async selectImage() {
    return new Promise((resolve) => {
      const input = this.createFileInput();
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const result = await this.processImageUpload(file);
          resolve(result);
        } else {
          resolve({ success: false, error: 'Nenhum arquivo selecionado' });
        }
      };
      
      input.oncancel = () => {
        resolve({ success: false, error: 'Seleção cancelada' });
      };
      
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  }

  clearImage() {
    return {
      success: true,
      data: null
    };
  }

  isValidBase64(str) {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  getImageInfo(base64String) {
    if (!base64String || !this.isValidBase64(base64String.split(',')[1])) {
      return null;
    }

    const parts = base64String.split(',');
    const mimeType = parts[0].match(/data:([^;]+)/)?.[1];
    const size = Math.round((base64String.length * 3) / 4);

    return {
      mimeType,
      size,
      isImage: mimeType?.startsWith('image/') || false
    };
  }
}

const imageUploadService = new ImageUploadService();

export default imageUploadService;
