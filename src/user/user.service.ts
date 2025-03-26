import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseService } from 'src/common/firebase.module';

@Injectable()
export class UserService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebase: FirebaseService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { userId, ...data } = createUserDto;
    return this.firebase.firestore.collection('users').doc(userId).set(data);
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
