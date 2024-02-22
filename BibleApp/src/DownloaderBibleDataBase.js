export default class DownloaderBibleDataBase {
    constructor(bookUrl, verseUrl) {
        this.bookUrl = bookUrl;
        this.verseUrl = verseUrl;
    }

    async init() {
        try {
            const bookData = await this.fetchData(this.bookUrl);
            const verseData = await this.fetchData(this.verseUrl);
            await this.setupDatabase(bookData, verseData);
        } catch (error) {
            console.error('There was a problem initializing the database:', error);
        }
    }

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    async setupDatabase(bookData, verseData) {
        const db = await this.openDatabase();

        await this.createStores(db);
        await this.addBooks(db, bookData);
        await this.addVerses(db, verseData);

        db.close();
    }

    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('bibliaDatabase', 1);
            request.onerror = event => reject('Database error:', event.target.error);
            request.onupgradeneeded = event => this.handleUpgrade(event);
            request.onsuccess = event => resolve(event.target.result);
        });
    }

    handleUpgrade(event) {
        const db = event.target.result;
        const bookStore = db.createObjectStore('bookData', { keyPath: 'id' });
        const verseStore = db.createObjectStore('verseData', { autoIncrement: true });
        verseStore.createIndex('book_id', 'book_id', { unique: false });
        verseStore.createIndex('chapter', 'chapter', { unique: false });
        verseStore.createIndex('verse', 'verse', { unique: false });

        if (!verseStore.indexNames.contains('book_id_index')) {
            verseStore.createIndex('book_id_index', 'book_id', { unique: false });
        }
    }

    async createStores(db) {
        return new Promise((resolve, reject) => {
            db.onversionchange = () => db.close();
            db.onerror = event => reject('Database error:', event.target.error);
            db.transaction(['bookData', 'verseData'], 'readwrite').oncomplete = () => resolve();
        });
    }

    async addBooks(db, bookData) {
        const transaction = db.transaction(['bookData'], 'readwrite');
        const bookStore = transaction.objectStore('bookData');
        for (const book of bookData.book) {
            await this.addUniqueItem(bookStore, book);
        }
    }

    async addVerses(db, verseData) {
        const transaction = db.transaction(['verseData'], 'readwrite');
        const verseStore = transaction.objectStore('verseData');
        for (const verse of verseData.verse) {
            await this.addUniqueItem(verseStore, verse);
        }
    }

    async addUniqueItem(store, item) {
        return new Promise((resolve, reject) => {
            const request = store.get(item.id);
            request.onsuccess = event => {
                const existingItem = event.target.result;
                if (!existingItem) {
                    store.add(item).onsuccess = () => resolve();
                } else {
                    resolve();
                }
            };
            request.onerror = event => reject('Error adding item:', event.target.error);
        });
    }

    async getVersesByBookAndChapter(bookName, chapterNumber) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('bibliaDatabase', 1);
            request.onsuccess = event => {
                const db = event.target.result;
                const transaction = db.transaction('verseData', 'readonly');
                const verseStore = transaction.objectStore('verseData');
                const index = verseStore.index('book_id');
                const range = IDBKeyRange.only(`${bookName}-${chapterNumber}`);
                const request = index.openCursor(range);
                const verses = [];
                request.onsuccess = event => {
                    const cursor = event.target.result;
                    if (cursor) {
                        verses.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(verses);
                    }
                };
                request.onerror = event => reject('Error retrieving verses:', event.target.error);
            };
            request.onerror = event => reject('Error opening database:', event.target.error);
        });
    }
}
