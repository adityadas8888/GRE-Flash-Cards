const cardContainer = document.getElementById('card-container');
const resultBanner = document.getElementById('result-banner');
let words = [];
let currentIndex = 0;

// Track references to the top card for arrow keys / enter key
let topCardElement = null;
let topCardInner = null;

/**
 * Fetch the word list and render the initial stack
 */
async function fetchWords() {
  try {
    const res = await fetch('/api/words');
    words = await res.json();
    renderCardsStack();
  } catch (err) {
    console.error('Error fetching words:', err);
  }
}

/**
 * Render up to 3 stacked cards from currentIndex onward
 */
function renderCardsStack() {
  cardContainer.innerHTML = '';

  if (currentIndex >= words.length) {
    // Out of words
    const noMore = document.createElement('div');
    noMore.style.color = '#fff';
    noMore.style.marginTop = '2rem';
    noMore.innerText = 'No more words!';
    cardContainer.appendChild(noMore);

    topCardElement = null;
    topCardInner = null;
    return;
  }

  const maxCards = Math.min(3, words.length - currentIndex);
  for (let i = 0; i < maxCards; i++) {
    const wordData = words[currentIndex + i];
    const card = createCard(wordData, i);
    cardContainer.appendChild(card);
  }
}

/**
 * Build a single flippable card:
 * - front side: the word
 * - back side: definition, synonyms, etc.
 * If indexOffset==0 => top card => swipe/click enabled
 */
function createCard(wordData, indexOffset) {
  const card = document.createElement('div');
  card.classList.add('card');

  const inner = document.createElement('div');
  inner.classList.add('inner');

  const front = document.createElement('div');
  front.classList.add('front');
  front.textContent = wordData.word;

  const back = document.createElement('div');
  back.classList.add('back');
  back.innerHTML = `
    <p><strong>Pronunciation:</strong> ${wordData.pronunciation}</p>
    <p><strong>Type:</strong> ${wordData.type}</p>
    <p><strong>Definition:</strong> ${wordData.definition}</p>
    <p><strong>Example:</strong> ${wordData.example}</p>
    <p><strong>Synonyms:</strong> ${wordData.synonyms.join(', ')}</p>
    <p><strong>Antonyms:</strong> ${wordData.antonyms.join(', ')}</p>
  `;

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  if (indexOffset === 0) {
    // This is the top card => store references, enable swiping
    topCardElement = card;
    topCardInner = inner;
    addSwipeHandlers(card, inner);
  } else {
    // Card behind => can't interact
    card.style.pointerEvents = 'none';
  }

  return card;
}

/**
 * Distinguish small “click” => flip from a bigger drag => swipe
 */
function addSwipeHandlers(card, inner) {
  let mouseDown = false;
  let startX, startY;
  let isDragging = false;

  card.addEventListener('mousedown', (e) => {
    mouseDown = true;
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  function onMouseMove(e) {
    if (!mouseDown) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // If the mouse moved more than 10px => start dragging
    if (distance > 10) {
      isDragging = true;
      const rotateAmt = 0.05 * deltaX;
      // Move the card
      card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotateAmt}deg)`;
    }
  }

  function onMouseUp(e) {
    if (!mouseDown) return;
    mouseDown = false;

    const deltaX = e.clientX - startX;
    const screenWidth = window.innerWidth;

    if (!isDragging) {
      // It's effectively a click => flip the card
      inner.classList.toggle('flip');
    } else {
      // We dragged => see if user swiped left or right
      if (deltaX < -screenWidth * 0.25) {
        card.classList.add('swipe-left');
        showResult('Wrong', 'red');
        updateWord(card, inner, false);
      } else if (deltaX > screenWidth * 0.25) {
        card.classList.add('swipe-right');
        showResult('Right', 'limegreen');
        updateWord(card, inner, true);
      } else {
        // Not enough => reset
        card.style.transform = '';
      }
    }
  }
}

/**
 * One global keydown handler for arrow keys + Enter
 */
document.addEventListener('keydown', (e) => {
  if (!topCardElement || !topCardInner) return;

  if (e.key === 'ArrowLeft') {
    topCardElement.classList.add('swipe-left');
    showResult('Wrong', 'red');
    updateWord(topCardElement, topCardInner, false);
  } else if (e.key === 'ArrowRight') {
    topCardElement.classList.add('swipe-right');
    showResult('Right', 'limegreen');
    updateWord(topCardElement, topCardInner, true);
  } else if (e.key === 'Enter') {
    topCardInner.classList.toggle('flip');
  }
});

/**
 * Show a “Right” or “Wrong” banner for the entire 1.2s swipe animation
 */
function showResult(message, color) {
  resultBanner.innerText = message;
  resultBanner.style.color = color;
  resultBanner.style.display = 'block';

  // Hide after the same 1.2s the swipe takes
  setTimeout(() => {
    resultBanner.style.display = 'none';
  }, 1200);
}

/**
 * After the 1.2s swipe animation, remove the card from the DOM and move on
 */
async function updateWord(card, inner, isCorrect) {
  const front = inner.querySelector('.front');
  const theWord = front ? front.textContent : '';

  try {
    await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: theWord, isCorrect })
    });
  } catch (err) {
    console.error('Error updating word:', err);
  }

  // Let the card animate off-screen for 1.2s
  setTimeout(() => {
    currentIndex++;
    renderCardsStack();
  }, 1200);
}

// Start
fetchWords();
