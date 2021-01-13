import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../common/base-entity';



@Entity('user-settings')
export class UserSettings extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;




}
