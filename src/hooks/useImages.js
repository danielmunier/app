import { useState, useEffect, useCallback, useRef } from 'react';
import { imageService } from '../services/imageService';

export function useImages() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const blobUrlsRef = useRef(new Set()); // Para rastrear URLs de blob criadas

    // Carregar imagens do IndexedDB
    const loadImages = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const savedImages = await imageService.getImages();
            
            // Criar URLs de blob para cada imagem
            const imagesWithUrls = savedImages.map(imageData => ({
                ...imageData,
                url: imageService.getImageUrl(imageData)
            }));
            
            setImages(imagesWithUrls);
        } catch (err) {
            setError('Erro ao carregar imagens: ' + err.message);
            console.error('Erro ao carregar imagens:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Adicionar nova imagem
    const addImage = useCallback(async (file) => {
        try {
            setLoading(true);
            setError(null);
            
            // Validar arquivo
            if (!file || !file.type.startsWith('image/')) {
                throw new Error('Arquivo deve ser uma imagem');
            }

            // Salvar imagem no IndexedDB
            const imageData = await imageService.saveImage(file);
            
            // Criar URL de blob para a nova imagem
            const imageWithUrl = {
                ...imageData,
                url: imageService.getImageUrl(imageData)
            };
            
            // Adicionar à lista (no início para mostrar as mais recentes primeiro)
            setImages(prev => [imageWithUrl, ...prev]);
            
            return imageWithUrl;
        } catch (err) {
            setError('Erro ao adicionar imagem: ' + err.message);
            console.error('Erro ao adicionar imagem:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Remover imagem
    const removeImage = useCallback(async (imageId) => {
        try {
            setLoading(true);
            setError(null);
            
            // Encontrar a imagem para limpar sua URL de blob
            const imageToRemove = images.find(img => img.id === imageId);
            if (imageToRemove && imageToRemove.url) {
                imageService.revokeImageUrl(imageToRemove.url);
            }
            
            // Remover do IndexedDB
            await imageService.deleteImage(imageId);
            
            // Remover da lista
            setImages(prev => prev.filter(img => img.id !== imageId));
        } catch (err) {
            setError('Erro ao remover imagem: ' + err.message);
            console.error('Erro ao remover imagem:', err);
        } finally {
            setLoading(false);
        }
    }, [images]);

    // Limpar todas as imagens
    const clearAllImages = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Limpar todas as URLs de blob antes de limpar o IndexedDB
            images.forEach(img => {
                if (img.url) {
                    imageService.revokeImageUrl(img.url);
                }
            });
            
            await imageService.clearAllImages();
            setImages([]);
        } catch (err) {
            setError('Erro ao limpar imagens: ' + err.message);
            console.error('Erro ao limpar imagens:', err);
        } finally {
            setLoading(false);
        }
    }, [images]);

    // Limpar URLs de blob quando o componente for desmontado
    useEffect(() => {
        return () => {
            images.forEach(img => {
                if (img.url) {
                    imageService.revokeImageUrl(img.url);
                }
            });
        };
    }, [images]);

    // Carregar imagens na inicialização
    useEffect(() => {
        loadImages();
    }, [loadImages]);

    return {
        images,
        loading,
        error,
        addImage,
        removeImage,
        clearAllImages,
        loadImages
    };
}
