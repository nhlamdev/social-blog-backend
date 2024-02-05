import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeriesEntity } from './series.entity';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    public readonly repository: Repository<SeriesEntity>,
  ) {}
}
