import { MemberEntity } from '@/database/entities';
import { RedisClientType } from 'redis';

export async function cacheMembersInfo(
  redisClient: RedisClientType,
  members: MemberEntity[],
) {
  for (const member of members) {
    await redisClient.HSET(`member-info-${member._id}`, 'name', member.name);
    await redisClient.HSET(`member-info-${member._id}`, 'email', member.email);
    await redisClient.HSET(`member-info-${member._id}`, 'image', member.image);
    await redisClient.HSET(
      `member-info-${member._id}`,
      'created_at',
      member.created_at.toString(),
    );
  }
}

export async function cacheMemberFollows(
  redisClient: RedisClientType,
  members: MemberEntity[],
) {
  for (const member of members) {
    await Promise.all(
      member.follow_by.map(async (follow) => {
        await redisClient.SADD(`member-follow-${member._id}`, follow);
      }),
    );
  }
}

export async function cacheMemberRole(
  redisClient: RedisClientType,
  members: MemberEntity[],
) {
  for (const member of members) {
    await redisClient.HSET(
      `member-role-${member._id}`,
      'owner',
      member.role_owner.toString(),
    );
    await redisClient.HSET(
      `member-role-${member._id}`,
      'author',
      member.role_author.toString(),
    );
    await redisClient.HSET(
      `member-role-${member._id}`,
      'comment',
      member.role_comment.toString(),
    );
  }
}
