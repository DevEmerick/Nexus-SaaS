import { renderHook, act } from '@testing-library/react';
import { useBoardActions } from '../useBoardActions';

describe('useBoardActions', () => {
  const mockWorkspace = {
    id: 'ws1',
    columns: [
      { id: 'col1', title: 'To Do', color: 'blue', position: 0 }
    ]
  };

  const mockTask = { id: 'task1', status: 'col1', title: 'Test Task' };

  it('should return board action functions', () => {
    const { result } = renderHook(() =>
      useBoardActions(
        [mockWorkspace],
        jest.fn(),
        [mockTask],
        jest.fn(),
        mockWorkspace,
        true,
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        [],
        jest.fn(),
        [],
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    );

    expect(result.current.handleDragStart).toBeDefined();
    expect(result.current.handleDragEnd).toBeDefined();
    expect(result.current.toggleTagFilter).toBeDefined();
  });

  it('handleDragStart should update dragged state', () => {
    const setDraggedTaskId = jest.fn();

    renderHook(() =>
      useBoardActions(
        [mockWorkspace],
        jest.fn(),
        [mockTask],
        jest.fn(),
        mockWorkspace,
        true,
        '',
        setDraggedTaskId,
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        [],
        jest.fn(),
        [],
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    ).result.current.handleDragStart(
      {
        stopPropagation: jest.fn(),
        dataTransfer: { effectAllowed: '' },
        currentTarget: { classList: { add: jest.fn() }, style: {} }
      },
      'task1'
    );

    expect(setDraggedTaskId).toHaveBeenCalledWith('task1');
  });

  it('handleDragEnd should clear dragged state', () => {
    const setDraggedTaskId = jest.fn();

    renderHook(() =>
      useBoardActions(
        [mockWorkspace],
        jest.fn(),
        [mockTask],
        jest.fn(),
        mockWorkspace,
        true,
        'task1',
        setDraggedTaskId,
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        [],
        jest.fn(),
        [],
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    ).result.current.handleDragEnd({
      currentTarget: {
        classList: { remove: jest.fn() },
        style: {}
      }
    });

    expect(setDraggedTaskId).toHaveBeenCalledWith(null);
  });

  it('toggleTagFilter should manage selected tags', () => {
    const setSelectedTags = jest.fn();

    renderHook(() =>
      useBoardActions(
        [mockWorkspace],
        jest.fn(),
        [mockTask],
        jest.fn(),
        mockWorkspace,
        true,
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        ['tag1'],
        setSelectedTags,
        [],
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    ).result.current.toggleTagFilter('tag1');

    expect(setSelectedTags).toHaveBeenCalled();
  });
});
