import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
}

interface TasksState {
    tasks: Task[];
}

const initialState: TasksState = {
    tasks: []
};

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt'>>) => {
            const newTask: Task = {
                ...action.payload,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            state.tasks.push(newTask);
        },
        toggleTask: (state, action: PayloadAction<string>) => {
            const task = state.tasks.find(task => task.id === action.payload);
            if (task) {
                task.completed = !task.completed;
            }
        },
        deleteTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload);
        },
        clearAllTasks: () => initialState,
    },
});

export const { addTask, toggleTask, deleteTask, clearAllTasks } = taskSlice.actions;
export default taskSlice.reducer;