import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  fileUrl: string;

  @Column({ unique: true, nullable: false })
  key: string;

  @CreateDateColumn({ select: false })
  createdDate: Date;

  @UpdateDateColumn({ select: false })
  updatedDate: Date;

  @ManyToOne(() => Post, (post) => post.photos, { onDelete: 'CASCADE' })
  post: Post;
}
