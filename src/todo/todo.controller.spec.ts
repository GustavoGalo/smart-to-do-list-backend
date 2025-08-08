import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo-dto';
import { UpdateTodoDto } from './dto/update-todo-dto';
import { GenerateTodoDto } from './dto/generate-todo-dto';
import { NotFoundException } from '@nestjs/common';
import { ErrorMessages } from '../constants/error-messages';

describe('TodoController', () => {
  let controller: TodoController;
  let todoService: TodoService;

  // Mock para o TodoService
  const mockTodoService = {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    generate: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService
        }
      ]
    }).compile();

    controller = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTodos', () => {
    it('should call todoService.list method', async () => {
      const mockResult = {
        todos: [],
        metadata: {
          countTodos: 0,
          countCompletedTodos: 0,
          countPendingTodos: 0
        }
      };
      mockTodoService.list.mockResolvedValue(mockResult);
      const result = await controller.getTodos();
      expect(todoService.list).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('createTodo', () => {
    it('should call todoService.create with the correct DTO', async () => {
      const createTodoDto: CreateTodoDto = { title: 'New Todo' };
      mockTodoService.create.mockResolvedValue({});

      await controller.createTodo(createTodoDto);

      expect(todoService.create).toHaveBeenCalledWith(createTodoDto);
    });

    it('should pass through any errors from the service', async () => {
      const createTodoDto: CreateTodoDto = { title: 'New Todo' };
      const error = new Error('Database error');
      mockTodoService.create.mockRejectedValue(error);

      await expect(controller.createTodo(createTodoDto)).rejects.toThrow(error);
    });
  });

  describe('updateTodo', () => {
    it('should call todoService.update with the correct id and DTO', async () => {
      const id = '1';
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo', isCompleted: true };
      mockTodoService.update.mockResolvedValue({});

      await controller.updateTodo(id, updateTodoDto);

      expect(todoService.update).toHaveBeenCalledWith(id, updateTodoDto);
    });

    it('should pass through NotFoundException from the service', async () => {
      const id = 'non-existent-id';
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Todo' };
      const notFoundError = new NotFoundException(ErrorMessages.TODO_NOT_FOUND);
      mockTodoService.update.mockRejectedValue(notFoundError);

      await expect(controller.updateTodo(id, updateTodoDto)).rejects.toThrow(NotFoundException);
      await expect(controller.updateTodo(id, updateTodoDto)).rejects.toThrow(ErrorMessages.TODO_NOT_FOUND);
    });
  });

  describe('deleteTodo', () => {
    it('should call todoService.delete with the correct id', async () => {
      const id = '1';
      mockTodoService.delete.mockResolvedValue({});

      await controller.deleteTodo(id);

      expect(todoService.delete).toHaveBeenCalledWith(id);
    });

    it('should pass through NotFoundException from the service', async () => {
      const id = 'non-existent-id';
      const notFoundError = new NotFoundException(ErrorMessages.TODO_NOT_FOUND);
      mockTodoService.delete.mockRejectedValue(notFoundError);

      await expect(controller.deleteTodo(id)).rejects.toThrow(NotFoundException);
      await expect(controller.deleteTodo(id)).rejects.toThrow(ErrorMessages.TODO_NOT_FOUND);
    });
  });

  describe('generate', () => {
    it('should call todoService.generate with the goal from DTO', async () => {
      const generateTodoDto: GenerateTodoDto = { goal: 'Criar uma lista de tarefas para um projeto' };
      mockTodoService.generate.mockResolvedValue({ count: 3 });

      await controller.generate(generateTodoDto);

      expect(todoService.generate).toHaveBeenCalledWith(generateTodoDto.goal);
    });

    it('should handle errors from the Groq API', async () => {
      const generateTodoDto: GenerateTodoDto = { goal: 'Criar uma lista de tarefas' };
      const error = new Error('API Error');
      mockTodoService.generate.mockRejectedValue(error);

      await expect(controller.generate(generateTodoDto)).rejects.toThrow(error);
    });
  });
});
