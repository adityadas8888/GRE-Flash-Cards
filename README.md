# GRE Flashcards

A local, interactive GRE flashcard web application powered by Python and Flask, featuring:
- A 3D-flip animation on click
- Swipe interactions for marking words **correct** or **wrong**
- Weighted distribution of words, so those missed more often appear more frequently
- Local persistence of your progress in a JSON file

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Key Files](#key-files)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

---

## Features

1. **3D Flip**  
   - Click a flashcard to flip it vertically and reveal the definition, synonyms, antonyms, etc.

2. **Swipe to Mark Correct/Wrong**  
   - **Swipe left** (or press **Left Arrow**) to mark a card **wrong**  
   - **Swipe right** (or press **Right Arrow**) to mark a card **correct**

3. **Enter Key for Flip**  
   - Press **Enter** to flip the top flashcard.

4. **Weighted Card Order**  
   - Words with more "wrong" attempts appear more often. The app tracks each word's `correct` and `wrong` counters in the JSON file.

5. **Local Persistence**  
   - Data is stored in `gre_words.json`. When the app restarts, it remembers your progress.

---

## Installation

1. **Clone** or **download** this repository:

   ```bash
   git clone https://github.com/yourusername/gre-flashcards.git
   cd gre-flashcards
   ```

2. **Create a virtual environment (Optional but recommended)**

   ```bash
   python -m venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install Dependencies**

   ```bash
   pip install flask
   ```

## Usage

Start the Flask app:

```bash
python app.py
```

Open your browser and navigate to http://127.0.0.1:5000.

Interact with the flashcards:

- Click on a card to flip it and see details.
- Swipe (drag) left or press Left Arrow to mark wrong.
- Swipe (drag) right or press Right Arrow to mark correct.
- Press Enter to flip the top card.
- Observe the "Right/Wrong" banner at the bottom when you mark a word. Cards with more wrong attempts appear more frequently next time you load the deck.

## Project Structure

```
gre-flashcards/
├── app.py             # Flask backend
├── gre_words.json     # Main word list & counters ("correct", "wrong")
├── static/
│   ├── style.css      # Custom CSS for styling & card flips
│   └── main.js        # Frontend logic for swiping, flipping, updating counters
└── templates/
    └── index.html     # Main HTML template
```

## Key Files

### app.py

- Loads gre_words.json, ensuring each word has correct and wrong keys.
- Serves /api/words with a weighted distribution (commonly missed words appear more).
- Handles /api/update to increment counters for correct/wrong.

### gre_words.json

- Contains your word data. Each entry has:
  - word, definition, synonyms, antonyms, type, example, pronunciation
  - correct and wrong counters (updated whenever you swipe a card).

### static/main.js

- Fetches words from /api/words, shows them as 3D-flip flashcards, and handles swipe/keyboard logic.

### static/style.css

- Styles the dark background, manages the messy stacked layout, 3D flip, and diagonal swipe-off animations.

### templates/index.html

- Minimal HTML referencing style.css and main.js.

## Customization

### Weighted Logic

In app.py, you'll find something like:

```python
times = max(1, w["wrong"] - w["correct"] + 1)
```

Increase or decrease (wrong - correct) impact if you want to alter how strongly missed words are emphasized.

### Styling

Modify static/style.css (card colors, flipping animations, or background). For instance, changing:

```css
transition: transform 1.2s ease;
```

can speed up or slow down the swipe.

### Click vs. Drag Threshold

In static/main.js, we use a ~10px threshold to decide if a small mouse movement is a click (flip) or a real drag (swipe). Tweak it for a different feel.

### Banner Placement

By default, the "Right/Wrong" banner is fixed at the bottom of the browser window with a semi-transparent background. You can change .result-banner in style.css to reposition or restyle it.

## Contributing

- Fork this repository and create a new branch for your feature or bug fix.
- Submit a pull request describing your changes.
- All constructive contributions—bug reports, PRs, suggestions—are welcome!

## License

This project is licensed under the MIT License. You are free to modify, share, and adapt it for your own use.
