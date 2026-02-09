const BLACKJACK = 21; 
const NUM_DECKS = 8; 
const suits = ["Hearts", "Diamonds", "Spades", "Clubs"]; 
const ranks = 
[
    { rank: "A", value: 11},
    { rank: "2", value: 2},
    { rank: "3", value: 3},
    { rank: "4", value: 4},
    { rank: "5", value: 5},
    { rank: "6", value: 6},
    { rank: "7", value: 7},
    { rank: "8", value: 8},
    { rank: "9", value: 9},
    { rank: "10", value: 10},
    { rank: "J", value: 10},
    { rank: "Q", value: 10},
    { rank: "K", value: 10}
]; 
const { animate } = anime; 

let deck = []; 
let playerHand = []
let dealerHand = []; 
let playerScore = 0; 
let dealerScore = 0; 
let playerName = ""; 

let gamePhase = "initial"; 

// Functions

function createShoe()
{
    let newDeck = []; 
    
    for (let i = 0; i < NUM_DECKS; i++) 
    {
        for (const suit of suits)
        {
            for (const rankObj of ranks)
            { 
                newDeck.push({
                    rank: rankObj.rank, 
                    suit: suit, 
                    value: rankObj.value
                }); 
            }
        }
    }
        // Same method that Mason mentioned earlier to shuffle the cards. Mic isn't working. Yep. 
    for (let i = newDeck.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    return newDeck; 
}

function recalculatePoints(hand)
{
    let score = 0; 
    let aceCount = 0; 

    for (const card of hand)
    {
        score += card.value; 
        if (card.rank === "A")
        {
            aceCount++; 
        }
    }

    while (score > BLACKJACK && aceCount > 0)
    {
        score -= 10; 
        aceCount--; 
    }

    return score; 
}

function dealCard(targetHand)
{
    if (deck.length > 0)
        {
            const card = deck.pop();
            targetHand.push(card);
            return card; 
        } 
    return null; 
}

function dealCardWithDelay(hand, numCards, delay)
{
    let count = 0; 

    function dealNext()
    {
        if (count < numCards)
        {
            dealCard(hand); 
            updateUI(); 

            count++; 
            setTimeout(dealNext, delay); 
        
        }
    }

    dealNext(); 
}

function startRound()
{
    if (deck.length < 138)
    {
        deck = createShoe(); 
    }

    playerHand = []; 
    dealerHand = []; 
    playerScore = 0; 
    dealerScore = 0; 

    gamePhase = "playerTurn"; 

    dealCardWithDelay(playerHand, 2, 500); 
    setTimeout(() => dealCardWithDelay(dealerHand, 2, 500), 1000); 

    setTimeout(() => {
        updateUI();  

        switch (true)
        {
            case (playerScore === BLACKJACK && dealerScore === BLACKJACK):
                showMessage(`Both ${playerName} and Dealer have BLACKJACK! Push!`);
                gamePhase = "payout"; 
                updateUI(); 
                determineWinner();
                break; 
            
            case (playerScore === BLACKJACK && dealerScore != BLACKJACK):
                showMessage(`BLACKJACK! ${playerName} wins with BLACKJACK ${BLACKJACK}! Payout is 3:2`); 
                gamePhase = "payout"; 
                updateUI(); 
                determineWinner(); 
                break; 
            
            case (dealerScore === BLACKJACK && playerScore != BLACKJACK):
                showMessage(`Dealer has Blackjack! ${playerName} looses!`); 
                gamePhase = "payout"; 
                updateUI(); 
                determineWinner(); 
                break; 

            default:
                showMessage("Hit or Stand?");  
                break; 
        }

        updateUI(); 
        if (gamePhase === "payout")
        {
            determineWinner(); 
        }
    }, 2500)
}

function playerHit()
{
    if (gamePhase !== "playerTurn")
    {
        return; 
    }
    
    dealCard(playerHand); 
    playerScore = recalculatePoints(playerHand);

    switch (true)
    {
        case (playerScore > BLACKJACK):
            showMessage(`BUST! Dealer Wins!`); 
            gamePhase = "payout"; 
            determineWinner(); 
            break; 
        
        case (playerScore === BLACKJACK):
            gamePhase = "dealerTurn"; 
            setTimeout(dealerPlay, 1200); 
            break; 
        
        default:
            showMessage(`${playerName}'s score is ${playerScore}. Hit or stand?`); 
    }

    updateUI(); 
}

function playerStand()
{
    gamePhase = "dealerTurn"; 
    updateUI(); 

    setTimeout(dealerPlay, 1000); 
}

function dealerPlay()
{
    dealerScore = recalculatePoints(dealerHand); 

    switch (true)
    {
        case (dealerScore < 17 && gamePhase === "dealerTurn"):
            dealCard(dealerHand); 
            updateUI();
            setTimeout(dealerPlay, 1000); 
            break; 
        
        default: 
            determineWinner(); 
    }
}

function determineWinner()
{
    switch (true)
    {
        case (playerScore > BLACKJACK):
            showMessage(`${playerName} busts with ${playerScore}. Dealer wins!`);
            break; 
        case (dealerScore > BLACKJACK):
            showMessage(`Dealer busts with ${dealerScore}. ${playerName} wins!`);
            break; 
        case (playerScore === BLACKJACK && dealerScore != BLACKJACK):
            showMessage(`${playerName} wins with ${BLACKJACK}!`);
            break; 
        case (dealerScore === BLACKJACK && playerScore != BLACKJACK):
            showMessage(`Dealer wins with ${BLACKJACK}`); 
            break; 
        default: 
            switch (true)
            {
                case (playerScore > dealerScore):
                    showMessage(`${playerName} wins with ${playerScore}.`);
                    break; 
            
                case (playerScore < dealerScore):
                    showMessage(`Dealer wins with ${dealerScore}`); 
                    break; 
            
                default: 
                    showMessage(`It's a push! Both have ${playerScore}.`); 
                    break; 
            }
            break;
    }

    gamePhase = "payout"; 
    updateUI(); 
}

function renderCards()
{
    const playerCardsContainer = document.getElementById("player-cards"); 
    const dealerCardsContainer = document.getElementById("dealer-cards"); 

    playerCardsContainer.innerHTML = ""; 
    dealerCardsContainer.innerHTML = ""; 

    for (const card of playerHand)
    {
        const img = document.createElement("img"); 
        const filename = `${card.rank}${card.suit[0]}.png`; 
        
        img.src = `card_images/PNG/${filename}`;
        img.className = "card"; 
        img.classList.add("card"); 
        playerCardsContainer.appendChild(img); 
    }

    for (let i = 0; i < dealerHand.length; i++)
    {
        const card = dealerHand[i]; 
        const img = document.createElement("img"); 
        img.className = "card"; 

        if (gamePhase === "playerTurn" && i === 1)
        {
            img.src = "card_images/PNG/gray_back.png"; 
        }

        else
        {
            const filename = `${card.rank}${card.suit[0]}.png`; 
            img.src = `card_images/PNG/${filename}`;
        }

        img.classList.add("card"); 
        dealerCardsContainer.appendChild(img); 
    }
}

function showMessage(message)
{
    const MESSAGE_DISPLAY = document.getElementById("message"); 
    MESSAGE_DISPLAY.textContent = message;
}

function updateUI()
{
    playerScore = recalculatePoints(playerHand); 
    dealerScore = recalculatePoints(dealerHand); 

    renderCards(); 

    const PLAYER_SCORE_DISPLAY = document.getElementById("player-score"); 
    const DEALER_SCORE_DISPLAY = document.getElementById("dealer-score"); 

    PLAYER_SCORE_DISPLAY.textContent = `Player Score: ${playerScore}`; 

    if (gamePhase === "playerTurn")
    {
        DEALER_SCORE_DISPLAY.textContent = "Dealer Score: ?";
    }

    else 
    {
        DEALER_SCORE_DISPLAY.textContent = `Dealer Score: ${dealerScore}`; 
    }

    const HIT_BUTTON = document.getElementById("hitBtn"); 
    const STAND_BUTTON = document.getElementById("standBtn"); 
    const NEW_ROUND_BUTTON = document.getElementById("newRoundBtn"); 

    switch (gamePhase)
    {
        case "initial":
            HIT_BUTTON.disabled = true; 
            STAND_BUTTON.disabled = true; 
            NEW_ROUND_BUTTON.disabled = false; 
            break; 
        
        case "playerTurn":
            HIT_BUTTON.disabled = false; 
            STAND_BUTTON.disabled = false; 
            NEW_ROUND_BUTTON.disabled = true; 
            break;

        case "dealerTurn":
            HIT_BUTTON.disabled = true; 
            STAND_BUTTON.disabled = true; 
            NEW_ROUND_BUTTON.disabled = false;
            break; 

        case "payout":
            HIT_BUTTON.disabled = true; 
            STAND_BUTTON.disabled = true; 
            NEW_ROUND_BUTTON.disabled = false;
            break; 
    }
}

function newRound()
{
    showMessage("");

    if (gamePhase === "payout" || gamePhase === "initial")
    {
        startRound(); 
    }
}

function beginGame()
{
    playerName = document.getElementById("firstNameInput").value.trim(); 
    const dealerNameInput = document.getElementById("dealerNameInput").value.trim(); 

    if (playerName === "" || dealerNameInput === "")
    {
        alert("Please enter a name for both you and your dealer before starting"); 
        return; 
    } 

    document.getElementById("dealerName").textContent = dealerNameInput; 
    document.getElementById("firstName").textContent = playerName;

    document.getElementById("intro-section").style.display = "none"; 
    document.getElementById("game-section").style.display = "block"; 

    startRound(); 
}

function clearInput()
{
    let playerInputName = document.getElementById("firstNameInput"); 
    let dealerNameInput = document.getElementById("dealerNameInput"); 

    playerInputName.value = ""; 
    dealerNameInput.value = ""; 
}

function openHelp()
{
    window.open("help.html", "_blank", "resizeable=yes,top=100,left=100,width=400px,height=500px")
}

function setupOnLoad()
{
    clearInput(); 
}

function hitButtonOnClick()
{
    const DECK = document.getElementById("game-deck"); 

    DECK.classList.add("deck-draw-animation"); 

    setTimeout(() => {
        DECK.classList.remove("deck-draw-animation");
    }, 300); 
}

window.onload = setupOnLoad();