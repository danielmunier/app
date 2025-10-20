class TaskService {
  constructor() {
    this.dbName = 'TaskManagerDB';
    this.dbVersion = 1;
    this.db = null;
  }

  // Inicializar o IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store para semanas
        if (!db.objectStoreNames.contains('weeks')) {
          const weekStore = db.createObjectStore('weeks', { keyPath: 'id', autoIncrement: true });
          weekStore.createIndex('title', 'title', { unique: false });
        }

        // Store para tasks
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          taskStore.createIndex('weekId', 'weekId', { unique: false });
          taskStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  // Garantir que o DB está inicializado
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // ========== OPERAÇÕES DE SEMANAS ==========

  // Adicionar uma nova semana
  async addWeek(weekData) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['weeks'], 'readwrite');
    const store = transaction.objectStore('weeks');
    
    return new Promise((resolve, reject) => {
      const request = store.add(weekData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Obter todas as semanas
  async getAllWeeks() {
    const db = await this.ensureDB();
    const transaction = db.transaction(['weeks'], 'readonly');
    const store = transaction.objectStore('weeks');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Obter uma semana específica
  async getWeek(weekId) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['weeks'], 'readonly');
    const store = transaction.objectStore('weeks');
    
    return new Promise((resolve, reject) => {
      const request = store.get(weekId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Atualizar uma semana
  async updateWeek(weekId, weekData) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['weeks'], 'readwrite');
    const store = transaction.objectStore('weeks');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ ...weekData, id: weekId });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Deletar uma semana
  async deleteWeek(weekId) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['weeks', 'tasks'], 'readwrite');
    const weekStore = transaction.objectStore('weeks');
    const taskStore = transaction.objectStore('tasks');
    
    return new Promise((resolve, reject) => {
      // Primeiro deletar todas as tasks da semana
      const taskIndex = taskStore.index('weekId');
      const taskRequest = taskIndex.getAll(weekId);
      
      taskRequest.onsuccess = () => {
        const tasks = taskRequest.result;
        tasks.forEach(task => {
          taskStore.delete(task.id);
        });
        
        // Depois deletar a semana
        const weekRequest = weekStore.delete(weekId);
        weekRequest.onsuccess = () => resolve();
        weekRequest.onerror = () => reject(weekRequest.error);
      };
      
      taskRequest.onerror = () => reject(taskRequest.error);
    });
  }

  // ========== OPERAÇÕES DE TASKS ==========

  // Adicionar uma nova task
  async addTask(taskData) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    
    return new Promise((resolve, reject) => {
      const request = store.add(taskData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Obter todas as tasks de uma semana
  async getTasksByWeek(weekId) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['tasks'], 'readonly');
    const store = transaction.objectStore('tasks');
    const index = store.index('weekId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(weekId);
      request.onsuccess = () => {
        // Organizar tasks por status
        const tasks = request.result;
        const organizedTasks = {
          todo: tasks.filter(task => task.status === 'todo'),
          inProgress: tasks.filter(task => task.status === 'inProgress'),
          done: tasks.filter(task => task.status === 'done')
        };
        resolve(organizedTasks);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Atualizar uma task
  async updateTask(taskId, taskData) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ ...taskData, id: taskId });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mover task entre colunas
  async moveTask(taskId, newStatus) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(taskId);
      getRequest.onsuccess = () => {
        const task = getRequest.result;
        if (task) {
          const updateRequest = store.put({ ...task, status: newStatus });
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Task not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Deletar uma task
  async deleteTask(taskId) {
    const db = await this.ensureDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(taskId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Obter contagem de tasks por semana
  async getTaskCountByWeek(weekId) {
    const tasks = await this.getTasksByWeek(weekId);
    return {
      total: tasks.todo.length + tasks.inProgress.length + tasks.done.length,
      todo: tasks.todo.length,
      inProgress: tasks.inProgress.length,
      done: tasks.done.length
    };
  }

  // ========== OPERAÇÕES DE UTILIDADE ==========

  // Limpar todos os dados
  async clearAllData() {
    const db = await this.ensureDB();
    const transaction = db.transaction(['weeks', 'tasks'], 'readwrite');
    const weekStore = transaction.objectStore('weeks');
    const taskStore = transaction.objectStore('tasks');
    
    return new Promise((resolve, reject) => {
      const weekRequest = weekStore.clear();
      const taskRequest = taskStore.clear();
      
      Promise.all([
        new Promise((res, rej) => {
          weekRequest.onsuccess = () => res();
          weekRequest.onerror = () => rej(weekRequest.error);
        }),
        new Promise((res, rej) => {
          taskRequest.onsuccess = () => res();
          taskRequest.onerror = () => rej(taskRequest.error);
        })
      ]).then(() => resolve()).catch(reject);
    });
  }

  // Exportar dados
  async exportData() {
    const weeks = await this.getAllWeeks();
    const allTasks = [];
    
    for (const week of weeks) {
      const tasks = await this.getTasksByWeek(week.id);
      allTasks.push(...Object.values(tasks).flat());
    }
    
    return { weeks, tasks: allTasks };
  }

  // Importar dados
  async importData(data) {
    await this.clearAllData();
    
    // Adicionar semanas
    for (const week of data.weeks) {
      await this.addWeek(week);
    }
    
    // Adicionar tasks
    for (const task of data.tasks) {
      await this.addTask(task);
    }
  }
}

// Criar instância singleton
const taskService = new TaskService();

export default taskService;
