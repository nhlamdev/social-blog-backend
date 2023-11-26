import { QUEUE_NOTIFY } from '@/constants/queue';
import { MemberEntity, NotifyEntity } from '@/entities';
import { IQueueContentNotify } from '@/interface/queue.intereface';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';

@Processor(QUEUE_NOTIFY)
export class NotifyConsumer {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(NotifyEntity)
    private notifyRepository: Repository<NotifyEntity>,
  ) {}

  @Process('notify-action')
  async saveNotify(job: Job<IQueueContentNotify>) {
    const { data } = job;

    const notify = new NotifyEntity();
    notify.content = data.content;
    notify.body = data.title;
    notify.to = data.to;
    notify.from = data.from;
    notify.type = data.type;

    console.log('created content');

    try {
      await this.notifyRepository.save(notify);
    } catch (error) {
      console.log('notify queue error');
    }
  }
}
