import DownloaderBibleDataBase from './DownloaderBibleDataBase.js';

class BibleApp {
    constructor() {
        this.bibleDB = new DownloaderBibleDataBase(
            'https://kauemarques.github.io/biblia_ara/book.json',
            'https://kauemarques.github.io/biblia_ara/verse.json'
        );
    }

    async init() {
        try {
            await this.bibleDB.init();
            console.log('Database initialized successfully!');
            // Chama o método searchVerse automaticamente ao abrir o aplicativo
            await this.searchVerse(1, 1, 1); // Busca Gênesis 1:1
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    async searchVerse(bookId, chapter, verseNumber) {
        try {
            const verse = await this.bibleDB.getVerse(bookId, chapter, verseNumber);
            console.log('Verse found:', verse);
        } catch (error) {
            console.error('Error searching for verse:', error);
        }
    }

    async findVerseById(bookId, chapter, verseNumber) {
        try {
            const verse = await this.bibleDB.findVerseById(bookId, chapter, verseNumber);
            console.log('Verse found:', verse);
        } catch (error) {
            console.error('Error finding verse:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new BibleApp();
    await app.init();
});
