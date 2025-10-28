import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.model';
import { Task } from '../tasks/task.model';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  location: string;

  @Column()
  bedrooms: number;

  @Column()
  bathrooms: number;

  @Column()
  area: number;

  @Column('text', { array: true, default: '{}' })
  imageUrls: string[];

  @ManyToOne(() => User, (user) => user.properties)
  owner: User;

  @OneToMany(() => Task, (task) => task.property, { cascade: ['remove'] })
  tasks: Task[];

  @Column({ default: false })
  isDeleted: boolean; // Soft delete

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
