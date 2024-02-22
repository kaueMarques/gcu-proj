class DownloaderJSONDataBase {
    async init() {
        try {
            const bookData = await this.fetchData('https://kauemarques.github.io/biblia_ara/book.json');
            const verseData = await this.fetchData('https://kauemarques.github.io/biblia_ara/verse.json');
            await this.saveData('bookData', bookData);
            await this.saveData('verseData', verseData);
            console.log('JSON data saved successfully!');
        } catch (error) {
            console.error('Error initializing JSON database:', error);
        }
    }

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    async saveData(key, data) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('jsonDataDatabase', 1);
            request.onerror = event => reject('Database error:', event.target.error);
            request.onupgradeneeded = event => {
                const db = event.target.result;
                const store = db.createObjectStore(key, { autoIncrement: true });
                store.transaction.oncomplete = () => resolve();
            };
            request.onsuccess = event => {
                const db = event.target.result;
                const transaction = db.transaction(key, 'readwrite');
                const store = transaction.objectStore(key);
    
                // Converter o objeto para uma string JSON antes de adicionar ao armazenamento
                const jsonData = JSON.stringify(data);
                const addRequest = store.add(jsonData);
                
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = event => reject('Error adding data:', event.target.error);
            };
        });
    }
    
    

    async getDataByKey(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('jsonDataDatabase', 1);
            request.onsuccess = event => {
                const db = event.target.result;
                const transaction = db.transaction(key, 'readonly');
                const store = transaction.objectStore(key);
                const getData = store.getAll();
                getData.onsuccess = () => resolve(getData.result);
            };
            request.onerror = event => reject('Error opening database:', event.target.error);
        });
    }
}

export default DownloaderJSONDataBase;
