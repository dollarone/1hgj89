var PlatfomerGame = PlatformerGame || {};

//title screen
PlatformerGame.Game = function(){};

PlatformerGame.Game.prototype = {
    create: function() {

        //  A simple background for our game
        this.game.add.sprite(0, 0, 'sky');

        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('tiles', 'tiles');

        //this.blockedLayer = this.map.createLayer('objectLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');
        //this.foregroundLayer = this.map.createLayer('foregroundLayer');

        this.map.setCollisionBetween(1, 10000, true, 'blockedLayer');

        // make the world boundaries fit the ones in the tiled map
        this.blockedLayer.resizeWorld();


        var result = this.findObjectsByType('exit', this.map, 'objectLayer');
        this.exit = this.game.add.sprite(result[0].x, result[0].y, 'tiles');
        this.exit.frame = 8;
        this.game.physics.arcade.enable(this.exit);
        this.exit.body.setSize(1, 1, 3, 5);
        this.winnar = false;

        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.playerStartX =  result[0].x;
        this.playerStartY =  result[0].y;
        this.player = this.game.add.sprite(result[0].x, result[0].y, 'bitslap-tiles');
        this.player.frame = 1; 

        var result = this.findObjectsByType('greenTunnel', this.map, 'objectLayer');
        this.greenTunnel1 = this.game.add.sprite(result[0].x, result[0].y, 'tiles');
        this.greenTunnel1.frame = 5;
        this.game.physics.arcade.enable(this.greenTunnel1);
        this.greenTunnel1.body.setSize(1, 1, 3, 5);
        
        
        this.greenTunnel2 = this.game.add.sprite(result[1].x, result[1].y, 'tiles');
        this.greenTunnel2.frame = 5;
        this.game.physics.arcade.enable(this.greenTunnel2);
        this.greenTunnel2.body.setSize(1, 1, 3, 5);


        //  We need to enable physics on the player
        this.game.physics.arcade.enable(this.player);
        //this.game.camera.setSize(this.game.world.width, this.game.world.height);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0;
        this.player.body.gravity.y = 700;
        this.player.anchor.setTo(0.5);
        this.player.body.collideWorldBounds = false;

        this.game.camera.follow(this.player);

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [4, 5], 10, true);
        this.player.animations.add('right', [4, 5], 10, true);

        //  Finally some stars to collect
        this.stars = this.game.add.group();




        //  We will enable physics for any star that is created in this group
        this.stars.enableBody = true;

        //  Here we'll create 12 of them evenly spaced apart
        for (var i = 0; i < 8; i++)
        {
            //  Create a star inside of the 'stars' group
            var star = this.stars.create(i * 40, 80, 'tiles');

            //  Let gravity do its thing
            star.body.gravity.y = 400;
            star.frame = 9;
            star.body.bounce.y = 1;
            star.dangerous = true;
            star.anchor.setTo(0);
            star.body.setSize(9, 9, 3, 5);
        }
 
        this.music = this.game.add.audio('music');
        this.music.loop = true;
 //       this.music.play();

        //  The score
        this.winText = this.game.add.text(177, 180, 'You win!', { fontSize: '32px', fill: '#000' });
        this.winText.visible = false;

        //  Our controls.
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.timer = 0;

        this.showDebug = false; 
    },

    update: function() {
        this.timer++;
        //  Collide the player and the stars with the platforms
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.stars, this.blockedLayer);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.game.physics.arcade.overlap(this.player, this.stars, this.death, null, this);
        this.game.physics.arcade.overlap(this.player, this.greenTunnel1, this.tunnel, null, this);        
        this.game.physics.arcade.overlap(this.player, this.greenTunnel2, this.tunnel, null, this);        
        this.game.physics.arcade.overlap(this.player, this.exit, this.win, null, this);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;
        if (this.winnar) {
            this.player.frame = 1;
            return;
        }

        if (this.cursors.left.isDown)
        {
            //  Move to the left
            this.player.scale.setTo(-1, 1);
            this.player.body.velocity.x = -150;

            this.player.animations.play('left');
        }
        else if (this.cursors.right.isDown)
        {
            //  Move to the right
            this.player.scale.setTo(1, 1);
            this.player.body.velocity.x = 150;

            this.player.animations.play('right');
        }
        else
        {
            //  Stand still
            this.player.animations.stop();

            this.player.frame = 3;
        }
        
        //  Allow the player to jump if they are touching the ground.
        if (this.cursors.up.isDown && this.player.body.blocked.down)
        {
            this.player.body.velocity.y = -200;
        }

        if (this.player.y > this.game.world.height) {
            this.death();
        }

    },

    tunnel: function(player, tunnel) {
        if (tunnel === this.greenTunnel1) {
            this.player.x = this.greenTunnel2.x + 10;
            this.player.y = this.greenTunnel2.y;
        }
        else if (tunnel === this.greenTunnel2) {
            this.player.x = this.greenTunnel1.x - 10;
            this.player.y = this.greenTunnel1.y;
        }

    },

    death: function() {
        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player.x = this.playerStartX;
        this.player.y = this.playerStartY;
        this.player.frame = 1; 

    },

    win: function() {
        if (!this.winnar) {
            this.winnar = true;
            this.winText.visible = true;
            this.player.frame = 0;
        }

    },

    collectStar : function(player, star) {
        
        // Removes the star from the screen
        star.kill();
        if (star.dangerous) {
            player.kill();
        }

        //  Add and update the score
        this.score += 10;
        this.scoreText.text = 'Score: ' + this.score;

    },


    // find objects in a tiled layer that contains a property called "type" equal to a value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                // phaser uses top left - tiled bottom left so need to adjust:
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },

    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, 'objects');
        sprite.frame = parseInt(element.properties.frame);

        // copy all of the sprite's properties
        Object.keys(element.properties).forEach(function(key) {
            sprite[key] = element.properties[key];
        });
    },


    render: function() {

        if (this.showDebug) {
            
            this.game.debug.body(this.player);
        }
    },

};