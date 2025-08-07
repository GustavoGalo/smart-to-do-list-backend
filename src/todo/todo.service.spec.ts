import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ErrorMessages } from '../constants/error-messages';

jest.mock('groq-sdk', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: '- Tarefa 1\n- Tarefa 2\n- Tarefa 3'
                  }
                }
              ]
            })
          }
        }
      };
    })
  };
});

describe('TodoService', () => {
  let service: TodoService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    todo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createMany: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return all todos', async () => {
      const mockTodos = [
        { id: '1', title: 'Todo 1', isCompleted: false, createdAt: new Date() },
        { id: '2', title: 'Todo 2', isCompleted: true, createdAt: new Date() }
      ];
      mockPrismaService.todo.findMany.mockResolvedValue(mockTodos);

      const result = await service.list();

      expect(result).toEqual(mockTodos);
      expect(mockPrismaService.todo.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const title = 'New Todo';
      const mockTodo = { id: '1', title, isCompleted: false, createdAt: new Date() };
      mockPrismaService.todo.create.mockResolvedValue(mockTodo);

      const result = await service.create(title);

      expect(result).toEqual(mockTodo);
      expect(mockPrismaService.todo.create).toHaveBeenCalledWith({ data: { title } });
    });
  });

  describe('update', () => {
    it('should update a todo if it exists', async () => {
      const id = '1';
      const updateData = { title: 'Updated Todo', isCompleted: true };
      const mockTodo = { id, ...updateData, createdAt: new Date() };

      mockPrismaService.todo.findUnique.mockResolvedValue({ id, title: 'Old Title', isCompleted: false, createdAt: new Date() });
      mockPrismaService.todo.update.mockResolvedValue(mockTodo);

      const result = await service.update(id, updateData);

      expect(result).toEqual(mockTodo);
      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({ where: { id }, data: updateData });
    });

    it('should throw NotFoundException if todo does not exist', async () => {
      const id = 'non-existent-id';
      const updateData = { title: 'Updated Todo', isCompleted: true };

      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.update(id, updateData)).rejects.toThrow(
        new NotFoundException(ErrorMessages.TODO_NOT_FOUND)
      );
      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(mockPrismaService.todo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a todo if it exists', async () => {
      const id = '1';
      const mockTodo = { id, title: 'Todo to delete', isCompleted: false, createdAt: new Date() };

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.delete.mockResolvedValue(mockTodo);

      const result = await service.delete(id);

      expect(result).toEqual(mockTodo);
      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(mockPrismaService.todo.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException if todo does not exist', async () => {
      const id = 'non-existent-id';

      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.delete(id)).rejects.toThrow(
        new NotFoundException(ErrorMessages.TODO_NOT_FOUND)
      );
      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(mockPrismaService.todo.delete).not.toHaveBeenCalled();
    });
  });

  describe('generate', () => {
    it('should generate todos from AI response', async () => {
      const goal = 'Criar uma lista de tarefas para um projeto';
      const expectedTodos = ['Tarefa 1', 'Tarefa 2', 'Tarefa 3'];
      const mockResult = { count: 3 };

      mockPrismaService.todo.createMany.mockResolvedValue(mockResult);

      const result = await service.generate(goal);

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.todo.createMany).toHaveBeenCalledWith({
        data: expectedTodos.map(title => ({ title }))
      });
    });
  });
});
