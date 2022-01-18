# hello wordl
It's [Wordle](https://www.powerlanguage.co.uk/wordle/) but you can play forever!

Play it [here](https://foldr.moe/hello-wordl/).

## Introduction
Wordle is a word game similar to the TV show [Lingo](https://en.wikipedia.org/wiki/Lingo_(British_game_show)).

You get 6 tries to guess a 5-letter target word. After each guess, the letters light up in various colors as clues. Green means a letter is correct in this spot; yellow means a letter is _elsewhere_ in the target word; gray means a letter is not in the target word at all.

Click _About_ inside the game to learn by example.

## History
In 2021, Josh "powerlanguage" Wardle created _Wordle_, a version of the Lingo word game that you can play once a day. The target word is the same for everyone each day, and you can share results to Twitter and compare with your friends. This made Wordle [go absolutely viral](https://www.nytimes.com/2022/01/03/technology/wordle-word-game-creator.html) around January 2022.

I liked this game a lot, but wanted to play more than once a day, so I created my own version of it, where the words are random but you can play as much as like. I called it _hello wordl_, which is a sort of [bad programming joke](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program).

## But playing once a day is the point!
Don't get me wrong: I, too, think this is the most brilliant aspect of Wordle, and I don't aim to dethrone or improve on the "real" game.

## Where are the words coming from?
To generate target words, I have been manually curating the top 25,000 or so entries of [Peter Norvig's English word frequency list](http://norvig.com/mayzner.html) to get rid of obscure words, inappropriate language, and British spellings (sorry). If you get dealt a strange target word, please open an issue on this here GitHub repository.

To check guesses, I use some variation of the _Official Tournament and Club Word List_ used in North American Scrabble tournaments. (I'm not a native English speaker, but my English tends mostly American.)
