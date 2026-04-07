import { renderHook } from '@testing-library/react';
import { useWorkspaceActions } from '../useWorkspaceActions';

describe('useWorkspaceActions', () => {
  const mockCurrentUser = { id: 'user1', name: 'Test User' };

  const mockWorkspace = {
    id: 'ws1',
    userId: 'user1',
    title: 'Test Workspace',
    color: 'blue',
    columns: [],
    members: []
  };

  it('should return workspace action functions', () => {
    const { result } = renderHook(() =>
      useWorkspaceActions(
        [],
        jest.fn(),
        '',
        jest.fn(),
        'blue',
        jest.fn(),
        {},
        jest.fn(),
        '',
        jest.fn(),
        jest.fn(),
        jest.fn(),
        mockCurrentUser
      )
    );

    expect(result.current.createWorkspace).toBeDefined();
    expect(result.current.updateWorkspace).toBeDefined();
    expect(result.current.openEditWorkspaceModal).toBeDefined();
  });

  it('createWorkspace should not create with empty title', () => {
    const setWorkspaces = jest.fn();

    renderHook(() =>
      useWorkspaceActions(
        [],
        setWorkspaces,
        '   ',
        jest.fn(),
        'blue',
        jest.fn(),
        {},
        jest.fn(),
        '',
        jest.fn(),
        jest.fn(),
        jest.fn(),
        mockCurrentUser
      )
    ).result.current.createWorkspace({ preventDefault: () => {} });

    expect(setWorkspaces).not.toHaveBeenCalled();
  });

  it('createWorkspace should create new workspace with valid title', () => {
    const setWorkspaces = jest.fn();
    const setNewWorkspaceTitle = jest.fn();
    const setIsNewWorkspaceModalOpen = jest.fn();

    renderHook(() =>
      useWorkspaceActions(
        [],
        setWorkspaces,
        'New Workspace',
        setNewWorkspaceTitle,
        'blue',
        jest.fn(),
        {},
        jest.fn(),
        '',
        setIsNewWorkspaceModalOpen,
        jest.fn(),
        jest.fn(),
        mockCurrentUser
      )
    ).result.current.createWorkspace({ preventDefault: () => {} });

    expect(setWorkspaces).toHaveBeenCalled();
    expect(setNewWorkspaceTitle).toHaveBeenCalledWith('');
    expect(setIsNewWorkspaceModalOpen).toHaveBeenCalledWith(false);
  });

  it('updateWorkspace should update with valid form', () => {
    const setWorkspaces = jest.fn();
    const setIsEditWorkspaceModalOpen = jest.fn();

    renderHook(() =>
      useWorkspaceActions(
        [mockWorkspace],
        setWorkspaces,
        '',
        jest.fn(),
        'blue',
        jest.fn(),
        { id: 'ws1', title: 'Updated', color: 'red', members: [], tags: [] },
        jest.fn(),
        '',
        setIsEditWorkspaceModalOpen,
        jest.fn(),
        jest.fn(),
        mockCurrentUser
      )
    ).result.current.updateWorkspace({ preventDefault: () => {} });

    expect(setWorkspaces).toHaveBeenCalledWith(expect.any(Function));
  });

  it('openEditWorkspaceModal should populate form and open modal', () => {
    const setEditingWorkspaceForm = jest.fn();
    const setIsEditWorkspaceModalOpen = jest.fn();

    renderHook(() =>
      useWorkspaceActions(
        [mockWorkspace],
        jest.fn(),
        '',
        jest.fn(),
        'blue',
        jest.fn(),
        {},
        setEditingWorkspaceForm,
        '',
        setIsEditWorkspaceModalOpen,
        jest.fn(),
        jest.fn(),
        mockCurrentUser
      )
    ).result.current.openEditWorkspaceModal(mockWorkspace);

    expect(setEditingWorkspaceForm).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockWorkspace.id, title: mockWorkspace.title })
    );
    expect(setIsEditWorkspaceModalOpen).toHaveBeenCalledWith(true);
  });

  it('requestDeleteWorkspace should set delete confirmation', () => {
    const setDeleteConfirmation = jest.fn();
    const setIsEditWorkspaceModalOpen = jest.fn();

    renderHook(() =>
      useWorkspaceActions(
        [mockWorkspace],
        jest.fn(),
        '',
        jest.fn(),
        'blue',
        jest.fn(),
        { id: 'ws1' },
        jest.fn(),
        '',
        setIsEditWorkspaceModalOpen,
        setDeleteConfirmation,
        jest.fn(),
        mockCurrentUser
      )
    ).result.current.requestDeleteWorkspace();

    expect(setDeleteConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'workspace',
        id: 'ws1'
      })
    );
  });
});
