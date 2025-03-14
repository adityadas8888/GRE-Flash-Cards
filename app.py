import json
import os
import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)
JSON_FILE = 'gre_words.json'

def load_words():
    """
    Load words from the JSON file and ensure each has 'correct' and 'wrong' keys,
    defaulting to 0 if missing. If any changes are made, save them back immediately.
    """
    if not os.path.exists(JSON_FILE):
        return []
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        words = json.load(f)

    changed = False
    for w in words:
        if 'correct' not in w:
            w['correct'] = 0
            changed = True
        if 'wrong' not in w:
            w['wrong'] = 0
            changed = True

    if changed:
        save_words(words)

    return words

def save_words(words):
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/words', methods=['GET'])
def get_words():
    """
    Return words in a weighted manner, so words with higher (wrong - correct)
    appear more often in the deck.
    """
    words = load_words()

    weighted_pool = []
    for w in words:
        # Weighted approach:
        # times = max(1, (wrong - correct) + 1)
        wrong = w.get('wrong', 0)
        correct = w.get('correct', 0)
        times = max(1, wrong - correct + 1)

        # Add this word 'times' times to the pool
        for _ in range(times):
            weighted_pool.append(w)

    # Shuffle the weighted pool
    random.shuffle(weighted_pool)
    return jsonify(weighted_pool)

@app.route('/api/update', methods=['POST'])
def update_word():
    """
    Increment the 'correct' or 'wrong' counters for a word,
    then save back to JSON.
    """
    data = request.json
    word = data.get('word')
    is_correct = data.get('isCorrect')

    words = load_words()

    for w in words:
        if w['word'] == word:
            # Fallback to 0, just in case
            w['correct'] = w.get('correct', 0)
            w['wrong'] = w.get('wrong', 0)

            if is_correct:
                w['correct'] += 1
            else:
                w['wrong'] += 1
            break

    save_words(words)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
