# Tippspiel

a [Sails](http://sailsjs.org) application implementing a betting game for the German Bundesliga.
Data for each season is retrieved from [OpenligaDB](http://www.openligadb.de).

Currently, still work in Progress

## How to use
To start betting, a user needs to create an account. The account consists of a username, which needs to be unique, and a password. **Careful!** Currently, there is no option to reset a password so make sure to remember it.

To add a season for the Bundesliga, you need to add information in order to be able to retrieve information from the OpenligDB:

   * **leagueSeason**: The season you are betting in
   * **leageShortcut**: A unique shortcut which identifies the Bundesliga
   
For more information on the necessary data, please refer to [OpenligaDB](http://www.openligadb.de). In any case, the season creation page offers placeholders to get a notion of the required parameters. For example, to bet in 2017/2018 the following information is necessary:

   * **seasonName**: 2017/2018
   * **leagueSeason**: 2017
   * **leagueShortcut**: bl1

### Betting rules
A bet for a match has to be placed before the match started (although the program offers the possibility to enter a bet afterwards, which if helpful if at the time of betting the site could not be contacted). The bet is compared to the actual result of the match. There are four categories of bet results which give different points for a bet:

* **Correct result**: The exact number of goals scored by the home and the guest team

* **Difference**: The correct difference of scored goals was bet but not the exact number. E.g. the bet was 1:0 and the actual result 2:1. This category applies only if the bet was in favor of the winning team. So a bet of 0:1 would have resulted in 0 points.

* **Tendency**: The bet was in favor of the winning team but none of the first two categories apply.

* **Wrong bet**: The bet was on one team but the team lost or the result was draw. Likewise a bet on a draw results in 0 points if one team won.

A bet on a draw is automatically in the category of *Difference* if the bet was not the exact result. The following table displays the points resulting from each category.

|**Category**|**Points**|
|--------|-----:|
|Correct |     5|
|Difference|   3|
|Tendency|     1|
|Wrong   |     0|

**Good luck and have fun playing!**
