import React, { useState, useCallback } from 'react';
import './Gallery.css';
import { useImages } from '../../hooks/useImages';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';

export default function Gallery() {
    const { images, addImage, loading, error } = useImages();
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = useCallback(async (files) => {
        const fileArray = Array.from(files);
        
        for (const file of fileArray) {
            if (file.type.startsWith('image/')) {
                try {
                    await addImage(file);
                } catch (err) {
                    console.error('Erro ao adicionar imagem:', err);
                }
            }
        }
    }, [addImage]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    };

    return (
        <div 
            className={`gallery ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
          

            {images.length > 0 ? (
                <div className="image-grid">
                    {images.map((imageData) => (
                        <div key={imageData.id} className="image-item">
                            <img 
                                src={imageData.url} 
                                alt={imageData.originalName}
                                onError={(e) => {
                                    e.target.src = '/cat_bunny.png'; 
                                }}
                            />
                            <div className="image-info">
                                <span className="image-name">{imageData.originalName}</span>
                                <span className="image-size">
                                    {(imageData.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="image-item">
                        <ImageUpload 
                            onImageAdd={addImage}
                            loading={loading}
                            error={error}
                        />
                    </div>
                </div>
            ) : (
                <div className="empty-gallery">
                    <div className="upload-area">
                        <ImageUpload 
                            onImageAdd={addImage}
                            loading={loading}
                            error={error}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}