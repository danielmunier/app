class ImageService {
    constructor() {
        this.dbName = 'ImageGalleryDB';
        this.dbVersion = 1;
        this.storeName = 'images';
        this.db = null;
        this.init();
    }

    async init() {
        try {
            await this.openDatabase();
        } catch (error) {
            console.error('Erro ao inicializar ImageService:', error);
        }
    }

    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Erro ao abrir banco de dados'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar object store se não existir
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    
                    // Criar índices para busca eficiente
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('originalName', 'originalName', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Gerar ID único para a imagem
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Salvar imagem no IndexedDB
    async saveImage(file) {
        try {
            if (!this.db) {
                await this.openDatabase();
            }

            const id = this.generateId();
            
            // Converter File para ArrayBuffer para armazenamento eficiente
            const arrayBuffer = await file.arrayBuffer();
            
            // Criar objeto com dados da imagem
            const imageData = {
                id,
                originalName: file.name,
                size: file.size,
                type: file.type,
                createdAt: new Date().toISOString(),
                data: arrayBuffer, // Armazenar dados binários diretamente
                lastModified: file.lastModified
            };

            // Salvar no IndexedDB
            await this.saveToIndexedDB(imageData);

            return imageData;
        } catch (error) {
            console.error('Erro ao salvar imagem:', error);
            throw new Error('Falha ao salvar imagem');
        }
    }

    // Salvar no IndexedDB
    async saveToIndexedDB(imageData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(imageData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Erro ao salvar no IndexedDB'));
        });
    }

    // Obter todas as imagens do IndexedDB
    async getImages() {
        try {
            if (!this.db) {
                await this.openDatabase();
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    // Ordenar por data de criação (mais recentes primeiro)
                    const images = request.result.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    resolve(images);
                };

                request.onerror = () => reject(new Error('Erro ao carregar imagens'));
            });
        } catch (error) {
            console.error('Erro ao obter imagens:', error);
            throw new Error('Falha ao carregar imagens');
        }
    }

    // Deletar imagem do IndexedDB
    async deleteImage(imageId) {
        try {
            if (!this.db) {
                await this.openDatabase();
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(imageId);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(new Error('Erro ao deletar imagem'));
            });
        } catch (error) {
            console.error('Erro ao deletar imagem:', error);
            throw new Error('Falha ao deletar imagem');
        }
    }

    // Limpar todas as imagens do IndexedDB
    async clearAllImages() {
        try {
            if (!this.db) {
                await this.openDatabase();
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(new Error('Erro ao limpar imagens'));
            });
        } catch (error) {
            console.error('Erro ao limpar imagens:', error);
            throw new Error('Falha ao limpar imagens');
        }
    }

    // Obter URL da imagem para exibição (criar Blob URL)
    getImageUrl(imageData) {
        if (!imageData.data) {
            return '/cat_bunny.png'; // Fallback
        }
        
        // Criar Blob a partir dos dados binários
        const blob = new Blob([imageData.data], { type: imageData.type });
        return URL.createObjectURL(blob);
    }

    // Limpar URL do objeto (importante para evitar vazamentos de memória)
    revokeImageUrl(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }

    // Obter estatísticas
    async getStats() {
        try {
            const images = await this.getImages();
            const totalSize = images.reduce((sum, img) => sum + img.size, 0);
            
            return {
                count: images.length,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return { count: 0, totalSize: 0, totalSizeMB: '0.00' };
        }
    }

    // Buscar imagens por critério
    async searchImages(criteria) {
        try {
            if (!this.db) {
                await this.openDatabase();
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    let results = request.result;

                    // Filtrar por critérios
                    if (criteria.name) {
                        results = results.filter(img => 
                            img.originalName.toLowerCase().includes(criteria.name.toLowerCase())
                        );
                    }

                    if (criteria.type) {
                        results = results.filter(img => img.type === criteria.type);
                    }

                    if (criteria.dateFrom) {
                        results = results.filter(img => 
                            new Date(img.createdAt) >= new Date(criteria.dateFrom)
                        );
                    }

                    if (criteria.dateTo) {
                        results = results.filter(img => 
                            new Date(img.createdAt) <= new Date(criteria.dateTo)
                        );
                    }

                    resolve(results);
                };

                request.onerror = () => reject(new Error('Erro ao buscar imagens'));
            });
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            throw new Error('Falha ao buscar imagens');
        }
    }
}

export const imageService = new ImageService();
