import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notifikasi } from '../../entities/notifikasi.entity';

@Injectable()
export class NotifikasiService {
  constructor(
    @InjectRepository(Notifikasi)
    private readonly notifikasiRepository: Repository<Notifikasi>,
  ) {}

  async getNotifikasiForUser(userId?: number, roleKode?: string) {
    const qb = this.notifikasiRepository.createQueryBuilder('n');

    if (userId && roleKode) {
      qb.where('(n.user_id = :userId OR n.role_kode = :roleKode OR (n.user_id IS NULL AND n.role_kode IS NULL))', {
        userId,
        roleKode,
      });
    } else if (userId) {
      qb.where('(n.user_id = :userId OR n.user_id IS NULL)', { userId });
    } else if (roleKode) {
      qb.where('(n.role_kode = :roleKode OR n.role_kode IS NULL)', { roleKode });
    }

    qb.orderBy('n.created_at', 'DESC').take(50);

    const data = await qb.getMany();
    const unreadCount = data.filter((item) => !item.dibaca).length;

    return {
      data,
      unread_count: unreadCount,
    };
  }

  async markAsRead(id: number) {
    const notif = await this.notifikasiRepository.findOne({ where: { id } });
    if (!notif) {
      throw new NotFoundException(`Notifikasi #${id} tidak ditemukan`);
    }
    notif.dibaca = true;
    return this.notifikasiRepository.save(notif);
  }

  async markAllAsRead(userId?: number, roleKode?: string) {
    const qb = this.notifikasiRepository.createQueryBuilder()
      .update(Notifikasi)
      .set({ dibaca: true })
      .where('dibaca = false');

    if (userId && roleKode) {
      qb.andWhere('(user_id = :userId OR role_kode = :roleKode OR (user_id IS NULL AND role_kode IS NULL))', {
        userId,
        roleKode,
      });
    } else if (userId) {
      qb.andWhere('(user_id = :userId OR user_id IS NULL)', { userId });
    } else if (roleKode) {
      qb.andWhere('(role_kode = :roleKode OR role_kode IS NULL)', { roleKode });
    }

    await qb.execute();
    return { success: true, message: 'Semua notifikasi ditandai telah dibaca' };
  }

  async createNotification(notif: Partial<Notifikasi>) {
    const entity = this.notifikasiRepository.create(notif);
    return this.notifikasiRepository.save(entity);
  }
}
