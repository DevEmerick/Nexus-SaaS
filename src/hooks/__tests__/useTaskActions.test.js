import { renderHook, act } from '@testing-library/react';
import { useTaskActions } from '../useTaskActions';

describe('useTaskActions', () => {
  const mockCurrentUser = { id: 'user1', name: 'Test User' };

  const mockTask = {
    id: 'task1',
    title: 'Test Task',
    status: 'col1',
    subtasks: [],
    history: []
  };

  it('should return task action functions', () => {
    const { result } = renderHook(() =>
      useTaskActions(
        [mockTask],
        jest.fn(),
        { title: '', description: '' },
        jest.fn(),
        '',
        jest.fn(),
        'ws1',
        jest.fn(),
        mockCurrentUser,
        '',
        jest.fn()
      )
    );

    expect(result.current.handleSaveTask).toBeDefined();
    expect(result.current.handleDeleteTask).toBeDefined();
    expect(result.current.handleAddSubtask).toBeDefined();
  });

  it('handleSaveTask should not create task with empty title', () => {
    const setTasks = jest.fn();

    renderHook(() =>
      useTaskActions(
        [],
        setTasks,
        { title: '   ', description: '' },
        jest.fn(),
        '',
        jest.fn(),
        'ws1',
        jest.fn(),
        mockCurrentUser,
        '',
        jest.fn()
      )
    ).result.current.handleSaveTask({ preventDefault: () => {} });

    expect(setTasks).not.toHaveBeenCalled();
  });

  it('handleSaveTask should create new task with valid title', () => {
    const setTasks = jest.fn();
    const setTaskForm = jest.fn();

    renderHook(() =>
      useTaskActions(
        [],
        setTasks,
        { title: 'New Task', description: 'Description' },
        setTaskForm,
        '',
        jest.fn(),
        'ws1',
        jest.fn(),
        mockCurrentUser,
        '',
        jest.fn()
      )
    ).result.current.handleSaveTask({ preventDefault: () => {} });

    expect(setTasks).toHaveBeenCalled();
  });

  it('handleDeleteTask should remove task', () => {
    const setTasks = jest.fn();

    renderHook(() =>
      useTaskActions(
        [mockTask],
        setTasks,
        {},
        jest.fn(),
        '',
        jest.fn(),
        'ws1',
        jest.fn(),
        mockCurrentUser,
        '',
        jest.fn()
      )
    ).result.current.handleDeleteTask('task1');

    expect(setTasks).toHaveBeenCalledWith(expect.any(Function));
  });

  it('handleAddSubtask should not add empty subtask', () => {
    const setTasks = jest.fn();

    renderHook(() =>
      useTaskActions(
        [mockTask],
        setTasks,
        {},
        jest.fn(),
        '',
        jest.fn(),
        'ws1',
        jest.fn(),
        mockCurrentUser,
        '   ',
        jest.fn()
      )
    ).result.current.handleAddSubtask('task1');

    expect(setTasks).not.toHaveBeenCalled();
  });

  it('handleAddSubtask should add subtask with valid text', () => {
    const setTasks = jest.fn();

    renderHook(() =>
      useTaskActions(
        [mockTask],
        setTasks,
        {},
        jest.fn(),
        '',
        jest.fn(),
        'ws1',
        jest.fn(),
        mockCurrentUser,
        'New subtask',
        jest.fn()
      )
    ).result.current.handleAddSubtask('task1');

    expect(setTasks).toHaveBeenCalled();
  });
});
