/*
  SKILL TREE CONFIG (data only, no logic)

  key      unique id, also what goes into state.skills
  name     title shown in the UI
  desc     tooltip text
  img      icon (put it through assetUrl() in JS)
  parent   key of the skill that must be bought first, null for the root
  pos      grid position for drawing: col (can be .5), row (1 = top)
  cost     same shape as rewards: key = field in state, value = price
  effects  list of { type, value }, one node can have several
  wip      true while the mechanic is not implemented yet

  Effect types (each one is implemented in exactly one place):
    clickBonus        + fraction to click power        (0.1  = +10%)
    cpsBonus          + fraction to total CPS          (0.1  = +10%)
    ballCpsBonus      + fraction to ball generators    (5    = +500%)
    bowlCpsBonus      + fraction to bowl generators    (1    = +100%)
    bedCpsBonus       + fraction to bed generators     (0.3  = +30%)
    critChance        + crit chance                    (0.2  = +20%)
    critDamage        + crit damage                    (0.5  = +50%)
    rageCooldown      + change of rage cooldown        (-0.5 = -50%)
    rageEffect        multiplier of rage effect        (2    = doubled)
    bubbleEffect      multiplier of bubble effects     (2    = doubled)
    skinEffect        multiplier of cat skin bonuses   (2    = doubled)
    goldenCatSpeed    + fraction to golden cat spawn rate
    maxEnergy         + flat max energy                (5    = 10 -> 15)
    chestEnergyCost   + flat change of chest price     (-1)
    unlock            flag: "generator", "secretEvent", "exponentialClick"
*/
//+
export const SKILL_TREE = {
  // ---------- tier 1 ----------
  happyCat: {
    name: "Happy Cat",
    desc: "Click bonus +10%",
    img: "/skillTree/catSkill1_1.png",
    parent: null,
    pos: { col: 2.5, row: 1 },
    cost: { dust: 10 },
    effects: [{ type: "clickBonus", value: 0.1 }],
  },
  //+
  // ---------- tier 2 ----------
  fish: {
    name: "Fish",
    desc: "CPS +10%",
    img: "/skillTree/catSkill2_1.png",
    parent: "happyCat",
    pos: { col: 1.5, row: 2 },
    cost: { dust: 25 },
    effects: [{ type: "cpsBonus", value: 0.1 }],
  },
  //+
  claw: {
    name: "Sharp Claws",
    desc: "Click crit chance +20%",
    img: "/skillTree/catSkill2_2.png",
    parent: "happyCat",
    pos: { col: 3.5, row: 2 },
    cost: { dust: 25 },
    effects: [{ type: "critChance", value: 0.2 }],
  },
  //+
  // ---------- tier 3 ----------
  ball: {
    name: "Blue Ball",
    desc: "Ball CPS +500%",
    img: "/skillTree/catSkill3_1.png",
    parent: "fish",
    pos: { col: 1, row: 3 },
    cost: { dust: 50 },
    effects: [{ type: "ballCpsBonus", value: 5 }],
  },
  //+
  bowl: {
    name: "Breakfast",
    desc: "Bowl CPS +100%",
    img: "/skillTree/catSkill3_2.png",
    parent: "fish",
    pos: { col: 2, row: 3 },
    cost: { dust: 50 },
    effects: [{ type: "bowlCpsBonus", value: 2 }],
  },
  //+
  criticalDamage: {
    name: "Critical Paw",
    desc: "Critical damage +50%",
    img: "/skillTree/catSkill3_3.png",
    parent: "claw",
    pos: { col: 3, row: 3 },
    cost: { dust: 50 },
    effects: [{ type: "critDamage", value: 0.5 }],
  },
  //+
  clickPlus: {
    name: "Strong Paw",
    desc: "Click +50%",
    img: "/skillTree/catSkill3_4.png",
    parent: "claw",
    pos: { col: 4, row: 3 },
    cost: { dust: 50 },
    effects: [{ type: "clickBonus", value: 0.5 }],
  },
  //+
  // ---------- tier 4 ----------
  goldenCatSpeed: {
    name: "Golden Lure",
    desc: "Golden cat appears faster",
    img: "/skillTree/catSkill4_1.png",
    parent: "ball",
    pos: { col: 1, row: 4 },
    cost: { dust: 100 },
    effects: [{ type: "goldenCatSpeed", value: 0.5 }],
  },
  //+
  bed: {
    name: "Cozy Bed",
    desc: "Bed CPS +30%",
    img: "/skillTree/catSkill4_2.png",
    parent: "bowl",
    pos: { col: 2, row: 4 },
    cost: { dust: 100 },
    effects: [{ type: "bedCpsBonus", value: 0.3 }],
  },
  //+
  criticalStrike: {
    name: "Deadly Stars",
    desc: "Crit chance +30%, crit damage +50%",
    img: "/skillTree/catSkill4_3.png",
    parent: "criticalDamage",
    pos: { col: 3, row: 4 },
    cost: { dust: 100 },
    effects: [
      { type: "critChance", value: 0.3 },
      { type: "critDamage", value: 0.5 },
    ],
  },
  //+
  rageCooldown: {
    name: "Calm Fire",
    desc: "Rage cooldown -50%",
    img: "/skillTree/catSkill4_4.png",
    parent: "clickPlus",
    pos: { col: 4, row: 4 },
    cost: { dust: 100 },
    effects: [{ type: "rageCooldown", value: 0.5 }],
  },
  //+
  // ---------- tier 5 ----------
  bubbleEffect: {
    name: "Bubble Potion",
    desc: "Doubles bubble effects",
    img: "/skillTree/catSkill5_1.png",
    parent: "goldenCatSpeed",
    pos: { col: 1, row: 5 },
    cost: { dust: 200 },
    effects: [{ type: "bubbleEffect", value: 2 }],
  },
  newGenerator: {
    name: "Cardboard Box",
    desc: "Adds a new generator WIP",
    img: "/skillTree/catSkill5_2.png",
    parent: "bed",
    pos: { col: 2, row: 5 },
    cost: { dust: 200 },
    effects: [{ type: "unlock", value: "generator" }],
    wip: true,
  },
  //+
  skinEffect: {
    name: "Royal Crown",
    desc: "Doubles cat skin effect",
    img: "/skillTree/catSkill5_3.png",
    parent: "criticalStrike",
    pos: { col: 3, row: 5 },
    cost: { dust: 200 },
    effects: [{ type: "skinEffect", value: 2 }],
  },
  //+
  rageEffect: {
    name: "Double Rage",
    desc: "Doubles rage effect",
    img: "/skillTree/catSkill5_4.png",
    parent: "rageCooldown",
    pos: { col: 4, row: 5 },
    cost: { dust: 200 },
    effects: [{ type: "rageEffect", value: 2 }],
  },

  // ---------- tier 6 ----------
  secretEvent: {
    name: "Shadow Cat",
    desc: "Unlocks a secret event WIP",
    img: "/skillTree/catSkill6_1.png",
    parent: "bubbleEffect",
    pos: { col: 0, row: 6 },
    cost: { dust: 400 },
    effects: [{ type: "unlock", value: "secretEvent" }],
    wip: true,
  },
  //+
  maxEnergy: {
    name: "Lucky Collar",
    desc: "Max energy 15",
    img: "/skillTree/catSkill6_2.png",
    parent: "bubbleEffect",
    pos: { col: 1, row: 6 },
    cost: { dust: 400 },
    effects: [{ type: "maxEnergy", value: 5 }],
  },
  exponentialClick: {
    name: "Rage of the Cat",
    desc: "Exponential click upgrade",
    img: "/skillTree/catSkill6_3.png",
    parent: "skinEffect",
    pos: { col: 3, row: 6 },
    cost: { dust: 400 },
    effects: [{ type: "exponentialClick", value: 1 }],
  },
  //+
  // ---------- tier 7 ----------
  cheaperChest: {
    name: "Treasure Chest",
    desc: "Energy to open a chest -1",
    img: "/skillTree/catSkill7_1.png",
    parent: "maxEnergy",
    pos: { col: 1, row: 7 },
    cost: { dust: 800 },
    effects: [{ type: "chestEnergyCost", value: -1 }],
  },
};
