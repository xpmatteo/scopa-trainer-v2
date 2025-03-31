
Initial prompt, on claude.ai 3.7:

>    A browser-based implementation of the Scopa card game (two-player variant) that allows a human player to play against an AI opponent.
  
Refinement prompt on claude.ai 3.7: 

>    After the game is over, print an analysis of the game, rating the player moves from "perfect" 
>    to "abysmal" according to the best strategy

After a little experimentation, we got progress with this prompt with claude.ai 3.7 (thinking):

> You are an expert developer, with great experience in AI programming for games.  
> Please review this game. It's supposed to help the player become a better Scopa player. 
> The after-the-game review should be revamped:     I would like a move-by-move replay of the game, with
> 
> * a note for every play by the player mentioning if it was a good, bad or mediocre, and why
> * what was the best move in that moment, and why.  Compare the move that the player did with the move that the AI would have done.
> 
> The after-the-game report should be provided as a static report
> Please update the provided program.  Produce an artifact that I can download and run straight away.

The artifact was imported in a fresh project and then I installed Cline

- Initialize memory bank. $0.58
- Tried prematurely to generate tests, then reverted. $1.08
- Refactored to MVC and update memory bank $2.47
- Find all legal moves $4.12
  - and remove logic duplication
(learned to ask OpenRouter to sort by cheapest provider!!!)
- Separate AI to a separate module, with proper separation of visibility $1.28
- Use Jasmine for testing $0.34
- Score breakdown during play: $3,25

