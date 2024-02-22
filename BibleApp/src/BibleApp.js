import DownloaderJSONDataBase from './DownloaderJSONDataBase.js';

class BibleApp {
    constructor() {
        this.jsonDB = new DownloaderJSONDataBase();
    }

    async init() {
        try {
            await this.jsonDB.init();
            console.log('JSON database initialized successfully!');
        } catch (error) {
            console.error('Error initializing JSON database:', error);
        }
    }

    async searchVerse(bookId, chapter, verseNumber) {
        try {
            const verseData = await this.jsonDB.getDataByKey('verseData');
            const verse = verseData.find(item => item.book_id === bookId && item.chapter === chapter && item.verse === verseNumber);
            console.log('Verse found:', verse);
        } catch (error) {
            console.error('Error searching for verse:', error);
        }
    }

    async getTextsByBookAndChapter(bookId, chapter) {
        try {
            const verseData = await this.jsonDB.getDataByKey('verseData');
            const texts = verseData.filter(item => item.book_id === bookId && item.chapter === chapter);
            console.log('Texts found:', texts);
        } catch (error) {
            console.error('Error getting texts:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new BibleApp();
    await app.init();
    // Exemplo de uso
    await app.searchVerse(1, 1, 1); // Busca Gênesis 1:1
    await app.getTextsByBookAndChapter(1, 1); // Busca todos os textos de Gênesis 1
});
