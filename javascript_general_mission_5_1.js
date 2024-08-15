const suits = ["spades", "clubs", "diamonds", "hearts"];  // トランプのスートを表す配列
const numbers = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "Q", "K", "A"]  // トランプの数字を表す配列
const numberRanks = { "2": 2,  // 各カードの数字に対するランク(強さ)を表す配列
                      "3": 3,
                      "4": 4,
                      "5": 5,
                      "6": 6,
                      "7": 7,
                      "8": 8,
                      "9": 9,
                      "10": 10,
                      "J": 11,
                      "Q": 12,
                      "K": 13,
                      "A": 14,
                      };

const startButton = document.getElementById('startButton');
startButton.addEventListener("click", startGame);  // startButton要素がクリックされた時にstartGame関数を呼び出す(イベントリスナーを設定)

function startGame() {
  let deck = createDeck();  // 「createDeck関数」でトランプのデッキを生成
  deck = shuffleDeck(deck);  // 「shuffleDeck関数」でトランプのデッキをシャッフル

  let koHand = deck.slice(0, 5);  // 子に5枚のカードを配布
  let oyaHand = deck.slice(5, 10);  // 親に5枚のカードを配布
  
  displayHandOfCards("koHandOfCards", koHand);  // 「displayHandOfcards()関数」で配布されたカードの画像をHTMLに表示
  displayHandOfCards("oyaHandOfCards", oyaHand);  // 「displayHandOfcards()関数」で配布されたカードの画像をHTMLに表示

  const koRank = determinationOfHand(koHand);  // 「determinationOfHand()関数」で子に配布されたカードの役を判定し、koRankに格納
  const oyaRank = determinationOfHand(oyaHand);  // 「determinationOfHand()関数」で親に配布されたカードの役を判定し、oyaRankに格納

  const koYaku = document.getElementById('koYaku');
  const oyaYaku = document.getElementById('oyaYaku');
  koYaku.innerText = koRank.name;  // 判定した役名を<span id="koYaku"></span>に表示
  oyaYaku.innerText = oyaRank.name;  // 判定した役名を<span id="oyaYaku"></span>に表示

  const result = determineWinner(koRank, oyaRank);  // 「determineWinner()関数」で親と子の役を比較し、勝敗結果をresultに格納
  const koResult = document.getElementById('koResult');
  const oyaResult = document.getElementById('oyaResult');
  koResult.innerText = result.koOutcome;  // 勝敗結果を<span id="koResult"></span>に表示
  oyaResult.innerText = result.oyaOutcome;  // 勝敗結果を<span id="oyaResult"></span>に表示
}

// トランプのデッキを生成する「createDeck関数」
function createDeck () {
  let deck = [];
  for (let i = 0; i < suits.length; ++i) {
    for (let j = 0; j < numbers.length; ++j) {
      deck.push({ suit: suits[i], number: numbers[j]});
    }
  }
  return deck;
}

// トランプのデッキをシャッフルする「shuffleDeck関数」
function shuffleDeck (deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[randomIndex];
    deck[randomIndex] = temp;
  }
  return deck;
}

// 配布されたカードの画像をHTMLに表示する「displayHandOfcards()関数」
function displayHandOfCards (elementId, hand) {
  const handOfCardsElement = document.getElementById(elementId);
  handOfCardsElement.innerHTML = '';
  for (let i = 0; i < hand.length; ++i) {
    const card = hand[i];
    const cardImage = getCardImage(card);
    const cardHTML = `<img src="${cardImage}" style="width:100px;">`;
    handOfCardsElement.innerHTML += cardHTML;
  }
}

function getCardImage (card) {
  const suit = card.suit;
  const number = card.number;
  return `images/${number}_of_${suit}.png`;
}

// 配布されたカードの役の判定を行う関数
function determinationOfHand (hand) {
  const counts = {};
  const suits = {};
  const values = [];

  for (let i = 0; i < hand.length; ++i) {
    const card = hand[i];
    const number = card.number;
    const suit = card.suit;

    counts[number] = (counts[number] || 0) + 1;  // 各数字の出現回数を記録
    suits[suit] = (suits[suit] || 0) + 1;  // 各スートの出現回数を記録
    values.push(number);
  }

  function compareValues(a, b) {
    return numberRanks[a] - numberRanks[b];
  }
  values.sort(compareValues);
  
  // フラッシュの判定
  let isFlush = false;
  const suitCounts = Object.values(suits);
  for (let i = 0; i < suitCounts.length; ++i){
    if (suitCounts === 5) {
      isFlush = true;
      break;
    }
  }
  // ストレートの判定
  let isStraight = true;
  for (let idx = 1; idx < values.length; idx++) {
    const val = values[idx];
    const previousVal = values[idx - 1];
    if (numberRanks[val] !== numberRanks[previousVal] + 1) {
      isStraight = false;
      break;
    }
  }
  //　ロイヤルフラッシュの判定
  const isRoyal = values.join('') === '10JQKA';

  const countsValues = Object.values(counts).sort(function(a,b){
    return b - a;
  });

  const first = countsValues[0];  // 最も多く出現した数字の出現回数
  const second = countsValues[1];  // 2番目に多く出現した数字の出現回数

  if (isFlush && isRoyal) {
    return {name: "ロイヤルフラッシュ", rank: 9};
  } else if (isFlush && isStraight) {
    return {name: "ストレートフラッシュ", rank: 8};
  } else if (first === 4) {
    return {name: "フォーカード", rank: 7};
  } else if (first === 3 && second === 2) {
    return {name: "フルハウス", rank: 6};
  } else if (isFlush) {
    return {name: "フラッシュ", rank: 5};
  } else if (isStraight) {
    return {name: "ストレート", rank: 4};
  } else if (first === 3) {
    return {name: "スリーオブカインド", rank: 3};
  } else if (first === 2 && second === 2) {
    return {name: "ツーペア", rank: 2};
  } else if (first === 2) {
    return {name: "ワンペア", rank: 1};
  } else {
    return {name: "ハイカード", rank: 0, highCard: values[values.length - 1]};
  }
}

function determineWinner (koRank, oyaRank) {
  if (koRank.rank > oyaRank.rank) {
    return { koOutcome: "勝ち", oyaOutcome: "負け"};
  } else if (koRank.rank < oyaRank.rank) {
    return { koOutcome: "負け", oyaOutcome: "勝ち"};
  } else {
    if (koRank.rank === 0) {
      if (numberRanks[koRank.highCard] > numberRanks[oyaRank.highCard]){
        return { koOutcome: "勝ち", oyaOutcome: "負け"};
      } else if (numberRanks[koRank.highCard] < numberRanks[oyaRank.highCard]){
        return { koOutcome: "負け", oyaOutcome: "勝ち"};
      } else {
        return { koOutcome: "引分", oyaOutcome: "引分"};
      }
    } else {
      return { koOutcome: "引分", oyaOutcome: "引分"};
    }
  }
}