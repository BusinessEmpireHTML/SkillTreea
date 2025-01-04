// Core SkillTree class
export class SkillTree {
    constructor(config) {
        this.config = config;
        this.skills = new Map();
        this.state = {
            isOpen: true,
            avatarName: 'Your Name',
            portrait: Math.ceil(Math.random() * (config.numPortraits || 1)),
            level: 1
        };

        this.container = null;
        this.template = null;
    }

    mount(containerSelector, templateSelector) {
        this.container = document.querySelector(containerSelector);
        this.template = document.querySelector(templateSelector);
        
        if (!this.container || !this.template) {
            throw new Error('Container or template not found');
        }

        this.init();        
    }

    init() {
        this.initializeSkills();
        this.bindEvents();
        this.render();
    }

    render() {
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

    initializeSkills() {
        // Create skill instances
        this.config.skills.forEach(skillData => {
            const skill = new Skill(skillData);
            this.skills.set(skill.id, skill);
        });

        // Wire up dependencies
        this.config.skills.forEach(skillData => {
            if (skillData.dependsOn) {
                const dependent = this.skills.get(skillData.id);
                skillData.dependsOn.forEach(depId => {
                    const dependency = this.skills.get(depId);
                    dependent.addDependency(dependency);
                });
            }
        });
    }

    createSkillElement(skill) {
        const clone = this.template.content.cloneNode(true);
        const skillElement = clone.querySelector('.skill');
        
        skillElement.dataset.skillId = skill.id;
        
        if (skill.icon) {
            skillElement.querySelector('.icon').style.backgroundImage = `url(${skill.icon})`;
        }

        const tooltip = skillElement.querySelector('.skill-tooltip');
        tooltip.querySelector('.skill-name').textContent = skill.title;
        tooltip.querySelector('.skill-description').textContent = skill.description;
        
        return skillElement;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => this.handleSkillClick(e));
    }

    handleSkillClick(e) {
        const skillEl = e.target.closest('.skill');
        if (!skillEl) return;

        // Handle mobile tooltip
        if (window.matchMedia('(hover: none)').matches) {
            this.container.querySelectorAll('.skill.active').forEach(el => {
                if (el !== skillEl) el.classList.remove('active');
            });
            skillEl.classList.toggle('active');
        }
    }

    updateDependencyLines() {
        // Remove existing lines
        this.container.querySelectorAll('.skill-dependency').forEach(el => el.remove());

        this.skills.forEach(skill => {
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
        
        // Calculate line position and length
        const length = Math.abs(toRect.top - fromRect.top);
        const width = Math.abs(toRect.left - fromRect.left);
        
        // Position line at the bottom center of the parent skill
        const x1 = fromRect.left + (fromRect.width / 2) - containerRect.left;
        const y1 = fromRect.top + fromRect.height - containerRect.top;
        
        // Calculate angle for diagonal lines
        const angle = Math.atan2(width, length);
        const finalLength = Math.hypot(width, length);

        Object.assign(line.style, {
            height: `${finalLength}px`,
            transform: `translate(${x1}px, ${y1}px) rotate(${angle}rad)`,
            transformOrigin: 'top',
        });

        this.container.appendChild(line);
    }

    groupSkillsByTree() {
        const trees = new Map();
        const rootSkills = new Set();

        // Find root skills (those with no dependencies)
        this.skills.forEach(skill => {
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

    setState(state) {
        if (state.skills) {
            state.skills.forEach(skillState => {
                const skill = this.skills.get(skillState.id);
                if (skill) {
                    skill.points = skillState.points;
                }
            });
        }

        this.state.portrait ||= state.portrait;
        this.state.avatarName ||= state.avatarName;
    }

    // State management
    getState() {
        return {
            skills: Array.from(this.skills.values()).map(skill => ({
                id: skill.id,
                points: skill.points
            })),
            portrait: this.state.portrait,
            avatarName: this.state.avatarName
        };
    }

    // Helper methods for state management
    toggleOpen() {
        this.state.isOpen = !this.state.isOpen;
    }
}

// Skill class
class Skill {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.maxPoints = data.maxPoints || 1;
        this.points = 0;
        this.dependencies = new Set();
        this.dependents = new Set();
        this.stats = data.stats || [];
        this.talents = data.talents || [];
        this.rankDescriptions = data.rankDescriptions || [];
        this.icon = data.icon;
    }

    // Add this method
    addDependency(skill) {
        if (skill && skill instanceof Skill) {
            this.dependencies.add(skill);
            skill.dependents.add(this);
        }
    }

    canAddPoint() {
        return this.dependenciesFulfilled() && this.points < this.maxPoints;
    }

    canRemovePoint() {
        return this.points > 0 && 
               (!this.hasUsedDependents() || this.points > 1);
    }

    addPoint() {
        if (this.canAddPoint()) {
            this.points++;
            return true;
        }
        return false;
    }

    removePoint() {
        if (this.canRemovePoint()) {
            this.points--;
            return true;
        }
        return false;
    }

    dependenciesFulfilled() {
        return Array.from(this.dependencies)
            .every(dep => dep.points > 0);
    }

    hasUsedDependents() {
        return Array.from(this.dependents)
            .some(dep => dep.points > 0);
    }

    // Helper methods for UI
    hasPoints() {
        return this.points > 0;
    }

    hasMaxPoints() {
        return this.points >= this.maxPoints;
    }

    hasDependencies() {
        return this.dependencies.size > 0;
    }

    getCurrentRankDescription() {
        return this.rankDescriptions[this.points - 1] || '';
    }

    getNextRankDescription() {
        return this.rankDescriptions[this.points] || '';
    }
}