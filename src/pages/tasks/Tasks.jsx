import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../../components/BookCard/BookCard";
import { useWeeks } from "../../hooks/useWeeks";
import Modal from "../../components/Modal/Modal";
import WeekModal from "../../components/WeekModal/WeekModal";
import "./Tasks.css";

export default function Tasks() {
  const navigate = useNavigate();
  const { weeks, loading, error, addWeek, updateWeek, deleteWeek } = useWeeks();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState(null);
  const [weekToEdit, setWeekToEdit] = useState(null);

  const handleWeekClick = (weekId) => {
    navigate(`/tasks/week/${weekId}`);
  };

  const handleAddWeek = () => {
    setWeekToEdit(null);
    setShowWeekModal(true);
  };

  const handleEditWeek = (e, week) => {
    if (e) {
      e.stopPropagation();
    }
    setWeekToEdit(week);
    setShowWeekModal(true);
  };

  const handleDeleteClick = (e, week) => {
    e.stopPropagation();
    setWeekToDelete(week);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (weekToDelete) {
      try {
        await deleteWeek(weekToDelete.id);
        setShowDeleteModal(false);
        setWeekToDelete(null);
      } catch (err) {
        console.error('Erro ao deletar semana:', err);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setWeekToDelete(null);
  };

  const handleSaveWeek = async (weekData) => {
    try {
      if (weekToEdit) {
        await updateWeek(weekToEdit.id, weekData);
      } else {
        await addWeek(weekData);
      }
      setShowWeekModal(false);
      setWeekToEdit(null);
    } catch (err) {
      console.error('Erro ao salvar semana:', err);
    }
  };

  const handleCloseWeekModal = () => {
    setShowWeekModal(false);
    setWeekToEdit(null);
  };

  if (loading) {
    return (
      <div className="tasks-container">
        <div className="loading-message">
          <h2>Carregando semanas...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-container">
        <div className="error-message">
          <h2>Erro ao carregar semanas</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>Minhas tarefas</h1>
        <button className="add-week-btn" onClick={handleAddWeek}>
          + Adicionar Semana
        </button>
      </div>
      
      {weeks.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhuma semana encontrada</h2>
          <p>Clique em "Adicionar Semana" para começar!</p>
        </div>
      ) : (
        <div className="weeks-grid">
          {weeks.map((week) => (
            <div 
              key={week.id} 
              className="week-card-wrapper"
              onClick={() => handleWeekClick(week.id)}
            >
              <div className="week-card-container">
                <BookCard
                  title={week.title}
                  noteNumber={week.taskCount}
                  image={week.image}
                  onEdit={(e) => handleEditWeek(e, week)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showDeleteModal} 
        onClose={handleCancelDelete}
        title="Confirmar Exclusão"
      >
        <div className="delete-confirmation">
          <p>
            Tem certeza que deseja excluir a semana <strong>"{weekToDelete?.title}"</strong>?
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
      </Modal>

      <WeekModal
        isOpen={showWeekModal}
        onClose={handleCloseWeekModal}
        onSave={handleSaveWeek}
        week={weekToEdit}
        isEditing={!!weekToEdit}
      />
    </div>
  );
}
