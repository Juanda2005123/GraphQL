import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { PropertyService } from '../properties/property.service';
import { TaskService } from '../tasks/task.service';
import { UserRole } from 'src/users/user.model';

@Injectable()
export class SeedService {
  constructor(
    private userService: UserService,
    private propertyService: PropertyService,
    private taskService: TaskService,
  ) {}

  async runSeed() {
    await this.seedUsers();
    await this.seedProperties();
    await this.seedTasks();
  }

  private async seedUsers() {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin1234',
        role: UserRole.SUPERADMIN,
      },
      {
        name: 'Agent User',
        email: 'agent@example.com',
        password: 'agent1234',
        role: UserRole.AGENT,
      },
    ];
    for (const user of users) {
      const exists = await this.userService.findByEmail(user.email);
      if (!exists) {
        await this.userService.create(user);
      }
    }
  }

  private async seedProperties() {
    const admin = await this.userService.findByEmail('admin@example.com');
    if (!admin) return;
    const properties = [
      {
        title: 'Property One',
        description: 'Nice property 1',
        price: 100000,
        location: 'City Center',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [],
        owner: admin.id,
      },
      // Agrega más propiedades si quieres
    ];
    for (const prop of properties) {
      await this.propertyService.create(prop);
    }
  }

  private async seedTasks() {
    const agent = await this.userService.findByEmail('agent@example.com');
    const prop = await this.propertyService.findAll();
    if (!agent || prop.length === 0) return;
    const tasks = [
      {
        title: 'Inspect property',
        description: 'Inspect Property One',
        isCompleted: false,
        property: prop[0].id,
        assignedTo: agent,
      },
      // Más tareas si quieres
    ];
    for (const task of tasks) {
      await this.taskService.create(task);
    }
  }
}
