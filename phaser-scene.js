(() => {
  const ACTION_GROUPS = {
    football: "kick",
    basketball: "dunk",
    volleyball: "dunk",
    badminton: "smash",
    tennis: "smash",
    pickleball: "smash",
    chess: "flick",
    jogging: "rush",
    cycling: "cycle",
    swimming: "water",
    fishing: "fish",
    yoga: "kick",
    karate: "kick",
    aerobics: "kick",
  };

  class BattleScene extends Phaser.Scene {
    constructor() {
      super("BattleScene");
      this.ready = false;
    }

    preload() {
      this.load.image("arena", "assets/battle-arena.png");
      this.load.image("heroes", "assets/phaser/heroes-idle.png");
      this.load.image("monster", "assets/phaser/monster-idle.png");
      this.load.image("football", "assets/handout-extract/page01_img03_X20.png");
      this.load.image("basketball", "assets/handout-extract/page01_img05_X24.png");
      this.load.image("volleyball", "assets/sports/volleyball.png");
      this.load.image("badminton", "assets/handout-extract/page01_img06_X26.png");
      this.load.image("tennis", "assets/handout-extract/page01_img07_X28.png");
      this.load.image("pickleball", "assets/sports/pickleball.png");
      this.load.image("chess", "assets/handout-extract/page01_img08_X30.png");
      this.load.image("cycling", "assets/handout-extract/page02_img07_X21.png");
      this.load.image("swimming", "assets/handout-extract/page02_img08_X23.png");
      this.load.image("fishing", "assets/handout-extract/page02_img09_X25.png");
      this.load.image("yoga", "assets/handout-extract/page02_img04_X15.png");
      this.load.image("karate", "assets/handout-extract/page02_img10_X27.png");
      this.load.image("aerobics", "assets/handout-extract/page02_img11_X29.png");
    }

    create() {
      this.arena = this.add.image(0, 0, "arena").setOrigin(0.5);
      this.heroes = this.add.image(0, 0, "heroes").setOrigin(0.5);
      this.monster = this.add.image(0, 0, "monster").setOrigin(0.5);
      this.heroAura = this.add.circle(0, 0, 54, 0x39d2ff, 0.35);
      this.monsterAura = this.add.circle(0, 0, 70, 0xb25aff, 0.35);
      this.prop = this.add.image(0, 0, "football").setOrigin(0.5).setVisible(false);
      this.fxText = this.add.text(0, 0, "", {
        fontFamily: "Arial",
        fontSize: "44px",
        fontStyle: "900",
        color: "#ffffff",
        stroke: "#14213d",
        strokeThickness: 8,
      }).setOrigin(0.5).setVisible(false);

      this.resize();
      this.scale.on("resize", () => this.resize());
      this.ready = true;
      this.idle();

      window.addEventListener("battle:effect", (event) => {
        if (!this.ready) return;
        const detail = event.detail || {};
        if (detail.correct) this.heroAttack(detail.sport);
        else this.monsterAttack();
      });

      window.addEventListener("battle:reset-scene", () => this.idle());
    }

    resize() {
      const { width, height } = this.scale;
      const arenaScale = Math.max(width / this.textures.get("arena").getSourceImage().width, height / this.textures.get("arena").getSourceImage().height);
      this.arena.setPosition(width / 2, height / 2).setScale(arenaScale);

      this.heroBase = { x: width * 0.19, y: height * 0.63 };
      this.monsterBase = { x: width * 0.74, y: height * 0.58 };
      this.propStart = { x: width * 0.29, y: height * 0.58 };
      this.propHit = { x: width * 0.73, y: height * 0.47 };

      this.heroes.setPosition(this.heroBase.x, this.heroBase.y).setScale(Math.min(width / 1540, height / 880));
      this.monster.setPosition(this.monsterBase.x, this.monsterBase.y).setScale(Math.min(width / 1320, height / 780));
      this.heroAura.setPosition(width * 0.22, height * 0.54);
      this.monsterAura.setPosition(width * 0.67, height * 0.46);
    }

    idle() {
      this.tweens.killTweensOf([this.heroes, this.monster, this.prop, this.fxText]);
      this.prop.setVisible(false);
      this.fxText.setVisible(false);
      this.heroes.clearTint().setAlpha(1).setPosition(this.heroBase.x, this.heroBase.y).setRotation(0);
      this.monster.clearTint().setAlpha(1).setPosition(this.monsterBase.x, this.monsterBase.y).setRotation(0);
      this.tweens.add({ targets: this.heroes, y: this.heroBase.y - 8, yoyo: true, repeat: -1, duration: 1200, ease: "Sine.inOut" });
      this.tweens.add({ targets: this.monster, y: this.monsterBase.y - 7, scaleX: this.monster.scaleX * 1.015, scaleY: this.monster.scaleY * 1.015, yoyo: true, repeat: -1, duration: 1500, ease: "Sine.inOut" });
      this.tweens.add({ targets: this.heroAura, alpha: 0.85, scale: 1.25, yoyo: true, repeat: -1, duration: 900 });
      this.tweens.add({ targets: this.monsterAura, alpha: 0.85, scale: 1.2, yoyo: true, repeat: -1, duration: 1000 });
    }

    heroAttack(sport) {
      this.tweens.killTweensOf([this.heroes, this.monster, this.prop, this.fxText]);
      const group = ACTION_GROUPS[sport] || "strike";
      const usesCharacterOnly = group === "rush";
      this.fxText.setText("OUCH!").setPosition(this.monsterBase.x, this.monsterBase.y - 180).setVisible(false);

      this.tweens.add({
        targets: this.heroes,
        x: this.monsterBase.x - 230,
        y: this.monsterBase.y + (group === "dunk" ? -90 : group === "smash" ? -55 : group === "flick" ? -20 : 10),
        rotation: group === "smash" ? -0.04 : group === "kick" ? 0.05 : 0,
        duration: 1550,
        ease: "Cubic.easeOut",
        yoyo: true,
        hold: 520,
        onComplete: () => this.idle(),
      });

      if (!usesCharacterOnly) {
        this.prop.setTexture(sport).setVisible(true).setAlpha(1).setPosition(this.propStart.x, this.propStart.y).setScale(group === "flick" ? 0.18 : 0.28);
        const arcY = group === "dunk" ? this.propHit.y - 180 : group === "flick" ? this.propHit.y - 110 : this.propHit.y;
        this.tweens.add({
          targets: this.prop,
          x: this.propHit.x,
          y: arcY,
          angle: group === "flick" ? 420 : 260,
          duration: 1300,
          ease: "Cubic.easeOut",
          onComplete: () => {
            this.tweens.add({ targets: this.prop, y: this.propHit.y, scale: this.prop.scale * 1.35, alpha: 0, duration: 420, ease: "Cubic.easeIn" });
            this.showHitText(this.monsterBase.x, this.monsterBase.y - 190, "OUCH!");
          },
        });
      } else {
        this.time.delayedCall(1100, () => this.showHitText(this.monsterBase.x, this.monsterBase.y - 190, "BOOM!"));
      }

      this.tweens.add({
        targets: this.monster,
        x: this.monsterBase.x + 38,
        y: this.monsterBase.y + 24,
        rotation: 0.04,
        alpha: 0.78,
        tint: 0x9ca3af,
        delay: 1350,
        duration: 260,
        yoyo: true,
        repeat: 3,
      });
    }

    monsterAttack() {
      this.tweens.killTweensOf([this.heroes, this.monster, this.prop, this.fxText]);
      this.tweens.add({
        targets: this.monster,
        x: this.monsterBase.x - 170,
        y: this.monsterBase.y - 20,
        scaleX: this.monster.scaleX * 1.04,
        scaleY: this.monster.scaleY * 1.04,
        duration: 950,
        ease: "Cubic.easeOut",
        yoyo: true,
        hold: 450,
        onComplete: () => this.idle(),
      });
      this.tweens.add({
        targets: this.heroes,
        x: this.heroBase.x - 55,
        y: this.heroBase.y + 26,
        rotation: -0.04,
        alpha: 0.72,
        tint: 0x9ca3af,
        delay: 900,
        duration: 260,
        yoyo: true,
        repeat: 4,
      });
      this.time.delayedCall(980, () => this.showHitText(this.heroBase.x + 120, this.heroBase.y - 190, "HUHU"));
    }

    showHitText(x, y, text) {
      this.fxText.setText(text).setPosition(x, y).setAlpha(0).setScale(0.7).setVisible(true);
      this.tweens.add({ targets: this.fxText, alpha: 1, scale: 1.15, y: y - 24, duration: 260, yoyo: true, hold: 1100, onComplete: () => this.fxText.setVisible(false) });
    }
  }

  window.createBattlePhaser = function createBattlePhaser() {
    if (!window.Phaser || window.battlePhaserGame) return;
    window.battlePhaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "phaserStage",
      transparent: true,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent: "phaserStage",
        width: "100%",
        height: "100%",
      },
      render: { antialias: true, pixelArt: false },
      scene: BattleScene,
    });
  };
})();
