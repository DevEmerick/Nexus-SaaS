import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  editingTaskId: null,
  taskForm: {
    title: '',
    description: '',
    priority: 'normal',
    columnStatus: 'todo',
    subtasks: [],
    comments: [],
    assignees: [],
    tags: [],
    dueDate: null,
    attachment: null,
    attachments: []
  },
  subtaskInput: '',
  isModalOpen: false
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setEditingTaskId: (state, action) => {
      state.editingTaskId = action.payload;
    },
    updateTaskForm: (state, action) => {
      state.taskForm = { ...state.taskForm, ...action.payload };
    },
    resetTaskForm: (state) => {
      state.taskForm = initialState.taskForm;
      state.editingTaskId = null;
    },
    setSubtaskInput: (state, action) => {
      state.subtaskInput = action.payload;
    },
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    }
  }
});

export const {
  addTask,
  updateTask,
  deleteTask,
  setTasks,
  setEditingTaskId,
  updateTaskForm,
  resetTaskForm,
  setSubtaskInput,
  setIsModalOpen
} = taskSlice.actions;

export default taskSlice.reducer;
