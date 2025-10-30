import { Task } from './task.model';
import { Property } from '../properties/property.model';
import { User } from '../users/user.model';

describe('Task Model', () => {
  it('should create a task instance', () => {
    const task = new Task();
    expect(task).toBeDefined();
  });

  it('should accept valid task properties', () => {
    const task = new Task();
    task.id = 'task-id';
    task.title = 'Test Task';
    task.description = 'Task description';
    task.isCompleted = false;
    task.isDeleted = false;

    expect(task.id).toBe('task-id');
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('Task description');
    expect(task.isCompleted).toBe(false);
    expect(task.isDeleted).toBe(false);
  });

  it('should have relationship with Property', () => {
    const task = new Task();
    const property = new Property();
    property.id = 'prop-id';
    task.property = property;

    expect(task.property).toBeDefined();
    expect(task.property.id).toBe('prop-id');
  });

  it('should have relationship with User (assignedTo)', () => {
    const task = new Task();
    const user = new User();
    user.id = 'user-id';
    task.assignedTo = user;

    expect(task.assignedTo).toBeDefined();
    expect(task.assignedTo.id).toBe('user-id');
  });

  it('should have default values', () => {
    const task = new Task();
    expect(task.isCompleted).toBeFalsy();
    expect(task.isDeleted).toBeFalsy();
  });

  it('should mark task as completed', () => {
    const task = new Task();
    task.isCompleted = true;
    expect(task.isCompleted).toBe(true);
  });
});

