// ============================================================================
// W2Wizard, Amsterdam 2025, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

const C_MAX_SEQUENCE = 6;
const C_MIN_SEQUENCE = 3;
/** Show a new sequence every N seconds */
const PREVIEW_INTERVAL = 5000;
/** How long to show the sequence for */
const MAX_AD_DURATION = 30000;
/** How long to highlight a card */
const HIGHLIGHT_DURATION = 500;
/** How long to wait between highlighting cards in a sequence */
const SEQUENCE_DELAY = 800;

enum GameState {
  IDLE,
  PREVIEW,
  PLAYING,
  WON,
  FAILED,
}

// ============================================================================

class MemoryGame {
  private state: GameState = GameState.IDLE;
  private userSequence: number[] = [];
  private desiredSequence: number[] = [];
  private previewIntervalID: number | null = null;
  private previewTimeout: number | null = null;
  private readonly CARDS: NodeListOf<HTMLButtonElement>;
  private readonly playButton: HTMLButtonElement;
  private readonly applyButton: HTMLButtonElement;
  private readonly speechBubble: HTMLDivElement;
  private readonly character: HTMLDivElement;

  constructor() {
    this.CARDS = document.querySelectorAll(".game-card");
    this.playButton = document.getElementById("play")! as HTMLButtonElement;
    this.applyButton = document.getElementById("apply")! as HTMLButtonElement;
    this.speechBubble = document.querySelector(
      ".character-speech"
    )! as HTMLDivElement;
    this.character = document.getElementById(
      "animated-character"
    )! as HTMLDivElement;

    // Setup event listeners
    this.CARDS.forEach((card, i) => {
      card.addEventListener("click", () => this.handleCardClick(i));
    });

    this.playButton.addEventListener("click", () => this.startGame());
    this.applyButton.addEventListener("click", () => {
      window.open("https://codam.nl/apply", "_blank");
    });

    // Begin idle animation cycle
    // this.startIdleAnimation();

    setTimeout(() => {
      this.stopIdleAnimation();
      this.disableAllAnimations();
    }, MAX_AD_DURATION);
  }

  /** Starts the idle animation, showing random sequences periodically */
  private startIdleAnimation(): void {
    // Generate and show a sequence immediately
    this.generateSequence();
    this.previewSequence();

    // Then set up interval to show sequences periodically
    this.previewIntervalID = window.setInterval(() => {
      this.generateSequence();
      this.previewSequence();
    }, PREVIEW_INTERVAL);
  }

  /** Stops the idle animation */
  private stopIdleAnimation(): void {
    if (this.previewIntervalID !== null) {
      clearInterval(this.previewIntervalID);
      this.previewIntervalID = null;
    }

    if (this.previewTimeout !== null) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }
  }

  /** Disables all animations in the game to comply with display requirements */
  private disableAllAnimations(): void {
    document.body.classList.add("disable-animations");
    this.character.style.animationPlayState = "paused";
    this.applyButton.style.animation = "none";

    // Disable card animations
    this.CARDS.forEach((card) => {
      card.style.transition = "none";
      card.style.animation = "none";
    });

    console.log("All animations disabled after 30 seconds as required.");
  }

  /** Generates a random sequence of card indexes */
  private generateSequence(): void {
    const length =
      Math.floor(Math.random() * (C_MAX_SEQUENCE - C_MIN_SEQUENCE + 1)) +
      C_MIN_SEQUENCE;
    this.desiredSequence = Array.from({ length }, () =>
      Math.floor(Math.random() * this.CARDS.length)
    );
  }

  /** Previews the current sequence by highlighting cards in order */
  private previewSequence(): void {
    this.resetCards();
    this.desiredSequence.forEach((cardIndex, i) => {
      this.previewTimeout = window.setTimeout(() => {
        this.highlightCard(cardIndex);
        setTimeout(() => this.unhighlightCard(cardIndex), HIGHLIGHT_DURATION);
      }, i * SEQUENCE_DELAY);
    });
  }

  /** Highlights a card visually */
  private highlightCard(index: number): void {
    const card = this.CARDS[index]!;
    card.classList.add("game-button--apply");
  }

  /** Removes highlight from a card */
  private unhighlightCard(index: number): void {
    const card = this.CARDS[index]!;
    card.classList.remove("game-button--apply", "highlight");
  }

  /** Resets all cards to their default state */
  private resetCards(): void {
    this.CARDS.forEach((card) => {
      card.classList.remove(
        "highlight",
        "error",
        "win",
        "game-button--error",
        "game-button--winner",
        "game-button--apply"
      );

      card.style.animation = "";
      card.style.transition = "";
      card.style.transform = "";

      card.querySelector(".card-back")?.classList.remove("highlight");
    });
  }

  /** Starts a new game */
  private startGame(): void {
    this.stopIdleAnimation();
    this.state = GameState.PREVIEW;
    this.userSequence = [];

    this.speechBubble.textContent = "Help me solve this puzzle to join codam!";

    this.resetCards();
    this.playButton.disabled = true;
    this.playButton.classList.remove("game-button--error");
    this.playButton.textContent = "Play";

    this.generateSequence();
    this.previewSequence();
    const previewDuration =
      this.desiredSequence.length * SEQUENCE_DELAY + HIGHLIGHT_DURATION;
    setTimeout(() => (this.state = GameState.PLAYING), previewDuration);
  }

  /** Handles a card click during gameplay */
  private handleCardClick(index: number): void {
    if (this.state !== GameState.PLAYING) return;

    this.highlightCard(index);
    setTimeout(() => this.unhighlightCard(index), HIGHLIGHT_DURATION);

    this.userSequence.push(index);
    const currentIndex = this.userSequence.length - 1;

    if (index !== this.desiredSequence[currentIndex]) {
      this.handleFailure();
      return;
    }

    if (this.userSequence.length === this.desiredSequence.length) {
      this.handleSuccess();
    }
  }

  /** Handles game failure */
  private handleFailure(): void {
    this.state = GameState.FAILED;

    this.CARDS.forEach((card) => card.classList.add("error"));
    this.speechBubble.textContent = "No worries! Try again!";
    this.playButton.disabled = false;
    this.playButton.style.display = "block";
    this.playButton.textContent = "Again";
    this.playButton.classList.add("game-button--error");
  }

  /** Handles game success */
  private handleSuccess(): void {
    this.state = GameState.WON;

    this.speechBubble.textContent = "Great job! Click Apply to join Codam!";
    this.playButton.style.display = "none";
    this.applyButton.style.display = "block";
    this.CARDS.forEach((card) => card.classList.add("win"));
  }
}

// ============================================================================

window.addEventListener("DOMContentLoaded", () => new MemoryGame());
