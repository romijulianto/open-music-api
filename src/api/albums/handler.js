/* eslint-disable eol-last */
const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
    constructor(service, validator) {
        const { albumsService, songsService } = service;
        this._service = albumsService;
        this._songsService = songsService;
        this._validator = validator;
        autoBind(this);
    }

    async postAlbumHandler({ payload }, h) {
        try {
            this._validator.validateAlbumPayload(payload);
            const albumId = await this._service.addAlbums(payload);
            const response = h.response({
                status: 'success',
                message: 'Album Berhasil di tambahkan',
                data: {
                    albumId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'Error',
                message: 'Maaf, terjadi kegagalan pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const album = await this._service.getAlbumById(id);
            try {
                const songs = await this._songsService.getSongsByAlbumId(id);
                album.songs = songs;
            } catch (error) { /* do nothing */ }
            return {
                status: 'success',
                data: {
                    album,
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'Error',
                message: 'Maaf, terjadi kegagaln pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async putAlbumByIdHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;
            await this._service.editAlbumById(id, request.payload);
            return {
                status: 'success',
                message: 'Album Berhasil diperbarui',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'Error',
                message: 'Maaf, terjadi kegagal pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteAlbumById(id);
            return {
                status: 'success',
                message: 'Album Berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'fail',
                message: 'Maaf, terjadi kegagalan pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
}

module.exports = AlbumsHandler;