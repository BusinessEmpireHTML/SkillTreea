// Core SkillTree class
export class SkillTree {
  constructor(config) {
    this.config = config;
    this.skills = new Map();
    this.state = {};

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
    this.bindEvents();
    this.bindResizeObserver();

    this.initializeSkills();
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const skillLevels = this.groupSkillsByTree();

    // Create a column for each level
    skillLevels.forEach((levelSkills, level) => {
      const column = document.createElement('div');
      column.className = 'skill-tree-column';

      levelSkills.forEach(skill => {
        const element = this.createSkillElement(skill);
        column.appendChild(element);
      });

      this.container.appendChild(column);
    });

    this.updateDependencyLines();
  }

  initializeSkills() {
    // First create all skill instances
    this.config.skills.forEach(data => {
      this.skills.set(data.id, new Skill(data));
    });

    // Then wire up dependencies
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

    return skill.fillElement(skillElement);
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => this.handleSkillClick(e));
  }

  bindResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.updateDependencyLines();
    });
    resizeObserver.observe(this.container);
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

    // Create a container for dependency lines
    let linesContainer = document.querySelector('.skill-dependency-container');
    if (!linesContainer) {
      linesContainer = document.createElement('div');
      linesContainer.className = 'skill-dependency-container';
    }

    this.container.appendChild(linesContainer);

    // Draw dependencies for each skill
    this.skills.forEach(skill => {
        if (skill.dependencies.size > 0) {
            this.drawMultipleDependencyLines(skill, Array.from(skill.dependencies), linesContainer);
        }
    });
}

drawMultipleDependencyLines(toSkill, fromSkills, container) {
    const toEl = this.container.querySelector(`[data-skill-id="${toSkill.id}"]`);
    if (!toEl) return;

    const toRect = toEl.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    // Get all dependency elements and their positions
    const deps = fromSkills.map(skill => {
        const el = this.container.querySelector(`[data-skill-id="${skill.id}"]`);
        return {
            el,
            rect: el.getBoundingClientRect()
        };
    }).filter(dep => dep.el);

    if (deps.length === 0) return;

    // Calculate the horizontal line position
    const minX = Math.min(...deps.map(d => d.rect.left + d.rect.width / 2));
    const maxX = Math.max(...deps.map(d => d.rect.left + d.rect.width / 2));
    const midY = Math.max(...deps.map(d => d.rect.bottom)) + 
                (toRect.top - Math.max(...deps.map(d => d.rect.bottom))) / 2;

    // Draw horizontal connecting line
    if (deps.length > 1) {
        const horizontalLine = document.createElement('div');
        horizontalLine.className = 'skill-dependency horizontal';
        Object.assign(horizontalLine.style, {
            position: 'absolute',
            left: `${minX - containerRect.left}px`,
            top: `${midY - containerRect.top}px`,
            width: `${maxX - minX}px`,
            height: '2px'
        });
        container.appendChild(horizontalLine);
    }

    // Draw vertical lines from dependencies to horizontal line
    deps.forEach(dep => {
        const verticalTop = document.createElement('div');
        verticalTop.className = 'skill-dependency vertical';
        Object.assign(verticalTop.style, {
            position: 'absolute',
            left: `${dep.rect.left + dep.rect.width / 2 - containerRect.left}px`,
            top: `${dep.rect.bottom - containerRect.top}px`,
            height: `${midY - dep.rect.bottom}px`,
            width: '2px'
        });
        container.appendChild(verticalTop);
    });

    // Draw vertical line from horizontal line to target skill
    const verticalBottom = document.createElement('div');
    verticalBottom.className = 'skill-dependency vertical';
    Object.assign(verticalBottom.style, {
        position: 'absolute',
        left: `${toRect.left + toRect.width / 2 - containerRect.left}px`,
        top: `${midY - containerRect.top}px`,
        height: `${toRect.top - midY}px`,
        width: '2px'
    });
    container.appendChild(verticalBottom);
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
}

// Skill class
class Skill {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.iconPath = data.iconPath;
    this.points = data.points;

    this.dependencies = new Set();
    this.dependents = new Set();
  }

  fillElement(skillElement) {
    skillElement.dataset.skillId = this.id;

    if (this.iconPath) {
      const iconElement = skillElement.querySelector('.icon');
      iconElement.src = this.iconPath;
      iconElement.alt = this.title;
    }

    const progressBar = skillElement.querySelector('.points');
    progressBar.value = this.points;

    const tooltip = skillElement.querySelector('.skill-tooltip');
    tooltip.querySelector('.skill-name').textContent = this.title;
    tooltip.querySelector('.skill-description').textContent = this.description;

    return skillElement;
  }

  addDependency(skill) {
    if (!skill || !(skill instanceof Skill)) { return; }

    this.dependencies.add(skill);
    skill.dependents.add(this);
  }
}