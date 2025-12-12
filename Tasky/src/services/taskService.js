import { supabase } from "./supabaseClient";

export const taskService = {
  // Esta función va a traer las tareas de Supabase
  async getTasksFromSupabase(userId) {
    console.log("Buscando tareas del usuario:", userId);
    
    try {
      // Pedimos las tareas a Supabase
      const { data, error } = await supabase
        .from('tasks')  // Tabla de tareas
        .select('*')    // Todos los campos
        .eq('user_id', userId)  // Solo del usuario actual
        .order('created_at', { ascending: false });  // Más nuevas primero
      
      if (error) {
        console.error("Error al buscar tareas:", error);
        return [];  // Si hay error, devuelvo array vacío
      }
      
      console.log("Tareas encontradas:", data.length);
      return data;
    } catch (error) {
      console.error("Error inesperado:", error);
      return [];
    }
  },

  // Esta función guarda una tarea nueva en Supabase
  async saveTaskToSupabase(userId, taskData) {
    console.log("Guardando tarea en Supabase...");
    
    // Preparamos los datos para Supabase
    const taskForSupabase = {
      user_id: userId,
      title: taskData.title,
      description: taskData.description || '',
      notes: taskData.notes || '',
      priority: taskData.priority || 'medium',
      completed: taskData.completed || false,
      start_date: taskData.startDate || null,
      due_date: taskData.dueDate || null,
      sound_uri: taskData.soundUri || null,
      sound_name: taskData.soundName || null
    };
    
    try {
      // Insertamos en Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskForSupabase])
        .select()
        .single();  // Para recibir la tarea guardada
      
      if (error) {
        console.error("Error al guardar tarea:", error);
        return null;
      }
      
      console.log("Tarea guardada con ID:", data.id);
      return data;
    } catch (error) {
      console.error("Error inesperado:", error);
      return null;
    }
  },

  // Esta función actualiza si una tarea está completada
  async updateTaskCompletion(taskId, completed) {
    console.log("Actualizando tarea:", taskId, "completada:", completed);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: completed, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      
      if (error) {
        console.error("Error al actualizar:", error);
        return false;
      }
      
      console.log("Tarea actualizada");
      return true;
    } catch (error) {
      console.error("Error inesperado:", error);
      return false;
    }
  },

  // Esta función borra una tarea
  async deleteTaskFromSupabase(taskId) {
    console.log("Borrando tarea:", taskId);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error("Error al borrar:", error);
        return false;
      }
      
      console.log("Tarea borrada");
      return true;
    } catch (error) {
      console.error("Error inesperado:", error);
      return false;
    }
  },

  // Esta función actualiza toda una tarea
  async updateTask(taskId, updates) {
    console.log("Actualizando tarea completa:", taskId);
    
    try {
      const supabaseUpdates = {};
      
      // Mapear nombres de propiedades
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
      if (updates.completed !== undefined) supabaseUpdates.completed = updates.completed;
      if (updates.startDate !== undefined) supabaseUpdates.start_date = updates.startDate;
      if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate;
      if (updates.soundUri !== undefined) supabaseUpdates.sound_uri = updates.soundUri;
      if (updates.soundName !== undefined) supabaseUpdates.sound_name = updates.soundName;
      
      supabaseUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar tarea completa:", error);
        return null;
      }
      
      console.log("Tarea completa actualizada");
      return data;
    } catch (error) {
      console.error("Error inesperado:", error);
      return null;
    }
  }
};