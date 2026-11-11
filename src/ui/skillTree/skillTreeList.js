import { assetUrl } from "../../config/paths.js";
import { SKILL_TREE } from "../../config/skilltree.js";
import { hasSkill, canBuySkill, buySkill } from "../../core/skillTree.js";

const CELL = 110;

export function initSkillTree(onChange) {
  const tree = document.getElementById("skillTree");
  if (!tree) {
    console.error("Skill tree element not found!");
    return;
  }

  tree.replaceChildren();

  const nodes = Object.values(SKILL_TREE);
  tree.style.width = `${(Math.max(...nodes.map((n) => n.pos.col)) + 1) * CELL}px`;
  tree.style.height = `${Math.max(...nodes.map((n) => n.pos.row)) * CELL}px`;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "skill-tree-lines");

  const half = 32;
  for (const node of nodes) {
    if (!node.parent) continue;
    const a = SKILL_TREE[node.parent].pos;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.col * CELL + half);
    line.setAttribute("y1", (a.row - 1) * CELL + half);
    line.setAttribute("x2", node.pos.col * CELL + half);
    line.setAttribute("y2", (node.pos.row - 1) * CELL + half);
    svg.appendChild(line);
  }

  tree.prepend(svg);

  for (const [id, node] of Object.entries(SKILL_TREE)) {
    const card = document.createElement("button");
    card.type = "button";
    card.dataset.id = id;
    card.classList.add("skill-tree-card");
    card.style.left = `${node.pos.col * CELL}px`;
    card.style.top = `${(node.pos.row - 1) * CELL}px`;
    card.title = `${node.name}: ${node.desc}`;
    card.setAttribute("aria-label", `${node.name}. ${node.desc}`);

    if (node.img) {
      const image = document.createElement("img");
      image.src = assetUrl(node.img);
      image.alt = "";
      image.classList.add("skill-tree-img");
      card.appendChild(image);
    }

    card.addEventListener("click", () => {
      if (buySkill(id)) {
        renderSkillTree();
        onChange();
      }
    });

    tree.appendChild(card);
  }

  renderSkillTree();
}

export function renderSkillTree() {
  for (const card of document.querySelectorAll(".skill-tree-card")) {
    const id = card.dataset.id;
    const owned = hasSkill(id);
    const available = canBuySkill(id);

    card.classList.toggle("owned", owned);
    card.classList.toggle("available", available);
    card.classList.toggle("locked", !owned && !available);
  }
}
