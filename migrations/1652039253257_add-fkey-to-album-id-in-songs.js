exports.up = (pgm) => {
    pgm.addConstraint('songs', 'fkey_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropConstraint('songs', 'fkey_songs.album_id_albums.id');
};