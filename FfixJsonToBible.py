import json

class FixJsonToBible:
    
    new_file_name:str = 'bible_ara.json'
    new_bible_json = {}
    read_files = {}
    file_paths = {}


    def load_file(self, path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
        

    def create_dict_data(self):
        for filename, path in self.file_paths.items():
            file_content = self.load_file(path)
            self.read_files[filename] = self.clean_data(file_content)
        

    def clean_data(self, text_to_clean:str):
        return text_to_clean.replace('\\n', '').replace('\\t','')

          
    def organize_chapter(self):
        new_book = {}

        book_data = self.read_files.get('book')
        books_json = json.loads(book_data)['book']

        verse_data = self.read_files.get('verse')
        verse_json = json.loads(verse_data)['verse']

        for verse in verse_json:
            book_id = verse['book_id']
            book_name = next((book['name'] for book in books_json if book['book_reference_id'] == book_id), None)
            if book_name:
                chapter = verse['chapter']
                if book_name not in new_book:
                    new_book[book_name] = {}
                if chapter not in new_book[book_name]:
                    new_book[book_name][chapter] = {}
                new_book[book_name][chapter][str(verse['verse'])] = {'text': verse['text']}

        with open(self.new_file_name, 'w', encoding='utf-8') as outfile:
            json.dump(new_book, outfile, ensure_ascii=False, indent=4)

    
    def __init__(self, file_paths: dict):
        self.file_paths = file_paths
        self.create_dict_data()
        self.organize_chapter()
        

if __name__ == '__main__':
    
    file_paths = {
        'book': 'C:\\_dev\\gcu-proj\\BibleApp\\biblia_ara\\book.json',
        'verse': 'C:\\_dev\\gcu-proj\\BibleApp\\biblia_ara\\verse.json'
    }
    
    FixJsonToBible(file_paths)
