const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbumLikes(userId, albumId) {
        const id = `user_album_likes-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menyukai Album');
        }
        await this._cacheService.delete(`openmusic:album-likes:${albumId}`);
        return 'Berhasil menyukai album';
    }

    async deleteAlbumLikes(userId, albumId) {
        const result = await this._pool.query({
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Gagal untuk batal menyukai Album');
        }
        await this._cacheService.delete(`openmusic:album-likes:${albumId}`);
        return 'Berhasil batal menyukai Album';
    }

    async albumAlreadyLiked(userId, albumId) {
        const result = await this._pool.query({
            text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        });
        return result.rows.length;
    }

    async getAlbumLikesByAlbumId(albumId) {
        try {
            const result = await this._cacheService.get(`openmusic:album-likes:${albumId}`);
            return {
                dataSource: 'cache',
                likes: JSON.parse(result),
            };
        } catch (error) {
            const result = await this._pool.query({
                text: 'SELECT COUNT(id) AS jumlah FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            });
            const jumlah = parseInt(result.rows[0].jumlah, 10);
            await this._cacheService.set(
                `openmusic:album-likes:${albumId}`,
                JSON.stringify(jumlah),
            );
            return {
                dataSource: 'database',
                likes: jumlah,
            };
        }
    }
}

module.exports = AlbumLikesService;