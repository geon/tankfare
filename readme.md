The Idea
--------

* A multiplayer, quasi-realtime game about tank warfare on a 3D hexagonal grid.
* Built on webGL and websocket.
* Each unit occupies one grid cell. Decoration like houses can use multiple cells.
* Most guns need direct line of fire to hit. Some can lob a shot in a high arc.
* Every unit moves and aims in steps. 6/12 directions? Depending on unit?
* All timing is done in relatively large steps (.5 seconds), so that the clients all run in lock-step with the server.
* Moving, aiming etc triggers a timer of (say) .5 seconds, so you are limited in how fast you can move. Depends on the unit. Shooting is timed too, but slower. 
* Units can auto-fire if an enemy is in the target area. It is a game about strategy, not twitch aiming.
* The player can set targets for the position and the aim of units to move longer distances.


* Battlefields should be perhaps 30x30 cells large, with lots of obstacles.