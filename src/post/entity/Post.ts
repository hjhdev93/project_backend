import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Photo } from './Photo';
import { Record } from './Record';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: '' })
  username: string;

  @Column({})
  title: string;

  @Column({})
  description: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn({ select: false })
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => Photo, (photo) => photo.post, { cascade: true })
  photos: Photo[];

  @OneToOne(() => Record, (record) => record.post, { cascade: true })
  record: Record;
}
