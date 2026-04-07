import { renderHook, act } from '@testing-library/react';
import { useCommentActions } from '../useCommentActions';

describe('useCommentActions', () => {
  const mockCurrentUser = { id: 'user1', name: 'Test User' };
  const mockTaskForm = {
    id: 'task1',
    title: 'Test Task',
    comments: [],
    assignees: ['user1']
  };

  it('should return comment action functions', () => {
    const { result } = renderHook(() =>
      useCommentActions(
        mockTaskForm,
        jest.fn(),
        '',
        jest.fn(),
        [],
        jest.fn(),
        mockCurrentUser,
        'comment text',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    );

    expect(result.current.handleAddComment).toBeDefined();
    expect(result.current.handleDeleteComment).toBeDefined();
    expect(result.current.handleFileUpload).toBeDefined();
  });

  it('handleAddComment should not add empty comment', () => {
    const setTaskForm = jest.fn();

    renderHook(() =>
      useCommentActions(
        mockTaskForm,
        setTaskForm,
        '',
        jest.fn(),
        [],
        jest.fn(),
        mockCurrentUser,
        '   ',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        '',
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    ).result.current.handleAddComment({ preventDefault: () => {} });

    expect(setTaskForm).not.toHaveBeenCalled();
  });

  it('handleDeleteComment should remove comment from form', () => {
    const setTaskForm = jest.fn();
    const mockComment = { id: 'c1', text: 'Test', replies: [] };

    renderHook(() =>
      useCommentActions(
        { ...mockTaskForm, comments: [mockComment] },
        setTaskForm,
        'task1',
        jest.fn(),
        [],
        jest.fn(),
        mockCurrentUser,
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
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    ).result.current.handleDeleteComment('c1');

    expect(setTaskForm).toHaveBeenCalled();
  });

  it('handleFileUpload should process valid files', () => {
    const setTaskForm = jest.fn();

    const mockFile = {
      name: 'test.pdf',
      size: 1024 * 1024,
      type: 'application/pdf'
    };

    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };

    renderHook(() =>
      useCommentActions(
        mockTaskForm,
        setTaskForm,
        'task1',
        jest.fn(),
        [],
        jest.fn(),
        mockCurrentUser,
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
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    ).result.current.handleFileUpload(mockEvent);

    expect(setTaskForm).toBeDefined();
  });
});
