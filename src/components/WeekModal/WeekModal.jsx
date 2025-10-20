import { useState, useEffect } from "react";
import { FaTrash, FaImage, FaUpload } from "react-icons/fa";
import { useImageUpload } from "../../hooks/useImageUpload";
import "./WeekModal.css";

export default function WeekModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  week = null, 
  isEditing = false 
}) {
  const { uploadImage, clearImage, isUploading, error: uploadError } = useImageUpload();
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    console.log('WeekModal useEffect - isOpen:', isOpen, 'isEditing:', isEditing, 'week:', week);
    if (isOpen) {
      if (isEditing && week) {
        setFormData({
          title: week.title || '',
          startDate: week.startDate || '',
          endDate: week.endDate || '',
          image: week.image || null
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        setFormData({
          title: '',
          startDate: today,
          endDate: nextWeek,
          image: null
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, week]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = async () => {
    const imageData = await uploadImage();
    if (imageData) {
      setFormData(prev => ({
        ...prev,
        image: imageData
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start >= end) {
        newErrors.endDate = 'Data de fim deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      startDate: '',
      endDate: '',
      image: null
    });
    setErrors({});
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && week) {
      onDelete(week);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className={`week-modal-overlay ${isOpen ? 'open' : ''}`} 
      onClick={handleClose}
      style={{ 
        display: isOpen ? 'flex' : 'none',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden'
      }}
    >
      <div className="week-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="week-modal-header">
          <h2>{isEditing ? 'Editar Semana' : 'Nova Semana'}</h2>
          <button className="close-btn" onClick={handleClose} title="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="week-form">
          <div className="form-group">
            <label htmlFor="title">Título da Semana</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Semana 1, Sprint 2, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Data de Início</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className={errors.startDate ? 'error' : ''}
              />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Data de Fim</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Imagem de Fundo (opcional)</label>
            <div className="image-upload-section">
              {formData.image ? (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    title="Remover imagem"
                  >
                    <FaTrash />
                  </button>
                </div>
              ) : (
                <div className="image-upload-placeholder">
                  <FaImage className="placeholder-icon" />
                  <p>Nenhuma imagem selecionada</p>
                </div>
              )}
              
              <button
                type="button"
                className="upload-btn"
                onClick={handleImageUpload}
                disabled={isUploading}
              >
                <FaUpload />
                {isUploading ? 'Carregando...' : 'Escolher Imagem'}
              </button>
            </div>
            
            {uploadError && (
              <span className="error-message">{uploadError}</span>
            )}
          </div>

          <div className="form-actions">
            <div className="left-actions">
              {isEditing && (
                <button 
                  type="button" 
                  className="delete-btn" 
                  onClick={handleDeleteClick}
                  title="Excluir semana"
                >
                  <FaTrash />
                  Excluir
                </button>
              )}
            </div>
            <div className="right-actions">
              <button type="button" className="cancel-btn" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="save-btn">
                {isEditing ? 'Salvar Alterações' : 'Criar Semana'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
          <div className="delete-confirm-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir a semana <strong>"{week?.title}"</strong>?
            </p>
            <p className="warning-text">
              ⚠️ Esta ação irá excluir <strong>TODAS as tasks</strong> desta semana e não pode ser desfeita!
            </p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-btn" 
                onClick={handleCancelDelete}
              >
                Cancelar
              </button>
              <button 
                className="delete-btn" 
                onClick={handleConfirmDelete}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
