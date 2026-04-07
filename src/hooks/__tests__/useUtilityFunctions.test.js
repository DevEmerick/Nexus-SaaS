import { renderHook } from '@testing-library/react';
import { useUtilityFunctions } from '../useUtilityFunctions';

describe('useUtilityFunctions', () => {
  const mockTasks = [
    {
      id: 'task1',
      title: 'Task 1',
      completed: true,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      history: [
        { action: 'Created', timestamp: new Date().toISOString() },
        { action: 'Updated', timestamp: new Date().toISOString() }
      ]
    },
    {
      id: 'task2',
      title: 'Task 2',
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      history: [
        { action: 'Created', timestamp: new Date().toISOString() }
      ]
    }
  ];

  const mockUsers = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  it('should return utility functions', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    expect(result.current).toHaveProperty('reverseHistory');
    expect(result.current).toHaveProperty('getUserDetails');
    expect(result.current).toHaveProperty('calculateDashboardMetrics');
  });

  it('reverseHistory should reverse history array', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    const history = mockTasks[0].history;
    const reversed = result.current.reverseHistory(history);

    expect(reversed).toEqual([...history].reverse());
  });

  it('reverseHistory should handle empty array', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    const reversed = result.current.reverseHistory([]);
    expect(reversed).toEqual([]);
  });

  it('getUserDetails should return user by ID', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    const user = result.current.getUserDetails('user1');
    expect(user).toEqual(mockUsers[0]);
  });

  it('getUserDetails should return placeholder for unknown user', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    const user = result.current.getUserDetails('unknown');
    expect(user).toHaveProperty('name', 'Unknown User');
  });

  it('calculateDashboardMetrics should compute correct statistics', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    const metrics = result.current.calculateDashboardMetrics(mockTasks);

    expect(metrics).toHaveProperty('totalTasks', 2);
    expect(metrics).toHaveProperty('completedTasks', 1);
    expect(metrics).toHaveProperty('completionRate', 50);
  });

  it('calculateDashboardMetrics should handle empty tasks', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions([], mockUsers)
    );

    const metrics = result.current.calculateDashboardMetrics([]);

    expect(metrics).toHaveProperty('totalTasks', 0);
    expect(metrics).toHaveProperty('completedTasks', 0);
    expect(metrics).toHaveProperty('completionRate', 0);
  });

  it('calculateDashboardMetrics should identify overdue tasks', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    const metrics = result.current.calculateDashboardMetrics(mockTasks);

    expect(metrics).toHaveProperty('overdueTasks');
    expect(typeof metrics.overdueTasks).toBe('number');
    expect(metrics.overdueTasks).toBeGreaterThanOrEqual(0);
  });

  it('calculateDashboardMetrics should calculate distribution by priority', () => {
    const { result } = renderHook(() =>
      useUtilityFunctions(mockTasks, mockUsers)
    );

    const metrics = result.current.calculateDashboardMetrics(mockTasks);

    expect(metrics).toHaveProperty('distribution');
    expect(typeof metrics.distribution).toBe('object');
  });
});
