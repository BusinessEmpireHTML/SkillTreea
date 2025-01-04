import { SkillTree } from '../skilltree.js';
import { skillConfig } from './config.js';

class SkillTreeUI {
    constructor(config) {
        this.skillTree = new SkillTree(config);
        this.container = document.querySelector('.skills-container');
        this.template = document.querySelector('#skill-template');
        
        this.init();
    }

    init() {
        this.renderSkills();
        this.setupCharacterPanel();
        this.bindEvents();
    }

    renderSkills() {
        this.container.innerHTML = '';

        // Group skills by their tree/category
        const skillTrees = this.groupSkillsByTree();

        // Create columns for each tree
        skillTrees.forEach(treeSkills => {
            const column = document.createElement('div');
            column.className = 'skill-tree-column';
            
            treeSkills.forEach(skill => {
                const element = this.createSkillElement(skill);
                column.appendChild(element);
            });
            
            this.container.appendChild(column);
        });
        
        this.updateDependencyLines();
    }

    groupSkillsByTree() {
        // Group skills by their root dependencies
        const trees = new Map();
        const rootSkills = new Set();

        // Find root skills (those with no dependencies)
        this.skillTree.skills.forEach(skill => {
            if (skill.dependencies.size === 0) {
                rootSkills.add(skill);
            }
        });

        // Create trees starting from each root skill
        rootSkills.forEach(rootSkill => {
            const tree = [rootSkill];
            const addDependents = (skill) => {
                const dependents = Array.from(skill.dependents);
                tree.push(...dependents);
                dependents.forEach(addDependents);
            };
            addDependents(rootSkill);
            trees.set(rootSkill, tree);
        });

        return Array.from(trees.values());
    }

    createSkillElement(skill) {
        const clone = this.template.content.cloneNode(true);
        const skillElement = clone.querySelector('.skill');
        
        skillElement.dataset.skillId = skill.id;
        
        // Set skill icon
        if (skill.icon) {
            skillElement.querySelector('.icon').style.backgroundImage = `url(icons/${skill.icon})`;
        }

        // Fill in tooltip content
        const tooltip = skillElement.querySelector('.skill-tooltip');
        tooltip.querySelector('.skill-name').textContent = skill.title;
        tooltip.querySelector('.skill-description').textContent = skill.description;
        
        // Update points display
        this.updateSkillPoints(skillElement, skill);

        return skillElement;
    }

    updateSkillPoints(element, skill) {
        const pointsDisplay = element.querySelector('.skill-points');
        pointsDisplay.querySelector('.points').textContent = skill.points;
        pointsDisplay.querySelector('.max-points').textContent = skill.maxPoints;

        // Update skill state classes
        element.classList.toggle('can-add-points', skill.canAddPoint());
        element.classList.toggle('has-points', skill.points > 0);
        element.classList.toggle('has-max-points', skill.points === skill.maxPoints);
    }

    updateDependencyLines() {
        // Remove existing lines
        document.querySelectorAll('.skill-dependency').forEach(el => el.remove());

        this.skillTree.skills.forEach((skill, id) => {
            if (skill.dependencies.size > 0) {
                skill.dependencies.forEach(dep => {
                    this.drawDependencyLine(dep.id, skill.id);
                });
            }
        });
    }

    drawDependencyLine(fromId, toId) {
        const fromEl = this.container.querySelector(`[data-skill-id="${fromId}"]`);
        const toEl = this.container.querySelector(`[data-skill-id="${toId}"]`);
        
        if (!fromEl || !toEl) return;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        const line = document.createElement('div');
        line.className = 'skill-dependency';
        
        // Calculate line position and length for vertical layout
        const length = Math.abs(toRect.top - fromRect.top);
        const width = Math.abs(toRect.left - fromRect.left);
        
        // Position line at the bottom center of the parent skill
        const x1 = fromRect.left + (fromRect.width / 2) - containerRect.left;
        const y1 = fromRect.top + fromRect.height - containerRect.top;
        
        // Calculate angle for diagonal lines if skills are not directly above/below
        const angle = Math.atan2(width, length);
        const finalLength = Math.hypot(width, length);

        Object.assign(line.style, {
            height: `${finalLength}px`,
            transform: `translate(${x1}px, ${y1}px) rotate(${angle}rad)`,
            transformOrigin: 'top',
        });

        this.container.appendChild(line);
    }

    setupCharacterPanel() {
        const panel = document.querySelector('.character-panel');
        
        // Update character name
        const nameInput = panel.querySelector('.character-name');
        nameInput.value = this.skillTree.state.avatarName;
        
        // Update portrait
        this.updatePortrait();
        
        // Update stats
        this.updateStats();
    }

    updatePortrait() {
        const img = document.querySelector('.portrait img');
        img.src = `portraits/portrait-${this.skillTree.state.portrait}.jpg`;
    }

    updateStats() {
        const statsList = document.querySelector('.character-stats');
        const stats = this.skillTree.calculateStats();
        
        statsList.innerHTML = '';
        Object.entries(stats).forEach(([stat, value]) => {
            const li = document.createElement('li');
            li.textContent = `${stat}: ${value}`;
            statsList.appendChild(li);
        });
    }

    bindEvents() {
        // Skill clicking
        this.container.addEventListener('click', (e) => {
            const skillEl = e.target.closest('.skill');
            if (!skillEl) return;

            const skill = this.skillTree.skills.get(Number(skillEl.dataset.skillId));
            if (skill.addPoint()) {
                this.updateSkillPoints(skillEl, skill);
                this.updateStats();
                this.updateHash();
            }

            // Remove active class from all other skills
            this.container.querySelectorAll('.skill.active').forEach(el => {
                if (el !== skillEl) el.classList.remove('active');
            });

            // Toggle active class on clicked skill
            skillEl.classList.toggle('active');
        });

        // Right click to remove points
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const skillEl = e.target.closest('.skill');
            if (!skillEl) return;

            const skill = this.skillTree.skills.get(Number(skillEl.dataset.skillId));
            if (skill.removePoint()) {
                this.updateSkillPoints(skillEl, skill);
                this.updateStats();
                this.updateHash();
            }
        });

        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.skill')) {
                this.container.querySelectorAll('.skill.active').forEach(el => {
                    el.classList.remove('active');
                });
            }
        });

        // Portrait controls
        document.querySelector('.prev-portrait').addEventListener('click', () => {
            this.skillTree.previousPortrait();
            this.updatePortrait();
            this.updateHash();
        });

        document.querySelector('.next-portrait').addEventListener('click', () => {
            this.skillTree.nextPortrait();
            this.updatePortrait();
            this.updateHash();
        });

        // Character name
        document.querySelector('.character-name').addEventListener('input', (e) => {
            this.skillTree.state.avatarName = e.target.value;
            this.updateHash();
        });

        // Toggle tree
        document.querySelector('.toggle-btn').addEventListener('click', () => {
            document.querySelector('.page').classList.toggle('closed');
        });
    }

    updateHash() {
        window.location.hash = this.skillTree.generateHash();
    }
}

let ui;
// Initialize the skill tree when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  ui = new SkillTreeUI(skillConfig);
});

document.addEventListener('skilltree:update', (e) => {
    const { skills, state } = e.detail;
    if (!ui) { return; }
    ui.updateStats();
    // updateStateUI(state);
});