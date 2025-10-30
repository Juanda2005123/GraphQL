import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Property } from '../properties/property.model';
import { User } from '../users/user.model';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => Property, (property) => property.tasks, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => User, (user) => user.tasks)
  assignedTo: User;

  @Column({ default: false })
  isDeleted: boolean; // Soft delete flag

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
