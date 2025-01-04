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
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const skillTree = new SkillTree(skillConfig);
  // Mount the skill tree to the container and template
  skillTree.mount('.skills-container', '#skill-template');
  skillTree.render();
});
