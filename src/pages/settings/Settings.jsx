import { useState, useEffect } from "react";
import { useSettings } from "../../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

// Converte ms para { hours, minutes, seconds }
function msToTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

// Converte { hours, minutes, seconds } para ms
function timeToMs({ hours, minutes, seconds }) {
  return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
}

export default function Settings() {
  const { settings, updateSetting } = useSettings();
  const navigate = useNavigate();

  // Estado local para os inputs
  const [time, setTime] = useState(() => msToTime(settings.waterReminderInterval));

  // Atualiza o setting quando o tempo muda
  useEffect(() => {
    const ms = timeToMs(time);
    if (ms >= 1000) { // Mínimo 1 segundo
      updateSetting("waterReminderInterval", ms);
    }
  }, [time]);

  const handleTimeChange = (field, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);

    // Limites
    const limits = {
      hours: 24,
      minutes: 59,
      seconds: 59,
    };

    setTime((prev) => ({
      ...prev,
      [field]: Math.min(numValue, limits[field]),
    }));
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="settings-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1>Configurações</h1>
      </div>

      <div className="settings-content">
        {/* Seção: Água */}
        <section className="settings-section">
          <h2>💧 Hidratação</h2>

          <div className="settings-item">
            <div className="settings-item-info">
              <label>Intervalo de lembrete</label>
              <span className="settings-item-desc">
                Lembrete para beber água
              </span>
            </div>

            <div className="time-picker">
              <input
                type="number"
                min="0"
                max="24"
                value={time.hours.toString().padStart(2, '0')}
                onChange={(e) => handleTimeChange("hours", e.target.value)}
              />
              <span className="time-separator">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={time.minutes.toString().padStart(2, '0')}
                onChange={(e) => handleTimeChange("minutes", e.target.value)}
              />
              <span className="time-separator">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={time.seconds.toString().padStart(2, '0')}
                onChange={(e) => handleTimeChange("seconds", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Placeholder para futuras configurações */}
        <section className="settings-section">
          <h2>🎨 Aparência</h2>
          <p className="settings-coming-soon">Em breve...</p>
        </section>

        <section className="settings-section">
          <h2>🔔 Notificações</h2>
          <p className="settings-coming-soon">Em breve...</p>
        </section>
      </div>

      <div className="settings-version">
        v1.5.0
      </div>
    </div>
  );
}
