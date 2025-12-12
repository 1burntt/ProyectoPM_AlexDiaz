import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { taskService } from "../services/taskService";

export type Priority = 'low' | 'medium-low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  notes?: string;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  soundUri?: string;
  soundName?: string;
  description?: string;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
}

const initialState: TasksState = {
  tasks: [],
  isLoading: false
};

// Thunk para cargar tareas desde Supabase
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string) => {
    console.log("Cargando tareas para usuario:", userId);
    
    // Traemos las tareas de Supabase
    const supabaseTasks = await taskService.getTasksFromSupabase(userId);
    
    // Convertimos el formato de Supabase a nuestro formato
    return supabaseTasks.map(task => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      createdAt: task.created_at,
      notes: task.notes,
      priority: task.priority,
      startDate: task.start_date,
      dueDate: task.due_date,
      soundUri: task.sound_uri,
      soundName: task.sound_name,
      description: task.description
    }));
  }
);

// Thunk para agregar tarea (ahora guarda en Supabase también)
export const addTask = createAsyncThunk(
  'tasks/addTask',
  async ({ userId, taskData }: { userId: string, taskData: Omit<Task, 'id' | 'createdAt'> }) => {
    console.log("Agregando nueva tarea para usuario:", userId);
    
    // Primero guardamos en Supabase
    const savedTask = await taskService.saveTaskToSupabase(userId, taskData);
    
    if (!savedTask) {
      throw new Error("No se pudo guardar la tarea en Supabase");
    }
    
    // Convertimos la respuesta de Supabase a nuestro formato
    return {
      id: savedTask.id,
      title: savedTask.title,
      completed: savedTask.completed || false,
      createdAt: savedTask.created_at,
      notes: savedTask.notes,
      priority: savedTask.priority,
      startDate: savedTask.start_date,
      dueDate: savedTask.due_date,
      soundUri: savedTask.sound_uri,
      soundName: savedTask.sound_name,
      description: savedTask.description
    };
  }
);

// Thunk para cambiar estado de completado
export const toggleTask = createAsyncThunk(
  'tasks/toggleTask',
  async ({ taskId, completed }: { taskId: string, completed: boolean }) => {
    console.log("Cambiando estado de tarea:", taskId, "a completada:", completed);
    
    // Actualizamos en Supabase
    const success = await taskService.updateTaskCompletion(taskId, completed);
    
    if (!success) {
      throw new Error("No se pudo actualizar la tarea en Supabase");
    }
    
    return { taskId, completed };
  }
);

// Thunk para borrar tarea
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    console.log("Eliminando tarea:", taskId);
    
    // Borramos de Supabase
    const success = await taskService.deleteTaskFromSupabase(taskId);
    
    if (!success) {
      throw new Error("No se pudo borrar la tarea de Supabase");
    }
    
    return taskId;
  }
);

// Thunk para actualizar tarea completa
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => {
    console.log("Actualizando tarea completa:", taskId);
    
    // Actualizamos en Supabase
    const updatedTask = await taskService.updateTask(taskId, updates);
    
    if (!updatedTask) {
      throw new Error("No se pudo actualizar la tarea en Supabase");
    }
    
    // Convertimos la respuesta
    return {
      id: updatedTask.id,
      title: updatedTask.title,
      completed: updatedTask.completed,
      createdAt: updatedTask.created_at,
      notes: updatedTask.notes,
      priority: updatedTask.priority,
      startDate: updatedTask.start_date,
      dueDate: updatedTask.due_date,
      soundUri: updatedTask.sound_uri,
      soundName: updatedTask.sound_name,
      description: updatedTask.description
    };
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Este reducer se queda por si necesitamos actualizar localmente
    clearAllTasks: () => initialState,
    
    // Reducer para migrar tareas locales a Supabase (opcional)
    migrateLocalTasks: (state, action: PayloadAction<{userId: string, tasks: Task[]}>) => {
      // Esto no guarda en Supabase, solo es para referencia
      console.log("Migrando tareas locales:", action.payload.tasks.length);
      state.tasks = action.payload.tasks;
    }
  },
  extraReducers: (builder) => {
    // Cargando tareas
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.tasks = action.payload;
      state.isLoading = false;
      console.log("Tareas cargadas en Redux:", state.tasks.length);
    });
    builder.addCase(fetchTasks.rejected, (state) => {
      state.isLoading = false;
      console.error("Error al cargar tareas");
    });

    // Agregar tarea
    builder.addCase(addTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload); // Agregar al inicio
      console.log("Tarea agregada localmente:", action.payload.title);
    });
    builder.addCase(addTask.rejected, (state, action) => {
      console.error("Error al agregar tarea:", action.error.message);
    });

    // Cambiar estado de tarea
    builder.addCase(toggleTask.fulfilled, (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload.taskId);
      if (task) {
        task.completed = action.payload.completed;
        console.log("Tarea actualizada localmente:", task.title);
      }
    });
    builder.addCase(toggleTask.rejected, (state, action) => {
      console.error("Error al actualizar tarea:", action.error.message);
    });

    // Borrar tarea
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      console.log("Tarea eliminada localmente");
    });
    builder.addCase(deleteTask.rejected, (state, action) => {
      console.error("Error al eliminar tarea:", action.error.message);
    });

    // Actualizar tarea completa
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        console.log("Tarea completa actualizada localmente");
      }
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      console.error("Error al actualizar tarea completa:", action.error.message);
    });
  }
});

export const { clearAllTasks, migrateLocalTasks } = taskSlice.actions;
export default taskSlice.reducer;