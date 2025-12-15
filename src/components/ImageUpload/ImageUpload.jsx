import React, { useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import './ImageUpload.css';

export function ImageUpload({ onImageAdd, loading, error }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = async (files) => {
        const fileArray = Array.from(files);
        
        for (const file of fileArray) {
            if (file.type.startsWith('image/')) {
                try {
                    await onImageAdd(file);
                } catch (err) {
                    console.error('Erro ao adicionar imagem:', err);
                }
            }
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }
        e.target.value = '';
    };

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

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="image-upload">
            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
                
                <div className="upload-content">
                    {loading ? (
                        <div className="upload-loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            <FiPlus className="upload-icon" />
                        </>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="upload-error">
                    <p> {error}</p>
                </div>
            )}
        </div>
    );
}
