import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Record {
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

  @OneToOne(() => Post, (post) => post.record, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;
}
