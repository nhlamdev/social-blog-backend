import { Injectable } from '@nestjs/common';
import { SeriesRepository } from './series.repository';

@Injectable()
export class SeriesService extends SeriesRepository {}
